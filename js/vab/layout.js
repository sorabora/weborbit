const vab = {
  parts: [],
  drag: null,
  snap: null,
  scale: 0.14,
  buttonSize: 60,
  scroll: 0,
  category: "All",
};

function panelWidth() {
  return width / 6;
}

function paletteCols() {
  return Math.max(1, Math.floor(panelWidth() / vab.buttonSize));
}

function bayCentre() {
  return (panelWidth() + width) / 2;
}

function craftCentre(exclude) {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const inst of vab.parts) {
    if (exclude && exclude.has(inst)) {
      continue;
    }
    const bb = partBBox(inst.part);
    const w = (inst.rot || 0) % 2 ? bb.h : bb.w;
    minX = Math.min(minX, inst.x - (w / 2) * vab.scale);
    maxX = Math.max(maxX, inst.x + (w / 2) * vab.scale);
  }
  return minX === Infinity ? bayCentre() : (minX + maxX) / 2;
}

function paletteTop() {
  return vab.buttonSize * 3 + tabHeight() * 2;
}

function tabHeight() {
  return 30;
}

const partCategories = [
  "All",
  "Pods",
  "Tanks",
  "Engines",
  "Decouplers",
  "Utility",
];

function partCategory(part) {
  const m = part.modules || {};
  if (m["Engine Module"]) return "Engines";
  if (m["Controller Module"]) return "Pods";
  if (m["Decoupler Module"]) return "Decouplers";
  if (m["Resource Module"]) return "Tanks";
  return "Utility";
}

function categoryTabs() {
  const w = (paletteCols() * vab.buttonSize) / 3;
  return partCategories.map((cat, i) => ({
    id: "category-" + cat,
    cat,
    x: (i % 3) * w,
    y: vab.buttonSize * 3 + Math.floor(i / 3) * tabHeight(),
    w,
    h: tabHeight(),
  }));
}

function paletteParts() {
  const parts = partAPI.list().filter(partAvailable);
  if (vab.category === "All") {
    return parts;
  }
  return parts.filter((part) => partCategory(part) === vab.category);
}

function paletteMaxScroll() {
  const parts = paletteParts();
  const rows = Math.ceil(parts.length / paletteCols());
  const contentH = rows * vab.buttonSize;
  return Math.max(0, contentH - (height - paletteTop()));
}

function paletteLayout() {
  const out = [];
  const parts = paletteParts();
  for (let i = 0; i < parts.length; i++) {
    out.push({
      id: "part-" + i,
      x: (i % paletteCols()) * vab.buttonSize,
      y:
        Math.floor(i / paletteCols()) * vab.buttonSize +
        paletteTop() -
        vab.scroll,
      size: vab.buttonSize,
      part: parts[i],
    });
  }
  return out;
}

function visiblePaletteLayout() {
  return paletteLayout().filter(
    (b) => b.y + b.size > paletteTop() && b.y < height,
  );
}

function launchButton() {
  return { x: 0, y: 0, size: vab.buttonSize };
}

function zoomVab(factor, focusX, focusY) {
  const next = constrain(vab.scale * factor, c.vabZoomMin, c.vabZoomMax);
  const ratio = next / vab.scale;
  if (ratio === 1) {
    return;
  }
  for (const inst of vab.parts) {
    inst.x = focusX + (inst.x - focusX) * ratio;
    inst.y = focusY + (inst.y - focusY) * ratio;
  }
  vab.scale = next;
}

function zoomButtons() {
  const size = vab.buttonSize;
  return [
    {
      id: "zoom-in",
      x: size * 2,
      y: 0,
      size,
      factor: 1 + c.zoomPower * 4,
      label: "+",
    },
    {
      id: "zoom-out",
      x: size * 3,
      y: 0,
      size,
      factor: 1 - c.zoomPower * 4,
      label: "-",
    },
  ];
}

function craftButtons() {
  const size = vab.buttonSize;
  const w = (size * 4) / 3;
  return [
    {
      id: "craft-save",
      x: 0,
      y: size,
      w,
      h: size,
      label: "S",
      action: craftSave,
    },
    {
      id: "craft-open",
      x: w,
      y: size,
      w,
      h: size,
      label: "O",
      action: craftPick,
    },
    {
      id: "craft-export-context",
      x: w * 2,
      y: size,
      w,
      h: size,
      label: "EC",
      action: craftExportContext,
    },
  ];
}

function vabButton() {
  const size = 60;
  return { x: width - size - 20, y: 20, size };
}

function flyButton() {
  return { x: vab.buttonSize, y: 0, size: vab.buttonSize };
}

function flyingRocket() {
  return rockets.find((rocket) => rocket.id === target);
}

function partBBox(part) {
  if (part._bbox) {
    return part._bbox;
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const group of part.groups) {
    for (const [px, py] of group.points) {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  part._bbox = {
    minX,
    minY,
    maxX,
    maxY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY,
  };
  return part._bbox;
}

function partReach(part) {
  if (part._reach) {
    return part._reach;
  }
  const bb = partBBox(part);
  const solid = part.groups.filter((group) => !group.noCollision);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const group of solid.length ? solid : part.groups) {
    for (const [px, py] of group.points) {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  part._reach = {
    top: bb.cy - minY,
    bottom: maxY - bb.cy,
    left: bb.cx - minX,
    right: maxX - bb.cx,
  };
  return part._reach;
}
