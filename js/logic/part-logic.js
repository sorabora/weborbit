const worldData = {};

const readOnlyReaders = {
  Velocity: (rocket) =>
    Math.hypot(
      ...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody))),
    ),
  Speed: (rocket) =>
    Math.hypot(
      ...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody))),
    ),
  Altitude: (rocket) =>
    distanceTo(rocket, getBody(rocket.parentBody)) -
    getBody(rocket.parentBody).size,
  Planet: (rocket) => rocket.parentBody,
  "Distance From Star": (rocket) =>
    distanceTo(rocket, rootBody(getBody(rocket.parentBody))),
  Rotation: (rocket) => ((((rocket.angle * 180) / Math.PI) % 360) + 360) % 360,
  "Angular Velocity": (rocket) => rocket._angVel || 0,
  "X Position": (rocket) => rocket.pos.x,
  "Y Position": (rocket) => rocket.pos.y,
  Heading: (rocket) => {
    const vel = relativeVelocity(rocket, getBody(rocket.parentBody));
    return ((((Math.atan2(vel.x, -vel.y) * 180) / Math.PI) % 360) + 360) % 360;
  },
  Throttle: () => throttle,
  Time: () => t,
  "World Time": () => t,
  Mass: (rocket) => rocket.mass,
  Apoapsis: (rocket) => rocketOrbit(rocket).apoapsis,
  Periapsis: (rocket) => rocketOrbit(rocket).periapsis,
  "Orbital Velocity": (rocket) =>
    Math.hypot(
      ...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody))),
    ),
  "Surface Velocity": (rocket) =>
    Math.hypot(
      ...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody))),
    ),
  "Air Density": (rocket) => {
    const body = getBody(rocket.parentBody);
    return densityAt(body, Math.max(distanceTo(rocket, body) - body.size, 0));
  },
  "Stage Number": (rocket) =>
    rocket.stack.parts.filter((e) => (e.part.modules || {})["Decoupler Module"])
      .length + 1,
  "Part Count": (rocket) => rocket.stack.parts.length,
  void: () => "",
};

function rootBody(body) {
  return body.parentBody ? rootBody(getBody(body.parentBody)) : body;
}

// same math as getOrbit(), just taking the rocket instead of reading the
// globally targeted one
function rocketOrbit(rocket) {
  const body = getBody(rocket.parentBody);
  const mu = gravParam(body);
  const rx = rocket.pos.x - body.pos.x;
  const ry = rocket.pos.y - body.pos.y;
  const r = Math.sqrt(rx ** 2 + ry ** 2);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  const h = rx * vel.y - ry * vel.x;
  const energy = (speed * speed) / 2 - mu / r;
  const a = -mu / (2 * energy);
  const e = Math.sqrt(Math.max(1 + (2 * energy * h * h) / (mu * mu), 0));
  return {
    apoapsis: e < 1 ? a * (1 + e) - body.size : Infinity,
    periapsis: a * (1 - e) - body.size,
  };
}

function readOnlyValues(rocket) {
  const values = {};
  for (const name in readOnlyReaders) {
    try {
      values[name] = readOnlyReaders[name](rocket);
    } catch (e) {
      values[name] = undefined;
    }
  }
  return values;
}

function readOnlyOf(entry) {
  return (entry._rocket && entry._rocket._readOnly) || {};
}

function evalText(entry, expr, scope) {
  return evalFormula(interpolate(expr, scope), scope);
}

function runResourceFillerModule(entry, dt) {
  const mod = (entry.part.modules || {})["Resource Filler Module"];
  if (!mod) {
    return;
  }
  const unset =
    mod.Condition === undefined ||
    mod.Condition === null ||
    mod.Condition === "";
  if (!unset && !resolveField(entry, mod.Condition)) {
    return;
  }
  const resource = mod.Resource;
  if (!resource || !entry._rocket) {
    return;
  }
  pipeDeposit(
    entry._rocket,
    resource,
    (Number(resolveField(entry, mod.Rate)) || 0) * dt,
  );
}

function clockValue(entry, value) {
  return typeof value === "string" && value.includes("{{")
    ? interpolate(value, moduleScope(entry))
    : value;
}

