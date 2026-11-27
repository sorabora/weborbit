const partAPI = {
  list() {
    let parts = [];
    for (let pack of loaded) {
      for (let part of pack.parts) {
        if (
          !part.name.startsWith("_") &&
          !part.name.startsWith("$") &&
          !part.modules["Prototype Module"]
        ) {
          parts.push(part);
        } else if (showHidden) {
          parts.push(part);
          // if showHidden is toggled then a part shows through here even if they start with _, $, or have the prototype moduel. 
        }
      }
    }
    return runFilter("vab:partList", parts, {});
  },

  read(inst) {
    if (!inst || !inst.part) {
      return null;
    }
    return {
      name: inst.part.name,
      def: inst.part,
      modules: inst.part.modules || {},
      stored: inst.paint || {},
    };
  },

  write(inst, patch) {
    setPaint(inst, patch);
  },
};
