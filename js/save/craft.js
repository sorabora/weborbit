function stageBreakdown() {
  const stack = stackSnapshot();
  if (!stack.parts.length) {
    return [];
  }
  const wet = Math.max(stackMass() * c.kgPerTon, 1);
  const trim = Math.min(
    1,
    wet / Math.max(totalFuel(stackFuel()) * c.kgPerTon, 1),
  );
  fillTanks(stack, trim);

  const cuts = stack.parts
    .filter((entry) => (entry.part.modules || {})["Decoupler Module"])
    .map((entry) => entry.oy)
    .sort((a, b) => b - a);

  const sections = [];
  let above = Infinity;
  for (const cut of cuts) {
    sections.push(
      stack.parts.filter((entry) => entry.oy >= cut && entry.oy < above),
    );
    above = cut;
  }
  sections.push(stack.parts.filter((entry) => entry.oy < above));

  const flying = new Set(stack.parts);
  const massNow = () => {
    let total = 0;
    for (const entry of flying) {
      total +=
        (entry.part.mass || 0) * c.kgPerTon -
        totalFuel(entry.tanksMax || {}) +
        totalFuel(entry.tanks || {});
    }
    return total;
  };

  const stages = [];
  for (const section of sections) {
    if (!section.length) {
      continue;
    }
    let thrust = 0;
    let perIsp = 0;
    const feed = new Set();
    // RCS thrusters, only used when the stage has no engine of its own
    const rcs = { thrust: 0, perIsp: 0, feed: new Set() };
    for (let i = 0; i < stack.parts.length; i++) {
      const entry = stack.parts[i];
      const engine = (entry.part.modules || {})["Engine Module"];
      const thruster = (entry.part.modules || {})["RCS Module"];
      if (thruster && section.includes(entry)) {
        // one direction fires at a time, so a part counts its thrust once
        const push = (thruster.Thrust || 0) * c.newtonsPerThrust;
        rcs.thrust += push;
        if (thruster.ISP > 0) {
          rcs.perIsp += push / thruster.ISP;
        }
        const resource = thruster.Resource || defaultResource;
        for (const tank of feedTanks(stack, i, resource)) {
          rcs.feed.add(tank);
        }
      }
      if (
        !section.includes(entry) ||
        !engine ||
        engine["Fuel Flow"] === "Negative"
      ) {
        continue;
      }
      for (const p of engineResources(engine)) {
        for (const tank of feedTanks(stack, i, p.resource)) {
          feed.add(tank);
        }
      }
      const push = (engine.Thrust || 0) * c.newtonsPerThrust;
      thrust += push;
      if (engine.ISP > 0) {
        perIsp += push / engine.ISP;
      }
    }
    if (thrust === 0) {
      ({ thrust, perIsp } = rcs);
      rcs.feed.forEach((tank) => feed.add(tank));
    }
    const isp = perIsp > 0 ? thrust / perIsp : 0;
    const wetMass = massNow();
    for (const tank of feed) {
      tank.tanks = {};
    }
    const dryMass = massNow();
    const dv =
      isp > 0 && dryMass > 0 && wetMass > dryMass
        ? isp * G0 * Math.log(wetMass / dryMass)
        : 0;
    stages.push({ dv, thrust, wetMass, isp });
    for (const entry of section) {
      flying.delete(entry);
    }
  }
  return stages;
}

function stackSnapshot() {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const inst of vab.parts) {
    const bb = partBBox(inst.part);
    const w = (inst.rot || 0) % 2 ? bb.h : bb.w;
    const h = (inst.rot || 0) % 2 ? bb.w : bb.h;
    minX = Math.min(minX, inst.x - (w / 2) * vab.scale);
    maxX = Math.max(maxX, inst.x + (w / 2) * vab.scale);
    minY = Math.min(minY, inst.y - (h / 2) * vab.scale);
    maxY = Math.max(maxY, inst.y + (h / 2) * vab.scale);
  }
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  return {
    w: (maxX - minX) / vab.scale,
    h: (maxY - minY) / vab.scale,
    parts: vab.parts.map((inst) => ({
      part: inst.part,
      ox: (inst.x - midX) / vab.scale,
      oy: (inst.y - midY) / vab.scale,
      rot: inst.rot || 0,
      paint: inst.paint,
    })),
  };
}

