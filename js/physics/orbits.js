function getBody(id) {
  return planets.find((planet) => planet.id === id);
}

function gravParam(body) {
  return runFilter("physics:gravParam", gravParamBase(body), { body });
}

function gravParamBase(body) {
  return body.surfaceGravity * body.size * body.size;
}

// solves Kepler's equation E - e*sin(E) = M by Newton
function eccentricAnomaly(mean, e) {
  if (!e) {
    return mean;
  }
  let E = mean;
  for (let i = 0; i < 12; i++) {
    const step = (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
    E -= step;
    if (Math.abs(step) < 1e-12) {
      break;
    }
  }
  return E;
}

function updateBodies() {
  for (const body of planets) {
    if (!body.parentBody) {
      continue;
    }
    const parent = getBody(body.parentBody);
    // orbitRadius is the semi-major axis, periapsis sits along +x
    const a = body.orbitRadius;
    const e = body.orbitEccentricity || 0;
    const b = a * Math.sqrt(1 - e * e);
    const laps = (t / body.orbitPeriod) % 1;
    const mean = (body.orbitPhase || 0) + TWO_PI * laps;
    const E = eccentricAnomaly(mean, e);
    body.pos.x = parent.pos.x + a * (Math.cos(E) - e);
    body.pos.y = parent.pos.y + b * Math.sin(E);
    const rate = TWO_PI / body.orbitPeriod / (1 - e * Math.cos(E));
    body.vel.x = parent.vel.x - a * Math.sin(E) * rate;
    body.vel.y = parent.vel.y + b * Math.cos(E) * rate;
  }
  runHook("bodies:update", { planets, t });
}

// sphere of influence radius: a * (m/M)^(2/5)
function soiRadius(body) {
  return runFilter("physics:soiRadius", soiRadiusBase(body), { body });
}

function soiRadiusBase(body) {
  if (!body.parentBody) {
    return Infinity;
  }
  const parent = getBody(body.parentBody);
  return body.orbitRadius * Math.pow(gravParam(body) / gravParam(parent), 0.4);
}

function distanceTo(rocket, body) {
  return Math.hypot(body.pos.x - rocket.pos.x, body.pos.y - rocket.pos.y);
}

function updateSOI(rocket) {
  let body = getBody(rocket.parentBody);
  while (body.parentBody && distanceTo(rocket, body) > soiRadius(body)) {
    body = getBody(body.parentBody);
  }
  let entered = true;
  while (entered) {
    entered = false;
    for (const child of planets) {
      if (
        child.parentBody === body.id &&
        distanceTo(rocket, child) < soiRadius(child)
      ) {
        body = child;
        entered = true;
        break;
      }
    }
  }
  const next = runFilter("physics:soi", body, { rocket }) || body;
  if (next.id !== rocket.parentBody) {
    runHook("rocket:soiChange", {
      rocket,
      from: rocket.parentBody,
      to: next.id,
    });
  }
  rocket.parentBody = next.id;
}

function format(unit, value) {
  return runFilter("hud:format", formatBase(unit, value), { unit, value });
}

function formatBase(unit, value) {
  switch (unit) {
    case "speed":
      if (value >= 299792458 * 0.01) {
        if (value / 299792458 >= 1) {
          return `${(value / 299792458).toFixed(2)}c`;
        } else {
          return `${((value / 299792458) * 100).toFixed(1)}% c`;
        }
      } else if (value >= 99999) {
        return `${Math.round(value / 1000)} km/s`;
      } else {
        return `${Math.round(value)} m/s`;
      }
    case "distance":
      if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(3)} Gm`;
      } else if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(2)} Mm`;
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(1)} km`;
      } else {
        return `${Math.round(value)} m`;
      }
    case "pressure":
      if (value >= 1000) {
        return `${(value / 1000).toFixed(2)} kPa`;
      } else if (value >= 1) {
        return `${value.toFixed(2)} Pa`;
      } else if (value >= 1e-3) {
        return `${(value * 1e3).toFixed(2)} mPa`;
      } else if (value >= 1e-6) {
        return `${(value * 1e6).toFixed(2)} µPa`;
      } else if (value >= 1e-11) {
        return `${(value * 1e9).toFixed(2)} nPa`;
      } else {
        return `Vacuum`;
      }
    case "temperature":
      return `${(value - 273.15).toFixed(1)} °C`;
  }
}
