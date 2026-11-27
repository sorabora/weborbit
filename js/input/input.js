const held = new Set();
const isMobile = forceMobileMode || matchMedia("(pointer: coarse)").matches;

function mobileFlightButtons() {
  const s = Math.min(width, height) / 7;
  const pad = s / 4;
  const y = height - s - pad;
  return [
    { code: "KeyQ", label: "◀", x: pad, y },
    { code: "KeyE", label: "▶", x: pad * 2 + s, y },
    { code: "KeyX", label: "X", x: width - (s + pad) * 2, y: y - s - pad },
    { code: "KeyZ", label: "Z", x: width - s - pad, y: y - s - pad },
    { code: "ControlLeft", label: "−", x: width - (s + pad) * 2, y },
    { code: "ShiftLeft", label: "+", x: width - s - pad, y },
  ].map((b) => ({ ...b, sx: s, sy: s }));
}

function touchHeldCodes() {
  const codes = new Set();
  if (!isMobile || inVab || inMap || inMainMenu) {
    return codes;
  }
  const points = mouseIsPressed
    ? [...touches, { x: mouseX, y: mouseY }]
    : touches;
  for (const b of mobileFlightButtons()) {
    if (
      points.some(
        (p) =>
          p.x >= b.x && p.x <= b.x + b.sx && p.y >= b.y && p.y <= b.y + b.sy,
      )
    ) {
      codes.add(b.code);
    }
  }
  return codes;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(event) {
  if (runFilter("key:pressed", true, { event }) === false) {
    return false;
  }
  if (
    keyCode === 52 &&
    (keyIsDown(CONTROL) || keyIsDown(17)) &&
    developerMode
  ) {
    consoleOpen = !consoleOpen;
    devConsole.focused = consoleOpen;
    return false;
  }
  // while the console has focus the keys are text, not flight controls
  if (consoleOpen && devConsole.focused) {
    consoleKeyPressed(event);
    return false;
  }

  if (event.code === "Space" && !inVab) {
    const rocket = rockets.find((r) => r.id === target);
    if (rocket && isAstronautRocket(rocket) && rocket.landed) {
      astronautJump(rocket);
      return false;
    }
  }

  if (event.code === "KeyL" && event.shiftKey) {
    burnLogging = !burnLogging;
    launchToast(burnLogging ? "Burn logging on." : "Burn logging off.");
    return false;
  }

  if (event.code === "KeyP" && event.shiftKey) {
    downloadBurnLog();
    return false;
  }

  if (event.code === "KeyT" && !inVab) {
    toggleSAS();
    return false;
  }

  if (
    event.code === "KeyC" &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    rocketTimelineEnabled &&
    !inVab
  ) {
    downloadRocketTimeline();
    return false;
  }

  if (inVab) {
    if (event.code === "KeyR" && vab.drag) {
      vab.drag.inst.rot = ((vab.drag.inst.rot || 0) + 1) % 4;
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyC" && vab.drag) {
      vab.clipboard = cloneParts(subtree(vab.drag.inst));
      return false;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.code === "KeyV" &&
      vab.clipboard
    ) {
      const copies = cloneParts(vab.clipboard);
      const root = copies[0];
      const dx = mouseX - root.x;
      const dy = mouseY - root.y;
      for (const p of copies) {
        p.x += dx;
        p.y += dy;
      }
      vab.parts.push(...copies);
      vab.drag = { inst: root, dx: 0, dy: 0, fromPalette: true };
      vab.snap = null;
      return false;
    }
    if ((event.code === "Delete" || event.code === "Backspace") && vab.drag) {
      const drop = new Set(subtree(vab.drag.inst));
      vab.parts = vab.parts.filter((p) => !drop.has(p));
      vab.drag = null;
      vab.snap = null;
      return false;
    }
  }

  held.add(event.code);

  if (event.code === "Comma") {
    if (timeWarpCounter > 0) {
      timeWarpCounter--;
    }
    c.timewarp = timeWarpSteps[timeWarpCounter];
  }
  if (event.code === "Period") {
    if (timeWarpCounter < timeWarpSteps.length - 1) {
      timeWarpCounter++;
    }
    c.timewarp = timeWarpSteps[timeWarpCounter];
  }
}

function keyReleased(event) {
  runHook("key:released", { event });
  held.delete(event.code);
}

window.addEventListener("blur", () => held.clear());

function flightControls() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  if (inVab || !rocket || !rocket.stack) {
    return;
  }
  const touched = touchHeldCodes();
  const down = (code) => held.has(code) || touched.has(code);

  if (!hasControl(rocket)) {
    rocket.turnInput = 0;
    return;
  }

  if (down("ShiftLeft") || down("ShiftRight")) {
    throttle = constrain(throttle + c.throttleStep, 0, 100);
  }
  if (down("ControlLeft") || down("ControlRight")) {
    throttle = constrain(throttle - c.throttleStep, 0, 100);
  }
  if (down("KeyX")) {
    throttle = 0;
  }
  if (down("KeyZ")) {
    throttle = 100;
  }
  // at 0% every engine is off, so the next throttle-up is a fresh ignition
  if (throttle === 0) {
    for (const entry of rocket.stack.parts) {
      if (!(entry.part.modules || {})["Engine Module"]?.["SRB Mode"]) {
        entry.consumedIgnition = false;
      }
    }
  }

  rocket.walkInput = 0;
  if (isAstronautRocket(rocket)) {
    if (down("KeyA")) rocket.walkInput -= 1;
    if (down("KeyD")) rocket.walkInput += 1;
  }

  let input = 0;
  if (down("KeyQ") || down("ArrowLeft")) {
    input -= 1;
  }
  if (down("KeyE") || down("ArrowRight")) {
    input += 1;
  }
  rocket.turnInput = input;
  if (input) {
    rocket.sasAngle = rocket.angle;
  }

  if (throttle !== timelineLastThrottle) {
    logTimelineEvent(rocket, "throttle", { throttle });
    timelineLastThrottle = throttle;
  }
  if (input !== timelineLastTurn) {
    logTimelineEvent(rocket, "turn", { turnInput: input });
    timelineLastTurn = input;
  }
}

