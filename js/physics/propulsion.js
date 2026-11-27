const G0 = 9.80665;

function fillTanks(stack, trim) {
  for (const entry of stack.parts) {
    const tank = (entry.part.modules || {})["Resource Module"];
    if (!tank) {
      continue;
    }
    entry.tanks = {};
    entry.tanksMax = {};
    for (const p of tankResources(tank)) {
      const held = p.amount * c.kgPerTon * trim;
      entry.tanks[p.resource] =
        (entry.tanks[p.resource] || 0) + held * p.startFraction;
      entry.tanksMax[p.resource] = (entry.tanksMax[p.resource] || 0) + held;
    }
  }
}

function stackTanks(stack, key) {
  const total = {};
  for (const entry of stack.parts) {
    const held = entry[key || "tanks"];
    for (const name in held || {}) {
      total[name] = (total[name] || 0) + held[name];
    }
  }
  return total;
}

function partsTouch(a, b) {
  const ba = partBBox(a.part);
  const bbx = partBBox(b.part);
  const slack = 2;
  return (
    Math.abs(a.ox - b.ox) <= (ba.w + bbx.w) / 2 + slack &&
    Math.abs(a.oy - b.oy) <= (ba.h + bbx.h) / 2 + slack
  );
}

function stackNeighbours(stack) {
  if (stack.neighbours) {
    return stack.neighbours;
  }
  const near = stack.parts.map(() => []);
  for (let i = 0; i < stack.parts.length; i++) {
    for (let j = i + 1; j < stack.parts.length; j++) {
      if (partsTouch(stack.parts[i], stack.parts[j])) {
        near[i].push(j);
        near[j].push(i);
      }
    }
  }
  stack.neighbours = near;
  return near;
}

function feedTanks(stack, index, resource) {
  const near = stackNeighbours(stack);
  const seen = new Set([index]);
  const queue = near[index].slice();
  const feed = [];
  const self = stack.parts[index];
  if ((self.tanks || {})[resource] !== undefined) {
    feed.push(self);
  }
  while (queue.length) {
    const i = queue.shift();
    if (seen.has(i)) {
      continue;
    }
    seen.add(i);
    const entry = stack.parts[i];
    if (!(entry.part.modules || {})["Resource Module"]) {
      continue;
    }
    if ((entry.tanks || {})[resource] !== undefined) {
      feed.push(entry);
    }
    for (const n of near[i]) {
      if (!seen.has(n)) {
        queue.push(n);
      }
    }
  }
  return feed;
}

function feedHeld(feed, resource) {
  let held = 0;
  for (const entry of feed) {
    held += (entry.tanks || {})[resource] || 0;
  }
  return held;
}

function engineOutput(rocket) {
  return runFilter("physics:engineOutput", engineOutputBase(rocket), {
    rocket,
  });
}

function ambientFactor(rocket, entry) {
  const part = entry.part;
  if (!part.stats && !hasNozzle(part)) {
    return 1;
  }
  const stats = (part.stats ??= shapeEngine(part).stats);
  const body = getBody(rocket.parentBody);
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  const air = pressureAt(body, alt) / 101325;
  return Math.max(1 - (1 - stats.thrustSea / stats.thrustVac) * air, 0);
}

function engineOutputBase(rocket) {
  const out = { thrust: 0, vx: 0, vy: 0, torque: 0, draws: [] };
  if (!rocket.stack || rocket.id !== target) {
    return out;
  }
  const level = throttle / 100;
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const engine = (entry.part.modules || {})["Engine Module"];
    if (!engine) {
      continue;
    }
    if (!entry.on) {
      continue;
    }
    // throttling to 0% shuts the engine down, so the next burn is a new ignition
    if (level === 0 && !engine["SRB Mode"]) {
      entry.consumedIgnition = false;
    }
    const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
    const propellants = engineResources(engine).map((p) => ({
      ...p,
      feed: feedTanks(rocket.stack, i, p.resource),
    }));
    const ready = propellants.every(
      (p) =>
        p.feed.length && (direction < 0 || feedHeld(p.feed, p.resource) > 0),
    );
    if (!ready) {
      continue;
    }
    if (engine["SRB Mode"]) {
      if (level > 0) {
        entry.srbIgnited = true;
      }
    } else if (level > 0 && !entry.consumedIgnition) {
      const used = entry.ignitionsUsed || 0;
      if (used >= maxIgnitions(entry.part.name)) {
        continue;
      }
      entry.ignitionsUsed = used + 1;
      entry.consumedIgnition = true;
    }
    const engineLevel = engine["SRB Mode"] ? (entry.srbIgnited ? 1 : 0) : level;
    const ambient = ambientFactor(rocket, entry);
    const thrust = (engine.Thrust || 0) * c.newtonsPerThrust * engineLevel * ambient;
    out.thrust += thrust;
    const ra = (entry.rot || 0) * HALF_PI;
    const fx = thrust * Math.sin(ra);
    const fy = -thrust * Math.cos(ra);
    out.vx += fx;
    out.vy += fy;
    out.torque += (entry.ox / c.partUnits) * fy - (entry.oy / c.partUnits) * fx;
    const isp = (engine.ISP || 0) * ambient;
    if (isp > 0) {
      const totalRate = (thrust / (isp * G0)) * direction;
      for (const p of propellants) {
        out.draws.push({
          feed: p.feed,
          resource: p.resource,
          rate: totalRate * p.ratio,
        });
      }
    }
  }
  return out;
}

