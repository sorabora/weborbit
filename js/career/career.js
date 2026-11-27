const featureNames = { sas: "Stability assist (SAS)", map: "Map view" };

function hasFeature(feature) {
  return runFilter("career:feature", hasFeatureBase(feature), { feature });
}

function hasFeatureBase(feature) {
  return (
    !careerMode ||
    career.techs.some((id) => (techTree[id].features || []).includes(feature))
  );
}

function partAvailable(part) {
  return runFilter("vab:partAvailable", partAvailableBase(part), { part });
}

function partAvailableBase(part) {
  if (!careerMode) {
    return true;
  }
  return career.techs.some((id) => techTree[id].parts.includes(part.name));
}

const careerBase = {
  engineSize: 100,
  nozzleLength: 100,
  tankSize: 640,
  nozzles: ["_BasisINozzle"],
  cycles: ["Gas Generator"],
  propellants: ["Kerolox"],
  boosters: ["_UKBooster"],
};

function unlocked(key, all) {
  if (!careerMode) {
    return all;
  }
  const given = career.techs
    .map((id) => techTree[id].unlock?.[key])
    .filter((value) => value !== undefined);
  return Array.isArray(all)
    ? [...new Set([...careerBase[key], ...given.flat()])]
    : Math.max(careerBase[key], ...given);
}

function maxIgnitions(partName) {
  const def = partAPI.list().find((p) => p.name === partName);
  const engine = def && (def.modules || {})["Engine Module"];
  if (!engine || engine["SRB Mode"] || !Number.isFinite(engine.Ignitions)) {
    return Infinity;
  }
  if (!careerMode) {
    return Infinity;
  }
  let bonus = 0;
  for (const id of career.techs) {
    const tech = techTree[id];
    if (tech && tech.ignitionBonus && tech.ignitionBonus[partName]) {
      bonus += tech.ignitionBonus[partName];
    }
  }
  return engine.Ignitions + bonus;
}

function lockedLook(inst, alpha) {
  return partAvailable(inst.part)
    ? { alpha }
    : { alpha: alpha * 0.4, recolor: "#777" };
}

function perBody(value, body) {
  return typeof value === "object" ? value[body] : value;
}

function missionDone(need) {
  return career.completed.some((done) =>
    need.includes(":")
      ? need === `${done.type}:${done.body ?? "Earth"}`
      : done.type === need,
  );
}

function missionUnlocked(type, body) {
  const needs = missionTypes[type].needs;
  return ((Array.isArray(needs) ? needs : needs?.[body]) || []).every(
    missionDone,
  );
}

function makeMission(type, body, level) {
  const mission = {
    type,
    body,
    goal: missionTypes[type].goal(level),
    crewed: !!missionTypes[type].crewed,
    funds: Math.round(
      2000000 * perBody(missionTypes[type].pay, body) * 1.15 ** level,
    ),
  };
  mission.title = missionTypes[type].title(mission);
  return mission;
}

// how many contracts are offered at once
const offerCount = 8;

function generateMissions(count) {
  return runFilter("career:offers", generateMissionsBase(count), { count });
}

function generateMissionsBase(count) {
  const level = new Set(
    career.completed.map((done) => `${done.type}:${done.body ?? "Earth"}`),
  ).size;
  const pool = [];
  for (const type in missionTypes) {
    for (const body in missionTypes[type].bodies) {
      const spent = missionTypes[type].once && missionDone(type + ":" + body);
      if (
        missionTypes[type].bodies[body] <= level &&
        missionUnlocked(type, body) &&
        !spent
      ) {
        pool.push({ type, body });
      }
    }
  }
  return shuffle(pool)
    .slice(0, count)
    .map((pick) => makeMission(pick.type, pick.body, level));
}

const crewParts = ["Capsule", "Big Capsule"];

function hasCrew(rocket) {
  return rocket.stack.parts.some((entry) =>
    crewParts.includes(entry.part.name),
  );
}

