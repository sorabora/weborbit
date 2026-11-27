const techView = { x: 0, y: 0, zoom: 1 };
const techNode = {
  w: 250,
  h: 74,
  minGap: 300,
  gapY: 120,
  pxPerScience: 24,
  cell: 10,
  pad: 8,
};
let techLayoutCache = null;
const techWires = {};
let techClick = null;
let techPress = { x: 0, y: 0 };

function routeWire(from, to, boxes) {
  const cell = techNode.cell;
  const startX = from.x + techNode.w;
  const startY = from.y + techNode.h / 2;
  const endX = to.x;
  const endY = to.y + techNode.h / 2;
  const alignY = (techNode.h / 2) % cell;
  const originX = Math.min(...boxes.map((b) => b.x)) - cell * 6;
  const originY =
    alignY +
    Math.floor(
      (Math.min(...boxes.map((b) => b.y)) - cell * 8 - alignY) / cell,
    ) *
      cell;
  const cols = Math.ceil(
    (Math.max(...boxes.map((b) => b.x)) + techNode.w + cell * 12 - originX) /
      cell,
  );
  const rows = Math.ceil(
    (Math.max(...boxes.map((b) => b.y)) + techNode.h + cell * 8 - originY) /
      cell,
  );
  const blocked = new Uint8Array(cols * rows);
  for (const box of boxes.filter((b) => b !== from && b !== to)) {
    const c0 = Math.floor((box.x - techNode.pad - originX) / cell);
    const c1 = Math.ceil((box.x + techNode.w + techNode.pad - originX) / cell);
    const r0 = Math.floor((box.y - techNode.pad - originY) / cell);
    const r1 = Math.ceil((box.y + techNode.h + techNode.pad - originY) / cell);
    for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) {
        blocked[r * cols + c] = 1;
      }
    }
  }
  const startCol = Math.ceil((startX + techNode.pad - originX) / cell);
  const endCol = Math.floor((endX - techNode.pad - originX) / cell);
  const startRow = Math.round((startY - originY) / cell);
  const endRow = Math.round((endY - originY) / cell);
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  const key = (c, r, d) => (r * cols + c) * 4 + d;
  const cost = new Map([[key(startCol, startRow, 0), 0]]);
  const back = new Map();
  const open = [];
  const push = (node) => {
    open.push(node);
    let i = open.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (open[parent].f <= open[i].f) break;
      [open[parent], open[i]] = [open[i], open[parent]];
      i = parent;
    }
  };
  const pop = () => {
    const top = open[0];
    const last = open.pop();
    if (open.length) {
      open[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let small = i;
        if (left < open.length && open[left].f < open[small].f) small = left;
        if (right < open.length && open[right].f < open[small].f) small = right;
        if (small === i) break;
        [open[small], open[i]] = [open[i], open[small]];
        i = small;
      }
    }
    return top;
  };
  push({
    c: startCol,
    r: startRow,
    d: 0,
    g: 0,
    f: Math.abs(endCol - startCol) + Math.abs(endRow - startRow),
  });
  let goal = null;
  while (open.length) {
    const cur = pop();
    if (cur.g > cost.get(key(cur.c, cur.r, cur.d))) {
      continue;
    }
    if (cur.c === endCol && cur.r === endRow && cur.d === 0) {
      goal = cur;
      break;
    }
    dirs.forEach(([dc, dr], d) => {
      const c = cur.c + dc;
      const r = cur.r + dr;
      if (c < 0 || r < 0 || c >= cols || r >= rows || blocked[r * cols + c]) {
        return;
      }
      if (Math.abs(d - cur.d) === 2) {
        return;
      }
      const g = cur.g + 1 + (d === cur.d ? 0 : 8);
      const k = key(c, r, d);
      if (g < (cost.get(k) ?? Infinity)) {
        cost.set(k, g);
        back.set(k, key(cur.c, cur.r, cur.d));
        push({
          c,
          r,
          d,
          g,
          f: g + Math.abs(endCol - c) + Math.abs(endRow - r),
        });
      }
    });
  }
  const cellPoint = (c, r) => ({
    x: originX + c * cell,
    y: originY + r * cell,
  });
  const points = [];
  if (goal) {
    let k = key(goal.c, goal.r, goal.d);
    while (k !== undefined) {
      const d = k % 4;
      const index = (k - d) / 4;
      points.push(cellPoint(index % cols, Math.floor(index / cols)));
      k = back.get(k);
    }
    points.reverse();
  } else {
    const mid = (startX + endX) / 2;
    points.push({ x: mid, y: startY }, { x: mid, y: endY });
  }
  const corners = points.filter((point, i) => {
    const last = points[i - 1];
    const next = points[i + 1];
    return (
      !last ||
      !next ||
      !(
        (last.x === point.x && next.x === point.x) ||
        (last.y === point.y && next.y === point.y)
      )
    );
  });
  const path = [{ x: startX, y: startY }, ...corners, { x: endX, y: endY }];
  path[1] = { x: path[1].x, y: startY };
  path[path.length - 2] = { x: path[path.length - 2].x, y: endY };
  return path;
}