function craftData() {
  if (!vab.parts.length) {
    return null;
  }
  const snap = stackSnapshot();
  return {
    format: "xopernicus-craft",
    version: 1,
    parts: vab.parts.map((inst, i) => ({
      name: inst.part.name,
      x: snap.parts[i].ox,
      y: snap.parts[i].oy,
      rot: inst.rot || 0,
      attachedTo: inst.attachedTo ? vab.parts.indexOf(inst.attachedTo) : null,
      parentNode: inst.parentNode || null,
      stage: inst.stage || 0,
      ...(inst.part.flip ? { flip: inst.part.flip } : {}),
      ...(inst.part._base
        ? hasNozzle(inst.part)
          ? { engine: inst.part.config }
          : isBooster(inst.part)
            ? { booster: inst.part.config }
            : { size: inst.part.size, fuel: inst.part.fuel }
        : {}),
      ...(inst.paint ? { paint: inst.paint } : {}),
    })),
  };
}

function craftSave() {
  const craft = craftData();
  if (!craft) {
    return;
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(craft, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "craft.json";
  link.click();
  URL.revokeObjectURL(url);
}

function craftExportContext() {
  const craft = craftData();
  if (!craft) {
    return;
  }
  const parts = partAPI.list();
  const ys = craft.parts.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const noseIndex = craft.parts.findIndex((p) => p.y === minY);
  const tailIndex = craft.parts.findIndex((p) => p.y === maxY);

  const context = {
    format: "xopernicus-craft-context",
    version: 1,
    orientation: {
      note: "Coordinates are screen-space, not math axes: SMALLER (more negative) y is toward the NOSE/top of the rocket, LARGER (more positive) y is toward the ENGINES/tail at the bottom. A part with a lower y value sits closer to the nose, not further underground. This craft is not upside down.",
      noseAt: "minimum y",
      tailAt: "maximum y",
      noseIsPartIndex: noseIndex,
      tailIsPartIndex: tailIndex,
    },
    stagingNote:
      "The 'stage' field groups parts that fire/activate together in the VAB's staging UI. It does not by itself give flight order; use 'attachedTo' and each part's y position (nose-to-tail) to see how the stack actually comes apart.",
    parts: craft.parts.map((p, i) => {
      const def = parts.find((part) => part.name === p.name);
      const modules = (def && def.modules) || {};
      const engine = modules["Engine Module"];
      const resource = modules["Resource Module"];
      const controller = modules["Controller Module"];
      const decoupler = modules["Decoupler Module"];
      return {
        index: i,
        name: p.name,
        x: p.x,
        y: p.y,
        distanceFromNose: p.y - minY,
        rot: p.rot,
        attachedTo: p.attachedTo,
        parentNode: p.parentNode,
        stage: p.stage,
        mass: def ? def.mass : null,
        engine: engine
          ? {
              thrustKN: engine.Thrust,
              isp: engine.ISP,
              fuel: engine.Resource,
              srb: !!engine["SRB Mode"],
            }
          : undefined,
        fuelTank: resource
          ? { amount: resource.Amount, resource: resource.Resource }
          : undefined,
        controller: controller
          ? {
              torque: controller.Torque,
              providesControl: controller["Provides Control"],
            }
          : undefined,
        decoupler: decoupler
          ? { separationForce: decoupler["Separation Force"] }
          : undefined,
      };
    }),
  };

  const url = URL.createObjectURL(
    new Blob([JSON.stringify(context, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "craft-context.json";
  link.click();
  URL.revokeObjectURL(url);
}

function craftLoad(craft, allowHidden = false) {
  if (
    !craft ||
    craft.format !== "xopernicus-craft" ||
    !Array.isArray(craft.parts)
  ) {
    console.warn("not a craft file");
    return;
  }
  const parts = partAPI.list();
  const built = [];
  for (const entry of craft.parts) {
    let part =
      parts.find((p) => p.name === entry.name) ||
      (allowHidden ? hiddenPart(entry.name) : null);
    if (!part) {
      console.warn(`craft wants a part that isn't loaded: ${entry.name}`);
      return;
    }
    if (entry.flip?.x) part = flipPart(part, 0);
    if (entry.flip?.y) part = flipPart(part, 1);
    if (entry.size && isTank(part)) part = resizePart(part, ...entry.size, entry.fuel);
    if (entry.engine && hasNozzle(part)) part = shapeEngine(part, entry.engine);
    if (entry.booster && isBooster(part)) part = shapeBooster(part, entry.booster);
    const fitted = fitUnlocks(part);
    built.push({
      part: fitted,
      adjusted: fitted !== part,
      x: bayCentre() + entry.x * vab.scale,
      y: height / 2 + entry.y * vab.scale,
      rot: entry.rot || 0,
      paint: entry.paint,
      attachedTo: null,
      stage: entry.stage || 0,
    });
  }
  craft.parts.forEach((entry, i) => {
    const parent = built[entry.attachedTo];
    if (parent && entry.parentNode) {
      attach(built[i], parent, entry.parentNode);
    }
  });
  vab.parts = built;
  built.forEach((inst) => inst.adjusted && resizeInst(inst, inst.part));
  vab.drag = null;
  vab.snap = null;
}
