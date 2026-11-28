function rocketRadius(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const parts = rocket.stack.parts;
  if (!parts.some((entry) => entry.part.modules["No Collision Module"])) {
    return rocket.stack.h / 2 / c.partUnits;
  }
  let reach = 0;
  for (const entry of parts) {
    if (entry.part.modules["No Collision Module"]) {
      continue;
    }
    const bb = partBBox(entry.part);
    const half = (entry.rot || 0) % 2 ? bb.w / 2 : bb.h / 2;
    reach = Math.max(reach, Math.abs(entry.oy) + half);
  }
  return reach / c.partUnits;
}

function hasSurface(body) {
  return !body.noSurface && !body.gasGiant;
}

function isWater(body, dx, dy) {
  if (!body.waterColor) {
    return false;
  }
  const img = textures[body.texture];
  if (!img) {
    return false;
  }
  if (!img._px) {
    img.loadPixels();
    img._px = img.pixels;
    img._water = [
      unhex(body.waterColor.slice(1, 3)),
      unhex(body.waterColor.slice(3, 5)),
      unhex(body.waterColor.slice(5, 7)),
    ];
  }
  const r = Math.hypot(dx, dy) || 1;
  const u = Math.floor((((dx / r) * 0.99 + 1) / 2) * img.width);
  const v = Math.floor((((dy / r) * 0.99 + 1) / 2) * img.height);
  const i = (v * img.width + u) * 4;
  const px = img._px;
  if (i < 0 || i + 2 >= px.length) {
    return false;
  }
  const want = img._water;
  return (
    Math.hypot(px[i] - want[0], px[i + 1] - want[1], px[i + 2] - want[2]) <
    (body.waterTolerance === undefined ? 60 : body.waterTolerance)
  );
}

function surfaceCollide(rocket, body) {
  if (runFilter("collide:skip", false, { rocket, body })) {
    return;
  }
  if (!hasSurface(body)) {
    return;
  }
  const dx = rocket.pos.x - body.pos.x;
  const dy = rocket.pos.y - body.pos.y;
  const r = Math.hypot(dx, dy);
  if (r === 0) {
    return;
  }

  const contact = propContact(body, rocket, dx, dy, r);
  if (!contact && isWater(body, dx, dy)) {
    if (r < body.size + rocketRadius(rocket)) {
      const splash = relativeVelocity(rocket, body);
      const speed = Math.hypot(splash.x, splash.y);
      if (speed >= c.waterCrashSpeed) {
        cd.speed = speed;
        cd.limit = c.waterCrashSpeed;
        cd.body = body.id;
        cd.time = t;
        rocket.destroyed = true;
        logTimelineEvent(rocket, "destroyed", { reason: "water crash", speed });
        return;
      }
    }
    // simple buoyancy light enough floats at the surface if its too heavy it sinks
    if (rocket.mass <= c.waterFloatMass) {
      // submerged fraction grows with mass: 0 = sits on top, 1 = just under
      const sub = rocket.mass / c.waterFloatMass;
      const floor = body.size + rocketRadius(rocket) * (1 - 2 * sub);
      if (r < floor) {
        const nx = dx / r;
        const ny = dy / r;
        const rel = relativeVelocity(rocket, body);
        const down = rel.x * nx + rel.y * ny;
        rocket.pos.x = body.pos.x + nx * floor;
        rocket.pos.y = body.pos.y + ny * floor;
        if (down < 0) {
          rocket.vel.x -= nx * down;
          rocket.vel.y -= ny * down;
        }
      }
    } else if (r < body.size - c.waterSinkDepth) {
      rocket.destroyed = true;
      logTimelineEvent(rocket, "destroyed", { reason: "sank", speed: 0 });
    }
    return;
  }
  const floor = (contact ? contact.top : body.size) + rocketRadius(rocket);
  if (contact && contact.mode === "side") {
    const hit = relativeVelocity(rocket, body);
    if (Math.hypot(hit.x, hit.y) >= c.crashSpeed) {
      cd.speed = Math.hypot(hit.x, hit.y);
      cd.limit = c.crashSpeed;
      cd.body = body.id;
      cd.time = t;
      rocket.destroyed = true;
      logTimelineEvent(rocket, "destroyed", {
        reason: "side crash",
        speed: cd.speed,
      });
      return;
    }
    const tan = { x: -dy / r, y: dx / r };
    rocket.pos.x += tan.x * contact.dist * contact.dir;
    rocket.pos.y += tan.y * contact.dist * contact.dir;
    const slide =
      (rocket.vel.x - body.vel.x) * tan.x + (rocket.vel.y - body.vel.y) * tan.y;
    rocket.vel.x -= tan.x * slide;
    rocket.vel.y -= tan.y * slide;
    return;
  }
  if (r >= floor) {
    return;
  }

  const impact = relativeVelocity(rocket, body);
  if (Math.hypot(impact.x, impact.y) >= c.crashSpeed) {
    cd.speed = Math.hypot(impact.x, impact.y);
    cd.limit = c.crashSpeed;
    cd.body = body.id;
    cd.time = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", {
      reason: "surface crash",
      speed: cd.speed,
    });
    return;
  }
  rocket.pos.x = body.pos.x + (dx / r) * floor;
  rocket.pos.y = body.pos.y + (dy / r) * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  rocket.landed = { x: dx / r, y: dy / r };
}

