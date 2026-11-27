function draw() {
  background("#000000");

  if (bankrupt) {
    fill("#ff3b3b");
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME OVER", width / 2, height / 2 - 40);
    fill("#ccc");
    textSize(20);
    text(
      "The space program has run out of funds and can't continue.",
      width / 2,
      height / 2 + 20,
    );
    return;
  }

  GUIAPI.beginFrame();
  runHook("frame:start", { t });

  flightControls();

  runAnimations(1 / frameRate());
  runPartLogic(1 / frameRate());

  if (warpUntil !== null) {
    const remaining = warpUntil - t;
    if (remaining <= 0) {
      c.timewarp = timeWarpSteps[timeWarpCounter];
      warpUntil = null;
    } else {
      const perFrame = 1 / frameRate();
      let idx = timeWarpSteps.length - 1;
      while (idx > 0 && timeWarpSteps[idx] * perFrame > remaining) {
        idx--;
      }
      c.timewarp = timeWarpSteps[idx];
    }
  }

  clampTimewarpForOrbit(flyingRocket());

  if (burnLogging) {
    const controlled = flyingRocket();
    if (controlled) {
      const eo = engineOutput(controlled);
      const ro = rcsOutput(controlled);
      if (eo.thrust > 0) {
        logBurnEvent(controlled, "manual-engine", null);
      }
      if (ro.firing.size > 0) {
        logBurnEvent(controlled, "manual-rcs", null);
      }
    }
  }

  const dt = runFilter(
    "time:dt",
    Math.min(
      (1 / frameRate()) * c.timewarp,
      warpUntil !== null ? Math.max(warpUntil - t, 1 / frameRate()) : Infinity,
    ),
    {},
  );

  const substeps = constrain(ceil(dt / c.maxStep), 1, c.maxSubsteps);
  const h = dt / substeps;
  updateBodies();
  updateDocking(dt);
  for (let step = 0; step < substeps; step++) {
    for (const rocket of rockets) {
      if (rocket.destroyed) {
        continue;
      }
      if (rocket.landed) {
        landedSpinStep(rocket, h);
      } else {
        kickDrift(rocket, h);
      }
    }
    t += h;
    updateBodies();
    for (const hook of physicsHooks) {
      hook(h);
    }
    runHook("physics:step", { h, t });
    for (const rocket of rockets) {
      if (rocket.destroyed) {
        continue;
      }
      if (rocket.landed) {
        restOnSurface(rocket, h);
      } else {
        kickFinish(rocket, h);
      }
    }
  }
  if (careerMode) {
    checkCrewLosses();
  }
  for (const rocket of rockets) {
    if (rocket.destroyed) {
      runHook("rocket:destroyed", { rocket });
    }
  }
  rockets = rockets.filter((rocket) => !rocket.destroyed);

  if (careerMode) {
    updateCareer();
  }

  for (const rocket of rockets) {
    updateRocketTemp(rocket, dt);
  }

  const curRocket = rockets.find((rocket) => rocket.id === target);
  updateCamera(curRocket);

  if (rocketTimelineEnabled && curRocket) {
    const parent = curRocket.parentBody && getBody(curRocket.parentBody);
    const alt = parent ? distanceTo(curRocket, parent) - parent.size : null;
    const inAir = !!(
      parent &&
      parent.atmosphereHeight &&
      alt !== null &&
      alt < parent.atmosphereHeight
    );
    const interval = inAir
      ? c.timelineAtmosphereSampleInterval
      : c.timelineSampleInterval;
    if (t - timelineLastSample >= interval) {
      logTimelineEvent(curRocket, "sample");
      timelineLastSample = t;
    }
  }

  push();
  translate(width / 2, height / 2);
  rotate(camera.angle);
  translate(-width / 2, -height / 2);

  const ordered = [...planets].sort(
    (a, b) => distanceTo(camera, b) - distanceTo(camera, a),
  );
  for (const body of ordered) {
    drawBody(body, camera);
    runHook("body:draw", { body, camera });
  }

  drawProps(camera);

  for (const rocket of rockets) {
    drawRocket(rocket, camera);
    runHook("rocket:draw", { rocket, camera });
  }
  if (curRocket && curRocket.stack && !inVab) {
    if (showPitchGuide) {
      drawPitchGuide(curRocket);
    }
    drawBurnGuide(curRocket);
    if (!inMap) {
      // your own rocket gets full hover; others only show controller parts
      let hoverTarget = curRocket;
      let other = false;
      if (!flightPartAt(curRocket, mouseX, mouseY)) {
        const found = rockets.find(
          (r) =>
            r !== curRocket && r.stack && flightPartAt(r, mouseX, mouseY, true),
        );
        const pinned = tip && tip.rocket !== curRocket ? tip.rocket : null;
        if (found || pinned) {
          hoverTarget = found || pinned;
          other = true;
        }
      }
      drawPartHover(hoverTarget, other);
    }
  }
  pop();

  runHook("draw:foreground", { rocket: curRocket, camera });

  fill("white");
  textSize(width / 70);
  const lineHeight = width / 55;
  if (curRocket) {
    const other =
      rendezvousTarget &&
      rockets.find((rocket) => rocket.id === rendezvousTarget);
    const rel = other && rendezvousPlan(curRocket, other);
    const close = rel && rel.distance <= 20000;

    text(`Reference: ${curRocket.parentBody}`, 25, 50);
    text(
      close
        ? `Rel. Velocity: ${format("speed", rel.matchDv)}`
        : `Velocity: ${calculateVelocity()}`,
      25,
      50 + lineHeight,
    );
    text(
      close
        ? `Rel. Distance: ${format("distance", rel.distance)}`
        : `Altitude: ${calculateAltitude()}`,
      25,
      50 + lineHeight * 2,
    );
    text(
      `Atmospheric Pressure: ${calculatePressure()}`,
      25,
      50 + lineHeight * 3,
    );
    text(`Apoapsis: ${calculateApoapsis()}`, 25, 50 + lineHeight * 4);
    text(`Periapsis: ${calculatePeriapsis()}`, 25, 50 + lineHeight * 5);
    text(`Temperature: ${calculateTemperature()}`, 25, 50 + lineHeight * 6);
    text(`Time: ${formatTime(t)}`, 25, 50 + lineHeight * 7);
    text(
      `Timewarp: ${formatTime(c.timewarp)}/s [${formatTimeWarpCounter()}▶]`,
      25,
      50 + lineHeight * 8,
    );
    fill("White");
    text(`Throttle: ${throttle}%`, 25, 50 + lineHeight * 9);
    text(`Fuel: ${calculateFuel()}`, 25, 50 + lineHeight * 10);
    text(`TWR: ${calculateTWR()}`, 25, 50 + lineHeight * 11);
    text(`Pitch: ${calculatePitch()}`, 25, 50 + lineHeight * 12);
    text(`G force: ${calculateG()}`, 25, 50 + lineHeight * 13);
    text(`Rocket Temp: ${calculateRocketTemp()}`, 25, 50 + lineHeight * 14);
    text(`Heat shield: ${calculateAblator()}`, 25, 50 + lineHeight * 15);
    runHook("draw:hud", {
      rocket: curRocket,
      x: 25,
      y: 50 + lineHeight * 16,
      lineHeight,
    });
  } else {
    text("Vessel destroyed", 25, 50);
    text(`Time: ${formatTime(t)}`, 25, 50 + lineHeight);
  }

  if (inVab) {
    drawVab();
  } else if (inMap) {
    drawMap();
  } else if (inMainMenu) {
    drawMainMenu();
    if (inCreditsMenu) {
      drawCreditsMenu();
    }
    if (inModLoaderMenu) {
      drawModLoaderMenu();
    }
    if (inFeaturedModsMenu) {
      drawFeaturedModsMenu();
    }
    if (inKeyBindsMenu) {
      drawKeyBindsMenu();
    }
  } else {
    cursor("default");
    const vb = vabButton();
    GUIAPI.button(
      vb.x,
      vb.y,
      vb.size,
      vb.size,
      {
        id: "vab",
        ...menuStyle,
        tooltip: ["Back to the bay", "  the flight keeps running"],
      },
      "VAB",
    );
    GUIAPI.button(
      vb.x - 75,
      vb.y,
      vb.size,
      vb.size,
      hasFeature("map")
        ? { id: "map", ...menuStyle }
        : {
            id: "map",
            ...menuStyleDisabled,
            tooltip: ["Map view", "  locked, research Orbital Tracking"],
          },
      "Map",
    );
    GUIAPI.button(
      vb.x - 150,
      vb.y,
      vb.size,
      vb.size,
      { id: "save", ...menuStyle },
      "Save",
    );
    GUIAPI.button(
      vb.x - 225,
      vb.y,
      vb.size,
      vb.size,
      { id: "load", ...menuStyle },
      "Load",
    );
    if (curRocket && !isAstronautRocket(curRocket)) {
      GUIAPI.button(
        vb.x - 225,
        vb.y + vb.size + 10,
        vb.size,
        vb.size,
        !hasFeature("sas")
          ? {
              id: "sas-toggle",
              ...menuStyleDisabled,
              tooltip: [
                "Stability assist [T]",
                "  locked, research Rudimentary Guidance",
              ],
            }
          : curRocket.sas
            ? {
                id: "sas-toggle",
                baseColor: "#1f6b2f",
                hoverColor: "#2f8f45",
                activeColor: "#164f23",
                tooltip: ["Stability assist [T]", "  holds current heading"],
              }
            : {
                id: "sas-toggle",
                ...menuStyle,
                tooltip: ["Stability assist [T]", "  holds current heading"],
              },
        "SAS",
      );
    }
    if (careerMode && canRecover(curRocket)) {
      const unit = u.careerMode.modules["Career Module"].Unit;
      const value = recoveryValue(curRocket).toLocaleString("en-US");
      GUIAPI.button(
        vb.x - 475,
        vb.y + vb.size + 10,
        vb.size * 4,
        vb.size,
        {
          id: "recover",
          baseColor: "#1f6b2f",
          hoverColor: "#2f8f45",
          activeColor: "#164f23",
          tooltip: ["Recover vessel", "  refunds the parts still attached"],
        },
        `Recover ${unit}${value}`,
      );
    }
    const dueBurn = curRocket && pendingBurnWait(curRocket);
    if (dueBurn && dueBurn.due) {
      GUIAPI.button(
        vb.x - 550,
        vb.y,
        vb.size * 3,
        vb.size,
        {
          id: "automate-burn",
          baseColor: "#8f5a1f",
          hoverColor: "#c07a2a",
          activeColor: "#70481a",
          tooltip: [
            `Instantly perform the ${format("speed", Math.abs(dueBurn.dv))} burn`,
          ],
        },
        "Automate Burn",
      );
    } else if (warpUntil !== null) {
      GUIAPI.button(
        vb.x - 900,
        vb.y,
        vb.size * 3,
        vb.size,
        {
          id: "flight-warp-cancel",
          baseColor: "#7a2a2a",
          hoverColor: "#a03c3c",
          activeColor: "#5e1f1f",
        },
        `Warping... ${formatTime(Math.max(warpUntil - t, 0))}`,
      );
    } else if (dueBurn) {
      GUIAPI.button(
        vb.x - 900,
        vb.y,
        vb.size * 3,
        vb.size,
        {
          id: "flight-warp-burn",
          baseColor: "#8f5a1f",
          hoverColor: "#c07a2a",
          activeColor: "#70481a",
          tooltip: [
            `Warp ${formatTime(dueBurn.seconds)} to the ${dueBurn.label}`,
          ],
        },
        `Warp to ${dueBurn.label}`,
      );
    }
    if (isMobile) {
      for (const b of mobileFlightButtons()) {
        GUIAPI.button(
          b.x,
          b.y,
          b.sx,
          b.sy,
          { id: "touch-" + b.code, ...menuStyle },
          b.label,
        );
      }
      GUIAPI.button(
        vb.x - 300,
        vb.y,
        vb.size,
        vb.size,
        { id: "warp-up", ...menuStyle },
        "▶▶",
      );
      GUIAPI.button(
        vb.x - 375,
        vb.y,
        vb.size,
        vb.size,
        { id: "warp-down", ...menuStyle },
        "◀◀",
      );
    }
    GUIAPI.drawTooltip();
  }

  if (careerMissionsOpen) {
    drawMissions();
  }

  if (milestonesOpen) {
    drawMilestones();
  }

  if (loansOpen) {
    drawLoans();
  }

  if (!curRocket && !inVab && !inMainMenu) {
    skillIssue = GUIAPI.panel(
      width / 1.5,
      height / 1.5,
      { dim: true, borderColor: "#555", id: "skill-issue" },
      undefined,
      (ui) => {
        ui.label("Catastrophic Failure!", {
          size: 28,
          align: CENTER,
          height: 40,
        });
        ui.label(
          cd.message && cd.messageAt === cd.time
            ? cd.message
            : `Hit ${cd.body} at ${Math.round(cd.speed)} m/s, over the ${cd.limit === undefined ? c.crashSpeed : cd.limit} m/s the airframe takes`,
        );
        ui.label(`Time of loss: ${Math.round(cd.time * 100) / 100}s`);
        ui.button(
          0,
          10,
          undefined,
          40,
          { id: "skillissue-vab", ...menuStyle },
          "Go to VAB",
        );
      },
    );
  } else {
    skillIssue = null;
  }

  runHook("draw:main", { rocket: curRocket, camera });
  textSize(12);
  if (inMainMenu) {
    fill("black");
    rect(width - 195, height - 65, 150, 50);
  }
  fill("#bb97ff");
  text(`v${gameVersion}`, width - 120, height - 40);

  if (careerMode) {
    if (inVab) {
      drawCostBox();
    }
    drawBalanceBox();
    textSize(18);
    const barX = (inVab ? bayCentre() : width / 2) - (4 * 175 + 3 * 10) / 2;
    GUIAPI.button(
      barX,
      50,
      175,
      40,
      {
        id: "career-missions",
        ...menuStyle,
      },
      "Missions",
    );
    GUIAPI.button(
      barX + 185,
      50,
      175,
      40,
      {
        id: "career-tech",
        ...menuStyle,
      },
      "Tech Tree",
    );
    GUIAPI.button(
      barX + 370,
      50,
      175,
      40,
      {
        id: "career-milestones",
        ...menuStyle,
      },
      "Milestones",
    );
    GUIAPI.button(
      barX + 555,
      50,
      175,
      40,
      {
        id: "career-loans",
        ...(balance < 0
          ? { baseColor: "#7a2020", hoverColor: "#9c2b2b" }
          : menuStyle),
      },
      "Loans",
    );
  }

  if (techTreeOpen) {
    drawTechTree();
  }

  if (consoleOpen) {
    drawDevConsole();
  }

  toasts = toasts.filter((toast) => toast.hide > t);
  toasts.forEach((toast, i) => {
    fill("#ccc");
    rect(width / 2 - 125, height / 2 - 37.5 + i * 85, 250, 75);
    fill("Black");
    text(toast.message, width / 2 - 120, height / 2 + 5 + i * 85);
  });

  if (inWorldCreation) {
    GUIAPI.panel(
      width / 1.5,
      height / 1.5,
      { dim: true, borderColor: "#555", id: "example-rockets" },
      undefined,
      (ui) => {
        ui.label("Create a World", { size: 28, align: CENTER, height: 40 });

        const row = ui.row(80);
        const dropdownW = 400;
        const labelGap = 30;
        textSize(30);
        const labelW = textWidth("Gamemode");
        const startX = row.x + (row.sx - (labelW + labelGap + dropdownW)) / 2;

        push();
        noStroke();
        fill(menuStyle.textColor || "#fff");
        textSize(30);
        textAlign(LEFT, CENTER);
        text("Gamemode", startX, row.y + row.sy / 2);
        pop();

        textSize(30);
        qualityIndex = GUIAPI.dropdown(
          startX + labelW + labelGap,
          row.y,
          dropdownW,
          80,
          { id: "quality", ...menuStyle },
          qualityOptions,
          qualityIndex,
        );

        if (qualityOptions[qualityIndex] === "Career") {
          const row2 = ui.row(80);
          textSize(30);
          const labelW2 = textWidth("Difficulty");
          const startX2 =
            row2.x + (row2.sx - (labelW2 + labelGap + dropdownW)) / 2;

          push();
          noStroke();
          fill(menuStyle.textColor || "#fff");
          textSize(30);
          textAlign(LEFT, CENTER);
          text("Difficulty", startX2, row2.y + row2.sy / 2);
          pop();

          textSize(30);
          difficultyIndex = GUIAPI.dropdown(
            startX2 + labelW2 + labelGap,
            row2.y,
            dropdownW,
            80,
            {
              id: "difficulty",
              ...menuStyle,
              baseColor: difficultyColors[difficultyIndex],
            },
            difficultyOptions,
            difficultyIndex,
          );
        }

        const buttonRow = ui.row(85);
        const btnGap = 20;
        const btnW = (buttonRow.sx - btnGap) / 2;
        GUIAPI.button(
          buttonRow.x,
          buttonRow.y + 20,
          btnW,
          85,
          { id: "world-create", ...menuStyle },
          "Create World",
        );
        GUIAPI.button(
          buttonRow.x + btnW + btnGap,
          buttonRow.y + 20,
          btnW,
          85,
          { id: "world-cancel", ...menuStyle, baseColor: "#733" },
          "Cancel",
        );
      },
    );
  }

  if (astroMenuOpen) {
    drawAstroMenu(1 / frameRate());
  }

  if (vabFlagOpen) {
    drawVabMenu();
  }

  const ship = flyingRocket();
  const isLanded = !!ship?.landed;

  const shipParts = ship?.stack?.parts ?? [];
  const isAstronaut =
    shipParts.length === 1 && shipParts[0]?.part?.name === "_astronaut";

  if (isLanded && isAstronaut) {
    const bw = 160;
    const bh = 40;
    GUIAPI.button(
      width / 2 - bw / 2,
      height - bh - 20,
      bw,
      bh,
      { id: "plant-flag", ...menuStyle },
      "Plant a flag",
    );
  }

  if (exampleRocketsOpen) {
    GUIAPI.panel(
      width / 1.5,
      height / 1.5,
      { dim: true, borderColor: "#555", id: "example-rockets" },
      undefined,
      (ui) => {
        ui.label("Example Rockets", { size: 28, align: CENTER, height: 40 });

        ui.button(
          0,
          0,
          350,
          85,
          {
            id: "example-little-bob",
            ...menuStyle,
          },
          "Little Bob - Atmospheric",
        );

        ui.button(
          0,
          0,
          350,
          85,
          {
            id: "example-big-bertha",
            ...menuStyle,
          },
          "Big Bertha - Suborbital",
        );

        ui.button(
          0,
          0,
          350,
          85,
          {
            id: "example-unknown-527",
            ...menuStyle,
          },
          "Simple Orbiter - Orbital",
        );

        ui.button(
          0,
          0,
          350,
          85,
          {
            id: "example-close",
            ...menuStyle,
          },
          "Close",
        );
      },
    );
  }

  drawPartGUIs();

  runHook("draw:absolute", { rocket: curRocket, camera });

  if (developerMode) {
    fill("Red");
    circle(10, 10, 5);
  }

  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]",
  );
  // thanks google AI overview for the check T_T

  if (isLocalhost) {
    fill("Yellow");
    circle(20, 10, 5);
  }

  drawCrashScreen();

  tt++;
}
