function pendingBurnWait(ship) {
  if (rendezvousTarget) {
    const node = activeNode(ship);
    if (!node || !Number.isFinite(node.t) || Math.abs(node.dv) < 0.5) {
      return null;
    }
    const seconds = node.t - t;
    return { seconds, label: node.label, dv: node.dv, due: seconds <= 30 };
  }
  if (transferTarget) {
    const plan = transferPlan(ship, getBody(transferTarget));
    if (!plan || !Number.isFinite(plan.wait)) {
      return null;
    }
    if (Math.abs(plan.dv1) > 1) {
      return {
        seconds: plan.wait,
        label: "burn",
        dv: plan.dv1,
        due: plan.wait <= 30,
      };
    }
    if (plan.flight > 1 && Number.isFinite(plan.flight)) {
      return {
        seconds: plan.flight,
        label: "capture",
        dv: plan.dv2,
        due: false,
      };
    }
  }
  return null;
}

function autoBurnSource(rocket) {
  if (!rocket.stack) {
    return null;
  }
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const engine = (entry.part.modules || {})["Engine Module"];
    if (
      !engine ||
      !entry.on ||
      engine["Fuel Flow"] === "Negative" ||
      !(engine.ISP > 0)
    ) {
      continue;
    }
    const propellants = engineResources(engine).map((p) => ({
      ...p,
      feed: feedTanks(rocket.stack, i, p.resource),
    }));
    if (
      propellants.every(
        (p) => p.feed.length && feedHeld(p.feed, p.resource) > 0,
      )
    ) {
      return { isp: engine.ISP, propellants };
    }
  }
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const rcs = (entry.part.modules || {})["RCS Module"];
    if (!rcs || !(rcs.ISP > 0)) {
      continue;
    }
    const resource = rcs.Resource || defaultResource;
    const feed = feedTanks(rocket.stack, i, resource);
    if (feed.length && feedHeld(feed, resource) > 0) {
      return { isp: rcs.ISP, propellants: [{ resource, ratio: 1, feed }] };
    }
  }
  return null;
}

function snapshotDockPlan(rocket) {
  if (!rendezvousTarget) {
    return null;
  }
  const other = rockets.find((r) => r.id === rendezvousTarget);
  const plan = other && dockPlan(rocket, other);
  if (!plan) {
    return null;
  }
  return {
    mode: plan.mode,
    dv: plan.dv,
    seconds: plan.seconds,
    distance: plan.distance,
  };
}

function logBurnEvent(rocket, kind, dv) {
  if (!burnLogging) {
    return;
  }
  const parent = rocket.parentBody && getBody(rocket.parentBody);
  const rel = parent && relativeVelocity(rocket, parent);
  const ph = parent && orbitPhase(rocket.pos, rocket.vel, parent);
  const entry = {
    t,
    kind,
    dv,
    body: rocket.parentBody,
    speed: rel ? Math.hypot(rel.x, rel.y) : null,
    altitude: parent ? distanceTo(rocket, parent) - parent.size : null,
    periapsis: ph && ph.closed ? ph.periapsis - parent.size : null,
    apoapsis: ph && ph.closed ? ph.apoapsis - parent.size : null,
    plan: snapshotDockPlan(rocket),
  };
  burnLog.push(entry);
  console.log("[burn]", entry);
}

