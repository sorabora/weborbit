function takenAstronauts() {
  const inVab = vab.parts.flatMap((inst) => inst.paint?.crew ?? []);
  const inWorld = rockets.flatMap((rocket) => [
    ...(rocket.stack?.parts ?? []).flatMap((entry) => entry.paint?.crew ?? []),
    rocket.id,
  ]);
  return [...new Set([...inVab, ...inWorld])].filter((n) =>
    astronautNames.includes(n),
  );
}

function drawAstroMenu(dt) {
  const part = partAPI.read(vab.selected);
  const crew = part?.stored.crew ?? [];
  const max = part?.modules["Controller Module"]?.["Max Crew"] ?? 0;
  const used = takenAstronauts().length;
  const free = used < astronautNames.length;

  GUIAPI.panel(
    290,
    200,
    { id: "astro-menu", borderColor: "#555" },
    `Astronauts ${crew.length}/${max}  (${used}/${astronautNames.length} assigned)`,
    (ui) => {
      for (const name of crew) {
        ui.label(name, { size: 14, height: 22 });
        ui.button(0, 0, undefined, 32, { id: `delete-${name}` }, "Remove");
      }
      if (crew.length < max && free) {
        ui.button(0, 0, undefined, 32, { id: "astro-add", ...menuStyle }, "Add");
      }
      ui.button(
        0,
        0,
        undefined,
        32,
        { id: `close-astromenu`, ...dangerStyle },
        "Close",
      );
    },
  );
}

const flagCodes = ["ad", "ae", "af", "ag", "al", "am", "ao", "aq", "ar", "at", "au", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bn", "bo", "br", "bs", "bt", "bw", "by", "bz", "ca", "cd", "cf", "cg", "ch", "ci", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "er", "es", "et", "fi", "fj", "fm", "fr", "ga", "gb", "gd", "ge", "gh", "gm", "gn", "gq", "gr", "gt", "gw", "gy", "hn", "hr", "ht", "hu", "id", "ie", "il", "in", "iq", "ir", "is", "it", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mr", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "ne", "ng", "ni", "nl", "no", "np", "nr", "nz", "om", "pa", "pe", "pg", "ph", "pk", "pl", "ps", "pt", "pw", "py", "qa", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv", "sy", "sz", "td", "tg", "th", "tj", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "us", "uy", "uz", "va", "vc", "ve", "vn", "vu", "ws", "xk", "ye", "za", "zm", "zw"];

function flagEmoji(code) {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

const flagNames = new Intl.DisplayNames(["en"], { type: "region" });
const flagImages = {};
let flagList = null;

function flagImage(code) {
  if (!(code in flagImages)) {
    flagImages[code] = null;
    const el = new Image();
    el.onload = () => {
      const g = createGraphics(320, 240);
      g.drawingContext.drawImage(el, 0, 0, 320, 240);
      flagImages[code] = g;
    };
    el.onerror = () => console.warn(`flag failed to load: ${code}`);
    el.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(flagSvgs[code] || "");
  }
  return flagImages[code];
}

function drawVabMenu() {
  if (!flagList) {
    flagList = flagCodes.map((code) => {
      let name = code.toUpperCase();
      try {
        name = flagNames.of(name) || name;
      } catch (e) {}
      return { code, name };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  GUIAPI.panel(
    360,
    520,
    { id: "vab-flag-menu", borderColor: "#555", dim: true },
    "Choose your country",
    (ui) => {
      const top = ui.content.y;
      const bottom = top + ui.content.sy;
      for (const f of flagList) {
        const row = ui.row(32);
        if (row.y + row.sy < top || row.y > bottom) continue;
        GUIAPI.button(
          row.x,
          row.y,
          row.sx,
          row.sy,
          {
            id: `flag-${f.code}`,
            ...menuStyle,
            baseColor: f.code === playerCountry ? "#2d6a4f" : menuStyle.baseColor,
          },
          f.name,
        );
        const img = flagImage(f.code);
        if (img) image(img, row.x + 6, row.y + 6, 32, 24);
      }
    },
  );
  GUIAPI.button(
    width / 2 - 70,
    height / 2 + 270,
    140,
    36,
    { id: "vab-flag-close", ...dangerStyle },
    "Close",
  );
}
