function reentryGlowColor(tempC) {
  const stops = [
    [800, [255, 40, 0]],
    [1300, [255, 140, 0]],
    [1600, [255, 220, 60]],
    [1900, [255, 255, 255]],
  ];
  if (tempC <= stops[0][0]) {
    return `rgb(${stops[0][1].join(",")})`;
  }
  for (let i = 1; i < stops.length; i++) {
    if (tempC <= stops[i][0]) {
      const f = (tempC - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      const mix = stops[i - 1][1].map((v, ch) =>
        Math.round(v + (stops[i][1][ch] - v) * f),
      );
      return `rgb(${mix.join(",")})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(",")})`;
}

function drawReentryGlow(rocket, s) {
  if (rocket.temp === undefined) {
    return;
  }
  const tempC = rocket.temp - 273.15;
  const alpha = constrain((tempC - 800) / 700, 0, 1);
  if (alpha <= 0) {
    return;
  }
  const flamePart = hiddenPart("_flame");
  if (!flamePart) {
    return;
  }
  let minX = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const entry of rocket.stack.parts) {
    const bb = partBBox(entry.part);
    minX = Math.min(minX, entry.ox - bb.w / 2);
    maxX = Math.max(maxX, entry.ox + bb.w / 2);
    maxY = Math.max(maxY, entry.oy + (bb.maxY - bb.cy));
  }
  const flameBB = partBBox(flamePart);
  const wide = ((maxX - minX) / flameBB.w) * 1.3;
  const tall = wide * 0.8;
  const cx = (minX + maxX) / 2;
  const flameY = maxY + (flameBB.maxY - flameBB.cy) * tall * 0.6;
  drawPart(flamePart, cx * s, flameY * s, s, {
    wide,
    tall: -tall,
    alpha,
    recolor: reentryGlowColor(Math.round(tempC / 25) * 25),
  });
}

const surfaceProps = [
  {
    part: "_vab",
    body: "Earth",
    angle: c.launchPadRotation,
    x: -120000,
    y: -225,
    solid: true,
    scaleX: 10,
    scaleY: 10,
    collideY: 0.8,
  },
  {
    part: "_flag",
    body: "Earth",
    angle: c.launchPadRotation,
    x: -120000,
    y: 76500,
    solid: true,
    scaleX: 10,
    scaleY: 10,
    collideY: 0.8,
  },
  {
    part: "_launchtower",
    body: "Earth",
    angle: c.launchPadRotation,
    x: -33000,
    y: -225,
    solid: true,
    scaleX: 4,
    scaleY: 4,
    collideX: 0.35,
    collideY: 0.85,
  },
  {
    part: "_launchpad",
    body: "Earth",
    angle: c.launchPadRotation,
    x: -3000,
    y: -225,
    solid: true,
    scaleX: 3,
    scaleY: 3,
    collideY: 0.193,
    collideX: 0.95,
  },
  {
    part: "_monolith",
    body: "Earth",
    angle: 120,
    x: 0,
    y: -22500,
    solid: false,
  },
];

// topmost solid point of the part at each column across it, measured up from
// the bottom edge that rests on the ground
function propProfile(part) {
  if (part._profile) {
    return part._profile;
  }
  const bb = partBBox(part);
  const columns = constrain(Math.round(bb.w / c.partUnits), 16, 1024);
  const step = bb.w / columns;
  const heights = new Array(columns).fill(0);
  for (let i = 0; i < columns; i++) {
    const x = bb.minX + (i + 0.5) * step;
    let top = Infinity;
    for (const group of part.groups) {
      if (group.cutout) {
        continue;
      }
      const points = group.points;
      for (let j = 0; j < points.length; j++) {
        const [x1, y1] = points[j];
        const [x2, y2] = points[(j + 1) % points.length];
        if ((x1 <= x && x2 > x) || (x2 <= x && x1 > x)) {
          top = Math.min(top, y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
        }
      }
    }
    heights[i] = top === Infinity ? 0 : bb.maxY - top;
  }
  part._profile = { heights, step, minX: bb.minX };
  return part._profile;
}

function propScales(prop) {
  const scaleX = prop.scaleX === undefined ? 1 : prop.scaleX;
  const scaleY = prop.scaleY === undefined ? 1 : prop.scaleY;
  return {
    scaleX,
    scaleY,
    collideX: prop.collideX === undefined ? scaleX : prop.collideX,
    collideY: prop.collideY === undefined ? scaleY : prop.collideY,
  };
}

function propPlacement(prop) {
  const part = hiddenPart(prop.part);
  const body = getBody(prop.body);
  if (!part || !body) {
    return null;
  }
  const bb = partBBox(part);
  const scales = propScales(prop);
  const a = radians(prop.angle || 0);
  const out = { x: Math.sin(a), y: -Math.cos(a) };
  const side = (prop.x || 0) / c.partUnits;
  const lift = (prop.y || 0) / c.partUnits;
  const stand = body.size + (bb.h * scales.scaleY) / 2 / c.partUnits + lift;
  return {
    part,
    body,
    bb,
    scales,
    angle: a,
    x: body.pos.x + out.x * stand + Math.cos(a) * side,
    y: body.pos.y + out.y * stand + Math.sin(a) * side,
    base: body.size + lift,
    bearing: a + side / body.size,
  };
}

function bearingOf(dx, dy) {
  return Math.atan2(dx, -dy);
}

function propContact(body, rocket, dx, dy, r) {
  const bottom = r - rocketRadius(rocket);
  const bearing = bearingOf(dx, dy);
  for (const prop of surfaceProps) {
    if (!prop.solid || prop.body !== body.id) {
      continue;
    }
    const place = propPlacement(prop);
    if (!place) {
      continue;
    }
    const profile = propProfile(place.part);
    const { collideX, collideY } = place.scales;
    const delta = bearing - place.bearing;
    const along =
      Math.atan2(Math.sin(delta), Math.cos(delta)) * body.size * c.partUnits;
    const column = Math.floor(
      (along - profile.minX * collideX) / (profile.step * collideX),
    );
    if (
      column < 0 ||
      column >= profile.heights.length ||
      profile.heights[column] <= 0
    ) {
      continue;
    }
    const top = place.base + (profile.heights[column] * collideY) / c.partUnits;
    if (bottom >= top) {
      continue;
    }
    const clear = ((bottom - place.base) * c.partUnits) / collideY;
    let left = column;
    let right = column;
    while (left >= 0 && profile.heights[left] > clear) {
      left--;
    }
    while (right < profile.heights.length && profile.heights[right] > clear) {
      right++;
    }
    const stepWorld = (profile.step * collideX) / c.partUnits;
    const leftDist = left < 0 ? Infinity : (column - left + 1) * stepWorld;
    const rightDist =
      right >= profile.heights.length
        ? Infinity
        : (right - column + 1) * stepWorld;
    const sideDist = Math.min(leftDist, rightDist);
    if (sideDist < top - bottom) {
      return {
        mode: "side",
        dist: sideDist,
        dir: leftDist <= rightDist ? -1 : 1,
      };
    }
    return { mode: "up", top };
  }
  return null;
}

function surfaceRadiusAt(body, dx, dy) {
  let radius = body.size;
  const bearing = bearingOf(dx, dy);
  for (const prop of surfaceProps) {
    if (!prop.solid || prop.body !== body.id) {
      continue;
    }
    const place = propPlacement(prop);
    if (!place) {
      continue;
    }
    const delta = bearing - place.bearing;
    const along =
      Math.atan2(Math.sin(delta), Math.cos(delta)) * body.size * c.partUnits;
    const profile = propProfile(place.part);
    const { collideX, collideY } = place.scales;
    const column = Math.floor(
      (along - profile.minX * collideX) / (profile.step * collideX),
    );
    if (column < 0 || column >= profile.heights.length) {
      continue;
    }
    const height = profile.heights[column] * collideY;
    if (height > 0) {
      radius = Math.max(radius, place.base + height / c.partUnits);
    }
  }
  return radius;
}

// sticks a flag in the ground where the astronaut stands
function plantFlag(rocket) {
  if (!rocket?.landed) {
    return;
  }
  surfaceProps.push({
    part: "_flag",
    body: rocket.parentBody,
    angle: (landedUpAngle(rocket) * 180) / Math.PI,
    x: 0,
    y: 0,
    scaleX: 0.5,
    scaleY: 0.5,
    solid: false,
    planted: true,
    country: playerCountry,
  });
}

function plantedFlagSaves() {
  return surfaceProps
    .filter((p) => p.planted)
    .map((p) => ({ body: p.body, angle: p.angle, country: p.country }));
}

function restorePlantedFlags(list) {
  for (let i = surfaceProps.length - 1; i >= 0; i--) {
    if (surfaceProps[i].planted) {
      surfaceProps.splice(i, 1);
    }
  }
  for (const f of Array.isArray(list) ? list : []) {
    surfaceProps.push({
      part: "_flag",
      body: f.body,
      angle: f.angle,
      x: 0,
      y: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      solid: false,
      planted: true,
      country: f.country,
    });
  }
}

function drawProps(cur) {
  const s = scale / c.partUnits;
  for (const prop of surfaceProps) {
    const place = propPlacement(prop);
    if (!place || place.bb.h * place.scales.scaleY * s < 2) {
      continue;
    }
    const screenX = width / 2 + (place.x - cur.pos.x) * scale;
    const screenY = height / 2 + (place.y - cur.pos.y) * scale;
    const reach =
      Math.max(
        place.bb.w * place.scales.scaleX,
        place.bb.h * place.scales.scaleY,
      ) * s;
    if (
      screenX < -reach ||
      screenX > width + reach ||
      screenY < -reach ||
      screenY > height + reach
    ) {
      continue;
    }
    push();
    translate(screenX, screenY);
    rotate(place.angle);
    drawFlagCountry = prop.country || null;
    drawPart(place.part, 0, 0, s, {
      wide: place.scales.scaleX,
      tall: place.scales.scaleY,
    });
    drawFlagCountry = null;
    pop();
  }
}

function walkEntities(value, found) {
  if (!value || typeof value !== "object") {
    return;
  }
  if (typeof value.type === "string" && "group" in value) {
    found.push(value);
    return;
  }
  for (const v of Object.values(value)) {
    walkEntities(v, found);
  }
}

function entityValues(modules) {
  const found = [];
  for (const value of Object.values(modules || {})) {
    walkEntities(value, found);
  }
  return found;
}

function partGroupCenter(part, index) {
  const sets = partSets(part);
  if (sets.tagged) {
    return sets.centres.get(index) || null;
  }
  const group = (part.groups || [])[index];
  if (!group) {
    return null;
  }
  const xs = group.points.map((p) => p[0]);
  const ys = group.points.map((p) => p[1]);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

function drawEntities(entry, s) {
  for (const entity of entityValues(entry.part.modules)) {
    const target = hiddenPart(entity.type);
    if (!target || entity.group == null) {
      continue;
    }
    const anchor = partGroupCenter(entry.part, entity.group);
    if (!anchor) {
      continue;
    }
    const ra = (entry.rot || 0) * HALF_PI;
    const lx = anchor.x + (entity.offsetX || 0);
    const ly = anchor.y + (entity.offsetY || 0);
    const wx = entry.ox + lx * Math.cos(ra) - ly * Math.sin(ra);
    const wy = entry.oy + lx * Math.sin(ra) + ly * Math.cos(ra);
    push();
    translate(wx * s, wy * s);
    rotate(ra + radians(entity.rotation || 0));
    drawPart(target, 0, 0, s, {
      wide: entity.sizeX ?? 1,
      tall: entity.sizeY ?? 1,
    });
    pop();
  }
}

function drawRocket(rocket, cur) {
  if (!rocket.stack) {
    return;
  }
  const screenX = width / 2 + (rocket.pos.x - cur.pos.x) * scale;
  const screenY = height / 2 + (rocket.pos.y - cur.pos.y) * scale;
  const s = scale / c.partUnits;

  if (
    screenX < -width ||
    screenX > width * 2 ||
    screenY < -height ||
    screenY > height * 2
  ) {
    return;
  }

  if (rocket.stack.h * s < 4) {
    noStroke();
    fill("#fff");
    circle(screenX, screenY, 4);
    return;
  }

  // spun about the middle of the stack, which is the point pos tracks. rotate()
  // is safe here, unlike scale(), which the global `scale` shadows
  push();
  translate(screenX, screenY);
  rotate(rocket.angle);
  drawReentryGlow(rocket, s);
  const rcsFiring = rcsOutput(rocket).firing;
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
      fx: entry.fx,
      rot: entry.rot,
      layer: "back",
      paint: entry.paint,
    });
    drawEntities(entry, s);
    const engine = entry.part.modules["Engine Module"];
    let hasFuel = false;
    if (engine) {
      const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
      hasFuel = engineResources(engine).every((p) => {
        const feed = feedTanks(rocket.stack, i, p.resource);
        return (
          feed.length > 0 && (direction < 0 || feedHeld(feed, p.resource) > 0)
        );
      });
    }
    if (engine && hasFuel && entry.on && throttle > 0) {
      const flamePart = hiddenPart(engine.Flame || "_flame");
      if (flamePart) {
        const bb = partBBox(entry.part);
        const flameBB = partBBox(flamePart);

        const raw = Number(engine["Flame Scale"]);
        const flameScale = Number.isFinite(raw) ? raw : 1;

        const fx = entry.flame && entry.flame.fx;
        const squish =
          (fx && fx.part && fx.part.Height) === undefined ? 1 : fx.part.Height;
        const off =
          bb.maxY - bb.cy + (flameBB.maxY - flameBB.cy) * flameScale * squish;
        const ra = (entry.rot || 0) * HALF_PI;
        drawPart(
          flamePart,
          (entry.ox - off * Math.sin(ra)) * s,
          (entry.oy + off * Math.cos(ra)) * s,
          s * flameScale,
          { fx, rot: entry.rot },
        );
      }
    }
    const rcsMod = entry.part.modules["RCS Module"];
    if (rcsMod && rcsFiring.has(entry)) {
      const flamePart = hiddenPart(rcsMod.Flame || "_flame");
      if (flamePart) {
        const bb = partBBox(entry.part);
        const touched = touchHeldCodes();
        const down = (code) => held.has(code) || touched.has(code);
        const dirs = rcsMod["Thruster Directions"] || [];
        const nozzles = [
          { key: "KeyI", dir: "Top", dx: 0, dy: bb.maxY - bb.cy, quarter: 0 },
          {
            key: "KeyK",
            dir: "Bottom",
            dx: 0,
            dy: bb.minY - bb.cy,
            quarter: 2,
          },
          { key: "KeyJ", dir: "Left", dx: bb.maxX - bb.cx, dy: 0, quarter: 1 },
          { key: "KeyL", dir: "Right", dx: bb.minX - bb.cx, dy: 0, quarter: 3 },
        ];
        const rcsScale = 0.16;
        const ra = (entry.rot || 0) * HALF_PI;
        for (const n of nozzles) {
          if (!dirs.includes(n.dir) || !down(n.key)) {
            continue;
          }
          const rx = n.dx * Math.cos(ra) - n.dy * Math.sin(ra);
          const ry = n.dx * Math.sin(ra) + n.dy * Math.cos(ra);
          drawPart(
            flamePart,
            (entry.ox + rx) * s,
            (entry.oy + ry) * s,
            s * rcsScale,
            { rot: ((entry.rot || 0) + n.quarter) % 4 },
          );
        }
      }
    }
    const chute = entry.part.modules["Parachute Module"];
    if (chute && entry.deployed) {
      const chutePart = hiddenPart("_parachute");
      if (chutePart) {
        const bb = partBBox(entry.part);
        const chuteBB = partBBox(chutePart);
        const ratio = Math.max((chute.Drag || 0) / c.chuteDrag, 1e-4);
        const wide = Math.pow(ratio, c.chuteWidthPower);
        const tall = Math.pow(ratio, c.chuteHeightPower);
        const off = bb.minY - bb.cy - (chuteBB.maxY - chuteBB.cy) * tall;
        const ra = (entry.rot || 0) * HALF_PI;
        drawPart(
          chutePart,
          (entry.ox - off * Math.sin(ra)) * s,
          (entry.oy + off * Math.cos(ra)) * s,
          s,
          {
            wide,
            tall,
            alpha: entry.torn ? 0.35 : undefined,
            rot: entry.rot,
          },
        );
      }
    }
  }
  for (const entry of rocket.stack.parts) {
    drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
      fx: entry.fx,
      rot: entry.rot,
      layer: "front",
      paint: entry.paint,
    });
  }
  for (const entry of rocket.stack.parts) {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    if (!shield) {
      continue;
    }
    const glow = heatShieldGlow(entry, shield);
    if (glow) {
      drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
        rot: entry.rot,
        recolor: glow.color,
        alpha: glow.alpha,
      });
    }
  }
  for (const entry of rocket.stack.parts) {
    const tint = partHeatTint(entry);
    if (tint) {
      drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
        rot: entry.rot,
        recolor: "#ff0000",
        alpha: tint,
      });
    }
  }
  pop();
}

