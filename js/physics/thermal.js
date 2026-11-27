const stefanBoltzmann = 5.670374e-8;

function calculateTemperature() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  return format("temperature", ambientTemperature(rocket));
}

function ambientTemperature(rocket) {
  const body = getBody(rocket.parentBody);

  let flux = 0;
  for (const planet of planets) {
    if (!planet.luminosity) {
      continue;
    }
    const r = distanceTo(rocket, planet);
    if (r > 0) {
      flux += planet.luminosity / (4 * Math.PI * r * r);
    }
  }

  const albedo = rocket.albedo || 0;
  const equilibriumTemp = Math.pow(
    ((1 - albedo) * flux) / (4 * stefanBoltzmann),
    0.25,
  );

  const rawAlt = distanceTo(rocket, body) - body.size;
  const alt = hasSurface(body) ? Math.max(rawAlt, 0) : rawAlt;
  const pressure = pressureAt(body, alt);

  const referencePressure = 101325; // Earth sea-level, Pa
  const ratio = pressure > 0 ? pressure / referencePressure : 0;
  const greenhouseFactor =
    ratio > 0 ? 1 + 0.1 * Math.log10(ratio + 1) * Math.log10(ratio + 10) : 1;

  return equilibriumTemp * greenhouseFactor;
}

function heatBox(entry) {
  const bb = partBBox(entry.part);
  const turned = (entry.rot || 0) % 2 !== 0;
  return {
    x: entry.ox,
    y: entry.oy,
    hw: (turned ? bb.h : bb.w) / 2,
    hh: (turned ? bb.w : bb.h) / 2,
  };
}

function rayHitsBox(px, py, dx, dy, box) {
  let near = 0;
  let far = Infinity;
  for (const [p, d, low, high] of [
    [px, dx, box.x - box.hw, box.x + box.hw],
    [py, dy, box.y - box.hh, box.y + box.hh],
  ]) {
    if (Math.abs(d) < 1e-9) {
      if (p < low || p > high) {
        return false;
      }
      continue;
    }
    const a = (low - p) / d;
    const b = (high - p) / d;
    near = Math.max(near, Math.min(a, b));
    far = Math.min(far, Math.max(a, b));
    if (near > far) {
      return false;
    }
  }
  return far > 1e-6;
}

function heatExposure(boxes, blockBoxes, index, dir) {
  const mine = boxes[index];
  const reach = Math.abs(dir.y) * mine.hw + Math.abs(dir.x) * mine.hh;
  let open = 0;
  for (const share of [-0.8, -0.4, 0, 0.4, 0.8]) {
    const px = mine.x - dir.y * reach * share;
    const py = mine.y + dir.x * reach * share;
    if (
      !blockBoxes.some(
        (box, j) => j !== index && rayHitsBox(px, py, dir.x, dir.y, box),
      )
    ) {
      open++;
    }
  }
  return open / 5;
}

function localDir(rocket, wx, wy) {
  const cos = Math.cos(rocket.angle);
  const sin = Math.sin(rocket.angle);
  return { x: wx * cos + wy * sin, y: -wx * sin + wy * cos };
}

function starLight(rocket) {
  let flux = 0;
  let dx = 0;
  let dy = 0;
  for (const planet of planets) {
    if (!planet.luminosity) {
      continue;
    }
    const vx = planet.pos.x - rocket.pos.x;
    const vy = planet.pos.y - rocket.pos.y;
    const r = Math.hypot(vx, vy);
    if (r > 0) {
      const f = planet.luminosity / (4 * Math.PI * r * r);
      flux += f;
      dx += (vx / r) * f;
      dy += (vy / r) * f;
    }
  }
  const length = Math.hypot(dx, dy);
  return flux > 0 && length > 0
    ? { flux, x: dx / length, y: dy / length }
    : null;
}

function shieldArea(entry) {
  return Math.PI * (heatBox(entry).hw / c.partUnits) ** 2;
}

function explodeParts(rocket, entries) {
  rocket.stack.parts = rocket.stack.parts.filter(
    (entry) => !entries.includes(entry),
  );
  if (rocket.id === target) {
    launchToast(
      entries.length > 1
        ? `${entries.length} parts overheated`
        : `${entries[0].part.name} overheated`,
    );
  }
  logTimelineEvent(rocket, "overheat", {
    parts: entries.map((entry) => entry.part.name),
  });
  if (!rocket.stack.parts.length) {
    cd.body = rocket.parentBody;
    cd.speed = 0;
    cd.limit = 0;
    cd.time = t;
    cd.message = "Every part burned up";
    cd.messageAt = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", { reason: "burned up" });
    return;
  }
  splitRocket(rocket, () => false, 0, true);
}

