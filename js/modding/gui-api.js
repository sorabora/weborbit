// each draws centred on (x, y) and fits a square of side s
const iconDraws = {
  rocket(x, y, s, c) {
    const h = s / 2;
    fill(c);
    noStroke();
    triangle(x, y - h, x + h * 0.35, y - h * 0.2, x - h * 0.35, y - h * 0.2);
    rect(x - h * 0.35, y - h * 0.2, h * 0.7, h * 1.2);
    triangle(x - h * 0.35, y + h * 0.2, x - h * 0.7, y + h, x - h * 0.35, y + h);
    triangle(x + h * 0.35, y + h * 0.2, x + h * 0.7, y + h, x + h * 0.35, y + h);
  },
  gear(x, y, s, c) {
    const h = s / 2;
    fill(c);
    noStroke();
    for (let i = 0; i < 8; i++) {
      push();
      translate(x, y);
      rotate((i * PI) / 4);
      rect(-h * 0.15, -h, h * 0.3, h * 0.5);
      pop();
    }
    circle(x, y, h * 1.4);
  },
  check(x, y, s, c) {
    const h = s / 2;
    noFill();
    stroke(c);
    strokeWeight(s * 0.12);
    line(x - h * 0.6, y, x - h * 0.15, y + h * 0.45);
    line(x - h * 0.15, y + h * 0.45, x + h * 0.6, y - h * 0.45);
  },
  plus(x, y, s, c) {
    const h = s / 2;
    stroke(c);
    strokeWeight(s * 0.14);
    line(x - h * 0.8, y, x + h * 0.8, y);
    line(x, y - h * 0.8, x, y + h * 0.8);
  },
};