function toggleSAS() {
  const rocket = rockets.find((rocket) => rocket.id === target);
  if (!rocket) {
    return;
  }
  if (!hasFeature("sas")) {
    launchToast("SAS is locked");
    return;
  }
  if (!hasControl(rocket)) {
    launchToast("No pod or probe core");
    return;
  }
  rocket.sas = !rocket.sas;
  if (rocket.sas) {
    rocket.sasAngle = rocket.angle;
  }
  logTimelineEvent(rocket, "sas", { sas: rocket.sas });
}

function buttonOnClick(button) {
  if (runFilter("ui:click", true, { button }) === false) {
    return;
  }
  const id = button.id;
  const data = button.data;
  const label = button.label;
  const x = button.x;
  const y = button.y;
  const sx = button.sx;
  const sy = button.sy;

  if (id && id.startsWith("paint-")) {
    paintClick(id);
    return;
  }

  if (data && data.type) {
    if (data.type === "featured-mod") {
      loadFeaturedMod(data);
    }
  }

  if (id && id.startsWith("gui-close-")) {
    const rocket = flyingRocket();
    const entry =
      rocket && rocket.stack.parts[Number(id.slice("gui-close-".length))];
    if (entry) {
      entry.guiOpen = false;
    }
  } else if (id && id.startsWith("gui-btn-")) {
    const [idxStr, elId] = id.slice("gui-btn-".length).split("::");
    const rocket = flyingRocket();
    const entry = rocket && rocket.stack.parts[Number(idxStr)];
    const gui = entry && (entry.part.modules || {})["GUI Module"];
    const action = gui && (gui.Actions || []).find((a) => a.ID === elId);
    if (action && action.func === "Run Function" && action["Function Name"]) {
      runClockFunction(entry, action["Function Name"]);
    }
  } else if (id && id.startsWith("gui-input-")) {
    const [idxStr, elId] = id.slice("gui-input-".length).split("::");
    const rocket = flyingRocket();
    const entry = rocket && rocket.stack.parts[Number(idxStr)];
    if (entry) {
      const val = prompt("Set " + elId);
      if (val !== null) {
        partVars(entry)[elId] = parseLogicValue(val);
      }
    }
  }
}

