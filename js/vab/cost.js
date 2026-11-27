const cost = {
  multi: 200,
  perTon: 200,
  thrust: 1,
  isp: 500,
  ispPower: 1.5,
  torque: 40,
  drag: 0.6,
  separation: 3,
  ablator: 400,
  resource: {
    Kerolox: 50,
    "Solid Fuel": 70,
    Methalox: 70,
    Hydrolox: 180,
    Monopropellant: 110,
    Xenon: 2000,
    Ore: 10,
  },
};

function partCost(part) {
  return runFilter("cost:part", partCostBase(part), { part });
}

function partCostBase(part) {
  if (hasNozzle(part)) {
    return (part.stats ?? shapeEngine(part).stats).cost;
  }
  const m = part.modules || {};
  let total = (part.mass || 0) * cost.perTon;
  if (m["Engine Module"]) {
    total +=
      m["Engine Module"].Thrust * cost.thrust +
      cost.isp * Math.pow(m["Engine Module"].ISP / 300, cost.ispPower);
  }
  if (m["Resource Module"]) {
    for (const p of tankResources(m["Resource Module"])) {
      total += p.amount * (cost.resource[p.resource] ?? 50);
    }
  }
  if (m["Controller Module"])
    total += m["Controller Module"].Torque * cost.torque;
  if (m["Parachute Module"]) total += m["Parachute Module"].Drag * cost.drag;
  if (m["Decoupler Module"])
    total += m["Decoupler Module"]["Separation Force"] * cost.separation;
  if (m["Heat Shield Module"])
    total += m["Heat Shield Module"].Ablator * cost.ablator;
  return total * cost.multi;
}

function stackCost() {
  return runFilter("cost:stack", stackCostBase(), { parts: vab.parts });
}

function stackCostBase() {
  let total = 0;
  for (const inst of vab.parts) {
    total += partCost(inst.part);
  }
  return total;
}

function stackMass() {
  let total = 0;
  for (const inst of vab.parts) {
    total += inst.part.mass || 0;
  }
  return total;
}

let defaultResource = "Kerolox";

// Resource/Ratio is the engine's main propellant; More Resources: [{ Resource, Ratio }, ...]
// is an optional list of extra ones drawn alongside it in the same mix, split by ratio.
function engineResources(engine) {
  const rows = [
    { resource: engine.Resource || defaultResource, ratio: engine.Ratio || 1 },
    ...(Array.isArray(engine["More Resources"])
      ? engine["More Resources"]
      : []
    ).map((p) => ({
      resource: p.Resource || defaultResource,
      ratio: p.Ratio || 0,
    })),
  ];
  const total = rows.reduce((sum, p) => sum + p.ratio, 0) || 1;
  return rows.map((p) => ({ resource: p.resource, ratio: p.ratio / total }));
}

function tankResources(tank) {
  const startFraction = tank["Starting Fuel %"] ?? 1;
  const list = tank["More Resources"];
  if (Array.isArray(list) && list.length) {
    return list.map((p) => ({
      resource: p.Resource || defaultResource,
      amount: p.Amount || 0,
      startFraction,
    }));
  }
  return [
    {
      resource: tank.Resource || defaultResource,
      amount: tank.Amount || 0,
      startFraction,
    },
  ];
}

function stackFuel() {
  const tanks = {};
  for (const inst of vab.parts) {
    const resource = (inst.part.modules || {})["Resource Module"];
    if (resource) {
      for (const p of tankResources(resource)) {
        tanks[p.resource] = (tanks[p.resource] || 0) + p.amount;
      }
    }
  }
  return tanks;
}

function totalFuel(tanks) {
  let total = 0;
  for (const name in tanks) {
    total += tanks[name];
  }
  return total;
}
