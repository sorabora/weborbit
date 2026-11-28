const hooks = {};
const modModules = {};
const modCommands = {};

// after piecing together my one year of p5.js and two years of javascript
// i've made this creation...

const gameVersion = "2.0.1";
const modVersionSystemSince = "2.0.1";

// hit counter because why not
try {
  fetch("https://d28koubjcvxuwo.cloudfront.net/api/ping", {
    method: "POST",
    mode: "no-cors",
    body: gameVersion,
  }).catch(() => {});
} catch (e) {}

let astronautNames = [
  "Chad", "Carl", "Bob",
  "Sarah", "Emily", "Jessica",
  "William", "Benjamin", "Samuel",
  "Olivia", "Hannah", "Rachel",
  "Matthew", "Nathan", "Andrew",
  "Laura", "Natalie", "Megan",
  "Christopher", "Joshua", "Ethan",
  "Amanda", "Katherine", "Rebecca"
];
// half of these are unreachable because we don't remember astronauts from different capsules.

let scale = 16;
let vabTheme = "#2b2b2b";
let bootloaderOn = true;
let critError = false;
let crashRes = "";
let mapScale = 5e-5;
let mapPan = { x: 0, y: 0 };
let transferTarget = null;
let rendezvousTarget = null;
let mapClick = null;
let throttle = 0;
let target = "untitled-1";
let inVab = skipPlayScreen;
let inMap = false;
let careerMode = false;
let inMainMenu = !skipPlayScreen;
let exampleRocketsOpen = false;
let stagingOpen = false;
let gameFont;
let eProgress = 0;
let rawTextSize;
let astroMenuOpen = false;
let vabFlagOpen = false;
let playerCountry = "us";
let drawFlagCountry = null;
let inCreditsMenu = false;
let inWorldCreation = false;
const qualityOptions = ["Sandbox", "Career"];
let qualityIndex = 1;
const difficultyOptions = ["Easy", "Normal", "Hard", "Expert", "Super Expert"];
const difficultyColors = [
  "#2a6e2a",
  "#6e6e1a",
  "#8a4a1a",
  "#8a2a2a",
  "#5a0a0a",
];
const difficultyMultipliers = {
  Easy: { science: 1.5, funds: 1.5, startFunds: 1.5 },
  Normal: { science: 1, funds: 1, startFunds: 1 },
  Hard: { science: 0.85, funds: 0.75, startFunds: 0.75 },
  Expert: { science: 0.65, funds: 0.5, startFunds: 0.5 },
  "Super Expert": { science: 0.5, funds: 0.35, startFunds: 0.4 },
};
let difficultyIndex = 1;

function difficultyMult(stat) {
  return runFilter("career:difficulty", difficultyMultBase(stat), { stat });
}

function difficultyMultBase(stat) {
  const settings =
    difficultyMultipliers[career.difficulty] || difficultyMultipliers.Normal;
  return settings[stat];
}
let inModLoaderMenu = false;
let jsModPickerOpen = false;
let inFeaturedModsMenu = false;
let inKeyBindsMenu = false;
let careerMissionsOpen = false;
let milestonesOpen = false;
let techTreeOpen = false;
let loansOpen = false;
let bankrupt = false;
const rng = Math.floor(Math.random() * 100) + 1;
const controls = {
  invertVabZoom: false,
  invertFlightZoom: false,
};
let timeWarpSteps = [
  0.25, 0.5, 1, 2, 3, 5, 25, 100, 500, 2500, 10000, 50000, 250000, 1000000,
  5000000, 25000000, 100000000, 500000000,
];
let timeWarpCounter = 2;
let warpUntil = null;
let burnLogging = false;
let burnLog = [];
let lastAutomatedBurnT = -Infinity;
let rocketTimeline = [];
let timelineLastSample = -Infinity;
let timelineLastThrottle = null;
let timelineLastTurn = null;
let toasts = [];
let t = 0;
let elapsed = 0;
let tt = 0;
let physicsHooks = [];
let cd = {};
let featuredMods = null;

const supabaseClient = window.supabase.createClient(
  "https://sahuwtqsqbtplyhueokv.supabase.co",
  "sb_publishable_6dhE2eLPTmmR2K4TJIf7Pg_vxjN6eg7",
);
let consoleOpen = false;
let showHidden = false;
let balance = 0;
let devConsole = {
  focused: true,
  input: "",
  lines: [],
  history: [],
  historyIndex: -1,
};

let skillIssue = null;

let threadQueues = [];

let camera = { parentBody: "Earth", off: { x: 0, y: 0 }, pos: { x: 0, y: 0 } };

let c = {
  timewarp: 1,
  zoomPower: 0.05,
  hazeColor: "#7db4e8",
  hazeMax: 0.7,
  hazeFarSize: 0.7,
  hazeNearSize: 20,
  cloudScale: 0.995,
  cloudMax: 0.45,
  cloudPeriod: 86400,
  glowMax: 1,
  glowSteps: 48,
  skySteps: 24,
  blurMax: 24,
  blurMinSize: 6,
  blurTileMax: 2048,
  blurCacheMax: 48,
  maxStep: 10,
  maxSubsteps: 100,
  kgPerTon: 1000,
  partUnits: 320,
  newtonsPerThrust: 1000,
  turnPower: 1.5,
  landedTipDamping: 0.6,
  sasStiffness: 6,
  sasDamping: 3,
  throttleStep: 2,
  crashSpeed: 55,
  waterCrashSpeed: 90,
  turnProfile: [
    [0, 90],
    [0.02, 85],
    [0.05, 80],
    [0.1, 70],
    [0.2, 60],
    [0.35, 45],
    [0.55, 30],
    [0.75, 15],
    [1, 0],
  ],
  turnCeiling: 100000,
  guideLength: 80,
  vabZoomMin: 0.03,
  vabZoomMax: 0.6,
  mapZoomMin: 1e-12,
  mapZoomMax: 0.1,
  chuteDrag: 2000,
  waterDensity: 1000,
  waterFloatMass: 12000,
  waterSinkDepth: 500,
  reentryHeatFactor: 0.02,
  reentryCoolRate: 0.2,
  reentryMinSpeed: 500,
  partMaxTemp: 1600,
  ablatorHeat: 1.5e7,
  aeroStabilityFactor: 8e-3,
  aeroStabilityDamping: 4e-3,
  aeroStabilityMaxAccel: 5,
  attitudeMicroStep: 0.1,
  attitudeMaxMicro: 20,
  timelineSampleInterval: 1,
  timelineAtmosphereSampleInterval: 0.1,
  conduction: 0.04,
  chuteWidthPower: 0.5,
  chuteHeightPower: 0.1,
  launchPadRotation: 300,
  dockRange: 50,
  dockConnect: 4,
};
