const RocketAPI = {
  spawn(craft, opts = {}) {
    const source = typeof craft === "string" ? exampleCrafts[craft] : craft;
    const player = rockets.find((rocket) => rocket.id === target);
    if (!source || !player) {
      return null;
    }
    const distance = opts.distance ?? 20;
    const side = opts.side ?? 1;
    const body = getBody(player.parentBody);
    const radial = player.landed
      ? { x: player.landed.x, y: player.landed.y }
      : (() => {
          const dx = player.pos.x - body.pos.x;
          const dy = player.pos.y - body.pos.y;
          const len = Math.hypot(dx, dy) || 1;
          return { x: dx / len, y: dy / len };
        })();
    const tangent = { x: -radial.y * side, y: radial.x * side };
    const saved = { parts: vab.parts, drag: vab.drag, snap: vab.snap };
    let rocket = null;
    let newId = `spawn-${Date.now()}-${rockets.length + 1}`;

    if (opts.name) {
      newId = opts.name;
    }

    try {
      craftLoad(source, opts.allowHidden);
      if (vab.parts === saved.parts) {
        return null;
      }
      const stack = stackSnapshot();
      const wet = Math.max(stackMass() * c.kgPerTon, 1);
      const trim = Math.min(
        1,
        wet / Math.max(totalFuel(stackFuel()) * c.kgPerTon, 1),
      );
      fillTanks(stack, trim);
      const tanks = stackTanks(stack);
      const fuel = totalFuel(tanks);
      rocket = {
        pos: {
          x: player.pos.x + tangent.x * distance,
          y: player.pos.y + tangent.y * distance,
        },
        vel: { x: player.vel.x, y: player.vel.y },
        mass: wet,
        dryMass: Math.max(wet - fuel, 1),
        fuel,
        fuelMax: fuel,
        tanks,
        tanksMax: { ...tanks },
        angle: Math.atan2(radial.x, -radial.y),
        dragArea: 10,
        dragCoeff: 0.5,
        id: newId,
        parentBody: player.parentBody,
        landed: player.landed ? radial : null,
        launchNo: 0,
        stack,
      };
      rockets.push(rocket);
      splitRocket(rocket, () => false, 0);
    } finally {
      vab.parts = saved.parts;
      vab.drag = saved.drag;
      vab.snap = saved.snap;
    }
    return rocket;
  },
};
