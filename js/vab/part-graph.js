const attachSides = ["top", "bottom", "left", "right"];

function flipPart(part, axis) {
  const key = axis ? "_flipY" : "_flipX";
  if (!part[key]) {
    const { _bbox, _reach, _mainGroup, _profile, _flipX, _flipY, ...rest } = part;
    part[key] = {
      ...rest,
      flip: { ...part.flip, [axis ? "y" : "x"]: !part.flip?.[axis ? "y" : "x"] },
      groups: part.groups.map((g) => ({
        ...g,
        points: g.points.map(([x, y]) => (axis ? [x, -y] : [-x, y])),
      })),
    };
    part[key][key] = part;
  }
  return part[key];
}

function isTank(part) {
  const m = part.modules || {};
  return !!m["Resource Module"] && !m["Engine Module"];
}

function hasNozzle(part) {
  return !isBooster(part) && part.groups.some((g) => g.nozzle);
}

function isBooster(part) {
  const m = part.modules || {};
  return !!m["Resource Module"] && !!m["Engine Module"]?.["SRB Mode"];
}

function isProcedural(part) {
  return isTank(part) || hasNozzle(part) || isBooster(part);
}

function derive(part, change) {
  const base = part._base || part;
  const { _bbox, _reach, _mainGroup, _profile, _flipX, _flipY, ...rest } = base;
  let out = { ...rest, _base: base, ...change(base) };
  if (!!part.flip?.x !== !!base.flip?.x) out = flipPart(out, 0);
  if (!!part.flip?.y !== !!base.flip?.y) out = flipPart(out, 1);
  return out;
}

function fuelOf(part) {
  return (
    part.fuel ??
    Object.keys(tankFuels).find(
      (k) => tankFuels[k].resource === part.modules["Resource Module"].Resource,
    )
  );
}

function resizePart(part, w, h, fuel = fuelOf(part)) {
  return derive(part, (base) => {
    const k = (w / base.size[0]) * (h / base.size[1]);
    const resource = base.modules["Resource Module"];
    const own = tankFuels[fuelOf(base)]?.density ?? 1;
    const amount = (resource.Amount / own) * tankFuels[fuel].density * k;
    return {
      size: [w, h],
      fuel,
      mass: (base.mass - resource.Amount) * k + amount,
      modules: {
        ...base.modules,
        "Resource Module": {
          ...resource,
          Resource: tankFuels[fuel].resource,
          Amount: amount,
        },
      },
      groups: base.groups.map((g) => ({
        ...g,
        points: g.points.map(([x, y]) => [(x * w) / base.size[0], (y * h) / base.size[1]]),
      })),
    };
  });
}

function nozzleRange(groups) {
  const pts = groups.filter((g) => g.nozzle).flatMap((g) => g.points);
  const ys = pts.map((p) => p[1]);
  const xs = pts.map((p) => p[0]);
  const top = Math.min(...ys);
  const centre = (Math.min(...xs) + Math.max(...xs)) / 2;
  const throat = Math.max(
    ...pts.filter((p) => p[1] <= top + 1e-6).map((p) => Math.abs(p[0] - centre)),
  );
  return { top, centre, throat, length: Math.max(...ys) - top };
}

function clipBelow(points, cutY) {
  const out = [];
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    const aIn = a[1] <= cutY;
    if (aIn) out.push(a);
    if (aIn !== (b[1] <= cutY)) {
      const t = (cutY - a[1]) / (b[1] - a[1]);
      out.push([a[0] + (b[0] - a[0]) * t, cutY]);
    }
  });
  return out;
}

const fixedNozzles = ["_MegaNozzle"];

const lockedCycles = { _MegaNozzle: "F-1 Gas Generator" };

function nozzleTypes() {
  return loaded
    .flatMap((pack) => pack.parts.map((part) => part.name))
    .filter((name) => /^_.+Nozzle$/.test(name));
}

const engineDefaults = {
  type: "_BasisINozzle",
  pct: 100,
  size: 100,
  throat: 100,
  propellant: "Kerolox",
  cycle: "Gas Generator",
  pressure: 100,
};

