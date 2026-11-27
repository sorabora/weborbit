function glowStops(body) {
  if (body.glowStops) {
    return body.glowStops;
  }
  const img = textures[body.glowTexture];
  img.loadPixels();
  const middle = floor(img.width / 2);
  const stops = [];
  for (let i = 0; i < c.glowSteps; i++) {
    const p = i / (c.glowSteps - 1);
    const row = round((1 - p) * (img.height - 1));
    const o = 4 * (row * img.width + middle);
    const alpha = (img.pixels[o + 3] / 255) * c.glowMax;
    stops.push([
      p,
      `rgba(${img.pixels[o]}, ${img.pixels[o + 1]}, ${img.pixels[o + 2]}, ${alpha})`,
    ]);
  }
  body.glowStops = stops;
  return stops;
}

function updateCamera(rocket) {
  if (rocket) {
    const parent = getBody(rocket.parentBody);
    camera.parentBody = rocket.parentBody;
    camera.off.x = rocket.pos.x - parent.pos.x;
    camera.off.y = rocket.pos.y - parent.pos.y;
  }
  const body = getBody(camera.parentBody);
  camera.pos.x = body.pos.x + camera.off.x;
  camera.pos.y = body.pos.y + camera.off.y;
  camera.angle =
    -HALF_PI - Math.atan2(camera.pos.y - body.pos.y, camera.pos.x - body.pos.x);
}