function partHeatTint(entry) {
  const tempC = (entry.temp ?? 0) - 273.15;
  return constrain(tempC / 1200, 0, 1);
}

function heatShieldGlow(entry, shield) {
  const held = (shield["Ablation Temperature"] ?? 1000) - 273.15;
  const tempC = (entry.surface ?? entry.temp ?? 0) - 273.15;
  const f = constrain(tempC / held, 0, 1.2);
  if (f <= 0.15) {
    return null;
  }
  const glowUp = constrain((f - 0.15) / 0.85, 0, 1);
  const color = [
    255,
    Math.round(60 + 160 * glowUp),
    Math.round(220 * Math.max(0, glowUp - 0.5) * 2),
  ];
  return { color: `rgb(${color.join(",")})`, alpha: Math.min(0.85, glowUp) };
}

function formatTime(t) {
  const s = Math.floor(t % 60);
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor((t / 3600) % 24);
  const d = Math.floor((t / 86400) % 365);
  const y = Math.floor((t / 31536000) % 1000000);
  const mil = Math.floor(t / 31536000000000);

  if (t < 60) return `${Math.round(t * 100) / 100}s`;
  if (t < 3600) return `${m}m ${s}s`;
  if (t < 86400) return `${h}h ${m}m ${s}s`;
  if (t < 31536000) return `${d}d ${h}h ${m}m ${s}s`;
  if (t < 31536000000000) return `${y}y ${d}d ${h}h ${m}m ${s}s`;
  return `${mil}myr ${y}y ${d}d ${h}h ${m}m ${s}s`;
}

function calculateAblator() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const shields = rocket.stack
    ? rocket.stack.parts.filter((entry) => entry.ablatorMax > 0)
    : [];
  const max = shields.reduce((sum, entry) => sum + entry.ablatorMax, 0);
  if (!max) {
    return "none";
  }
  return `${Math.round((shields.reduce((sum, entry) => sum + entry.ablator, 0) / max) * 100)}%`;
}

function calculateRocketTemp() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  return format("temperature", rocket.temp ?? ambientTemperature(rocket));
}
