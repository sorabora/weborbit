function bodyStateAt(body, time) {
  if (!body.parentBody) {
    return {
      pos: { x: body.pos.x, y: body.pos.y },
      vel: { x: body.vel.x, y: body.vel.y },
    };
  }
  const parent = bodyStateAt(getBody(body.parentBody), time);
  const a = body.orbitRadius;
  const e = body.orbitEccentricity || 0;
  const b = a * Math.sqrt(1 - e * e);
  const mean = (body.orbitPhase || 0) + TWO_PI * (time / body.orbitPeriod);
  const E = eccentricAnomaly(mean, e);
  const rate = TWO_PI / body.orbitPeriod / (1 - e * Math.cos(E));
  return {
    pos: {
      x: parent.pos.x + a * (Math.cos(E) - e),
      y: parent.pos.y + b * Math.sin(E),
    },
    vel: {
      x: parent.vel.x - a * Math.sin(E) * rate,
      y: parent.vel.y + b * Math.cos(E) * rate,
    },
  };
}

function twoBodyStep(p, v, mu, dt) {
  const acc = (q) => {
    const r2 = q.x * q.x + q.y * q.y;
    const f = -mu / (r2 * Math.sqrt(r2));
    return { x: q.x * f, y: q.y * f };
  };
  const a1 = acc(p);
  const p2 = { x: p.x + (v.x * dt) / 2, y: p.y + (v.y * dt) / 2 };
  const v2 = { x: v.x + (a1.x * dt) / 2, y: v.y + (a1.y * dt) / 2 };
  const a2 = acc(p2);
  const p3 = { x: p.x + (v2.x * dt) / 2, y: p.y + (v2.y * dt) / 2 };
  const v3 = { x: v.x + (a2.x * dt) / 2, y: v.y + (a2.y * dt) / 2 };
  const a3 = acc(p3);
  const p4 = { x: p.x + v3.x * dt, y: p.y + v3.y * dt };
  const v4 = { x: v.x + a3.x * dt, y: v.y + a3.y * dt };
  const a4 = acc(p4);
  return {
    p: {
      x: p.x + (dt / 6) * (v.x + 2 * v2.x + 2 * v3.x + v4.x),
      y: p.y + (dt / 6) * (v.y + 2 * v2.y + 2 * v3.y + v4.y),
    },
    v: {
      x: v.x + (dt / 6) * (a1.x + 2 * a2.x + 2 * a3.x + a4.x),
      y: v.y + (dt / 6) * (a1.y + 2 * a2.y + 2 * a3.y + a4.y),
    },
  };
}

