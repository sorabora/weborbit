const mathFuncs = {
  abs: Math.abs,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  pow: Math.pow,
  exp: Math.exp,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  hypot: Math.hypot,
  min: Math.min,
  max: Math.max,
  random: Math.random,
  clamp: (v, lo, hi) => Math.min(Math.max(v, lo), hi),
  lerp: (a, b, f) => a + (b - a) * f,
};
const mathConsts = { pi: Math.PI, tau: Math.PI * 2, e: Math.E };

function tokenizeFormula(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j++;
      toks.push({ t: "str", v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      toks.push({ t: "op", v: two });
      i += 2;
      continue;
    }
    if ("+-*/%^()?:,<>!".includes(ch)) {
      toks.push({ t: "op", v: ch });
      i++;
      continue;
    }
    i++;
  }
  return toks;
}

function parseFormula(toks) {
  let pos = 0;
  const peek = () => toks[pos];
  const next = () => toks[pos++];
  const isOp = (tok, v) => !!tok && tok.t === "op" && tok.v === v;
  const binaryLevel = (sub, ops) => () => {
    let left = sub();
    while (peek() && peek().t === "op" && ops[peek().v]) {
      const op = ops[next().v];
      const right = sub();
      const l = left;
      left = (scope) => op(l(scope), right(scope));
    }
    return left;
  };
  function parseExpr() {
    const cond = parseOr();
    if (isOp(peek(), "?")) {
      next();
      const a = parseExpr();
      next();
      const b = parseExpr();
      return (scope) => (cond(scope) ? a(scope) : b(scope));
    }
    return cond;
  }
  const parseOr = binaryLevel(() => parseAnd(), { "||": (a, b) => a || b });
  const parseAnd = binaryLevel(() => parseEq(), { "&&": (a, b) => a && b });
  const parseEq = binaryLevel(() => parseRel(), {
    "==": (a, b) => a === b,
    "!=": (a, b) => a !== b,
  });
  const parseRel = binaryLevel(() => parseAdd(), {
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
  });
  const parseAdd = binaryLevel(() => parseMul(), {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
  });
  const parseMul = binaryLevel(() => parsePow(), {
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "%": (a, b) => a % b,
  });
  function parsePow() {
    const left = parseUnary();
    if (isOp(peek(), "^")) {
      next();
      const right = parsePow();
      return (scope) => Math.pow(left(scope), right(scope));
    }
    return left;
  }
  function parseUnary() {
    if (isOp(peek(), "-")) {
      next();
      const e = parseUnary();
      return (scope) => -e(scope);
    }
    if (isOp(peek(), "!")) {
      next();
      const e = parseUnary();
      return (scope) => !e(scope);
    }
    return parsePrimary();
  }
  function parsePrimary() {
    const tok = next();
    if (!tok) return () => 0;
    if (tok.t === "num") return () => tok.v;
    if (tok.t === "str") return () => tok.v;
    if (isOp(tok, "(")) {
      const e = parseExpr();
      next();
      return e;
    }
    if (tok.t === "id") {
      if (isOp(peek(), "(")) {
        next();
        const args = [];
        if (!isOp(peek(), ")")) {
          args.push(parseExpr());
          while (isOp(peek(), ",")) {
            next();
            args.push(parseExpr());
          }
        }
        next();
        const fn = mathFuncs[tok.v];
        return (scope) => (fn ? fn(...args.map((a) => a(scope))) : 0);
      }
      if (tok.v in mathConsts) {
        const val = mathConsts[tok.v];
        return () => val;
      }
      const name = tok.v;
      return (scope) => scope[name];
    }
    return () => 0;
  }
  return parseExpr();
}

function evalFormula(expr, scope) {
  try {
    return parseFormula(tokenizeFormula(String(expr ?? "")))(scope);
  } catch (e) {
    return 0;
  }
}

function isBinding(value) {
  return !!value && typeof value === "object" && typeof value.$var === "string";
}