function techLayout() {
  if (techLayoutCache) {
    return techLayoutCache;
  }
  const ids = Object.keys(techTree);
  const x = {};
  const xOf = (id) => {
    if (x[id] === undefined) {
      const parents = techParents(id);
      x[id] = parents.length
        ? Math.max(
            ...parents.map((need) => {
              const reach =
                Math.max(
                  techNode.minGap,
                  (techTree[id].cost - techTree[need].cost) *
                    techNode.pxPerScience,
                ) * (techTree[id].gapScale ?? 1);
              return xOf(need) + reach;
            }),
          )
        : 0;
    }
    return x[id];
  };
  ids.forEach(xOf);
  const layout = {};
  for (const id of [...ids].sort((a, b) => x[a] - x[b])) {
    const needs = techParents(id);
    const want = needs.length
      ? needs.reduce((sum, need) => sum + layout[need].y, 0) / needs.length
      : 0;
    const home = Math.round(want / techNode.gapY);
    const offsets = [0];
    for (let step = 1; step <= 20; step++) {
      offsets.push(step, -step);
    }
    const row = offsets
      .map((offset) => home + offset)
      .find((candidate) =>
        Object.values(layout).every(
          (other) =>
            Math.abs(other.x - x[id]) >= techNode.w + 40 ||
            Math.abs(other.y - candidate * techNode.gapY) >= techNode.gapY - 1,
        ),
      );
    layout[id] = { x: x[id], y: row * techNode.gapY };
  }
  const boxes = Object.values(layout);
  for (const id of ids) {
    for (const need of techParents(id)) {
      techWires[need + ">" + id] = routeWire(layout[need], layout[id], boxes);
    }
  }
  techLayoutCache = layout;
  return layout;
}

function resetTechView() {
  const nodes = Object.values(techLayout());
  const spanX = Math.max(...nodes.map((at) => at.x)) + techNode.w;
  const top = Math.min(...nodes.map((at) => at.y));
  const spanY = Math.max(...nodes.map((at) => at.y)) + techNode.h - top;
  techView.zoom = constrain(
    Math.min((width - 120) / spanX, (height - 150) / spanY),
    0.2,
    1,
  );
  techView.x = 60;
  techView.y = height / 2 + 30 - (top + spanY / 2) * techView.zoom;
}

function zoomTechTree(factor) {
  const next = constrain(techView.zoom * factor, 0.2, 2.5);
  const ratio = next / techView.zoom;
  techView.x = mouseX - (mouseX - techView.x) * ratio;
  techView.y = mouseY - (mouseY - techView.y) * ratio;
  techView.zoom = next;
}

