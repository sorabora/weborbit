async function loadPartTextures() {
  const wanted = new Set();
  for (const pack of loaded) {
    for (const part of pack.parts) {
      for (const group of part.groups) {
        if (group.texture) {
          wanted.add(group.texture);
        }
        if (group.shapeTexture) {
          wanted.add(group.shapeTexture);
        }
      }
    }
  }
  for (const name of wanted) {
    try {
      textures[name] = await loadImage(`assets/${name}`);
    } catch (err) {
      console.warn(`texture missing: assets/${name}`);
    }
  }
}

function partSets(part) {
  if (!part.setInfo) {
    const spans = new Map();
    let tagged = false;
    part.groups.forEach((group, gi) => {
      if (group.set !== undefined) {
        tagged = true;
      }
      const key = group.set === undefined ? gi : group.set;
      const span = spans.get(key) || {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      };
      for (const [px, py] of group.points) {
        span.minX = Math.min(span.minX, px);
        span.maxX = Math.max(span.maxX, px);
        span.minY = Math.min(span.minY, py);
        span.maxY = Math.max(span.maxY, py);
      }
      spans.set(key, span);
    });
    const centres = new Map();
    for (const [key, span] of spans) {
      centres.set(key, {
        x: (span.minX + span.maxX) / 2,
        y: (span.minY + span.maxY) / 2,
      });
    }
    part.setInfo = { tagged, centres };
  }
  return part.setInfo;
}

function setOfGroup(part, gi) {
  const group = part.groups[gi];
  return group.set === undefined ? gi : group.set;
}

function groupPath(points, bb, sx, sy, sw, sh, into, stretch) {
  const path = into || new Path2D();
  if (!points.length) {
    return path;
  }
  const pivot = stretch ? stretch.pivot || groupCentre(points) : null;
  const at = (i) => {
    let [px, py] = points[(i + points.length) % points.length];
    if (stretch) {
      px = pivot.x + (px - pivot.x) * stretch.wide;
      py = pivot.y + (py - pivot.y) * stretch.tall;
    }
    return { x: sx + (px - bb.cx) * sw, y: sy + (py - bb.cy) * sh };
  };
  const smooth = (i) => !!points[(i + points.length) % points.length][2];
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const first = smooth(0) ? mid(at(-1), at(0)) : at(0);
  path.moveTo(first.x, first.y);
  for (let i = 0; i < points.length; i++) {
    const cur = at(i);
    if (smooth(i)) {
      const from = mid(at(i - 1), cur);
      const to = mid(cur, at(i + 1));
      path.lineTo(from.x, from.y);
      path.quadraticCurveTo(cur.x, cur.y, to.x, to.y);
    } else {
      path.lineTo(cur.x, cur.y);
    }
  }
  path.closePath();
  return path;
}