function resolveField(entry, value, seen) {
  if (!isBinding(value)) {
    return value;
  }
  seen = seen || new Set();
  if (seen.has(value.$var)) {
    return undefined;
  }
  seen.add(value.$var);
  if (value.$var.startsWith("=")) {
    const scope = { ...partVars(entry) };
    for (const [key, held] of Object.entries(readOnlyOf(entry))) {
      scope["::" + key] = held;
    }
    scope["::Elapsed Time"] = elapsedTime(entry);
    return evalText(entry, value.$var.slice(1), scope);
  }
  if (value.$var.startsWith("::")) {
    const name = value.$var.slice(2);
    if (name === "Toggled") {
      return !!entry.on;
    }
    if (name === "Elapsed Time") {
      return elapsedTime(entry);
    }
    return readOnlyOf(entry)[name];
  }
  return resolveField(entry, partVars(entry)[value.$var], seen);
}

function initVars(entry) {
  const mod = (entry.part.modules || {})["Variables Module"];
  const vars = {};
  for (const row of (mod && mod.Variables) || []) {
    if (row.Name) {
      vars[row.Name] = row.Value;
    }
  }
  return vars;
}

function elapsedTime(entry) {
  if (entry.bornAt === undefined) {
    entry.bornAt = t;
  }
  return Math.max(t - entry.bornAt, 0);
}

function partVars(entry) {
  if (!entry.vars) {
    entry.vars = initVars(entry);
  }
  return entry.vars;
}

function moduleScope(entry) {
  const scope = { ...partVars(entry) };
  for (const [name, value] of Object.entries(readOnlyOf(entry))) {
    scope["::" + name] = value;
  }
  scope["::Elapsed Time"] = elapsedTime(entry);
  for (const mod of Object.values(entry.part.modules || {})) {
    for (const [key, value] of Object.entries(mod)) {
      if (
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean"
      ) {
        scope[key.replace(/ /g, "")] = resolveField(entry, value);
      }
    }
  }
  return scope;
}

function interpolate(str, scope) {
  return String(str ?? "").replace(
    /\{\{\s*([^{}]+?)\s*\}\}/g,
    (_, name) => scope[name] ?? "",
  );
}

function parseLogicValue(v) {
  if (v === undefined) {
    return v;
  }
  const n = Number(v);
  return v !== "" && !Number.isNaN(n) ? n : v;
}

function firstList(mod) {
  for (const value of Object.values(mod || {})) {
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function runMathModule(entry) {
  const mod = (entry.part.modules || {})["Math Module"];
  if (!mod) {
    return;
  }
  const scope = moduleScope(entry);
  firstList(mod).forEach((row, i) => {
    partVars(entry)["Math " + (i + 1)] = evalText(entry, row.Expression, scope);
  });
}

const booleanOps = {
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  eq: (a, b) => a === b,
  gte: (a, b) => a >= b,
  gt: (a, b) => a > b,
};

function runBooleanModule(entry) {
  const mod = (entry.part.modules || {})["Boolean Logic Module"];
  if (!mod) {
    return;
  }
  const scope = moduleScope(entry);
  firstList(mod).forEach((row, i) => {
    const test = booleanOps[row.Comparison] || booleanOps.eq;
    partVars(entry)["Bool " + (i + 1)] = test(
      evalText(entry, row.Left, scope),
      evalText(entry, row.Right, scope),
    );
  });
}

function runExtraDataModule(rocket, entry) {
  const mod = (entry.part.modules || {})["Extra Data Module"];
  if (!mod) {
    return;
  }
  const store =
    mod.Scope === "World"
      ? worldData.data || (worldData.data = {})
      : mod.Scope === "Planet"
        ? getBody(rocket.parentBody).extraData ||
          (getBody(rocket.parentBody).extraData = {})
        : rocket.extraData || (rocket.extraData = {});
  for (const row of mod.Data || []) {
    if (row.Key) {
      store[row.Key] = resolveField(entry, row.Value);
    }
  }
}
