async function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  GUIAPI.onButton = buttonOnClick;
  rawTextSize = textSize;

  Object.defineProperty(window, "textSize", {
    configurable: true,
    enumerable: true,
    value: (size) => rawTextSize(size / 1.2),
  });
  skyTip = color("#000000");
  skySurface = color("#3a7bd5");
  hazeColor = color(c.hazeColor);

  const bootNames = Object.keys(bootTextures);
  const bootSteps = bootNames.length + 1;
  let bootDone = 0;
  let loaded = false;

  gameFont = await loadFont("assets/Font.ttf"); // DM Mono
  textFont(gameFont);

  const loadAll = (async () => {
    for (const name of bootNames) {
      textures[name] = await loadImage(bootTextures[name]);
      bootDone++;
    }
    await restoreLoadedMods();
    await loadPartTextures();
    restoreJsMods();
    bootDone++;
  })().finally(() => (loaded = true));

  let wantBoot = false;
  const onBootKey = (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      wantBoot = true;
    }
  };
  if (bootloaderOn) {
    window.addEventListener("keydown", onBootKey);
  }
  while (!loaded) {
    if (wantBoot) {
      wantBoot = false;
      await runBootloader();
    }
    drawBootScreen(bootDone / bootSteps);
    await nextFrame();
  }
  await loadAll;
  window.removeEventListener("keydown", onBootKey);
  if (wantBoot) {
    await runBootloader();
  }
  if (patchesNeedRebuild() && (await runPatchPhase())) {
    return;
  }
  runInjections();
  if (!skipPlayScreen) {
    await waitForPlay();
    await runEarthTransition();
  }
  booting = false;

  if (skipPlayScreen && prototypeCareerModeEnabled) {
    startCareer();
  }

  updateBodies();
  for (const rocket of rockets) {
    const body = getBody(rocket.parentBody);
    rocket.pos.x += body.pos.x;
    rocket.pos.y += body.pos.y;
    rocket.vel.x += body.vel.x;
    rocket.vel.y += body.vel.y;
  }
  runHook("game:ready", {});
}

async function executeLowPriority() {
  if (localStorage.getItem("weborbit-metadata") === null) {
    localStorage.setItem("weborbit-metadata", {
      firstUsed: Date.now(),
    });
  }

  featuredMods = await getData();
}