function rcsOutput(rocket) {
  const out = { vx: 0, vy: 0, draws: [], firing: new Set() };
  if (!rocket.stack || rocket.id !== target || !hasControl(rocket)) {
    return out;
  }
  const touched = touchHeldCodes();
  const down = (code) => held.has(code) || touched.has(code);
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const rcs = (entry.part.modules || {})["RCS Module"];
    if (!rcs) {
      continue;
    }
    const resource = rcs.Resource || defaultResource;
    const feed = feedTanks(rocket.stack, i, resource);
    if (!feed.length || feedHeld(feed, resource) <= 0) {
      continue;
    }
    const thrust = (rcs.Thrust || 0) * c.newtonsPerThrust;
    const dirs = rcs["Thruster Directions"] || [];
    let used = 0;
    if (dirs.includes("Top") && down("KeyI")) {
      out.vy -= thrust;
      used += thrust;
    }
    if (dirs.includes("Bottom") && down("KeyK")) {
      out.vy += thrust;
      used += thrust;
    }
    if (dirs.includes("Left") && down("KeyJ")) {
      out.vx -= thrust;
      used += thrust;
    }
    if (dirs.includes("Right") && down("KeyL")) {
      out.vx += thrust;
      used += thrust;
    }
    if (used > 0) {
      out.firing.add(entry);
      const isp = rcs.ISP || 0;
      if (isp > 0) {
        out.draws.push({ feed, resource, rate: used / (isp * G0) });
      }
    }
  }
  return out;
}

function thrustAccel(rocket) {
  return runFilter("physics:thrustAccel", thrustAccelBase(rocket), { rocket });
}

function thrustAccelBase(rocket) {
  const out = engineOutput(rocket);
  const rcs = rcsOutput(rocket);
  const vx = out.vx + rcs.vx;
  const vy = out.vy + rcs.vy;
  if (vx === 0 && vy === 0) {
    return { x: 0, y: 0 };
  }
  const cos = Math.cos(rocket.angle);
  const sin = Math.sin(rocket.angle);
  return {
    x: (vx * cos - vy * sin) / rocket.mass,
    y: (vx * sin + vy * cos) / rocket.mass,
  };
}

function burnFuel(rocket, h) {
  if (!rocket.stack || !rocket.tanks) {
    return;
  }
  runFuelpipes(rocket, h);
  const draws = [...engineOutput(rocket).draws, ...rcsOutput(rocket).draws];
  for (const draw of draws) {
    const want = draw.rate * h;
    let share = 0;
    for (const entry of draw.feed) {
      const inTank = entry.tanks[draw.resource] || 0;
      const capacity = (entry.tanksMax || {})[draw.resource] || 0;
      share += draw.rate > 0 ? inTank : capacity - inTank;
    }
    for (const entry of draw.feed) {
      const inTank = entry.tanks[draw.resource] || 0;
      const capacity = (entry.tanksMax || {})[draw.resource] || 0;
      const mine = draw.rate > 0 ? inTank : capacity - inTank;
      const portion = share > 0 ? mine / share : 1 / draw.feed.length;
      entry.tanks[draw.resource] = constrain(
        inTank - want * portion,
        0,
        capacity,
      );
    }
  }
  rocket.tanks = stackTanks(rocket.stack);
  rocket.tanksMax = stackTanks(rocket.stack, "tanksMax");
  rocket.fuel = totalFuel(rocket.tanks);
  rocket.fuelMax = totalFuel(rocket.tanksMax);
  rocket.mass = rocket.dryMass + rocket.fuel;
}
