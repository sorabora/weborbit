const milestoneSteps = { 1: 1, 5: 2, 10: 3, 25: 5, 100: 10 };
const milestoneBodies = [
  "Earth",
  "Speed",
  "Moon",
  "Mars",
  "Venus",
  "Mercury",
  "Ceres",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

const milestoneTests = {
  hop: (rocket) => readOnlyReaders.Altitude(rocket) >= 1000,
  space: (rocket) => readOnlyReaders.Altitude(rocket) >= 100000,
  flyby: () => true,
  speed: (rocket, spec) => readOnlyReaders.Speed(rocket) >= spec.threshold,
  orbit: (rocket) => {
    const body = getBody(rocket.parentBody);
    const orbit = rocketOrbit(rocket);
    return (
      !rocket.landed &&
      Number.isFinite(orbit.apoapsis) &&
      orbit.periapsis >= Math.max(body.atmosphereHeight || 0, 20000) + 5000
    );
  },
  land: (rocket) =>
    !!rocket.landed &&
    (rocket.parentBody !== "Earth" || !!rocket.achieved["hop:Earth"]),
  dip: (rocket) => {
    const body = getBody(rocket.parentBody);
    return densityAt(body, distanceTo(rocket, body) - body.size) >= 0.1;
  },
};

const milestoneKinds = {
  hop: {
    label: "Leave the ground",
    test: "hop",
    once: true,
    science: { Earth: 8 },
  },
  space: {
    label: "Reach space",
    test: "space",
    once: true,
    science: { Earth: 12 },
  },
  flyby: {
    label: "Flyby",
    test: "flyby",
    science: {
      Moon: 20,
      Mars: 20,
      Venus: 20,
      Mercury: 20,
      Ceres: 20,
      Jupiter: 20,
      Saturn: 20,
      Uranus: 20,
      Neptune: 20,
    },
  },
  orbit: {
    label: "Orbit",
    test: "orbit",
    science: {
      Earth: 12,
      Moon: 24,
      Mars: 24,
      Venus: 24,
      Mercury: 24,
      Ceres: 24,
      Jupiter: 24,
      Saturn: 24,
      Uranus: 24,
      Neptune: 24,
    },
  },
  land: {
    label: "Land",
    test: "land",
    science: {
      Earth: 6,
      Moon: 30,
      Mars: 30,
      Venus: 30,
      Mercury: 30,
      Ceres: 30,
    },
  },
  dip: {
    label: "Atmosphere dip",
    test: "dip",
    science: { Jupiter: 25, Saturn: 25, Uranus: 30, Neptune: 30 },
  },
  crewSpace: {
    label: "Crew to space",
    test: "space",
    crewed: true,
    science: { Earth: 12 },
  },
  crewOrbit: {
    label: "Crew in orbit",
    test: "orbit",
    crewed: true,
    science: { Earth: 20, Moon: 35, Mars: 40, Venus: 45 },
  },
  crewFlyby: {
    label: "Crewed flyby",
    test: "flyby",
    crewed: true,
    science: { Moon: 30, Mars: 35, Venus: 40 },
  },
  crewLand: {
    label: "Crewed landing",
    test: "land",
    crewed: true,
    science: { Moon: 45, Mars: 75, Venus: 110 },
  },
  crewReturn: {
    label: "Crew home from",
    crewed: true,
    science: { Moon: 40, Mars: 60, Venus: 90 },
  },
};

for (const [threshold, science, once] of [
  [3000, 4, true],
  [5000, 6, true],
  [10000, 25],
  [50000, 40],
  [250000, 60],
  [1000000, 90],
  [10000000, 150],
]) {
  milestoneKinds["speed" + threshold] = {
    label: `Reach ${(threshold / 1000).toLocaleString("en-US")} km/s`,
    test: "speed",
    threshold,
    global: true,
    once: !!once,
    science: { Speed: science },
  };
}

function milestoneTiers(kind) {
  return milestoneKinds[kind].once ? { 1: 1 } : milestoneSteps;
}

function milestoneNext(count, kind) {
  return Object.keys(milestoneTiers(kind))
    .map(Number)
    .find((step) => step > count);
}

function milestoneEarned() {
  let total = 0;
  for (const key in career.milestones) {
    const [kind, body] = key.split(":");
    const base = milestoneKinds[kind]?.science[body] || 0;
    const tiers = milestoneTiers(kind);
    for (const step in tiers) {
      if (Number(step) <= career.milestones[key].count) {
        total += Math.round(base * tiers[step] * difficultyMult("science"));
      }
    }
  }
  return total;
}

function milestonePossible() {
  return Object.keys(milestoneKinds).reduce((sum, kind) => {
    const tierTotal = Object.values(milestoneTiers(kind)).reduce(
      (a, b) => a + b,
      0,
    );
    return (
      sum +
      Math.round(
        Object.values(milestoneKinds[kind].science).reduce((a, b) => a + b, 0) *
          tierTotal *
          difficultyMult("science"),
      )
    );
  }, 0);
}

function awardMilestone(kind, body, rocket) {
  const key = kind + ":" + body;
  rocket.achieved[key] = true;
  const entry = (career.milestones[key] ||= { count: 0 });
  entry.count++;
  const science = runFilter(
    "career:milestoneScience",
    Math.round(
      (milestoneTiers(kind)[entry.count] || 0) *
        milestoneKinds[kind].science[body] *
        difficultyMult("science"),
    ),
    { kind, body, rocket },
  );
  runHook("career:milestone", { kind, body, rocket, count: entry.count });
  career.science += science;
  saveCareer();
  launchToast(
    `${milestoneKinds[kind].label}${body === "Speed" ? "" : " " + body} #${entry.count}${science ? " +" + science : ""}`,
  );
}

function checkMilestones() {
  const rocket = flyingRocket();
  if (!rocket || !rocket.stack) {
    return;
  }
  rocket.achieved ||= {};
  const crewed = hasCrew(rocket);
  for (const kind in milestoneKinds) {
    const spec = milestoneKinds[kind];
    const where = spec.global ? "Speed" : rocket.parentBody;
    if (!spec.test || !(where in spec.science) || (spec.crewed && !crewed)) {
      continue;
    }
    if (
      !rocket.achieved[kind + ":" + where] &&
      milestoneTests[spec.test](rocket, spec)
    ) {
      awardMilestone(kind, where, rocket);
    }
  }
  if (!rocket.landed) {
    rocket.returnCounted = false;
  } else if (crewed && rocket.parentBody === "Earth" && !rocket.returnCounted) {
    rocket.returnCounted = true;
    for (const body in milestoneKinds.crewReturn.science) {
      if (
        ["crewFlyby", "crewOrbit", "crewLand"].some(
          (kind) => rocket.achieved[kind + ":" + body],
        )
      ) {
        awardMilestone("crewReturn", body, rocket);
      }
    }
  }
}
