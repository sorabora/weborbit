let paintPicker = null;
let paintPickerKey = null;

function setPaint(inst, patch) {
  const next = { ...inst.paint, ...patch };
  for (const key in next) {
    if (next[key] === undefined) {
      delete next[key];
    }
  }
  inst.paint = Object.keys(next).length ? next : undefined;
}

function sizeText(units) {
  const m = units / c.partUnits;
  return m < 1 ? `${Math.round(m * 1000)} mm` : `${+m.toFixed(2)} m`;
}

function parseSize(text) {
  return parseFloat(text) * (/mm/i.test(text) ? 0.001 : 1) * c.partUnits;
}

function allowedNames(key, all, cur) {
  const open = unlocked(key, all);
  return all.filter((name) => open.includes(name) || name === cur);
}

function sizeSlider(ui, inst, axis) {
  const size = [...inst.part.size];
  const next = ui.slider(
    0,
    0,
    undefined,
    28,
    {
      id: `size-${axis}`,
      min: 20,
      max: unlocked("tankSize", 20000),
      log: true,
      format: (v) => `${axis ? "Height" : "Width"}: ${sizeText(v)}`,
      edit: sizeText,
      parse: parseSize,
    },
    size[axis],
  );
  if (next !== size[axis]) {
    size[axis] = next;
    resizeInst(inst, resizePart(inst.part, ...size));
  }
}

function fuelDropdown(ui, inst) {
  const cur = fuelOf(inst.part);
  const names = allowedNames("propellants", Object.keys(tankFuels), cur);
  ui.label("Propellant", { size: 14, color: "#5aa9ff", height: 24 });
  const pick = ui.dropdown(
    0,
    0,
    undefined,
    34,
    { id: "tank-fuel", ...menuStyle },
    names,
    Math.max(names.indexOf(cur), 0),
  );
  if (names[pick] !== cur) {
    resizeInst(inst, resizePart(inst.part, ...inst.part.size, names[pick]));
  }
}

function boosterSlider(ui, inst, config, key, label, extras) {
  const next = Math.round(
    ui.slider(
      0,
      0,
      undefined,
      28,
      {
        id: `booster-${key}`,
        ...extras,
        format: (v) => `${label}: ${extras.show(v)}`,
        edit: extras.show,
      },
      config[key],
    ),
  );
  if (next !== Math.round(config[key])) {
    resizeInst(inst, shapeBooster(inst.part, { [key]: next }));
  }
}

function boosterSettings(ui, inst) {
  const config = inst.part.config ?? shapeBooster(inst.part).config;
  const types = allowedNames("boosters", boosterTypes(), config.type);
  ui.label("Booster type", { size: 14, color: "#5aa9ff", height: 24 });
  const pick = ui.dropdown(
    0,
    0,
    undefined,
    34,
    { id: "booster-type", ...menuStyle },
    types.map((name) => name.slice(1, -"Booster".length)),
    Math.max(types.indexOf(config.type), 0),
  );
  if (types[pick] !== config.type) {
    const [width, height] = casingSize(hiddenPart(types[pick]));
    resizeInst(inst, shapeBooster(inst.part, { type: types[pick], width, height }));
  }
  const [maxWidth, maxHeight] = casingSize(hiddenPart(config.type)).map((v) => v * 2);
  const size = { min: 20, log: true, show: sizeText, parse: parseSize };
  boosterSlider(ui, inst, config, "width", "Casing width", { ...size, max: maxWidth });
  boosterSlider(ui, inst, config, "height", "Casing height", { ...size, max: maxHeight });
  boosterSlider(ui, inst, config, "pressure", "Chamber pressure", {
    min: 20,
    max: 100,
    show: (v) => `${Math.round(v)} bar`,
  });
  boosterSlider(ui, inst, config, "nozzle", "Nozzle size", {
    min: 25,
    max: 200,
    show: (v) => `${Math.round(v)}%`,
  });
  flameEnvironment(ui);
  const stats = inst.part.booster ?? shapeBooster(inst.part).booster;
  ui.label("Stats", { size: 14, color: "#5aa9ff", height: 24 });
  [
    `Weight: ${stats.mass.toFixed(2)} t`,
    `ISP (Vac): ${Math.round(stats.isp)} s`,
    `Thrust (Vac): ${Math.round(stats.thrust)} kN`,
    `Burn time: ${Math.round(stats.burn)} s`,
  ].forEach((line) => ui.label(line, { size: 13, height: 18 }));
}

