function chuteState(rocket, entry, chute) {
  if (entry.torn) {
    return "  torn";
  }
  if (entry.deployed) {
    return "  deployed";
  }
  const body = getBody(rocket.parentBody);
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  const need = (chute["Minimum Deploy Pressure"] || 0) * 1000;
  if (pressureAt(body, alt) < need) {
    return `  too high, needs ${format("pressure", need)}`;
  }
  const vel = relativeVelocity(rocket, body);
  if (Math.hypot(vel.x, vel.y) > (chute["Max Deploy Speed"] || Infinity)) {
    return `  click to deploy (over ${chute["Max Deploy Speed"]} m/s, will tear)`;
  }
  return "  click to deploy";
}

function formatKg(kg) {
  const abs = Math.abs(kg);
  if (abs >= 1e6) {
    return `${(kg / 1e6).toFixed(2)} kt`;
  }
  if (abs >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  if (abs >= 1) {
    return `${kg.toFixed(1)} kg`;
  }
  return `${(kg * 1000).toFixed(1)} g`;
}

function resourceLines(entry) {
  const max = entry.tanksMax || {};
  return Object.keys(max)
    .filter((name) => max[name] > 0)
    .map(
      (name) =>
        `  ${name}: ${formatKg(entry.tanks[name] || 0)} / ${formatKg(max[name])}`,
    );
}

// the hovered part and where its tooltip is pinned, so the cursor can reach it
let tip = null;

function crewRows(rocket, entry, readOnly) {
  const controller = (entry.part.modules || {})["Controller Module"];
  if (!controller) {
    return [];
  }
  const crew = entry.paint?.crew ?? [];
  return [
    { text: `  crew: ${crew.length}/${controller["Max Crew"] ?? 0}` },
    ...crew.map((name) =>
      readOnly
        ? { text: `  ${name}` }
        : {
            text: `EVA ${name}`,
            id: `flight-eva-${name}`,
            data: { rocket, entry, name },
          },
    ),
  ];
}

// other = a rocket you are not flying: only controller parts, read-only
function drawPartHover(rocket, other = false) {
  let entry = flightPartAt(rocket, mouseX, mouseY, other);
  const box = GUIAPI.tipBox;
  const near =
    !!box && GUIAPI.contains(box.x - 40, box.y - 40, box.sx + 80, box.sy + 80);
  if (!entry && tip && tip.rocket === rocket && near) {
    entry = tip.entry;
  }
  if (!entry) {
    tip = null;
    return;
  }
  if (!tip || tip.entry !== entry) {
    tip = { rocket, entry, x: mouseX, y: mouseY };
  }
  const modules = entry.part.modules || {};
  let action = null;
  if (other) {
    // no actions on other rockets
  } else if (modules["Decoupler Module"]) {
    action = "  click to decouple";
  } else if (modules["Parachute Module"]) {
    action = chuteState(rocket, entry, modules["Parachute Module"]);
  } else if (modules["Engine Module"]) {
    action = entry.on ? "  click to shut down" : "  click to light";
    const max = maxIgnitions(entry.part.name);
    if (Number.isFinite(max)) {
      const used = entry.ignitionsUsed || 0;
      action +=
        used >= max && !entry.on
          ? "  (out of ignitions)"
          : `  (ignitions ${used}/${max})`;
    }
  } else if (modules["Togglable Module"]) {
    action = entry.on ? "  click to disable" : "  click to enable";
  } else if (modules["Docking Module"] && rocket.dockedWith) {
    action = "  click to undock";
  }

  const shield = modules["Heat Shield Module"];
  let ablatorLine = null;
  if (shield && !other) {
    const max = entry.ablatorMax ?? shield.Ablator * c.kgPerTon;
    const left = entry.ablator ?? max;
    ablatorLine = `  ablator: ${Math.round(left)}/${Math.round(max)} kg`;
  }

  const s = scale / c.partUnits;
  const bb = partBBox(entry.part);
  push();
  translate(
    width / 2 + (rocket.pos.x - camera.pos.x) * scale,
    height / 2 + (rocket.pos.y - camera.pos.y) * scale,
  );
  rotate(rocket.angle);
  noFill();
  stroke(action ? "#5cf" : "#ffffff55");
  strokeWeight(2);
  translate(entry.ox * s, entry.oy * s);
  rotate((entry.rot || 0) * HALF_PI);
  rect((-bb.w / 2) * s, (-bb.h / 2) * s, bb.w * s, bb.h * s);
  pop();

  // a row with an id is a button; data is what its click gets back
  const rows = [
    { text: entry.part.name },
    action && { text: action.trim(), id: "flight-action", data: { rocket, entry } },
    other && {
      text: "Enter Vehicle",
      id: "flight-switch",
      data: { rocket, entry },
    },
    ...crewRows(rocket, entry, other),
    ablatorLine && { text: ablatorLine },
    ...(other ? [] : resourceLines(entry)).map((text) => ({ text })),
  ].filter(Boolean);
  GUIAPI.tooltip(280, 24 + rows.length * 30, (ui) => {
    for (const row of rows) {
      if (row.id) {
        ui.button(0, 0, undefined, 24, { id: row.id, data: row.data, ...menuStyle }, row.text);
      } else {
        ui.label(row.text, { size: 13, height: 18 });
      }
    }
  }, tip.x, tip.y);
}

function evaCrew(rocket, entry, name) {
  
}

// the part action: used by clicking the part and by the tooltip button
function activatePart(rocket, entry) {
  const modules = entry.part.modules || {};
  if (modules["Disable Action on Click"]) {
    return;
  }
  if (modules["Decoupler Module"]) {
    decouple(rocket, entry);
  } else if (modules["Parachute Module"]) {
    deployChute(rocket, entry);
  } else if (modules["Engine Module"] || modules["Togglable Module"]) {
    const engineMod = modules["Engine Module"];
    if (engineMod && engineMod["SRB Mode"]) {
      if (!entry.on) {
        entry.on = true;
      }
    } else if (engineMod && !entry.on) {
      const used = entry.ignitionsUsed || 0;
      if (used < maxIgnitions(entry.part.name)) {
        entry.on = true;
      }
    } else {
      if (engineMod && entry.on) {
        entry.consumedIgnition = false;
      }
      entry.on = !entry.on;
    }
  } else if (modules["Docking Module"] && rocket.dockedWith) {
    undock(rocket);
  }
}

function flightPartAt(rocket, mx, my, controllerOnly = false) {
  if (!rocket || !rocket.stack) {
    return null;
  }
  const s = scale / c.partUnits;
  const m = unrotate(mx, my);
  const dx = m.x - (width / 2 + (rocket.pos.x - camera.pos.x) * scale);
  const dy = m.y - (height / 2 + (rocket.pos.y - camera.pos.y) * scale);
  const a = -rocket.angle;
  const lx = (dx * Math.cos(a) - dy * Math.sin(a)) / s;
  const ly = (dx * Math.sin(a) + dy * Math.cos(a)) / s;
  for (let i = rocket.stack.parts.length - 1; i >= 0; i--) {
    const entry = rocket.stack.parts[i];
    if (
      controllerOnly &&
      !((entry.part.modules || {})["Controller Module"]?.["Max Crew"] >= 1)
    ) {
      continue;
    }
    const bb = partBBox(entry.part);
    const ra = -(entry.rot || 0) * HALF_PI;
    const rx = lx - entry.ox;
    const ry = ly - entry.oy;
    const px = rx * Math.cos(ra) - ry * Math.sin(ra) + bb.cx;
    const py = rx * Math.sin(ra) + ry * Math.cos(ra) + bb.cy;
    for (const group of entry.part.groups) {
      if (group.noCollision) {
        continue;
      }
      if (pointInPolygon(px, py, group.points)) {
        return entry;
      }
    }
  }
  return null;
}
