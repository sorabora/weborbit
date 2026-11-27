function persistLoadedMods() {
  try {
    localStorage.setItem(
      "weborbit-loaded-mods",
      JSON.stringify(loaded.slice(defaultLoadedCount)),
    );
  } catch (err) {
    console.warn(`couldn't persist loaded mods: ${err.message}`);
  }
}

async function restoreLoadedMods() {
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem("weborbit-loaded-mods"));
  } catch (err) {
    console.warn(`couldn't parse stored mods: ${err.message}`);
    return;
  }
  const mods = (stored || []).filter((pack) => !isBasePack(pack));
  for (const pack of mods) {
    await loadPack(pack, { silent: true });
  }
  if (mods.length !== (stored || []).length) {
    persistLoadedMods();
  }
}

async function loadPack(pack, opts = {}) {
  const name = pack.name || "This mod";
  if (
    pack.requiredVersion &&
    !satisfiesRange(gameVersion, pack.requiredVersion)
  ) {
    if (opts.silent) {
      console.warn(
        `Skipped mod "${name}": requires game version ${pack.requiredVersion}, running ${gameVersion}`,
      );
    } else {
      alert(
        `"${name}" requires game version ${pack.requiredVersion}, but you're running ${gameVersion}. It will not be loaded.`,
      );
    }
    return false;
  }
  if (
    !opts.silent &&
    pack.recommendedVersion &&
    !satisfiesRange(gameVersion, pack.recommendedVersion)
  ) {
    const ok = confirm(
      `"${name}" recommends game version ${pack.recommendedVersion}, but you're running ${gameVersion}. Some things might not work right. Load it anyway?`,
    );
    if (!ok) {
      return false;
    }
  }
  loaded.push(pack);
  if (!opts.silent) {
    await resolveDependencies(pack);
  }
  expandBlueprints();
  if (!opts.skipPersist) {
    persistLoadedMods();
  }
  return true;
}

async function loadFeaturedMod(data) {
  const threadId = new URL(data.threadUrl).searchParams.get("id");
  if (!threadId) {
    alert(`Couldn't load that mod: no thread id in ${data.threadUrl}`);
    return;
  }
  try {
    const { data: rows, error } = await supabaseClient.rpc("get_thread", {
      p_thread_id: threadId,
    });
    if (error) {
      throw new Error(error.message);
    }
    const thread = rows?.[0];
    if (!thread?.mod_url) {
      throw new Error("thread has no mod_url");
    }
    const res = await fetch(thread.mod_url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const pack = await res.json();
    if (await loadPack(pack)) {
      await loadPartTextures();
      alert(
        `Loaded mod! "${pack.name || data.title}" by ${thread.username ?? "Unknown"}`,
      );
    }
  } catch (err) {
    alert(`Couldn't load that mod: ${err.message}`);
  }
}

async function fetchDependency(dep) {
  const res = await fetch(dep.url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function resolveDependencies(pack) {
  for (const dep of pack.dependencies || []) {
    if (!dep.url) {
      continue;
    }
    let fetched;
    try {
      fetched = await fetchDependency(dep);
    } catch (err) {
      const wants = confirm(
        `"${pack.name || "This mod"}" depends on a mod at ${dep.url}, but it couldn't be fetched (${err.message}). Paste its JSON instead?`,
      );
      if (!wants) {
        continue;
      }
      const answer = prompt(`Paste JSON for the mod at ${dep.url}`);
      if (!answer) {
        continue;
      }
      try {
        fetched = JSON.parse(answer);
      } catch (err2) {
        alert(`Couldn't parse that part pack: ${err2.message}`);
        continue;
      }
    }
    if (loaded.find((p) => p.name === fetched.name)) {
      continue;
    }
    const wants = confirm(
      `"${pack.name || "This mod"}" depends on "${fetched.name || dep.url}"${fetched.modVersion ? " " + fetched.modVersion : ""}, which isn't loaded. Load it now?`,
    );
    if (!wants) {
      continue;
    }
    await loadPack(fetched);
  }
}

const jsModsKey = "weborbit-js-mods";
let jsMods = [];

function persistJsMods() {
  try {
    localStorage.setItem(jsModsKey, JSON.stringify(jsMods));
  } catch (err) {
    console.warn(`couldn't persist JS mods: ${err.message}`);
  }
}

function runJsMod(mod) {
  const onError = (e) =>
    console.error(`JS mod "${mod.name}" failed`, e.error || e.message);
  window.addEventListener("error", onError);
  const el = document.createElement("script");
  el.textContent = `${mod.code}\n//# sourceURL=jsmod-${encodeURIComponent(mod.name)}.js`;
  document.head.append(el);
  el.remove();
  window.removeEventListener("error", onError);
}

// called during the loading screen
function restoreJsMods() {
  try {
    const stored = JSON.parse(localStorage.getItem(jsModsKey));
    jsMods = Array.isArray(stored)
      ? stored.filter((m) => m && typeof m.name === "string" && typeof m.code === "string")
      : [];
  } catch (err) {
    console.warn(`couldn't parse stored JS mods: ${err.message}`);
    jsMods = [];
  }
  for (const mod of jsMods) {
    runJsMod(mod);
  }
}

function pickJsModFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,text/javascript";
    input.addEventListener("cancel", () => resolve(null));
    input.addEventListener("change", async () => {
      const file = input.files[0];
      resolve(file ? { name: file.name, code: await file.text() } : null);
    });
    input.click();
  });
}

async function loadJsModFromFile() {
  return addJsMod(await pickJsModFile());
}

function loadJsModFromPaste() {
  const code = prompt("Paste your JS mod code here");
  if (!code) {
    return false;
  }
  const name = prompt("Name this mod", "pasted-mod.js");
  return addJsMod({ name: name || "pasted-mod.js", code });
}

// takes a mod id but doesn't fetch anything yet
function loadJsModFromServer() {
  const id = prompt("Enter the ID of the JS mod");
  if (!id) {
    return false;
  }
  console.log(`Server JS mods aren't implemented yet (id: ${id})`);
  return false;
}

function addJsMod(mod) {
  if (!mod) {
    return false;
  }
  jsMods = jsMods.filter((m) => m.name !== mod.name);
  jsMods.push(mod);
  persistJsMods();
  runJsMod(mod);
  // a mod loaded mid-session that patches game files needs a rebuild. reload
  // and let the loading screen do it, with the red bar
  if (patchesNeedRebuild()) {
    location.reload();
  }
  return true;
}
