function downrangeOf(rocket) {
  const earth = getBody("Earth");
  const angle = radians(c.launchPadRotation);
  const dx = rocket.pos.x - earth.pos.x;
  const dy = rocket.pos.y - earth.pos.y;
  const along =
    (Math.sin(angle) * dx - Math.cos(angle) * dy) / (Math.hypot(dx, dy) || 1);
  return Math.acos(constrain(along, -1, 1)) * earth.size;
}

function kilometres(metres) {
  return `${Math.round(metres / 1000).toLocaleString("en-US")} km`;
}

const missionTypes = {
  altitude: {
    once: true,
    pay: 1,
    bodies: { Earth: 0 },
    goal: (level) => 1000 * 1.6 ** level,
    measure: (rocket) => readOnlyReaders.Altitude(rocket),
    title: (m) => `Ascend to ${format("distance", m.goal)} above ${m.body}`,
  },
  speed: {
    once: true,
    pay: 1,
    bodies: { Earth: 1 },
    goal: (level) => Math.min(200 * 1.3 ** level, 10000),
    measure: (rocket) => readOnlyReaders.Speed(rocket),
    title: (m) => `Exceed ${format("speed", m.goal)} relative to ${m.body}`,
  },
  orbit: {
    pay: 6,
    bodies: { Earth: 3 },
    goal: () =>
      140000 *
      1.5 ** career.completed.filter((done) => done.type === "orbit").length,
    measure: (rocket) =>
      Number.isFinite(readOnlyReaders.Apoapsis(rocket))
        ? readOnlyReaders.Periapsis(rocket)
        : 0,
    title: (m) =>
      `Hold a ${kilometres(m.goal)} periapsis around ${m.body}, deliberately`,
  },
  reach: {
    pay: 8,
    bodies: {
      Moon: 6,
      Mars: 12,
      Venus: 12,
      Mercury: 14,
      Ceres: 16,
      Jupiter: 18,
      Saturn: 20,
      Uranus: 22,
      Neptune: 24,
    },
    goal: () => 1,
    measure: () => 1,
    title: (m) => `Enter the sphere of influence of ${m.body}`,
  },
  land: {
    pay: 12,
    bodies: { Moon: 8, Mars: 14, Venus: 16, Mercury: 18, Ceres: 20 },
    goal: () => 1,
    measure: (rocket) => (rocket.landed ? 1 : 0),
    title: (m) => `Land on ${m.body}, gently if possible`,
  },
};

Object.assign(missionTypes, {
  space: {
    once: true,
    pay: 2,
    bodies: { Earth: 2 },
    goal: () => 100000,
    measure: (rocket) => readOnlyReaders.Altitude(rocket),
    title: (m) => `Reach space, ${kilometres(m.goal)} above ${m.body}`,
  },
  apogee: {
    pay: 3,
    bodies: { Earth: 3 },
    goal: (level) => Math.min(200000 * 1.3 ** (level - 3), 300000000),
    measure: (rocket) => readOnlyReaders.Altitude(rocket),
    title: (m) => `Climb to ${kilometres(m.goal)} above ${m.body}`,
  },
  downrangeShort: {
    once: true,
    pay: 2,
    bodies: { Earth: 2 },
    goal: () => 200000,
    measure: downrangeOf,
    title: (m) => `Fly ${kilometres(m.goal)} downrange of the pad`,
  },
  downrangeLong: {
    once: true,
    pay: 4,
    bodies: { Earth: 3 },
    goal: () => 3000000,
    measure: downrangeOf,
    title: (m) => `Fly ${kilometres(m.goal)} downrange of the pad`,
  },
  downrangeFar: {
    once: true,
    pay: 5,
    bodies: { Earth: 3 },
    goal: () => 4500000,
    measure: downrangeOf,
    title: (m) => `Fly ${kilometres(m.goal)} downrange of the pad`,
  },
  crewSpace: {
    ...missionTypes.altitude,
    once: false,
    crewed: true,
    needs: ["orbit"],
    pay: 3,
    firstBonus: 8,
    bodies: { Earth: 0 },
    goal: () => 100000,
    title: (m) => `Fly a crew to ${format("distance", m.goal)} above ${m.body}`,
  },
  crewOrbit: {
    ...missionTypes.orbit,
    crewed: true,
    needs: ["crewSpace"],
    pay: 6,
    firstBonus: 8,
    bodies: { Earth: 0 },
    goal: () => 140000,
    title: (m) =>
      `Put a crew in orbit around ${m.body}, ${kilometres(m.goal)} periapsis`,
  },
  crewFlyby: {
    ...missionTypes.reach,
    crewed: true,
    needs: ["crewOrbit"],
    pay: 10,
    firstBonus: 8,
    bodies: { Moon: 0 },
    title: (m) => `Fly a crew through the sphere of influence of ${m.body}`,
  },
  crewLand: {
    ...missionTypes.land,
    crewed: true,
    needs: {
      Moon: ["crewFlyby", "land:Moon"],
      Mars: ["crewLand:Moon", "land:Mars"],
      Venus: ["crewLand:Mars", "land:Venus"],
    },
    pay: { Moon: 16, Mars: 28, Venus: 45 },
    firstBonus: 8,
    bodies: { Moon: 0, Mars: 0, Venus: 0 },
    title: (m) => `Land a crew on ${m.body}, and get them back`,
  },
  dip: {
    needs: {
      Jupiter: ["reach:Jupiter"],
      Saturn: ["reach:Saturn"],
      Uranus: ["reach:Uranus"],
      Neptune: ["reach:Neptune"],
    },
    pay: 10,
    bodies: { Jupiter: 19, Saturn: 21, Uranus: 23, Neptune: 25 },
    goal: () => 0.1,
    measure: (rocket) => {
      const body = getBody(rocket.parentBody);
      return densityAt(body, distanceTo(rocket, body) - body.size);
    },
    title: (m) => `Dip a probe into the atmosphere of ${m.body}`,
  },
});
