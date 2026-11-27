// off the right edge, only half showing, while assets are still loading
function loadingEarthGeom() {
  const r = Math.min(width, height) * 0.58;
  return { x: width - r * 0.35, y: height / 2, r };
}

// bigger and off the left edge instead, once Play has been pressed
function menuEarthGeom() {
  const r = Math.min(width, height) * 0.75;
  return { x: -r * 0.1, y: height / 2, r };
}

let introEarth = null;

function drawIntroEarth(geom) {
  let img;

  if (rng >= 30) {
    img = textures.Earth;
  } else if (rng >= 5) {
    img = textures.Mars;
  } else if (rng >= 2) {
    img = textures.Jupiter;
  } else if (rng == 1) {
    img = textures.Sun;
  }
  if (!img) {
    return;
  }
  push();

  let glowRGB = "125,180,255";
  let tintRGB = "125,180,255";
  let tintA = 0.8;
  if (img == textures.Mars) {
    glowRGB = "255,140,90";
    tintRGB = "255,100,60";
    tintA = 0.56;
  } else if (img == textures.Jupiter) {
    glowRGB = "235,200,150";
    tintRGB = "230,180,120";
    tintA = 0.56;
  } else if (img == textures.Sun) {
    glowRGB = "255,210,90";
    tintRGB = "255,190,60";
    tintA = 0.56;
  }

  const atmoR = geom.r * 1.1;
  const glow = drawingContext.createRadialGradient(
    geom.x,
    geom.y,
    geom.r * 0.9,
    geom.x,
    geom.y,
    atmoR,
  );
  glow.addColorStop(0, `rgba(${glowRGB},0.55)`);
  glow.addColorStop(1, `rgba(${glowRGB},0)`);
  drawingContext.save();
  drawingContext.fillStyle = glow;
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, atmoR, 0, TWO_PI);
  drawingContext.fill();
  drawingContext.restore();

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, geom.r, 0, TWO_PI);
  drawingContext.clip();
  imageMode(CENTER);
  image(img, geom.x, geom.y, geom.r * 2, geom.r * 2);
  let clouds = textures.EarthClouds;
  if (img == textures.Mars) {
    clouds = textures.Jupiter;
    // overlayed jupiter looks like faint clouds
    // pretty neat right?
  } else if (img != textures.Earth) {
    clouds = null;
  }
  if (clouds) {
    blendMode(SCREEN);
    drawingContext.globalAlpha = c.cloudMax;
    push();
    translate(geom.x, geom.y);
    rotate(millis() / 8000);
    image(clouds, 0, 0, geom.r * 2 * c.cloudScale, geom.r * 2 * c.cloudScale);
    pop();
    drawingContext.globalAlpha = 1;
    blendMode(BLEND);
  }
  if (img == textures.Earth) {
    const haze = drawingContext.createRadialGradient(
      geom.x,
      geom.y,
      0,
      geom.x,
      geom.y,
      geom.r,
    );
    haze.addColorStop(0, `rgba(${tintRGB},0.05)`);
    haze.addColorStop(1, `rgba(${tintRGB},${tintA})`);
    drawingContext.fillStyle = haze;
  } else {
    drawingContext.fillStyle = `rgba(${tintRGB},${tintA})`;
  }
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, geom.r, 0, TWO_PI);
  drawingContext.fill();
  drawingContext.restore();
  pop();
}

function drawBootScreen(progress, opts = {}) {
  const barW = min(width * 0.4, 420);
  const barH = 10;
  const x = (width - barW) / 2;
  const y = height * 0.82;
  background(0);
  drawIntroEarth(loadingEarthGeom());
  noStroke();
  textAlign(CENTER, CENTER);
  fill(170);
  textSize(15);
  text(opts.label || formatBytes(assetBytesLoaded()), width / 2, y - 28);
  fill(38);
  rect(x, y, barW, barH, barH / 2);
  fill(opts.color || "#3a7bd5");
  rect(x, y, barW * constrain(progress, 0, 1), barH, barH / 2);
  eProgress = progress;
  fill(85);
  textSize(13);
  text(credits, width / 2, height - 44);
  if (bootloaderOn) {
    push();
    textSize(16);
    fill(110);
    textAlign(CENTER, BOTTOM);
    text("Press DEL to enter the boot manager", width / 2, height - 12);
    pop();
  }
}

function playButtonRect() {
  const sx = 200;
  const sy = 60;
  return { x: width * 0.08, y: height * 0.55, sx, sy };
}

async function waitForPlay() {
  let wasPressed = mouseIsPressed;
  for (;;) {
    background(0);
    drawIntroEarth(loadingEarthGeom());
    noStroke();
    textAlign(LEFT, CENTER);
    fill("White");
    textSize(90);
    text("WebOrbit", width * 0.08, height * 0.32);
    GUIAPI.buttons = [];
    GUIAPI.blockers = [];
    GUIAPI.order = 0;
    const btn = playButtonRect();
    textSize(22);
    GUIAPI.button(
      btn.x,
      btn.y,
      btn.sx,
      btn.sy,
      { id: "intro-play", ...menuStyle },
      "Play",
    );
    fill(85);
    textSize(13);
    textAlign(CENTER, CENTER);
    text(credits, width / 2, height - 44);
    if (mouseIsPressed && !wasPressed && GUIAPI.clicked("intro-play")) {
      break;
    }
    wasPressed = mouseIsPressed;
    await nextFrame();
  }
}

// a plain lerp from where it was loading to where the menu keeps it, no easing
async function runEarthTransition() {
  const from = loadingEarthGeom();
  const to = menuEarthGeom();
  const duration = 900;
  const start = performance.now();
  for (;;) {
    const p = constrain((performance.now() - start) / duration, 0, 1);
    introEarth = {
      x: lerp(from.x, to.x, p),
      y: lerp(from.y, to.y, p),
      r: lerp(from.r, to.r, p),
    };
    background(0);
    drawIntroEarth(introEarth);
    if (p >= 1) {
      break;
    }
    await nextFrame();
  }
}