function beginNewCareer() {
  for (const key in career) {
    delete career[key];
  }
  Object.assign(career, {
    completed: [],
    techs: ["basicRocketry"],
    science: 0,
    offers: [],
    active: null,
    milestones: {},
    launches: 0,
    loans: defaultLoans(),
    difficulty: difficultyOptions[difficultyIndex],
  });
  career.offers = generateMissions(offerCount);
  inMainMenu = false;
  inVab = true;
  careerMode = true;
  balance = Math.round(
    u.careerMode.modules["Career Module"]["Starting Cash"] *
      u.careerMode.modules["Career Module"]["Base multi"] *
      difficultyMult("startFunds"),
  );
  saveCareer();
}

function startCareer() {
  inMainMenu = false;
  inVab = true;
  careerMode = true;
  career.difficulty = difficultyOptions[difficultyIndex];
  balance = Math.round(
    u.careerMode.modules["Career Module"]["Starting Cash"] *
      u.careerMode.modules["Career Module"]["Base multi"] *
      difficultyMult("startFunds"),
  );
  // what the fuck?
  loadCareer();
}

async function mousePressed() {
  runHook("input:mousePressed", { x: mouseX, y: mouseY, button: mouseButton });
  if (consoleOpen) {
    const box = consoleBox();
    if (GUIAPI.contains(box.x, box.y, box.sx, box.sy)) {
      devConsole.focused = true;
      return;
    }
    devConsole.focused = false;
  }

  GUIAPI.dispatch();

  if (careerMode && careerClick()) {
    return;
  }

  if (inVab) {
    if (GUIAPI.clicked("vab-flag")) {
      vabFlagOpen = !vabFlagOpen;
    }
    if (vabFlagOpen) {
      for (const c of flagCodes) {
        if (GUIAPI.clicked(`flag-${c}`)) {
          playerCountry = c;
          vabFlagOpen = false;
        }
      }
    }
    if (GUIAPI.clicked("vab-flag-close")) {
      vabFlagOpen = false;
    }
    if (GUIAPI.clicked("astronaut-open")) {
      astroMenuOpen = !astroMenuOpen;
    }
    if (GUIAPI.clicked("close-astromenu")) {
      astroMenuOpen = false;
    }
    if (GUIAPI.clicked("vab-gray")) {
      vabTheme = "#2b2b2b"
    }
    if (GUIAPI.clicked("vab-white")) {
      vabTheme = "#ccc"
    }
    if (GUIAPI.clicked("vab-sky")) {
      vabTheme = "#3a7bd5"
    }
    const part = partAPI.read(vab.selected);
    if (part) {
      const crew = part.stored.crew ?? [];
      const max = part.modules["Controller Module"]?.["Max Crew"] ?? 0;
      const taken = takenAstronauts();
      const name = astronautNames.find((n) => !taken.includes(n));
      if (GUIAPI.clicked("astro-add") && crew.length < max && name) {
        partAPI.write(vab.selected, { crew: [...crew, name] });
      }
      const removed = crew.find((name) => GUIAPI.clicked(`delete-${name}`));
      if (removed !== undefined) {
        const left = crew.filter((name) => name !== removed);
        partAPI.write(vab.selected, { crew: left.length ? left : undefined });
      }
    }
    if (GUIAPI.clicked("example-rockets")) {
      exampleRocketsOpen = !exampleRocketsOpen;
    }
    if (GUIAPI.clicked("vab-staging")) {
      stagingOpen = !stagingOpen;
    }
    if (stagingOpen) {
      vab.parts.forEach((inst, i) => {
        if (GUIAPI.clicked("stage-cycle-" + i)) {
          inst.stage = ((inst.stage ?? 0) + 1) % 10;
        }
      });
    }
    if (GUIAPI.clicked("example-little-bob")) {
      craftLoad(exampleCrafts["little-bob"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("example-big-bertha")) {
      craftLoad(exampleCrafts["big-bertha"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("example-unknown-527")) {
      craftLoad(exampleCrafts["Unknown_527's Rocket"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("vab-mainmenu")) {
      inVab = false;
      inMainMenu = true;
      careerMode = false;
    }
    if (GUIAPI.clicked("vab-export-world")) {
      gameSave();
      return;
    }
    if (GUIAPI.clicked("vab-import-world")) {
      gamePick();
      return;
    }
  }
  if (inMap && !inVab) {
    if (GUIAPI.clicked("map-fly")) {
      inMap = false;
    } else if (GUIAPI.clicked("map-recenter")) {
      mapPan.x = 0;
      mapPan.y = 0;
    } else if (GUIAPI.clicked("map-warp-cancel")) {
      warpUntil = null;
    } else if (GUIAPI.clicked("map-warp-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn) {
        warpUntil = t + burn.seconds;
      }
    } else {
      mapClick = { x: mouseX, y: mouseY };
    }
    return;
  }
  if (exampleRocketsOpen) {
    if (GUIAPI.clicked("example-close")) {
      exampleRocketsOpen = false;
    }
  }
  if (inMainMenu) {
    if (GUIAPI.clicked("credits-close")) {
      inCreditsMenu = false;
      return;
    }
    if (GUIAPI.clicked("modloader-close")) {
      inModLoaderMenu = false;
      jsModPickerOpen = false;
      return;
    }
    for (let i = 1; i < loaded.length; i++) {
      if (GUIAPI.clicked("mod-delete-" + i)) {
        loaded.splice(i, 1);
        expandBlueprints();
        persistLoadedMods();
        return;
      }
    }
    for (let i = 0; i < jsMods.length; i++) {
      if (GUIAPI.clicked("jsmod-delete-" + i)) {
        jsMods.splice(i, 1);
        persistJsMods();
        return;
      }
    }
    if (GUIAPI.clicked("modloader-js")) {
      jsModPickerOpen = true;
      return;
    }
    if (GUIAPI.clicked("modloader-js-file")) {
      jsModPickerOpen = false;
      await loadJsModFromFile();
      return;
    }
    if (GUIAPI.clicked("modloader-js-paste")) {
      jsModPickerOpen = false;
      loadJsModFromPaste();
      return;
    }
    if (GUIAPI.clicked("modloader-js-server")) {
      jsModPickerOpen = false;
      loadJsModFromServer();
      return;
    }
    if (GUIAPI.clicked("modloader-new")) {
      const answer = prompt("Paste JSON of part pack data here");
      if (answer) {
        try {
          const pack = JSON.parse(answer);
          if (await loadPack(pack)) {
            await loadPartTextures();
          }
        } catch (err) {
          alert(`Couldn't parse that part pack: ${err.message}`);
        }
      }
      console.log(loaded);
      return;
    }
    if (GUIAPI.clicked("featured-mods-close")) {
      inFeaturedModsMenu = false;
      return;
    }
    if (GUIAPI.clicked("keybinds-close")) {
      inKeyBindsMenu = false;
      return;
    }
    if (GUIAPI.clicked("keybind-invert-vab-zoom")) {
      controls.invertVabZoom = !controls.invertVabZoom;
      return;
    }
    if (GUIAPI.clicked("keybind-invert-flight-zoom")) {
      controls.invertFlightZoom = !controls.invertFlightZoom;
      return;
    }
    if (GUIAPI.clicked("menu-build")) {
      careerMode = false;
      inMainMenu = false;
      inVab = true;
      return;
    }
    if (GUIAPI.clicked("menu-world")) {
      inWorldCreation = true;
      return;
    }
    if (GUIAPI.clicked("menu-career")) {
      startCareer();
      return;
    }
    if (GUIAPI.clicked("world-create")) {
      const worldExists = careerHasProgress() || vab.parts.length > 0;
      if (
        worldExists &&
        !confirm(
          "Starting a new world will overwrite your current progress. Continue?",
        )
      ) {
        return;
      }
      inWorldCreation = false;
      vab.parts = [];
      if (qualityOptions[qualityIndex] === "Career") {
        beginNewCareer();
      } else {
        for (const key in career) {
          delete career[key];
        }
        Object.assign(career, {
          completed: [],
          techs: ["basicRocketry"],
          science: 0,
          offers: [],
          active: null,
          milestones: {},
          launches: 0,
          loans: {},
          difficulty: "Normal",
        });
        careerMode = false;
        balance = 0;
        inMainMenu = false;
        inVab = true;
        saveCareer();
      }
      return;
    }
    if (GUIAPI.clicked("world-cancel")) {
      inWorldCreation = false;
      return;
    }
    if (GUIAPI.clicked("menu-disabled-career")) {
      alert(
        "Career mode is in super WIP! As you can see by this plain alert box instead of some clean one.",
      );
    }
    if (GUIAPI.clicked("menu-credits")) {
      inCreditsMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-modloader")) {
      inModLoaderMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-featured-mods")) {
      inFeaturedModsMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-keybinds")) {
      inKeyBindsMenu = true;
      return;
    }
    return;
  }
  if (!inVab) {
    const hit = GUIAPI.buttonAt();
    if (GUIAPI.buttonAt()?.id?.startsWith("flight-eva-")) {      
      // Used to detect if a capsule was triggered to eva an astronaut.

      const nameList = GUIAPI.buttonAt()?.id?.split("-");

      const { rocket } = hit.data ?? {};
      const astroName = nameList[2];
      if (!rocket || !astroName) {
        return;
      }

      const Astronaut = {
        "format": "xopernicus-craft",
        "version": 1,
        "parts": [
          {
            "name": "_astronaut",
            "x": 1.8947806286936006e-13,
            "y": 0,
            "rot": 0,
            "attachedTo": null,
            "parentNode": null,
            "stage": 0
          }
        ]
      };
      const r = RocketAPI.spawn(Astronaut, {
        distance: 5,
        side: -1,
        allowHidden: true,
        name: astroName
      });

      if (r) {
        rocket.stack.parts = rocket.stack.parts.map((part) => {
          if (part?.paint?.crew) {
            part.paint.crew = part.paint.crew.filter((c) => c !== astroName);
          }
          return part;
        });
        if (rockets.some((x) => x.id === r.id)) {
          target = r.id;
        }
      }

      return;
    }
    if (GUIAPI.clicked("plant-flag")) {
      plantFlag(flyingRocket());
    }
    if (GUIAPI.clicked("skillissue-vab")) {
      inVab = true;
      return;
    }
    if (GUIAPI.clicked("save")) {
      gameSave();
      return;
    }
    if (GUIAPI.clicked("load")) {
      gamePick();
      return;
    }
    if (GUIAPI.clicked("recover")) {
      recoverRocket();
      return;
    }
    if (GUIAPI.clicked("sas-toggle")) {
      toggleSAS();
      return;
    }
    if (GUIAPI.clicked("automate-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn && burn.due) {
        executeAutomatedBurn(ship, burn.dv);
      }
      return;
    }
    if (GUIAPI.clicked("flight-warp-cancel")) {
      warpUntil = null;
      return;
    }
    if (GUIAPI.clicked("flight-warp-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn) {
        warpUntil = t + burn.seconds;
      }
      return;
    }
    if (GUIAPI.clicked("warp-down")) {
      if (timeWarpCounter > 0) {
        timeWarpCounter--;
      }
      c.timewarp = timeWarpSteps[timeWarpCounter];
      return;
    }
    if (GUIAPI.clicked("warp-up")) {
      if (timeWarpCounter < timeWarpSteps.length - 1) {
        timeWarpCounter++;
      }
      c.timewarp = timeWarpSteps[timeWarpCounter];
      return;
    }
    if (hit && hit.id === "flight-action") {
      activatePart(hit.data.rocket, hit.data.entry);
      return;
    }
    if (hit && hit.id === "flight-switch") {
      const dest = hit.data.rocket;
      if (rockets.some((r) => r.id === dest.id)) {
        // leaving EVA: put the astronaut back in the crew instead of duplicating
        const current = flyingRocket();
        const parts = current?.stack?.parts ?? [];
        if (
          current &&
          current.id !== dest.id &&
          parts.length === 1 &&
          parts[0]?.part?.name === "_astronaut"
        ) {
          const crew = hit.data.entry?.paint?.crew;
          const max =
            hit.data.entry?.part?.modules?.["Controller Module"]?.["Max Crew"] ?? 0;
          if (crew && !crew.includes(current.id) && crew.length < max) {
            crew.push(current.id);
          }
          if (!crew || crew.includes(current.id)) {
            rockets.splice(rockets.indexOf(current), 1);
          }
        }
        target = dest.id;
      }
      return;
    }
    if (hit && hit.id === "flight-eva") {
      evaCrew(hit.data.rocket, hit.data.entry, hit.data.name);
      return;
    }
    if (GUIAPI.blocked() && !GUIAPI.clicked("vab") && !GUIAPI.clicked("map")) {
      return;
    }
    if (GUIAPI.clicked("vab")) {
      inVab = true;
      return;
    }

    if (GUIAPI.clicked("map")) {
      if (hasFeature("map")) {
        inMap = true;
      } else {
        launchToast("Map view is locked");
      }
      return;
    }

    const rocket = rockets.find((rocket) => rocket.id === target);
    const entry = flightPartAt(rocket, mouseX, mouseY);
    const modules = entry ? entry.part.modules || {} : {};
    const gui = modules["GUI Module"];
    if (
      gui &&
      (gui.Trigger === "On Click" ||
        (gui.Trigger === "On Right Click" && mouseButton === RIGHT))
    ) {
      entry.guiOpen = gui.Popup ? !entry.guiOpen : true;
    }
    if (entry) {
      activatePart(rocket, entry);
    }
    return;
  }
  if (mouseX < panelWidth()) {
    if (GUIAPI.clicked("launch")) {
      launch();
      return;
    }
    if (GUIAPI.clicked("vab-fly")) {
      inVab = false;
      return;
    }
    for (const zb of zoomButtons()) {
      if (GUIAPI.clicked(zb.id)) {
        zoomVab(zb.factor, bayCentre(), height / 2);
        return;
      }
    }
    for (const cb of craftButtons()) {
      if (GUIAPI.clicked(cb.id)) {
        cb.action();
        return;
      }
    }
    for (const tab of categoryTabs()) {
      if (GUIAPI.clicked(tab.id)) {
        vab.category = tab.cat;
        vab.scroll = 0;
        return;
      }
    }
    for (const b of visiblePaletteLayout()) {
      if (GUIAPI.clicked(b.id)) {
        const inst = { part: fitUnlocks(b.part), x: mouseX, y: mouseY, attachedTo: null };
        vab.parts.push(inst);
        runHook("vab:partAdded", { inst });
        vab.drag = { inst, dx: 0, dy: 0, fromPalette: true };
        return;
      }
    }
    return;
  }
  if (GUIAPI.blocked()) {
    return;
  }
  const hit = partAt(mouseX, mouseY);
  if (hit) {
    detach(hit);
    vab.drag = {
      inst: hit,
      dx: mouseX - hit.x,
      dy: mouseY - hit.y,
      fromPalette: false,
      start: { x: mouseX, y: mouseY },
    };
  } else {
    vab.selected = null;
    vab.panning = true;
  }
}

function mouseDragged() {
  if (techTreeOpen) {
    techView.x += mouseX - pmouseX;
    techView.y += mouseY - pmouseY;
    return;
  }
  if (inMap && !inVab) {
    mapPan.x -= (mouseX - pmouseX) / mapScale;
    mapPan.y -= (mouseY - pmouseY) / mapScale;
    return;
  }
  if (inVab && vab.panning) {
    for (const inst of vab.parts) {
      inst.x += mouseX - pmouseX;
      inst.y += mouseY - pmouseY;
    }
    return;
  }
  if (!inVab || !vab.drag) {
    return;
  }
  const inst = vab.drag.inst;
  moveSubtree(
    inst,
    mouseX - vab.drag.dx - inst.x,
    mouseY - vab.drag.dy - inst.y,
  );

  const snap = findSnap(inst);
  if (snap) {
    moveSubtree(inst, snap.dx, snap.dy);
  }
  vab.snap = snap;
}

function mouseReleased() {
  if (techTreeOpen) {
    if (
      techClick &&
      Math.hypot(mouseX - techPress.x, mouseY - techPress.y) < 5
    ) {
      researchTech(techClick);
    }
    techClick = null;
    return;
  }
  if (inMap && !inVab && mapClick) {
    if (Math.hypot(mouseX - mapClick.x, mouseY - mapClick.y) < 4) {
      const ship = flyingRocket();
      const anchor = ship ? ship.pos : camera.pos;
      const cx = anchor.x + mapPan.x;
      const cy = anchor.y + mapPan.y;
      const hitRocket = rockets.find((rocket) => {
        if (rocket.id === target) {
          return false;
        }
        const x = width / 2 + (rocket.pos.x - cx) * mapScale;
        const y = height / 2 + (rocket.pos.y - cy) * mapScale;
        return Math.hypot(mouseX - x, mouseY - y) <= 8;
      });
      if (hitRocket) {
        rendezvousTarget = hitRocket.id;
      } else {
        const hit = planets.find((body) => {
          const x = width / 2 + (body.pos.x - cx) * mapScale;
          const y = height / 2 + (body.pos.y - cy) * mapScale;
          return (
            Math.hypot(mouseX - x, mouseY - y) <=
            Math.max(body.size * mapScale, 4) + 6
          );
        });
        transferTarget = hit && transferPlan(ship, hit) ? hit.id : null;
        rendezvousTarget = null;
      }
    }
    mapClick = null;
    return;
  }
  vab.panning = false;
  if (!inVab || !vab.drag) {
    return;
  }
  const inst = vab.drag.inst;
  if (
    vab.drag.start &&
    Math.hypot(mouseX - vab.drag.start.x, mouseY - vab.drag.start.y) < 4
  ) {
    vab.selected = inst;
  }
  if (mouseX < panelWidth()) {
    const drop = new Set(subtree(inst));
    vab.parts = vab.parts.filter((p) => !drop.has(p));
  } else {
    const snap = findSnap(inst);
    if (snap) {
      moveSubtree(inst, snap.dx, snap.dy);
      if (snap.side === "top") {
        attach(snap.target, inst, "bottom");
      } else if (snap.target) {
        attach(inst, snap.target, snap.side);
      }
    }
  }
  vab.drag = null;
  vab.snap = null;
}

function mouseWheel(event) {
  if (runFilter("input:wheel", true, { event }) === false) {
    return false;
  }
  if (techTreeOpen) {
    zoomTechTree(event.delta < 0 ? 1.12 : 1 / 1.12);
    return false;
  }
  if (GUIAPI.scroll(event.delta)) {
    return false;
  }
  if (inVab) {
    if (mouseX < panelWidth() && mouseY >= paletteTop()) {
      vab.scroll = constrain(vab.scroll + event.delta, 0, paletteMaxScroll());
      return false;
    }
    const up = controls.invertVabZoom ? event.delta <= 0 : event.delta > 0;
    zoomVab(up ? 1 + c.zoomPower : 1 - c.zoomPower, mouseX, mouseY);
    return;
  }
  const up = controls.invertFlightZoom ? event.delta <= 0 : event.delta > 0;
  if (inMap) {
    const factor = up ? 1 + c.zoomPower : 1 - c.zoomPower;
    mapScale = constrain(mapScale * factor, c.mapZoomMin, c.mapZoomMax);
    return;
  }
  if (up) {
    scale *= 1 + c.zoomPower;
  } else {
    scale *= 1 - c.zoomPower;
  }
}

document.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false },
);

window.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false },
);

executeLowPriority();