function checkMission() {
  const mission = career.active;
  if (!mission) {
    return;
  }
  // contracts accepted before a goal changed keep the old one in the save
  if (mission.type === "crewOrbit" && mission.goal !== missionTypes.crewOrbit.goal()) {
    mission.goal = missionTypes.crewOrbit.goal();
    mission.title = missionTypes.crewOrbit.title(mission);
    saveCareer();
  }
  if (
    mission.rocketId &&
    !rockets.some((rocket) => rocket.id === mission.rocketId)
  ) {
    mission.rocketId = null;
    saveCareer();
    launchToast("Vessel lost, mission reset");
    return;
  }
  const rocket = flyingRocket();
  if (!rocket || !rocket.stack || !(rocket.launchNo > (mission.since ?? 0))) {
    return;
  }
  if (mission.rocketId) {
    if (
      rocket.id === mission.rocketId &&
      (rocket.landed || inWater(rocket)) &&
      rocket.parentBody === "Earth"
    ) {
      completeMission(mission);
    }
  } else if (
    rocket.parentBody === mission.body &&
    missionTypes[mission.type].measure(rocket) >= mission.goal
  ) {
    if (!mission.crewed) {
      completeMission(mission);
    } else if (hasCrew(rocket)) {
      mission.rocketId = rocket.id;
      saveCareer();
      launchToast("Goal reached, come home");
    }
  }
}

function isRepeat(mission) {
  return career.completed.some(
    (done) =>
      done.type === mission.type && (done.body ?? "Earth") === mission.body,
  );
}

function fundsPay(mission) {
  return runFilter("career:missionFunds", fundsPayBase(mission), { mission });
}

function fundsPayBase(mission) {
  const bonus = missionTypes[mission.type].firstBonus || 1;
  const base = isRepeat(mission) ? mission.funds : mission.funds * bonus;
  return Math.round(base * difficultyMult("funds"));
}

function completeMission(mission) {
  balance += fundsPay(mission);
  career.completed.push({
    type: mission.type,
    body: mission.body,
    title: mission.title,
  });
  runHook("career:missionComplete", { mission });
  career.active = null;
  career.offers = generateMissions(offerCount);
  saveCareer();
  launchToast("Mission complete");
}

function failMission(mission) {
  const penalty = Math.round(fundsPay(mission) / 2);
  balance -= penalty;
  career.active = null;
  career.offers = generateMissions(offerCount);
  saveCareer();
  launchToast(`Crew lost, mission failed -${penalty.toLocaleString("en-US")}`);
}

function checkCrewLosses() {
  const mission = career.active;
  if (!mission || !mission.crewed) {
    return;
  }
  for (const rocket of rockets) {
    if (!rocket.destroyed || !rocket.stack) {
      continue;
    }
    const isMissionVessel = mission.rocketId
      ? rocket.id === mission.rocketId
      : rocket.id === target;
    if (isMissionVessel && hasCrew(rocket)) {
      failMission(mission);
      return;
    }
  }
}

function recoveryValue(rocket) {
  return runFilter("career:recovery", recoveryValueBase(rocket), { rocket });
}

function recoveryValueBase(rocket) {
  const partsWorth = rocket.stack.parts.reduce(
    (sum, entry) => sum + partCost(entry.part),
    0,
  );
  return Math.round(partsWorth * recoveryRate);
}

// splashed down: at sea level over water and nearly stopped. Water landings
// never set rocket.landed, so they need their own check
function inWater(rocket) {
  const body = getBody(rocket.parentBody);
  const dx = rocket.pos.x - body.pos.x;
  const dy = rocket.pos.y - body.pos.y;
  const vel = relativeVelocity(rocket, body);
  return (
    distanceTo(rocket, body) < body.size + rocketRadius(rocket) + 50 &&
    Math.hypot(vel.x, vel.y) < 20 &&
    isWater(body, dx, dy)
  );
}

function canRecover(rocket) {
  return (
    !!rocket &&
    !!rocket.stack &&
    !!rocket.flown &&
    (!!rocket.landed || inWater(rocket)) &&
    rocket.parentBody === "Earth"
  );
}

