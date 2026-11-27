function parseVersion(v) {
  return String(v ?? "0")
    .replace(/^[~^<>=]+/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
}

function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff) {
      return diff < 0 ? -1 : 1;
    }
  }
  return 0;
}

function satisfiesRange(version, range) {
  if (!range) {
    return true;
  }
  range = String(range).trim();
  const v = parseVersion(version);
  if (range.startsWith("~")) {
    const base = parseVersion(range);
    return (
      v[0] === base[0] && v[1] === base[1] && (v[2] || 0) >= (base[2] || 0)
    );
  }
  if (range.startsWith("^")) {
    const base = parseVersion(range);
    if (base[0] > 0) {
      return v[0] === base[0] && compareVersions(version, range) >= 0;
    }
    if (base[1] > 0) {
      return (
        v[0] === 0 && v[1] === base[1] && compareVersions(version, range) >= 0
      );
    }
    return v[0] === 0 && v[1] === 0 && (v[2] || 0) === (base[2] || 0);
  }
  if (range.startsWith(">=")) {
    return compareVersions(version, range.slice(2)) >= 0;
  }
  if (range.startsWith("<=")) {
    return compareVersions(version, range.slice(2)) <= 0;
  }
  if (range.startsWith(">")) {
    return compareVersions(version, range.slice(1)) > 0;
  }
  if (range.startsWith("<")) {
    return compareVersions(version, range.slice(1)) < 0;
  }
  return compareVersions(version, range) === 0;
}