const propellants = {
  Kerolox: { density: 1, cost: 1, resource: "Kerolox", isp: 315, pressure: 1 },
  Methalox: { density: 0.85, cost: 1.1, resource: "Methalox", isp: 350, pressure: 1.1 },
  Hydrolox: { density: 0.55, cost: 1.5, resource: "Hydrolox", isp: 402, pressure: 0.9 },
  Solid: { density: 1.6, cost: 0.4, resource: "Solid Fuel", isp: 250, pressure: 0.5, srb: true },
  Monopropellant: { density: 1.1, cost: 0.5, resource: "Monopropellant", isp: 220, pressure: 0.3 },
};

const tankFuels = {
  ...propellants,
  Xenon: { resource: "Xenon", density: 1.9 },
};

const cycles = {
  "Full Flow Staged": { range: [200, 300], isp: 1.045, mass: 2.5, cost: 20000000 },
  Staged: { range: [120, 250], isp: 1.025, mass: 1.8, cost: 12000000 },
  "F-1 Gas Generator": { range: [50, 80], isp: 0.97, mass: 1.2, cost: 4000000 },
  "Gas Generator": { range: [40, 150], isp: 1, mass: 1, cost: 2000000 },
  Electric: { range: [1, 10], isp: 0.9, mass: 0.5, cost: 300000 },
};

const nozzleStats = {
  _BasisINozzle: { ratio: 16, area: 0.943, mass: 1, isp: 1 },
  _BasisIINozzle: { ratio: 20, area: 1.1, mass: 1.35, isp: 1.03 },
  _GammaNozzle: { ratio: 69, area: 3.9, mass: 1.5, isp: 1 },
  _AlphaNozzle: { ratio: 21.5, area: 4.1, mass: 1.3, isp: 1 },
  _MegaNozzle: { ratio: 16, area: 10, mass: 9.3, isp: 1 },
};

function pressureRange(o) {
  return cycles[o.cycle].range.map((v) =>
    Math.max(Math.round(v * propellants[o.propellant].pressure), 1),
  );
}

