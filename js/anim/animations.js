function formatTimeWarpCounter() {
  fill("#ff4646");
  if (timeWarpCounter < 16) {
    fill("#ff9d00");
  }
  if (timeWarpCounter < 13) {
    fill("#fdff83");
  }
  if (timeWarpCounter < 7) {
    fill("#89ff83");
  }
  if (timeWarpCounter < 2) {
    fill("#83c9ff");
  }
  if (timeWarpCounter == 2) {
    fill("White");
  }
  return timeWarpCounter;
}

function playRows(entry, rows, tag) {
  const chains = new Map();
  for (const row of rows || []) {
    const slot = fxSlot(entry, row);
    const key = row.Property;
    const id =
      (row["Whole Prefab"] ? "part" : `g${Number(row.Group) || 0}`) + ":" + key;
    let chain = chains.get(id);
    if (!chain) {
      const start =
        slot[key] === undefined ? fxDefault(key, entry.part) : slot[key];
      chain = { slot, key, at: start, tasks: [] };
      chains.set(id, chain);
    }
    const to = Number(row.To) || 0;
    chain.tasks.push(
      tweenTask(
        chain.slot,
        chain.key,
        chain.at,
        to,
        Number(row.Seconds) || 0,
        row.Easing,
      ),
    );
    chain.at = to;
  }
  for (const chain of chains.values()) {
    queueThread(entry, tag, chain.tasks);
  }
}

function animTriggered(rocket, entry, anim) {
  const picks = anim.Trigger || [];
  if (!picks.length) {
    return false;
  }
  const body = getBody(rocket.parentBody);
  const alt = distanceTo(rocket, body) - body.size - rocketRadius(rocket);
  const fuel = totalFuel(rocket.tanks || {});
  const tests = {
    "Part Enabled": !!entry.on,
    "Throttle Above 0": throttle > 0,
    "On Ground": alt <= 1 && hasSurface(body),
    "In Flight": alt > 1 || !hasSurface(body),
    "Has Fuel": fuel > 0,
    "No Fuel": fuel <= 0,
  };
  const results = picks.map((name) => !!tests[name]);
  return anim["AND/OR Mode"] ? results.some(Boolean) : results.every(Boolean);
}

function driveAnimation(rocket, holder, anim, host) {
  if (!holder.fx) {
    holder.fx = { part: {}, groups: {} };
    applyFrame(holder, anim["Start Animation"]);
    holder.animOn = !!anim["Trigger on start"];
    if (holder.animOn) {
      playRows(holder, anim["To Animate"], "main");
    }
  }
  const held = animTriggered(rocket, host, anim);
  if (held && !holder.animOn) {
    holder.animOn = true;
    applyFrame(holder, anim["Start Animation"]);
    playRows(holder, anim["To Animate"], "main");
  } else if (!held && holder.animOn && anim["Stop if condition false"]) {
    holder.animOn = false;
    stopThreads(holder, "main");
    playRows(holder, anim["End Animation"], "end");
  } else if (!held) {
    holder.animOn = false;
  }
  if (anim.Loop && holder.animOn && !threadsFor(holder, "main").length) {
    playRows(holder, anim["To Animate"], "main");
  }
}

function runAnimations(dt) {
  const live = new Set();
  for (const rocket of rockets) {
    for (const entry of rocket.stack ? rocket.stack.parts : []) {
      const anim = (entry.part.modules || {})["Animate Module"];
      if (anim) {
        live.add(entry);
        driveAnimation(rocket, entry, anim, entry);
      }
      const engine = (entry.part.modules || {})["Engine Module"];
      if (engine) {
        const flamePart = hiddenPart(engine.Flame || "_flame");
        const flameAnim =
          flamePart && (flamePart.modules || {})["Animate Module"];
        if (flameAnim) {
          if (!entry.flame || entry.flame.part !== flamePart) {
            entry.flame = { part: flamePart };
          }
          live.add(entry.flame);
          driveAnimation(rocket, entry.flame, flameAnim, entry);
        }
      }
    }
  }
  threadQueues = threadQueues.filter((t) => live.has(t.owner));
  updateThreads(dt);
}
