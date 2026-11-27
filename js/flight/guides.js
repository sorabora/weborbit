function localUp(rocket, body) {
  const x = rocket.pos.x - body.pos.x;
  const y = rocket.pos.y - body.pos.y;
  const r = Math.hypot(x, y) || 1;
  return { x: x / r, y: y / r };
}

function noseVector(rocket) {
  return { x: Math.sin(rocket.angle), y: -Math.cos(rocket.angle) };
}

function currentPitch(rocket, body) {
  const up = localUp(rocket, body);
  const nose = noseVector(rocket);
  return degrees(Math.asin(constrain(nose.x * up.x + nose.y * up.y, -1, 1)));
}

function recommendedPitch(rocket, body) {
  const ceiling = body.atmosphereHeight || c.turnCeiling;
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  const p = constrain(alt / ceiling, 0, 1);
  const table = c.turnProfile;
  for (let i = 1; i < table.length; i++) {
    if (p <= table[i][0]) {
      const [p0, a0] = table[i - 1];
      const [p1, a1] = table[i];
      return a0 + ((a1 - a0) * (p - p0)) / (p1 - p0);
    }
  }
  return table[table.length - 1][1];
}

function turnSide(rocket, body) {
  const up = localUp(rocket, body);
  const nose = noseVector(rocket);
  return up.x * nose.y - up.y * nose.x < 0 ? -1 : 1;
}

function drawPitchGuide(rocket) {
  const body = getBody(rocket.parentBody);
  const aim = recommendedPitch(rocket, body);
  const up = localUp(rocket, body);
  const tilt = radians(90 - aim) * turnSide(rocket, body);
  const dir = {
    x: up.x * Math.cos(tilt) - up.y * Math.sin(tilt),
    y: up.x * Math.sin(tilt) + up.y * Math.cos(tilt),
  };
  const sx = width / 2 + (rocket.pos.x - camera.pos.x) * scale;
  const sy = height / 2 + (rocket.pos.y - camera.pos.y) * scale;
  const tipX = sx + dir.x * c.guideLength;
  const tipY = sy + dir.y * c.guideLength;

  push();
  stroke("#5cf9");
  strokeWeight(2);
  line(sx, sy, tipX, tipY);
  noStroke();
  fill("#5cf");
  circle(tipX, tipY, 6);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`${Math.round(aim)}°`, tipX + dir.x * 14, tipY + dir.y * 14);
  pop();
}

function drawBurnGuide(rocket) {
  if (!rocket.parentBody) {
    return;
  }
  const burn = pendingBurnWait(rocket);
  if (!burn || !burn.dv) {
    return;
  }
  const parent = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, parent);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed <= 0) {
    return;
  }
  const sign = Math.sign(burn.dv);
  const dir = { x: (vel.x / speed) * sign, y: (vel.y / speed) * sign };
  const perp = { x: -dir.y, y: dir.x };
  const sx = width / 2 + (rocket.pos.x - camera.pos.x) * scale;
  const sy = height / 2 + (rocket.pos.y - camera.pos.y) * scale;
  const tipX = sx + dir.x * c.guideLength;
  const tipY = sy + dir.y * c.guideLength;
  const heading = Math.atan2(dir.y, dir.x);

  push();
  stroke("#ffb347");
  strokeWeight(2);
  line(sx, sy, tipX, tipY);
  noStroke();
  fill("#ffb347");
  push();
  translate(tipX, tipY);
  rotate(heading);
  triangle(9, 0, -6, -5, -6, 5);
  pop();
  // offset perpendicular to the arrow, not further along it, so the label
  // never lands on top of the line no matter which way it's pointing
  translate(tipX + perp.x * 16, tipY + perp.y * 16);
  rotate(-camera.angle);
  textSize(12);
  textAlign(CENTER, CENTER);
  const when = burn.due ? "now" : `in ${formatTime(burn.seconds)}, warp to it`;
  text(`${burn.label} Δv ${format("speed", Math.abs(burn.dv))} ${when}`, 0, 0);
  pop();
}