function downloadBurnLog() {
  if (!burnLog.length) {
    launchToast("No burn log entries yet, turn logging on with Shift+L first.");
    return;
  }
  const blob = new Blob([JSON.stringify(burnLog, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "burn-log.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  launchToast(`Downloaded ${burnLog.length} burn log entries.`);
}

function logTimelineEvent(rocket, kind, data) {
  if (!rocketTimelineEnabled || !rocket) {
    return;
  }
  const parent = rocket.parentBody && getBody(rocket.parentBody);
  const rel = parent && relativeVelocity(rocket, parent);
  const altitude = parent ? distanceTo(rocket, parent) - parent.size : null;
  rocketTimeline.push({
    t,
    kind,
    rocket: rocket.id,
    angle: rocket.angle,
    angleDeg: degrees(rocket.angle),
    vel: { x: rocket.vel.x, y: rocket.vel.y },
    pos: { x: rocket.pos.x, y: rocket.pos.y },
    throttle,
    body: rocket.parentBody,
    altitude,
    altitudeKm: altitude === null ? null : altitude / 1000,
    speed: rel ? Math.hypot(rel.x, rel.y) : null,
    inAtmosphere: !!(
      parent &&
      parent.atmosphereHeight &&
      altitude !== null &&
      altitude < parent.atmosphereHeight
    ),
    spin: rocket.spin || 0,
    rotationDegPerSec: ((rocket.spin || 0) * 180) / Math.PI,
    temp: rocket.temp ?? null,
    ...data,
  });
}

function downloadRocketTimeline() {
  if (!rocketTimeline.length) {
    launchToast("No timeline recorded yet, launch a rocket first.");
    return;
  }
  const blob = new Blob([JSON.stringify(rocketTimeline, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rocket-timeline.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  launchToast(`Downloaded ${rocketTimeline.length} timeline entries.`);
}

function executeAutomatedBurn(rocket, dv) {
  const cooldown = 5;
  if (t - lastAutomatedBurnT < cooldown) {
    launchToast(
      `Wait ${Math.ceil(cooldown - (t - lastAutomatedBurnT))}s for the last burn to settle first.`,
    );
    return false;
  }
  const parent = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, parent);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed <= 0) {
    return false;
  }
  const source = autoBurnSource(rocket);
  if (!source) {
    launchToast("No fuelled engine or RCS to perform the burn.");
    return false;
  }
  const wetMass = rocket.mass;
  const wantMass =
    wetMass - wetMass * Math.exp(-Math.abs(dv) / (source.isp * G0));

  let available = Infinity;
  for (const p of source.propellants) {
    let have = 0;
    for (const entry of p.feed) {
      have += entry.tanks[p.resource] || 0;
    }
    available = Math.min(available, p.ratio > 0 ? have / p.ratio : Infinity);
  }
  if (available < wantMass) {
    launchToast(
      `Not enough fuel for the full ${format("speed", Math.abs(dv))} burn`,
    );
    return false;
  }

  for (const p of source.propellants) {
    const want = wantMass * p.ratio;
    let share = 0;
    for (const entry of p.feed) {
      share += entry.tanks[p.resource] || 0;
    }
    if (share <= 0) {
      continue;
    }
    for (const entry of p.feed) {
      const inTank = entry.tanks[p.resource] || 0;
      entry.tanks[p.resource] = Math.max(inTank - want * (inTank / share), 0);
    }
  }
  rocket.tanks = stackTanks(rocket.stack);
  rocket.tanksMax = stackTanks(rocket.stack, "tanksMax");
  rocket.fuel = totalFuel(rocket.tanks);
  rocket.fuelMax = totalFuel(rocket.tanksMax);
  rocket.mass = rocket.dryMass + rocket.fuel;

  const scale = dv / speed;
  rocket.vel.x += vel.x * scale;
  rocket.vel.y += vel.y * scale;
  lastAutomatedBurnT = t;
  logBurnEvent(rocket, "automated", dv);
  return true;
}

function transferPlan(ship, dest) {
  if (!ship || !dest || dest === getBody(ship.parentBody)) {
    return null;
  }
  const parent = getBody(ship.parentBody);
  const escaping = dest.parentBody !== ship.parentBody;
  if (escaping && dest.parentBody !== parent.parentBody) {
    return null;
  }
  const body = escaping ? getBody(parent.parentBody) : parent;
  const mu = gravParam(body);
  const origin = escaping ? parent.pos : ship.pos;
  const r1 = escaping
    ? parent.orbitRadius
    : Math.hypot(ship.pos.x - body.pos.x, ship.pos.y - body.pos.y);
  const r2 = dest.orbitRadius;
  if (r1 === r2) {
    return null;
  }
  const at = (r1 + r2) / 2;
  const vel = relativeVelocity(ship, parent);
  const speed = Math.hypot(vel.x, vel.y);
  const helio = Math.sqrt((mu * r2) / (r1 * at)) - Math.sqrt(mu / r1);
  let dv1 = Math.sqrt((mu * r2) / (r1 * at)) - speed;
  if (escaping) {
    const rp = Math.hypot(ship.pos.x - parent.pos.x, ship.pos.y - parent.pos.y);
    dv1 = Math.sqrt(helio * helio + (2 * gravParam(parent)) / rp) - speed;
  }
  const dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt(r1 / at));
  const flight = Math.PI * Math.sqrt(at ** 3 / mu);
  const w1 = escaping ? TWO_PI / parent.orbitPeriod : Math.sqrt(mu / r1 ** 3);
  const w2 = TWO_PI / dest.orbitPeriod;
  const lead = Math.PI - w2 * flight;
  const originAng = Math.atan2(origin.y - body.pos.y, origin.x - body.pos.x);
  const destAng = Math.atan2(dest.pos.y - body.pos.y, dest.pos.x - body.pos.x);
  const synodic = TWO_PI / Math.abs(w1 - w2);
  let wait = ((destAng - originAng - lead) / (w1 - w2)) % synodic;
  if (wait < 0) {
    wait += synodic;
  }
  const burnAng = originAng + w1 * wait;
  let burn = {
    x: body.pos.x + Math.cos(burnAng) * r1,
    y: body.pos.y + Math.sin(burnAng) * r1,
  };
  if (escaping) {
    const rp = Math.hypot(ship.pos.x - parent.pos.x, ship.pos.y - parent.pos.y);
    const rx = ship.pos.x - parent.pos.x;
    const ry = ship.pos.y - parent.pos.y;
    const spin = Math.sign(rx * vel.y - ry * vel.x) || 1;
    const pv = relativeVelocity(parent, body);
    const eject =
      Math.atan2(pv.y, pv.x) + (helio < 0 ? Math.PI : 0) - spin * HALF_PI;
    burn = {
      x: parent.pos.x + Math.cos(eject) * rp,
      y: parent.pos.y + Math.sin(eject) * rp,
    };
  }
  return { body, r1, r2, at, dv1, dv2, flight, wait, burnAng, burn };
}

function drawTransfer(ship, mapX, mapY) {
  const plan = transferPlan(ship, transferTarget && getBody(transferTarget));
  if (!plan) {
    return;
  }
  const { body, r1, r2, at, burnAng, burn } = plan;
  const bx = burn.x;
  const by = burn.y;
  const ax = body.pos.x - Math.cos(burnAng) * r2;
  const ay = body.pos.y - Math.sin(burnAng) * r2;
  const e = Math.abs(r2 - r1) / (r1 + r2);
  push();
  translate(mapX(body.pos), mapY(body.pos));
  rotate(burnAng + (r2 < r1 ? Math.PI : 0));
  noFill();
  stroke("#ffb347aa");
  strokeWeight(1);
  ellipse(
    -at * e * mapScale,
    0,
    at * 2 * mapScale,
    at * 2 * Math.sqrt(1 - e * e) * mapScale,
  );
  pop();
  noStroke();
  fill("#ffb347");
  circle(mapX({ x: bx, y: by }), mapY({ x: bx, y: by }), 8);
  fill("#ffb34788");
  circle(mapX({ x: ax, y: ay }), mapY({ x: ax, y: ay }), 6);
  fill("#ffb347");
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(
    `→ ${transferTarget}  Δv ${format("speed", Math.abs(plan.dv1))}  in ${formatTime(plan.wait)}`,
    mapX({ x: bx, y: by }) + 8,
    mapY({ x: bx, y: by }) - 6,
  );
  text(
    `capture Δv ${format("speed", Math.abs(plan.dv2))}  after ${formatTime(plan.flight)}`,
    mapX({ x: ax, y: ay }) + 8,
    mapY({ x: ax, y: ay }) - 6,
  );
}

// raw current gap/closing-speed between two craft — only meaningful once
// they're already close together on a converging final approach
function rendezvousPlan(ship, other) {
  if (!ship || !other || ship === other) {
    return null;
  }
  const relPos = { x: other.pos.x - ship.pos.x, y: other.pos.y - ship.pos.y };
  const relVel = { x: other.vel.x - ship.vel.x, y: other.vel.y - ship.vel.y };
  const distance = Math.hypot(relPos.x, relPos.y);
  const closeAng = Math.atan2(relPos.y, relPos.x);
  const closeDv =
    0.05 * Math.hypot(relVel.x, relVel.y) + Math.min(distance / 60, 20);
  const matchDv = Math.hypot(relVel.x, relVel.y);
  return {
    distance,
    closeAng,
    closeDv,
    matchDv,
    matchAng: Math.atan2(relVel.y, relVel.x),
  };
}

// r, angle and mean angular rate of an orbit around `parent`, from vis-viva.
// works for any closed (elliptical) orbit, not just circular ones.
function orbitalElements(pos, vel, parent) {
  const mu = gravParam(parent);
  const rx = pos.x - parent.pos.x;
  const ry = pos.y - parent.pos.y;
  const vx = vel.x - parent.vel.x;
  const vy = vel.y - parent.vel.y;
  const r = Math.hypot(rx, ry);
  const v2 = vx * vx + vy * vy;
  const energy = v2 / 2 - mu / r;
  const a = -mu / (2 * energy);
  const closed = energy < 0 && a > 0;
  const period = closed ? TWO_PI * Math.sqrt(a ** 3 / mu) : Infinity;
  const cross = rx * vy - ry * vx;
  const w = closed ? Math.sign(cross || 1) * (TWO_PI / period) : 0;
  return {
    r,
    a,
    period,
    w,
    angle: Math.atan2(ry, rx),
    closed,
    speed: Math.sqrt(v2),
  };
}

function orbitPhase(pos, vel, parent) {
  const mu = gravParam(parent);
  const rx = pos.x - parent.pos.x;
  const ry = pos.y - parent.pos.y;
  const vx = vel.x - parent.vel.x;
  const vy = vel.y - parent.vel.y;
  const r = Math.hypot(rx, ry);
  const v2 = vx * vx + vy * vy;
  const rdotv = rx * vx + ry * vy;
  const energy = v2 / 2 - mu / r;
  const a = -mu / (2 * energy);
  if (!(energy < 0 && a > 0)) {
    return { closed: false };
  }
  const ex = (v2 / mu - 1 / r) * rx - (rdotv / mu) * vx;
  const ey = (v2 / mu - 1 / r) * ry - (rdotv / mu) * vy;
  const e = Math.hypot(ex, ey);
  const period = TWO_PI * Math.sqrt(a ** 3 / mu);
  const n = TWO_PI / period;
  const periapsis = a * (1 - e);
  const apoapsis = a * (1 + e);
  if (e < 1e-6) {
    // no well-defined apsis line on a circular orbit — nothing to time
    return {
      closed: true,
      a,
      e,
      period,
      periapsis,
      apoapsis,
      timeToPeriapsis: NaN,
      timeToApoapsis: NaN,
    };
  }
  let nu = Math.acos(constrain((ex * rx + ey * ry) / (e * r), -1, 1));
  if (rdotv < 0) {
    nu = TWO_PI - nu;
  }
  const E =
    2 *
    Math.atan2(
      Math.sqrt(1 - e) * Math.sin(nu / 2),
      Math.sqrt(1 + e) * Math.cos(nu / 2),
    );
  let M = E - e * Math.sin(E);
  if (M < 0) {
    M += TWO_PI;
  }
  const timeToPeriapsis = ((TWO_PI - M) % TWO_PI) / n;
  const timeToApoapsis = ((Math.PI - M + TWO_PI) % TWO_PI) / n;
  return {
    closed: true,
    a,
    e,
    period,
    periapsis,
    apoapsis,
    timeToPeriapsis,
    timeToApoapsis,
  };
}

function nodeOrbitChanged(ph, node) {
  return (
    Math.abs(ph.a - node.a) / node.a > 2e-3 || Math.abs(ph.e - node.e) > 2e-3
  );
}

function planManeuver(ship, other, ph, el1, el2, parent, mu) {
  const r2 = el2.r;
  const tol = 0.02;
  const periNear = Math.abs(ph.periapsis - r2) / r2 < tol;
  const apoNear = Math.abs(ph.apoapsis - r2) / r2 < tol;
  const sig = { a: ph.a, e: ph.e };

  if (periNear !== apoNear) {
    const toPeri = periNear;
    const arriveR = toPeri ? ph.periapsis : ph.apoapsis;
    let coast = toPeri ? ph.timeToPeriapsis : ph.timeToApoapsis;
    if (!Number.isFinite(coast)) {
      return null;
    }
    if (coast < 1) {
      coast += ph.period;
    }
    const arriveSpeed = Math.sqrt(mu * (2 / arriveR - 1 / ph.a));
    return {
      t: t + coast,
      dv: Math.sqrt(mu / arriveR) - arriveSpeed,
      label: "capture",
      r: arriveR,
      ...sig,
    };
  }

  if (periNear && apoNear) {
    const w2 = el2.w;
    if (!w2) {
      return null;
    }
    const r1 = el1.r;
    const targetPeriod = TWO_PI / Math.abs(w2);
    let gap = (el1.angle - el2.angle) % TWO_PI;
    if (gap < 0) {
      gap += TWO_PI;
    }
    let best = null;
    for (let laps = 1; laps <= 12; laps++) {
      for (let k = 0; k <= laps + 1; k++) {
        const total = gap / Math.abs(w2) + k * targetPeriod;
        const loop = total / laps;
        if (loop <= 0) {
          continue;
        }
        const a2 = Math.cbrt(mu * (loop / TWO_PI) ** 2);
        if (2 * a2 - r1 <= parent.size * 1.05) {
          continue;
        }
        const score = Math.abs(loop - ph.period);
        if (!best || score < best.score) {
          best = { score, a2, total, laps };
        }
      }
    }
    if (!best) {
      return null;
    }
    const vPhase = Math.sqrt(mu * (2 / r1 - 1 / best.a2));
    return {
      t,
      dv: vPhase - el1.speed,
      label: "burn",
      r: r1,
      live: true,
      captureT: t + best.total,
      laps: best.laps,
      expectA: best.a2,
      ...sig,
    };
  }

  // burn at an apsis so the burn radius is a fixed property of the orbit
  // rather than wherever the ship happens to be this frame
  const raise = r2 > ph.apoapsis;
  let r1 = raise ? ph.periapsis : ph.apoapsis;
  let wait = raise ? ph.timeToPeriapsis : ph.timeToApoapsis;
  if (!Number.isFinite(wait)) {
    r1 = el1.r;
    wait = 0;
  }
  const at = (r1 + r2) / 2;
  const need = Math.sqrt(mu * (2 / r1 - 1 / at));
  const have = Math.sqrt(mu * (2 / r1 - 1 / ph.a));
  return {
    t: t + wait,
    dv: need - have,
    label: "burn",
    r: r1,
    live: wait <= 0,
    ...sig,
  };
}

function activeNode(ship) {
  if (!ship || !rendezvousTarget) {
    if (ship) {
      ship.node = null;
    }
    return null;
  }
  const other = rockets.find((rocket) => rocket.id === rendezvousTarget);
  if (!other || other === ship || ship.parentBody !== other.parentBody) {
    ship.node = null;
    return null;
  }
  const parent = getBody(ship.parentBody);
  const ph = orbitPhase(ship.pos, ship.vel, parent);
  const el1 = orbitalElements(ship.pos, ship.vel, parent);
  const el2 = orbitalElements(other.pos, other.vel, parent);
  if (!ph.closed || !el1.closed || !el2.closed) {
    ship.node = null;
    return null;
  }
  const distance = Math.hypot(
    other.pos.x - ship.pos.x,
    other.pos.y - ship.pos.y,
  );
  if (distance < Math.max(50000, el1.r * 0.05)) {
    ship.node = null;
    return null;
  }

  const node = ship.node;
  if (
    node &&
    node.target === rendezvousTarget &&
    node.captureT &&
    node.expectA &&
    Math.abs(ph.a - node.expectA) / node.expectA < 5e-3
  ) {
    // the burn this node asked for has been flown, by hand or automated, so
    // the capture it was solved for is now committed rather than re-derived
    const chained = {
      t: node.captureT,
      dv: -node.dv,
      label: "capture",
      r: node.r,
      a: ph.a,
      e: ph.e,
      target: rendezvousTarget,
    };
    ship.node = chained;
    return chained;
  }
  if (
    node &&
    node.target === rendezvousTarget &&
    !node.live &&
    !nodeOrbitChanged(ph, node)
  ) {
    // a capture recurs every lap, so a missed one just rolls to the next
    while (node.label === "capture" && node.t < t - 1) {
      node.t += ph.period;
    }
    return node;
  }
  const fresh = planManeuver(
    ship,
    other,
    ph,
    el1,
    el2,
    parent,
    gravParam(parent),
  );
  if (fresh) {
    fresh.target = rendezvousTarget;
  }
  ship.node = fresh;
  return fresh;
}

function clampTimewarpForOrbit(rocket) {
  if (!rocket || !rocket.parentBody || rocket.landed) {
    return;
  }
  const parent = getBody(rocket.parentBody);
  const el = orbitalElements(rocket.pos, rocket.vel, parent);
  if (!el.closed || !Number.isFinite(el.period) || el.period <= 0) {
    return;
  }
  const safeDt = (el.period / 1000) * c.maxSubsteps;
  let idx = timeWarpSteps.length - 1;
  while (idx > 0 && timeWarpSteps[idx] / frameRate() > safeDt) {
    idx--;
  }
  if (c.timewarp > timeWarpSteps[idx]) {
    c.timewarp = timeWarpSteps[idx];
  }
  timeWarpCounter = Math.min(timeWarpCounter, idx);
}

function dockPlan(ship, other) {
  if (!ship || !other || ship === other) {
    return null;
  }
  const distance = Math.hypot(
    other.pos.x - ship.pos.x,
    other.pos.y - ship.pos.y,
  );

  if (ship.parentBody !== other.parentBody) {
    if (distance < 50000) {
      return { mode: "approach", distance, ...rendezvousPlan(ship, other) };
    }
    return { mode: "different-orbit", distance };
  }

  const parent = getBody(ship.parentBody);
  const el1 = orbitalElements(ship.pos, ship.vel, parent);
  if (el1.closed && distance < Math.max(50000, el1.r * 0.05)) {
    return { mode: "approach", distance, ...rendezvousPlan(ship, other) };
  }

  const node = activeNode(ship);
  if (!node) {
    return { mode: "different-orbit", distance };
  }
  const seconds = node.t - t;
  const burnAng = el1.angle + el1.w * Math.max(seconds, 0);
  return {
    mode: node.label,
    distance,
    parent,
    seconds,
    dv: node.dv,
    r: node.r,
    burnAng,
    burn: {
      x: parent.pos.x + Math.cos(burnAng) * node.r,
      y: parent.pos.y + Math.sin(burnAng) * node.r,
    },
  };
}

function drawDockPlan(ship, mapX, mapY) {
  const other =
    rendezvousTarget &&
    rockets.find((rocket) => rocket.id === rendezvousTarget);
  if (!other) {
    return;
  }
  const plan = dockPlan(ship, other);
  if (!plan) {
    return;
  }
  const sx = mapX(ship.pos);
  const sy = mapY(ship.pos);
  const ox = mapX(other.pos);
  const oy = mapY(other.pos);
  stroke("#5ccfffaa");
  strokeWeight(1);
  line(sx, sy, ox, oy);
  noStroke();
  fill("#5ccfff");
  textAlign(LEFT, BOTTOM);
  textSize(12);

  if (plan.mode === "different-orbit") {
    text(
      `⇢ ${other.id}  no rendezvous plan, match altitude and SOI first`,
      (sx + ox) / 2 + 8,
      (sy + oy) / 2 - 6,
    );
    return;
  }

  if (plan.mode === "approach") {
    text(
      `⇢ ${other.id}  close Δv ${format("speed", plan.closeDv)}  ${(plan.distance / 1000).toFixed(1)} km`,
      (sx + ox) / 2 + 8,
      (sy + oy) / 2 - 12,
    );
    text(
      `match Δv ${format("speed", plan.matchDv)}`,
      (sx + ox) / 2 + 8,
      (sy + oy) / 2 - 0,
    );
    return;
  }

  const bx = mapX(plan.burn);
  const by = mapY(plan.burn);
  fill("#5ccfff");
  circle(bx, by, 8);
  const when = plan.seconds <= 1 ? "now" : `in ${formatTime(plan.seconds)}`;
  text(
    `⇢ ${other.id}  ${plan.mode} Δv ${format("speed", Math.abs(plan.dv))}  ${when}`,
    bx + 8,
    by - 6,
  );
  text(`${(plan.distance / 1000).toFixed(1)} km apart`, bx + 8, by + 14);
}