function restRadius(rocket) {
  const halfWidth = Math.max(rocket.stack.w / 2 / c.partUnits, 0);
  const halfHeight = rocketRadius(rocket);
  const tip = tipAngle(rocket);
  return (
    halfHeight * Math.abs(Math.cos(tip)) + halfWidth * Math.abs(Math.sin(tip))
  );
}

function restOnSurface(rocket, h) {
  const body = getBody(rocket.parentBody);
  const floor =
    surfaceRadiusAt(body, rocket.landed.x, rocket.landed.y) +
    restRadius(rocket);
  rocket.pos.x = body.pos.x + rocket.landed.x * floor;
  rocket.pos.y = body.pos.y + rocket.landed.y * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  burnFuel(rocket, h);
  if (liftsOff(rocket)) {
    rocket.landed = null;
  }
}

function hasControl(rocket) {
  return (
    !!rocket.stack &&
    rocket.stack.parts.some((entry) => {
      const controller = (entry.part.modules || {})["Controller Module"];
      return !!controller && controller["Provides Control"] !== false;
    })
  );
}

function controllerTorque(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  let torque = 0;
  for (const entry of rocket.stack.parts) {
    const controller = (entry.part.modules || {})["Controller Module"];
    if (controller) {
      torque += controller.Torque || 0;
    }
  }
  return torque;
}

// reaction-wheel command, reusing the old rate formula as an acceleration so
// held turn input ramps spin up instead of snapping the angle straight there
function wheelMaxAccel(rocket) {
  const torque = controllerTorque(rocket);
  if (!torque) {
    return 0;
  }
  return (torque * c.turnPower) / (rocket.mass / c.kgPerTon);
}

function isThrusting(rocket) {
  if (!rocket.stack) {
    return false;
  }
  return rocket.stack.parts.some((entry, i) => {
    const engine = (entry.part.modules || {})["Engine Module"];
    if (!engine || !entry.on) {
      return false;
    }
    const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
    const propellants = engineResources(engine).map((p) => ({
      ...p,
      feed: feedTanks(rocket.stack, i, p.resource),
    }));
    return propellants.every(
      (p) =>
        p.feed.length && (direction < 0 || feedHeld(p.feed, p.resource) > 0),
    );
  });
}

