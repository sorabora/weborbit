const flameColors = {
  Kerolox: { glow: "#ff6a00", mid: "#ffa629", core: "#fff1b0", soot: 0.5 },
  Methalox: { glow: "#3d7bff", mid: "#ff9a3c", core: "#cfe4ff", soot: 0.15 },
  Hydrolox: { glow: "#5a8dff", mid: "#9cc4ff", core: "#eef6ff", soot: 0 },
  Solid: { glow: "#ff4a00", mid: "#ff8a1a", core: "#ffe08a", soot: 1 },
  Monopropellant: { glow: "#ffb347", mid: "#ffe08a", core: "#ffffff", soot: 0.2 },
};
let flameBody = "Earth";
let flameAlt = 0;

function flameEdge(i, n, t, speed, amount) {
  return (noise(i * 0.35, t * speed) - 0.5) * amount;
}

function flameLayer(cx, top, len, wTop, wMid, t, speed, wobble, col, alpha) {
  const n = 18;
  const edge = (side) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const k = i / n;
      const bulge = Math.sin(Math.min(k * 2.2, 1) * HALF_PI);
      const w = lerp(wTop, wMid, bulge) * (1 - Math.pow(k, 2.4));
      const jitter = flameEdge(i + side * 40, n, t, speed, wobble * k * wTop * 0.6);
      return [cx + side * w + jitter, top + k * len];
    });
  const pts = [...edge(-1), ...edge(1).reverse()];
  const c = color(col);
  c.setAlpha(alpha);
  fill(c);
  noStroke();
  beginShape();
  pts.forEach(([x, y]) => vertex(x, y));
  endShape(CLOSE);
}

function drawFlame(cx, top, exit, inst) {
  const srb = isBooster(inst.part);
  const cfg = srb ? { ...boosterDefaults, ...inst.part.config } : { ...engineDefaults, ...inst.part.config };
  const stats = srb
    ? { thrustVac: (inst.part.booster ?? shapeBooster(inst.part).booster).thrust }
    : inst.part.stats ?? shapeEngine(inst.part).stats;
  stats.thrustSea ??= stats.thrustVac * 0.9;
  const [lo, hi] = srb ? [20, 100] : pressureRange(cfg);
  const pn = constrain((cfg.pressure - lo) / Math.max(hi - lo, 1), 0, 1);
  const col = flameColors[srb ? "Solid" : cfg.propellant] ?? flameColors.Kerolox;
  const t = millis() / 1000;
  const speed = 2 + pn * 5;
  const body = getBody(flameBody);
  const air = constrain(pressureAt(body, flameAlt * 1000) / 101325, 0, 1);
  const thrust = stats.thrustVac * (1 - (1 - stats.thrustSea / stats.thrustVac) * air);
  const power = constrain(Math.log10(thrust + 1) / 4, 0.2, 1);
  const len = exit * 14.5 * (0.5 + 0.5 * pn) * (0.6 + 0.4 * power) * (1.1 - 0.1 * air);
  const spread = lerp(1.3, 0.9, air);
  push();
  noStroke();
  const glow = (1 - col.soot * 0.4) * (0.5 + 0.5 * pn);
  flameLayer(cx, top, len * 1.1, exit, exit * spread * 1.4, t, speed, 0.5 + pn, col.glow, 90 * glow);
  flameLayer(cx, top, len * 0.85, exit, exit * spread, t + 9, speed * 1.3, 0.35 + pn * 0.5, col.mid, 170);
  flameLayer(cx, top, len * 0.5, exit * 0.75, exit * 0.6, t + 21, speed * 1.8, 0.2, col.core, 230);
  if (air > 0.3 && pn > 0.2) {
    const diamonds = Math.round(2 + pn * 4);
    const c = color(col.core);
    c.setAlpha(190);
    fill(c);
    for (let i = 0; i < diamonds; i++) {
      const dy = top + ((i + 0.6) * len * 0.55) / diamonds;
      const dw = exit * 0.45 * (1 - i / (diamonds + 1)) * (0.8 + 0.2 * Math.sin(t * speed * 3 + i));
      quad(cx - dw, dy, cx, dy - dw * 0.7, cx + dw, dy, cx, dy + dw * 0.7);
    }
  }
  if (col.soot > 0.4) {
    for (let i = 0; i < 14; i++) {
      const k = (t * (0.6 + noise(i) * 0.8) + i * 0.37) % 1;
      fill(255, 190, 90, 220 * (1 - k));
      circle(cx + (noise(i, 5) - 0.5) * exit * 2.5 * (0.5 + k) * spread, top + k * len * 1.2, 2 + 2 * (1 - k));
    }
  }
  pop();
}

function drawVabFlame(inst) {
  if (!inst.part.modules?.["Engine Module"]) {
    return;
  }
  const bb = partBBox(inst.part);
  const nozzles = inst.part.groups.filter((g) => g.nozzle);
  const points = (nozzles.length ? nozzles : inst.part.groups).flatMap((g) => g.points);
  const maxY = Math.max(...points.map((p) => p[1]));
  const minY = Math.min(...points.map((p) => p[1]));
  const bottom = points.filter((p) => p[1] >= maxY - (maxY - minY) * 0.03).map((p) => p[0]);
  const lo = Math.min(...bottom);
  const hi = Math.max(...bottom);
  const cx = inst.x + ((lo + hi) / 2 - bb.cx) * vab.scale;
  const top = inst.y + (maxY - bb.cy) * vab.scale;
  drawFlame(cx, top, ((hi - lo) / 2) * vab.scale, inst);
}

function flameEnvironment(ui) {
  const names = planets.filter((p) => p.atmosphereHeight).map((p) => p.id);
  ui.label("Flame", { size: 14, color: "#5aa9ff", height: 24 });
  const pick = ui.dropdown(0, 0, undefined, 34, { id: "flame-body", ...menuStyle }, names, Math.max(names.indexOf(flameBody), 0));
  flameBody = names[pick];
  flameAlt = Math.round(
    ui.slider(
      0,
      0,
      undefined,
      28,
      {
        id: "flame-alt",
        min: 0,
        max: 140,
        format: (v) => `Altitude: ${Math.round(v)} km`,
        edit: (v) => `${Math.round(v)}`,
      },
      flameAlt,
    ),
  );
}