function updateRocketTemp(rocket, dt) {
  const body = getBody(rocket.parentBody);
  const ambient = ambientTemperature(rocket);
  if (rocket.temp === undefined) {
    rocket.temp = ambient;
  }
  const alt = Math.max(
    distanceTo(rocket, body) - body.size - rocketRadius(rocket),
    0,
  );
  const inAir = !!body.atmosphereHeight && alt < body.atmosphereHeight;
  const vel = relativeVelocity(rocket, body);
  const speed = Math.hypot(vel.x, vel.y);
  const flux = inAir
    ? 0.5 *
      densityAt(body, alt) *
      Math.pow(Math.max(speed - c.reentryMinSpeed, 0), 3) *
      c.reentryHeatFactor
    : 0;
  const blend = 1 - Math.exp(-c.reentryCoolRate * dt);
  const parts = rocket.stack ? rocket.stack.parts : [];
  if (!parts.length) {
    const targetTemp = Math.pow(
      Math.pow(ambient, 4) + flux / stefanBoltzmann,
      0.25,
    );
    rocket.temp = Math.max(
      ambient,
      rocket.temp + (targetTemp - rocket.temp) * blend,
    );
    return;
  }

  const floor = inAir ? ambient : 3;
  const boxes = parts.map(heatBox);
  const blockBoxes = parts.map((entry, i) => {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    return shield
      ? { ...boxes[i], hw: boxes[i].hw * 1.2, hh: boxes[i].hh * 1.2 }
      : boxes[i];
  });
  const airDir =
    flux > 0 && speed > 0
      ? localDir(rocket, vel.x / speed, vel.y / speed)
      : null;
  const star = starLight(rocket);
  const starDir = star ? localDir(rocket, star.x, star.y) : null;
  let skin = 0;
  parts.forEach((entry, i) => {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    if (shield && entry.ablator === undefined) {
      entry.ablator = shield.Ablator * c.kgPerTon;
      entry.ablatorMax = entry.ablator;
    }
    if (entry.temp === undefined) {
      entry.temp = ambient;
    }
    const nose = Math.sqrt(1 / Math.max(boxes[i].hw / c.partUnits, 0.25));
    const absorbed =
      (airDir ? flux * nose * heatExposure(boxes, blockBoxes, i, airDir) : 0) +
      (starDir
        ? star.flux * 0.5 * heatExposure(boxes, blockBoxes, i, starDir)
        : 0);
    let target = Math.pow(
      Math.pow(floor, 4) + absorbed / stefanBoltzmann,
      0.25,
    );
    entry.surface = target;
    if (shield && entry.ablator > 0) {
      const held = shield["Ablation Temperature"] ?? 1000;
      if (target > held) {
        const rate =
          (shieldArea(entry) *
            stefanBoltzmann *
            (Math.pow(target, 4) - Math.pow(held, 4))) /
          c.ablatorHeat;
        const used = Math.min(entry.ablator, rate * dt);
        entry.ablator -= used;
        rocket.dryMass = Math.max(rocket.dryMass - used, 1);
        target = held;
      }
    }
    entry.temp += (target - entry.temp) * blend;
    skin = Math.max(skin, entry.surface);
  });

  const near = stackNeighbours(rocket.stack);
  const conduct = 1 - Math.exp(-c.conduction * dt);
  const next = parts.map((entry, i) =>
    near[i].length
      ? entry.temp +
        conduct *
          (near[i].reduce((sum, j) => sum + parts[j].temp, 0) / near[i].length -
            entry.temp)
      : entry.temp,
  );
  parts.forEach((entry, i) => {
    entry.temp = next[i];
  });

  rocket.temp = Math.max(skin, ...parts.map((entry) => entry.temp));
  const blown = parts.filter((entry) => {
    const mod = (entry.part.modules || {})["Max Temperature Modification Module"];
    return entry.temp > (mod?.["Temperature (k)"] ?? c.partMaxTemp);
  });
  if (blown.length) {
    explodeParts(rocket, blown);
  }
}