function wheelSpinAccel(rocket) {
  const maxAccel = wheelMaxAccel(rocket);
  if (!maxAccel) {
    return 0;
  }
  if (rocket.id === target && rocket.turnInput) {
    return maxAccel * rocket.turnInput;
  }
  if (!rocket.sas || !hasFeature("sas") || !hasControl(rocket)) {
    return 0;
  }
  let targetAngle = rocket.sasAngle;
  if (!isThrusting(rocket)) {
    const retro = reentryRetrogradeAngle(rocket, getBody(rocket.parentBody));
    if (retro) {
      targetAngle = retro.angle;
    }
  }
  let error = targetAngle - rocket.angle;
  error = ((((error + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
  const command = c.sasStiffness * error - c.sasDamping * (rocket.spin || 0);
  return constrain(command, -maxAccel, maxAccel);
}

// the "up" direction (radially away from the body) at this rocket's landing spot
function landedUpAngle(rocket) {
  const out = rocket.landed;
  return Math.atan2(out.x, -out.y);
}

// angle this rocket's stack is pointing away from local "up" at its landing spot
function tipAngle(rocket) {
  const a = rocket.angle - landedUpAngle(rocket);
  return ((((a + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

function gravityTipAccel(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const g = Math.hypot(acc.x, acc.y);
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  return ((1.5 * g) / len) * Math.sin(tipAngle(rocket));
}

// past +-90 deg (lying flat) the stack would have to dig through the ground
// to keep turning, so the ground stops it there like a real fallen rocket
function isAstronautRocket(rocket) {
  const parts = rocket?.stack?.parts ?? [];
  return parts.length === 1 && parts[0]?.part?.name === "_astronaut";
}

const astronautWalkSpeed = 3;
const astronautJumpSpeed = 4;

// astronauts walk by sliding their landing spot around the body
function astronautWalk(rocket, h) {
  const body = getBody(rocket.parentBody);
  const r = Math.max(surfaceRadiusAt(body, rocket.landed.x, rocket.landed.y), 1);
  const delta = ((rocket.walkInput * astronautWalkSpeed) / r) * h;
  const a = landedUpAngle(rocket) + delta;
  rocket.landed = { x: Math.sin(a), y: -Math.cos(a) };
  rocket.angle += delta;
}

function astronautJump(rocket) {
  const up = rocket.landed;
  rocket.landed = null;
  rocket.vel.x += up.x * astronautJumpSpeed;
  rocket.vel.y += up.y * astronautJumpSpeed;
}

function landedSpinStep(rocket, h) {
  if (!rocket.stack) {
    return;
  }
  if (rocket.walkInput && isAstronautRocket(rocket)) {
    astronautWalk(rocket, h);
  }
  const alpha = gravityTipAccel(rocket) + wheelSpinAccel(rocket);
  rocket.spin = (rocket.spin || 0) + alpha * h;
  rocket.spin *= Math.max(1 - c.landedTipDamping * h, 0);
  rocket.angle += rocket.spin * h;
  const tip = tipAngle(rocket);
  if (tip > HALF_PI) {
    rocket.angle = landedUpAngle(rocket) + HALF_PI;
    rocket.spin = Math.min(rocket.spin, 0);
  } else if (tip < -HALF_PI) {
    rocket.angle = landedUpAngle(rocket) - HALF_PI;
    rocket.spin = Math.max(rocket.spin, 0);
  }
}

// off the ground once the engines out-push whatever gravity is holding it down
function liftsOff(rocket) {
  const push = thrustAccel(rocket);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const out = rocket.landed;
  return (push.x + acc.x) * out.x + (push.y + acc.y) * out.y > 0;
}

function aeroStability(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  let stability = 0;
  for (const entry of rocket.stack.parts) {
    const aero = (entry.part.modules || {})["Aero Module"];
    if (aero) {
      stability += aero.Stability || 0;
    }
  }
  return stability;
}

function reentryRetrogradeAngle(rocket, body) {
  if (!body.atmosphereHeight) {
    return null;
  }
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (alt >= body.atmosphereHeight) {
    return null;
  }
  const density = densityAt(body, alt);
  if (density <= 0) {
    return null;
  }
  const vel = relativeVelocity(rocket, body);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed < c.reentryMinSpeed) {
    return null;
  }
  return { angle: Math.atan2(-vel.x, vel.y), density, speed };
}

function aeroStabilityAccel(rocket) {
  const stability = aeroStability(rocket);
  if (!stability) {
    return 0;
  }
  const body = getBody(rocket.parentBody);
  const retro = reentryRetrogradeAngle(rocket, body);
  if (!retro) {
    return 0;
  }
  let error = retro.angle - rocket.angle;
  error = ((((error + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  const q = 0.5 * retro.density * retro.speed * retro.speed;
  const inertia = (rocket.mass * len * len) / 12;
  const restoring = c.aeroStabilityFactor * stability * q * Math.sin(error);
  const damping = c.aeroStabilityDamping * stability * q * (rocket.spin || 0);
  const accel = (restoring - damping) / inertia;
  return constrain(accel, -c.aeroStabilityMaxAccel, c.aeroStabilityMaxAccel);
}

function spinAccel(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const out = engineOutput(rocket);
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  const gimbal = out.torque ? out.torque / ((rocket.mass * len * len) / 12) : 0;
  return gimbal + wheelSpinAccel(rocket) + aeroStabilityAccel(rocket);
}

function integrateAttitude(rocket, h) {
  const micro = Math.max(
    1,
    Math.min(Math.ceil(h / c.attitudeMicroStep), c.attitudeMaxMicro),
  );
  const hi = Math.min(h / micro, c.attitudeMicroStep);
  for (let i = 0; i < micro; i++) {
    rocket.spin = (rocket.spin || 0) + spinAccel(rocket) * hi;
    rocket.angle += rocket.spin * hi;
  }
  rocket.angle += rocket.spin * Math.max(h - hi * micro, 0);
}

// leapfrog: the two half-kicks sample gravity at each end of the step
function kickDrift(rocket, h) {
  updateSOI(rocket);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const push = thrustAccel(rocket);
  rocket.vel.x += ((acc.x + push.x) * h) / 2;
  rocket.vel.y += ((acc.y + push.y) * h) / 2;
  rocket.pos.x += rocket.vel.x * h;
  rocket.pos.y += rocket.vel.y * h;
  integrateAttitude(rocket, h);
}

// in thin air the flow is free-molecular and a body is draggier than the
// streamlined 0.5 it gets in a launch: Cd climbs to about 2.2 (what real
// satellites use). Full effect from 1e-5 kg/m3 (~94 km on Earth) up, none
// by 1e-3 (~60 km), so the dense air of a launch or re-entry is unchanged
// the faint upper air drags harder, so orbits with a low periapsis decay in
// days instead of months. Reaches the full 50x once the air is thinner than 1e-5
function thinAirDragBoost(density) {
  const thin = constrain((Math.log10(1e-3) - Math.log10(density)) / 2, 0, 1);
  return 1 + 49 * thin;
}

// the ship plus whatever canopies are out. Drag is a CdA, straight out of
// v = sqrt(2mg / (density * Drag))
function dragArea(rocket, density = Infinity) {
  let total = rocket.dragCoeff * rocket.dragArea * thinAirDragBoost(density);
  for (const entry of rocket.stack ? rocket.stack.parts : []) {
    const chute = (entry.part.modules || {})["Parachute Module"];
    if (chute && entry.deployed && !entry.torn) {
      total += chute.Drag || 0;
    }
  }
  return total;
}

function tearChutes(rocket, speed) {
  for (const entry of rocket.stack ? rocket.stack.parts : []) {
    const chute = (entry.part.modules || {})["Parachute Module"];
    if (
      chute &&
      entry.deployed &&
      !entry.torn &&
      speed > (chute["Max Deploy Speed"] || Infinity)
    ) {
      entry.torn = true;
    }
  }
}

function deployChute(rocket, entry) {
  const chute = entry.part.modules["Parachute Module"];
  if (entry.deployed) {
    return;
  }
  const body = getBody(rocket.parentBody);
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (pressureAt(body, alt) < (chute["Minimum Deploy Pressure"] || 0) * 1000) {
    return;
  }
  entry.deployed = true;
  const vel = relativeVelocity(rocket, body);
  tearChutes(rocket, Math.hypot(vel.x, vel.y));
}

function kickFinish(rocket, h) {
  const body = getBody(rocket.parentBody);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const push = thrustAccel(rocket);
  rocket.vel.x += ((acc.x + push.x) * h) / 2;
  rocket.vel.y += ((acc.y + push.y) * h) / 2;

  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (body.atmosphereHeight && alt < dragCeiling(body)) {
    const density = densityAt(body, alt);
    // the air moves with the planet, so drag acts on the relative velocity
    const vel = relativeVelocity(rocket, body);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    tearChutes(rocket, speed); // before the drag, so a shredded one stops pulling
    if (speed > 0) {
      const k = (0.5 * density * dragArea(rocket, density)) / rocket.mass;
      const decay = 1 / (1 + k * speed * h);
      rocket.vel.x = body.vel.x + vel.x * decay;
      rocket.vel.y = body.vel.y + vel.y * decay;
    }
  }

  if (distanceTo(rocket, body) < body.size) {
    const vel = relativeVelocity(rocket, body);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (
      speed > 0 &&
      isWater(body, rocket.pos.x - body.pos.x, rocket.pos.y - body.pos.y)
    ) {
      const k = (0.5 * c.waterDensity * dragArea(rocket)) / rocket.mass;
      const decay = 1 / (1 + k * speed * h);
      rocket.vel.x = body.vel.x + vel.x * decay;
      rocket.vel.y = body.vel.y + vel.y * decay;
    }
  }

  burnFuel(rocket, h);

  surfaceCollide(rocket, body);
}