function shapeEngine(part, opts = {}) {
  const o = { ...engineDefaults, ...part.config, ...opts };
  if (fixedNozzles.includes(o.type)) {
    o.pct = 100;
  }
  o.cycle = lockedCycles[o.type] ?? o.cycle;
  const [lo, hi] = pressureRange(o);
  o.pressure = constrain(o.pressure, lo, hi);
  const prop = propellants[o.propellant];
  const s = o.size / 100;
  const t = o.throat / 100;
  return derive(part, (base) => {
    const mount = nozzleRange(base.groups).top;
    let groups = base.groups;
    let nozzles = base.groups.filter((g) => g.nozzle);
    const source = hiddenPart(o.type);
    if (source) {
      const dy = mount - nozzleRange(source.groups).top;
      const moved = source.groups.map((g) => ({
        ...g,
        points: g.points.map(([x, y]) => [x, y + dy]),
      }));
      nozzles = moved.filter((g) => g.nozzle);
      groups = moved.some((g) => !g.nozzle)
        ? moved
        : base.groups.map((g) => (g.nozzle ? nozzles[0] : g));
    }
    const { top, centre, throat, length } = nozzleRange(nozzles);
    const exit = Math.max(...nozzles.flatMap((g) => g.points.map(([x]) => Math.abs(x - centre))));
    const k = o.pct / 100;
    const grow = (x) => {
      const r = Math.abs(x - centre);
      return centre + Math.sign(x - centre) * (r + (k - 1) * Math.max(r - throat, 0));
    };
    const shaped = nozzles
      .map((g) => ({
        ...g,
        points:
          k <= 1
            ? clipBelow(g.points, top + length * k)
            : g.points.map(([x, y]) => [grow(x), top + (y - top) * k]),
      }))
      .filter((g) => g.points.length >= 3);
    let placed = false;
    const engine = base.modules["Engine Module"];
    const exitNow = Math.max(
      ...shaped.flatMap((g) => g.points.map(([x]) => Math.abs(x - centre))),
    );
    const nozzle = nozzleStats[o.type] ?? nozzleStats._BasisINozzle;
    const ratio = (nozzle.ratio * Math.pow(exitNow / throat, 2)) / Math.pow(exit / throat, 2) / (t * t);
    const pc = o.pressure / 100;
    const coefficient = (r) => 1.45 + 0.12 * Math.log(r);
    const exitArea = nozzle.area * s * s * Math.pow(exitNow / exit, 2);
    const throatArea = (nozzle.area / nozzle.ratio) * s * s * t * t;
    const ispVac =
      prop.isp * cycles[o.cycle].isp * nozzle.isp * Math.pow(pc, 0.03) * coefficient(ratio) / coefficient(16);
    const thrustVac = Math.min(
      o.pressure * 100 * throatArea * coefficient(ratio),
      900 * nozzle.area * s * s * coefficient(ratio),
    );
    const separation = Math.min((o.pressure * Math.pow(ratio, -1.4)) / 0.405, 1);
    const seaLoss = Math.max(1 - (101.325 * exitArea) / thrustVac, 0) * Math.pow(separation, 1.5);
    const mass =
      base.mass * s * s * cycles[o.cycle].mass * nozzle.mass * Math.sqrt(pc) * (0.5 + 0.5 * t * t);
    return {
      config: o,
      mass,
      stats: {
        cost: cycles[o.cycle].cost * Math.max(1, Math.pow(thrustVac / 1000, 0.8)) * prop.cost,
        mass,
        ispVac,
        ispSea: ispVac * seaLoss,
        thrustVac,
        thrustSea: thrustVac * seaLoss,
        ratio,
      },
      modules: {
        ...base.modules,
        "Engine Module": {
          ...engine,
          Resource: prop.resource,
          "SRB Mode": !!prop.srb,
          ISP: ispVac,
          Thrust: thrustVac,
        },
      },
      groups: groups
        .flatMap((g) => {
          if (!g.nozzle) return [g];
          if (placed) return [];
          placed = true;
          return shaped;
        })
        .map((g) => ({ ...g, points: g.points.map(([x, y]) => [x * s, y * s]) })),
    };
  });
}

const boosterDefaults = { type: "_StoatBooster", pressure: 60, nozzle: 100 };

function boosterTypes() {
  return loaded
    .flatMap((pack) => pack.parts.map((part) => part.name))
    .filter((name) => /^_.+Booster$/.test(name));
}

