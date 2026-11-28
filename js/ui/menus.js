const menuStyle = { baseColor: "#242a31", borderColor: "#5aa9ff" };
const dangerStyle = { baseColor: "#733", borderColor: "#ff5a5a" };
const menuStyleDisabled = { baseColor: "#525e6d", borderColor: "#83a0c0" };

function drawMainMenu() {
  textSize(30);
  background("#05070a");
  const geom = introEarth || menuEarthGeom();
  drawIntroEarth({
    x: geom.x + mouseX / 64,
    y: geom.y + mouseY / 64,
    r: geom.r,
  });

  const buttons = runFilter(
    "menu:buttons",
    [
      { id: "menu-world", label: "New World", style: menuStyle },
      { id: "menu-career", label: "Play Existing World", style: menuStyle },
      { id: "menu-credits", label: "Credits", style: menuStyle },
      { id: "menu-modloader", label: "Modloader", style: menuStyle },
      {
        id: "menu-featured-mods",
        label: featuredMods
          ? `Featured Mods (${featuredMods.length})`
          : "Featured Mods",
        style: menuStyle,
      },
      { id: "menu-keybinds", label: "Keybinds", style: menuStyle },
    ],
    {},
  );

  // one column, stacked, over on the earth-free side of the screen
  const btnW = Math.min(320, width * 0.32);
  const btnH = 62;
  const gap = 14;
  const stackH = buttons.length * btnH + (buttons.length - 1) * gap;
  const bx = width * 0.72 - btnW / 2;
  const startY = height / 2 - stackH / 2;
  buttons.forEach((b, i) => {
    GUIAPI.button(
      bx,
      startY + i * (btnH + gap),
      btnW,
      btnH,
      { id: b.id, ...b.style },
      b.label,
    );
  });
}

function drawKeyBindsMenu() {
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "keybinds" },
    undefined,
    (ui) => {
      ui.label("Keybinds", { size: 28, align: CENTER, height: 40 });

      ui.button(
        0,
        0,
        350,
        85,
        {
          id: "keybind-invert-vab-zoom",
          ...menuStyle,
        },
        `Invert VAB Zoom: ${controls.invertVabZoom ? "On" : "Off"}`,
      );

      ui.button(
        0,
        0,
        350,
        85,
        {
          id: "keybind-invert-flight-zoom",
          ...menuStyle,
        },
        `Invert Flight Zoom: ${controls.invertFlightZoom ? "On" : "Off"}`,
      );

      ui.button(
        0,
        0,
        350,
        85,
        {
          id: "keybinds-close",
          ...menuStyle,
        },
        "Close",
      );
    },
  );
}

function drawCreditsMenu() {
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "credits" },
    undefined,
    (ui) => {
      ui.label("Credits", { size: 28, align: CENTER, height: 40 });
      ui.label("@sorabora - Developer", {
        size: 28,
        align: CENTER,
        height: 80,
      });
      ui.label(
        "Planet textures are modified versions of graphics by Solar System Scope (solarsystemscope.com), used under CC BY 4.0.",
        { size: 15, align: CENTER, height: 20 },
      );
      ui.label(
        "DM Mono font by Colophon Foundry, used under the SIL Open Font License 1.1.",
        { size: 15, align: CENTER, height: 40 },
      );
      ui.label(
        "VAB, launchtower and launchpad textures by @crowm on SFS forums",
        { size: 15, align: CENTER, height: 20 },
      );

      ui.label(
        "Decoupler texture by @ilikespace on SFS forums",
        { size: 15, align: CENTER, height: 20 },
      );

      textSize(15);
      ui.button(0, 0, 85, 20, {}, "@crowm");

      ui.button(
        0,
        0,
        350,
        80,
        {
          id: "credits-close",
          baseColor: "#1f398f",
          hoverColor: "#2a32c0",
          activeColor: "#1a1770",
        },
        "Close",
      );
    },
  );
}

