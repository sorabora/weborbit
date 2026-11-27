const easings = {
  Linear: (p) => p,
  "Ease In": (p) => p * p,
  "Ease Out": (p) => 1 - (1 - p) * (1 - p),
  "Ease In Out": (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  Bounce: (p) => {
    const n = 7.5625;
    const d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  },
  Elastic: (p) => {
    if (p === 0 || p === 1) return p;
    return (
      Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
    );
  },
};

function queueThread(owner, tag, tasks) {
  threadQueues.push({ owner, tag, tasks, at: 0, elapsed: 0 });
}

function threadsFor(owner, tag) {
  return threadQueues.filter(
    (t) => t.owner === owner && (!tag || t.tag === tag),
  );
}

function stopThreads(owner, tag) {
  threadQueues = threadQueues.filter(
    (t) => !(t.owner === owner && (!tag || t.tag === tag)),
  );
}

function tweenTask(slot, key, from, to, seconds, easing) {
  const ease = easings[easing] || easings.Linear;
  return {
    seconds,
    run: (p) => {
      slot[key] = from + (to - from) * ease(p);
    },
  };
}

function updateThreads(dt) {
  for (const thread of threadQueues) {
    let left = dt;
    while (left > 0 && thread.at < thread.tasks.length) {
      const task = thread.tasks[thread.at];
      const seconds = task.seconds || 0;
      thread.elapsed += left;
      if (thread.elapsed >= seconds) {
        task.run(1);
        left = thread.elapsed - seconds;
        thread.elapsed = 0;
        thread.at++;
      } else {
        task.run(thread.elapsed / seconds);
        left = 0;
      }
    }
  }
  threadQueues = threadQueues.filter((t) => t.at < t.tasks.length);
}

function baseBlur(part) {
  return Number(((part.modules || {})["Blur Module"] || {}).Blur) || 0;
}

function fxDefault(property, part) {
  return property === "Blur" ? baseBlur(part) : 1; // width and height are multipliers
}

function fxSlot(entry, row) {
  if (row["Whole Prefab"]) {
    return entry.fx.part;
  }
  const index = Number(row.Group) || 0;
  if (!entry.fx.groups[index]) {
    entry.fx.groups[index] = {};
  }
  return entry.fx.groups[index];
}

function applyFrame(entry, rows) {
  for (const row of rows || []) {
    fxSlot(entry, row)[row.Property] = Number(row.Value) || 0;
  }
}
