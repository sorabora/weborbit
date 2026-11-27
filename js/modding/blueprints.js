function isBlueprint(part) {
  return part.name.startsWith("$");
}

function findBlueprint(name) {
  for (const pack of loaded) {
    const found = pack.parts.find(
      (part) => part.name === name && isBlueprint(part),
    );
    if (found) {
      return found;
    }
  }
  return null;
}

function blueprintValue(type, raw) {
  if (type === "Number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (type === "Boolean") {
    return raw === true || raw === "true";
  }
  return raw;
}

function isVoid(value) {
  const raw = value && typeof value === "object" ? value.$var : value;
  if (typeof raw !== "string") {
    return false;
  }
  const text = raw.replace(/^=/, "").trim();
  return text === "{{::void}}" || text === "::void";
}

function stripVoid(value) {
  if (Array.isArray(value)) {
    return value.map(stripVoid);
  }
  if (value && typeof value === "object" && !isVoid(value)) {
    const out = {};
    for (const [key, held] of Object.entries(value)) {
      if (!isVoid(held)) {
        out[key] = stripVoid(held);
      }
    }
    return out;
  }
  return value;
}

function mergeModuleData(base, own, baseWins) {
  if (Array.isArray(base) && Array.isArray(own)) {
    return [...base, ...own];
  }
  if (
    base &&
    own &&
    typeof base === "object" &&
    typeof own === "object" &&
    !Array.isArray(base) &&
    !Array.isArray(own)
  ) {
    const out = { ...base };
    for (const [key, value] of Object.entries(own)) {
      out[key] =
        key in out ? mergeModuleData(out[key], value, baseWins) : value;
    }
    return out;
  }
  return baseWins ? base : own;
}

function ownModules(part) {
  return part._own || part.modules || {};
}

function blueprintModules(blueprint, trail) {
  if (trail.includes(blueprint.name)) {
    console.warn(
      `blueprint "${blueprint.name}" imports itself through ${trail.join(" -> ")}`,
    );
    return {};
  }
  const own = ownModules(blueprint);
  const imported = (own["Blueprint Module"] || {}).Blueprint;
  const base = imported
    ? importedModules(
        imported,
        own["Blueprint Module"].Arguments,
        [...trail, blueprint.name],
        blueprint.name,
      )
    : {};
  return mergeModules(base, own, false);
}

function mergeModules(base, own, baseWins) {
  const out = stripVoid(JSON.parse(JSON.stringify(base)));
  for (const [name, data] of Object.entries(own)) {
    if (name === "Blueprint Module") {
      continue;
    }
    if (!(name in out)) {
      out[name] = JSON.parse(JSON.stringify(data));
    } else if (name === "Variables Module") {
      const rows = out[name].Variables || [];
      const names = new Set((data.Variables || []).map((row) => row.Name));
      const held = new Set(rows.map((row) => row.Name));
      const mine = (data.Variables || []).filter(
        (row) => !baseWins || !held.has(row.Name),
      );
      out[name] = {
        ...(baseWins ? { ...data, ...out[name] } : { ...out[name], ...data }),
        Variables: [
          ...rows.filter((row) => baseWins || !names.has(row.Name)),
          ...mine,
        ],
      };
    } else {
      out[name] = mergeModuleData(
        out[name],
        JSON.parse(JSON.stringify(data)),
        baseWins,
      );
    }
  }
  return out;
}

function importedModules(name, args, trail, importer) {
  const blueprint = findBlueprint(name);
  if (!blueprint) {
    console.warn(`"${importer}" wants blueprint "${name}", which isn't loaded`);
    return {};
  }
  const modules = blueprintModules(blueprint, trail);
  const params =
    (ownModules(blueprint)["Blueprint Module"] || {}).Parameters || [];
  const given = new Map(
    (args || []).filter((row) => row.Name).map((row) => [row.Name, row.Value]),
  );
  for (const key of given.keys()) {
    if (!params.some((param) => param.Name === key)) {
      console.warn(
        `"${importer}" passes "${key}" to blueprint "${name}", which has no such parameter`,
      );
    }
  }
  const rows = params
    .filter((param) => param.Name)
    .map((param) => ({
      Name: param.Name,
      Type: param.Type || "String",
      Value: blueprintValue(
        param.Type,
        given.has(param.Name) ? given.get(param.Name) : param.Default,
      ),
    }));
  if (rows.length) {
    const vars = modules["Variables Module"] || {};
    const kept = (vars.Variables || []).filter(
      (row) => !rows.some((param) => param.Name === row.Name),
    );
    modules["Variables Module"] = { ...vars, Variables: [...rows, ...kept] };
  }
  return modules;
}

function expandBlueprints() {
  for (const pack of loaded) {
    for (const part of pack.parts) {
      const own = ownModules(part);
      const imp = own["Blueprint Module"];
      if (!imp || !imp.Blueprint || isBlueprint(part)) {
        continue;
      }
      const expanded = mergeModules(
        importedModules(imp.Blueprint, imp.Arguments, [part.name], part.name),
        own,
        true,
      );
      if (!part._own) {
        Object.defineProperty(part, "_own", {
          value: own,
          writable: true,
          enumerable: false,
        });
        Object.defineProperty(part, "toJSON", {
          enumerable: false,
          value() {
            return { ...this, modules: this._own };
          },
        });
      }
      part.modules = expanded;
    }
  }
}

function hiddenPart(name) {
  for (const pack of loaded) {
    const found = pack.parts.find((part) => part.name === name);
    if (found) {
      return found;
    }
  }
  return null;
}

expandBlueprints();