function drawMilestones() {
  textSize(18);
  GUIAPI.panel(
    width * 0.88,
    height * 0.88,
    { dim: true, borderColor: "#555", id: "milestones" },
    undefined,
    (ui) => {
      ui.label("Milestones", { size: 28, align: CENTER, height: 40 });
      ui.label(
        `Science from milestones ${milestoneEarned().toLocaleString("en-US")} of ${milestonePossible().toLocaleString("en-US")}`,
        {
          align: CENTER,
          color: "#8be08b",
        },
      );
      ui.label(
        "Complete milestones to unlock science! You can get even more science from doing a milestone for the 5th, 10th, 25th, and 100th time!",
        {
          size: 13,
          align: CENTER,
          color: "#8a94a3",
        },
      );
      for (const body of milestoneBodies) {
        ui.label(body === "Speed" ? "Speed records" : body, {
          size: 22,
          color: "#ffd479",
          height: 34,
        });
        for (const kind in milestoneKinds) {
          const base = milestoneKinds[kind].science[body];
          if (base === undefined) {
            continue;
          }
          const count = career.milestones[kind + ":" + body]?.count || 0;
          const next = milestoneNext(count, kind);
          const row = ui.row(24);
          push();
          noStroke();
          textAlign(LEFT, CENTER);
          textSize(14);
          fill(count ? "#fff" : "#8a94a3");
          text(
            `${milestoneKinds[kind].label}${kind === "crewReturn" ? " " + body : ""}${milestoneKinds[kind].once ? " (one-time)" : ""}`,
            row.x + 8,
            row.y + 12,
          );
          text(
            `${count} ${count === 1 ? "visit" : "visits"}`,
            row.x + row.sx * 0.3,
            row.y + 12,
          );
          const barX = row.x + row.sx * 0.42;
          const barW = row.sx * 0.24;
          fill("#2b3038");
          rect(barX, row.y + 6, barW, 12, 4);
          fill(next ? "#5aa9ff" : "#ffd43b");
          rect(barX, row.y + 6, barW * (next ? count / next : 1), 12, 4);
          fill(next ? "#aab4c3" : "#ffd43b");
          text(
            next
              ? `visit ${next}: +${Math.round(base * milestoneTiers(kind)[next] * difficultyMult("science"))} science`
              : milestoneKinds[kind].once
                ? "claimed"
                : "every tier claimed",
            barX + barW + 14,
            row.y + 12,
          );
          pop();
        }
      }
      ui.button(
        0,
        10,
        350,
        50,
        { id: "milestones-close", ...menuStyle },
        "Close",
      );
    },
  );
}

const unlockLabels = {
  engineSize: "Engine size",
  nozzleLength: "Nozzle length",
  nozzles: "Nozzle",
  cycles: "Power cycle",
  propellants: "Propellant",
  boosters: "Booster",
};

const techZones = [
  {
    label: "Beginnings",
    ids: [
      "basicRocketry",
      "mediumSolids",
      "liquidRocketry",
      "rudimentaryGuidance",
      "aerodynamics",
    ],
  },
  {
    label: "Standard Tankage",
    ids: [
      "heavierLifting",
      "engineRefinements",
      "attitudeAdjustment",
      "crewedFlight",
      "largeSolids",
    ],
  },
  {
    label: "Heavy Lift",
    ids: [
      "bigTanks",
      "mediumEngines",
      "bigEngines",
      "heavyLift",
      "unreasonablyLargeTanks",
      "heavyGasGenerators",
      "colossalSolids",
    ],
  },
  {
    label: "Vacuum",
    ids: [
      "hydroloxTanks",
      "vacuumEngineering",
      "hydroloxRefinements",
      "extendedNozzles",
      "stagedCombustion",
    ],
  },
  {
    label: "Pinnacle",
    ids: [
      "ionPropulsion",
      "heavyEngines",
      "colossalTanks",
      "fullFlowStaged",
      "methaloxPropulsion",
    ],
  },
];

function drawTechZones(layout, z) {
  textAlign(CENTER, TOP);
  fill("#ffffff30");
  const placed = [];
  for (const zone of techZones) {
    const points = zone.ids.filter((id) => layout[id]).map((id) => layout[id]);
    if (!points.length) {
      continue;
    }
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const overlapping = Object.values(layout).filter(
      (p) => p.x <= maxX + techNode.w && p.x + techNode.w >= minX,
    );
    const minY = Math.min(...overlapping.map((p) => p.y));
    const size = Math.max(10, 64 * z);
    textSize(size);
    const cx = techView.x + ((minX + maxX) / 2 + techNode.w / 2) * z;
    const w = textWidth(zone.label);
    const h = size * 1.2;
    const top = techView.y + minY * z - size - 20;
    let box = { x: cx - w / 2, y: top, w, h };
    let moved = true;
    while (moved) {
      moved = false;
      for (const other of placed) {
        const overlapX = box.x < other.x + other.w && box.x + box.w > other.x;
        const overlapY = box.y < other.y + other.h && box.y + box.h > other.y;
        if (overlapX && overlapY) {
          box.y = other.y - box.h - 10;
          moved = true;
        }
      }
    }
    placed.push(box);
    text(zone.label, cx, box.y);
  }
}