function groupBounds(groups) {
  const points = groups.flatMap((g) => g.points);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

function casingSize(src) {
  const body = groupBounds(src.groups.filter((g) => !g.nozzle));
  return [body.x1 - body.x0, body.y1 - body.y0];
}

function shapeBooster(part, opts = {}) {
  const type = opts.type ?? part.config?.type ?? boosterDefaults.type;
  const src = hiddenPart(type);
  const [bw, bh] = casingSize(src);
  const o = { ...boosterDefaults, width: bw, height: bh, ...part.config, ...opts };
  o.pressure = constrain(o.pressure, 20, 100);
  const kx = o.width / bw;
  const ky = o.height / bh;
  const n = o.nozzle / 100;
  const pc = o.pressure / 60;
  const engine = src.modules["Engine Module"];
  const resource = src.modules["Resource Module"];
  const amount = resource.Amount * kx * ky;
  const mass = (src.mass - resource.Amount) * (0.7 * kx * ky + 0.3 * n * n) + amount;
  const thrust = engine.Thrust * n * n * pc;
  const isp = engine.ISP * Math.pow(pc, 0.1);
  const body = groupBounds(src.groups.filter((g) => !g.nozzle));
  const bottom = body.y0 + o.height;
  return derive(part, () => ({
    config: o,
    mass,
    size: [o.width, o.height],
    booster: { mass, isp, thrust, burn: (amount * isp * 9.80665) / thrust },
    modules: {
      ...src.modules,
      "Engine Module": { ...engine, Thrust: thrust, ISP: isp },
      "Resource Module": { ...resource, Amount: amount },
    },
    groups: src.groups.map((g) => ({
      ...g,
      points: g.points.map(([x, y]) =>
        g.nozzle
          ? [x * n, bottom + (y - body.y1) * n]
          : [x * kx, body.y0 + (y - body.y0) * ky],
      ),
    })),
  }));
}

function fitUnlocks(part) {
  if (!careerMode) {
    return part;
  }
  const has = (key, all, value) => unlocked(key, all).includes(value);
  if (hasNozzle(part)) {
    const o = { ...engineDefaults, ...part.config };
    const fit = {
      size: Math.min(o.size, unlocked("engineSize", 400)),
      pct: Math.min(o.pct, unlocked("nozzleLength", 200)),
      type: has("nozzles", nozzleTypes(), o.type) ? o.type : engineDefaults.type,
      cycle: has("cycles", Object.keys(cycles), o.cycle) ? o.cycle : engineDefaults.cycle,
      propellant: has("propellants", Object.keys(propellants), o.propellant)
        ? o.propellant
        : engineDefaults.propellant,
    };
    return Object.keys(fit).every((k) => fit[k] === o[k]) ? part : shapeEngine(part, fit);
  }
  if (isTank(part)) {
    const cap = unlocked("tankSize", 20000);
    const fuel = fuelOf(part);
    const size = part.size.map((v) => Math.min(v, cap));
    const safe = has("propellants", Object.keys(tankFuels), fuel) ? fuel : "Kerolox";
    return size.every((v, i) => v === part.size[i]) && safe === fuel
      ? part
      : resizePart(part, ...size, safe);
  }
  if (isBooster(part)) {
    const type = part.config?.type ?? boosterDefaults.type;
    if (has("boosters", boosterTypes(), type)) {
      return part;
    }
    const [width, height] = casingSize(hiddenPart(unlocked("boosters", boosterTypes())[0]));
    return shapeBooster(part, { type: unlocked("boosters", boosterTypes())[0], width, height });
  }
  return part;
}

function resizeInst(inst, part) {
  inst.part = part;
  const seat = (child, parent, side) => {
    const a = attachPoint(parent, side);
    const b = attachPoint(child, child.childNode);
    moveSubtree(child, a.x - b.x, a.y - b.y);
  };
  if (inst.attachedTo) {
    seat(inst, inst.attachedTo, inst.parentNode);
  }
  for (const child of vab.parts) {
    if (child.attachedTo === inst) {
      seat(child, inst, child.parentNode);
    }
  }
}

function opposite(side) {
  return { top: "bottom", bottom: "top", left: "right", right: "left" }[side];
}

function attachPoint(inst, side) {
  const reach = partReach(inst.part);
  const base = {
    top: [0, -reach.top * vab.scale],
    bottom: [0, reach.bottom * vab.scale],
    left: [-reach.left * vab.scale, 0],
    right: [reach.right * vab.scale, 0],
  }[side];
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: inst.x + base[0] * cos - base[1] * sin,
    y: inst.y + base[0] * sin + base[1] * cos,
  };
}

function attach(child, parent, side) {
  child.attachedTo = parent;
  child.parentNode = side;
  child.childNode = opposite(side);
}

function detach(inst) {
  inst.attachedTo = null;
  inst.parentNode = null;
  inst.childNode = null;
}

function subtree(inst, acc = []) {
  acc.push(inst);
  for (const p of vab.parts) {
    if (p.attachedTo === inst) {
      subtree(p, acc);
    }
  }
  return acc;
}

function cloneParts(list) {
  const copies = list.map((p) => ({
    part: p.part,
    x: p.x,
    y: p.y,
    rot: p.rot || 0,
    paint: p.paint ? { ...p.paint } : undefined,
    attachedTo: null,
    parentNode: null,
    childNode: null,
  }));
  list.forEach((p, i) => {
    const pi = list.indexOf(p.attachedTo);
    if (pi >= 0) {
      copies[i].attachedTo = copies[pi];
      copies[i].parentNode = p.parentNode;
      copies[i].childNode = p.childNode;
    }
  });
  return copies;
}