function drawModLoaderMenu() {
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "modloader" },
    undefined,
    (ui) => {
      ui.label("Modloader", { size: 28, align: CENTER, height: 40 });

      for (let i = 0; i < loaded.length; i++) {
        const pack = loaded[i];
        ui.label(i === 0 ? "Base Game" : (pack.name ?? "Unnamed Mod"), {
          size: 20,
          height: 26,
        });
        ui.label(
          `v${pack.modVersion ?? pack.version}   ${pack.parts.length} parts`,
          { size: 14, color: "#aaa", height: 18 },
        );
        if (i === 0) {
          continue;
        }
        ui.button(
          0,
          4,
          undefined,
          30,
          {
            id: "mod-delete-" + i,
            baseColor: "#7a2a2a",
            hoverColor: "#a03c3c",
            activeColor: "#5e1f1f",
          },
          "Delete",
        );
      }

      for (let i = 0; i < jsMods.length; i++) {
        ui.label(jsMods[i].name, { size: 20, height: 26 });
        ui.label("JS mod (removal takes effect after reload)", {
          size: 14,
          color: "#aaa",
          height: 18,
        });
        ui.button(
          0,
          4,
          undefined,
          30,
          {
            id: "jsmod-delete-" + i,
            baseColor: "#7a2a2a",
            hoverColor: "#a03c3c",
            activeColor: "#5e1f1f",
          },
          "Delete",
        );
      }

      ui.button(
        0,
        0,
        undefined,
        60,
        {
          id: "modloader-new",
          baseColor: "#1f8f1f",
          hoverColor: "#2ac050",
          activeColor: "#177023",
        },
        "Load New",
      );

      ui.button(
        0,
        0,
        undefined,
        60,
        {
          id: "modloader-close",
          baseColor: "#1f398f",
          hoverColor: "#2a32c0",
          activeColor: "#1a1770",
        },
        "Close",
      );

      const red = {
        baseColor: "#8f1f1f",
        hoverColor: "#c02a2a",
        activeColor: "#701717",
      };
      if (!jsModPickerOpen) {
        ui.button(0, 0, undefined, 60, { id: "modloader-js", ...red }, "Load JS Mod");
      } else {
        // the red button splits into three columns
        const row = ui.row(60);
        const colGap = 6;
        const colW = (row.sx - colGap * 2) / 3;
        [
          ["modloader-js-server", "From Server"],
          ["modloader-js-file", "From File"],
          ["modloader-js-paste", "Paste"],
        ].forEach(([id, label], i) => {
          GUIAPI.button(
            row.x + i * (colW + colGap),
            row.y,
            colW,
            row.sy,
            { id, ...red },
            label,
          );
        });
      }
    },
  );
}

async function getData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/sorabora/Centralorbit/main/FEATURED_MODS.json",
    );

    if (!response.ok) {
      console.warn(`featured mods: HTTP ${response.status}`);
      return null;
    }

    const res = await response.json();
    return res;
  } catch (e) {
    console.warn("featured mods won't load:", e);
    return null;
  }
}

const featuredTierLabels = {
  1: "★☆☆ Featured",
  2: "★★☆ Exceptional",
  3: "★★★ Flagship",
};

function drawFeaturedModsMenu() {
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "featured-mods" },
    undefined,
    (ui) => {
      ui.label("Featured Mods", { size: 28, align: CENTER, height: 40 });

      for (let i = 0; i < (featuredMods ?? []).length; i++) {
        const mod = featuredMods[i];
        ui.button(
          0,
          0,
          550,
          80,
          {
            id: "featured-mod-" + i,
            data: {
              threadUrl: mod.threadUrl,
              title: mod.title,
              type: "featured-mod",
            },
            baseColor: "#1f4f8f",
            hoverColor: "#2a6ac0",
            activeColor: "#173d70",
          },
          `${mod.title}  ${featuredTierLabels[mod.tier] ?? ""}`,
        );
      }

      ui.button(
        0,
        0,
        550,
        80,
        {
          id: "featured-mods-close",
          baseColor: "#1f398f",
          hoverColor: "#2a32c0",
          activeColor: "#1a1770",
        },
        "Close",
      );
    },
  );
}
