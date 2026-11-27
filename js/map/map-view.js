function drawMap() {
  background("#05060a");
  const ship = flyingRocket();
  const anchor = ship ? ship.pos : camera.pos;
  const cx = anchor.x + mapPan.x;
  const cy = anchor.y + mapPan.y;
  const mapX = (p) => width / 2 + (p.x - cx) * mapScale;
  const mapY = (p) => height / 2 + (p.y - cy) * mapScale;

  noFill();
  stroke("#ffffff33");
  strokeWeight(1);
  for (const body of planets) {
    if (!body.parentBody) {
      continue;
    }
    const e = body.orbitEccentricity || 0;
    const ring = body.orbitRadius * mapScale;
    const parent = getBody(body.parentBody);
    if (ring < width * 20) {
      // the parent is a focus of the ellipse, not its centre
      ellipse(
        mapX(parent.pos) - ring * e,
        mapY(parent.pos),
        ring * 2,
        ring * 2 * Math.sqrt(1 - e * e),
      );
    }
  }

  for (const rocket of rockets) {
    drawRocketOrbit(rocket, mapX, mapY);
  }

  textAlign(CENTER, TOP);
  textSize(12);
  for (const body of planets) {
    const x = mapX(body.pos);
    const y = mapY(body.pos);
    const r = Math.max(body.size * mapScale, 4);
    if (x < -r || x > width + r || y < -r || y > height + r) {
      continue;
    }
    const atmo = body.atmosphereHeight || 0;
    if (atmo > 0 && r >= 6) {
      const atmoR = r + atmo * mapScale;
      const sky = drawingContext.createRadialGradient(x, y, r, x, y, Math.max(atmoR, r + 1));
      const col = bodyColor(body, "skyColor", skySurface);
      sky.addColorStop(0, cssColor(col));
      sky.addColorStop(1, cssColor(color(red(col), green(col), blue(col), 0)));
      drawingContext.save();
      drawingContext.fillStyle = sky;
      drawingContext.beginPath();
      drawingContext.arc(x, y, Math.max(atmoR, r + 1), 0, TWO_PI);
      drawingContext.fill();
      drawingContext.restore();
    }
    const img = textures[body.texture];
    if (img) {
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(x, y, r, 0, TWO_PI);
      drawingContext.clip();
      imageMode(CENTER);
      image(img, x, y, r * 2, r * 2);
      const cloudImg = textures[body.cloudTexture];
      if (cloudImg && r >= 6) {
        blendMode(SCREEN);
        drawingContext.globalAlpha = c.cloudMax;
        push();
        translate(x, y);
        rotate(TWO_PI * (t / c.cloudPeriod));
        image(cloudImg, 0, 0, r * 2 * c.cloudScale, r * 2 * c.cloudScale);
        pop();
        drawingContext.globalAlpha = 1;
        blendMode(BLEND);
      }
      drawingContext.restore();
    } else {
      noStroke();
      fill(body.fallbackColor || "#888");
      circle(x, y, r * 2);
    }
    noStroke();
    fill("#ccc");
    text(body.id, x, y + r + 4);
  }

  drawTransfer(ship, mapX, mapY);
  drawDockPlan(ship, mapX, mapY);

  for (const rocket of rockets) {
    const x = mapX(rocket.pos);
    const y = mapY(rocket.pos);
    noStroke();
    fill(
      rocket.id === target
        ? "#5ccfff"
        : rocket.id === rendezvousTarget
          ? "#ffb347"
          : "#8888aa",
    );
    if (rocket.id === target) {
      push();
      translate(x, y);
      rotate(rocket.angle - HALF_PI);
      triangle(9, 0, -6, -6, -6, 6);
      pop();
    } else {
      circle(x, y, 7);
    }
    fill("#ccc");
    text(rocket.id, x, y + 10);
  }
  textAlign(LEFT, BASELINE);

  const mb = vabButton();
  GUIAPI.button(
    mb.x,
    mb.y,
    mb.size,
    mb.size,
    {
      id: "map-fly",
      baseColor: "#1f4f8f",
      hoverColor: "#2a6ac0",
      activeColor: "#173d70",
    },
    "Fly",
  );
  let mapY2 = mb.y + mb.size + 10;
  if (mapPan.x || mapPan.y) {
    GUIAPI.button(
      mb.x,
      mapY2,
      mb.size,
      mb.size,
      {
        id: "map-recenter",
        baseColor: "#4a4a5a",
        hoverColor: "#5b5b6e",
        tooltip: ["Back to the ship"],
      },
      "◎",
    );
    GUIAPI.drawTooltip();
    mapY2 += mb.size + 10;
  }

  const burn = pendingBurnWait(ship);
  if (warpUntil !== null) {
    const wb = {
      x: width - mb.size * 2.6 - 20,
      y: mapY2,
      w: mb.size * 2.6,
      h: mb.size,
    };
    GUIAPI.button(
      wb.x,
      wb.y,
      wb.w,
      wb.h,
      {
        id: "map-warp-cancel",
        baseColor: "#7a2a2a",
        hoverColor: "#a03c3c",
        activeColor: "#5e1f1f",
      },
      `Warping… ${formatTime(Math.max(warpUntil - t, 0))}`,
    );
  } else if (burn !== null) {
    const wb = {
      x: width - mb.size * 2.6 - 20,
      y: mapY2,
      w: mb.size * 2.6,
      h: mb.size,
    };
    GUIAPI.button(
      wb.x,
      wb.y,
      wb.w,
      wb.h,
      {
        id: "map-warp-burn",
        baseColor: "#8f5a1f",
        hoverColor: "#c07a2a",
        activeColor: "#70481a",
        tooltip: [`Warp ${formatTime(burn.seconds)} to the ${burn.label}`],
      },
      `⏩ Warp to ${burn.label}`,
    );
    GUIAPI.drawTooltip();
  }
  cursor(mouseIsPressed ? "grabbing" : "grab");
}