function drawTechTree() {
  const layout = techLayout();
  const z = techView.zoom;
  GUIAPI.block(0, 0, width, height, GUIAPI.order++);
  noStroke();
  fill("#0b0e13");
  rect(0, 0, width, height);
  drawTechZones(layout, z);

  const box = (id) => ({
    x: techView.x + layout[id].x * z,
    y: techView.y + layout[id].y * z,
    w: techNode.w * z,
    h: techNode.h * z,
  });
  noFill();
  strokeWeight(Math.max(1, 2 * z));
  for (const id in techTree) {
    for (const need of techParents(id)) {
      const required = techTree[id].needs.includes(need);
      const owned = career.techs.includes(need);
      stroke(
        required
          ? owned
            ? "#ffd43b"
            : "#7a6a2a"
          : owned
            ? "#5aa9ff"
            : "#3a4250",
      );
      beginShape();
      for (const point of techWires[need + ">" + id]) {
        vertex(techView.x + point.x * z, techView.y + point.y * z);
      }
      endShape();
    }
  }

  // wires used noFill(); buttons paint a gradient but p5 skips fills when off
  fill("#000");
  textSize(Math.max(2, 16 * z));
  for (const id in techTree) {
    const tech = techTree[id];
    const b = box(id);
    if (b.x > width || b.y > height || b.x + b.w < 0 || b.y + b.h < 0) {
      continue;
    }
    const have = career.techs.includes(id);
    const open = techOpen(tech);
    const unlocksContract = tech.parts.some((part) => crewParts.includes(part));
    const style = unlocksContract
      ? { baseColor: "#8a6d1f", hoverColor: "#ab8a2a", bottomColor: "#5c4812" }
      : have
        ? { baseColor: "#1f6b2f", hoverColor: "#2f8f45", bottomColor: "#14461f" }
        : open
          ? { baseColor: "#1f4f8f", hoverColor: "#2a6ac0", bottomColor: "#143360" }
          : { baseColor: "#2b3038", hoverColor: "#2b3038", bottomColor: "#1a1d22" };
    GUIAPI.button(
      b.x,
      b.y,
      b.w,
      b.h,
      {
        id: "tech-" + id,
        ...style,
        tooltip: [
          tech.name,
          ...(unlocksContract ? ["  $ unlocks a crewed contract"] : []),
          ...(tech.features || []).map((f) => "  " + featureNames[f]),
          ...tech.parts.map((part) => "  " + part),
          ...Object.entries(tech.unlock || {}).flatMap(([key, value]) =>
            [].concat(value).map((v) =>
              key === "tankSize"
                ? `  Tank size up to ${v / c.partUnits} m`
                : typeof v === "number"
                  ? `  ${unlockLabels[key]} up to ${v}%`
                  : `  ${unlockLabels[key]}: ${v.replace(/^_|Nozzle$|Booster$/g, "").replace(/(?<=[a-z])(I+)$/, " $1")}`,
            ),
          ),
          ...Object.entries(tech.ignitionBonus || {}).map(
            ([part, bonus]) => `  +${bonus} ignitions: ${part}`,
          ),
          ...(tech.needs.length
            ? [
                "needs " +
                  tech.needs.map((need) => techTree[need].name).join(", "),
              ]
            : []),
          ...(tech.oneOf
            ? [
                "and one of " +
                  tech.oneOf.map((need) => techTree[need].name).join(", "),
              ]
            : []),
        ],
      },
      `${unlocksContract ? "$ " : ""}${tech.name}\n${have ? "researched" : tech.cost + " science"}`,
    );
  }

  noStroke();
  fill("#0b0e13ee");
  rect(0, 0, width, 70);
  fill("#fff");
  textAlign(LEFT, CENTER);
  textSize(24);
  text(`Tech Tree   Science ${career.science}`, 24, 35);
  textAlign(RIGHT, CENTER);
  textSize(13);
  fill("#8a94a3");
  textAlign(LEFT, BASELINE);
  textSize(18);
  GUIAPI.button(
    width - 150,
    15,
    130,
    40,
    { id: "tech-close", ...menuStyle },
    "Close",
  );
  GUIAPI.drawTooltip();
  cursor(mouseIsPressed ? "grabbing" : "grab");
}