function recoverRocket() {
  const rocket = flyingRocket();
  if (!canRecover(rocket)) {
    return;
  }
  // recovering the mission vessel counts as bringing it home
  if (career.active?.rocketId === rocket.id) {
    completeMission(career.active);
  }
  const unit = u.careerMode.modules["Career Module"].Unit;
  const value = recoveryValue(rocket);
  balance += value;
  runHook("rocket:recovered", { rocket, value });
  rockets = rockets.filter((other) => other !== rocket);
  inVab = true;
  saveCareer();
  launchToast(`Recovered ${unit}${value.toLocaleString("en-US")}`);
}

function updateCareer() {
  for (const rocket of rockets) {
    if (!rocket.landed) {
      rocket.flown = true;
    }
  }
  checkMission();
  checkMilestones();
  settleLoans();
  checkBankruptcy();
}

function techOpen(tech) {
  const owns = (id) => career.techs.includes(id);
  return tech.needs.every(owns) && (!tech.oneOf || tech.oneOf.some(owns));
}

function techParents(id) {
  return [...techTree[id].needs, ...(techTree[id].oneOf || [])];
}

function researchTech(id) {
  const tech = techTree[id];
  const open = techOpen(tech);
  if (career.techs.includes(id) || !open) {
    return;
  }
  if (tech.features && !inVab) {
    launchToast("You can't accept flight features during flight.");
    return;
  }
  if (career.science < tech.cost) {
    launchToast("Not enough science.");
    return;
  }
  career.science -= tech.cost;
  career.techs.push(id);
  saveCareer();
}

function saveCareer() {
  try {
    localStorage.setItem(
      "weborbit-career",
      JSON.stringify({ ...career, balance, careerMode }),
    );
  } catch (err) {
    console.warn(`couldn't save career: ${err.message}`);
  }
}

function cleanCareer() {
  const renamed = {
    biggerSolids: ["largeSolids"],
    biggerBoosters: ["bigEngines", "bigTanks", "heavyLift"],
  };
  career.techs = [
    ...new Set(
      career.techs
        .flatMap((id) => renamed[id] || [id])
        .filter((id) => techTree[id]),
    ),
  ];
  if (!career.techs.includes("basicRocketry")) {
    career.techs.push("basicRocketry");
  }
  career.milestones ||= {};
  career.launches ||= 0;
  career.difficulty ||= "Normal";
  career.loans = { ...defaultLoans(), ...career.loans };
  career.offers = career.offers.filter(
    (offer) =>
      !(
        missionTypes[offer.type]?.once &&
        missionDone(offer.type + ":" + offer.body)
      ),
  );
  if (!career.offers.length) {
    career.offers = generateMissions(offerCount);
  }
}

function careerHasProgress() {
  return (
    career.completed.length > 0 ||
    career.science > 0 ||
    career.techs.length > 1 ||
    Object.keys(career.milestones).length > 0
  );
}

function restoreCareer(saved) {
  for (const key in career) {
    delete career[key];
  }
  Object.assign(
    career,
    {
      completed: [],
      techs: ["basicRocketry"],
      science: 0,
      offers: [],
      active: null,
      milestones: {},
      launches: 0,
      loans: {},
      difficulty: "Normal",
    },
    saved,
  );
  cleanCareer();
  saveCareer();
}

function loadCareer() {
  try {
    const {
      balance: savedBalance,
      careerMode: savedCareerMode,
      ...saved
    } = JSON.parse(localStorage.getItem("weborbit-career")) || {};
    Object.assign(career, saved);
    cleanCareer();
    if (savedBalance !== undefined) {
      balance = savedBalance;
    }
    if (savedCareerMode !== undefined) {
      careerMode = savedCareerMode;
    }
  } catch (err) {
    console.warn(`couldn't load career: ${err.message}`);
  }
  if (!career.offers.length) {
    career.offers = generateMissions(offerCount);
  }
}