function unrotate(mx, my) {
  const a = -camera.angle;
  const dx = mx - width / 2;
  const dy = my - height / 2;
  return {
    x: width / 2 + dx * Math.cos(a) - dy * Math.sin(a),
    y: height / 2 + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

function viewReach() {
  return Math.hypot(width, height) / 2;
}

function cssColor(col) {
  return `rgba(${red(col)}, ${green(col)}, ${blue(col)}, ${alpha(col) / 255})`;
}

function drawTextureSlice(img, cx, cy, radius) {
  const left = cx - radius;
  const top = cy - radius;
  const span = radius * 2;
  const reach = viewReach();
  const x0 = Math.max(left, width / 2 - reach);
  const y0 = Math.max(top, height / 2 - reach);
  const x1 = Math.min(cx + radius, width / 2 + reach);
  const y1 = Math.min(cy + radius, height / 2 + reach);
  if (x1 <= x0 || y1 <= y0) {
    return;
  }
  const source = img.canvas || img.elt || null;
  if (!source) {
    image(img, cx, cy, span, span);
    return;
  }
  const sx = ((x0 - left) / span) * img.width;
  const sy = ((y0 - top) / span) * img.height;
  const sw = ((x1 - x0) / span) * img.width;
  const sh = ((y1 - y0) / span) * img.height;
  drawingContext.drawImage(source, sx, sy, sw, sh, x0, y0, x1 - x0, y1 - y0);
}

function traceDisc(ctx, cx, cy, r) {
  ctx.beginPath();
  if (r < 1e6) {
    ctx.arc(cx, cy, r, 0, TWO_PI);
    return;
  }
  const dx = width / 2 - cx;
  const dy = height / 2 - cy;
  const dist = Math.hypot(dx, dy);
  const nx = dx / dist;
  const ny = dy / dist;
  const gap = dist - r;
  const qx = width / 2 - nx * gap;
  const qy = height / 2 - ny * gap;
  const reach = Math.hypot(width, height);
  const depth = Math.max(-gap, 0) + reach * 2;
  const steps = 24;
  const at = (u) => {
    const sag = (u * u) / (r + Math.sqrt(Math.max(r * r - u * u, 0)));
    return { x: qx - ny * u - nx * sag, y: qy + nx * u - ny * sag };
  };
  const first = at(-reach);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i <= steps; i++) {
    const p = at(-reach + (2 * reach * i) / steps);
    ctx.lineTo(p.x, p.y);
  }
  const last = at(reach);
  ctx.lineTo(last.x - nx * depth, last.y - ny * depth);
  ctx.lineTo(first.x - nx * depth, first.y - ny * depth);
  ctx.closePath();
}

function drawBody(body, rocket) {
  const screenX = width / 2 + (body.pos.x - rocket.pos.x) * scale;
  const screenY = height / 2 + (body.pos.y - rocket.pos.y) * scale;
  const surfaceRadius = body.size * scale;
  const atmosphereHeight = body.atmosphereHeight || 0;
  const atmoRadius = (body.size + atmosphereHeight) * scale;

  const glowRadius = body.glow ? (body.size + body.glow) * scale : 0;

  const reach = max(atmoRadius, glowRadius) + Math.hypot(width, height) / 2;
  if (Math.hypot(screenX - width / 2, screenY - height / 2) > reach) {
    return;
  }

  if (glowRadius > surfaceRadius && textures[body.glowTexture]) {
    const gradient = drawingContext.createRadialGradient(
      screenX,
      screenY,
      surfaceRadius,
      screenX,
      screenY,
      glowRadius,
    );
    for (const stop of glowStops(body)) {
      gradient.addColorStop(stop[0], stop[1]);
    }
    drawingContext.save();
    drawingContext.fillStyle = gradient;
    drawingContext.beginPath();
    drawingContext.arc(screenX, screenY, glowRadius, 0, TWO_PI);
    drawingContext.fill();
    drawingContext.restore();
  }

  if (atmosphereHeight > 0) {
    const sky = drawingContext.createRadialGradient(
      screenX,
      screenY,
      Math.max(surfaceRadius, 0),
      screenX,
      screenY,
      Math.max(atmoRadius, 1),
    );
    const surfaceSky = bodyColor(body, "skyColor", skySurface);
    for (let i = 0; i <= c.skySteps; i++) {
      const p = i / c.skySteps;
      sky.addColorStop(p, cssColor(lerpColor(surfaceSky, skyTip, p)));
    }
    drawingContext.save();
    drawingContext.fillStyle = sky;
    drawingContext.beginPath();
    drawingContext.arc(screenX, screenY, Math.max(atmoRadius, 1), 0, TWO_PI);
    drawingContext.fill();
    drawingContext.restore();
  }

  stroke(0);
  fill(0);

  const surfaceImg = textures[body.texture];
  if (surfaceImg) {
    drawingContext.save();
    traceDisc(drawingContext, screenX, screenY, surfaceRadius);
    drawingContext.clip();
    imageMode(CENTER);
    drawTextureSlice(surfaceImg, screenX, screenY, surfaceRadius * 1.002);
    const cloudImg = textures[body.cloudTexture];
    if (cloudImg) {
      const cloudRadius = surfaceRadius * c.cloudScale;
      blendMode(SCREEN);
      drawingContext.globalAlpha = c.cloudMax;
      push();
      translate(screenX, screenY);
      rotate(TWO_PI * (t / c.cloudPeriod));
      image(cloudImg, 0, 0, cloudRadius * 2, cloudRadius * 2);
      pop();
      drawingContext.globalAlpha = 1;
      blendMode(BLEND);
    }
    drawingContext.restore();
  } else {
    fill(body.fallbackColor || "Green");
    traceDisc(drawingContext, screenX, screenY, surfaceRadius);
    drawingContext.fill();
    drawingContext.stroke();
  }

  const discTint =
    atmosphereHeight > 0
      ? bodyColor(body, "hazeColor", hazeColor)
      : glowRadius > 0
        ? bodyColor(body, "glowColor", null)
        : null;
  if (discTint) {
    const apparentSize = surfaceRadius / height;
    const haze = constrain(
      map(log(apparentSize), log(c.hazeFarSize), log(c.hazeNearSize), 1, 0),
      0,
      1,
    );
    if (haze > 0) {
      noStroke();
      const hazeMax = body.hazeMax !== undefined ? body.hazeMax : c.hazeMax;
      const peakAlpha = hazeMax * haze;
      if (body.id === "Earth") {
        const rgb = `${red(discTint)},${green(discTint)},${blue(discTint)}`;
        const grad = drawingContext.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          surfaceRadius,
        );
        grad.addColorStop(0, `rgba(${rgb},${peakAlpha * 0.1})`);
        grad.addColorStop(1, `rgba(${rgb},${peakAlpha})`);
        drawingContext.fillStyle = grad;
        drawingContext.beginPath();
        drawingContext.arc(screenX, screenY, surfaceRadius, 0, TWO_PI);
        drawingContext.fill();
      } else {
        discTint.setAlpha(255 * peakAlpha);
        fill(discTint);
        circle(screenX, screenY, surfaceRadius * 2);
      }
      stroke(0);
    }
  }
}

function calculateTWR() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const thrust = engineOutput(rocket).thrust;
  const weight = rocket.mass * body.surfaceGravity;
  if (weight === 0) {
    return "n/a";
  }
  return (thrust / weight).toFixed(2);
}
