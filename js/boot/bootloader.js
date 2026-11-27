let skyTip;
let skySurface;
let hazeColor;
let textures = {};
let booting = true;

const bootTextures = {
  Earth: "assets/Earth.avif",
  EarthClouds: "assets/EarthClouds.avif",
  Sun: "assets/Sun.avif",
  Venus: "assets/Venus.avif",
  Mercury: "assets/Mercury.avif",
  SunAtmo: "assets/SunAtmo.avif",
  Mars: "assets/Mars.avif",
  Moon: "assets/Moon.avif",
  Jupiter: "assets/Jupiter.avif",
  Ceres: "assets/Ceres.avif",
  Saturn: "assets/Saturn.avif",
  Uranus: "assets/Uranus.avif",
  Neptune: "assets/Neptune.avif",
  CoolScreen: "assets/CoolScreen.avif",
  VAB: "assets/VAB.png",
  Launchpad: "assets/Launchpad.webp",
  Launchtower: "assets/Launchtower.webp",
};

function assetBytesLoaded() {
  let total = 0;
  for (const entry of performance.getEntriesByType("resource")) {
    if (entry.name.includes("/assets/")) {
      total += entry.transferSize || entry.encodedBodySize || 0;
    }
  }
  return total;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(0)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const splashHold = 500; //500
const splashFade = 400; //400
let credits = "p5.js | textures by Solar System Scope | font: DM Mono";

if (developerMode) {
  credits =
    "p5.js | textures by Solar System Scope | font: DM Mono | DEVELOPER BUILD";
}

const injectionsKey = "weborbit-injections";

function loadInjections() {
  try {
    const list = JSON.parse(localStorage.getItem(injectionsKey));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveInjections(list) {
  localStorage.setItem(injectionsKey, JSON.stringify(list));
}

function runInjections() {
  let current = "";
  const onError = (e) =>
    console.error(`Injection "${current}" failed`, e.error || e.message);
  window.addEventListener("error", onError);
  for (const inj of loadInjections()) {
    if (!inj.on) {
      continue;
    }
    current = inj.name;
    const el = document.createElement("script");
    el.textContent = `${inj.code}\n//# sourceURL=injection-${encodeURIComponent(inj.name)}.js`;
    document.head.append(el);
    el.remove();
  }
  window.removeEventListener("error", onError);
}

// keyboard picks the entry, but the buttons are real GUIAPI buttons so the
// mouse works too. returns the index of the entry clicked this frame, or -1
function drawBootMenu(title, items, sel, help) {
  const rowH = 34;
  const gap = 6;
  const panelW = Math.min(560, width - 40);
  const panelH = Math.min(520, height - 40);
  const footerH = 90;
  const id = "bootloader";

  GUIAPI.beginFrame();
  background("#05070a");

  // keep the highlighted entry inside the scrolling list
  const viewH = panelH - 24 - 28 - footerH;
  const top = sel * (rowH + gap);
  const scroll = GUIAPI.scrolls[id] || 0;
  if (top < scroll) {
    GUIAPI.scrolls[id] = top;
  } else if (top + rowH > scroll + viewH) {
    GUIAPI.scrolls[id] = top + rowH - viewH;
  }

  const frame = GUIAPI.panel(
    panelW,
    panelH,
    { id, borderColor: "#555", footer: footerH, gap },
    title,
    (ui) => {
      items.forEach((item, i) => {
        ui.button(
          0,
          0,
          undefined,
          rowH,
          { id: `boot-item-${i}`, ...(i === sel ? bootSelectedStyle : menuStyle) },
          item,
        );
      });
    },
  );

  push();
  noStroke();
  fill("#aaa");
  textSize(12);
  textAlign(LEFT, TOP);
  text(help, frame.footer.x, frame.footer.y + 8, frame.footer.sx, footerH - 8);
  pop();

  if (GUIAPI.justPressed) {
    const hit = GUIAPI.buttonAt();
    if (hit && hit.id.startsWith("boot-item-")) {
      return Number(hit.id.slice("boot-item-".length));
    }
  }
  return -1;
}

const bootSelectedStyle = { baseColor: "#1f4f8f", borderColor: "#5aa9ff" };

function editInjection(inj) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;gap:8px;padding:20px;background:#05070a;color:#fff;font:14px monospace";
  const field =
    "background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:6px;font:inherit;outline:none;padding:6px;";
  const name = document.createElement("input");
  name.style.cssText = field;
  name.placeholder = "Injection name";
  name.value = inj ? inj.name : "";
  const code = document.createElement("textarea");
  code.style.cssText = field + "flex:1;resize:none;white-space:pre;tab-size:2";
  code.spellcheck = false;
  code.placeholder = "Paste JavaScript here";
  code.value = inj ? inj.code : "";
  const hint = document.createElement("div");
  hint.textContent = "Ctrl+Enter to save, ESC to cancel.";
  wrap.append(name, code, hint);
  return new Promise((resolve) => {
    wrap.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (
        e.key === "Escape" ||
        (e.key === "Enter" && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        wrap.remove();
        resolve(
          e.key === "Escape"
            ? null
            : { name: name.value.trim() || "Untitled", code: code.value },
        );
      }
    });
    document.body.append(wrap);
    (inj ? code : name).focus();
  });
}

function exportInjections(list) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(list, null, 2)], { type: "application/json" }),
  );
  a.download = "weborbit-injections.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importInjections() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("cancel", () => resolve(null));
    input.addEventListener("change", async () => {
      try {
        const data = JSON.parse(await input.files[0].text());
        resolve(
          data
            .filter(
              (i) =>
                i && typeof i.name === "string" && typeof i.code === "string",
            )
            .map((i) => ({ name: i.name, code: i.code, on: i.on !== false })),
        );
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}

async function runBootloader() {
  const keys = [];
  const onKey = (e) => {
    keys.push(e.key);
    e.preventDefault();
  };
  window.addEventListener("keydown", onKey);
  let screen = "main";
  let sel = 0;
  let list = loadInjections();
  let note = "";
  let done = false;
  while (!done) {
    const injScreen = screen === "inj";
    const items = injScreen
      ? [...list.map((i) => `[${i.on ? "x" : " "}] ${i.name}`), "Add injection"]
      : [
          "WebOrbit",
          "Manage Injections",
          "Export Injections",
          "Import Injections",
        ];
    const n = items.length;
    sel = constrain(sel, 0, n - 1);
    let help =
      "Use the up and down arrow keys (or the mouse) to pick an entry.\nPress enter to boot the selected entry or ESC to boot normally.";
    if (injScreen) {
      help =
        "Press enter to toggle the selected injection, 'e' to open the code editor, 'd' to delete it, or ESC to return to the previous menu.";
    }
    if (note) {
      help += `\n${note}`;
    }
    const clicked = drawBootMenu("WebOrbit Boot Manager", items, sel, help);
    if (clicked >= 0) {
      sel = clicked;
      keys.push("Enter");
    }
    while (keys.length) {
      const k = keys.shift();
      if (k === "ArrowUp") {
        sel = (sel + n - 1) % n;
      } else if (k === "ArrowDown") {
        sel = (sel + 1) % n;
      } else if (k === "Enter") {
        if (!injScreen) {
          if (sel === 0) {
            done = true;
          } else if (sel === 1) {
            screen = "inj";
            sel = 0;
          } else if (sel === 2) {
            exportInjections(list);
            note = `Exported ${list.length} injection(s).`;
          } else {
            const imported = await importInjections();
            keys.length = 0;
            if (imported) {
              list.push(...imported);
              saveInjections(list);
            }
            note = imported
              ? `Imported ${imported.length} injection(s).`
              : "Import failed or cancelled.";
          }
        } else if (sel === list.length) {
          const made = await editInjection(null);
          if (made && made.code) {
            list.push({ ...made, on: true });
            saveInjections(list);
          }
        } else {
          list[sel].on = !list[sel].on;
          saveInjections(list);
        }
      } else if (k === "Escape") {
        if (injScreen) {
          screen = "main";
          sel = 1;
        } else {
          done = true;
        }
      } else if (injScreen && sel < list.length && k === "d") {
        list.splice(sel, 1);
        saveInjections(list);
      } else if (injScreen && sel < list.length && k === "e") {
        const edited = await editInjection(list[sel]);
        if (edited) {
          Object.assign(list[sel], edited);
          saveInjections(list);
        }
      }
    }
    await nextFrame();
  }
  window.removeEventListener("keydown", onKey);
}

function nextFrame() {
  // the boot/menu loops redraw every frame, so on a crash paint over them
  // and never resume, which freezes the crash screen in place
  if (critError) {
    drawCrashScreen();
    return new Promise(() => {});
  }
  return new Promise((r) => requestAnimationFrame(r));
}

function drawSplash(alpha) {
  const y = height / 2;
  background(0);
  noStroke();
  textAlign(CENTER, CENTER);
  fill(255, alpha);
  textSize(54);
  if (developerMode) {
    fill("Yellow");
  }
  text("WebOrbit", width / 2, y - 24);
  fill(160, alpha);
  textSize(19);
  text("by @sorabora", width / 2, y + 28);
  fill(100, alpha);
  textSize(14);
  text(credits, width / 2, y + 84);
}

async function runSplash() {
  const start = performance.now();
  for (;;) {
    const t = performance.now() - start;
    if (t >= splashHold + splashFade) break;
    drawSplash(255 * (t < splashHold ? 1 : 1 - (t - splashHold) / splashFade));
    await nextFrame();
  }
}
