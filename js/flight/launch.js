function launchToast(message) {
  toasts.push({
    message: message,
    hide: t + 3,
  });
}

function launch() {
  if (!vab.parts.length) {
    return;
  }
  if (
    !vab.parts.some((inst) => {
      const controller = (inst.part.modules || {})["Controller Module"];
      return !!controller && controller["Provides Control"] !== false;
    })
  ) {
    launchToast("Needs a pod or probe core");
    return;
  }
  if (vab.parts.some((inst) => !partAvailable(inst.part))) {
    launchToast("Rocket has locked parts.");
    return;
  }
  if (!runFilter("launch:allowed", true, { parts: vab.parts })) {
    return;
  }
  balance -= stackCost();
  if (careerMode) {
    saveCareer();
  }
  const earth = getBody("Earth");
  const stack = stackSnapshot();
  const halfHeight = stack.h / 2 / c.partUnits;
  const wet = Math.max(stackMass() * c.kgPerTon, 1);
  const trim = Math.min(
    1,
    wet / Math.max(totalFuel(stackFuel()) * c.kgPerTon, 1),
  );
  fillTanks(stack, trim);
  const tanks = stackTanks(stack);
  const fuel = totalFuel(tanks);
  const padAngle = radians(c.launchPadRotation);
  const out = { x: Math.sin(padAngle), y: -Math.cos(padAngle) };
  const pad = {
    x: earth.pos.x + out.x * earth.size,
    y: earth.pos.y + out.y * earth.size,
  };
  rockets = rockets.filter(
    (rocket) => Math.hypot(rocket.pos.x - pad.x, rocket.pos.y - pad.y) > 150,
  );
  const rocket = {
    pos: {
      x: earth.pos.x + out.x * (earth.size + halfHeight),
      y: earth.pos.y + out.y * (earth.size + halfHeight),
    },
    vel: { x: earth.vel.x, y: earth.vel.y },
    mass: wet,
    dryMass: Math.max(wet - fuel, 1),
    fuel,
    fuelMax: fuel,
    tanks,
    tanksMax: { ...tanks },
    angle: padAngle,
    dragArea: 10,
    dragCoeff: 0.5,
    id: `flight-${rockets.length + 1}`,
    parentBody: "Earth",
    landed: { x: out.x, y: out.y },
    launchNo: careerMode ? ++career.launches : 0,
    stack,
  };
  rockets.push(rocket);
  splitRocket(rocket, () => false, 0);
  target = rocket.id;
  rocketTimeline = [];
  timelineLastThrottle = null;
  timelineLastTurn = null;
  timelineLastSample = -Infinity;
  logTimelineEvent(rocket, "launch");
  if (careerMode) {
    saveCareer();
  }
  inVab = false;
  runHook("rocket:launched", { rocket });
}

function partTooltip(part) {
  const lines = [part.name];
  const modules = part.modules || {};
  for (const moduleName in modules) {
    lines.push(moduleName);
    const props = modules[moduleName];
    for (const key in props) {
      // show the ignitions you actually get, tech upgrades included
      const shown =
        moduleName === "Engine Module" && key === "Ignitions"
          ? maxIgnitions(part.name)
          : props[key];
      lines.push(`  ${key}: ${shown}`);
    }
  }
  return lines;
}