function applyClockAction(entry, action) {
  const vars = partVars(entry);
  const name = isBinding(action.Variable) ? action.Variable.$var : undefined;
  if (action.actionDropdown === "Set Variable" && name) {
    vars[name] = parseLogicValue(clockValue(entry, action.Value));
  } else if (action.actionDropdown === "Change Variable" && name) {
    vars[name] =
      (Number(vars[name]) || 0) +
      (Number(parseLogicValue(clockValue(entry, action.Value))) || 0);
  } else if (action.actionDropdown === "Toggle Part") {
    entry.on = !entry.on;
  }
}

function runClockFunction(entry, name) {
  const mod = (entry.part.modules || {})["Variables Clock Module"];
  const fn = mod && (mod.Functions || []).find((f) => f.Name === name);
  if (!fn) {
    return;
  }
  if (!entry._clock) {
    entry._clock = {};
  }
  entry._clock[name] = { actions: fn.Action || [], i: 0, wait: 0 };
}

function tickClocks(entry, dt) {
  if (!entry._clock) {
    return;
  }
  for (const name in entry._clock) {
    const state = entry._clock[name];
    if (state.wait > 0) {
      state.wait -= dt * 1000;
      continue;
    }
    if (state.i >= state.actions.length) {
      delete entry._clock[name];
      continue;
    }
    const action = state.actions[state.i];
    if (action.actionDropdown === "Wait") {
      state.wait = action.Miliseconds || 0;
    } else {
      applyClockAction(entry, action);
    }
    state.i++;
  }
}

function runSelfDestruct(rocket, entry) {
  const mod = (entry.part.modules || {})["Self Destruct Module"];
  if (!mod || rocket.destroyed) {
    return;
  }
  if (resolveField(entry, Object.values(mod)[0])) {
    cd.body = rocket.parentBody;
    cd.speed = 0;
    cd.limit = 0;
    cd.time = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", { reason: "self destruct" });
  }
}

function runFuelpipes(rocket, dt) {
  for (const entry of rocket.stack.parts) {
    const pipe = (entry.part.modules || {})["Fuelpipe Module"];
    if (!pipe) {
      continue;
    }
    const input = pipe["Input Fuel"];
    const output = pipe["Output Fuel"];
    const rate = pipe["Rate (Kg/Sec)"] || 0;
    if (!input || !output || rate <= 0) {
      continue;
    }
    const drained = pipeDrain(rocket, input, rate * dt);
    pipeDeposit(rocket, output, drained);
  }
}

function pipeDrain(rocket, resource, want) {
  const sources = rocket.stack.parts.filter(
    (e) => (e.tanks || {})[resource] > 0,
  );
  const avail = sources.reduce((sum, e) => sum + e.tanks[resource], 0);
  let left = Math.min(avail, want);
  const drained = left;
  for (const e of sources) {
    if (left <= 0) {
      break;
    }
    const take = Math.min(e.tanks[resource], left);
    e.tanks[resource] -= take;
    left -= take;
  }
  return drained - left;
}

function pipeDeposit(rocket, resource, amount) {
  if (amount <= 0) {
    return;
  }
  const targets = rocket.stack.parts.filter(
    (e) => (e.tanksMax || {})[resource] > 0,
  );
  let left = amount;
  for (const e of targets) {
    if (left <= 0) {
      break;
    }
    const room = (e.tanksMax[resource] || 0) - (e.tanks[resource] || 0);
    const add = Math.min(room, left);
    e.tanks[resource] = (e.tanks[resource] || 0) + add;
    left -= add;
  }
}

function runPartLogic(dt) {
  for (const rocket of rockets) {
    if (!rocket.stack) {
      continue;
    }
    if (dt > 0) {
      rocket._angVel =
        ((rocket.angle - (rocket._prevAngle ?? rocket.angle)) * 180) /
        Math.PI /
        dt;
      rocket._prevAngle = rocket.angle;
    }
    rocket._readOnly = readOnlyValues(rocket);
    for (const entry of rocket.stack.parts) {
      entry._rocket = rocket;
      elapsedTime(entry);
      runMathModule(entry);
      runBooleanModule(entry);
      runExtraDataModule(rocket, entry);
      runResourceFillerModule(entry, dt * c.timewarp);
      tickClocks(entry, dt);
      runSelfDestruct(rocket, entry);
      for (const name in modModules) {
        const props = (entry.part.modules || {})[name];
        if (props && modModules[name].tick) {
          try {
            modModules[name].tick({ rocket, entry, props, dt });
          } catch (err) {
            console.warn(`module "${name}" threw:`, err);
          }
        }
      }
    }
    runHook("rocket:tick", { rocket, dt });
  }
}