function moveSubtree(inst, dx, dy) {
  for (const p of subtree(inst)) {
    p.x += dx;
    p.y += dy;
  }
}

function nodeDisabled(inst, side) {
  const list = ((inst.part.modules || {})["Connection Disabler Module"] || {})[
    "Connections to Disable"
  ];
  if (!Array.isArray(list)) {
    return false;
  }
  return list.some((name) => String(name).toLowerCase() === side);
}

function nodeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  if (inst.attachedTo && inst.childNode === side) {
    return true;
  }
  return vab.parts.some((p) => p.attachedTo === inst && p.parentNode === side);
}

function heldNodeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  return vab.parts.some((p) => p.attachedTo === inst && p.parentNode === side);
}

function toLocal(inst, x, y) {
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = x - inst.x;
  const dy = y - inst.y;
  return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
}

function toWorld(inst, lx, ly) {
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: inst.x + lx * cos - ly * sin, y: inst.y + lx * sin + ly * cos };
}

function alongAxis(side) {
  return side === "top" || side === "bottom" ? "x" : "y";
}

// how far a part reaches either way along an edge of another, given the two
// may be turned differently
function halfExtentAlong(child, parent, side) {
  const bb = partBBox(child.part);
  const halfW = (bb.w / 2) * vab.scale;
  const halfH = (bb.h / 2) * vab.scale;
  const rel = ((child.rot || 0) - (parent.rot || 0)) * HALF_PI;
  const c = Math.abs(Math.cos(rel));
  const s = Math.abs(Math.sin(rel));
  const alongX = alongAxis(side) === "x";
  return alongX ? halfW * c + halfH * s : halfW * s + halfH * c;
}

function halfEdge(parent, side) {
  const bb = partBBox(parent.part);
  return (alongAxis(side) === "x" ? bb.w / 2 : bb.h / 2) * vab.scale;
}

// where along the edge a part already attached to it sits
function positionAlong(child, parent, side) {
  const p = attachPoint(child, child.childNode);
  const local = toLocal(parent, p.x, p.y);
  return alongAxis(side) === "x" ? local.x : local.y;
}

function edgeFree(parent, side, child, at) {
  const reach = halfExtentAlong(child, parent, side);
  return !vab.parts.some((p) => {
    if (p === child || p.attachedTo !== parent || p.parentNode !== side) {
      return false;
    }
    const other = positionAlong(p, parent, side);
    const otherReach = halfExtentAlong(p, parent, side);
    return Math.abs(other - at) < reach + otherReach - 0.5;
  });
}

function edgePoint(parent, side, child) {
  const mine = attachPoint(child, opposite(side));
  const local = toLocal(parent, mine.x, mine.y);
  const centre = attachPoint(parent, side);
  const centreLocal = toLocal(parent, centre.x, centre.y);
  const axis = alongAxis(side);
  const room = halfEdge(parent, side) - halfExtentAlong(child, parent, side);
  let at = axis === "x" ? local.x : local.y;
  if (room <= 0 || Math.abs(at) < 12) {
    at = 0;
  } else {
    at = Math.max(-room, Math.min(room, at));
  }
  const world =
    axis === "x"
      ? toWorld(parent, at, centreLocal.y)
      : toWorld(parent, centreLocal.x, at);
  return { point: world, at };
}

// a side an edge, so it counts as taken only when disabled or already used to
// hang from something above; the children on it are handled by edgeFree
function edgeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  return !!(inst.attachedTo && inst.childNode === side);
}