function groupCentre(points) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [px, py] of points) {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

function groupFillOn(ctx, group, bb, sx, sy, sw, sh) {
  if (!group.gradient) {
    return group.fill;
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [px, py] of group.points) {
    const x = sx + (px - bb.cx) * sw;
    const y = sy + (py - bb.cy) * sh;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const a = radians(group.gradient.angle || 0);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const half =
    (Math.abs(Math.cos(a)) * (maxX - minX) +
      Math.abs(Math.sin(a)) * (maxY - minY)) /
    2;
  const paint = ctx.createLinearGradient(
    cx - Math.cos(a) * half,
    cy - Math.sin(a) * half,
    cx + Math.cos(a) * half,
    cy + Math.sin(a) * half,
  );
  paint.addColorStop(0, withAlpha(group.fill, group.gradient.fromOpacity));
  paint.addColorStop(
    1,
    withAlpha(group.gradient.to || group.fill, group.gradient.toOpacity),
  );
  return paint;
}

function withAlpha(hex, alpha) {
  if (alpha === undefined || alpha >= 1) {
    return hex;
  }
  let body = String(hex).replace("#", "");
  if (body.length === 3) {
    body = body
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const n = parseInt(body, 16);
  if (Number.isNaN(n)) {
    return hex;
  }
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(alpha, 0)})`;
}

function groupExtent(points, bb, sw, sh, stretch) {
  const pivot = stretch ? stretch.pivot || groupCentre(points) : null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let [px, py] of points) {
    if (stretch) {
      px = pivot.x + (px - pivot.x) * stretch.wide;
      py = pivot.y + (py - pivot.y) * stretch.tall;
    }
    const x = (px - bb.cx) * sw;
    const y = (py - bb.cy) * sh;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

const FIT_TEXTURES = /^Flag_/;

// a texture scaled about the middle of its box, 1 or unset leaves it alone
function scaledRect(x, y, w, h, scale) {
  const k = scale > 0 ? scale : 1;
  return {
    x: x + (w - w * k) / 2,
    y: y + (h - h * k) / 2,
    w: w * k,
    h: h * k,
  };
}

function paintGroup(ctx, spec) {
  const { group, part, bb, sx, sy, sw, sh, cutouts, stretch, glow, alpha } =
    spec;
  ctx.save();
  try {
    ctx.globalAlpha = alpha;
    const solid = groupPath(group.points, bb, sx, sy, sw, sh, null, stretch);
    const holed = groupPath(group.points, bb, sx, sy, sw, sh, null, stretch);
    for (const cut of cutouts) {
      groupPath(cut.points, bb, sx, sy, sw, sh, holed);
    }
    // the launch site's flag follows the country the player picked
    const texture =
      group.texture === "Flag_Japan.png"
        ? flagImage(drawFlagCountry || playerCountry) || textures[group.texture]
        : textures[group.texture];
    const source = texture && (texture.canvas || texture.elt || null);
    if (glow > 0) {
      ctx.filter = `blur(${glow}px)`;
    }
    const clipGroup = () => {
      if (glow <= 0 || source) {
        ctx.clip(solid);
        if (cutouts.length) {
          ctx.clip(holed, "evenodd");
        }
      }
    };
    // a scaled texture is allowed to leak past the group, so it skips the clip
    ctx.save();
    if (!(source && group.textureScale)) {
      clipGroup();
    }
    if (source) {
      // not image()/tint(): p5 tints through a buffer that ignores the clip
      // and lands at half size on retina
      // flags and other whole pictures stretch to their own group, untinted,
      // instead of being cropped out of the part's box
      const fit = FIT_TEXTURES.test(group.texture || "");
      const tinted =
        !fit &&
        !group.untinted &&
        group.fill &&
        group.fill.toLowerCase() !== "#ffffff"
          ? tintedTexture(group.texture, source, group.fill)
          : source;
      if (fit) {
        const ext = groupExtent(group.points, bb, sw, sh, stretch);
        const r = scaledRect(
          sx + ext.minX,
          sy + ext.minY,
          ext.maxX - ext.minX,
          ext.maxY - ext.minY,
          group.textureScale,
        );
        ctx.drawImage(tinted, r.x, r.y, r.w, r.h);
      } else {
        const r = scaledRect(
          sx + (bb.minX - bb.cx) * sw,
          sy + (bb.minY - bb.cy) * sh,
          bb.w * sw,
          bb.h * sh,
          group.textureScale,
        );
        ctx.drawImage(tinted, r.x, r.y, r.w, r.h);
      }
    } else {
      ctx.fillStyle =
        spec.recolor || groupFillOn(ctx, group, bb, sx, sy, sw, sh);
      ctx.fill(holed, "evenodd");
    }
    ctx.restore();
    const overlay = textures[group.shapeTexture];
    const overlaySource =
      glow <= 0 && overlay && (overlay.canvas || overlay.elt || null);
    if (overlaySource) {
      const tint =
        group.shapeTint && group.shapeTint.toLowerCase() !== "#ffffff"
          ? tintedTexture(group.shapeTexture, overlaySource, group.shapeTint)
          : overlaySource;
      const r = scaledRect(
        sx + (bb.minX - bb.cx) * sw,
        sy + (bb.minY - bb.cy) * sh,
        bb.w * sw,
        bb.h * sh,
        group.shapeTextureScale,
      );
      ctx.save();
      if (!group.shapeTextureScale) {
        clipGroup();
      }
      ctx.drawImage(tint, r.x, r.y, r.w, r.h);
      ctx.restore();
    }
    if (glow <= 0 && !(source && textureHasAlpha(group.texture, source))) {
      ctx.save();
      clipGroup();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.27)";
      ctx.lineWidth = 1.5;
      ctx.stroke(holed);
      ctx.restore();
    }
  } finally {
    // the clip must not outlive the group or everything after it vanishes
    ctx.restore();
  }
}

const alphaCache = new Map();

function textureHasAlpha(name, source) {
  let known = alphaCache.get(name);
  if (known === undefined) {
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const actx = canvas.getContext("2d", { willReadFrequently: true });
    actx.drawImage(source, 0, 0, size, size);
    const data = actx.getImageData(0, 0, size, size).data;
    known = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        known = true;
        break;
      }
    }
    alphaCache.set(name, known);
  }
  return known;
}

const tintCache = new Map();

function tintedTexture(name, source, fill) {
  const key = `${name}|${fill}`;
  let canvas = tintCache.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const tctx = canvas.getContext("2d");
    tctx.drawImage(source, 0, 0);
    tctx.globalCompositeOperation = "multiply";
    tctx.fillStyle = fill;
    tctx.fillRect(0, 0, canvas.width, canvas.height);
    tctx.globalCompositeOperation = "destination-in";
    tctx.drawImage(source, 0, 0);
    tintCache.set(key, canvas);
  }
  return canvas;
}

const blurCache = new Map();

function blurredTile(spec) {
  const { group, part, bb, sw, sh, stretch, glow } = spec;
  const box = groupExtent(group.points, bb, sw, sh, stretch);
  const pad = Math.ceil(glow * 3) + 2;
  const w = Math.ceil(box.maxX - box.minX) + pad * 2;
  const h = Math.ceil(box.maxY - box.minY) + pad * 2;
  if (w <= 0 || h <= 0 || w > c.blurTileMax || h > c.blurTileMax) {
    return null;
  }
  const key = [
    part.name,
    spec.index,
    spec.group.fill,
    spec.group.shapeTexture || "",
    spec.group.textureScale || 1,
    spec.group.shapeTextureScale || 1,
    w,
    h,
    Math.round(glow * 2),
    Math.round(box.minX),
    Math.round(box.minY),
    spec.recolor || "",
  ].join("|");
  let tile = blurCache.get(key);
  if (!tile) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    paintGroup(ctx, {
      ...spec,
      sx: -box.minX + pad,
      sy: -box.minY + pad,
      alpha: 1,
    });
    tile = { canvas, dx: box.minX - pad, dy: box.minY - pad };
    if (blurCache.size > c.blurCacheMax) {
      blurCache.clear();
    }
    blurCache.set(key, tile);
  }
  return tile;
}

const paintColors = [
  "#ffffff",
  "#d9d9d9",
  "#8c8c8c",
  "#3a3a3a",
  "#e53935",
  "#fb8c00",
  "#fdd835",
  "#7cb342",
  "#00897b",
  "#039be5",
  "#3949ab",
  "#8e24aa",
  "#d81b60",
  "#6d4c41",
  "#f5deb3",
  "#ff80ab",
];
const shapeColors = [
  "#ffffff",
  "#000000",
  "#8c8c8c",
  "#e53935",
  "#fb8c00",
  "#fdd835",
  "#039be5",
  "#7cb342",
];
const shapeTextureNames = [
  "Rivets",
  "RivetBorder",
  "StripesDiagonal",
  "StripesHorizontal",
  "StripesVertical",
  "RacingStripe",
  "HazardStripes",
  "Bands",
  "Chevrons",
  "Checker",
  "Dots",
  "Grid",
  "HexMesh",
  "PanelLines",
  "Corrugated",
  "Portholes",
  "EdgeShade",
  "Gloss",
  "Scorch",
  "Weathering",
];
const shapeTextureLoading = new Set();

function mulHex(a, b) {
  const parse = (hex) => {
    let body = String(hex).replace("#", "");
    if (body.length === 3) {
      body = body
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    const n = parseInt(body, 16);
    return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) {
    return a;
  }
  return (
    "#" +
    x
      .map((v, i) =>
        Math.round((v * y[i]) / 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function mainGroupIndex(part) {
  if (part._mainGroup === undefined) {
    let best = -1;
    let area = -1;
    part.groups.forEach((group, gi) => {
      if (group.cutout || group.noCollision || group.foreground) {
        return;
      }
      const xs = group.points.map((p) => p[0]);
      const ys = group.points.map((p) => p[1]);
      const size =
        (Math.max(...xs) - Math.min(...xs)) *
        (Math.max(...ys) - Math.min(...ys));
      if (size > area) {
        area = size;
        best = gi;
      }
    });
    part._mainGroup = best;
  }
  return part._mainGroup;
}

function ensureShapeTexture(file) {
  if (textures[file] || shapeTextureLoading.has(file)) {
    return;
  }
  shapeTextureLoading.add(file);
  loadImage(`assets/${file}`)
    .then((img) => (textures[file] = img))
    .catch(() => console.warn(`texture missing: assets/${file}`));
}

function paintedGroup(part, gi, group, paint) {
  if (!paint) {
    return group;
  }
  let out = group;
  if (paint.color) {
    out = {
      ...out,
      fill: mulHex(out.fill, paint.color),
      gradient: out.gradient && {
        ...out.gradient,
        to: out.gradient.to && mulHex(out.gradient.to, paint.color),
      },
    };
  }
  if (paint.shape && gi === mainGroupIndex(part)) {
    const file = paint.shape + ".png";
    ensureShapeTexture(file);
    out = { ...out, shapeTexture: file, shapeTint: paint.shapeTint };
  }
  return out;
}

function drawPart(part, sx, sy, s, opts = {}) {
  const bb = partBBox(part);
  const cutouts = part.groups.filter((group) => group.cutout);
  const fx = opts.fx || { part: {}, groups: {} };
  const partFx = fx.part || {};
  const sw =
    s *
    (opts.wide === undefined ? 1 : opts.wide) *
    (partFx.Width === undefined ? 1 : partFx.Width);
  const sh =
    s *
    (opts.tall === undefined ? 1 : opts.tall) *
    (partFx.Height === undefined ? 1 : partFx.Height);
  const baseAlpha = opts.alpha == null ? 1 : opts.alpha;
  push();
  if (opts.rot) {
    translate(sx, sy);
    rotate(opts.rot * HALF_PI);
    sx = 0;
    sy = 0;
  }
  // groups draw lowest layer first, and one with none sits on 0. they're
  // still numbered by where they sit in the part (animations and sets go by
  // that), only the order they're painted in changes
  const paintOrder = part.groups
    .map((_, i) => i)
    .sort((a, b) => (part.groups[a].layer || 0) - (part.groups[b].layer || 0) || a - b);
  for (const gi of paintOrder) {
    const group = part.groups[gi];
    if (group.cutout) {
      continue;
    }
    if (opts.layer === "back" && group.foreground) {
      continue;
    }
    if (opts.layer === "front" && !group.foreground) {
      continue;
    }
    const setId = setOfGroup(part, gi);
    const groupFx = (fx.groups || {})[setId] || {};
    const stretch =
      groupFx.Width === undefined && groupFx.Height === undefined
        ? null
        : {
            wide: groupFx.Width === undefined ? 1 : groupFx.Width,
            tall: groupFx.Height === undefined ? 1 : groupFx.Height,
            pivot: partSets(part).tagged
              ? partSets(part).centres.get(setId)
              : null,
          };
    const alpha = baseAlpha * (group.opacity === undefined ? 1 : group.opacity);
    const asked =
      groupFx.Blur === undefined
        ? partFx.Blur === undefined
          ? baseBlur(part)
          : partFx.Blur
        : groupFx.Blur;
    const drawn = Math.max(bb.w * sw, bb.h * sh);
    const glow = drawn < c.blurMinSize ? 0 : Math.min(asked, c.blurMax);

    const spec = {
      group: paintedGroup(part, gi, group, opts.paint),
      part,
      bb,
      sx,
      sy,
      sw,
      sh,
      cutouts,
      stretch,
      glow,
      alpha,
      index: gi,
      recolor: opts.recolor,
    };
    const tile = glow > 0 ? blurredTile(spec) : null;
    if (tile) {
      drawingContext.save();
      drawingContext.globalAlpha = alpha;
      drawingContext.drawImage(tile.canvas, sx + tile.dx, sy + tile.dy);
      drawingContext.restore();
    } else {
      paintGroup(drawingContext, spec);
    }
  }
  pop();
}
