// Source patching for JS mods.
//
//   patchLine("js/ui/menus.js", 12, 'const menuStyle = { ... };', { expect: "menuStyle" })
//
// Mods register patches while they run (during the loading screen). When
// loading finishes and the registered patches differ from the ones in the
// stored patched build, the loading bar turns red, a patched copy of every
// affected file is built and stored, and the page reloads. script-loader.js
// then loads the patched copies instead of the originals.

const patchBuildKey = "weborbit-patched-build";
const patchAttemptKey = "weborbit-patch-attempt";
const patchMinPhaseMs = 500;

// { "js/ui/menus.js": { 12: { text, expect } } }
const patches = {};

function patchLine(file, line, text, opts = {}) {
  if (!gameScripts.includes(file)) {
    console.warn(`patchLine: "${file}" isn't a game script`);
    return false;
  }
  if (!Number.isInteger(line) || line < 1) {
    console.warn(`patchLine: bad line number ${line} for ${file}`);
    return false;
  }
  if (typeof text !== "string") {
    console.warn(`patchLine: new text for ${file}:${line} must be a string`);
    return false;
  }
  patches[file] ??= {};
  if (patches[file][line] && patches[file][line].text !== text) {
    console.warn(`patchLine: ${file}:${line} was patched twice, last one wins`);
  }
  patches[file][line] = { text, expect: opts.expect };
  return true;
}

// the original (unpatched) lines of a game file, to help find what to patch
async function getGameLines(file) {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`couldn't fetch ${file}: ${res.status}`);
  }
  return (await res.text()).split("\n");
}

function hasPatches() {
  return Object.keys(patches).length > 0;
}

function patchSignature() {
  if (!hasPatches()) {
    return "none";
  }
  const sorted = Object.keys(patches)
    .sort()
    .map((f) => [
      f,
      Object.keys(patches[f])
        .map(Number)
        .sort((a, b) => a - b)
        .map((n) => [n, patches[f][n].text, patches[f][n].expect || ""]),
    ]);
  const str = JSON.stringify([gameVersion, sorted]);
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return `p${(h >>> 0).toString(36)}`;
}

function appliedPatchSignature() {
  try {
    const build = JSON.parse(localStorage.getItem(patchBuildKey));
    return build && build.sig ? build.sig : "none";
  } catch {
    return "none";
  }
}

function patchesNeedRebuild() {
  return patchSignature() !== appliedPatchSignature();
}

// builds the patched copy of the game and stores it. no patches = drop the build
async function buildPatchedGame() {
  const sig = patchSignature();
  if (sig === "none") {
    localStorage.removeItem(patchBuildKey);
    return;
  }
  const files = {};
  for (const file of Object.keys(patches)) {
    const lines = await getGameLines(file);
    for (const [num, patch] of Object.entries(patches[file])) {
      const idx = Number(num) - 1;
      if (idx >= lines.length) {
        console.warn(`patch skipped: ${file} has no line ${num}`);
        continue;
      }
      if (patch.expect && !lines[idx].includes(patch.expect)) {
        console.warn(
          `patch skipped: ${file}:${num} doesn't contain "${patch.expect}" (the game may have changed)`,
        );
        continue;
      }
      lines[idx] = patch.text;
    }
    files[file] = lines.join("\n");
  }
  localStorage.setItem(patchBuildKey, JSON.stringify({ sig, files }));
}

// the red phase at the end of loading. returns true if the page is reloading
async function runPatchPhase() {
  const sig = patchSignature();
  // never retry the same build twice in a session, so a failure can't loop
  if (sessionStorage.getItem(patchAttemptKey) === sig) {
    console.warn("patched build didn't apply, skipping rebuild");
    return false;
  }
  sessionStorage.setItem(patchAttemptKey, sig);

  const start = performance.now();
  let building = true;
  let failed = false;
  buildPatchedGame()
    .catch((err) => {
      failed = true;
      console.error("couldn't build patched game", err);
    })
    .finally(() => (building = false));
  while (building || performance.now() - start < patchMinPhaseMs) {
    drawBootScreen(1, {
      color: "#d33",
      label: "Applying mod patches...",
    });
    await nextFrame();
  }
  if (failed) {
    return false;
  }
  location.reload();
  await new Promise(() => {});
}
