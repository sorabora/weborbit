let prevGuiTarget = null;

function drawPartGUIs() {
  const rocket = flyingRocket();
  if (inVab || inMap || !rocket || !rocket.stack) {
    return;
  }
  const switched = target !== prevGuiTarget;
  prevGuiTarget = target;
  const hovered = flightPartAt(rocket, mouseX, mouseY);
  rocket.stack.parts.forEach((entry, i) => {
    const gui = (entry.part.modules || {})["GUI Module"];
    if (!gui) {
      return;
    }
    if (gui.Trigger === "On Switched to Rocket" && switched) {
      entry.guiOpen = true;
    }
    if (gui.Trigger === "On Hover") {
      entry.guiOpen = entry === hovered;
    }
    if (entry.guiOpen) {
      renderGuiWindow(entry, gui, i);
    }
  });
}

function renderGuiWindow(entry, gui, idx) {
  const sx = 260;
  const sy = 46 + 28 * ((gui.Elements || []).length + 1);
  if (!entry.guiPos) {
    entry.guiPos = {
      x: (width - sx) / 2 + idx * 24,
      y: (height - sy) / 2 + idx * 24,
    };
  }
  const offsetX = gui.Popup ? 0 : entry.guiPos.x - (width - sx) / 2;
  const offsetY = gui.Popup ? 0 : entry.guiPos.y - (height - sy) / 2;
  const scope = moduleScope(entry);
  const panel = GUIAPI.panel(
    sx,
    sy,
    { borderColor: "#555", offsetX, offsetY, id: "gui-window-" + idx },
    entry.part.name,
    (ui) => {
      for (const el of gui.Elements || []) {
        if (el.Type === "Label") {
          ui.label(interpolate(el.Label, scope));
        } else if (el.Type === "Button") {
          ui.button(
            0,
            0,
            undefined,
            26,
            { id: "gui-btn-" + idx + "::" + el.ID },
            el.Label || el.ID,
          );
        } else if (el.Type === "String Input" || el.Type === "Number Input") {
          ui.button(
            0,
            0,
            undefined,
            26,
            { id: "gui-input-" + idx + "::" + el.ID },
            (el.Label || el.ID) + ": " + (partVars(entry)[el.ID] ?? ""),
          );
        }
      }
    },
  );
  GUIAPI.button(
    panel.x + sx - 26,
    panel.y + 6,
    20,
    20,
    { id: "gui-close-" + idx, baseColor: "#733" },
    "x",
  );

  if (!gui.Popup && GUIAPI.contains(panel.x, panel.y, sx, 28)) {
    if (mouseIsPressed) {
      if (!entry._guiDrag) {
        entry._guiDrag = {
          dx: mouseX - entry.guiPos.x,
          dy: mouseY - entry.guiPos.y,
        };
      }
      entry.guiPos.x = mouseX - entry._guiDrag.dx;
      entry.guiPos.y = mouseY - entry._guiDrag.dy;
    } else {
      entry._guiDrag = null;
    }
  } else if (!mouseIsPressed) {
    entry._guiDrag = null;
  }
}
