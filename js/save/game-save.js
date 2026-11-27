let craftInput = null;

function craftPick() {
  if (!craftInput) {
    craftInput = document.createElement("input");
    craftInput.type = "file";
    craftInput.accept = ".json,application/json";
    craftInput.style.display = "none";
    document.body.appendChild(craftInput);
    craftInput.addEventListener("change", () => {
      const file = craftInput.files[0];
      craftInput.value = ""; // or the same file twice running fires nothing
      if (file) {
        file
          .text()
          .then((text) => craftLoad(JSON.parse(text)))
          .catch((err) => console.warn("craft won't load:", err));
      }
    });
  }
  craftInput.click();
}

function isBasePack(pack) {
  return pack.parts.some((part) => part.name === "_vab");
}

function packKey(pack) {
  return JSON.stringify(pack, (key, value) =>
    key.startsWith("_") || key === "setInfo" ? undefined : value,
  );
}

function saveReplacer(key, value) {
  if (key === "fx" || key.startsWith("_") || key === "setInfo") {
    return undefined;
  }
  return key === "part" ? value.name : value;
}

function gameSave() {
  const flags = plantedFlagSaves();
  const save = {
    format: "xopernicus-save",
    version: 1,
    t,
    balance,
    careerMode,
    career: careerMode ? career : undefined,
    craft: craftData() || undefined,
    target,
    camera,
    rockets,
    loaded,
    flags,
  };
  const text = JSON.stringify(
    runFilter("save:write", save, {}),
    saveReplacer,
    2,
  );
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = careerMode ? "career-world.json" : "sandbox-world.json";
  link.click();
  URL.revokeObjectURL(url);
  launchToast(
    careerMode ? "Career world exported." : "Sandbox world exported.",
  );
}

async function gameLoad(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    console.warn("save won't load:", err);
    launchToast("Save won't load.");
    return;
  }
  if (raw.format !== "xopernicus-save" || !Array.isArray(raw.rockets)) {
    launchToast("Not a save file.");
    return;
  }
  if (
    raw.careerMode &&
    raw.career &&
    careerHasProgress() &&
    !confirm(
      "This career world replaces your current career progress. Import it anyway?",
    )
  ) {
    return;
  }
  if (Array.isArray(raw.loaded) && raw.loaded.length) {
    const known = new Set(loaded.map(packKey));
    let addedMods = false;
    for (const pack of raw.loaded.filter((pack) => !isBasePack(pack))) {
      const key = packKey(pack);
      if (!known.has(key)) {
        known.add(key);
        if (await loadPack(pack, { silent: true })) {
          addedMods = true;
        }
      }
    }
    if (addedMods) {
      await loadPartTextures();
    }
  }
  const parts = partAPI.list();
  let save;
  try {
    save = JSON.parse(text, (key, value) => {
      if (key !== "part") {
        return value;
      }
      const part = parts.find((p) => p.name === value) || hiddenPart(value);
      if (!part) {
        throw new Error(`save wants a part that isn't loaded: ${value}`);
      }
      return part;
    });
  } catch (err) {
    console.warn("save won't load:", err);
    launchToast("Save won't load.");
    return;
  }
  t = save.t;
  balance = save.balance;
  careerMode = save.careerMode;
  if (careerMode && save.career) {
    restoreCareer(save.career);
  }
  target = save.target;
  camera = save.camera;
  rockets = save.rockets;
  restorePlantedFlags(raw.flags);
  if (raw.craft) {
    craftLoad(raw.craft);
  }
  threadQueues = []; // the old threads point at rockets that are gone
  updateBodies();
  runHook("save:loaded", { save });
  launchToast(
    careerMode ? "Career world imported." : "Sandbox world imported.",
  );
}

let saveInput = null;

function gamePick() {
  if (!saveInput) {
    saveInput = document.createElement("input");
    saveInput.type = "file";
    saveInput.accept = ".json,application/json";
    saveInput.style.display = "none";
    document.body.appendChild(saveInput);
    saveInput.addEventListener("change", () => {
      const file = saveInput.files[0];
      saveInput.value = ""; // or the same file twice running fires nothing
      if (file) {
        file.text().then(gameLoad);
      }
    });
  }
  saveInput.click();
}
