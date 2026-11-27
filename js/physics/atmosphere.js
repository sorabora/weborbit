function scaleHeightAt(body, alt) {
  if (body.scaleHeightFar && alt > body.atmoFar) {
    return body.scaleHeightFar;
  }
  if (body.scaleHeightTop && alt > body.atmoTransition) {
    return body.scaleHeightTop;
  }
  return body.scaleHeight;
}

// drag keeps acting on the thin air above the visible edge of the atmosphere
function dragCeiling(body) {
  return body.dragHeight || body.atmosphereHeight;
}

function densityAt(body, alt) {
  return runFilter("atmo:density", densityAtBase(body, alt), { body, alt });
}

function densityAtBase(body, alt) {
  if (!body.atmosphereHeight) {
    return 0;
  }
  if (!body.scaleHeightTop || alt <= body.atmoTransition) {
    return body.density * Math.exp(-alt / body.scaleHeight);
  }
  const atTransition =
    body.density * Math.exp(-body.atmoTransition / body.scaleHeight);
  if (body.scaleHeightFar && alt > body.atmoFar) {
    return (
      atTransition *
      Math.exp(-(body.atmoFar - body.atmoTransition) / body.scaleHeightTop) *
      Math.exp(-(alt - body.atmoFar) / body.scaleHeightFar)
    );
  }
  return (
    atTransition * Math.exp(-(alt - body.atmoTransition) / body.scaleHeightTop)
  );
}

function relativeVelocity(rocket, body) {
  return {
    x: rocket.vel.x - body.vel.x,
    y: rocket.vel.y - body.vel.y,
  };
}

function calculateVelocity() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  return ` ${format("speed", speed)}`;
}

function calculateNumVelocity() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  return speed;
}

function calculateFuel() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  if (!rocket || !rocket.fuelMax) {
    return "none";
  }
  const tanks = rocket.tanks || {};
  const names = Object.keys(tanks);
  if (names.length <= 1) {
    return `${(rocket.fuel / c.kgPerTon).toFixed(2)}t`;
  }
  return names
    .map((name) => `${name} ${(tanks[name] / c.kgPerTon).toFixed(2)}t`)
    .join(", ");
}

function calculateG() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const push = thrustAccel(rocket);
  let ax = push.x;
  let ay = push.y;

  const alt = Math.max(
    distanceTo(rocket, body) - body.size - rocketRadius(rocket),
    0,
  );
  if (body.atmosphereHeight && alt < dragCeiling(body)) {
    const vel = relativeVelocity(rocket, body);
    const speed = Math.hypot(vel.x, vel.y);
    if (speed > 0) {
      const drag =
        (0.5 *
          densityAt(body, alt) *
          dragArea(rocket, densityAt(body, alt)) *
          speed *
          speed) /
        rocket.mass;
      ax -= (vel.x / speed) * drag;
      ay -= (vel.y / speed) * drag;
    }
  }
  // sitting on the ground, the floor pushes back and the g-meter reads 1g.
  // nothing holds you up over a body with no surface, so it stays in freefall
  if (alt <= 1 && hasSurface(body)) {
    const up = localUp(rocket, body);
    ax += up.x * body.surfaceGravity;
    ay += up.y * body.surfaceGravity;
  }
  return `${(Math.hypot(ax, ay) / G0).toFixed(2)} g`;
}

function calculatePitch() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return `${Math.round(currentPitch(rocket, body))}° (aim ${Math.round(recommendedPitch(rocket, body))}°)`;
}

function calculateAltitude() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return format("distance", distanceTo(rocket, body) - body.size);
}

function calculateAltitudeRaw() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return ("distance", distanceTo(rocket, body) - body.size);
}

function getOrbit() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const mu = gravParam(body);
  const rx = rocket.pos.x - body.pos.x;
  const ry = rocket.pos.y - body.pos.y;
  const r = Math.sqrt(rx ** 2 + ry ** 2);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  const h = rx * vel.y - ry * vel.x;
  const energy = (speed * speed) / 2 - mu / r;
  const a = -mu / (2 * energy);
  const e = Math.sqrt(Math.max(1 + (2 * energy * h * h) / (mu * mu), 0));
  return {
    eccentricity: e,
    periapsis: a * (1 - e) - body.size,
    apoapsis: e < 1 ? a * (1 + e) - body.size : Infinity,
  };
}

function calculateApoapsis() {
  const apoapsis = getOrbit().apoapsis;
  if (!isFinite(apoapsis)) {
    return "escaping";
  }
  return format("distance", apoapsis);
}

function calculatePeriapsis() {
  return format("distance", getOrbit().periapsis);
}

function pressureAt(body, alt) {
  return runFilter("atmo:pressure", pressureAtBase(body, alt), { body, alt });
}

function pressureAtBase(body, alt) {
  if (!body.atmosphereHeight) {
    return 0;
  }
  return densityAt(body, alt) * body.surfaceGravity * scaleHeightAt(body, alt);
}

function calculatePressure() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  if (!body.atmosphereHeight) {
    return format("pressure", 0);
  }
  const rawAlt = distanceTo(rocket, body) - body.size;
  const alt = hasSurface(body) ? Math.max(rawAlt, 0) : rawAlt;
  if (pressureAt(body, alt) <= 0.07 && !inMainMenu && !inVab) {
    rocket.escapedAtmosphere = true;
    rocket.enteredAtmosphere = false;
  }
  if (
    pressureAt(body, alt) >= 0.085 &&
    !inMainMenu &&
    !inVab &&
    rocket.escapedAtmosphere
  ) {
    rocket.enteredAtmosphere = true;
    rocket.escapedAtmosphere = false;
  }
  if (rocket.enteredAtmosphere) {
    const rawAltNow = calculateAltitudeRaw();
    let maxIdx = 7;
    if (rawAltNow <= 10000) {
      maxIdx = 5;
    }
    if (rawAltNow <= 2500) {
      maxIdx = 4;
    }
    if (c.timewarp > timeWarpSteps[maxIdx]) {
      c.timewarp = timeWarpSteps[maxIdx];
    }
    timeWarpCounter = Math.min(timeWarpCounter, maxIdx);
  }
  return format("pressure", pressureAt(body, alt));
}

function bodyColor(body, key, fallback) {
  const cached = key + "Obj";
  if (!body[cached]) {
    body[cached] = body[key] ? color(body[key]) : fallback;
  }
  return body[cached];
}

// every body pulls. only using the parent leaves its own acceleration
// uncancelled, and the orbit slowly warps
function totalGravity(x, y) {
  let ax = 0;
  let ay = 0;
  for (const body of planets) {
    const dx = body.pos.x - x;
    const dy = body.pos.y - y;
    const r2 = dx * dx + dy * dy;
    if (r2 === 0) {
      continue;
    }
    const invR = 1 / Math.sqrt(r2);
    const g = gravParam(body) / r2;
    ax += dx * invR * g;
    ay += dy * invR * g;
  }
  return runFilter("physics:gravity", { x: ax, y: ay }, { x, y });
}