const GUIAPI = {
  pendingTooltip: null,
  buttons: [],
  blockers: [],
  scrolls: {},
  scrollAreas: [],
  autoBottom: {},
  order: 0,
  onButton: null,
  beginFrame() {
    this.order = 0;
    this.justPressed = mouseIsPressed && !this.wasPressed;
    this.wasPressed = mouseIsPressed;
    this.blockers = this.blockers.filter((b) => b.frame >= frameCount - 1);
    this.buttons = this.buttons.filter((b) => b.frame >= frameCount - 1);
    this.scrollAreas = this.scrollAreas.filter(
      (a) => a.frame >= frameCount - 1,
    );
  },
  block(x, y, sx, sy, order) {
    this.blockers.push({ x, y, sx, sy, order, frame: frameCount });
  },
  covered(order, frame) {
    for (const b of this.blockers) {
      if (
        b.frame === frame &&
        b.order > order &&
        this.contains(b.x, b.y, b.sx, b.sy)
      ) {
        return true;
      }
    }
    return false;
  },
  // true when the cursor is over any panel or button at all
  blocked() {
    return this.covered(-1, frameCount) || this.covered(-1, frameCount - 1);
  },
  contains(x, y, sx, sy) {
    return mouseX >= x && mouseX <= x + sx && mouseY >= y && mouseY <= y + sy;
  },
  // names: "rocket", "gear", "check", "plus". Centred on (x, y).
  icon(name, x, y, size, col = "#fff") {
    if (!iconDraws[name]) return;
    push();
    iconDraws[name](x, y, size, col);
    pop();
  },
  // the one button the cursor is actually over: inside it, and nothing on top
  buttonAt() {
    let best = null;
    for (const b of this.buttons) {
      if (b.frame < frameCount - 1 || !this.contains(b.x, b.y, b.sx, b.sy)) {
        continue;
      }
      if (this.covered(b.order, b.frame)) {
        continue;
      }
      if (
        !best ||
        b.frame > best.frame ||
        (b.frame === best.frame && b.order > best.order)
      ) {
        best = b;
      }
    }
    return best;
  },
  dispatch() {
    const hit = this.buttonAt();
    if (hit && this.onButton) {
      this.onButton({
        id: hit.id,
        label: hit.label,
        data: hit.data,
        x: hit.x,
        y: hit.y,
        sx: hit.sx,
        sy: hit.sy,
        order: hit.order,
        mouseX,
        mouseY,
      });
    }
    return hit;
  },
  clicked(id) {
    const hit = this.buttonAt();
    return !!hit && hit.id === id;
  },
  panel(sx, sy, extras = {}, title, children) {
    const x = Math.round((width - sx) / 2 + (extras.offsetX || 0));
    const y = Math.round((height - sy) / 2 + (extras.offsetY || 0));
    const pad = extras.pad === undefined ? 12 : extras.pad;
    const titleHeight = title ? 28 : 0;
    const order = this.order++;

    const parse = (c) => {
      let body = c.replace("#", "");
      if (body.length === 3 || body.length === 4)
        body = body
          .split("")
          .map((ch) => ch + ch)
          .join("");
      const n = parseInt(body.slice(0, 6), 16);
      const a = body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1;
      return isNaN(n)
        ? [42, 42, 42, 0.93]
        : [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
    };

    push();
    noStroke();
    if (extras.dim) {
      fill(extras.dimColor || "#0009");
      rect(0, 0, width, height);
      this.block(0, 0, width, height, order);
    }
    this.block(x, y, sx, sy, order);

    const [r, g, b, a] = parse(extras.baseColor || "#2a2a2aee");
    const fade = extras.fade === undefined ? 0.85 : extras.fade;
    const ctx = drawingContext;
    const grad = ctx.createLinearGradient(x, y, x, y + sy);
    grad.addColorStop(0, extras.topColor || `rgba(${r}, ${g}, ${b}, ${a})`);
    grad.addColorStop(
      1,
      extras.bottomColor ||
        `rgba(${(r * (1 - fade)) | 0}, ${(g * (1 - fade)) | 0}, ${(b * (1 - fade)) | 0}, ${a})`,
    );

    if (extras.borderColor) {
      stroke(extras.borderColor);
      strokeWeight(extras.borderWeight || 1);
    }
    ctx.save();
    ctx.fillStyle = grad;
    rect(x, y, sx, sy, extras.radius === undefined ? 6 : extras.radius);
    ctx.restore();

    if (title) {
      noStroke();
      fill(extras.titleColor || "#fff");
      textSize(extras.titleSize || 16);
      textAlign(CENTER, CENTER);
      text(title, x + sx / 2, y + pad + titleHeight / 2);
      if (extras.hint) {
        fill(extras.hintColor || "#999");
        textSize(12);
        textAlign(RIGHT, CENTER);
        text(extras.hint, x + sx - pad, y + pad + titleHeight / 2);
      }
    }
    pop();

    const footerHeight = extras.footer || 0;
    const content = {
      x: x + pad,
      y: y + pad + titleHeight,
      sx: sx - pad * 2,
      sy: sy - pad * 2 - titleHeight - footerHeight,
    };
    const footer = {
      x: content.x,
      y: content.y + content.sy,
      sx: content.sx,
      sy: footerHeight,
    };

    const id = extras.id || title || "panel";
    if (this.scrolls[id] === undefined) {
      this.scrolls[id] = 0;
    }
    const gap = extras.gap === undefined ? 6 : extras.gap;
    const lui = LUIAPI.begin(content, this.scrolls[id], gap);

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(content.x, content.y, content.sx, content.sy);
    drawingContext.clip();
    children(lui);
    drawingContext.restore();

    const maxScroll = Math.max(
      0,
      lui.cursor.y + this.scrolls[id] - content.y - content.sy,
    );
    if (this.autoBottom[id]) {
      this.scrolls[id] = maxScroll;
      this.autoBottom[id] = false;
    } else {
      this.scrolls[id] = constrain(this.scrolls[id], 0, maxScroll);
    }
    this.scrollAreas.push({
      id,
      x: content.x,
      y: content.y,
      sx: content.sx,
      sy: content.sy,
      max: maxScroll,
      order: this.order - 1,
      frame: frameCount,
    });

    return { x, y, sx, sy, content, footer };
  },
  scroll(delta) {
    let best = null;
    for (const a of this.scrollAreas) {
      if (a.frame < frameCount - 1 || !this.contains(a.x, a.y, a.sx, a.sy)) {
        continue;
      }
      if (this.covered(a.order, a.frame)) {
        continue;
      }
      if (!best || a.order > best.order) {
        best = a;
      }
    }
    if (!best) {
      return false;
    }
    this.scrolls[best.id] = constrain(
      this.scrolls[best.id] + delta,
      0,
      best.max,
    );
    return true;
  },
  button(x, y, sx, sy, extras = {}, label) {
    const order = this.order++;
    this.buttons.push({
      id: extras.id || null,
      label: label === undefined ? null : label,
      data: extras.data === undefined ? null : extras.data,
      x,
      y,
      sx,
      sy,
      order,
      frame: frameCount,
    });
    this.block(x, y, sx, sy, order);
    const hover =
      this.contains(x, y, sx, sy) && !this.covered(order, frameCount - 1);
    const pressed = hover && mouseIsPressed;

    const parse = (c) => {
      let body = c.replace("#", "");
      if (body.length === 3)
        body = body
          .split("")
          .map((ch) => ch + ch)
          .join("");
      const n = parseInt(body, 16);
      return isNaN(n)
        ? [0x1e, 0x3a, 0x8a]
        : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const css = ([r, g, b]) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
    const shift = (rgb, amt) =>
      rgb.map((v) => constrain(v + 255 * amt, 0, 255));
    const toBlack = (rgb, amt) => rgb.map((v) => v * (1 - amt));

    let rgb = parse(extras.baseColor || "#1e3a8a");

    if (hover) {
      rgb = extras.hoverColor ? parse(extras.hoverColor) : shift(rgb, 0.12);
      if (extras.onHover) extras.onHover();
      if (extras.tooltip)
        this.pendingTooltip = { lines: extras.tooltip, x: mouseX, y: mouseY };
    }
    if (pressed) {
      rgb = extras.activeColor ? parse(extras.activeColor) : shift(rgb, -0.12);
    }

    const top = extras.topColor || css(rgb);
    const bottom = extras.bottomColor || css(toBlack(rgb, 0.85));
    const radius = extras.radius === undefined ? 8 : extras.radius;

    push();
    noStroke();
    const ctx = drawingContext;
    const grad = ctx.createLinearGradient(x, y, x, y + sy);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    rect(x, y, sx, sy, radius);

    noFill();
    stroke(255, 255, 255, pressed ? 15 : 35);
    strokeWeight(1);
    rect(x + 0.5, y + 0.5, sx - 1, sy - 1, radius);

    if (label) {
      noStroke();
      fill(extras.textColor || "#fff");
      textAlign(CENTER, CENTER);
      text(label, x + sx / 2, y + sy / 2);
    }
    pop();
  },
  // drag to set, double click to type. extras: id, min, max, log, format, edit, parse
  slider(x, y, sx, sy, extras = {}, value) {
    const { id, min, max, log } = extras;
    const to = (t) => (log ? min * Math.pow(max / min, t) : min + (max - min) * t);
    const from = (v) => (log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min));
    this.button(x, y, sx, sy, { baseColor: "#234", ...extras }, extras.format ? extras.format(value) : String(value));
    push();
    noStroke();
    fill("#5aa9ff");
    rect(x + constrain(from(value), 0, 1) * (sx - 6), y, 6, sy, 3);
    pop();
    if (this.justPressed && this.clicked(id)) {
      if (millis() - (this.lastSliderClick || 0) < 350) {
        const typed = (extras.parse || parseFloat)(prompt("Set value", extras.edit ? extras.edit(value) : value));
        this.lastSliderClick = 0;
        return Number.isFinite(typed) ? constrain(typed, min, max) : value;
      }
      this.sliderDrag = id;
      this.lastSliderClick = millis();
    }
    if (this.sliderDrag === id) {
      if (mouseIsPressed) {
        return to(constrain((mouseX - x) / sx, 0, 1));
      }
      this.sliderDrag = null;
    }
    return value;
  },
  dropdown(x, y, sx, sy, extras = {}, options, index) {
    const id = extras.id || null;
    const arrow = extras.arrowSize === undefined ? sy : extras.arrowSize;
    const count = options.length;

    this.button(
      x,
      y,
      sx,
      sy,
      { ...extras, id: id ? id + "-value" : null },
      null,
    );

    push();
    noStroke();
    fill(extras.textColor || "#fff");
    textAlign(CENTER, CENTER);
    text(options[index], x + sx / 2, y + sy / 2);
    pop();

    const arrowExtras = {
      baseColor: extras.arrowColor || extras.baseColor,
      hoverColor: extras.arrowHoverColor,
      activeColor: extras.arrowActiveColor,
      textColor: extras.arrowTextColor || extras.textColor,
      radius: extras.radius,
    };
    const leftId = id ? id + "-left" : null;
    const rightId = id ? id + "-right" : null;
    this.button(x, y, arrow, sy, { ...arrowExtras, id: leftId }, "◀");
    this.button(
      x + sx - arrow,
      y,
      arrow,
      sy,
      { ...arrowExtras, id: rightId },
      "▶",
    );

    if (this.justPressed) {
      const hit = this.buttonAt();
      if (hit && hit.id === leftId) {
        return extras.wrap === false
          ? Math.max(0, index - 1)
          : (index - 1 + count) % count;
      }
      if (hit && hit.id === rightId) {
        return extras.wrap === false
          ? Math.min(count - 1, index + 1)
          : (index + 1) % count;
      }
    }
    return index;
  },
  // children(ui) lays out the tooltip like a panel; sx and sy are its size
  tooltip(sx, sy, children, x = mouseX, y = mouseY) {
    this.pendingTooltip = { sx, sy, children, x, y };
  },
  drawTooltip() {
    this.tipBox = null;
    if (!this.pendingTooltip) {
      return;
    }
    const t = this.pendingTooltip;
    if (t.children) {
      let x = t.x + 16;
      if (x + t.sx > width) x = t.x - t.sx - 16;
      let y = t.y + 16;
      if (y + t.sy > height) y = height - t.sy;
      this.tipBox = this.panel(
        t.sx,
        t.sy,
        {
          id: "tooltip",
          baseColor: "#222e",
          radius: 4,
          offsetX: x - (width - t.sx) / 2,
          offsetY: y - (height - t.sy) / 2,
        },
        undefined,
        t.children,
      );
      this.pendingTooltip = null;
      return;
    }
    const lines = this.pendingTooltip.lines;
    const pad = 8;
    const lineH = 18;

    push();
    rawTextSize(13);
    textAlign(LEFT, TOP);
    let boxW = 0;
    for (const line of lines) {
      boxW = max(boxW, textWidth(line));
    }
    boxW += pad * 2;
    const boxH = lines.length * lineH + pad * 2;

    let bx = this.pendingTooltip.x + 16;
    let by = this.pendingTooltip.y + 16;
    if (bx + boxW > width) bx = this.pendingTooltip.x - boxW - 16;
    if (by + boxH > height) by = height - boxH;

    noStroke();
    fill("#222e");
    rect(bx, by, boxW, boxH, 4);
    fill("#fff");
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], bx + pad, by + pad + i * lineH);
    }
    pop();

    this.pendingTooltip = null;
  },
};