function jointOptions(inst) {
  const blocked = new Set(subtree(inst));
  const out = [];
  for (const other of vab.parts) {
    if (blocked.has(other)) {
      continue;
    }
    for (const side of attachSides) {
      if (side === "top") {
        if (edgeTaken(other, "top") || edgeTaken(inst, "bottom")) {
          continue;
        }
        if (
          vab.parts.some(
            (p) => p.attachedTo === other && p.parentNode === "top",
          )
        ) {
          continue;
        }
        const { at } = edgePoint(inst, "bottom", other);
        if (!edgeFree(inst, "bottom", other, at)) {
          continue;
        }
        out.push({ target: other, side, point: attachPoint(other, "top") });
        continue;
      }
      if (edgeTaken(other, side) || edgeTaken(inst, opposite(side))) {
        continue;
      }
      if (
        vab.parts.some(
          (p) => p.attachedTo === inst && p.parentNode === opposite(side),
        )
      ) {
        continue;
      }
      const { point, at } = edgePoint(other, side, inst);
      if (!edgeFree(other, side, inst, at)) {
        continue;
      }
      out.push({ target: other, side, point });
    }
  }
  return out;
}

function findSnap(inst) {
  const bb = partBBox(inst.part);
  const reach = Math.max(24, Math.min(bb.w, bb.h) * vab.scale * 0.5);
  let best = null;
  let bestDist = reach;
  for (const option of jointOptions(inst)) {
    // for a top the meeting spot is on inst's own bottom edge, slid to where
    // the other part is; for anything else it's inst's opposite point
    const mine =
      option.side === "top"
        ? edgePoint(inst, "bottom", option.target).point
        : attachPoint(inst, opposite(option.side));
    const d = Math.hypot(option.point.x - mine.x, option.point.y - mine.y);
    if (d < bestDist) {
      bestDist = d;
      best = {
        target: option.target,
        point: option.point,
        side: option.side,
        dx: option.point.x - mine.x,
        dy: option.point.y - mine.y,
        mode: option.side,
      };
    }
  }
  if (!best) {
    const mid = craftCentre(new Set(subtree(inst)));
    if (Math.abs(inst.x - mid) < reach) {
      best = {
        target: null,
        point: null,
        dx: mid - inst.x,
        dy: 0,
        mode: "centre",
      };
    }
  }
  return best;
}

function validMoves(inst) {
  return jointOptions(inst);
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0],
      yi = points[i][1];
    const xj = points[j][0],
      yj = points[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPart(inst, mx, my) {
  const bb = partBBox(inst.part);
  const a = -(inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = (mx - inst.x) / vab.scale;
  const dy = (my - inst.y) / vab.scale;
  const lx = dx * cos - dy * sin + bb.cx;
  const ly = dx * sin + dy * cos + bb.cy;
  for (const group of inst.part.groups) {
    if (group.noCollision) {
      continue;
    }
    if (pointInPolygon(lx, ly, group.points)) {
      return true;
    }
  }
  return false;
}

function partIsToggleable(part) {
  const m = part.modules || {};
  return !!(
    m["Togglable Module"] ||
    m["Engine Module"] ||
    m["Decoupler Module"] ||
    m["Parachute Module"]
  );
}

function partAt(mx, my) {
  for (let i = vab.parts.length - 1; i >= 0; i--) {
    if (pointInPart(vab.parts[i], mx, my)) {
      return vab.parts[i];
    }
  }
  return null;
}

function drawStageReadout(panelW) {
  const stages = stageBreakdown();
  if (!stages.length) {
    return;
  }
  let total = 0;
  for (const stage of stages) {
    total += stage.dv;
  }
  push();
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  fill("#eee");
  let y = 14;
  text(`dv ${Math.round(total)} m/s`, panelW + 14, y);
  textSize(11);
  fill("#aaa");
  for (let i = 0; i < stages.length; i++) {
    y += 15;
    const stage = stages[i];
    const twr =
      stage.wetMass > 0 ? stage.thrust / (stage.wetMass * 9.80665) : 0;
    text(
      `s${i + 1}  ${Math.round(stage.dv)} m/s   twr ${twr.toFixed(2)}   ${(stage.wetMass / c.kgPerTon).toFixed(1)}t`,
      panelW + 14,
      y,
    );
  }
  textAlign(LEFT, BASELINE);
  pop();
}