function predictTrajectory(rocket, maxSegments) {
  if (!rocket || rocket.destroyed || rocket.landed) {
    return [];
  }
  const segments = [];
  let body = getBody(rocket.parentBody);
  let time = t;
  let p = { x: rocket.pos.x - body.pos.x, y: rocket.pos.y - body.pos.y };
  let v = relativeVelocity(rocket, body);
  const maxSteps = maxSegments > 1 ? 1500 : 500;

  for (let s = 0; s < maxSegments; s++) {
    const mu = gravParam(body);
    const soi = soiRadius(body);
    const children = planets.filter((child) => child.parentBody === body.id);
    const r0 = Math.hypot(p.x, p.y);
    const speed0 = Math.hypot(v.x, v.y);
    const energy = (speed0 * speed0) / 2 - mu / r0;
    const a = -mu / (2 * energy);
    const bound = energy < 0;
    const period = bound ? TWO_PI * Math.sqrt(a ** 3 / mu) : Infinity;
    const seg = {
      origin: body.pos,
      points: [{ x: p.x, y: p.y }],
      closed: false,
      body,
      event: null,
    };
    segments.push(seg);
    let elapsed = 0;
    let next = null;

    for (let i = 0; i < maxSteps; i++) {
      const r = Math.hypot(p.x, p.y);
      const dt = 0.02 * Math.sqrt(r ** 3 / mu);
      const out = twoBodyStep(p, v, mu, dt);
      p = out.p;
      v = out.v;
      elapsed += dt;
      time += dt;
      seg.points.push({ x: p.x, y: p.y });
      const rNow = Math.hypot(p.x, p.y);
      if (rNow < body.size) {
        break;
      }
      const here = bodyStateAt(body, time);
      if (rNow > soi) {
        const parent = getBody(body.parentBody);
        const up = bodyStateAt(parent, time);
        seg.event = { type: "exit", time };
        next = {
          body: parent,
          p: { x: p.x + here.pos.x - up.pos.x, y: p.y + here.pos.y - up.pos.y },
          v: { x: v.x + here.vel.x - up.vel.x, y: v.y + here.vel.y - up.vel.y },
        };
        break;
      }
      let hit = null;
      for (const child of children) {
        const cs = bodyStateAt(child, time);
        const dx = p.x - (cs.pos.x - here.pos.x);
        const dy = p.y - (cs.pos.y - here.pos.y);
        if (Math.hypot(dx, dy) < soiRadius(child)) {
          hit = { child, cs };
          break;
        }
      }
      if (hit) {
        seg.event = { type: "enter", time, child: hit.child };
        next = {
          body: hit.child,
          p: {
            x: p.x - (hit.cs.pos.x - here.pos.x),
            y: p.y - (hit.cs.pos.y - here.pos.y),
          },
          v: {
            x: v.x - (hit.cs.vel.x - here.vel.x),
            y: v.y - (hit.cs.vel.y - here.vel.y),
          },
        };
        break;
      }
      if (bound && elapsed >= period) {
        seg.closed = true;
        break;
      }
    }
    if (!next) {
      break;
    }
    body = next.body;
    p = next.p;
    v = next.v;
  }
  return segments;
}

function drawRocketOrbit(rocket, mapX, mapY) {
  const mine = rocket.id === target;
  const segments = predictTrajectory(rocket, mine ? 4 : 1);
  const colours = mine
    ? ["#5ccfff88", "#ffb347aa", "#c58cffaa", "#7dff9faa"]
    : ["#8888aa66"];
  const labels = [];
  segments.forEach((seg, i) => {
    const ox = seg.origin.x;
    const oy = seg.origin.y;
    if (seg.points.length < 2) {
      return;
    }
    noFill();
    stroke(colours[i % colours.length]);
    strokeWeight(1);
    beginShape();
    for (const p of seg.points) {
      vertex(
        mapX({ x: ox + p.x, y: oy + p.y }),
        mapY({ x: ox + p.x, y: oy + p.y }),
      );
    }
    endShape(seg.closed ? CLOSE : undefined);
    if (i > 0 && mine) {
      const r = Math.max(seg.body.size * mapScale, 4);
      stroke(colours[i % colours.length]);
      noFill();
      circle(mapX({ x: ox, y: oy }), mapY({ x: ox, y: oy }), r * 2);
    }
    if (seg.event && mine) {
      const last = seg.points[seg.points.length - 1];
      const px = mapX({ x: ox + last.x, y: oy + last.y });
      const py = mapY({ x: ox + last.x, y: oy + last.y });
      const when = formatTime(seg.event.time - t);
      const text_ =
        seg.event.type === "enter"
          ? `${seg.event.child.id} encounter  in ${when}`
          : `leaves ${seg.body.id} SOI  in ${when}`;
      labels.push({
        px,
        py,
        text: text_,
        colour: colours[(i + 1) % colours.length],
      });
    }
  });
  if (!labels.length) {
    return;
  }
  textAlign(LEFT, BOTTOM);
  textSize(12);
  for (const l of labels) {
    noStroke();
    fill(l.colour);
    circle(l.px, l.py, 6);
    text(l.text, l.px + 8, l.py - 6);
  }
  textAlign(LEFT, BASELINE);
}
