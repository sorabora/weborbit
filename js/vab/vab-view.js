function drawVab() {
  background(vabTheme);
  if (vab.selected && !vab.parts.includes(vab.selected)) {
    vab.selected = null;
  }
  cursor(vab.drag ? "grabbing" : "default");

  const panelW = panelWidth();
  const dragSet = vab.drag ? new Set(subtree(vab.drag.inst)) : new Set();
  const midX = craftCentre(dragSet);
  stroke(vab.snap && vab.snap.mode === "centre" ? "#55ccff66" : "#ffffff12");
  strokeWeight(2);
  line(midX, 0, midX, height);
  for (const inst of vab.parts) {
    if (!dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, {
        ...lockedLook(inst, 1),
        rot: inst.rot,
        layer: "back",
        paint: inst.paint,
      });
    }
  }
  for (const inst of vab.parts) {
    if (dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, {
        ...lockedLook(inst, 0.9),
        rot: inst.rot,
        layer: "back",
        paint: inst.paint,
      });
    }
  }
  for (const inst of vab.parts) {
    const alpha = dragSet.has(inst) ? 0.9 : 1;
    drawPart(inst.part, inst.x, inst.y, vab.scale, {
      ...lockedLook(inst, alpha),
      rot: inst.rot,
      layer: "front",
      paint: inst.paint,
    });
  }

  if (stagingOpen) {
    textSize(13);
    vab.parts.forEach((inst, i) => {
      if (!partIsToggleable(inst.part)) {
        return;
      }
      GUIAPI.button(
        inst.x - 11,
        inst.y - 11,
        22,
        22,
        {
          id: "stage-cycle-" + i,
          ...menuStyle,
        },
        String(inst.stage ?? 0),
      );
    });
  }

  if (!vab.drag && mouseX >= panelW) {
    const hovered = partAt(mouseX, mouseY);
    if (hovered) {
      noFill();
      stroke("#5ccfff99");
      strokeWeight(2);
      for (const move of validMoves(hovered)) {
        circle(move.point.x, move.point.y, 14);
      }
    }
  }

  if (vab.snap && vab.snap.target) {
    noStroke();
    fill("#5cf");
    circle(vab.snap.point.x, vab.snap.point.y, 12);
  }

  noStroke();
  fill("#3a3a3a");
  rect(0, 0, panelW, height);
  const lb = launchButton();
  GUIAPI.button(
    lb.x,
    lb.y,
    lb.size,
    lb.size,
    {
      id: "launch",
      baseColor: vab.parts.length ? "#059200" : "#3f5c3f",
      hoverColor: "#06b900",
      activeColor: "#047b00",
      tooltip: vab.parts.length
        ? ["Launch", `  mass: ${stackMass()}t`]
        : ["Launch", "  nothing in the bay"],
    },
    "L",
  );
  if (flyingRocket()) {
    const fb = flyButton();
    GUIAPI.button(
      fb.x,
      fb.y,
      fb.size,
      fb.size,
      {
        id: "vab-fly",
        baseColor: "#1f4f8f",
        hoverColor: "#2a6ac0",
        activeColor: "#173d70",
        tooltip: ["Back to flight", "  the ship is still up there"],
      },
      "F",
    );
  }
  for (const zb of zoomButtons()) {
    GUIAPI.button(
      zb.x,
      zb.y,
      zb.size,
      zb.size,
      {
        id: zb.id,
        tooltip: [
          zb.label === "+" ? "Zoom in" : "Zoom out",
          `  ${Math.round(vab.scale * 100)}%`,
        ],
      },
      zb.label,
    );
  }
  for (const cb of craftButtons()) {
    GUIAPI.button(
      cb.x,
      cb.y,
      cb.w,
      cb.h,
      {
        id: cb.id,
        baseColor: "#4a4a5a",
        hoverColor: "#5b5b6e",
        tooltip:
          cb.label === "S"
            ? [
                "Save craft",
                vab.parts.length ? "  as craft.json" : "  nothing in the bay",
              ]
            : cb.label === "O"
              ? ["Open craft", "  replaces what's in the bay"]
              : [
                  "Export context",
                  "Exports a save file not meant to be imported with extra context about the rocket.",
                ],
      },
      cb.label,
    );
  }
  textSize(14);
  GUIAPI.button(
    0,
    vab.buttonSize * 2,
    vab.buttonSize * 2,
    vab.buttonSize,
    {
      id: "example-rockets",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
    },
    "Example Rockets",
  );
  GUIAPI.button(
    vab.buttonSize * 2,
    vab.buttonSize * 2,
    vab.buttonSize * 2,
    vab.buttonSize,
    {
      id: "vab-staging",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
    },
    "Stage",
  );
  textSize(12);
  for (const tab of categoryTabs()) {
    GUIAPI.button(
      tab.x,
      tab.y,
      tab.w,
      tab.h,
      {
        id: tab.id,
        baseColor: vab.category === tab.cat ? "#5b5b6e" : "#2e2e2e",
        hoverColor: "#4a4a5a",
      },
      tab.cat,
    );
  }
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, paletteTop(), panelW, height - paletteTop());
  drawingContext.clip();
  for (const b of visiblePaletteLayout()) {
    GUIAPI.button(b.x, b.y, b.size, b.size, {
      id: b.id,
      baseColor: "#2a2a2a",
      tooltip: partTooltip(b.part),
    });
    const bb = partBBox(b.part);
    const pad = 14;
    const iconScale = Math.min((b.size - pad) / bb.w, (b.size - pad) / bb.h);
    drawPart(b.part, b.x + b.size / 2, b.y + b.size / 2, iconScale);
  }
  drawingContext.restore();
  drawStageReadout(panelW);

  const introW = 260;
  const introX = width - introW - 20;
  GUIAPI.button(
    introX,
    20,
    introW,
    40,
    { id: "vab-mainmenu", ...menuStyle },
    "Main Menu",
  );
  GUIAPI.button(
    introX - 45,
    20,
    40,
    40,
    { id: "vab-flag", ...menuStyle },
    flagEmoji(playerCountry),
  );
  if (vab.selected) {
    const bb = partBBox(vab.selected.part);
    const turned = (vab.selected.rot || 0) % 2;
    const w = (turned ? bb.h : bb.w) * vab.scale;
    const h = (turned ? bb.w : bb.h) * vab.scale;
    push();
    noFill();
    stroke("#5aa9ff");
    strokeWeight(2);
    rect(vab.selected.x - w / 2, vab.selected.y - h / 2, w, h);
    pop();
    drawVabFlame(vab.selected);
  }
  drawPaintPanel();
  GUIAPI.button(
    width - 320,
    height - 100,
    145,
    40,
    {
      id: "vab-export-world",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: careerMode
        ? ["Export career world", "  rockets, money, tech, milestones"]
        : ["Export sandbox world", "  rockets and mods"],
    },
    "Export World",
  );
  GUIAPI.button(
    width - 165,
    height - 100,
    145,
    40,
    {
      id: "vab-import-world",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: [
        "Import a world",
        "  a career file switches to career,",
        "  a sandbox file to sandbox",
      ],
    },
    "Import World",
  );
  GUIAPI.panel(
      introW,
      160,
      {
        offsetX: introX - (width - introW) / 2,
        offsetY: 90 - (height - 120) / 2,
        borderColor: "#555",
        id: "vab-intro",
      },
      "Welcome",
      (ui) => {
        ui.label("Welcome to the VAB! some parts or,", {
          size: 13,
          height: 22,
        });
        ui.label("try the example rockets!", { size: 13, height: 20 });

        ui.label("Theme:", { size: 13, height: 20, icon: "gear" });
        const row = ui.row(28);
        const sq = 28;
        const gap = 4;
        textSize(12);
        GUIAPI.button(row.x, row.y, sq * 2 + gap, sq,
          { id: "vab-gray", baseColor: "#2b2b2b", radius: 4 },
          "Dark Gray");
        GUIAPI.button(row.x + sq * 2 + gap * 2, row.y, sq * 2 + gap, sq,
          { id: "vab-white", baseColor: "#cccccc", radius: 4, textColor: "#000" },
          "White");
        GUIAPI.button(row.x + sq * 4 + gap * 4, row.y, sq * 2 + gap, sq,
          { id: "vab-sky", baseColor: "#3a7bd5", radius: 4, textColor: "#fff" },
          "Sky");
      },
  );

  GUIAPI.drawTooltip();

  noStroke();
  fill("#aaa");
  textSize(12);
  textAlign(LEFT, BASELINE);
}
