// Loads the game's scripts in order. If a patched build exists (see
// js/modding/patcher.js) the patched copy of a file is used instead of the
// original. Must stay synchronous so the scripts keep their order.
const gameScripts = [
  "supabase.umd.js",
  "flags.js",
  "flag-data.js",
  "js/core/state.js",
  "js/data/parts.js",
  "js/core/defaults.js",
  "js/core/errors.js",
  "js/core/hooks.js",
  "js/modding/patcher.js",
  "js/modding/blueprints.js",
  "js/modding/part-api.js",
  "js/modding/gui-api.js",
  "js/vab/layout.js",
  "js/modding/versions.js",
  "js/modding/pack-loader.js",
  "js/rendering/part-render.js",
  "js/vab/part-graph.js",
  "js/ui/menus.js",
  "js/career/economy.js",
  "js/career/tech-tree-data.js",
  "js/career/missions.js",
  "js/career/milestones.js",
  "js/career/career.js",
  "js/ui/career-ui.js",
  "js/ui/tech-tree.js",
  "js/map/map-view.js",
  "js/map/maneuvers.js",
  "js/map/trajectory.js",
  "js/vab/engine-flame.js",
  "js/vab/paint.js",
  "js/vab/vab-view.js",
  "js/vab/cost.js",
  "js/logic/formula.js",
  "js/logic/part-logic.js",
  "js/save/craft.js",
  "js/data/example-crafts.js",
  "js/save/game-save.js",
  "js/flight/launch.js",
  "js/modding/rocket-api.js",
  "js/data/bodies.js",
  "js/boot/bootloader.js",
  "js/boot/splash.js",
  "js/core/setup.js",
  "js/physics/orbits.js",
  "js/physics/thermal.js",
  "js/physics/atmosphere.js",
  "js/physics/propulsion.js",
  "js/flight/guides.js",
  "js/flight/part-hover.js",
  "js/flight/staging.js",
  "js/physics/surface.js",
  "js/rendering/body-render.js",
  "js/anim/threads.js",
  "js/anim/animations.js",
  "js/ui/part-guis.js",
  "js/rendering/rocket-render.js",
  "js/core/draw.js",
  "js/ui/hud.js",
  "js/ui/dev-console.js",
  "js/input/input.js",
  "js/core/astro-menu.js",
];

(() => {
  let build = null;
  try {
    build = JSON.parse(localStorage.getItem("weborbit-patched-build"));
  } catch {}
  const files = (build && build.files) || {};
  for (const src of gameScripts) {
    if (typeof files[src] === "string") {
      const url = URL.createObjectURL(
        new Blob([`${files[src]}\n//# sourceURL=${src}`], {
          type: "text/javascript",
        }),
      );
      document.write(`<script src="${url}"><\/script>`);
    } else {
      document.write(`<script src="${src}"><\/script>`);
    }
  }
})();
