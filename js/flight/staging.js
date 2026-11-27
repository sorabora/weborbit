function stackHalf(entries) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let wet = 0;
  const cap = {};
  for (const e of entries) {
    const bb = partBBox(e.part);
    minX = Math.min(minX, e.ox - bb.w / 2);
    maxX = Math.max(maxX, e.ox + bb.w / 2);
    minY = Math.min(minY, e.oy - bb.h / 2);
    maxY = Math.max(maxY, e.oy + bb.h / 2);
    wet += (e.part.mass || 0) * c.kgPerTon;
    const tank = (e.part.modules || {})["Resource Module"];
    if (tank) {
      for (const p of tankResources(tank)) {
        cap[p.resource] = (cap[p.resource] || 0) + p.amount * c.kgPerTon;
      }
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    cx,
    cy,
    wet,
    cap,
    stack: {
      w: maxX - minX,
      h: maxY - minY,
      parts: entries.map((e) => ({ ...e, ox: e.ox - cx, oy: e.oy - cy })),
    },
  };
}

function partsTouch(a, b) {
  const A = partBBox(a.part);
  const B = partBBox(b.part);
  const gap = 1;
  return (
    Math.abs(a.ox - b.ox) <= (A.w + B.w) / 2 + gap &&
    Math.abs(a.oy - b.oy) <= (A.h + B.h) / 2 + gap
  );
}

function connectedGroups(entries, cut) {
  const seen = new Set();
  const groups = [];
  for (const start of entries) {
    if (seen.has(start)) {
      continue;
    }
    seen.add(start);
    const group = [start];
    for (let i = 0; i < group.length; i++) {
      for (const other of entries) {
        if (
          seen.has(other) ||
          cut(group[i], other) ||
          !partsTouch(group[i], other)
        ) {
          continue;
        }
        seen.add(other);
        group.push(other);
      }
    }
    groups.push(group);
  }
  return groups;
}

function splitRocket(rocket, cut, impulse, force) {
  const groups = connectedGroups(rocket.stack.parts, cut);
  if (groups.length < 2 && !force) {
    return;
  }
  const sin = Math.sin(rocket.angle);
  const cos = Math.cos(rocket.angle);
  const halves = groups.map(stackHalf);
  const main = halves.reduce((a, b) => (b.cy < a.cy ? b : a));
  const ground = halves.reduce((a, b) => (b.cy > a.cy ? b : a));

  const build = (side) => {
    const tanks = stackTanks(side.stack);
    const tanksMax = stackTanks(side.stack, "tanksMax");
    const fuel = totalFuel(tanks);
    const dryMass = Math.max(side.wet - totalFuel(tanksMax), 1);
    const mass = dryMass + fuel;
    const dv = (impulse / mass) * (side === main ? 1 : -1);
    return {
      pos: {
        x: rocket.pos.x + (side.cx * cos - side.cy * sin) / c.partUnits,
        y: rocket.pos.y + (side.cx * sin + side.cy * cos) / c.partUnits,
      },
      vel: { x: rocket.vel.x + sin * dv, y: rocket.vel.y - cos * dv },
      landed: side === ground ? rocket.landed : null,
      mass,
      dryMass,
      fuel,
      fuelMax: totalFuel(tanksMax),
      tanks,
      tanksMax,
      stack: side.stack,
    };
  };

  for (const side of halves) {
    if (side === main) {
      continue;
    }
    rockets.push({
      angle: rocket.angle,
      dragArea: rocket.dragArea,
      dragCoeff: rocket.dragCoeff,
      id: `debris-${Math.random().toString(36).slice(2, 8)}`, // random, so ids stay unique across removals and loads
      parentBody: rocket.parentBody,
      ...build(side),
    });
  }
  Object.assign(rocket, build(main));
}

function decouple(rocket, entry) {
  const impulse = runFilter(
    "rocket:separationImpulse",
    ((entry.part.modules["Decoupler Module"] || {})["Separation Force"] || 0) *
      c.newtonsPerThrust,
    { rocket, entry },
  );
  runHook("rocket:decouple", { rocket, entry });
  const cut = (a, b) =>
    (a === entry && b.oy < entry.oy) || (b === entry && a.oy < entry.oy);
  splitRocket(rocket, cut, impulse);
}

function dockingParts(rocket) {
  if (!rocket.stack) {
    return [];
  }
  return rocket.stack.parts.filter(
    (entry) => (entry.part.modules || {})["Docking Module"],
  );
}

function undock(rocket) {
  const other = rockets.find((r) => r.id === rocket.dockedWith);
  if (!other) {
    return;
  }
  const force = Math.max(
    ...dockingParts(rocket).map(
      (e) => e.part.modules["Docking Module"]["Disconnect Force"] || 0,
    ),
    ...dockingParts(other).map(
      (e) => e.part.modules["Docking Module"]["Disconnect Force"] || 0,
    ),
  );
  const dx = other.pos.x - rocket.pos.x;
  const dy = other.pos.y - rocket.pos.y;
  const dist = Math.hypot(dx, dy) || 1;
  const impulse = force * c.newtonsPerThrust;
  rocket.vel.x -= (dx / dist) * (impulse / rocket.mass);
  rocket.vel.y -= (dy / dist) * (impulse / rocket.mass);
  other.vel.x += (dx / dist) * (impulse / other.mass);
  other.vel.y += (dy / dist) * (impulse / other.mass);
  rocket.dockedWith = null;
  other.dockedWith = null;
}

function updateDocking(dt) {
  for (const rocket of rockets) {
    if (rocket.dockedWith && !rockets.some((r) => r.id === rocket.dockedWith)) {
      rocket.dockedWith = null;
    }
  }
  for (let i = 0; i < rockets.length; i++) {
    const a = rockets[i];
    if (a.destroyed || !dockingParts(a).length) {
      continue;
    }
    for (let j = i + 1; j < rockets.length; j++) {
      const b = rockets[j];
      if (b.destroyed || !dockingParts(b).length) {
        continue;
      }
      if (a.dockedWith === b.id || b.dockedWith === a.id) {
        continue;
      }
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0 || dist > c.dockRange) {
        continue;
      }
      if (dist < c.dockConnect) {
        a.dockedWith = b.id;
        b.dockedWith = a.id;
        const vx = (a.vel.x * a.mass + b.vel.x * b.mass) / (a.mass + b.mass);
        const vy = (a.vel.y * a.mass + b.vel.y * b.mass) / (a.mass + b.mass);
        a.vel.x = b.vel.x = vx;
        a.vel.y = b.vel.y = vy;
        continue;
      }
      const forceA = Math.max(
        ...dockingParts(a).map(
          (e) => e.part.modules["Docking Module"]["Attractive Force"] || 0,
        ),
      );
      const forceB = Math.max(
        ...dockingParts(b).map(
          (e) => e.part.modules["Docking Module"]["Attractive Force"] || 0,
        ),
      );
      const pull = Math.min(forceA, forceB) * c.newtonsPerThrust;
      if (pull <= 0) {
        continue;
      }
      const ux = dx / dist;
      const uy = dy / dist;
      a.vel.x += ((ux * pull) / a.mass) * dt;
      a.vel.y += ((uy * pull) / a.mass) * dt;
      b.vel.x -= ((ux * pull) / b.mass) * dt;
      b.vel.y -= ((uy * pull) / b.mass) * dt;
    }
  }
}