const LUIAPI = {
  begin(content, scroll, gap) {
    const cursor = { y: content.y - scroll };
    return {
      content,
      cursor,
      label(str, extras = {}) {
        const h = extras.height === undefined ? 22 : extras.height;
        const align = extras.align || LEFT;
        push();
        noStroke();
        fill(extras.color || "#fff");
        textSize(extras.size || 14);
        textAlign(align, CENTER);
        let tx = content.x + (extras.offsetX || 0);
        if (align === CENTER) {
          tx = content.x + content.sx / 2 + (extras.offsetX || 0);
        } else if (align === RIGHT) {
          tx = content.x + content.sx + (extras.offsetX || 0);
        }
        text(str, tx, cursor.y + h / 2 + (extras.offsetY || 0));
        pop();
        cursor.y += h + gap;
      },
      button(offX, offY, bsx, bsy, extras = {}, label) {
        const w = bsx === undefined ? content.sx : bsx;
        const bx = content.x + (content.sx - w) / 2 + offX;
        const by = cursor.y + offY;
        GUIAPI.button(bx, by, w, bsy, extras, label);
        cursor.y += bsy + gap;
      },
      dropdown(offX, offY, bsx, bsy, extras = {}, options, index) {
        const w = bsx === undefined ? content.sx : bsx;
        const bx = content.x + (content.sx - w) / 2 + offX;
        const by = cursor.y + offY;
        const next = GUIAPI.dropdown(bx, by, w, bsy, extras, options, index);
        cursor.y += bsy + gap;
        return next;
      },
      slider(offX, offY, bsx, bsy, extras = {}, value) {
        const w = bsx === undefined ? content.sx : bsx;
        const bx = content.x + (content.sx - w) / 2 + offX;
        const by = cursor.y + offY;
        const next = GUIAPI.slider(bx, by, w, bsy, extras, value);
        cursor.y += bsy + gap;
        return next;
      },
      icon(name, size = 22, extras = {}) {
        const align = extras.align || LEFT;
        const cx =
          align === CENTER
            ? content.x + content.sx / 2
            : align === RIGHT
              ? content.x + content.sx - size / 2
              : content.x + size / 2;
        GUIAPI.icon(
          name,
          cx + (extras.offsetX || 0),
          cursor.y + size / 2 + (extras.offsetY || 0),
          size,
          extras.color,
        );
        cursor.y += size + gap;
      },
      row(h) {
        const out = {
          x: content.x,
          y: cursor.y,
          sx: content.sx,
          sy: h === undefined ? 22 : h,
        };
        cursor.y += out.sy + gap;
        return out;
      },
    };
  },
};