function tune(inst, patch) {
  resizeInst(inst, shapeEngine(inst.part, patch));
}

function engineSlider(ui, inst, key, label, min, max, unit = "%") {
  const cur = inst.part.config?.[key] ?? engineDefaults[key];
  const next = Math.round(
    ui.slider(
      0,
      0,
      undefined,
      28,
      {
        id: `engine-${key}`,
        min,
        max,
        format: (v) => `${label}: ${Math.round(v)}${unit}`,
        edit: (v) => `${Math.round(v)}`,
      },
      cur,
    ),
  );
  if (next !== cur) {
    tune(inst, { [key]: next });
  }
}

function engineDropdown(ui, inst, key, label, names, show = (n) => n) {
  const cur = inst.part.config?.[key] ?? engineDefaults[key];
  ui.label(label, { size: 14, color: "#5aa9ff", height: 24 });
  const pick = ui.dropdown(
    0,
    0,
    undefined,
    34,
    { id: `engine-${key}`, ...menuStyle },
    names.map(show),
    Math.max(names.indexOf(cur), 0),
  );
  if (names[pick] !== cur) {
    tune(inst, { [key]: names[pick] });
  }
}

function engineSettings(ui, inst) {
  const config = { ...engineDefaults, ...inst.part.config };
  const [lo, hi] = pressureRange(config);
  engineSlider(ui, inst, "size", "Engine size", 25, unlocked("engineSize", 400));
  engineDropdown(
    ui,
    inst,
    "propellant",
    "Propellant",
    allowedNames("propellants", Object.keys(propellants), config.propellant),
  );
  if (!lockedCycles[config.type]) {
    engineDropdown(
      ui,
      inst,
      "cycle",
      "Power cycle",
      allowedNames("cycles", Object.keys(cycles), config.cycle),
    );
  }
  engineSlider(ui, inst, "pressure", "Chamber pressure", lo, hi, " bar");
  engineSlider(ui, inst, "throat", "Throat size", 25, 200);
  engineDropdown(
    ui,
    inst,
    "type",
    "Nozzle type",
    allowedNames("nozzles", nozzleTypes(), config.type),
    (name) => name.slice(1, -"Nozzle".length).replace(/(?<=[a-z])(I+)$/, " $1"),
  );
  if (!fixedNozzles.includes(config.type)) {
    engineSlider(ui, inst, "pct", "Nozzle length", 25, unlocked("nozzleLength", 200));
  }
  flameEnvironment(ui);
  const stats = inst.part.stats ?? shapeEngine(inst.part).stats;
  ui.label("Stats", { size: 14, color: "#5aa9ff", height: 24 });
  [
    `Cost: $${(stats.cost / 1e6).toFixed(1)}M`,
    `Weight: ${stats.mass.toFixed(2)} t`,
    `ISP (Vac): ${Math.round(stats.ispVac)} s`,
    `ISP (Sea): ${Math.round(stats.ispSea)} s`,
    `Thrust (Vac): ${Math.round(stats.thrustVac)} kN`,
    `Thrust (Sea): ${Math.round(stats.thrustSea)} kN`,
    `Expansion ratio: ${stats.ratio.toFixed(1)}`,
  ].forEach((line) => ui.label(line, { size: 13, height: 18 }));
}

function openPaintPicker(key) {
  const inst = vab.selected;
  if (!inst) {
    return;
  }
  if (!paintPicker) {
    paintPicker = document.createElement("input");
    paintPicker.type = "color";
    paintPicker.style.cssText =
      "position:fixed;left:50%;top:50%;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(paintPicker);
    paintPicker.addEventListener("input", () => {
      if (vab.selected && paintPickerKey) {
        setPaint(vab.selected, { [paintPickerKey]: paintPicker.value });
      }
    });
  }
  paintPickerKey = key;
  paintPicker.value = (inst.paint && inst.paint[key]) || "#ffffff";
  paintPicker.click();
}

