function addHook(name, fn, priority = 0) {
  hooks[name] ??= [];
  hooks[name].push({ fn, priority });
  hooks[name].sort((a, b) => a.priority - b.priority);
  return fn;
}

function removeHook(name, fn) {
  if (hooks[name]) hooks[name] = hooks[name].filter((h) => h.fn !== fn);
}

// hooks just get told something happened
function runHook(name, ctx) {
  for (const { fn } of hooks[name] ?? []) {
    try {
      fn(ctx);
    } catch (err) {
      console.warn(`hook ${name} broke:`, err);
    }
  }
}

// filters can swap the value out, returning nothing keeps it as is
function runFilter(name, value, ctx) {
  for (const { fn } of hooks[name] ?? []) {
    try {
      value = fn(value, ctx) ?? value;
    } catch (err) {
      console.warn(`filter ${name} broke:`, err);
    }
  }
  return value;
}