function paintClick(id) {
  const inst = vab.selected;
  // the flip buttons swap the part for its mirrored copy
  if (inst && (id === "paint-flip-x" || id === "paint-flip-y")) {
    inst.part = flipPart(inst.part, id === "paint-flip-y" ? 1 : 0);
    return;
  }
  const match = /^paint-(color|tint)-(\d+|custom|reset)$/.exec(id);
  if (!inst || !match) {
    return;
  }
  const key = match[1] === "color" ? "color" : "shapeTint";
  const list = match[1] === "color" ? paintColors : shapeColors;
  if (match[2] === "custom") {
    openPaintPicker(key);
  } else if (match[2] === "reset") {
    setPaint(inst, { [key]: undefined });
  } else {
    setPaint(inst, { [key]: list[Number(match[2])] });
  }
}

function paintSwatches(ui, prefix, colors, current) {
  for (let i = 0; i < colors.length; i += 8) {
    const row = ui.row(28);
    const w = (row.sx - 7 * 4) / 8;
    colors.slice(i, i + 8).forEach((color, j) => {
      const x = row.x + j * (w + 4);
      GUIAPI.button(x, row.y, w, 28, {
        id: `paint-${prefix}-${i + j}`,
        baseColor: color,
        radius: 4,
      });
      if (current && current.toLowerCase() === color) {
        push();
        noFill();
        stroke("#5aa9ff");
        strokeWeight(2);
        rect(x - 1, row.y - 1, w + 2, 30, 5);
        pop();
      }
    });
  }
  const row = ui.row(32);
  const half = row.sx / 2 - 3;
  GUIAPI.button(
    row.x,
    row.y,
    half,
    32,
    { id: `paint-${prefix}-custom`, ...menuStyle },
    "Custom...",
  );
  GUIAPI.button(
    row.x + half + 6,
    row.y,
    half,
    32,
    { id: `paint-${prefix}-reset`, ...menuStyle },
    "Reset",
  );
}

function drawPaintPanel() {
  const inst = vab.selected;
  if (!inst) {
    return;
  }
  const paint = inst.paint || {};
  const sx = 290;
  const sy = Math.min(height - 200, 440);
  GUIAPI.panel(
    sx,
    sy,
    {
      borderColor: "#555",
      id: "paint-panel",
      offsetX: (width - sx) / 2 - 20,
      offsetY: 40,
    },
    `Settings: ${inst.part.name}`,
    (ui) => {
      if (isProcedural(inst.part)) {
        ui.label("Size", { size: 14, color: "#5aa9ff", height: 24 });
        if (isTank(inst.part)) {
          sizeSlider(ui, inst, 0);
          sizeSlider(ui, inst, 1);
          fuelDropdown(ui, inst);
        } else if (isBooster(inst.part)) {
          boosterSettings(ui, inst);
        } else {
          engineSettings(ui, inst);
        }
      }
      ui.label("Colour", { size: 14, color: "#5aa9ff", height: 24 });
      paintSwatches(ui, "color", paintColors, paint.color);
      ui.label("Shape texture", { size: 14, color: "#5aa9ff", height: 24 });
      const current = paint.shape
        ? shapeTextureNames.indexOf(paint.shape) + 1
        : 0;
      const next = ui.dropdown(
        0,
        0,
        undefined,
        34,
        { id: "paint-shape", ...menuStyle },
        ["None", ...shapeTextureNames],
        current,
      );
      if (next !== current) {
        setPaint(inst, {
          shape: next ? shapeTextureNames[next - 1] : undefined,
        });
      }
      if (paint.shape) {
        ui.label("Shape colour", { size: 14, color: "#5aa9ff", height: 24 });
        paintSwatches(ui, "tint", shapeColors, paint.shapeTint);
      }
      ui.button(0, 0, 192, 32, { id: "paint-flip-x", ...menuStyle }, "Flip Left/Right");
      ui.button(0, 0, 192, 32, { id: "paint-flip-y", ...menuStyle }, "Flip Top/Bottom");
      ui.button(
        0,
        0,
        192,
        32,
        { id: `astronaut-open`, ...menuStyle },
        `Manage Astronauts `,
      );
    },
  );
}
