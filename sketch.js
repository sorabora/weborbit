// after piecing together my one year of p5.js and two years of javascript
// i've made this creation...

const gameVersion = "1.6.1";
const modVersionSystemSince = "1.6.1";

let scale = 16;
let bootloaderOn = true;
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
let bootFont;
let eProgress = 0;
let rawTextSize;
let inCreditsMenu = false;
let inWorldCreation = false;
const qualityOptions = ["Sandbox", "Career"];
let qualityIndex = 1;
const difficultyOptions = ["Easy", "Normal", "Hard", "Expert", "Super Expert"];
const difficultyColors = ["#2a6e2a", "#6e6e1a", "#8a4a1a", "#8a2a2a", "#5a0a0a"];
const difficultyMultipliers = {
  Easy: { science: 1.5, funds: 1.5, startFunds: 1.5 },
  Normal: { science: 1, funds: 1, startFunds: 1 },
  Hard: { science: 0.85, funds: 0.75, startFunds: 0.75 },
  Expert: { science: 0.65, funds: 0.5, startFunds: 0.5 },
  "Super Expert": { science: 0.5, funds: 0.35, startFunds: 0.4 }
};
let difficultyIndex = 1;

function difficultyMult(stat) {
  const settings = difficultyMultipliers[career.difficulty] || difficultyMultipliers.Normal;
  return settings[stat];
}
let inModLoaderMenu = false;
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
  invertFlightZoom: false 
};
let timeWarpSteps = [0.25, 0.5, 1, 2, 3, 5, 25, 100, 500, 2500, 10000, 50000, 250000, 1000000, 5000000, 25000000, 100000000, 500000000]
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
  'https://sahuwtqsqbtplyhueokv.supabase.co',
  'sb_publishable_6dhE2eLPTmmR2K4TJIf7Pg_vxjN6eg7'
);
let consoleOpen = false;
let showHidden = false;
let balance = 0;
let devConsole = {
  focused: true,
  input: "",
  lines: [],
  history: [],
  historyIndex: -1
};

let skillIssue = null;

let threadQueues = [
  
]

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
  turnProfile: [[0, 90], [0.02, 85], [0.05, 80], [0.1, 70], [0.2, 60], [0.35, 45], [0.55, 30], [0.75, 15], [1, 0]],
  turnCeiling: 100000,
  guideLength: 80,
  vabZoomMin: 0.03,
  vabZoomMax: 0.6,
  mapZoomMin: 1e-12,
  mapZoomMax: 0.1,
  chuteDrag: 2000,
  waterDensity: 1000,
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
  dockConnect: 4
}

const loaded = [{"format":"xopernicus-partpack","version":1,"parts":[{"name":"_vab","size":[12000,12000],"mass":0,"groups":[{"fill":"#f56565","texture":"VAB.png","untinted":true,"points":[[-6000,-6000],[6000,-6000],[6000,6000],[-6000,6000]]}],"modules":{}},{"name":"_launchtower","size":[14000,12000],"mass":0,"groups":[{"fill":"#63b3ed","texture":"Launchtower.webp","untinted":true,"points":[[-7000,-6000],[7000,-6000],[7000,6000],[-7000,6000]]}],"modules":{}},{"name":"_launchpad","size":[14000,12000],"mass":0,"groups":[{"fill":"#63b3ed","texture":"Launchpad.webp","untinted":true,"points":[[-7000,-6000],[7000,-6000],[7000,6000],[-7000,6000]]}],"modules":{}},{"name":"_monolith","size":[84000,144000],"mass":1,"groups":[{"fill":"#787878","texture":"LightPlate.avif","points":[[-42000,72000],[42000,72000],[42000,-36000],[18000,-72000],[-18000,-72000],[-42000,-36000]]}],"modules":{}},{"name":"_flame","size":[1448.54,1603.36],"mass":0,"groups":[{"fill":"#ff8614","gradient":{"to":"#000000","angle":90,"toOpacity":0},"points":[[-315.73,-801.68],[-635.73,478.32],[644.27,478.32],[324.27,-801.68]]},{"fill":"#ffa629","gradient":{"to":"#000000","angle":90,"toOpacity":0.2,"fromOpacity":0.2},"points":[[-475.73,-161.68],[484.27,-161.68],[724.27,798.32],[-724.27,801.68]]},{"fill":"#ffeb0a","gradient":{"to":"#000000","angle":90,"toOpacity":0},"opacity":0.4,"points":[[-155.73,-401.68],[164.27,-401.68],[484.27,478.32],[-475.73,478.32]]}],"modules":{"Animate Module":{"To Animate":[{"Whole Prefab":true,"Group":0,"Property":"Height","To":0.7,"Seconds":0.4,"Easing":"Ease In Out"},{"Whole Prefab":true,"Group":0,"Property":"Height","To":1,"Seconds":0.4,"Easing":"Ease In Out"}],"Loop":true,"Trigger":["Part Enabled","Throttle Above 0"],"Stop if condition false":true,"Start Animation":[{"Whole Prefab":true,"Group":0,"Property":"Height","Value":0}],"End Animation":[{"Whole Prefab":true,"Group":0,"Property":"Height","To":0,"Seconds":0.6,"Easing":"Linear"}]},"Blur Module":{"Blur":5}}},{"name":"_parachute","size":[3520,2480],"mass":0,"groups":[{"fill":"#ff8614","points":[[-240,-1240],[-1760,-360],[1760,-360],[400,-1240]]},{"fill":"#f56565","cutout":true,"points":[[1440,-360],[-1440,-360],[80,-920]]},{"fill":"#ffffff","points":[[60,-360],[100,-360],[100,1240],[60,1240]]}],"modules":{}},{"name":"Capsule","size":[640,640],"mass":4,"groups":[{"fill":"#bababa","texture":"MetalPlate.avif","points":[[-120,-320],[-320,320],[320,320],[120,-320]]}],"modules":{"Controller Module":{"Torque":5,"Provides Control":true},"Aero Module":{"Stability":3}}},{"name":"Big Capsule","size":[1280,960],"mass":7,"groups":[{"fill":"#8b9199","texture":"MetalPlate.avif","points":[[-110,-480],[110,-480],[110,-400],[-110,-400]]},{"fill":"#d9dce0","texture":"MetalPlate.avif","points":[[-150,-400],[150,-400],[622,380],[-622,380]]},{"fill":"#c9a227","texture":"MetalPlate.avif","points":[[-640,380],[640,380],[640,430],[-640,430]]},{"fill":"#6b7079","texture":"DarkPlate.avif","points":[[-640,430],[640,430],[640,480],[-640,480]]},{"fill":"#1d2b3c","points":[[-200,-190],[-120,-190],[-105,-120],[-215,-120]]},{"fill":"#1d2b3c","points":[[120,-190],[200,-190],[215,-120],[105,-120]]},{"fill":"#8b9199","texture":"MetalPlate.avif","points":[[-60,-80],[60,-80],[60,60],[-60,60]]},{"fill":"#c4c9cf","texture":"MetalPlate.avif","points":[[-45,-65],[45,-65],[45,45],[-45,45]]},{"fill":"#2f343b","points":[[-440,120],[-360,120],[-360,210],[-440,210]]},{"fill":"#2f343b","points":[[360,120],[440,120],[440,210],[360,210]]}],"modules":{"Controller Module":{"Torque":15,"Provides Control":true},"Aero Module":{"Stability":5}}},{"name":"Spider Pod","size":[160,280],"mass":0.04,"groups":[{"fill":"#4a5f73","texture":"MetalPlate.avif","points":[[-80,-120],[-80,120],[80,120],[80,-120],[40,-140],[-40,-140]]},{"fill":"#4a5f73","texture":"MetalPlate.avif","points":[[-80,120],[80,120],[40,140],[-40,140]]}],"modules":{"Controller Module":{"Torque":0,"Provides Control":true}}},{"name":"Nano Reactionwheel","size":[240,80],"mass":0.02,"groups":[{"fill":"#828282","texture":"MetalPlate.avif","points":[[-120,40],[120,40],[120,-40],[-120,-40]]}],"modules":{"Controller Module":{"Torque":5,"Provides Control":false}}},{"name":"Turbo Reactionwheel","size":[640,80],"mass":0.06,"groups":[{"fill":"#666666","texture":"MetalPlate.avif","points":[[-320,-40],[-320,40],[320,40],[320,-40]]}],"modules":{"Controller Module":{"Torque":15,"Provides Control":false}}},{"name":"Large Turbo Reactionwheel","size":[1280,80],"mass":0.2,"groups":[{"fill":"#666666","texture":"MetalPlate.avif","points":[[-640,-40],[-640,40],[640,40],[640,-40]]}],"modules":{"Controller Module":{"Torque":30,"Provides Control":false}}},{"name":"Extra Large Turbo Reactionwheel","size":[2560,80],"mass":0.4,"groups":[{"fill":"#666666","texture":"MetalPlate.avif","points":[[-1280,-40],[-1280,40],[1280,40],[1280,-40]]}],"modules":{"Controller Module":{"Torque":60,"Provides Control":false}}},{"name":"Mars Chute","size":[89.18,193.12],"mass":0.3,"groups":[{"fill":"#51b2db","points":[[-12.17,96.56],[44.59,-96.56],[-15.34,-71.4],[-44.59,17.99]]}],"modules":{"Parachute Module":{"Minimum Deploy Pressure":0.25,"Drag":50,"Max Deploy Speed":2500},"Connection Disabler Module":{"Connections to Disable":["Left","Right","Top","Bottom"]}}},{"name":"Drogue Chute","size":[89.18,193.12],"mass":0.1,"groups":[{"fill":"#dbc451","points":[[-12.17,96.56],[44.59,-96.56],[-15.34,-71.4],[-44.59,17.99]]}],"modules":{"Parachute Module":{"Minimum Deploy Pressure":2.5,"Drag":50,"Max Deploy Speed":200},"Connection Disabler Module":{"Connections to Disable":["Left","Right","Top","Bottom"]}}},{"name":"Parachute","size":[240,100],"mass":0.5,"groups":[{"fill":"#cccccc","points":[[-40,-50],[-120,50],[120,50],[40,-50]]}],"modules":{"Parachute Module":{"Minimum Deploy Pressure":5,"Drag":2000,"Max Deploy Speed":70},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Tiny Heat Shield","size":[320,20],"mass":0.069,"groups":[{"fill":"#949494","texture":"MetalPlate.avif","points":[[-160,-10],[160,-10],[160,-7.5],[-160,-7.5]]},{"fill":"#5b4636","texture":"DarkPlate.avif","points":[[-160,-7.5],[160,-7.5],[160,-1.5],[120,3.53],[80,7.13],[40,9.28],[0,10],[-40,9.28],[-80,7.13],[-120,3.53],[-160,-1.5]]}],"modules":{"Heat Shield Module":{"Ablator":0.045,"Ablation Temperature":1000},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Heat Shield","size":[640,40],"mass":0.276,"groups":[{"fill":"#949494","texture":"MetalPlate.avif","points":[[-320,-20],[320,-20],[320,-15.25],[-320,-15.25]]},{"fill":"#5b4636","texture":"DarkPlate.avif","points":[[-320,-15.25],[320,-15.25],[320,-3.25],[240,6.92],[160,14.19],[80,18.55],[0,20],[-80,18.55],[-160,14.19],[-240,6.92],[-320,-3.25]]}],"modules":{"Heat Shield Module":{"Ablator":0.179,"Ablation Temperature":1000},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Big Heat Shield","size":[1280,80],"mass":1.106,"groups":[{"fill":"#949494","texture":"MetalPlate.avif","points":[[-640,-40],[640,-40],[640,-30.5],[-640,-30.5]]},{"fill":"#5b4636","texture":"DarkPlate.avif","points":[[-640,-30.5],[640,-30.5],[640,-6.5],[480,13.85],[320,28.38],[160,37.1],[0,40],[-160,37.1],[-320,28.38],[-480,13.85],[-640,-6.5]]}],"modules":{"Heat Shield Module":{"Ablator":0.717,"Ablation Temperature":1000},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Massive Heat Shield","size":[2560,160],"mass":4.423,"groups":[{"fill":"#949494","texture":"MetalPlate.avif","points":[[-1280,-80],[1280,-80],[1280,-60.75],[-1280,-60.75]]},{"fill":"#5b4636","texture":"DarkPlate.avif","points":[[-1280,-60.75],[1280,-60.75],[1280,-12.75],[960,27.83],[640,56.81],[320,74.2],[0,80],[-320,74.2],[-640,56.81],[-960,27.83],[-1280,-12.75]]}],"modules":{"Heat Shield Module":{"Ablator":2.865,"Ablation Temperature":1000},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Basic Engine","size":[640,560],"mass":0.9,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-320,-280],[-320,-200],[320,-200],[320,-280]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-160,-200],[160,-200],[320,280],[-320,280]]}],"modules":{"Engine Module":{"Thrust":1050,"ISP":320,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":1,"SRB Mode":false,"Ignitions":1}}},{"name":"Upgraded Basic Engine","size":[660,560],"mass":1.1,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-310,-280],[-310,-200],[330,-200],[330,-280]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-150,-200],[170,-200],[330,280],[-310,280]]},{"fill":"#ffffff","texture":"LightPlate.avif","points":[[-210,-200],[-190,-200],[-310,160],[-330,160]]},{"fill":"#fff3a8","texture":"MetalPlate.avif","points":[[-310,160],[-310,140],[290,140],[290,160]]}],"modules":{"Engine Module":{"Thrust":1450,"ISP":305,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":1,"Ignitions":2}}},{"name":"Bravo Engine","size":[960,720],"mass":2,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-480,-360],[-480,-280],[480,-280],[480,-360]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-160,-280],[160,-280],[480,360],[-480,360]]},{"fill":"#6b6b6b","texture":"LightPlate.avif","points":[[320,-280],[480,-280],[160,80],[160,-40]]},{"fill":"#6b6b6b","texture":"LightPlate.avif","points":[[160,-40],[-280,-40],[-340,80],[160,80]]}],"modules":{"Engine Module":{"Thrust":2500,"ISP":310,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":1.5,"SRB Mode":false,"Ignitions":1}}},{"name":"Alpha Engine","size":[1280,960],"mass":4,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-640,-480],[-640,-320],[640,-320],[640,-480]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-240,-320],[240,-320],[640,480],[-640,480]]}],"modules":{"Engine Module":{"Thrust":5150,"ISP":305,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":2,"Ignitions":1}}},{"name":"Falcon-1 Engine","size":[1280,960],"mass":4,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-640,-480],[-640,-320],[640,-320],[640,-480]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-240,-320],[240,-320],[640,480],[-640,480]]},{"fill":"#525252","points":[[-540,-320],[-480,-320],[-480,-160],[-400,100],[-440,140],[-540,-160]]},{"fill":"#858585","texture":"MetalPlate.avif","points":[[-400,100],[-440,140],[471.14,141.16],[451.63,99.67]]}],"modules":{"Engine Module":{"Thrust":6770,"ISP":264,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":2,"Ignitions":1}}},{"name":"Vacuum Engine","size":[480,560],"mass":0.6,"groups":[{"fill":"#dfcfb3","texture":"MetalPlate.avif","points":[[-240,-280],[-160,-200],[160,-200],[240,-280]]},{"fill":"#c4c4c4","texture":"LightPlate.avif","points":[[-80,-200],[80,-200],[240,280],[-240,280]]}],"modules":{"Engine Module":{"Thrust":235,"ISP":420,"Fuel Flow":"Positive","Resource":"Hydrolox","Flame Scale":1,"Ignitions":1}}},{"name":"Stoat Engine","size":[480,320],"mass":0.75,"groups":[{"fill":"#dfcfb3","texture":"MetalPlate.avif","points":[[-240,-160],[-160,-80],[160,-80],[240,-160]]},{"fill":"#c4c4c4","texture":"LightPlate.avif","points":[[-80,-80],[80,-80],[240,160],[-240,160]]}],"modules":{"Engine Module":{"Thrust":250,"ISP":330,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":1,"Ignitions":1}}},{"name":"Pup engine","size":[160,220],"mass":0.03,"groups":[{"fill":"#dfcfb3","texture":"MetalPlate.avif","points":[[-80,-110],[-20,-30],[20,-30],[80,-110]]},{"fill":"#c4c4c4","texture":"LightPlate.avif","points":[[-20,-30],[20,-30],[80,110],[-80,110]]}],"modules":{"Engine Module":{"Thrust":20,"ISP":315,"Fuel Flow":"Positive","Resource":"Kerolox","Flame Scale":0.25,"Ignitions":4}}},{"name":"Upgraded Vacuum Engine","size":[580,560],"mass":0.8,"groups":[{"fill":"#5e5e5e","texture":"MetalPlate.avif","points":[[-290,-280],[-170,-200],[150,-200],[290,-280]]},{"fill":"#5cb8ff","texture":"MetalPlate.avif","points":[[-90,-200],[70,-200],[230,280],[-250,280]]}],"modules":{"Engine Module":{"Thrust":300,"ISP":450,"Fuel Flow":"Positive","Resource":"Hydrolox","Flame Scale":1,"Ignitions":10}}},{"name":"Heavy Vacuum Engine","size":[880,936.64],"mass":1.6,"groups":[{"fill":"#454545","texture":"MetalPlate.avif","points":[[-440,-468.32],[-255,-328.32],[225,-328.32],[440,-468.32]]},{"fill":"#5cffc9","texture":"MetalPlate.avif","points":[[-131.47,-331.68],[-157.57,-281.68],[-182.64,-231.68],[-206.66,-181.68],[-229.6,-131.68],[-251.41,-81.68],[-272.07,-31.68],[-291.53,18.32],[-309.72,68.32],[-326.6,118.32],[-342.09,168.32],[-356.1,218.32],[-368.52,268.32],[-379.2,318.32],[-387.92,368.32],[-394.32,418.32],[-397.47,468.32],[362.53,468.32],[359.38,418.32],[352.98,368.32],[344.26,318.32],[333.58,268.32],[321.16,218.32],[307.15,168.32],[291.66,118.32],[274.78,68.32],[256.59,18.32],[237.13,-31.68],[216.47,-81.68],[194.66,-131.68],[171.72,-181.68],[147.7,-231.68],[122.63,-281.68],[96.53,-331.68]]}],"modules":{"Engine Module":{"Thrust":880,"ISP":440,"Fuel Flow":"Positive","Resource":"Hydrolox","Flame Scale":1.5,"Ignitions":6}}},{"name":"Nuclear Thermal Engine","size":[640,900],"mass":4.5,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-320,-450],[320,-450],[320,-370],[-320,-370]]},{"fill":"#9db8a8","texture":"LightPlate.avif","points":[[-250,-370],[250,-370],[250,-140],[-250,-140]]},{"fill":"#f6e05e","points":[[-250,-301],[250,-301],[250,-255],[-250,-255]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-100,-140],[-141.38,-81],[-177.59,-22],[-208.75,37],[-234.99,96],[-256.47,155],[-273.36,214],[-285.85,273],[-294.2,332],[-298.74,391],[-300,450],[300,450],[298.74,391],[294.2,332],[285.85,273],[273.36,214],[256.47,155],[234.99,96],[208.75,37],[177.59,-22],[141.38,-81],[100,-140]]}],"modules":{"Engine Module":{"Thrust":350,"ISP":850,"Fuel Flow":"Positive","Resource":"Hydrolox","Flame Scale":1,"Ignitions":2}}},{"name":"Large Nuclear Thermal Engine","size":[1280,1100],"mass":12,"groups":[{"fill":"#949494","texture":"DarkPlate.avif","points":[[-640,-550],[640,-550],[640,-470],[-640,-470]]},{"fill":"#9db8a8","texture":"LightPlate.avif","points":[[-500,-470],[500,-470],[500,-170],[-500,-170]]},{"fill":"#f6e05e","points":[[-500,-380],[500,-380],[500,-320],[-500,-320]]},{"fill":"#c7c7c7","texture":"MetalPlate.avif","points":[[-190,-170],[-278.96,-98],[-356.81,-26],[-423.81,46],[-480.23,118],[-526.42,190],[-562.72,262],[-589.58,334],[-607.53,406],[-617.29,478],[-620,550],[620,550],[617.29,478],[607.53,406],[589.58,334],[562.72,262],[526.42,190],[480.23,118],[423.81,46],[356.81,-26],[278.96,-98],[190,-170]]}],"modules":{"Engine Module":{"Thrust":1400,"ISP":800,"Fuel Flow":"Positive","Resource":"Hydrolox","Flame Scale":2,"Ignitions":2}}},{"name":"Ion Engine","size":[160,100],"mass":0.03,"groups":[{"fill":"#383838","texture":"MetalPlate.avif","points":[[-80,-50],[-80,10],[80,10],[80,-50]]},{"fill":"#999999","texture":"LightPlate.avif","points":[[-60,10],[60,10],[60,50],[-60,50]]}],"modules":{"Engine Module":{"Thrust":0.0025,"ISP":3000,"Fuel Flow":"Positive","Resource":"Xenon","Flame Scale":0.1}}},{"name":"RCS Engine","size":[60,80],"mass":0.03,"groups":[{"fill":"#666","texture":"LightPlate.avif","points":[[0,10],[20,10],[30,40],[-10,40]]},{"fill":"#666","points":[[0,10],[0,-10],[-30,-20],[-30,20]]},{"fill":"#666","points":[[0,-10],[20.03,-10],[30,-40],[-10,-40]]},{"fill":"#e8e8e8","points":[[0,-10],[20,-10],[20,10],[0,10]]}],"modules":{"RCS Module":{"Thruster Directions":["Top","Bottom","Left","Right"],"Thrust":19,"ISP":220,"Resource":"Kerolox"}}},{"name":"Hydrolox Tank","size":[640,320],"mass":2.7,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-320,-160],[-320,160],[320,160],[320,-160]]}],"modules":{"Resource Module":{"Amount":2.5,"Resource":"Hydrolox"}}},{"name":"SM Hydrolox Tank","size":[640,640],"mass":5.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-320,-320],[-320,320],[320,320],[320,-320]]}],"modules":{"Resource Module":{"Amount":5,"Resource":"Hydrolox"}}},{"name":"MD Hydrolox Tank","size":[640,1280],"mass":10.67,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-320,-640],[-320,640],[320,640],[320,-640]]}],"modules":{"Resource Module":{"Amount":10,"Resource":"Hydrolox"}}},{"name":"LG Hydrolox Tank","size":[640,2560],"mass":21.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-320,-1280],[-320,1280],[320,1280],[320,-1280]]}],"modules":{"Resource Module":{"Amount":20,"Resource":"Hydrolox"}}},{"name":"XS Big Hydrolox Tank","size":[1280,640],"mass":10.67,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-640,-320],[-640,320],[640,320],[640,-320]]}],"modules":{"Resource Module":{"Amount":10,"Resource":"Hydrolox"}}},{"name":"SM Big Hydrolox Tank","size":[1280,1280],"mass":21.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-640,-640],[-640,640],[640,640],[640,-640]]}],"modules":{"Resource Module":{"Amount":20,"Resource":"Hydrolox"}}},{"name":"MD Big Hydrolox Tank","size":[1280,2560],"mass":42.67,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-640,-1280],[-640,1280],[640,1280],[640,-1280]]}],"modules":{"Resource Module":{"Amount":40,"Resource":"Hydrolox"}}},{"name":"LG Big Hydrolox Tank","size":[1280,5120],"mass":85.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-640,-2560],[-640,2560],[640,2560],[640,-2560]]}],"modules":{"Resource Module":{"Amount":80,"Resource":"Hydrolox"}}},{"name":"XS Massive Hydrolox Tank","size":[2560,1280],"mass":42.67,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-1280,-640],[1280,-640],[1280,640],[-1280,640]]}],"modules":{"Resource Module":{"Amount":40,"Resource":"Hydrolox"}}},{"name":"SM Massive Hydrolox Tank","size":[2560,2560],"mass":85.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-1280,-1280],[1280,-1280],[1280,1280],[-1280,1280]]}],"modules":{"Resource Module":{"Amount":80,"Resource":"Hydrolox"}}},{"name":"MD Massive Hydrolox Tank","size":[2560,5120],"mass":170.67,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-1280,-2560],[1280,-2560],[1280,2560],[-1280,2560]]}],"modules":{"Resource Module":{"Amount":160,"Resource":"Hydrolox"}}},{"name":"LG Massive Hydrolox Tank","size":[2560,10240],"mass":341.33,"groups":[{"fill":"#009dff","texture":"LightPlate.avif","points":[[-1280,-5120],[1280,-5120],[1280,5120],[-1280,5120]]}],"modules":{"Resource Module":{"Amount":320,"Resource":"Hydrolox"}}},{"name":"Xenon Tank","size":[320,160],"mass":2.4,"groups":[{"fill":"#2b2b31","texture":"LightPlate.avif","points":[[-160,-80],[-160,80],[160,80],[160,-80]]}],"modules":{"Resource Module":{"Amount":2.2,"Resource":"Xenon"}}},{"name":"Tiny XS Fuel Tank","size":[320,160],"mass":1.1875,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-160,-80],[-160,80],[160,80],[160,-80]]}],"modules":{"Resource Module":{"Amount":1,"Resource":"Kerolox"}}},{"name":"Tiny SM Fuel Tank","size":[320,320],"mass":2.375,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-160,-160],[-160,160],[160,160],[160,-160]]}],"modules":{"Resource Module":{"Amount":2,"Resource":"Kerolox"}}},{"name":"Tiny MD Fuel Tank","size":[320,640],"mass":4.75,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-160,-320],[-160,320],[160,320],[160,-320]]}],"modules":{"Resource Module":{"Amount":4,"Resource":"Kerolox"}}},{"name":"Tiny LG Fuel Tank","size":[320,1280],"mass":9.5,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-160,-640],[-160,640],[160,640],[160,-640]]}],"modules":{"Resource Module":{"Amount":8,"Resource":"Kerolox"}}},{"name":"XS Fuel Tank","size":[640,320],"mass":4.75,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-320,-160],[-320,160],[320,160],[320,-160]]}],"modules":{"Resource Module":{"Amount":4.5,"Resource":"Kerolox"}}},{"name":"SM Fuel Tank","size":[640,640],"mass":9.5,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-320,-320],[-320,320],[320,320],[320,-320]]}],"modules":{"Resource Module":{"Amount":9,"Resource":"Kerolox"}}},{"name":"MD Fuel Tank","size":[640,1280],"mass":19,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-320,-640],[-320,640],[320,640],[320,-640]]}],"modules":{"Resource Module":{"Amount":18,"Resource":"Kerolox"}}},{"name":"LG Fuel Tank","size":[640,2560],"mass":38,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-320,-1280],[-320,1280],[320,1280],[320,-1280]]}],"modules":{"Resource Module":{"Amount":36,"Resource":"Kerolox"}}},{"name":"XS Big Fuel Tank","size":[1280,640],"mass":19,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-640,-320],[-640,320],[640,320],[640,-320]]}],"modules":{"Resource Module":{"Amount":18,"Resource":"Kerolox"}}},{"name":"SM Big Fuel Tank","size":[1280,1280],"mass":38,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-640,-640],[-640,640],[640,640],[640,-640]]}],"modules":{"Resource Module":{"Amount":36,"Resource":"Kerolox"}}},{"name":"MD Big Fuel Tank","size":[1280,2560],"mass":76,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-640,-1280],[-640,1280],[640,1280],[640,-1280]]}],"modules":{"Resource Module":{"Amount":72,"Resource":"Kerolox"}}},{"name":"LG Big Fuel Tank","size":[1280,5120],"mass":152,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-640,-2560],[-640,2560],[640,2560],[640,-2560]]}],"modules":{"Resource Module":{"Amount":144,"Resource":"Kerolox"}}},{"name":"XS Massive Fuel Tank","size":[2560,1280],"mass":76,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-1280,-640],[-1280,640],[1280,640],[1280,-640]]}],"modules":{"Resource Module":{"Amount":72,"Resource":"Kerolox"}}},{"name":"SM Massive Fuel Tank","size":[2560,2560],"mass":152,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-1280,-1280],[-1280,1280],[1280,1280],[1280,-1280]]}],"modules":{"Resource Module":{"Amount":144,"Resource":"Kerolox"}}},{"name":"MD Massive Fuel Tank","size":[2560,5120],"mass":304,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-1280,-2560],[-1280,2560],[1280,2560],[1280,-2560]]}],"modules":{"Resource Module":{"Amount":288,"Resource":"Kerolox"}}},{"name":"LG Massive Fuel Tank","size":[2560,10240],"mass":608,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-1280,-5120],[-1280,5120],[1280,5120],[1280,-5120]]}],"modules":{"Resource Module":{"Amount":576,"Resource":"Kerolox"}}},{"name":"Large Base","size":[2080,640.5],"mass":10,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-640,-320.25],[-1040,320.25],[1040,320.25],[640,-320.25]]}],"modules":{"Resource Module":{"Amount":7.5,"Resource":"Kerolox"},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"Massive Base","size":[4160,1281],"mass":40,"groups":[{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-1280,-640.5],[-2080,640.5],[2080,640.5],[1280,-640.5]]}],"modules":{"Resource Module":{"Amount":30,"Resource":"Kerolox"},"Connection Disabler Module":{"Connections to Disable":["Left","Right"]}}},{"name":"UK8 Booster","size":[320,540],"mass":2.2,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-80,-10],[80,-10],[160,270],[-160,270]]},{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-120,-10],[160,-10],[160,-270],[-160,-270],[-160,-50]]},{"fill":"#68d391","cutout":true,"points":[[120,-10],[160,-50],[160,-10]]},{"fill":"#f6e05e","cutout":true,"points":[[-160,-230],[-120,-270],[-160,-270]]},{"fill":"#b794f4","cutout":true,"points":[[120,-270],[160,-230],[160,-270]]}],"modules":{"Engine Module":{"Thrust":60,"ISP":145,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":0.5,"SRB Mode":true},"Resource Module":{"Amount":1.8,"Resource":"Solid Fuel"}}},{"name":"UK16 Booster","size":[320,800],"mass":4.4,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-80,120],[80,120],[160,400],[-160,400]]},{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-120,120],[160,120],[160,-400],[-160,-400],[-160,80]]},{"fill":"#68d391","cutout":true,"points":[[120,120],[160,80],[160,120]]},{"fill":"#f6e05e","cutout":true,"points":[[-160,-360],[-120,-400],[-160,-400]]},{"fill":"#b794f4","cutout":true,"points":[[120,-400],[160,-360],[160,-400]]}],"modules":{"Engine Module":{"Thrust":120,"ISP":155,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":0.5,"SRB Mode":true},"Resource Module":{"Amount":3.6,"Resource":"Solid Fuel"}}},{"name":"UK32 Booster","size":[320,1320],"mass":8.8,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-80,380],[80,380],[160,660],[-160,660]]},{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-120,380],[160,380],[160,-660],[-160,-660],[-160,340]]},{"fill":"#68d391","cutout":true,"points":[[120,380],[160,340],[160,380]]},{"fill":"#f6e05e","cutout":true,"points":[[-160,-620],[-120,-660],[-160,-660]]},{"fill":"#b794f4","cutout":true,"points":[[120,-660],[160,-620],[160,-660]]}],"modules":{"Engine Module":{"Thrust":240,"ISP":165,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":0.5,"SRB Mode":true},"Resource Module":{"Amount":7.2,"Resource":"Solid Fuel"}}},{"name":"UR30 Booster","size":[640,1520],"mass":18,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-160,280],[160,280],[320,760],[-320,760]]},{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-320,280],[320,280],[320,-760],[-320,-760]]}],"modules":{"Engine Module":{"Thrust":720,"ISP":180,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":1,"SRB Mode":true},"Resource Module":{"Amount":15,"Resource":"Solid Fuel"}}},{"name":"UR60 Booster","size":[640,6200],"mass":144,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-160,2620],[160,2620],[320,3100],[-320,3100]]},{"fill":"#eef1f2","texture":"LightPlate.avif","points":[[-320,2660],[160,2660],[160,-3100],[-320,-3100]]},{"fill":"#525252","texture":"LightPlate.avif","points":[[160,-3100],[320,-3100],[320,2660],[160,2660]]}],"modules":{"Engine Module":{"Thrust":2650,"ISP":215,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":1,"SRB Mode":true},"Resource Module":{"Amount":125,"Resource":"Solid Fuel"}}},{"name":"UR120 Booster","size":[1440,11520],"mass":758,"groups":[{"fill":"#ffffff","texture":"DarkPlate.avif","points":[[-160,4720],[160,4720],[720,5760],[-720,5760]]},{"fill":"#d6d6d6","texture":"LightPlate.avif","points":[[-720,4800],[720,4800],[720,-5760],[-720,-5760]]},{"fill":"#c4c4c4","texture":"MetalPlate.avif","points":[[-720,4800],[720,4800],[400,4960],[-400,4960]]}],"modules":{"Engine Module":{"Thrust":14000,"ISP":220,"Fuel Flow":"Positive","Resource":"Solid Fuel","Flame Scale":3,"SRB Mode":true},"Resource Module":{"Amount":650,"Resource":"Solid Fuel"}}},{"name":"XL Decoupler","size":[2560,1280],"mass":0.4,"groups":[{"fill":"#949494","texture":"LightPlate.avif","points":[[-1280,-640],[-1280,640],[1280,640],[1280,-640]]}],"modules":{"Decoupler Module":{"Separation Force":120}}},{"name":"LG Decoupler","size":[1280,640],"mass":0.2,"groups":[{"fill":"#949494","texture":"LightPlate.avif","points":[[-640,-320],[-640,320],[640,320],[640,-320]]}],"modules":{"Decoupler Module":{"Separation Force":100}}},{"name":"MD Decoupler","size":[640,320],"mass":0.1,"groups":[{"fill":"#949494","texture":"LightPlate.avif","points":[[-320,-160],[-320,160],[320,160],[320,-160]]}],"modules":{"Decoupler Module":{"Separation Force":80}}},{"name":"SM Decoupler","size":[320,160],"mass":0.05,"groups":[{"fill":"#949494","texture":"LightPlate.avif","points":[[-160,-80],[-160,80],[160,80],[160,-80]]}],"modules":{"Decoupler Module":{"Separation Force":60}}},{"name":"Docking Port","size":[640,320],"mass":0.5,"groups":[{"fill":"#949494","texture":"LightPlate.avif","points":[[-320,-160],[-320,160],[320,160],[320,-160]]}],"modules":{"Docking Module":{"Attractive Force":2,"Disconnect Force":4}}},{"name":"Drill","size":[160,100],"mass":0.25,"groups":[{"fill":"#383838","texture":"MetalPlate.avif","points":[[-80,-50],[-80,10],[80,10],[80,-50]]},{"fill":"#999999","texture":"LightPlate.avif","points":[[-60,10],[60,10],[60,50],[-60,50]]}],"modules":{"Engine Module":{"Thrust":0.0025,"ISP":0.1,"Fuel Flow":"Negative","Resource":"Ore","Flame Scale":0},"Prototype Module":{}}},{"name":"Burner","size":[160,60],"mass":0.25,"groups":[{"fill":"#ff0000","texture":"MetalPlate.avif","points":[[-80,-30],[-80,30],[80,30],[80,-30]]}],"modules":{"Engine Module":{"Thrust":0.2,"ISP":0.00001,"Fuel Flow":"Positive","Resource":"Ore","Flame Scale":0},"Prototype Module":{}}},{"name":"Ore Tank","size":[160,100],"mass":4,"groups":[{"fill":"#383838","texture":"MetalPlate.avif","points":[[-80,-50],[-80,50],[80,50],[80,-50]]}],"modules":{"Prototype Module":{},"Resource Module":{"Amount":3.6,"Resource":"Ore"}}},{"name":"Fuel Pipe","size":[80,100],"mass":4,"groups":[{"fill":"#ff2600","texture":"MetalPlate.avif","points":[[-40,-50],[-40,50],[40,50],[40,-50]]}],"modules":{"Prototype Module":{},"Fuelpipe Module":{"Input Fuel":"Ore","Output Fuel":"Kerolox","Rate (Kg/Sec)":100}}}]}]
const defaultLoadedCount = loaded.length;
loaded[0].parts.push(
  { name: "SM Nose Cone", size: [320, 277.13], mass: 0.03,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-160, 138.56], [160, 138.56], [0, -138.56]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Left", "Right", "Top"] } } },
  { name: "MD Nose Cone", size: [640, 554.26], mass: 0.09,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-320, 277.13], [320, 277.13], [0, -277.13]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Left", "Right", "Top"] } } },
  { name: "LG Nose Cone", size: [1280, 1108.51], mass: 0.28,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-640, 554.26], [640, 554.26], [0, -554.26]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Left", "Right", "Top"] } } },
  { name: "XL Nose Cone", size: [2560, 2217.03], mass: 0.9,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-1280, 1108.51], [1280, 1108.51], [0, -1108.51]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Left", "Right", "Top"] } } },
  { name: "SM Angled Nose Cone", size: [320, 320], mass: 0.03,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-160, -160], [-160, 160], [160, 160]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Top", "Right"] } } },
  { name: "MD Angled Nose Cone", size: [640, 640], mass: 0.09,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-320, -320], [-320, 320], [320, 320]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Top", "Right"] } } },
  { name: "LG Angled Nose Cone", size: [1280, 1280], mass: 0.28,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-640, -640], [-640, 640], [640, 640]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Top", "Right"] } } },
  { name: "XL Angled Nose Cone", size: [2560, 2560], mass: 0.9,
    groups: [{ fill: "#d6d6d6", texture: "LightPlate.avif", points: [[-1280, -1280], [-1280, 1280], [1280, 1280]] }],
    modules: { "Connection Disabler Module": { "Connections to Disable": ["Top", "Right"] } } }
);
const u = {
  careerMode: {
    "format": "xopernicus-config",
    "version": 1,
    "modules": {
      "Career Module": {
        "Unit": "$",
        "Comma multi": 1000,
        "Base multi": 1000000,
        "Diminishing Return Factor": 0.65,
        "Per Planet": [],
        "Global": [],
        "": [],
        "Starting Cash": 5,
      }
    }
  }
}

const hooks = {};

function fatalError(message) {
  document.getElementById("defaultCanvas1").remove();
  document.getElementById("fatalError").removeAttribute("hidden");
  document.getElementById("errorDetails").textContent = `${message}`;
  if (eProgress == 1) {
    document.getElementById("errorPhase").textContent = `Boot Phase: assetsFinished`;    
  } else if (eProgress > 0) {
    document.getElementById("errorPhase").textContent = `Boot Phase: loadingAssets`;
  } else if (eProgress == 0) {
    document.getElementById("errorPhase").textContent = `Boot Phase: init`;
  }
}

window.onerror = function(message, source, lineno, colno, error) {
  return true;
};

window.addEventListener("unhandledrejection", function(event) {
  fatalError(event.reason.message || event.reason);
  //showFatalErrorScreen(event.reason.message || event.reason);
  event.preventDefault();
});

function addHook(name, fn, priority = 0) {
  (hooks[name] ??= []).push({ fn, priority });
  hooks[name].sort((a, b) => a.priority - b.priority);
  return fn;
}

function removeHook(name, fn) {
  if (!hooks[name]) return;
  hooks[name] = hooks[name].filter(h => h.fn !== fn);
}

function runHook(name, ctx) {
  for (const h of hooks[name] || []) {
    try {
      h.fn(ctx);
    } catch (err) {
      console.warn(`mod hook "${name}" threw:`, err);
    }
  }
}

function hiddenPart(name) {
  for (const pack of loaded) {
    const found = pack.parts.find(part => part.name === name);
    if (found) {
      return found;
    }
  }
  return null;
}

const partAPI = {
  list() {
    let parts = [];
    for (let pack of loaded) {
      for (let part of pack.parts) {
        if (!part.name.startsWith("_") && (showHidden || !part.modules["Prototype Module"])) {
          parts.push(part);
        }
      }
    }
    return parts;
  }
}

const GUIAPI = {
  pendingTooltip: null,
  buttons: [],
  blockers: [],
  scrolls: {},
  scrollAreas: [],
  autoBottom: {},
  order: 0,
  onButton: null,
  beginFrame() {
    this.order = 0;
    this.justPressed = mouseIsPressed && !this.wasPressed;
    this.wasPressed = mouseIsPressed;
    this.blockers = this.blockers.filter(b => b.frame >= frameCount - 1);
    this.buttons = this.buttons.filter(b => b.frame >= frameCount - 1);
    this.scrollAreas = this.scrollAreas.filter(a => a.frame >= frameCount - 1);
  },
  block(x, y, sx, sy, order) {
    this.blockers.push({ x, y, sx, sy, order, frame: frameCount });
  },
  covered(order, frame) {
    for (const b of this.blockers) {
      if (b.frame === frame && b.order > order && this.contains(b.x, b.y, b.sx, b.sy)) {
        return true;
      }
    }
    return false;
  },
  // true when the cursor is over any panel or button at all
  blocked() {
    return this.covered(-1, frameCount) || this.covered(-1, frameCount - 1);
  },
  contains(x, y, sx, sy) {
    return mouseX >= x && mouseX <= x + sx && mouseY >= y && mouseY <= y + sy;
  },
  // the one button the cursor is actually over: inside it, and nothing on top
  buttonAt() {
    let best = null;
    for (const b of this.buttons) {
      if (b.frame < frameCount - 1 || !this.contains(b.x, b.y, b.sx, b.sy)) {
        continue;
      }
      if (this.covered(b.order, b.frame)) {
        continue;
      }
      if (!best || b.frame > best.frame || (b.frame === best.frame && b.order > best.order)) {
        best = b;
      }
    }
    return best;
  },
  dispatch() {
    const hit = this.buttonAt();
    if (hit && this.onButton) {
      this.onButton({
        id: hit.id,
        label: hit.label,
        data: hit.data,
        x: hit.x,
        y: hit.y,
        sx: hit.sx,
        sy: hit.sy,
        order: hit.order,
        mouseX,
        mouseY
      });
    }
    return hit;
  },
  clicked(id) {
    const hit = this.buttonAt();
    return !!hit && hit.id === id;
  },
  panel(sx, sy, extras = {}, title, children) {
    const x = Math.round((width - sx) / 2 + (extras.offsetX || 0));
    const y = Math.round((height - sy) / 2 + (extras.offsetY || 0));
    const pad = extras.pad === undefined ? 12 : extras.pad;
    const titleHeight = title ? 28 : 0;
    const order = this.order++;

    push();
    noStroke();
    if (extras.dim) {
      fill(extras.dimColor || "#0009");
      rect(0, 0, width, height);
      this.block(0, 0, width, height, order);
    }
    this.block(x, y, sx, sy, order);

    fill(extras.baseColor || "#2a2a2aee");
    if (extras.borderColor) {
      stroke(extras.borderColor);
      strokeWeight(extras.borderWeight || 1);
    }
    rect(x, y, sx, sy, extras.radius === undefined ? 6 : extras.radius);

    if (title) {
      noStroke();
      fill(extras.titleColor || "#fff");
      textSize(extras.titleSize || 16);
      textAlign(CENTER, CENTER);
      text(title, x + sx / 2, y + pad + titleHeight / 2);
      if (extras.hint) {
        fill(extras.hintColor || "#999");
        textSize(12);
        textAlign(RIGHT, CENTER);
        text(extras.hint, x + sx - pad, y + pad + titleHeight / 2);
      }
    }
    pop();

    const footerHeight = extras.footer || 0;
    const content = {
      x: x + pad,
      y: y + pad + titleHeight,
      sx: sx - pad * 2,
      sy: sy - pad * 2 - titleHeight - footerHeight
    };
    const footer = { x: content.x, y: content.y + content.sy, sx: content.sx, sy: footerHeight };

    const id = extras.id || title || "panel";
    if (this.scrolls[id] === undefined) {
      this.scrolls[id] = 0;
    }
    const gap = extras.gap === undefined ? 6 : extras.gap;
    const lui = LUIAPI.begin(content, this.scrolls[id], gap);

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(content.x, content.y, content.sx, content.sy);
    drawingContext.clip();
    children(lui);
    drawingContext.restore();

    const maxScroll = Math.max(0, (lui.cursor.y + this.scrolls[id]) - content.y - content.sy);
    if (this.autoBottom[id]) {
      this.scrolls[id] = maxScroll;
      this.autoBottom[id] = false;
    } else {
      this.scrolls[id] = constrain(this.scrolls[id], 0, maxScroll);
    }
    this.scrollAreas.push({ id, x: content.x, y: content.y, sx: content.sx, sy: content.sy, max: maxScroll, order: this.order - 1, frame: frameCount });

    return { x, y, sx, sy, content, footer };
  },
  scroll(delta) {
    let best = null;
    for (const a of this.scrollAreas) {
      if (a.frame < frameCount - 1 || !this.contains(a.x, a.y, a.sx, a.sy)) {
        continue;
      }
      if (this.covered(a.order, a.frame)) {
        continue;
      }
      if (!best || a.order > best.order) {
        best = a;
      }
    }
    if (!best) {
      return false;
    }
    this.scrolls[best.id] = constrain(this.scrolls[best.id] + delta, 0, best.max);
    return true;
  },
button(x, y, sx, sy, extras = {}, label) {
  const order = this.order++;
  this.buttons.push({ id: extras.id || null, label: label === undefined ? null : label,
    data: extras.data === undefined ? null : extras.data, x, y, sx, sy, order, frame: frameCount });
  this.block(x, y, sx, sy, order);
  const hover = this.contains(x, y, sx, sy) && !this.covered(order, frameCount - 1);

  const base = extras.baseColor || "#777";
  let body = base.replace("#", "");
  if (body.length === 3) body = body.split("").map(ch => ch + ch).join("");
  const n = parseInt(body, 16) || 0x777777;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const shift = (amt) => `rgb(${constrain(r + 255 * amt, 0, 255)|0}, ${constrain(g + 255 * amt, 0, 255)|0}, ${constrain(b + 255 * amt, 0, 255)|0})`;

  let swatch = base;
  if (hover) {
    swatch = extras.hoverColor || shift(0.12);
    if (extras.onHover) extras.onHover();
    if (extras.tooltip) this.pendingTooltip = { lines: extras.tooltip, x: mouseX, y: mouseY };
  }
  if (hover && mouseIsPressed) {
    swatch = extras.activeColor || shift(-0.12);
  }

  const radius = extras.radius === undefined ? 8 : extras.radius;

  push();
  noStroke();
  fill(swatch);
  rect(x, y, sx, sy, radius);

  if (label) {
    noStroke();
    fill(extras.textColor || "#fff");
    textAlign(CENTER, CENTER);
    text(label, x + sx / 2, y + sy / 2);
  }
  pop();
},
dropdown(x, y, sx, sy, extras = {}, options, index) {
  const id = extras.id || null;
  const arrow = extras.arrowSize === undefined ? sy : extras.arrowSize;
  const count = options.length;

  this.button(x, y, sx, sy, { ...extras, id: id ? id + "-value" : null }, null);

  push();
  noStroke();
  fill(extras.textColor || "#fff");
  textAlign(CENTER, CENTER);
  text(options[index], x + sx / 2, y + sy / 2);
  pop();

  const arrowExtras = {
    baseColor: extras.arrowColor || extras.baseColor,
    hoverColor: extras.arrowHoverColor,
    activeColor: extras.arrowActiveColor,
    textColor: extras.arrowTextColor || extras.textColor,
    radius: extras.radius
  };
  const leftId = id ? id + "-left" : null;
  const rightId = id ? id + "-right" : null;
  this.button(x, y, arrow, sy, { ...arrowExtras, id: leftId }, "◀");
  this.button(x + sx - arrow, y, arrow, sy, { ...arrowExtras, id: rightId }, "▶");

  if (this.justPressed) {
    const hit = this.buttonAt();
    if (hit && hit.id === leftId) {
      return extras.wrap === false ? Math.max(0, index - 1) : (index - 1 + count) % count;
    }
    if (hit && hit.id === rightId) {
      return extras.wrap === false ? Math.min(count - 1, index + 1) : (index + 1) % count;
    }
  }
  return index;
},
  drawTooltip() {
    if (!this.pendingTooltip) {
      return;
    }
    const lines = this.pendingTooltip.lines;
    const pad = 8;
    const lineH = 18;

    push();
    rawTextSize(13);
    textAlign(LEFT, TOP);
    let boxW = 0;
    for (const line of lines) {
      boxW = max(boxW, textWidth(line));
    }
    boxW += pad * 2;
    const boxH = lines.length * lineH + pad * 2;

    let bx = this.pendingTooltip.x + 16;
    let by = this.pendingTooltip.y + 16;
    if (bx + boxW > width) bx = this.pendingTooltip.x - boxW - 16;
    if (by + boxH > height) by = height - boxH;

    noStroke();
    fill("#222e");
    rect(bx, by, boxW, boxH, 4);
    fill("#fff");
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], bx + pad, by + pad + i * lineH);
    }
    pop();

    this.pendingTooltip = null;
  }
}

const LUIAPI = {
  begin(content, scroll, gap) {
    const cursor = { y: content.y - scroll };
    return {
      content,
      cursor,
      label(str, extras = {}) {
        const h = extras.height === undefined ? 22 : extras.height;
        const align = extras.align || LEFT;
        push();
        noStroke();
        fill(extras.color || "#fff");
        textSize(extras.size || 14);
        textAlign(align, CENTER);
        let tx = content.x + (extras.offsetX || 0);
        if (align === CENTER) {
          tx = content.x + content.sx / 2 + (extras.offsetX || 0);
        } else if (align === RIGHT) {
          tx = content.x + content.sx + (extras.offsetX || 0);
        }
        text(str, tx, cursor.y + h / 2 + (extras.offsetY || 0));
        pop();
        cursor.y += h + gap;
      },
      button(offX, offY, bsx, bsy, extras = {}, label) {
        const w = bsx === undefined ? content.sx : bsx;
        const bx = content.x + (content.sx - w) / 2 + offX;
        const by = cursor.y + offY;
        GUIAPI.button(bx, by, w, bsy, extras, label);
        cursor.y += bsy + gap;
      },
      dropdown(offX, offY, bsx, bsy, extras = {}, options, index) {
        const w = bsx === undefined ? content.sx : bsx;
        const bx = content.x + (content.sx - w) / 2 + offX;
        const by = cursor.y + offY;
        const next = GUIAPI.dropdown(bx, by, w, bsy, extras, options, index);
        cursor.y += bsy + gap;
        return next;
      },
      row(h) {
        const out = { x: content.x, y: cursor.y, sx: content.sx, sy: h === undefined ? 22 : h };
        cursor.y += out.sy + gap;
        return out;
      }
    };
  }
};

const vab = {
  parts: [],
  drag: null,
  snap: null,
  scale: 0.14,
  buttonSize: 60,
  scroll: 0,
  category: "All"
};

function panelWidth() {
  return width / 6;
}

function paletteCols() {
  return Math.max(1, Math.floor(panelWidth() / vab.buttonSize));
}

function bayCentre() {
  return (panelWidth() + width) / 2;
}

function craftCentre(exclude) {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const inst of vab.parts) {
    if (exclude && exclude.has(inst)) {
      continue;
    }
    const bb = partBBox(inst.part);
    const w = (inst.rot || 0) % 2 ? bb.h : bb.w;
    minX = Math.min(minX, inst.x - (w / 2) * vab.scale);
    maxX = Math.max(maxX, inst.x + (w / 2) * vab.scale);
  }
  return minX === Infinity ? bayCentre() : (minX + maxX) / 2;
}

function paletteTop() {
  return vab.buttonSize * 3 + tabHeight() * 2;
}

function tabHeight() {
  return 30;
}

const partCategories = ["All", "Pods", "Tanks", "Engines", "Decouplers", "Utility"];

function partCategory(part) {
  const m = part.modules || {};
  if (m["Engine Module"]) return "Engines";
  if (m["Controller Module"]) return "Pods";
  if (m["Decoupler Module"]) return "Decouplers";
  if (m["Resource Module"]) return "Tanks";
  return "Utility";
}

function categoryTabs() {
  const w = (paletteCols() * vab.buttonSize) / 3;
  return partCategories.map((cat, i) => ({
    id: "category-" + cat,
    cat,
    x: (i % 3) * w,
    y: vab.buttonSize * 3 + Math.floor(i / 3) * tabHeight(),
    w,
    h: tabHeight()
  }));
}

function paletteParts() {
  const parts = partAPI.list().filter(partAvailable);
  if (vab.category === "All") {
    return parts;
  }
  return parts.filter(part => partCategory(part) === vab.category);
}

function paletteMaxScroll() {
  const parts = paletteParts();
  const rows = Math.ceil(parts.length / paletteCols());
  const contentH = rows * vab.buttonSize;
  return Math.max(0, contentH - (height - paletteTop()));
}

function paletteLayout() {
  const out = [];
  const parts = paletteParts();
  for (let i = 0; i < parts.length; i++) {
    out.push({
      id: "part-" + i,
      x: (i % paletteCols()) * vab.buttonSize,
      y: Math.floor(i / paletteCols()) * vab.buttonSize + paletteTop() - vab.scroll,
      size: vab.buttonSize,
      part: parts[i]
    });
  }
  return out;
}

function visiblePaletteLayout() {
  return paletteLayout().filter(b => b.y + b.size > paletteTop() && b.y < height);
}

function launchButton() {
  return { x: 0, y: 0, size: vab.buttonSize };
}

function zoomVab(factor, focusX, focusY) {
  const next = constrain(vab.scale * factor, c.vabZoomMin, c.vabZoomMax);
  const ratio = next / vab.scale;
  if (ratio === 1) {
    return;
  }
  for (const inst of vab.parts) {
    inst.x = focusX + (inst.x - focusX) * ratio;
    inst.y = focusY + (inst.y - focusY) * ratio;
  }
  vab.scale = next;
}

function zoomButtons() {
  const size = vab.buttonSize;
  return [
    { id: "zoom-in", x: size * 2, y: 0, size, factor: 1 + c.zoomPower * 4, label: "+" },
    { id: "zoom-out", x: size * 3, y: 0, size, factor: 1 - c.zoomPower * 4, label: "-" }
  ];
}

function craftButtons() {
  const size = vab.buttonSize;
  const w = (size * 4) / 3;
  return [
    { id: "craft-save", x: 0, y: size, w, h: size, label: "S", action: craftSave },
    { id: "craft-open", x: w, y: size, w, h: size, label: "O", action: craftPick },
    { id: "craft-export-context", x: w * 2, y: size, w, h: size, label: "EC", action: craftExportContext },
  ];
}

function vabButton() {
  const size = 60;
  return { x: width - size - 20, y: 20, size };
}

function flyButton() {
  return { x: vab.buttonSize, y: 0, size: vab.buttonSize };
}

function flyingRocket() {
  return rockets.find(rocket => rocket.id === target);
}

function partBBox(part) {
  if (part._bbox) {
    return part._bbox;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const group of part.groups) {
    for (const [px, py] of group.points) {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  part._bbox = {
    minX, minY, maxX, maxY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY
  };
  return part._bbox;
}

function partReach(part) {
  if (part._reach) {
    return part._reach;
  }
  const bb = partBBox(part);
  const solid = part.groups.filter(group => !group.noCollision);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const group of solid.length ? solid : part.groups) {
    for (const [px, py] of group.points) {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  part._reach = {
    top: bb.cy - minY,
    bottom: maxY - bb.cy,
    left: bb.cx - minX,
    right: maxX - bb.cx
  };
  return part._reach;
}

function parseVersion(v) {
  return String(v ?? "0").replace(/^[~^<>=]+/, "").split(".").map(n => parseInt(n, 10) || 0);
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
    return v[0] === base[0] && v[1] === base[1] && (v[2] || 0) >= (base[2] || 0);
  }
  if (range.startsWith("^")) {
    const base = parseVersion(range);
    if (base[0] > 0) {
      return v[0] === base[0] && compareVersions(version, range) >= 0;
    }
    if (base[1] > 0) {
      return v[0] === 0 && v[1] === base[1] && compareVersions(version, range) >= 0;
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

function persistLoadedMods() {
  try {
    localStorage.setItem("weborbit-loaded-mods", JSON.stringify(loaded.slice(defaultLoadedCount)));
  } catch (err) {
    console.warn(`couldn't persist loaded mods: ${err.message}`);
  }
}

async function restoreLoadedMods() {
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem("weborbit-loaded-mods"));
  } catch (err) {
    console.warn(`couldn't parse stored mods: ${err.message}`);
    return;
  }
  const mods = (stored || []).filter(pack => !isBasePack(pack));
  for (const pack of mods) {
    await loadPack(pack, { silent: true });
  }
  if (mods.length !== (stored || []).length) {
    persistLoadedMods();
  }
}

async function loadPack(pack, opts = {}) {
  const name = pack.name || "This mod";
  if (pack.requiredVersion && !satisfiesRange(gameVersion, pack.requiredVersion)) {
    if (opts.silent) {
      console.warn(`Skipped mod "${name}": requires game version ${pack.requiredVersion}, running ${gameVersion}`);
    } else {
      alert(`"${name}" requires game version ${pack.requiredVersion}, but you're running ${gameVersion}. It will not be loaded.`);
    }
    return false;
  }
  if (!opts.silent && pack.recommendedVersion && !satisfiesRange(gameVersion, pack.recommendedVersion)) {
    const ok = confirm(`"${name}" recommends game version ${pack.recommendedVersion}, but you're running ${gameVersion}. Some things might not work right. Load it anyway?`);
    if (!ok) {
      return false;
    }
  }
  loaded.push(pack);
  if (!opts.silent) {
    await resolveDependencies(pack);
  }
  if (!opts.skipPersist) {
    persistLoadedMods();
  }
  return true;
}

async function loadFeaturedMod(data) {
  const threadId = new URL(data.threadUrl).searchParams.get("id");
  if (!threadId) {
    alert(`Couldn't load that mod: no thread id in ${data.threadUrl}`);
    return;
  }
  try {
    const { data: rows, error } = await supabaseClient.rpc("get_thread", { p_thread_id: threadId });
    if (error) {
      throw new Error(error.message);
    }
    const thread = rows?.[0];
    if (!thread?.mod_url) {
      throw new Error("thread has no mod_url");
    }
    const res = await fetch(thread.mod_url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const pack = await res.json();
    if (await loadPack(pack)) {
      await loadPartTextures();
      alert(`Loaded mod! "${pack.name || data.title}" by ${thread.username ?? "Unknown"}`);
    }
  } catch (err) {
    alert(`Couldn't load that mod: ${err.message}`);
  }
}

async function fetchDependency(dep) {
  const res = await fetch(dep.url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function resolveDependencies(pack) {
  for (const dep of pack.dependencies || []) {
    if (!dep.url) {
      continue;
    }
    let fetched;
    try {
      fetched = await fetchDependency(dep);
    } catch (err) {
      const wants = confirm(`"${pack.name || "This mod"}" depends on a mod at ${dep.url}, but it couldn't be fetched (${err.message}). Paste its JSON instead?`);
      if (!wants) {
        continue;
      }
      const answer = prompt(`Paste JSON for the mod at ${dep.url}`);
      if (!answer) {
        continue;
      }
      try {
        fetched = JSON.parse(answer);
      } catch (err2) {
        alert(`Couldn't parse that part pack: ${err2.message}`);
        continue;
      }
    }
    if (loaded.find(p => p.name === fetched.name)) {
      continue;
    }
    const wants = confirm(`"${pack.name || "This mod"}" depends on "${fetched.name || dep.url}"${fetched.modVersion ? " " + fetched.modVersion : ""}, which isn't loaded. Load it now?`);
    if (!wants) {
      continue;
    }
    await loadPack(fetched);
  }
}

async function loadPartTextures() {
  const wanted = new Set();
  for (const pack of loaded) {
    for (const part of pack.parts) {
      for (const group of part.groups) {
        if (group.texture) {
          wanted.add(group.texture);
        }
        if (group.shapeTexture) {
          wanted.add(group.shapeTexture);
        }
      }
    }
  }
  for (const name of wanted) {
    try {
      textures[name] = await loadImage(`assets/${name}`);
    } catch (err) {
      console.warn(`texture missing: assets/${name}`);
    }
  }
}

function partSets(part) {
  if (!part.setInfo) {
    const spans = new Map();
    let tagged = false;
    part.groups.forEach((group, gi) => {
      if (group.set !== undefined) {
        tagged = true;
      }
      const key = group.set === undefined ? gi : group.set;
      const span = spans.get(key) || { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      for (const [px, py] of group.points) {
        span.minX = Math.min(span.minX, px);
        span.maxX = Math.max(span.maxX, px);
        span.minY = Math.min(span.minY, py);
        span.maxY = Math.max(span.maxY, py);
      }
      spans.set(key, span);
    });
    const centres = new Map();
    for (const [key, span] of spans) {
      centres.set(key, { x: (span.minX + span.maxX) / 2, y: (span.minY + span.maxY) / 2 });
    }
    part.setInfo = { tagged, centres };
  }
  return part.setInfo;
}

function setOfGroup(part, gi) {
  const group = part.groups[gi];
  return group.set === undefined ? gi : group.set;
}

function groupPath(points, bb, sx, sy, sw, sh, into, stretch) {
  const path = into || new Path2D();
  if (!points.length) {
    return path;
  }
  const pivot = stretch ? stretch.pivot || groupCentre(points) : null;
  const at = (i) => {
    let [px, py] = points[(i + points.length) % points.length];
    if (stretch) {
      px = pivot.x + (px - pivot.x) * stretch.wide;
      py = pivot.y + (py - pivot.y) * stretch.tall;
    }
    return { x: sx + (px - bb.cx) * sw, y: sy + (py - bb.cy) * sh };
  };
  const smooth = (i) => !!points[(i + points.length) % points.length][2];
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const first = smooth(0) ? mid(at(-1), at(0)) : at(0);
  path.moveTo(first.x, first.y);
  for (let i = 0; i < points.length; i++) {
    const cur = at(i);
    if (smooth(i)) {
      const from = mid(at(i - 1), cur);
      const to = mid(cur, at(i + 1));
      path.lineTo(from.x, from.y);
      path.quadraticCurveTo(cur.x, cur.y, to.x, to.y);
    } else {
      path.lineTo(cur.x, cur.y);
    }
  }
  path.closePath();
  return path;
}

function groupCentre(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [px, py] of points) {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

function groupFillOn(ctx, group, bb, sx, sy, sw, sh) {
  if (!group.gradient) {
    return group.fill;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [px, py] of group.points) {
    const x = sx + (px - bb.cx) * sw;
    const y = sy + (py - bb.cy) * sh;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const a = radians(group.gradient.angle || 0);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const half = (Math.abs(Math.cos(a)) * (maxX - minX) + Math.abs(Math.sin(a)) * (maxY - minY)) / 2;
  const paint = ctx.createLinearGradient(
    cx - Math.cos(a) * half,
    cy - Math.sin(a) * half,
    cx + Math.cos(a) * half,
    cy + Math.sin(a) * half
  );
  paint.addColorStop(0, withAlpha(group.fill, group.gradient.fromOpacity));
  paint.addColorStop(1, withAlpha(group.gradient.to || group.fill, group.gradient.toOpacity));
  return paint;
}

function withAlpha(hex, alpha) {
  if (alpha === undefined || alpha >= 1) {
    return hex;
  }
  let body = String(hex).replace("#", "");
  if (body.length === 3) {
    body = body.split("").map(ch => ch + ch).join("");
  }
  const n = parseInt(body, 16);
  if (Number.isNaN(n)) {
    return hex;
  }
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(alpha, 0)})`;
}

function groupExtent(points, bb, sw, sh, stretch) {
  const pivot = stretch ? stretch.pivot || groupCentre(points) : null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let [px, py] of points) {
    if (stretch) {
      px = pivot.x + (px - pivot.x) * stretch.wide;
      py = pivot.y + (py - pivot.y) * stretch.tall;
    }
    const x = (px - bb.cx) * sw;
    const y = (py - bb.cy) * sh;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

function paintGroup(ctx, spec) {
  const { group, part, bb, sx, sy, sw, sh, cutouts, stretch, glow, alpha } = spec;
  ctx.save();
  try {
    ctx.globalAlpha = alpha;
    const solid = groupPath(group.points, bb, sx, sy, sw, sh, null, stretch);
    const holed = groupPath(group.points, bb, sx, sy, sw, sh, null, stretch);
    for (const cut of cutouts) {
      groupPath(cut.points, bb, sx, sy, sw, sh, holed);
    }
    const texture = textures[group.texture];
    const source = texture && (texture.canvas || texture.elt || null);
    if (glow > 0) {
      ctx.filter = `blur(${glow}px)`;
    }
    if (glow <= 0 || source) {
      ctx.clip(solid);
      if (cutouts.length) {
        ctx.clip(holed, "evenodd");
      }
    }
    if (source) {
      // not image()/tint(): p5 tints through a buffer that ignores the clip
      // and lands at half size on retina
      const tinted = !group.untinted && group.fill && group.fill.toLowerCase() !== "#ffffff"
        ? tintedTexture(group.texture, source, group.fill)
        : source;
      ctx.drawImage(
        tinted,
        sx + (bb.minX - bb.cx) * sw,
        sy + (bb.minY - bb.cy) * sh,
        bb.w * sw,
        bb.h * sh
      );
    } else {
      ctx.fillStyle = spec.recolor || groupFillOn(ctx, group, bb, sx, sy, sw, sh);
      ctx.fill(holed, "evenodd");
    }
    const overlay = textures[group.shapeTexture];
    const overlaySource = glow <= 0 && overlay && (overlay.canvas || overlay.elt || null);
    if (overlaySource) {
      const tint = group.shapeTint && group.shapeTint.toLowerCase() !== "#ffffff"
        ? tintedTexture(group.shapeTexture, overlaySource, group.shapeTint)
        : overlaySource;
      ctx.drawImage(
        tint,
        sx + (bb.minX - bb.cx) * sw,
        sy + (bb.minY - bb.cy) * sh,
        bb.w * sw,
        bb.h * sh
      );
    }
    if (glow <= 0 && !(source && textureHasAlpha(group.texture, source))) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.27)";
      ctx.lineWidth = 1.5;
      ctx.stroke(holed);
    }
  } finally {
    // the clip must not outlive the group or everything after it vanishes
    ctx.restore();
  }
}

const alphaCache = new Map();

function textureHasAlpha(name, source) {
  let known = alphaCache.get(name);
  if (known === undefined) {
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const actx = canvas.getContext("2d", { willReadFrequently: true });
    actx.drawImage(source, 0, 0, size, size);
    const data = actx.getImageData(0, 0, size, size).data;
    known = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        known = true;
        break;
      }
    }
    alphaCache.set(name, known);
  }
  return known;
}

const tintCache = new Map();

function tintedTexture(name, source, fill) {
  const key = `${name}|${fill}`;
  let canvas = tintCache.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const tctx = canvas.getContext("2d");
    tctx.drawImage(source, 0, 0);
    tctx.globalCompositeOperation = "multiply";
    tctx.fillStyle = fill;
    tctx.fillRect(0, 0, canvas.width, canvas.height);
    tctx.globalCompositeOperation = "destination-in";
    tctx.drawImage(source, 0, 0);
    tintCache.set(key, canvas);
  }
  return canvas;
}

const blurCache = new Map();

function blurredTile(spec) {
  const { group, part, bb, sw, sh, stretch, glow } = spec;
  const box = groupExtent(group.points, bb, sw, sh, stretch);
  const pad = Math.ceil(glow * 3) + 2;
  const w = Math.ceil(box.maxX - box.minX) + pad * 2;
  const h = Math.ceil(box.maxY - box.minY) + pad * 2;
  if (w <= 0 || h <= 0 || w > c.blurTileMax || h > c.blurTileMax) {
    return null;
  }
  const key = [
    part.name, spec.index, spec.group.fill, spec.group.shapeTexture || "", w, h,
    Math.round(glow * 2), Math.round(box.minX), Math.round(box.minY),
    spec.recolor || ""
  ].join("|");
  let tile = blurCache.get(key);
  if (!tile) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    paintGroup(ctx, {
      ...spec,
      sx: -box.minX + pad,
      sy: -box.minY + pad,
      alpha: 1
    });
    tile = { canvas, dx: box.minX - pad, dy: box.minY - pad };
    if (blurCache.size > c.blurCacheMax) {
      blurCache.clear();
    }
    blurCache.set(key, tile);
  }
  return tile;
}

const paintColors = [
  "#ffffff", "#d9d9d9", "#8c8c8c", "#3a3a3a", "#e53935", "#fb8c00", "#fdd835", "#7cb342",
  "#00897b", "#039be5", "#3949ab", "#8e24aa", "#d81b60", "#6d4c41", "#f5deb3", "#ff80ab"
];
const shapeColors = ["#ffffff", "#000000", "#8c8c8c", "#e53935", "#fb8c00", "#fdd835", "#039be5", "#7cb342"];
const shapeTextureNames = [
  "Rivets", "RivetBorder", "StripesDiagonal", "StripesHorizontal", "StripesVertical", "RacingStripe",
  "HazardStripes", "Bands", "Chevrons", "Checker", "Dots", "Grid", "HexMesh", "PanelLines",
  "Corrugated", "Portholes", "EdgeShade", "Gloss", "Scorch", "Weathering"
];
const shapeTextureLoading = new Set();

function mulHex(a, b) {
  const parse = (hex) => {
    let body = String(hex).replace("#", "");
    if (body.length === 3) {
      body = body.split("").map(ch => ch + ch).join("");
    }
    const n = parseInt(body, 16);
    return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) {
    return a;
  }
  return "#" + x.map((v, i) => Math.round(v * y[i] / 255).toString(16).padStart(2, "0")).join("");
}

function mainGroupIndex(part) {
  if (part._mainGroup === undefined) {
    let best = -1;
    let area = -1;
    part.groups.forEach((group, gi) => {
      if (group.cutout || group.noCollision || group.foreground) {
        return;
      }
      const xs = group.points.map(p => p[0]);
      const ys = group.points.map(p => p[1]);
      const size = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
      if (size > area) {
        area = size;
        best = gi;
      }
    });
    part._mainGroup = best;
  }
  return part._mainGroup;
}

function ensureShapeTexture(file) {
  if (textures[file] || shapeTextureLoading.has(file)) {
    return;
  }
  shapeTextureLoading.add(file);
  loadImage(`assets/${file}`).then(img => (textures[file] = img)).catch(() => console.warn(`texture missing: assets/${file}`));
}

function paintedGroup(part, gi, group, paint) {
  if (!paint) {
    return group;
  }
  let out = group;
  if (paint.color) {
    out = {
      ...out,
      fill: mulHex(out.fill, paint.color),
      gradient: out.gradient && { ...out.gradient, to: out.gradient.to && mulHex(out.gradient.to, paint.color) }
    };
  }
  if (paint.shape && gi === mainGroupIndex(part)) {
    const file = paint.shape + ".png";
    ensureShapeTexture(file);
    out = { ...out, shapeTexture: file, shapeTint: paint.shapeTint };
  }
  return out;
}

function drawPart(part, sx, sy, s, opts = {}) {
  const bb = partBBox(part);
  const cutouts = part.groups.filter(group => group.cutout);
  const fx = opts.fx || { part: {}, groups: {} };
  const partFx = fx.part || {};
  const sw = s * (opts.wide === undefined ? 1 : opts.wide) * (partFx.Width === undefined ? 1 : partFx.Width);
  const sh = s * (opts.tall === undefined ? 1 : opts.tall) * (partFx.Height === undefined ? 1 : partFx.Height);
  const baseAlpha = opts.alpha == null ? 1 : opts.alpha;
  push();
  if (opts.rot) {
    translate(sx, sy);
    rotate(opts.rot * HALF_PI);
    sx = 0;
    sy = 0;
  }
  for (let gi = 0; gi < part.groups.length; gi++) {
    const group = part.groups[gi];
    if (group.cutout) {
      continue;
    }
    if (opts.layer === "back" && group.foreground) {
      continue;
    }
    if (opts.layer === "front" && !group.foreground) {
      continue;
    }
    const setId = setOfGroup(part, gi);
    const groupFx = (fx.groups || {})[setId] || {};
    const stretch =
      groupFx.Width === undefined && groupFx.Height === undefined
        ? null
        : {
            wide: groupFx.Width === undefined ? 1 : groupFx.Width,
            tall: groupFx.Height === undefined ? 1 : groupFx.Height,
            pivot: partSets(part).tagged ? partSets(part).centres.get(setId) : null
          };
    const alpha = baseAlpha * (group.opacity === undefined ? 1 : group.opacity);
    const asked = groupFx.Blur === undefined
      ? (partFx.Blur === undefined ? baseBlur(part) : partFx.Blur)
      : groupFx.Blur;
    const drawn = Math.max(bb.w * sw, bb.h * sh);
    const glow = drawn < c.blurMinSize ? 0 : Math.min(asked, c.blurMax);

    const spec = { group: paintedGroup(part, gi, group, opts.paint), part, bb, sx, sy, sw, sh, cutouts, stretch, glow, alpha, index: gi, recolor: opts.recolor };
    const tile = glow > 0 ? blurredTile(spec) : null;
    if (tile) {
      drawingContext.save();
      drawingContext.globalAlpha = alpha;
      drawingContext.drawImage(tile.canvas, sx + tile.dx, sy + tile.dy);
      drawingContext.restore();
    } else {
      paintGroup(drawingContext, spec);
    }
  }
  pop();
}

const attachSides = ["top", "bottom", "left", "right"];

function opposite(side) {
  return { top: "bottom", bottom: "top", left: "right", right: "left" }[side];
}

function attachPoint(inst, side) {
  const reach = partReach(inst.part);
  const base = {
    top: [0, -reach.top * vab.scale],
    bottom: [0, reach.bottom * vab.scale],
    left: [-reach.left * vab.scale, 0],
    right: [reach.right * vab.scale, 0]
  }[side];
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: inst.x + base[0] * cos - base[1] * sin,
    y: inst.y + base[0] * sin + base[1] * cos
  };
}

function attach(child, parent, side) {
  child.attachedTo = parent;
  child.parentNode = side;
  child.childNode = opposite(side);
}

function detach(inst) {
  inst.attachedTo = null;
  inst.parentNode = null;
  inst.childNode = null;
}

function subtree(inst, acc = []) {
  acc.push(inst);
  for (const p of vab.parts) {
    if (p.attachedTo === inst) {
      subtree(p, acc);
    }
  }
  return acc;
}

function cloneParts(list) {
  const copies = list.map(p => ({
    part: p.part,
    x: p.x,
    y: p.y,
    rot: p.rot || 0,
    paint: p.paint ? { ...p.paint } : undefined,
    attachedTo: null,
    parentNode: null,
    childNode: null
  }));
  list.forEach((p, i) => {
    const pi = list.indexOf(p.attachedTo);
    if (pi >= 0) {
      copies[i].attachedTo = copies[pi];
      copies[i].parentNode = p.parentNode;
      copies[i].childNode = p.childNode;
    }
  });
  return copies;
}

function moveSubtree(inst, dx, dy) {
  for (const p of subtree(inst)) {
    p.x += dx;
    p.y += dy;
  }
}

function nodeDisabled(inst, side) {
  const list = ((inst.part.modules || {})["Connection Disabler Module"] || {})["Connections to Disable"];
  if (!Array.isArray(list)) {
    return false;
  }
  return list.some((name) => String(name).toLowerCase() === side);
}

function nodeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  if (inst.attachedTo && inst.childNode === side) {
    return true;
  }
  return vab.parts.some((p) => p.attachedTo === inst && p.parentNode === side);
}

function heldNodeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  return vab.parts.some((p) => p.attachedTo === inst && p.parentNode === side);
}

function toLocal(inst, x, y) {
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = x - inst.x;
  const dy = y - inst.y;
  return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
}

function toWorld(inst, lx, ly) {
  const a = (inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: inst.x + lx * cos - ly * sin, y: inst.y + lx * sin + ly * cos };
}

function alongAxis(side) {
  return side === "top" || side === "bottom" ? "x" : "y";
}

// how far a part reaches either way along an edge of another, given the two
// may be turned differently
function halfExtentAlong(child, parent, side) {
  const bb = partBBox(child.part);
  const halfW = (bb.w / 2) * vab.scale;
  const halfH = (bb.h / 2) * vab.scale;
  const rel = ((child.rot || 0) - (parent.rot || 0)) * HALF_PI;
  const c = Math.abs(Math.cos(rel));
  const s = Math.abs(Math.sin(rel));
  const alongX = alongAxis(side) === "x";
  return alongX ? halfW * c + halfH * s : halfW * s + halfH * c;
}

function halfEdge(parent, side) {
  const bb = partBBox(parent.part);
  return (alongAxis(side) === "x" ? bb.w / 2 : bb.h / 2) * vab.scale;
}

// where along the edge a part already attached to it sits
function positionAlong(child, parent, side) {
  const p = attachPoint(child, child.childNode);
  const local = toLocal(parent, p.x, p.y);
  return alongAxis(side) === "x" ? local.x : local.y;
}

function edgeFree(parent, side, child, at) {
  const reach = halfExtentAlong(child, parent, side);
  return !vab.parts.some((p) => {
    if (p === child || p.attachedTo !== parent || p.parentNode !== side) {
      return false;
    }
    const other = positionAlong(p, parent, side);
    const otherReach = halfExtentAlong(p, parent, side);
    return Math.abs(other - at) < reach + otherReach - 0.5;
  });
}

function edgePoint(parent, side, child) {
  const mine = attachPoint(child, opposite(side));
  const local = toLocal(parent, mine.x, mine.y);
  const centre = attachPoint(parent, side);
  const centreLocal = toLocal(parent, centre.x, centre.y);
  const axis = alongAxis(side);
  const room = halfEdge(parent, side) - halfExtentAlong(child, parent, side);
  let at = axis === "x" ? local.x : local.y;
  if (room <= 0 || Math.abs(at) < 12) {
    at = 0;
  } else {
    at = Math.max(-room, Math.min(room, at));
  }
  const world = axis === "x"
    ? toWorld(parent, at, centreLocal.y)
    : toWorld(parent, centreLocal.x, at);
  return { point: world, at };
}

// a side an edge, so it counts as taken only when disabled or already used to
// hang from something above; the children on it are handled by edgeFree
function edgeTaken(inst, side) {
  if (nodeDisabled(inst, side)) {
    return true;
  }
  return !!(inst.attachedTo && inst.childNode === side);
}

function jointOptions(inst) {
  const blocked = new Set(subtree(inst));
  const out = [];
  for (const other of vab.parts) {
    if (blocked.has(other)) {
      continue;
    }
    for (const side of attachSides) {
      if (side === "top") {
        if (edgeTaken(other, "top") || edgeTaken(inst, "bottom")) {
          continue;
        }
        if (vab.parts.some((p) => p.attachedTo === other && p.parentNode === "top")) {
          continue;
        }
        const { at } = edgePoint(inst, "bottom", other);
        if (!edgeFree(inst, "bottom", other, at)) {
          continue;
        }
        out.push({ target: other, side, point: attachPoint(other, "top") });
        continue;
      }
      if (edgeTaken(other, side) || edgeTaken(inst, opposite(side))) {
        continue;
      }
      if (vab.parts.some((p) => p.attachedTo === inst && p.parentNode === opposite(side))) {
        continue;
      }
      const { point, at } = edgePoint(other, side, inst);
      if (!edgeFree(other, side, inst, at)) {
        continue;
      }
      out.push({ target: other, side, point });
    }
  }
  return out;
}

function findSnap(inst) {
  const bb = partBBox(inst.part);
  const reach = Math.max(24, Math.min(bb.w, bb.h) * vab.scale * 0.5);
  let best = null;
  let bestDist = reach;
  for (const option of jointOptions(inst)) {
    // for a top the meeting spot is on inst's own bottom edge, slid to where
    // the other part is; for anything else it's inst's opposite point
    const mine = option.side === "top"
      ? edgePoint(inst, "bottom", option.target).point
      : attachPoint(inst, opposite(option.side));
    const d = Math.hypot(option.point.x - mine.x, option.point.y - mine.y);
    if (d < bestDist) {
      bestDist = d;
      best = {
        target: option.target,
        point: option.point,
        side: option.side,
        dx: option.point.x - mine.x,
        dy: option.point.y - mine.y,
        mode: option.side
      };
    }
  }
  if (!best) {
    const mid = craftCentre(new Set(subtree(inst)));
    if (Math.abs(inst.x - mid) < reach) {
      best = { target: null, point: null, dx: mid - inst.x, dy: 0, mode: "centre" };
    }
  }
  return best;
}

function validMoves(inst) {
  return jointOptions(inst);
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPart(inst, mx, my) {
  const bb = partBBox(inst.part);
  const a = -(inst.rot || 0) * HALF_PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = (mx - inst.x) / vab.scale;
  const dy = (my - inst.y) / vab.scale;
  const lx = dx * cos - dy * sin + bb.cx;
  const ly = dx * sin + dy * cos + bb.cy;
  for (const group of inst.part.groups) {
    if (group.noCollision) {
      continue;
    }
    if (pointInPolygon(lx, ly, group.points)) {
      return true;
    }
  }
  return false;
}

function partIsToggleable(part) {
  const m = part.modules || {};
  return !!(m["Togglable Module"] || m["Engine Module"] || m["Decoupler Module"] || m["Parachute Module"]);
}

function partAt(mx, my) {
  for (let i = vab.parts.length - 1; i >= 0; i--) {
    if (pointInPart(vab.parts[i], mx, my)) {
      return vab.parts[i];
    }
  }
  return null;
}

function drawStageReadout(panelW) {
  const stages = stageBreakdown();
  if (!stages.length) {
    return;
  }
  let total = 0;
  for (const stage of stages) {
    total += stage.dv;
  }
  push();
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  fill("#eee");
  let y = 14;
  text(`dv ${Math.round(total)} m/s`, panelW + 14, y);
  textSize(11);
  fill("#aaa");
  for (let i = 0; i < stages.length; i++) {
    y += 15;
    const stage = stages[i];
    const twr = stage.wetMass > 0 ? stage.thrust / (stage.wetMass * 9.80665) : 0;
    text(
      `s${i + 1}  ${Math.round(stage.dv)} m/s   twr ${twr.toFixed(2)}   ${(stage.wetMass / c.kgPerTon).toFixed(1)}t`,
      panelW + 14,
      y
    );
  }
  textAlign(LEFT, BASELINE);
  pop();
}

const menuStyle = { baseColor: "#242a31", borderColor: "#5aa9ff" };
const menuStyleDisabled = { baseColor: "#525e6d", borderColor: "#83a0c0" }

function drawMainMenu() {
  textSize(30);
  background("#05070a");
  const geom = introEarth || menuEarthGeom();
  drawIntroEarth({ x: geom.x + mouseX / 64, y: geom.y + mouseY / 64, r: geom.r });

  const buttons = [
    { id: "menu-world", label: "New World", style: menuStyle },
    { id: "menu-career", label: "Play Existing World", style: menuStyle },
    { id: "menu-credits", label: "Credits", style: menuStyle },
    { id: "menu-modloader", label: "Modloader", style: menuStyle },
    {
      id: "menu-featured-mods",
      label: featuredMods ? `Featured Mods (${featuredMods.length})` : "Featured Mods",
      style: menuStyle
    },
    { id: "menu-keybinds", label: "Keybinds", style: menuStyle }
  ];

  // one column, stacked, over on the earth-free side of the screen
  const btnW = Math.min(320, width * 0.32);
  const btnH = 62;
  const gap = 14;
  const stackH = buttons.length * btnH + (buttons.length - 1) * gap;
  const bx = width * 0.72 - btnW / 2;
  const startY = height / 2 - stackH / 2;
  buttons.forEach((b, i) => {
    GUIAPI.button(bx, startY + i * (btnH + gap), btnW, btnH, { id: b.id, ...b.style }, b.label);
  });
}

function drawKeyBindsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "keybinds" }, undefined, ui => {
    ui.label("Keybinds", { size: 28, align: CENTER, height: 40 });

    ui.button(0, 0, 350, 85, {
      id: "keybind-invert-vab-zoom",
      ...menuStyle
    }, `Invert VAB Zoom: ${controls.invertVabZoom ? "On" : "Off"}`);

    ui.button(0, 0, 350, 85, {
      id: "keybind-invert-flight-zoom",
      ...menuStyle
    }, `Invert Flight Zoom: ${controls.invertFlightZoom ? "On" : "Off"}`);

    ui.button(0, 0, 350, 85, {
      id: "keybinds-close",
      ...menuStyle
    }, "Close");
  });
}

function drawCreditsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "credits" }, undefined, ui => {
    ui.label("Credits", { size: 28, align: CENTER, height: 40 });
    ui.label("@sorabora - Developer", { size: 28, align: CENTER, height: 80 });
    ui.label("Planet textures are modified versions of graphics by Solar System Scope (solarsystemscope.com), used under CC BY 4.0.", { size: 15, align: CENTER, height: 20 });
    ui.label("DM Mono font by Colophon Foundry, used under the SIL Open Font License 1.1.", { size: 15, align: CENTER, height: 40 });
    ui.label("VAB, launchtower and launchpad textures by @Croissant on SFS forums", { size: 15, align: CENTER, height: 20 });

    ui.button(0, 0, 350, 130, {
      id: "credits-close",
      baseColor: "#1f398f",
      hoverColor: "#2a32c0",
      activeColor: "#1a1770"
    }, "Close");
  });
}

function drawModLoaderMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "modloader" }, undefined, ui => {
    ui.label("Modloader", { size: 28, align: CENTER, height: 40 });

    for (let i = 0; i < loaded.length; i++) {
      const pack = loaded[i];
      ui.label(i === 0 ? "Base Game" : pack.name ?? "Unnamed Mod", { size: 20, height: 26 });
      ui.label(`v${pack.modVersion ?? pack.version}   ${pack.parts.length} parts`, { size: 14, color: "#aaa", height: 18 });
      if (i === 0) {
        continue;
      }
      ui.button(0, 4, undefined, 30, {
        id: "mod-delete-" + i,
        baseColor: "#7a2a2a",
        hoverColor: "#a03c3c",
        activeColor: "#5e1f1f"
      }, "Delete");
    }

    const close = ui.row(85);
    GUIAPI.button(close.x + close.sx / 2 - 350, close.y, 350, 85, {
      id: "modloader-close",
      baseColor: "#1f398f",
      hoverColor: "#2a32c0",
      activeColor: "#1a1770"
    }, "Close");

    GUIAPI.button(close.x + close.sx / 2, close.y, 350, 85, {
      id: "modloader-new",
      baseColor: "#1f8f1f",
      hoverColor: "#2ac050",
      activeColor: "#177023"
    }, "Load New");
  });
}

async function getData() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/sorabora/Centralorbit/main/FEATURED_MODS.json");

    if (!response.ok) {
      console.warn(`featured mods: HTTP ${response.status}`);
      return null;
    }

    const res = await response.json();
    return res;
  } catch (e) {
    console.warn("featured mods won't load:", e);
    return null;
  }
}

const featuredTierLabels = {
  1: "★☆☆ Featured",
  2: "★★☆ Exceptional",
  3: "★★★ Flagship"
};

function drawFeaturedModsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "featured-mods" }, undefined, ui => {
    ui.label("Featured Mods", { size: 28, align: CENTER, height: 40 });

    for (let i = 0; i < (featuredMods ?? []).length; i++) {
      const mod = featuredMods[i];
      ui.button(0, 0, 550, 80, {
        id: "featured-mod-" + i,
        data: {
          threadUrl: mod.threadUrl,
          title: mod.title,
          type: "featured-mod"
        },
        baseColor: "#1f4f8f",
        hoverColor: "#2a6ac0",
        activeColor: "#173d70"
      }, `${mod.title}  ${featuredTierLabels[mod.tier] ?? ""}`);
    }

    ui.button(0, 0, 550, 80, {
      id: "featured-mods-close",
      baseColor: "#1f398f",
      hoverColor: "#2a32c0",
      activeColor: "#1a1770"
    }, "Close");
  });
}

const recoveryRate = 0.5;

const career = {
  completed: [],
  techs: ["basicRocketry"],
  science: 0,
  offers: [],
  active: null,
  milestones: {},
  launches: 0,
  loans: {},
  difficulty: "Normal"
};

const loanTypes = {
  small: {
    bank: "Pebblestone Trust",
    amount: 20000000,
    repay: 1.15,
    termLaunches: 5,
    unlocked: () => true
  },
  medium: {
    bank: "Ironclad Credit Union",
    amount: 75000000,
    repay: 1.25,
    termLaunches: 12,
    unlocked: () => missionDone("orbit:Earth")
  },
  big: {
    bank: "Continental Sovereign Bank",
    amount: 250000000,
    repay: 1.35,
    termLaunches: 25,
    unlocked: () => missionDone("crewOrbit:Earth")
  },
  massive: {
    bank: "Obelisk Reserve",
    amount: 750000000,
    repay: 1.5,
    termLaunches: 50,
    unlocked: () => missionDone("crewLand")
  }
};

function defaultLoans() {
  const loans = {};
  for (const key in loanTypes) {
    loans[key] = { taken: false, dueAtLaunch: null, owed: 0 };
  }
  return loans;
}

function loanUnlocked(key) {
  return loanTypes[key].unlocked();
}

function takeLoan(key) {
  const type = loanTypes[key];
  const loan = career.loans[key];
  if (!loanUnlocked(key) || loan.taken) {
    return;
  }
  loan.taken = true;
  loan.dueAtLaunch = career.launches + type.termLaunches;
  loan.owed = Math.round(type.amount * type.repay);
  balance += type.amount;
  saveCareer();
  launchToast(`${type.bank} wired you ${Math.round(type.amount).toLocaleString("en-US")}`);
}

function payLoan(key) {
  const type = loanTypes[key];
  const loan = career.loans[key];
  if (!loan.taken || balance < loan.owed) {
    return;
  }
  balance -= loan.owed;
  loan.taken = false;
  loan.dueAtLaunch = null;
  loan.owed = 0;
  saveCareer();
  launchToast(`Paid off ${type.bank}`);
}

function settleLoans() {
  for (const key in loanTypes) {
    const loan = career.loans[key];
    if (loan.taken && loan.dueAtLaunch !== null && career.launches >= loan.dueAtLaunch) {
      balance -= loan.owed;
      loan.taken = false;
      loan.dueAtLaunch = null;
      loan.owed = 0;
      saveCareer();
      launchToast(`${loanTypes[key].bank} collected its loan on schedule`);
    }
  }
}

function checkBankruptcy() {
  if (bankrupt || balance >= 0) {
    return;
  }
  const anyAvailable = Object.keys(loanTypes).some(key => loanUnlocked(key) && !career.loans[key].taken);
  if (!anyAvailable) {
    bankrupt = true;
  }
}

const techTree = {
  basicRocketry: {
    name: "Basic Rocketry",
    cost: 0,
    needs: [],
    parts: ["Spider Pod", "UK8 Booster", "UK16 Booster", "Nano Reactionwheel", "SM Decoupler"]
  },
  aerodynamics: {
    name: "Aerodynamics",
    cost: 1,
    needs: ["basicRocketry"],
    parts: ["Parachute", "Drogue Chute", "SM Nose Cone", "SM Angled Nose Cone"]
  },
  noseConeDesign: {
    name: "Nose Cone Design",
    cost: 8,
    needs: ["aerodynamics", "liquidRocketry"],
    parts: ["MD Nose Cone", "MD Angled Nose Cone"]
  },
  advancedAerodynamics: {
    name: "Advanced Aerodynamics",
    cost: 16,
    needs: ["noseConeDesign", "bigTanks"],
    parts: ["LG Nose Cone", "LG Angled Nose Cone"]
  },
  massiveAerodynamics: {
    name: "Massive Aerodynamics",
    cost: 30,
    needs: ["advancedAerodynamics", "unreasonablyLargeTanks"],
    parts: ["XL Nose Cone", "XL Angled Nose Cone"]
  },
  mediumSolids: {
    name: "Medium Solids",
    cost: 2,
    needs: ["basicRocketry"],
    parts: ["UK32 Booster"]
  },
  largeSolids: {
    name: "Large Solids",
    cost: 5,
    needs: ["mediumSolids"],
    parts: ["UR30 Booster"]
  },
  heavySolids: {
    name: "Heavy Solids",
    cost: 10,
    needs: ["largeSolids"],
    parts: ["UR60 Booster"]
  },
  colossalSolids: {
    name: "Colossal Solids",
    cost: 22,
    needs: ["heavySolids", "heavyLift"],
    parts: ["UR120 Booster"]
  },
  rudimentaryGuidance: {
    name: "Rudimentary Guidance",
    cost: 4,
    needs: ["basicRocketry"],
    features: ["sas"],
    parts: []
  },
  orbitalTracking: {
    name: "Orbital Tracking",
    cost: 8,
    needs: ["rudimentaryGuidance"],
    features: ["map"],
    parts: []
  },
  crewedFlight: {
    name: "Passenger Accommodation",
    cost: 8,
    needs: ["rudimentaryGuidance"],
    parts: ["Capsule"]
  },
  liquidRocketry: {
    name: "Liquid Rocketry",
    cost: 6,
    needs: ["basicRocketry"],
    parts: ["Basic Engine", "Tiny XS Fuel Tank", "Tiny SM Fuel Tank", "Tiny MD Fuel Tank", "MD Decoupler"]
  },
  heavierLifting: {
    name: "Standard Tankage",
    cost: 8,
    needs: ["liquidRocketry"],
    parts: ["Tiny LG Fuel Tank", "XS Fuel Tank", "SM Fuel Tank", "MD Fuel Tank", "LG Fuel Tank", "LG Decoupler"]
  },
  engineRefinements: {
    name: "Engine Refinements",
    cost: 10,
    needs: ["liquidRocketry"],
    parts: ["Upgraded Basic Engine"]
  },
  basicIgnitionSystems: {
    name: "Basic Reignition Systems",
    cost: 8,
    needs: ["engineRefinements"],
    parts: [],
    ignitionBonus: { "Basic Engine": 2, "Upgraded Basic Engine": 1 }
  },
  mediumEngines: {
    name: "Medium Engines",
    cost: 16,
    needs: ["engineRefinements", "heavierLifting"],
    parts: ["Bravo Engine"]
  },
  mediumIgnitionSystems: {
    name: "Medium Reignition Systems",
    cost: 12,
    needs: ["mediumEngines"],
    parts: [],
    ignitionBonus: { "Bravo Engine": 2 }
  },
  bigEngines: {
    name: "Big Engines",
    cost: 22,
    needs: ["mediumEngines"],
    parts: ["Alpha Engine", "Falcon-1 Engine"]
  },
  bigTanks: {
    name: "Big Tankage",
    cost: 14,
    needs: ["heavierLifting"],
    parts: ["XS Big Fuel Tank", "SM Big Fuel Tank", "MD Big Fuel Tank", "LG Big Fuel Tank"]
  },
  heavyLift: {
    name: "Heavy Lift Systems",
    cost: 18,
    needs: ["bigEngines", "bigTanks"],
    parts: ["XL Decoupler", "Large Base"]
  },
  unreasonablyLargeTanks: {
    name: "Unreasonably Large Tanks",
    cost: 40,
    needs: ["bigTanks", "heavyLift"],
    parts: [
      "XS Massive Fuel Tank", "SM Massive Fuel Tank", "MD Massive Fuel Tank",
      "LG Massive Fuel Tank", "Massive Base"
    ]
  },
  attitudeAdjustment: {
    name: "Attitude Adjustment",
    cost: 6,
    needs: ["liquidRocketry"],
    parts: ["Turbo Reactionwheel", "Large Turbo Reactionwheel"]
  },
  reactionControl: {
    name: "Reaction Control",
    cost: 8,
    needs: ["attitudeAdjustment"],
    parts: ["RCS Engine"]
  },
  precisionThrusters: {
    name: "Precision Thrusters",
    cost: 14,
    needs: ["reactionControl"],
    parts: ["Pup engine"]
  },
  heavyAttitude: {
    name: "Heavy Attitude Control",
    cost: 18,
    needs: ["attitudeAdjustment", "rudimentaryGuidance"],
    parts: ["Extra Large Turbo Reactionwheel"]
  },
  roomierPassengers: {
    name: "Roomier Passengers",
    cost: 28,
    needs: ["crewedFlight", "heavyThermal"],
    parts: ["Big Capsule"]
  },
  thermalProtection: {
    name: "Thermal Protection",
    cost: 12,
    needs: ["crewedFlight"],
    parts: ["Tiny Heat Shield", "Heat Shield"]
  },
  heavyThermal: {
    name: "Heavy Thermal Protection",
    cost: 18,
    needs: ["thermalProtection", "bigTanks"],
    parts: ["Big Heat Shield"]
  },
  massiveThermal: {
    name: "Massive Thermal Protection",
    cost: 30,
    needs: ["heavyThermal", "unreasonablyLargeTanks"],
    parts: ["Massive Heat Shield"]
  },
  thinAirLandings: {
    name: "Thin Air Landings",
    cost: 10,
    needs: ["heavierLifting"],
    oneOf: ["orbitalTracking", "crewedFlight"],
    parts: ["Mars Chute"]
  },
  hydroloxTanks: {
    name: "Cryogenic Storage",
    cost: 10,
    needs: ["heavierLifting"],
    parts: ["Hydrolox Tank", "SM Hydrolox Tank", "MD Hydrolox Tank", "LG Hydrolox Tank"]
  },
  vacuumEngineering: {
    name: "Vacuum Engineering",
    cost: 12,
    needs: ["engineRefinements", "hydroloxTanks"],
    parts: ["Vacuum Engine", "Stoat Engine"]
  },
  vacuumIgnitionSystems: {
    name: "Vacuum Reignition Systems",
    cost: 14,
    needs: ["vacuumEngineering"],
    parts: [],
    ignitionBonus: { "Vacuum Engine": 2, "Stoat Engine": 2 }
  },
  hydroloxRefinements: {
    name: "Hydrolox Refinements",
    cost: 18,
    needs: ["vacuumEngineering"],
    parts: ["Upgraded Vacuum Engine", "Heavy Vacuum Engine"]
  },
  hydroloxIgnitionSystems: {
    name: "Hydrolox Reignition Systems",
    cost: 18,
    needs: ["hydroloxRefinements"],
    parts: [],
    ignitionBonus: { "Heavy Vacuum Engine": 4 }
  },
  bigHydrolox: {
    name: "Big Hydrolox",
    cost: 12,
    needs: ["bigTanks", "hydroloxTanks"],
    parts: ["XS Big Hydrolox Tank", "SM Big Hydrolox Tank", "MD Big Hydrolox Tank", "LG Big Hydrolox Tank"]
  },
  rendezvous: {
    name: "Rendezvous And Docking",
    cost: 16,
    needs: ["vacuumEngineering", "reactionControl", "orbitalTracking"],
    parts: ["Docking Port"]
  },
  massiveHydrolox: {
    name: "Massive Hydrolox",
    cost: 25,
    needs: ["unreasonablyLargeTanks", "bigHydrolox"],
    parts: [
      "XS Massive Hydrolox Tank", "SM Massive Hydrolox Tank", "MD Massive Hydrolox Tank",
      "LG Massive Hydrolox Tank"
    ]
  },
  ionPropulsion: {
    name: "Ion Propulsion",
    cost: 80,
    needs: ["hydroloxRefinements", "heavyAttitude", "precisionThrusters"],
    parts: ["Ion Engine", "Xenon Tank"]
  },
  nuclearPropulsion: {
    name: "Nuclear Propulsion",
    cost: 90,
    needs: ["hydroloxRefinements", "ionPropulsion"],
    parts: ["Nuclear Thermal Engine"]
  },
  nuclearIgnitionSystems: {
    name: "Nuclear Reignition Systems",
    cost: 20,
    needs: ["nuclearPropulsion"],
    parts: [],
    ignitionBonus: { "Nuclear Thermal Engine": 2 }
  },
  advancedNuclearIgnitionSystems: {
    name: "Advanced Nuclear Reignition Systems",
    cost: 35,
    needs: ["nuclearIgnitionSystems"],
    parts: [],
    ignitionBonus: { "Nuclear Thermal Engine": 2, "Large Nuclear Thermal Engine": 2 }
  },
  heavyNuclearPropulsion: {
    name: "Heavy Nuclear Propulsion",
    cost: 120,
    needs: ["nuclearIgnitionSystems"],
    parts: ["Large Nuclear Thermal Engine"],
    gapScale: 0.25
  }
};

function downrangeOf(rocket) {
  const earth = getBody("Earth");
  const angle = radians(c.launchPadRotation);
  const dx = rocket.pos.x - earth.pos.x;
  const dy = rocket.pos.y - earth.pos.y;
  const along = (Math.sin(angle) * dx - Math.cos(angle) * dy) / (Math.hypot(dx, dy) || 1);
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
    goal: level => 1000 * 1.6 ** level,
    measure: rocket => readOnlyReaders.Altitude(rocket),
    title: m => `Ascend to ${format("distance", m.goal)} above ${m.body}`
  },
  speed: {
    once: true,
    pay: 1,
    bodies: { Earth: 1 },
    goal: level => Math.min(200 * 1.3 ** level, 10000),
    measure: rocket => readOnlyReaders.Speed(rocket),
    title: m => `Exceed ${format("speed", m.goal)} relative to ${m.body}`
  },
  orbit: {
    pay: 6,
    bodies: { Earth: 3 },
    goal: () => 140000 * 1.5 ** career.completed.filter(done => done.type === "orbit").length,
    measure: rocket => Number.isFinite(readOnlyReaders.Apoapsis(rocket)) ? readOnlyReaders.Periapsis(rocket) : 0,
    title: m => `Hold a ${kilometres(m.goal)} periapsis around ${m.body}, deliberately`
  },
  reach: {
    pay: 8,
    bodies: { Moon: 6, Mars: 12, Venus: 12, Mercury: 14, Ceres: 16, Jupiter: 18, Saturn: 20, Uranus: 22, Neptune: 24 },
    goal: () => 1,
    measure: () => 1,
    title: m => `Enter the sphere of influence of ${m.body}`
  },
  land: {
    pay: 12,
    bodies: { Moon: 8, Mars: 14, Venus: 16, Mercury: 18, Ceres: 20 },
    goal: () => 1,
    measure: rocket => (rocket.landed ? 1 : 0),
    title: m => `Land on ${m.body}, gently if possible`
  }
};

Object.assign(missionTypes, {
  space: {
    once: true,
    pay: 2,
    bodies: { Earth: 2 },
    goal: () => 100000,
    measure: rocket => readOnlyReaders.Altitude(rocket),
    title: m => `Reach space, ${kilometres(m.goal)} above ${m.body}`
  },
  apogee: {
    pay: 3,
    bodies: { Earth: 3 },
    goal: level => Math.min(200000 * 1.3 ** (level - 3), 300000000),
    measure: rocket => readOnlyReaders.Altitude(rocket),
    title: m => `Climb to ${kilometres(m.goal)} above ${m.body}`
  },
  downrangeShort: {
    once: true,
    pay: 2,
    bodies: { Earth: 2 },
    goal: () => 200000,
    measure: downrangeOf,
    title: m => `Fly ${kilometres(m.goal)} downrange of the pad`
  },
  downrangeLong: {
    once: true,
    pay: 4,
    bodies: { Earth: 3 },
    goal: () => 3000000,
    measure: downrangeOf,
    title: m => `Fly ${kilometres(m.goal)} downrange of the pad`
  },
  downrangeFar: {
    once: true,
    pay: 5,
    bodies: { Earth: 3 },
    goal: () => 4500000,
    measure: downrangeOf,
    title: m => `Fly ${kilometres(m.goal)} downrange of the pad`
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
    title: m => `Fly a crew to ${format("distance", m.goal)} above ${m.body}`
  },
  crewOrbit: {
    ...missionTypes.orbit,
    crewed: true,
    needs: ["crewSpace"],
    pay: 6,
    firstBonus: 8,
    bodies: { Earth: 0 },
    goal: () => 150000,
    title: m => `Put a crew in orbit around ${m.body}`
  },
  crewFlyby: {
    ...missionTypes.reach,
    crewed: true,
    needs: ["crewOrbit"],
    pay: 10,
    firstBonus: 8,
    bodies: { Moon: 0 },
    title: m => `Fly a crew through the sphere of influence of ${m.body}`
  },
  crewLand: {
    ...missionTypes.land,
    crewed: true,
    needs: {
      Moon: ["crewFlyby", "land:Moon"],
      Mars: ["crewLand:Moon", "land:Mars"],
      Venus: ["crewLand:Mars", "land:Venus"]
    },
    pay: { Moon: 16, Mars: 28, Venus: 45 },
    firstBonus: 8,
    bodies: { Moon: 0, Mars: 0, Venus: 0 },
    title: m => `Land a crew on ${m.body}, and get them back`
  },
  dip: {
    needs: {
      Jupiter: ["reach:Jupiter"],
      Saturn: ["reach:Saturn"],
      Uranus: ["reach:Uranus"],
      Neptune: ["reach:Neptune"]
    },
    pay: 10,
    bodies: { Jupiter: 19, Saturn: 21, Uranus: 23, Neptune: 25 },
    goal: () => 0.1,
    measure: rocket => {
      const body = getBody(rocket.parentBody);
      return densityAt(body, distanceTo(rocket, body) - body.size);
    },
    title: m => `Dip a probe into the atmosphere of ${m.body}`
  }
});

const milestoneSteps = { 1: 1, 5: 2, 10: 3, 25: 5, 100: 10 };
const milestoneBodies = ["Earth", "Speed", "Moon", "Mars", "Venus", "Mercury", "Ceres", "Jupiter", "Saturn", "Uranus", "Neptune"];

const milestoneTests = {
  hop: rocket => readOnlyReaders.Altitude(rocket) >= 1000,
  space: rocket => readOnlyReaders.Altitude(rocket) >= 100000,
  flyby: () => true,
  speed: (rocket, spec) => readOnlyReaders.Speed(rocket) >= spec.threshold,
  orbit: rocket => {
    const body = getBody(rocket.parentBody);
    const orbit = rocketOrbit(rocket);
    return !rocket.landed && Number.isFinite(orbit.apoapsis) &&
      orbit.periapsis >= Math.max(body.atmosphereHeight || 0, 20000) + 5000;
  },
  land: rocket => !!rocket.landed && (rocket.parentBody !== "Earth" || !!rocket.achieved["hop:Earth"]),
  dip: rocket => {
    const body = getBody(rocket.parentBody);
    return densityAt(body, distanceTo(rocket, body) - body.size) >= 0.1;
  }
};

const milestoneKinds = {
  hop: { label: "Leave the ground", test: "hop", once: true, science: { Earth: 8 } },
  space: { label: "Reach space", test: "space", once: true, science: { Earth: 12 } },
  flyby: {
    label: "Flyby",
    test: "flyby",
    science: { Moon: 20, Mars: 20, Venus: 20, Mercury: 20, Ceres: 20, Jupiter: 20, Saturn: 20, Uranus: 20, Neptune: 20 }
  },
  orbit: {
    label: "Orbit",
    test: "orbit",
    science: { Earth: 12, Moon: 24, Mars: 24, Venus: 24, Mercury: 24, Ceres: 24, Jupiter: 24, Saturn: 24, Uranus: 24, Neptune: 24 }
  },
  land: { label: "Land", test: "land", science: { Earth: 6, Moon: 30, Mars: 30, Venus: 30, Mercury: 30, Ceres: 30 } },
  dip: { label: "Atmosphere dip", test: "dip", science: { Jupiter: 25, Saturn: 25, Uranus: 30, Neptune: 30 } },
  crewSpace: { label: "Crew to space", test: "space", crewed: true, science: { Earth: 12 } },
  crewOrbit: { label: "Crew in orbit", test: "orbit", crewed: true, science: { Earth: 20, Moon: 35, Mars: 40, Venus: 45 } },
  crewFlyby: { label: "Crewed flyby", test: "flyby", crewed: true, science: { Moon: 30, Mars: 35, Venus: 40 } },
  crewLand: { label: "Crewed landing", test: "land", crewed: true, science: { Moon: 45, Mars: 75, Venus: 110 } },
  crewReturn: { label: "Crew home from", crewed: true, science: { Moon: 40, Mars: 60, Venus: 90 } }
};

for (const [threshold, science, once] of [
  [3000, 4, true], [5000, 6, true], [10000, 25], [50000, 40], [250000, 60], [1000000, 90], [10000000, 150]
]) {
  milestoneKinds["speed" + threshold] = {
    label: `Reach ${(threshold / 1000).toLocaleString("en-US")} km/s`,
    test: "speed",
    threshold,
    global: true,
    once: !!once,
    science: { Speed: science }
  };
}

function milestoneTiers(kind) {
  return milestoneKinds[kind].once ? { 1: 1 } : milestoneSteps;
}

function milestoneNext(count, kind) {
  return Object.keys(milestoneTiers(kind)).map(Number).find(step => step > count);
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
    const tierTotal = Object.values(milestoneTiers(kind)).reduce((a, b) => a + b, 0);
    return sum + Math.round(Object.values(milestoneKinds[kind].science).reduce((a, b) => a + b, 0) * tierTotal * difficultyMult("science"));
  }, 0);
}

function awardMilestone(kind, body, rocket) {
  const key = kind + ":" + body;
  rocket.achieved[key] = true;
  const entry = (career.milestones[key] ||= { count: 0 });
  entry.count++;
  const science = Math.round((milestoneTiers(kind)[entry.count] || 0) * milestoneKinds[kind].science[body] * difficultyMult("science"));
  career.science += science;
  saveCareer();
  launchToast(`${milestoneKinds[kind].label}${body === "Speed" ? "" : " " + body} #${entry.count}${science ? " +" + science : ""}`);
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
    if (!rocket.achieved[kind + ":" + where] && milestoneTests[spec.test](rocket, spec)) {
      awardMilestone(kind, where, rocket);
    }
  }
  if (!rocket.landed) {
    rocket.returnCounted = false;
  } else if (crewed && rocket.parentBody === "Earth" && !rocket.returnCounted) {
    rocket.returnCounted = true;
    for (const body in milestoneKinds.crewReturn.science) {
      if (["crewFlyby", "crewOrbit", "crewLand"].some(kind => rocket.achieved[kind + ":" + body])) {
        awardMilestone("crewReturn", body, rocket);
      }
    }
  }
}

const featureNames = { sas: "Stability assist (SAS)", map: "Map view" };

function hasFeature(feature) {
  return !careerMode || career.techs.some(id => (techTree[id].features || []).includes(feature));
}

function partAvailable(part) {
  if (!careerMode) {
    return true;
  }
  return career.techs.some(id => techTree[id].parts.includes(part.name));
}

function maxIgnitions(partName) {
  const def = partAPI.list().find(p => p.name === partName);
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
  return partAvailable(inst.part) ? { alpha } : { alpha: alpha * 0.4, recolor: "#777" };
}

function perBody(value, body) {
  return typeof value === "object" ? value[body] : value;
}

function missionDone(need) {
  return career.completed.some(done =>
    need.includes(":") ? need === `${done.type}:${done.body ?? "Earth"}` : done.type === need
  );
}

function missionUnlocked(type, body) {
  const needs = missionTypes[type].needs;
  return ((Array.isArray(needs) ? needs : needs?.[body]) || []).every(missionDone);
}

function makeMission(type, body, level) {
  const mission = {
    type,
    body,
    goal: missionTypes[type].goal(level),
    crewed: !!missionTypes[type].crewed,
    funds: Math.round(2000000 * perBody(missionTypes[type].pay, body) * 1.15 ** level)
  };
  mission.title = missionTypes[type].title(mission);
  return mission;
}

function generateMissions(count) {
  const level = new Set(career.completed.map(done => `${done.type}:${done.body ?? "Earth"}`)).size;
  const pool = [];
  for (const type in missionTypes) {
    for (const body in missionTypes[type].bodies) {
      const spent = missionTypes[type].once && missionDone(type + ":" + body);
      if (missionTypes[type].bodies[body] <= level && missionUnlocked(type, body) && !spent) {
        pool.push({ type, body });
      }
    }
  }
  return shuffle(pool).slice(0, count).map(pick => makeMission(pick.type, pick.body, level));
}

const crewParts = ["Capsule", "Big Capsule"];

function hasCrew(rocket) {
  return rocket.stack.parts.some(entry => crewParts.includes(entry.part.name));
}

function checkMission() {
  const mission = career.active;
  if (!mission) {
    return;
  }
  if (mission.rocketId && !rockets.some(rocket => rocket.id === mission.rocketId)) {
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
    if (rocket.id === mission.rocketId && rocket.landed && rocket.parentBody === "Earth") {
      completeMission(mission);
    }
  } else if (rocket.parentBody === mission.body && missionTypes[mission.type].measure(rocket) >= mission.goal) {
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
  return career.completed.some(done => done.type === mission.type && (done.body ?? "Earth") === mission.body);
}

function fundsPay(mission) {
  const bonus = missionTypes[mission.type].firstBonus || 1;
  const base = isRepeat(mission) ? mission.funds : mission.funds * bonus;
  return Math.round(base * difficultyMult("funds"));
}

function completeMission(mission) {
  balance += fundsPay(mission);
  career.completed.push({ type: mission.type, body: mission.body, title: mission.title });
  career.active = null;
  career.offers = generateMissions(3);
  saveCareer();
  launchToast("Mission complete");
}

function failMission(mission) {
  const penalty = Math.round(fundsPay(mission) / 2);
  balance -= penalty;
  career.active = null;
  career.offers = generateMissions(3);
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
    const isMissionVessel = mission.rocketId ? rocket.id === mission.rocketId : rocket.id === target;
    if (isMissionVessel && hasCrew(rocket)) {
      failMission(mission);
      return;
    }
  }
}

function recoveryValue(rocket) {
  const partsWorth = rocket.stack.parts.reduce((sum, entry) => sum + partCost(entry.part), 0);
  return Math.round(partsWorth * recoveryRate);
}

function canRecover(rocket) {
  return !!rocket && !!rocket.stack && !!rocket.flown && !!rocket.landed && rocket.parentBody === "Earth";
}

function recoverRocket() {
  const rocket = flyingRocket();
  if (!canRecover(rocket)) {
    return;
  }
  const unit = u.careerMode.modules["Career Module"].Unit;
  const value = recoveryValue(rocket);
  balance += value;
  rockets = rockets.filter(other => other !== rocket);
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
  const owns = id => career.techs.includes(id);
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
    localStorage.setItem("weborbit-career", JSON.stringify({ ...career, balance }));
  } catch (err) {
    console.warn(`couldn't save career: ${err.message}`);
  }
}

function cleanCareer() {
  const renamed = { biggerSolids: ["largeSolids"], biggerBoosters: ["bigEngines", "bigTanks", "heavyLift"] };
  career.techs = [...new Set(career.techs.flatMap(id => renamed[id] || [id]).filter(id => techTree[id]))];
  if (!career.techs.includes("basicRocketry")) {
    career.techs.push("basicRocketry");
  }
  career.milestones ||= {};
  career.launches ||= 0;
  career.difficulty ||= "Normal";
  career.loans = { ...defaultLoans(), ...career.loans };
  career.offers = career.offers.filter(offer => !(missionTypes[offer.type]?.once && missionDone(offer.type + ":" + offer.body)));
  if (!career.offers.length) {
    career.offers = generateMissions(3);
  }
}

function careerHasProgress() {
  return career.completed.length > 0 || career.science > 0 || career.techs.length > 1 || Object.keys(career.milestones).length > 0;
}

function restoreCareer(saved) {
  for (const key in career) {
    delete career[key];
  }
  Object.assign(career, { completed: [], techs: ["basicRocketry"], science: 0, offers: [], active: null, milestones: {}, launches: 0, loans: {}, difficulty: "Normal" }, saved);
  cleanCareer();
  saveCareer();
}

function loadCareer() {
  try {
    const { balance: savedBalance, ...saved } = JSON.parse(localStorage.getItem("weborbit-career")) || {};
    Object.assign(career, saved);
    cleanCareer();
    if (savedBalance !== undefined) {
      balance = savedBalance;
    }
  } catch (err) {
    console.warn(`couldn't load career: ${err.message}`);
  }
  if (!career.offers.length) {
    career.offers = generateMissions(3);
  }
}

function careerClick() {
  const wasOpen = careerMissionsOpen || techTreeOpen || milestonesOpen || loansOpen;
  if (GUIAPI.clicked("career-missions")) {
    careerMissionsOpen = !careerMissionsOpen;
    techTreeOpen = false;
    milestonesOpen = false;
    loansOpen = false;
  } else if (GUIAPI.clicked("career-tech")) {
    techTreeOpen = !techTreeOpen;
    careerMissionsOpen = false;
    milestonesOpen = false;
    loansOpen = false;
    resetTechView();
  } else if (GUIAPI.clicked("career-milestones")) {
    milestonesOpen = !milestonesOpen;
    careerMissionsOpen = false;
    techTreeOpen = false;
    loansOpen = false;
  } else if (GUIAPI.clicked("career-loans")) {
    loansOpen = !loansOpen;
    careerMissionsOpen = false;
    techTreeOpen = false;
    milestonesOpen = false;
  } else if (GUIAPI.clicked("missions-close")) {
    careerMissionsOpen = false;
  } else if (GUIAPI.clicked("milestones-close")) {
    milestonesOpen = false;
  } else if (GUIAPI.clicked("tech-close")) {
    techTreeOpen = false;
  } else if (GUIAPI.clicked("loans-close")) {
    loansOpen = false;
  } else if (GUIAPI.clicked("mission-abandon")) {
    career.active = null;
    career.offers = generateMissions(3);
    saveCareer();
  } else {
    career.offers.forEach((offer, i) => {
      if (GUIAPI.clicked("mission-accept-" + i)) {
        if (!inVab) {
          launchToast("Accept contracts in the VAB");
        } else {
          career.active = { ...offer, since: career.launches };
          saveCareer();
          careerMissionsOpen = false;
        }
      }
    });
    for (const key in loanTypes) {
      if (GUIAPI.clicked("loan-take-" + key)) {
        takeLoan(key);
      } else if (GUIAPI.clicked("loan-pay-" + key)) {
        payLoan(key);
      }
    }
    techClick = null;
    techPress = { x: mouseX, y: mouseY };
    for (const id in techTree) {
      if (GUIAPI.clicked("tech-" + id)) {
        techClick = id;
      }
    }
  }
  return wasOpen || careerMissionsOpen || techTreeOpen || milestonesOpen || loansOpen;
}

function drawMissions() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  textSize(18);
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "missions" }, undefined, ui => {
    ui.label("Missions", { size: 28, align: CENTER, height: 40 });
    ui.label(`Completed ${career.completed.length}   Science ${career.science}`, { align: CENTER });
    if (career.active) {
      const status = career.active.rocketId ? "Goal reached, land back on Earth" : career.active.title;
      ui.label(`Active: ${status}`, { color: "#ffd479", align: CENTER });
      ui.button(0, 0, 350, 50, { id: "mission-abandon", ...menuStyle }, "Abandon");
    }
    if (!inVab) {
      ui.label("Return to the VAB to accept a contract", { color: "#ff9d00", align: CENTER });
    }
    career.offers.forEach((offer, i) => {
      ui.button(0, 0, 550, 60, { id: "mission-accept-" + i, ...(inVab ? menuStyle : menuStyleDisabled) }, offer.title);
      const home = offer.crewed ? "   crewed, land back on Earth" : "";
      ui.label(`${unit}${fundsPay(offer).toLocaleString("en-US")}${home}`, {
        size: 13,
        color: "#aaa",
        align: CENTER
      });
    });
    ui.button(0, 0, 350, 60, { id: "missions-close", ...menuStyle }, "Close");
  });
}

function drawLoans() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  textSize(18);
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "loans" }, undefined, ui => {
    ui.label("Loans", { size: 28, align: CENTER, height: 40 });
    ui.label(`Balance ${unit}${Math.round(balance).toLocaleString("en-US")}`, {
      align: CENTER,
      color: balance < 0 ? "#ff6b6b" : "#8be08b"
    });
    for (const key in loanTypes) {
      const type = loanTypes[key];
      const loan = career.loans[key];
      const unlocked = loanUnlocked(key);
      ui.label(`${type.bank}`, { align: CENTER, size: 20 });
      if (!unlocked) {
        ui.label("Locked, keep progressing your career to qualify", { align: CENTER, color: "#777" });
      } else if (loan.taken) {
        const launchesLeft = Math.max(0, loan.dueAtLaunch - career.launches);
        ui.label(`Owe ${unit}${loan.owed.toLocaleString("en-US")}, due in ${launchesLeft} launch${launchesLeft === 1 ? "" : "es"}`, {
          align: CENTER,
          color: "#ffd479"
        });
        ui.button(0, 0, 350, 50, { id: "loan-pay-" + key, ...(balance >= loan.owed ? menuStyle : menuStyleDisabled) }, "Pay Now");
      } else {
        ui.label(`Borrow ${unit}${type.amount.toLocaleString("en-US")}, repay ${unit}${Math.round(type.amount * type.repay).toLocaleString("en-US")} within ${type.termLaunches} launches`, {
          align: CENTER,
          color: "#aaa"
        });
        ui.button(0, 0, 350, 50, { id: "loan-take-" + key, ...menuStyle }, "Take Loan");
      }
    }
    ui.button(0, 0, 350, 60, { id: "loans-close", ...menuStyle }, "Close");
  });
}

const techView = { x: 0, y: 0, zoom: 1 };
const techNode = { w: 250, h: 74, minGap: 300, gapY: 120, pxPerScience: 24, cell: 10, pad: 8 };
let techLayoutCache = null;
const techWires = {};
let techClick = null;
let techPress = { x: 0, y: 0 };

function routeWire(from, to, boxes) {
  const cell = techNode.cell;
  const startX = from.x + techNode.w;
  const startY = from.y + techNode.h / 2;
  const endX = to.x;
  const endY = to.y + techNode.h / 2;
  const alignY = (techNode.h / 2) % cell;
  const originX = Math.min(...boxes.map(b => b.x)) - cell * 6;
  const originY = alignY + Math.floor((Math.min(...boxes.map(b => b.y)) - cell * 8 - alignY) / cell) * cell;
  const cols = Math.ceil((Math.max(...boxes.map(b => b.x)) + techNode.w + cell * 12 - originX) / cell);
  const rows = Math.ceil((Math.max(...boxes.map(b => b.y)) + techNode.h + cell * 8 - originY) / cell);
  const blocked = new Uint8Array(cols * rows);
  for (const box of boxes.filter(b => b !== from && b !== to)) {
    const c0 = Math.floor((box.x - techNode.pad - originX) / cell);
    const c1 = Math.ceil((box.x + techNode.w + techNode.pad - originX) / cell);
    const r0 = Math.floor((box.y - techNode.pad - originY) / cell);
    const r1 = Math.ceil((box.y + techNode.h + techNode.pad - originY) / cell);
    for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) {
        blocked[r * cols + c] = 1;
      }
    }
  }
  const startCol = Math.ceil((startX + techNode.pad - originX) / cell);
  const endCol = Math.floor((endX - techNode.pad - originX) / cell);
  const startRow = Math.round((startY - originY) / cell);
  const endRow = Math.round((endY - originY) / cell);
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const key = (c, r, d) => (r * cols + c) * 4 + d;
  const cost = new Map([[key(startCol, startRow, 0), 0]]);
  const back = new Map();
  const open = [];
  const push = node => {
    open.push(node);
    let i = open.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (open[parent].f <= open[i].f) break;
      [open[parent], open[i]] = [open[i], open[parent]];
      i = parent;
    }
  };
  const pop = () => {
    const top = open[0];
    const last = open.pop();
    if (open.length) {
      open[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let small = i;
        if (left < open.length && open[left].f < open[small].f) small = left;
        if (right < open.length && open[right].f < open[small].f) small = right;
        if (small === i) break;
        [open[small], open[i]] = [open[i], open[small]];
        i = small;
      }
    }
    return top;
  };
  push({ c: startCol, r: startRow, d: 0, g: 0, f: Math.abs(endCol - startCol) + Math.abs(endRow - startRow) });
  let goal = null;
  while (open.length) {
    const cur = pop();
    if (cur.g > cost.get(key(cur.c, cur.r, cur.d))) {
      continue;
    }
    if (cur.c === endCol && cur.r === endRow && cur.d === 0) {
      goal = cur;
      break;
    }
    dirs.forEach(([dc, dr], d) => {
      const c = cur.c + dc;
      const r = cur.r + dr;
      if (c < 0 || r < 0 || c >= cols || r >= rows || blocked[r * cols + c]) {
        return;
      }
      if (Math.abs(d - cur.d) === 2) {
        return;
      }
      const g = cur.g + 1 + (d === cur.d ? 0 : 8);
      const k = key(c, r, d);
      if (g < (cost.get(k) ?? Infinity)) {
        cost.set(k, g);
        back.set(k, key(cur.c, cur.r, cur.d));
        push({ c, r, d, g, f: g + Math.abs(endCol - c) + Math.abs(endRow - r) });
      }
    });
  }
  const cellPoint = (c, r) => ({ x: originX + c * cell, y: originY + r * cell });
  const points = [];
  if (goal) {
    let k = key(goal.c, goal.r, goal.d);
    while (k !== undefined) {
      const d = k % 4;
      const index = (k - d) / 4;
      points.push(cellPoint(index % cols, Math.floor(index / cols)));
      k = back.get(k);
    }
    points.reverse();
  } else {
    const mid = (startX + endX) / 2;
    points.push({ x: mid, y: startY }, { x: mid, y: endY });
  }
  const corners = points.filter((point, i) => {
    const last = points[i - 1];
    const next = points[i + 1];
    return !last || !next || !((last.x === point.x && next.x === point.x) || (last.y === point.y && next.y === point.y));
  });
  const path = [{ x: startX, y: startY }, ...corners, { x: endX, y: endY }];
  path[1] = { x: path[1].x, y: startY };
  path[path.length - 2] = { x: path[path.length - 2].x, y: endY };
  return path;
}

function techLayout() {
  if (techLayoutCache) {
    return techLayoutCache;
  }
  const ids = Object.keys(techTree);
  const x = {};
  const xOf = id => {
    if (x[id] === undefined) {
      const parents = techParents(id);
      x[id] = parents.length
        ? Math.max(...parents.map(need => {
            const reach = Math.max(techNode.minGap, (techTree[id].cost - techTree[need].cost) * techNode.pxPerScience) * (techTree[id].gapScale ?? 1);
            return xOf(need) + reach;
          }))
        : 0;
    }
    return x[id];
  };
  ids.forEach(xOf);
  const layout = {};
  for (const id of [...ids].sort((a, b) => x[a] - x[b])) {
    const needs = techParents(id);
    const want = needs.length ? needs.reduce((sum, need) => sum + layout[need].y, 0) / needs.length : 0;
    const home = Math.round(want / techNode.gapY);
    const offsets = [0];
    for (let step = 1; step <= 20; step++) {
      offsets.push(step, -step);
    }
    const row = offsets.map(offset => home + offset).find(candidate =>
      Object.values(layout).every(other =>
        Math.abs(other.x - x[id]) >= techNode.w + 40 || Math.abs(other.y - candidate * techNode.gapY) >= techNode.gapY - 1
      )
    );
    layout[id] = { x: x[id], y: row * techNode.gapY };
  }
  const boxes = Object.values(layout);
  for (const id of ids) {
    for (const need of techParents(id)) {
      techWires[need + ">" + id] = routeWire(layout[need], layout[id], boxes);
    }
  }
  techLayoutCache = layout;
  return layout;
}

function resetTechView() {
  const nodes = Object.values(techLayout());
  const spanX = Math.max(...nodes.map(at => at.x)) + techNode.w;
  const top = Math.min(...nodes.map(at => at.y));
  const spanY = Math.max(...nodes.map(at => at.y)) + techNode.h - top;
  techView.zoom = constrain(Math.min((width - 120) / spanX, (height - 150) / spanY), 0.2, 1);
  techView.x = 60;
  techView.y = height / 2 + 30 - (top + spanY / 2) * techView.zoom;
}

function zoomTechTree(factor) {
  const next = constrain(techView.zoom * factor, 0.2, 2.5);
  const ratio = next / techView.zoom;
  techView.x = mouseX - (mouseX - techView.x) * ratio;
  techView.y = mouseY - (mouseY - techView.y) * ratio;
  techView.zoom = next;
}

function drawMilestones() {
  textSize(18);
  GUIAPI.panel(width * 0.88, height * 0.88, { dim: true, borderColor: "#555", id: "milestones" }, undefined, ui => {
    ui.label("Milestones", { size: 28, align: CENTER, height: 40 });
    ui.label(`Science from milestones ${milestoneEarned().toLocaleString("en-US")} of ${milestonePossible().toLocaleString("en-US")}`, {
      align: CENTER,
      color: "#8be08b"
    });
    ui.label("Complete milestones to unlock science! You can get even more science from doing a milestone for the 5th, 10th, 25th, and 100th time!", {
      size: 13,
      align: CENTER,
      color: "#8a94a3"
    });
    for (const body of milestoneBodies) {
      ui.label(body === "Speed" ? "Speed records" : body, { size: 22, color: "#ffd479", height: 34 });
      for (const kind in milestoneKinds) {
        const base = milestoneKinds[kind].science[body];
        if (base === undefined) {
          continue;
        }
        const count = career.milestones[kind + ":" + body]?.count || 0;
        const next = milestoneNext(count, kind);
        const row = ui.row(24);
        push();
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(14);
        fill(count ? "#fff" : "#8a94a3");
        text(`${milestoneKinds[kind].label}${kind === "crewReturn" ? " " + body : ""}${milestoneKinds[kind].once ? " (one-time)" : ""}`, row.x + 8, row.y + 12);
        text(`${count} ${count === 1 ? "visit" : "visits"}`, row.x + row.sx * 0.3, row.y + 12);
        const barX = row.x + row.sx * 0.42;
        const barW = row.sx * 0.24;
        fill("#2b3038");
        rect(barX, row.y + 6, barW, 12, 4);
        fill(next ? "#5aa9ff" : "#ffd43b");
        rect(barX, row.y + 6, barW * (next ? count / next : 1), 12, 4);
        fill(next ? "#aab4c3" : "#ffd43b");
        text(next ? `visit ${next}: +${Math.round(base * milestoneTiers(kind)[next] * difficultyMult("science"))} science` : (milestoneKinds[kind].once ? "claimed" : "every tier claimed"), barX + barW + 14, row.y + 12);
        pop();
      }
    }
    ui.button(0, 10, 350, 50, { id: "milestones-close", ...menuStyle }, "Close");
  });
}

const techZones = [
  { label: "Beginnings", ids: ["basicRocketry", "mediumSolids", "liquidRocketry", "rudimentaryGuidance", "aerodynamics"] },
  { label: "Standard Tankage", ids: ["heavierLifting", "engineRefinements", "attitudeAdjustment", "crewedFlight", "largeSolids"] },
  { label: "Heavy Lift", ids: ["bigTanks", "mediumEngines", "bigEngines", "heavyLift", "unreasonablyLargeTanks", "heavySolids", "colossalSolids"] },
  { label: "Vacuum", ids: ["hydroloxTanks", "vacuumEngineering", "hydroloxRefinements", "bigHydrolox", "massiveHydrolox"] },
  { label: "Nuclear Propulsion", ids: ["ionPropulsion", "nuclearPropulsion", "nuclearIgnitionSystems", "advancedNuclearIgnitionSystems", "heavyNuclearPropulsion"] }
];

function drawTechZones(layout, z) {
  textAlign(CENTER, TOP);
  fill("#ffffff30");
  const placed = [];
  for (const zone of techZones) {
    const points = zone.ids.filter(id => layout[id]).map(id => layout[id]);
    if (!points.length) {
      continue;
    }
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const overlapping = Object.values(layout).filter(p => p.x <= maxX + techNode.w && p.x + techNode.w >= minX);
    const minY = Math.min(...overlapping.map(p => p.y));
    const size = Math.max(10, 64 * z);
    textSize(size);
    const cx = techView.x + ((minX + maxX) / 2 + techNode.w / 2) * z;
    const w = textWidth(zone.label);
    const h = size * 1.2;
    const top = techView.y + minY * z - size - 20;
    let box = { x: cx - w / 2, y: top, w, h };
    let moved = true;
    while (moved) {
      moved = false;
      for (const other of placed) {
        const overlapX = box.x < other.x + other.w && box.x + box.w > other.x;
        const overlapY = box.y < other.y + other.h && box.y + box.h > other.y;
        if (overlapX && overlapY) {
          box.y = other.y - box.h - 10;
          moved = true;
        }
      }
    }
    placed.push(box);
    text(zone.label, cx, box.y);
  }
}

function drawTechTree() {
  const layout = techLayout();
  const z = techView.zoom;
  GUIAPI.block(0, 0, width, height, GUIAPI.order++);
  noStroke();
  fill("#0b0e13");
  rect(0, 0, width, height);
  drawTechZones(layout, z);

  const box = id => ({
    x: techView.x + layout[id].x * z,
    y: techView.y + layout[id].y * z,
    w: techNode.w * z,
    h: techNode.h * z
  });
  noFill();
  strokeWeight(Math.max(1, 2 * z));
  for (const id in techTree) {
    for (const need of techParents(id)) {
      const required = techTree[id].needs.includes(need);
      const owned = career.techs.includes(need);
      stroke(required ? (owned ? "#ffd43b" : "#7a6a2a") : (owned ? "#5aa9ff" : "#3a4250"));
      beginShape();
      for (const point of techWires[need + ">" + id]) {
        vertex(techView.x + point.x * z, techView.y + point.y * z);
      }
      endShape();
    }
  }

  textSize(Math.max(2, 16 * z));
  for (const id in techTree) {
    const tech = techTree[id];
    const b = box(id);
    if (b.x > width || b.y > height || b.x + b.w < 0 || b.y + b.h < 0) {
      continue;
    }
    const have = career.techs.includes(id);
    const open = techOpen(tech);
    const unlocksContract = tech.parts.some(part => crewParts.includes(part));
    const style = unlocksContract
      ? { baseColor: "#8a6d1f", hoverColor: "#ab8a2a" }
      : have
      ? { baseColor: "#1f6b2f", hoverColor: "#2f8f45" }
      : open
        ? { baseColor: "#1f4f8f", hoverColor: "#2a6ac0" }
        : { baseColor: "#2b3038", hoverColor: "#2b3038" };
    GUIAPI.button(b.x, b.y, b.w, b.h, {
      id: "tech-" + id,
      ...style,
      tooltip: [
        tech.name,
        ...(unlocksContract ? ["  $ unlocks a crewed contract"] : []),
        ...(tech.features || []).map(f => "  " + featureNames[f]),
        ...tech.parts.map(part => "  " + part),
        ...Object.entries(tech.ignitionBonus || {}).map(([part, bonus]) => `  +${bonus} ignitions: ${part}`),
        ...(tech.needs.length ? ["needs " + tech.needs.map(need => techTree[need].name).join(", ")] : []),
        ...(tech.oneOf ? ["and one of " + tech.oneOf.map(need => techTree[need].name).join(", ")] : [])
      ]
    }, `${unlocksContract ? "$ " : ""}${tech.name}\n${have ? "researched" : tech.cost + " science"}`);
  }

  noStroke();
  fill("#0b0e13ee");
  rect(0, 0, width, 70);
  fill("#fff");
  textAlign(LEFT, CENTER);
  textSize(24);
  text(`Tech Tree   Science ${career.science}`, 24, 35);
  textAlign(RIGHT, CENTER);
  textSize(13);
  fill("#8a94a3");
  textAlign(LEFT, BASELINE);
  textSize(18);
  GUIAPI.button(width - 150, 15, 130, 40, { id: "tech-close", ...menuStyle }, "Close");
  GUIAPI.drawTooltip();
  cursor(mouseIsPressed ? "grabbing" : "grab");
}

function drawMap() {
  background("#05060a");
  const ship = flyingRocket();
  const anchor = ship ? ship.pos : camera.pos;
  const cx = anchor.x + mapPan.x;
  const cy = anchor.y + mapPan.y;
  const mapX = (p) => width / 2 + (p.x - cx) * mapScale;
  const mapY = (p) => height / 2 + (p.y - cy) * mapScale;

  noFill();
  stroke("#ffffff33");
  strokeWeight(1);
  for (const body of planets) {
    if (!body.parentBody) {
      continue;
    }
    const e = body.orbitEccentricity || 0;
    const ring = body.orbitRadius * mapScale;
    const parent = getBody(body.parentBody);
    if (ring < width * 20) {
      // the parent is a focus of the ellipse, not its centre
      ellipse(
        mapX(parent.pos) - ring * e,
        mapY(parent.pos),
        ring * 2,
        ring * 2 * Math.sqrt(1 - e * e)
      );
    }
  }

  for (const rocket of rockets) {
    drawRocketOrbit(rocket, mapX, mapY);
  }

  textAlign(CENTER, TOP);
  textSize(12);
  for (const body of planets) {
    const x = mapX(body.pos);
    const y = mapY(body.pos);
    const r = Math.max(body.size * mapScale, 4);
    if (x < -r || x > width + r || y < -r || y > height + r) {
      continue;
    }
    const img = textures[body.texture];
    if (img) {
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.arc(x, y, r, 0, TWO_PI);
      drawingContext.clip();
      imageMode(CENTER);
      image(img, x, y, r * 2, r * 2);
      drawingContext.restore();
    } else {
      noStroke();
      fill(body.fallbackColor || "#888");
      circle(x, y, r * 2);
    }
    noStroke();
    fill("#ccc");
    text(body.id, x, y + r + 4);
  }

  drawTransfer(ship, mapX, mapY);
  drawDockPlan(ship, mapX, mapY);

  for (const rocket of rockets) {
    const x = mapX(rocket.pos);
    const y = mapY(rocket.pos);
    noStroke();
    fill(rocket.id === target ? "#5ccfff" : rocket.id === rendezvousTarget ? "#ffb347" : "#8888aa");
    if (rocket.id === target) {
      push();
      translate(x, y);
      rotate(rocket.angle - HALF_PI);
      triangle(9, 0, -6, -6, -6, 6);
      pop();
    } else {
      circle(x, y, 7);
    }
    fill("#ccc");
    text(rocket.id, x, y + 10);
  }
  textAlign(LEFT, BASELINE);

  const mb = vabButton();
  GUIAPI.button(mb.x, mb.y, mb.size, mb.size, {
    id: "map-fly",
    baseColor: "#1f4f8f",
    hoverColor: "#2a6ac0",
    activeColor: "#173d70"
  }, "Fly");
  let mapY2 = mb.y + mb.size + 10;
  if (mapPan.x || mapPan.y) {
    GUIAPI.button(mb.x, mapY2, mb.size, mb.size, {
      id: "map-recenter",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: ["Back to the ship"]
    }, "◎");
    GUIAPI.drawTooltip();
    mapY2 += mb.size + 10;
  }

  const burn = pendingBurnWait(ship);
  if (warpUntil !== null) {
    const wb = { x: width - mb.size * 2.6 - 20, y: mapY2, w: mb.size * 2.6, h: mb.size };
    GUIAPI.button(wb.x, wb.y, wb.w, wb.h, {
      id: "map-warp-cancel",
      baseColor: "#7a2a2a",
      hoverColor: "#a03c3c",
      activeColor: "#5e1f1f"
    }, `Warping… ${formatTime(Math.max(warpUntil - t, 0))}`);
  } else if (burn !== null) {
    const wb = { x: width - mb.size * 2.6 - 20, y: mapY2, w: mb.size * 2.6, h: mb.size };
    GUIAPI.button(wb.x, wb.y, wb.w, wb.h, {
      id: "map-warp-burn",
      baseColor: "#8f5a1f",
      hoverColor: "#c07a2a",
      activeColor: "#70481a",
      tooltip: [`Warp ${formatTime(burn.seconds)} to the ${burn.label}`]
    }, `⏩ Warp to ${burn.label}`);
    GUIAPI.drawTooltip();
  }
  cursor(mouseIsPressed ? "grabbing" : "grab");
}

function pendingBurnWait(ship) {
  if (rendezvousTarget) {
    const node = activeNode(ship);
    if (!node || !Number.isFinite(node.t) || Math.abs(node.dv) < 0.5) {
      return null;
    }
    const seconds = node.t - t;
    return { seconds, label: node.label, dv: node.dv, due: seconds <= 30 };
  }
  if (transferTarget) {
    const plan = transferPlan(ship, getBody(transferTarget));
    if (!plan || !Number.isFinite(plan.wait)) {
      return null;
    }
    if (Math.abs(plan.dv1) > 1) {
      return { seconds: plan.wait, label: "burn", dv: plan.dv1, due: plan.wait <= 30 };
    }
    if (plan.flight > 1 && Number.isFinite(plan.flight)) {
      return { seconds: plan.flight, label: "capture", dv: plan.dv2, due: false };
    }
  }
  return null;
}

function autoBurnSource(rocket) {
  if (!rocket.stack) {
    return null;
  }
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const engine = (entry.part.modules || {})["Engine Module"];
    if (!engine || !entry.on || engine["Fuel Flow"] === "Negative" || !(engine.ISP > 0)) {
      continue;
    }
    const propellants = engineResources(engine).map(p => ({ ...p, feed: feedTanks(rocket.stack, i, p.resource) }));
    if (propellants.every(p => p.feed.length && feedHeld(p.feed, p.resource) > 0)) {
      return { isp: engine.ISP, propellants };
    }
  }
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const rcs = (entry.part.modules || {})["RCS Module"];
    if (!rcs || !(rcs.ISP > 0)) {
      continue;
    }
    const resource = rcs.Resource || defaultResource;
    const feed = feedTanks(rocket.stack, i, resource);
    if (feed.length && feedHeld(feed, resource) > 0) {
      return { isp: rcs.ISP, propellants: [{ resource, ratio: 1, feed }] };
    }
  }
  return null;
}

function snapshotDockPlan(rocket) {
  if (!rendezvousTarget) {
    return null;
  }
  const other = rockets.find(r => r.id === rendezvousTarget);
  const plan = other && dockPlan(rocket, other);
  if (!plan) {
    return null;
  }
  return {
    mode: plan.mode,
    dv: plan.dv,
    seconds: plan.seconds,
    distance: plan.distance
  };
}

function logBurnEvent(rocket, kind, dv) {
  if (!burnLogging) {
    return;
  }
  const parent = rocket.parentBody && getBody(rocket.parentBody);
  const rel = parent && relativeVelocity(rocket, parent);
  const ph = parent && orbitPhase(rocket.pos, rocket.vel, parent);
  const entry = {
    t,
    kind,
    dv,
    body: rocket.parentBody,
    speed: rel ? Math.hypot(rel.x, rel.y) : null,
    altitude: parent ? distanceTo(rocket, parent) - parent.size : null,
    periapsis: ph && ph.closed ? ph.periapsis - parent.size : null,
    apoapsis: ph && ph.closed ? ph.apoapsis - parent.size : null,
    plan: snapshotDockPlan(rocket)
  };
  burnLog.push(entry);
  console.log("[burn]", entry);
}

function downloadBurnLog() {
  if (!burnLog.length) {
    launchToast("No burn log entries yet, turn logging on with Shift+L first.");
    return;
  }
  const blob = new Blob([JSON.stringify(burnLog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "burn-log.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  launchToast(`Downloaded ${burnLog.length} burn log entries.`);
}

function logTimelineEvent(rocket, kind, data) {
  if (!rocketTimelineEnabled || !rocket) {
    return;
  }
  const parent = rocket.parentBody && getBody(rocket.parentBody);
  const rel = parent && relativeVelocity(rocket, parent);
  const altitude = parent ? distanceTo(rocket, parent) - parent.size : null;
  rocketTimeline.push({
    t,
    kind,
    rocket: rocket.id,
    angle: rocket.angle,
    angleDeg: degrees(rocket.angle),
    vel: { x: rocket.vel.x, y: rocket.vel.y },
    pos: { x: rocket.pos.x, y: rocket.pos.y },
    throttle,
    body: rocket.parentBody,
    altitude,
    altitudeKm: altitude === null ? null : altitude / 1000,
    speed: rel ? Math.hypot(rel.x, rel.y) : null,
    inAtmosphere: !!(parent && parent.atmosphereHeight && altitude !== null && altitude < parent.atmosphereHeight),
    spin: rocket.spin || 0,
    rotationDegPerSec: (rocket.spin || 0) * 180 / Math.PI,
    temp: rocket.temp ?? null,
    ...data
  });
}

function downloadRocketTimeline() {
  if (!rocketTimeline.length) {
    launchToast("No timeline recorded yet, launch a rocket first.");
    return;
  }
  const blob = new Blob([JSON.stringify(rocketTimeline, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rocket-timeline.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  launchToast(`Downloaded ${rocketTimeline.length} timeline entries.`);
}

function executeAutomatedBurn(rocket, dv) {
  const cooldown = 5;
  if (t - lastAutomatedBurnT < cooldown) {
    launchToast(`Wait ${Math.ceil(cooldown - (t - lastAutomatedBurnT))}s for the last burn to settle first.`);
    return false;
  }
  const parent = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, parent);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed <= 0) {
    return false;
  }
  const source = autoBurnSource(rocket);
  if (!source) {
    launchToast("No fuelled engine or RCS to perform the burn.");
    return false;
  }
  const wetMass = rocket.mass;
  const wantMass = wetMass - wetMass * Math.exp(-Math.abs(dv) / (source.isp * G0));

  let available = Infinity;
  for (const p of source.propellants) {
    let have = 0;
    for (const entry of p.feed) {
      have += entry.tanks[p.resource] || 0;
    }
    available = Math.min(available, p.ratio > 0 ? have / p.ratio : Infinity);
  }
  if (available < wantMass) {
    launchToast(`Not enough fuel for the full ${format("speed", Math.abs(dv))} burn`);
    return false;
  }

  for (const p of source.propellants) {
    const want = wantMass * p.ratio;
    let share = 0;
    for (const entry of p.feed) {
      share += entry.tanks[p.resource] || 0;
    }
    if (share <= 0) {
      continue;
    }
    for (const entry of p.feed) {
      const inTank = entry.tanks[p.resource] || 0;
      entry.tanks[p.resource] = Math.max(inTank - want * (inTank / share), 0);
    }
  }
  rocket.tanks = stackTanks(rocket.stack);
  rocket.tanksMax = stackTanks(rocket.stack, "tanksMax");
  rocket.fuel = totalFuel(rocket.tanks);
  rocket.fuelMax = totalFuel(rocket.tanksMax);
  rocket.mass = rocket.dryMass + rocket.fuel;

  const scale = dv / speed;
  rocket.vel.x += vel.x * scale;
  rocket.vel.y += vel.y * scale;
  lastAutomatedBurnT = t;
  logBurnEvent(rocket, "automated", dv);
  return true;
}

function transferPlan(ship, dest) {
  if (!ship || !dest || dest === getBody(ship.parentBody)) {
    return null;
  }
  const parent = getBody(ship.parentBody);
  const escaping = dest.parentBody !== ship.parentBody;
  if (escaping && dest.parentBody !== parent.parentBody) {
    return null;
  }
  const body = escaping ? getBody(parent.parentBody) : parent;
  const mu = gravParam(body);
  const origin = escaping ? parent.pos : ship.pos;
  const r1 = escaping ? parent.orbitRadius : Math.hypot(ship.pos.x - body.pos.x, ship.pos.y - body.pos.y);
  const r2 = dest.orbitRadius;
  if (r1 === r2) {
    return null;
  }
  const at = (r1 + r2) / 2;
  const vel = relativeVelocity(ship, parent);
  const speed = Math.hypot(vel.x, vel.y);
  const helio = Math.sqrt(mu * r2 / (r1 * at)) - Math.sqrt(mu / r1);
  let dv1 = Math.sqrt(mu * r2 / (r1 * at)) - speed;
  if (escaping) {
    const rp = Math.hypot(ship.pos.x - parent.pos.x, ship.pos.y - parent.pos.y);
    dv1 = Math.sqrt(helio * helio + 2 * gravParam(parent) / rp) - speed;
  }
  const dv2 = Math.sqrt(mu / r2) * (1 - Math.sqrt(r1 / at));
  const flight = Math.PI * Math.sqrt(at ** 3 / mu);
  const w1 = escaping ? TWO_PI / parent.orbitPeriod : Math.sqrt(mu / r1 ** 3);
  const w2 = TWO_PI / dest.orbitPeriod;
  const lead = Math.PI - w2 * flight;
  const originAng = Math.atan2(origin.y - body.pos.y, origin.x - body.pos.x);
  const destAng = Math.atan2(dest.pos.y - body.pos.y, dest.pos.x - body.pos.x);
  const synodic = TWO_PI / Math.abs(w1 - w2);
  let wait = ((destAng - originAng - lead) / (w1 - w2)) % synodic;
  if (wait < 0) {
    wait += synodic;
  }
  const burnAng = originAng + w1 * wait;
  let burn = { x: body.pos.x + Math.cos(burnAng) * r1, y: body.pos.y + Math.sin(burnAng) * r1 };
  if (escaping) {
    const rp = Math.hypot(ship.pos.x - parent.pos.x, ship.pos.y - parent.pos.y);
    const rx = ship.pos.x - parent.pos.x;
    const ry = ship.pos.y - parent.pos.y;
    const spin = Math.sign(rx * vel.y - ry * vel.x) || 1;
    const pv = relativeVelocity(parent, body);
    const eject = Math.atan2(pv.y, pv.x) + (helio < 0 ? Math.PI : 0) - spin * HALF_PI;
    burn = { x: parent.pos.x + Math.cos(eject) * rp, y: parent.pos.y + Math.sin(eject) * rp };
  }
  return { body, r1, r2, at, dv1, dv2, flight, wait, burnAng, burn };
}

function drawTransfer(ship, mapX, mapY) {
  const plan = transferPlan(ship, transferTarget && getBody(transferTarget));
  if (!plan) {
    return;
  }
  const { body, r1, r2, at, burnAng, burn } = plan;
  const bx = burn.x;
  const by = burn.y;
  const ax = body.pos.x - Math.cos(burnAng) * r2;
  const ay = body.pos.y - Math.sin(burnAng) * r2;
  const e = Math.abs(r2 - r1) / (r1 + r2);
  push();
  translate(mapX(body.pos), mapY(body.pos));
  rotate(burnAng + (r2 < r1 ? Math.PI : 0));
  noFill();
  stroke("#ffb347aa");
  strokeWeight(1);
  ellipse(-at * e * mapScale, 0, at * 2 * mapScale, at * 2 * Math.sqrt(1 - e * e) * mapScale);
  pop();
  noStroke();
  fill("#ffb347");
  circle(mapX({ x: bx, y: by }), mapY({ x: bx, y: by }), 8);
  fill("#ffb34788");
  circle(mapX({ x: ax, y: ay }), mapY({ x: ax, y: ay }), 6);
  fill("#ffb347");
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(
    `→ ${transferTarget}  Δv ${format("speed", Math.abs(plan.dv1))}  in ${formatTime(plan.wait)}`,
    mapX({ x: bx, y: by }) + 8,
    mapY({ x: bx, y: by }) - 6
  );
  text(
    `capture Δv ${format("speed", Math.abs(plan.dv2))}  after ${formatTime(plan.flight)}`,
    mapX({ x: ax, y: ay }) + 8,
    mapY({ x: ax, y: ay }) - 6
  );
}

// raw current gap/closing-speed between two craft — only meaningful once
// they're already close together on a converging final approach
function rendezvousPlan(ship, other) {
  if (!ship || !other || ship === other) {
    return null;
  }
  const relPos = { x: other.pos.x - ship.pos.x, y: other.pos.y - ship.pos.y };
  const relVel = { x: other.vel.x - ship.vel.x, y: other.vel.y - ship.vel.y };
  const distance = Math.hypot(relPos.x, relPos.y);
  const closeAng = Math.atan2(relPos.y, relPos.x);
  const closeDv = 0.05 * Math.hypot(relVel.x, relVel.y) + Math.min(distance / 60, 20);
  const matchDv = Math.hypot(relVel.x, relVel.y);
  return { distance, closeAng, closeDv, matchDv, matchAng: Math.atan2(relVel.y, relVel.x) };
}

// r, angle and mean angular rate of an orbit around `parent`, from vis-viva.
// works for any closed (elliptical) orbit, not just circular ones.
function orbitalElements(pos, vel, parent) {
  const mu = gravParam(parent);
  const rx = pos.x - parent.pos.x;
  const ry = pos.y - parent.pos.y;
  const vx = vel.x - parent.vel.x;
  const vy = vel.y - parent.vel.y;
  const r = Math.hypot(rx, ry);
  const v2 = vx * vx + vy * vy;
  const energy = v2 / 2 - mu / r;
  const a = -mu / (2 * energy);
  const closed = energy < 0 && a > 0;
  const period = closed ? TWO_PI * Math.sqrt(a ** 3 / mu) : Infinity;
  const cross = rx * vy - ry * vx;
  const w = closed ? Math.sign(cross || 1) * (TWO_PI / period) : 0;
  return { r, a, period, w, angle: Math.atan2(ry, rx), closed, speed: Math.sqrt(v2) };
}

function orbitPhase(pos, vel, parent) {
  const mu = gravParam(parent);
  const rx = pos.x - parent.pos.x;
  const ry = pos.y - parent.pos.y;
  const vx = vel.x - parent.vel.x;
  const vy = vel.y - parent.vel.y;
  const r = Math.hypot(rx, ry);
  const v2 = vx * vx + vy * vy;
  const rdotv = rx * vx + ry * vy;
  const energy = v2 / 2 - mu / r;
  const a = -mu / (2 * energy);
  if (!(energy < 0 && a > 0)) {
    return { closed: false };
  }
  const ex = (v2 / mu - 1 / r) * rx - (rdotv / mu) * vx;
  const ey = (v2 / mu - 1 / r) * ry - (rdotv / mu) * vy;
  const e = Math.hypot(ex, ey);
  const period = TWO_PI * Math.sqrt(a ** 3 / mu);
  const n = TWO_PI / period;
  const periapsis = a * (1 - e);
  const apoapsis = a * (1 + e);
  if (e < 1e-6) {
    // no well-defined apsis line on a circular orbit — nothing to time
    return { closed: true, a, e, period, periapsis, apoapsis, timeToPeriapsis: NaN, timeToApoapsis: NaN };
  }
  let nu = Math.acos(constrain((ex * rx + ey * ry) / (e * r), -1, 1));
  if (rdotv < 0) {
    nu = TWO_PI - nu;
  }
  const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));
  let M = E - e * Math.sin(E);
  if (M < 0) {
    M += TWO_PI;
  }
  const timeToPeriapsis = ((TWO_PI - M) % TWO_PI) / n;
  const timeToApoapsis = ((Math.PI - M + TWO_PI) % TWO_PI) / n;
  return { closed: true, a, e, period, periapsis, apoapsis, timeToPeriapsis, timeToApoapsis };
}

function nodeOrbitChanged(ph, node) {
  return Math.abs(ph.a - node.a) / node.a > 2e-3 || Math.abs(ph.e - node.e) > 2e-3;
}

function planManeuver(ship, other, ph, el1, el2, parent, mu) {
  const r2 = el2.r;
  const tol = 0.02;
  const periNear = Math.abs(ph.periapsis - r2) / r2 < tol;
  const apoNear = Math.abs(ph.apoapsis - r2) / r2 < tol;
  const sig = { a: ph.a, e: ph.e };

  if (periNear !== apoNear) {
    const toPeri = periNear;
    const arriveR = toPeri ? ph.periapsis : ph.apoapsis;
    let coast = toPeri ? ph.timeToPeriapsis : ph.timeToApoapsis;
    if (!Number.isFinite(coast)) {
      return null;
    }
    if (coast < 1) {
      coast += ph.period;
    }
    const arriveSpeed = Math.sqrt(mu * (2 / arriveR - 1 / ph.a));
    return { t: t + coast, dv: Math.sqrt(mu / arriveR) - arriveSpeed, label: "capture", r: arriveR, ...sig };
  }

  if (periNear && apoNear) {
    const w2 = el2.w;
    if (!w2) {
      return null;
    }
    const r1 = el1.r;
    const targetPeriod = TWO_PI / Math.abs(w2);
    let gap = (el1.angle - el2.angle) % TWO_PI;
    if (gap < 0) {
      gap += TWO_PI;
    }
    let best = null;
    for (let laps = 1; laps <= 12; laps++) {
      for (let k = 0; k <= laps + 1; k++) {
        const total = gap / Math.abs(w2) + k * targetPeriod;
        const loop = total / laps;
        if (loop <= 0) {
          continue;
        }
        const a2 = Math.cbrt(mu * (loop / TWO_PI) ** 2);
        if (2 * a2 - r1 <= parent.size * 1.05) {
          continue;
        }
        const score = Math.abs(loop - ph.period);
        if (!best || score < best.score) {
          best = { score, a2, total, laps };
        }
      }
    }
    if (!best) {
      return null;
    }
    const vPhase = Math.sqrt(mu * (2 / r1 - 1 / best.a2));
    return {
      t,
      dv: vPhase - el1.speed,
      label: "burn",
      r: r1,
      live: true,
      captureT: t + best.total,
      laps: best.laps,
      expectA: best.a2,
      ...sig
    };
  }

  // burn at an apsis so the burn radius is a fixed property of the orbit
  // rather than wherever the ship happens to be this frame
  const raise = r2 > ph.apoapsis;
  let r1 = raise ? ph.periapsis : ph.apoapsis;
  let wait = raise ? ph.timeToPeriapsis : ph.timeToApoapsis;
  if (!Number.isFinite(wait)) {
    r1 = el1.r;
    wait = 0;
  }
  const at = (r1 + r2) / 2;
  const need = Math.sqrt(mu * (2 / r1 - 1 / at));
  const have = Math.sqrt(mu * (2 / r1 - 1 / ph.a));
  return { t: t + wait, dv: need - have, label: "burn", r: r1, live: wait <= 0, ...sig };
}

function activeNode(ship) {
  if (!ship || !rendezvousTarget) {
    if (ship) {
      ship.node = null;
    }
    return null;
  }
  const other = rockets.find(rocket => rocket.id === rendezvousTarget);
  if (!other || other === ship || ship.parentBody !== other.parentBody) {
    ship.node = null;
    return null;
  }
  const parent = getBody(ship.parentBody);
  const ph = orbitPhase(ship.pos, ship.vel, parent);
  const el1 = orbitalElements(ship.pos, ship.vel, parent);
  const el2 = orbitalElements(other.pos, other.vel, parent);
  if (!ph.closed || !el1.closed || !el2.closed) {
    ship.node = null;
    return null;
  }
  const distance = Math.hypot(other.pos.x - ship.pos.x, other.pos.y - ship.pos.y);
  if (distance < Math.max(50000, el1.r * 0.05)) {
    ship.node = null;
    return null;
  }

  const node = ship.node;
  if (node && node.target === rendezvousTarget && node.captureT && node.expectA &&
      Math.abs(ph.a - node.expectA) / node.expectA < 5e-3) {
    // the burn this node asked for has been flown, by hand or automated, so
    // the capture it was solved for is now committed rather than re-derived
    const chained = {
      t: node.captureT,
      dv: -node.dv,
      label: "capture",
      r: node.r,
      a: ph.a,
      e: ph.e,
      target: rendezvousTarget
    };
    ship.node = chained;
    return chained;
  }
  if (node && node.target === rendezvousTarget && !node.live && !nodeOrbitChanged(ph, node)) {
    // a capture recurs every lap, so a missed one just rolls to the next
    while (node.label === "capture" && node.t < t - 1) {
      node.t += ph.period;
    }
    return node;
  }
  const fresh = planManeuver(ship, other, ph, el1, el2, parent, gravParam(parent));
  if (fresh) {
    fresh.target = rendezvousTarget;
  }
  ship.node = fresh;
  return fresh;
}

function clampTimewarpForOrbit(rocket) {
  if (!rocket || !rocket.parentBody || rocket.landed) {
    return;
  }
  const parent = getBody(rocket.parentBody);
  const el = orbitalElements(rocket.pos, rocket.vel, parent);
  if (!el.closed || !Number.isFinite(el.period) || el.period <= 0) {
    return;
  }
  const safeDt = (el.period / 1000) * c.maxSubsteps;
  let idx = timeWarpSteps.length - 1;
  while (idx > 0 && timeWarpSteps[idx] / frameRate() > safeDt) {
    idx--;
  }
  if (c.timewarp > timeWarpSteps[idx]) {
    c.timewarp = timeWarpSteps[idx];
  }
  timeWarpCounter = Math.min(timeWarpCounter, idx);
}

function dockPlan(ship, other) {
  if (!ship || !other || ship === other) {
    return null;
  }
  const distance = Math.hypot(other.pos.x - ship.pos.x, other.pos.y - ship.pos.y);

  if (ship.parentBody !== other.parentBody) {
    if (distance < 50000) {
      return { mode: "approach", distance, ...rendezvousPlan(ship, other) };
    }
    return { mode: "different-orbit", distance };
  }

  const parent = getBody(ship.parentBody);
  const el1 = orbitalElements(ship.pos, ship.vel, parent);
  if (el1.closed && distance < Math.max(50000, el1.r * 0.05)) {
    return { mode: "approach", distance, ...rendezvousPlan(ship, other) };
  }

  const node = activeNode(ship);
  if (!node) {
    return { mode: "different-orbit", distance };
  }
  const seconds = node.t - t;
  const burnAng = el1.angle + el1.w * Math.max(seconds, 0);
  return {
    mode: node.label,
    distance,
    parent,
    seconds,
    dv: node.dv,
    r: node.r,
    burnAng,
    burn: { x: parent.pos.x + Math.cos(burnAng) * node.r, y: parent.pos.y + Math.sin(burnAng) * node.r }
  };
}

function drawDockPlan(ship, mapX, mapY) {
  const other = rendezvousTarget && rockets.find(rocket => rocket.id === rendezvousTarget);
  if (!other) {
    return;
  }
  const plan = dockPlan(ship, other);
  if (!plan) {
    return;
  }
  const sx = mapX(ship.pos);
  const sy = mapY(ship.pos);
  const ox = mapX(other.pos);
  const oy = mapY(other.pos);
  stroke("#5ccfffaa");
  strokeWeight(1);
  line(sx, sy, ox, oy);
  noStroke();
  fill("#5ccfff");
  textAlign(LEFT, BOTTOM);
  textSize(12);

  if (plan.mode === "different-orbit") {
    text(
      `⇢ ${other.id}  no rendezvous plan, match altitude and SOI first`,
      (sx + ox) / 2 + 8,
      (sy + oy) / 2 - 6
    );
    return;
  }

  if (plan.mode === "approach") {
    text(
      `⇢ ${other.id}  close Δv ${format("speed", plan.closeDv)}  ${(plan.distance / 1000).toFixed(1)} km`,
      (sx + ox) / 2 + 8,
      (sy + oy) / 2 - 12
    );
    text(`match Δv ${format("speed", plan.matchDv)}`, (sx + ox) / 2 + 8, (sy + oy) / 2 - 0);
    return;
  }

  const bx = mapX(plan.burn);
  const by = mapY(plan.burn);
  fill("#5ccfff");
  circle(bx, by, 8);
  const when = plan.seconds <= 1 ? "now" : `in ${formatTime(plan.seconds)}`;
  text(
    `⇢ ${other.id}  ${plan.mode} Δv ${format("speed", Math.abs(plan.dv))}  ${when}`,
    bx + 8,
    by - 6
  );
  text(`${(plan.distance / 1000).toFixed(1)} km apart`, bx + 8, by + 14);
}

function bodyStateAt(body, time) {
  if (!body.parentBody) {
    return { pos: { x: body.pos.x, y: body.pos.y }, vel: { x: body.vel.x, y: body.vel.y } };
  }
  const parent = bodyStateAt(getBody(body.parentBody), time);
  const a = body.orbitRadius;
  const e = body.orbitEccentricity || 0;
  const b = a * Math.sqrt(1 - e * e);
  const mean = (body.orbitPhase || 0) + TWO_PI * (time / body.orbitPeriod);
  const E = eccentricAnomaly(mean, e);
  const rate = (TWO_PI / body.orbitPeriod) / (1 - e * Math.cos(E));
  return {
    pos: { x: parent.pos.x + a * (Math.cos(E) - e), y: parent.pos.y + b * Math.sin(E) },
    vel: { x: parent.vel.x - a * Math.sin(E) * rate, y: parent.vel.y + b * Math.cos(E) * rate }
  };
}

function twoBodyStep(p, v, mu, dt) {
  const acc = (q) => {
    const r2 = q.x * q.x + q.y * q.y;
    const f = -mu / (r2 * Math.sqrt(r2));
    return { x: q.x * f, y: q.y * f };
  };
  const a1 = acc(p);
  const p2 = { x: p.x + v.x * dt / 2, y: p.y + v.y * dt / 2 };
  const v2 = { x: v.x + a1.x * dt / 2, y: v.y + a1.y * dt / 2 };
  const a2 = acc(p2);
  const p3 = { x: p.x + v2.x * dt / 2, y: p.y + v2.y * dt / 2 };
  const v3 = { x: v.x + a2.x * dt / 2, y: v.y + a2.y * dt / 2 };
  const a3 = acc(p3);
  const p4 = { x: p.x + v3.x * dt, y: p.y + v3.y * dt };
  const v4 = { x: v.x + a3.x * dt, y: v.y + a3.y * dt };
  const a4 = acc(p4);
  return {
    p: {
      x: p.x + (dt / 6) * (v.x + 2 * v2.x + 2 * v3.x + v4.x),
      y: p.y + (dt / 6) * (v.y + 2 * v2.y + 2 * v3.y + v4.y)
    },
    v: {
      x: v.x + (dt / 6) * (a1.x + 2 * a2.x + 2 * a3.x + a4.x),
      y: v.y + (dt / 6) * (a1.y + 2 * a2.y + 2 * a3.y + a4.y)
    }
  };
}

function predictTrajectory(rocket, maxSegments) {
  if (!rocket || rocket.destroyed || rocket.landed) {
    return [];
  }
  const segments = [];
  let body = getBody(rocket.parentBody);
  let time = t;
  let p = { x: rocket.pos.x - body.pos.x, y: rocket.pos.y - body.pos.y };
  let v = relativeVelocity(rocket, body);
  const maxSteps = maxSegments > 1 ? 1500 : 500;

  for (let s = 0; s < maxSegments; s++) {
    const mu = gravParam(body);
    const soi = soiRadius(body);
    const children = planets.filter(child => child.parentBody === body.id);
    const r0 = Math.hypot(p.x, p.y);
    const speed0 = Math.hypot(v.x, v.y);
    const energy = (speed0 * speed0) / 2 - mu / r0;
    const a = -mu / (2 * energy);
    const bound = energy < 0;
    const period = bound ? TWO_PI * Math.sqrt(a ** 3 / mu) : Infinity;
    const seg = { origin: body.pos, points: [{ x: p.x, y: p.y }], closed: false, body, event: null };
    segments.push(seg);
    let elapsed = 0;
    let next = null;

    for (let i = 0; i < maxSteps; i++) {
      const r = Math.hypot(p.x, p.y);
      const dt = 0.02 * Math.sqrt(r ** 3 / mu);
      const out = twoBodyStep(p, v, mu, dt);
      p = out.p;
      v = out.v;
      elapsed += dt;
      time += dt;
      seg.points.push({ x: p.x, y: p.y });
      const rNow = Math.hypot(p.x, p.y);
      if (rNow < body.size) {
        break;
      }
      const here = bodyStateAt(body, time);
      if (rNow > soi) {
        const parent = getBody(body.parentBody);
        const up = bodyStateAt(parent, time);
        seg.event = { type: "exit", time };
        next = {
          body: parent,
          p: { x: p.x + here.pos.x - up.pos.x, y: p.y + here.pos.y - up.pos.y },
          v: { x: v.x + here.vel.x - up.vel.x, y: v.y + here.vel.y - up.vel.y }
        };
        break;
      }
      let hit = null;
      for (const child of children) {
        const cs = bodyStateAt(child, time);
        const dx = p.x - (cs.pos.x - here.pos.x);
        const dy = p.y - (cs.pos.y - here.pos.y);
        if (Math.hypot(dx, dy) < soiRadius(child)) {
          hit = { child, cs };
          break;
        }
      }
      if (hit) {
        seg.event = { type: "enter", time, child: hit.child };
        next = {
          body: hit.child,
          p: { x: p.x - (hit.cs.pos.x - here.pos.x), y: p.y - (hit.cs.pos.y - here.pos.y) },
          v: { x: v.x - (hit.cs.vel.x - here.vel.x), y: v.y - (hit.cs.vel.y - here.vel.y) }
        };
        break;
      }
      if (bound && elapsed >= period) {
        seg.closed = true;
        break;
      }
    }
    if (!next) {
      break;
    }
    body = next.body;
    p = next.p;
    v = next.v;
  }
  return segments;
}

function drawRocketOrbit(rocket, mapX, mapY) {
  const mine = rocket.id === target;
  const segments = predictTrajectory(rocket, mine ? 4 : 1);
  const colours = mine
    ? ["#5ccfff88", "#ffb347aa", "#c58cffaa", "#7dff9faa"]
    : ["#8888aa66"];
  const labels = [];
  segments.forEach((seg, i) => {
    const ox = seg.origin.x;
    const oy = seg.origin.y;
    if (seg.points.length < 2) {
      return;
    }
    noFill();
    stroke(colours[i % colours.length]);
    strokeWeight(1);
    beginShape();
    for (const p of seg.points) {
      vertex(mapX({ x: ox + p.x, y: oy + p.y }), mapY({ x: ox + p.x, y: oy + p.y }));
    }
    endShape(seg.closed ? CLOSE : undefined);
    if (i > 0 && mine) {
      const r = Math.max(seg.body.size * mapScale, 4);
      stroke(colours[i % colours.length]);
      noFill();
      circle(mapX({ x: ox, y: oy }), mapY({ x: ox, y: oy }), r * 2);
    }
    if (seg.event && mine) {
      const last = seg.points[seg.points.length - 1];
      const px = mapX({ x: ox + last.x, y: oy + last.y });
      const py = mapY({ x: ox + last.x, y: oy + last.y });
      const when = formatTime(seg.event.time - t);
      const text_ = seg.event.type === "enter"
        ? `${seg.event.child.id} encounter  in ${when}`
        : `leaves ${seg.body.id} SOI  in ${when}`;
      labels.push({ px, py, text: text_, colour: colours[(i + 1) % colours.length] });
    }
  });
  if (!labels.length) {
    return;
  }
  textAlign(LEFT, BOTTOM);
  textSize(12);
  for (const l of labels) {
    noStroke();
    fill(l.colour);
    circle(l.px, l.py, 6);
    text(l.text, l.px + 8, l.py - 6);
  }
  textAlign(LEFT, BASELINE);
}

let paintPicker = null;
let paintPickerKey = null;

function setPaint(inst, patch) {
  const next = { ...inst.paint, ...patch };
  for (const key in next) {
    if (next[key] === undefined) {
      delete next[key];
    }
  }
  inst.paint = Object.keys(next).length ? next : undefined;
}

function openPaintPicker(key) {
  const inst = vab.selected;
  if (!inst) {
    return;
  }
  if (!paintPicker) {
    paintPicker = document.createElement("input");
    paintPicker.type = "color";
    paintPicker.style.cssText = "position:fixed;left:50%;top:50%;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(paintPicker);
    paintPicker.addEventListener("input", () => {
      if (vab.selected && paintPickerKey) {
        setPaint(vab.selected, { [paintPickerKey]: paintPicker.value });
      }
    });
  }
  paintPickerKey = key;
  paintPicker.value = (inst.paint && inst.paint[key]) || "#ffffff";
  paintPicker.click();
}

function paintClick(id) {
  const inst = vab.selected;
  const match = /^paint-(color|tint)-(\d+|custom|reset)$/.exec(id);
  if (!inst || !match) {
    return;
  }
  const key = match[1] === "color" ? "color" : "shapeTint";
  const list = match[1] === "color" ? paintColors : shapeColors;
  if (match[2] === "custom") {
    openPaintPicker(key);
  } else if (match[2] === "reset") {
    setPaint(inst, { [key]: undefined });
  } else {
    setPaint(inst, { [key]: list[Number(match[2])] });
  }
}

function paintSwatches(ui, prefix, colors, current) {
  for (let i = 0; i < colors.length; i += 8) {
    const row = ui.row(28);
    const w = (row.sx - 7 * 4) / 8;
    colors.slice(i, i + 8).forEach((color, j) => {
      const x = row.x + j * (w + 4);
      GUIAPI.button(x, row.y, w, 28, { id: `paint-${prefix}-${i + j}`, baseColor: color, radius: 4 });
      if (current && current.toLowerCase() === color) {
        push();
        noFill();
        stroke("#5aa9ff");
        strokeWeight(2);
        rect(x - 1, row.y - 1, w + 2, 30, 5);
        pop();
      }
    });
  }
  const row = ui.row(32);
  const half = row.sx / 2 - 3;
  GUIAPI.button(row.x, row.y, half, 32, { id: `paint-${prefix}-custom`, ...menuStyle }, "Custom...");
  GUIAPI.button(row.x + half + 6, row.y, half, 32, { id: `paint-${prefix}-reset`, ...menuStyle }, "Reset");
}

function drawPaintPanel() {
  const inst = vab.selected;
  if (!inst) {
    return;
  }
  const paint = inst.paint || {};
  const sx = 290;
  const sy = Math.min(height - 200, 440);
  GUIAPI.panel(sx, sy, {
    borderColor: "#555",
    id: "paint-panel",
    offsetX: (width - sx) / 2 - 20,
    offsetY: 40
  }, `Paint: ${inst.part.name}`, ui => {
    ui.label("Colour", { size: 14, color: "#5aa9ff", height: 24 });
    paintSwatches(ui, "color", paintColors, paint.color);
    ui.label("Shape texture", { size: 14, color: "#5aa9ff", height: 24 });
    const current = paint.shape ? shapeTextureNames.indexOf(paint.shape) + 1 : 0;
    const next = ui.dropdown(0, 0, undefined, 34, { id: "paint-shape", ...menuStyle }, ["None", ...shapeTextureNames], current);
    if (next !== current) {
      setPaint(inst, { shape: next ? shapeTextureNames[next - 1] : undefined });
    }
    if (paint.shape) {
      ui.label("Shape colour", { size: 14, color: "#5aa9ff", height: 24 });
      paintSwatches(ui, "tint", shapeColors, paint.shapeTint);
    }
  });
}

function drawVab() {
  background("#2b2b2b");
  if (vab.selected && !vab.parts.includes(vab.selected)) {
    vab.selected = null;
  }
  cursor(vab.drag ? "grabbing" : "default");

  const panelW = panelWidth();
  const dragSet = vab.drag ? new Set(subtree(vab.drag.inst)) : new Set();
  const midX = craftCentre(dragSet);
  stroke(vab.snap && vab.snap.mode === "centre" ? "#55ccff66" : "#ffffff12");
  strokeWeight(2);
  line(midX, 0, midX, height);
  for (const inst of vab.parts) {
    if (!dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, { ...lockedLook(inst, 1), rot: inst.rot, layer: "back", paint: inst.paint });
    }
  }
  for (const inst of vab.parts) {
    if (dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, { ...lockedLook(inst, 0.9), rot: inst.rot, layer: "back", paint: inst.paint });
    }
  }
  for (const inst of vab.parts) {
    const alpha = dragSet.has(inst) ? 0.9 : 1;
    drawPart(inst.part, inst.x, inst.y, vab.scale, { ...lockedLook(inst, alpha), rot: inst.rot, layer: "front", paint: inst.paint });
  }

  if (stagingOpen) {
    textSize(13);
    vab.parts.forEach((inst, i) => {
      if (!partIsToggleable(inst.part)) {
        return;
      }
      GUIAPI.button(inst.x - 11, inst.y - 11, 22, 22, {
        id: "stage-cycle-" + i,
        ...menuStyle
      }, String(inst.stage ?? 0));
    });
  }

  if (!vab.drag && mouseX >= panelW) {
    const hovered = partAt(mouseX, mouseY);
    if (hovered) {
      noFill();
      stroke("#5ccfff99");
      strokeWeight(2);
      for (const move of validMoves(hovered)) {
        circle(move.point.x, move.point.y, 14);
      }
    }
  }

  if (vab.snap && vab.snap.target) {
    noStroke();
    fill("#5cf");
    circle(vab.snap.point.x, vab.snap.point.y, 12);
  }

  noStroke();
  fill("#3a3a3a");
  rect(0, 0, panelW, height);
  const lb = launchButton();
  GUIAPI.button(lb.x, lb.y, lb.size, lb.size, {
    id: "launch",
    baseColor: vab.parts.length ? "#059200" : "#3f5c3f",
    hoverColor: "#06b900",
    activeColor: "#047b00",
    tooltip: vab.parts.length
      ? ["Launch", `  mass: ${stackMass()}t`]
      : ["Launch", "  nothing in the bay"]
  }, "L");
  if (flyingRocket()) {
    const fb = flyButton();
    GUIAPI.button(fb.x, fb.y, fb.size, fb.size, {
      id: "vab-fly",
      baseColor: "#1f4f8f",
      hoverColor: "#2a6ac0",
      activeColor: "#173d70",
      tooltip: ["Back to flight", "  the ship is still up there"]
    }, "F");
  }
  for (const zb of zoomButtons()) {
    GUIAPI.button(zb.x, zb.y, zb.size, zb.size, {
      id: zb.id,
      tooltip: [zb.label === "+" ? "Zoom in" : "Zoom out", `  ${Math.round(vab.scale * 100)}%`]
    }, zb.label);
  }
  for (const cb of craftButtons()) {
    GUIAPI.button(cb.x, cb.y, cb.w, cb.h, {
      id: cb.id,
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: cb.label === "S"
        ? ["Save craft", vab.parts.length ? "  as craft.json" : "  nothing in the bay"]
        : cb.label === "O"
        ? ["Open craft", "  replaces what's in the bay"]
        : ["Export context", "Exports a save file not meant to be imported with extra context about the rocket."]
    }, cb.label);
  }
  textSize(14);
  GUIAPI.button(0, vab.buttonSize * 2, vab.buttonSize * 2, vab.buttonSize, {
    id: "example-rockets",
    baseColor: "#4a4a5a",
    hoverColor: "#5b5b6e"
  }, "Example Rockets");
  GUIAPI.button(vab.buttonSize * 2, vab.buttonSize * 2, vab.buttonSize * 2, vab.buttonSize, {
    id: "vab-staging",
    baseColor: "#4a4a5a",
    hoverColor: "#5b5b6e"
  }, "Stage");
  textSize(12);
  for (const tab of categoryTabs()) {
    GUIAPI.button(tab.x, tab.y, tab.w, tab.h, {
      id: tab.id,
      baseColor: vab.category === tab.cat ? "#5b5b6e" : "#2e2e2e",
      hoverColor: "#4a4a5a"
    }, tab.cat);
  }
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, paletteTop(), panelW, height - paletteTop());
  drawingContext.clip();
  for (const b of visiblePaletteLayout()) {
    GUIAPI.button(b.x, b.y, b.size, b.size, { id: b.id, tooltip: partTooltip(b.part) });
    const bb = partBBox(b.part);
    const pad = 14;
    const iconScale = Math.min((b.size - pad) / bb.w, (b.size - pad) / bb.h);
    drawPart(b.part, b.x + b.size / 2, b.y + b.size / 2, iconScale);
  }
  drawingContext.restore();
  drawStageReadout(panelW);

  const introW = 260;
  const introX = width - introW - 20;
  GUIAPI.button(introX, 20, introW, 40, { id: "vab-mainmenu", ...menuStyle }, "Main Menu");
  if (vab.selected) {
    const bb = partBBox(vab.selected.part);
    const turned = (vab.selected.rot || 0) % 2;
    const w = (turned ? bb.h : bb.w) * vab.scale;
    const h = (turned ? bb.w : bb.h) * vab.scale;
    push();
    noFill();
    stroke("#5aa9ff");
    strokeWeight(2);
    rect(vab.selected.x - w / 2, vab.selected.y - h / 2, w, h);
    pop();
  }
  drawPaintPanel();
  GUIAPI.button(width - 320, height - 100, 145, 40, {
    id: "vab-export-world",
    baseColor: "#4a4a5a",
    hoverColor: "#5b5b6e",
    tooltip: careerMode
      ? ["Export career world", "  rockets, money, tech, milestones"]
      : ["Export sandbox world", "  rockets and mods"]
  }, "Export World");
  GUIAPI.button(width - 165, height - 100, 145, 40, {
    id: "vab-import-world",
    baseColor: "#4a4a5a",
    hoverColor: "#5b5b6e",
    tooltip: ["Import a world", "  a career file switches to career,", "  a sandbox file to sandbox"]
  }, "Import World");
  if (!careerMode) {
    GUIAPI.panel(introW, 120, {
      offsetX: introX - (width - introW) / 2,
      offsetY: 90 - (height - 120) / 2,
      borderColor: "#555",
      id: "vab-intro"
    }, "Welcome", ui => {
      ui.label("Welcome to the VAB! some parts or,", { size: 13, height: 22 });
      ui.label("try the example rockets", { size: 13, height: 20 });
    });
  }

  GUIAPI.drawTooltip();

  noStroke();
  fill("#aaa");
  textSize(12);
  textAlign(LEFT, BASELINE);
}

const cost = {
  multi: 200,
  perTon: 200,
  thrust: 1,
  isp: 500,
  ispPower: 1.5,
  torque: 40,
  drag: 0.6,
  separation: 3,
  ablator: 400,
  resource: { 
    "Kerolox": 50, 
    "Solid Fuel": 70,
    "Hydrolox": 180, 
    "Xenon": 2000, 
    "Ore": 10 
  }
};

function partCost(part) {
  const m = part.modules || {};
  let total = (part.mass || 0) * cost.perTon;
  if (m["Engine Module"]) {
    total += m["Engine Module"].Thrust * cost.thrust + cost.isp * Math.pow(m["Engine Module"].ISP / 300, cost.ispPower);
  }
  if (m["Resource Module"]) {
    for (const p of tankResources(m["Resource Module"])) {
      total += p.amount * (cost.resource[p.resource] ?? 50);
    }
  }
  if (m["Controller Module"]) total += m["Controller Module"].Torque * cost.torque;
  if (m["Parachute Module"]) total += m["Parachute Module"].Drag * cost.drag;
  if (m["Decoupler Module"]) total += m["Decoupler Module"]["Separation Force"] * cost.separation;
  if (m["Heat Shield Module"]) total += m["Heat Shield Module"].Ablator * cost.ablator;
  return total * cost.multi;
}

function stackCost() {
  let total = 0;
  for (const inst of vab.parts) {
    total += partCost(inst.part);
  }
  return total;
}

function stackMass() {
  let total = 0;
  for (const inst of vab.parts) {
    total += inst.part.mass || 0;
  }
  return total;
}

let defaultResource = "Kerolox";

// Resource/Ratio is the engine's main propellant; More Resources: [{ Resource, Ratio }, ...]
// is an optional list of extra ones drawn alongside it in the same mix, split by ratio.
function engineResources(engine) {
  const rows = [
    { resource: engine.Resource || defaultResource, ratio: engine.Ratio || 1 },
    ...(Array.isArray(engine["More Resources"]) ? engine["More Resources"] : [])
      .map(p => ({ resource: p.Resource || defaultResource, ratio: p.Ratio || 0 }))
  ];
  const total = rows.reduce((sum, p) => sum + p.ratio, 0) || 1;
  return rows.map(p => ({ resource: p.resource, ratio: p.ratio / total }));
}

function tankResources(tank) {
  const startFraction = tank["Starting Fuel %"] ?? 1;
  const list = tank["More Resources"];
  if (Array.isArray(list) && list.length) {
    return list.map(p => ({ resource: p.Resource || defaultResource, amount: p.Amount || 0, startFraction }));
  }
  return [{ resource: tank.Resource || defaultResource, amount: tank.Amount || 0, startFraction }];
}

function stackFuel() {
  const tanks = {};
  for (const inst of vab.parts) {
    const resource = (inst.part.modules || {})["Resource Module"];
    if (resource) {
      for (const p of tankResources(resource)) {
        tanks[p.resource] = (tanks[p.resource] || 0) + p.amount;
      }
    }
  }
  return tanks;
}

function totalFuel(tanks) {
  let total = 0;
  for (const name in tanks) {
    total += tanks[name];
  }
  return total;
}

const mathFuncs = {
  abs: Math.abs, sign: Math.sign, floor: Math.floor, ceil: Math.ceil, round: Math.round,
  trunc: Math.trunc, sqrt: Math.sqrt, cbrt: Math.cbrt, pow: Math.pow, exp: Math.exp,
  log: Math.log, log2: Math.log2, log10: Math.log10, sin: Math.sin, cos: Math.cos,
  tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
  hypot: Math.hypot, min: Math.min, max: Math.max, random: Math.random,
  clamp: (v, lo, hi) => Math.min(Math.max(v, lo), hi),
  lerp: (a, b, f) => a + (b - a) * f
};
const mathConsts = { pi: Math.PI, tau: Math.PI * 2, e: Math.E };

function tokenizeFormula(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j; continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j++;
      toks.push({ t: "str", v: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    const two = src.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      toks.push({ t: "op", v: two }); i += 2; continue;
    }
    if ("+-*/%^()?:,<>!".includes(ch)) {
      toks.push({ t: "op", v: ch }); i++; continue;
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
      left = scope => op(l(scope), right(scope));
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
      return scope => (cond(scope) ? a(scope) : b(scope));
    }
    return cond;
  }
  const parseOr = binaryLevel(() => parseAnd(), { "||": (a, b) => a || b });
  const parseAnd = binaryLevel(() => parseEq(), { "&&": (a, b) => a && b });
  const parseEq = binaryLevel(() => parseRel(), { "==": (a, b) => a === b, "!=": (a, b) => a !== b });
  const parseRel = binaryLevel(() => parseAdd(), {
    "<": (a, b) => a < b, "<=": (a, b) => a <= b, ">": (a, b) => a > b, ">=": (a, b) => a >= b
  });
  const parseAdd = binaryLevel(() => parseMul(), { "+": (a, b) => a + b, "-": (a, b) => a - b });
  const parseMul = binaryLevel(() => parsePow(), {
    "*": (a, b) => a * b, "/": (a, b) => a / b, "%": (a, b) => a % b
  });
  function parsePow() {
    const left = parseUnary();
    if (isOp(peek(), "^")) {
      next();
      const right = parsePow();
      return scope => Math.pow(left(scope), right(scope));
    }
    return left;
  }
  function parseUnary() {
    if (isOp(peek(), "-")) { next(); const e = parseUnary(); return scope => -e(scope); }
    if (isOp(peek(), "!")) { next(); const e = parseUnary(); return scope => !e(scope); }
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
          while (isOp(peek(), ",")) { next(); args.push(parseExpr()); }
        }
        next();
        const fn = mathFuncs[tok.v];
        return scope => (fn ? fn(...args.map(a => a(scope))) : 0);
      }
      if (tok.v in mathConsts) {
        const val = mathConsts[tok.v];
        return () => val;
      }
      const name = tok.v;
      return scope => scope[name];
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
      if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
        scope[key.replace(/ /g, "")] = resolveField(entry, value);
      }
    }
  }
  return scope;
}

function interpolate(str, scope) {
  return String(str ?? "").replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, name) => scope[name] ?? "");
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
  lt: (a, b) => a < b, lte: (a, b) => a <= b, eq: (a, b) => a === b,
  gte: (a, b) => a >= b, gt: (a, b) => a > b
};

function runBooleanModule(entry) {
  const mod = (entry.part.modules || {})["Boolean Logic Module"];
  if (!mod) {
    return;
  }
  const scope = moduleScope(entry);
  firstList(mod).forEach((row, i) => {
    const test = booleanOps[row.Comparison] || booleanOps.eq;
    partVars(entry)["Bool " + (i + 1)] = test(evalText(entry, row.Left, scope), evalText(entry, row.Right, scope));
  });
}

function runExtraDataModule(rocket, entry) {
  const mod = (entry.part.modules || {})["Extra Data Module"];
  if (!mod) {
    return;
  }
  const store = mod.Scope === "World"
    ? (worldData.data || (worldData.data = {}))
    : mod.Scope === "Planet"
      ? (getBody(rocket.parentBody).extraData || (getBody(rocket.parentBody).extraData = {}))
      : (rocket.extraData || (rocket.extraData = {}));
  for (const row of mod.Data || []) {
    if (row.Key) {
      store[row.Key] = resolveField(entry, row.Value);
    }
  }
}

const worldData = {};

const readOnlyReaders = {
  "Velocity": (rocket) => Math.hypot(...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody)))),
  "Speed": (rocket) => Math.hypot(...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody)))),
  "Altitude": (rocket) => distanceTo(rocket, getBody(rocket.parentBody)) - getBody(rocket.parentBody).size,
  "Planet": (rocket) => rocket.parentBody,
  "Distance From Star": (rocket) => distanceTo(rocket, rootBody(getBody(rocket.parentBody))),
  "Rotation": (rocket) => ((rocket.angle * 180 / Math.PI) % 360 + 360) % 360,
  "Angular Velocity": (rocket) => rocket._angVel || 0,
  "X Position": (rocket) => rocket.pos.x,
  "Y Position": (rocket) => rocket.pos.y,
  "Heading": (rocket) => {
    const vel = relativeVelocity(rocket, getBody(rocket.parentBody));
    return ((Math.atan2(vel.x, -vel.y) * 180 / Math.PI) % 360 + 360) % 360;
  },
  "Throttle": () => throttle,
  "Time": () => t,
  "World Time": () => t,
  "Mass": (rocket) => rocket.mass,
  "Apoapsis": (rocket) => rocketOrbit(rocket).apoapsis,
  "Periapsis": (rocket) => rocketOrbit(rocket).periapsis,
  "Orbital Velocity": (rocket) => Math.hypot(...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody)))),
  "Surface Velocity": (rocket) => Math.hypot(...Object.values(relativeVelocity(rocket, getBody(rocket.parentBody)))),
  "Air Density": (rocket) => {
    const body = getBody(rocket.parentBody);
    return densityAt(body, Math.max(distanceTo(rocket, body) - body.size, 0));
  },
  "Stage Number": (rocket) => rocket.stack.parts.filter(e => (e.part.modules || {})["Decoupler Module"]).length + 1,
  "Part Count": (rocket) => rocket.stack.parts.length
};

function rootBody(body) {
  return body.parentBody ? rootBody(getBody(body.parentBody)) : body;
}

// same math as getOrbit(), just taking the rocket instead of reading the
// globally targeted one
function rocketOrbit(rocket) {
  const body = getBody(rocket.parentBody);
  const mu = gravParam(body);
  const rx = rocket.pos.x - body.pos.x;
  const ry = rocket.pos.y - body.pos.y;
  const r = Math.sqrt(rx ** 2 + ry ** 2);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  const h = rx * vel.y - ry * vel.x;
  const energy = (speed * speed) / 2 - mu / r;
  const a = -mu / (2 * energy);
  const e = Math.sqrt(Math.max(1 + (2 * energy * h * h) / (mu * mu), 0));
  return {
    apoapsis: e < 1 ? a * (1 + e) - body.size : Infinity,
    periapsis: a * (1 - e) - body.size
  };
}

function readOnlyValues(rocket) {
  const values = {};
  for (const name in readOnlyReaders) {
    try {
      values[name] = readOnlyReaders[name](rocket);
    } catch (e) {
      values[name] = undefined;
    }
  }
  return values;
}

function readOnlyOf(entry) {
  return (entry._rocket && entry._rocket._readOnly) || {};
}

function evalText(entry, expr, scope) {
  return evalFormula(interpolate(expr, scope), scope);
}

function runResourceFillerModule(entry, dt) {
  const mod = (entry.part.modules || {})["Resource Filler Module"];
  if (!mod) {
    return;
  }
  const unset = mod.Condition === undefined || mod.Condition === null || mod.Condition === "";
  if (!unset && !resolveField(entry, mod.Condition)) {
    return;
  }
  const resource = mod.Resource;
  if (!resource || !entry._rocket) {
    return;
  }
  pipeDeposit(entry._rocket, resource, (Number(resolveField(entry, mod.Rate)) || 0) * dt);
}

function clockValue(entry, value) {
  return typeof value === "string" && value.includes("{{")
    ? interpolate(value, moduleScope(entry))
    : value;
}

function applyClockAction(entry, action) {
  const vars = partVars(entry);
  const name = isBinding(action.Variable) ? action.Variable.$var : undefined;
  if (action.actionDropdown === "Set Variable" && name) {
    vars[name] = parseLogicValue(clockValue(entry, action.Value));
  } else if (action.actionDropdown === "Change Variable" && name) {
    vars[name] = (Number(vars[name]) || 0) + (Number(parseLogicValue(clockValue(entry, action.Value))) || 0);
  } else if (action.actionDropdown === "Toggle Part") {
    entry.on = !entry.on;
  }
}

function runClockFunction(entry, name) {
  const mod = (entry.part.modules || {})["Variables Clock Module"];
  const fn = mod && (mod.Functions || []).find(f => f.Name === name);
  if (!fn) {
    return;
  }
  if (!entry._clock) {
    entry._clock = {};
  }
  entry._clock[name] = { actions: fn.Action || [], i: 0, wait: 0 };
}

function tickClocks(entry, dt) {
  if (!entry._clock) {
    return;
  }
  for (const name in entry._clock) {
    const state = entry._clock[name];
    if (state.wait > 0) {
      state.wait -= dt * 1000;
      continue;
    }
    if (state.i >= state.actions.length) {
      delete entry._clock[name];
      continue;
    }
    const action = state.actions[state.i];
    if (action.actionDropdown === "Wait") {
      state.wait = action.Miliseconds || 0;
    } else {
      applyClockAction(entry, action);
    }
    state.i++;
  }
}

function runSelfDestruct(rocket, entry) {
  const mod = (entry.part.modules || {})["Self Destruct Module"];
  if (!mod || rocket.destroyed) {
    return;
  }
  if (resolveField(entry, Object.values(mod)[0])) {
    cd.body = rocket.parentBody;
    cd.speed = 0;
    cd.limit = 0;
    cd.time = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", { reason: "self destruct" });
  }
}

function runFuelpipes(rocket, dt) {
  for (const entry of rocket.stack.parts) {
    const pipe = (entry.part.modules || {})["Fuelpipe Module"];
    if (!pipe) {
      continue;
    }
    const input = pipe["Input Fuel"];
    const output = pipe["Output Fuel"];
    const rate = pipe["Rate (Kg/Sec)"] || 0;
    if (!input || !output || rate <= 0) {
      continue;
    }
    const drained = pipeDrain(rocket, input, rate * dt);
    pipeDeposit(rocket, output, drained);
  }
}

function pipeDrain(rocket, resource, want) {
  const sources = rocket.stack.parts.filter(e => (e.tanks || {})[resource] > 0);
  const avail = sources.reduce((sum, e) => sum + e.tanks[resource], 0);
  let left = Math.min(avail, want);
  const drained = left;
  for (const e of sources) {
    if (left <= 0) {
      break;
    }
    const take = Math.min(e.tanks[resource], left);
    e.tanks[resource] -= take;
    left -= take;
  }
  return drained - left;
}

function pipeDeposit(rocket, resource, amount) {
  if (amount <= 0) {
    return;
  }
  const targets = rocket.stack.parts.filter(e => (e.tanksMax || {})[resource] > 0);
  let left = amount;
  for (const e of targets) {
    if (left <= 0) {
      break;
    }
    const room = (e.tanksMax[resource] || 0) - (e.tanks[resource] || 0);
    const add = Math.min(room, left);
    e.tanks[resource] = (e.tanks[resource] || 0) + add;
    left -= add;
  }
}

function runPartLogic(dt) {
  for (const rocket of rockets) {
    if (!rocket.stack) {
      continue;
    }
    if (dt > 0) {
      rocket._angVel = ((rocket.angle - (rocket._prevAngle ?? rocket.angle)) * 180 / Math.PI) / dt;
      rocket._prevAngle = rocket.angle;
    }
    rocket._readOnly = readOnlyValues(rocket);
    for (const entry of rocket.stack.parts) {
      entry._rocket = rocket;
      elapsedTime(entry);
      runMathModule(entry);
      runBooleanModule(entry);
      runExtraDataModule(rocket, entry);
      runResourceFillerModule(entry, dt * c.timewarp);
      tickClocks(entry, dt);
      runSelfDestruct(rocket, entry);
    }
  }
}

function stageBreakdown() {
  const stack = stackSnapshot();
  if (!stack.parts.length) {
    return [];
  }
  const wet = Math.max(stackMass() * c.kgPerTon, 1);
  const trim = Math.min(1, wet / Math.max(totalFuel(stackFuel()) * c.kgPerTon, 1));
  fillTanks(stack, trim);

  const cuts = stack.parts
    .filter(entry => (entry.part.modules || {})["Decoupler Module"])
    .map(entry => entry.oy)
    .sort((a, b) => b - a);

  const sections = [];
  let above = Infinity;
  for (const cut of cuts) {
    sections.push(stack.parts.filter(entry => entry.oy >= cut && entry.oy < above));
    above = cut;
  }
  sections.push(stack.parts.filter(entry => entry.oy < above));

  const flying = new Set(stack.parts);
  const massNow = () => {
    let total = 0;
    for (const entry of flying) {
      total += (entry.part.mass || 0) * c.kgPerTon
        - totalFuel(entry.tanksMax || {})
        + totalFuel(entry.tanks || {});
    }
    return total;
  };

  const stages = [];
  for (const section of sections) {
    if (!section.length) {
      continue;
    }
    let thrust = 0;
    let perIsp = 0;
    const feed = new Set();
    for (let i = 0; i < stack.parts.length; i++) {
      const entry = stack.parts[i];
      const engine = (entry.part.modules || {})["Engine Module"];
      if (!section.includes(entry) || !engine || engine["Fuel Flow"] === "Negative") {
        continue;
      }
      for (const p of engineResources(engine)) {
        for (const tank of feedTanks(stack, i, p.resource)) {
          feed.add(tank);
        }
      }
      const push = (engine.Thrust || 0) * c.newtonsPerThrust;
      thrust += push;
      if (engine.ISP > 0) {
        perIsp += push / engine.ISP;
      }
    }
    const isp = perIsp > 0 ? thrust / perIsp : 0;
    const wetMass = massNow();
    for (const tank of feed) {
      tank.tanks = {};
    }
    const dryMass = massNow();
    const dv = isp > 0 && dryMass > 0 && wetMass > dryMass
      ? isp * G0 * Math.log(wetMass / dryMass)
      : 0;
    stages.push({ dv, thrust, wetMass, isp });
    for (const entry of section) {
      flying.delete(entry);
    }
  }
  return stages;
}

function stackSnapshot() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const inst of vab.parts) {
    const bb = partBBox(inst.part);
    const w = (inst.rot || 0) % 2 ? bb.h : bb.w;
    const h = (inst.rot || 0) % 2 ? bb.w : bb.h;
    minX = Math.min(minX, inst.x - (w / 2) * vab.scale);
    maxX = Math.max(maxX, inst.x + (w / 2) * vab.scale);
    minY = Math.min(minY, inst.y - (h / 2) * vab.scale);
    maxY = Math.max(maxY, inst.y + (h / 2) * vab.scale);
  }
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  return {
    w: (maxX - minX) / vab.scale,
    h: (maxY - minY) / vab.scale,
    parts: vab.parts.map((inst) => ({
      part: inst.part,
      ox: (inst.x - midX) / vab.scale,
      oy: (inst.y - midY) / vab.scale,
      rot: inst.rot || 0,
      paint: inst.paint
    }))
  };
}

function craftData() {
  if (!vab.parts.length) {
    return null;
  }
  const snap = stackSnapshot();
  return {
    format: "xopernicus-craft",
    version: 1,
    parts: vab.parts.map((inst, i) => ({
      name: inst.part.name,
      x: snap.parts[i].ox,
      y: snap.parts[i].oy,
      rot: inst.rot || 0,
      attachedTo: inst.attachedTo ? vab.parts.indexOf(inst.attachedTo) : null,
      parentNode: inst.parentNode || null,
      stage: inst.stage || 0,
      ...(inst.paint ? { paint: inst.paint } : {})
    }))
  };
}

function craftSave() {
  const craft = craftData();
  if (!craft) {
    return;
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(craft, null, 2)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "craft.json";
  link.click();
  URL.revokeObjectURL(url);
}

function craftExportContext() {
  const craft = craftData();
  if (!craft) {
    return;
  }
  const parts = partAPI.list();
  const ys = craft.parts.map(p => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const noseIndex = craft.parts.findIndex(p => p.y === minY);
  const tailIndex = craft.parts.findIndex(p => p.y === maxY);

  const context = {
    format: "xopernicus-craft-context",
    version: 1,
    orientation: {
      note: "Coordinates are screen-space, not math axes: SMALLER (more negative) y is toward the NOSE/top of the rocket, LARGER (more positive) y is toward the ENGINES/tail at the bottom. A part with a lower y value sits closer to the nose, not further underground. This craft is not upside down.",
      noseAt: "minimum y",
      tailAt: "maximum y",
      noseIsPartIndex: noseIndex,
      tailIsPartIndex: tailIndex
    },
    stagingNote: "The 'stage' field groups parts that fire/activate together in the VAB's staging UI. It does not by itself give flight order; use 'attachedTo' and each part's y position (nose-to-tail) to see how the stack actually comes apart.",
    parts: craft.parts.map((p, i) => {
      const def = parts.find(part => part.name === p.name);
      const modules = (def && def.modules) || {};
      const engine = modules["Engine Module"];
      const resource = modules["Resource Module"];
      const controller = modules["Controller Module"];
      const decoupler = modules["Decoupler Module"];
      return {
        index: i,
        name: p.name,
        x: p.x,
        y: p.y,
        distanceFromNose: p.y - minY,
        rot: p.rot,
        attachedTo: p.attachedTo,
        parentNode: p.parentNode,
        stage: p.stage,
        mass: def ? def.mass : null,
        engine: engine ? {
          thrustKN: engine.Thrust,
          isp: engine.ISP,
          fuel: engine.Resource,
          srb: !!engine["SRB Mode"]
        } : undefined,
        fuelTank: resource ? { amount: resource.Amount, resource: resource.Resource } : undefined,
        controller: controller ? { torque: controller.Torque, providesControl: controller["Provides Control"] } : undefined,
        decoupler: decoupler ? { separationForce: decoupler["Separation Force"] } : undefined
      };
    })
  };

  const url = URL.createObjectURL(
    new Blob([JSON.stringify(context, null, 2)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "craft-context.json";
  link.click();
  URL.revokeObjectURL(url);
}

function craftLoad(craft) {
  if (!craft || craft.format !== "xopernicus-craft" || !Array.isArray(craft.parts)) {
    console.warn("not a craft file");
    return;
  }
  const parts = partAPI.list();
  const built = [];
  for (const entry of craft.parts) {
    const part = parts.find(p => p.name === entry.name);
    if (!part) {
      console.warn(`craft wants a part that isn't loaded: ${entry.name}`);
      return;
    }
    built.push({
      part,
      x: bayCentre() + entry.x * vab.scale,
      y: height / 2 + entry.y * vab.scale,
      rot: entry.rot || 0,
      paint: entry.paint,
      attachedTo: null,
      stage: entry.stage || 0
    });
  }
  craft.parts.forEach((entry, i) => {
    const parent = built[entry.attachedTo];
    if (parent && entry.parentNode) {
      attach(built[i], parent, entry.parentNode);
    }
  });
  vab.parts = built;
  vab.drag = null;
  vab.snap = null;
}

const exampleCrafts = {
  "little-bob": {
    format: "xopernicus-craft",
    version: 1,
    parts: [
      { name: "Capsule", x: 0, y: -870.0000000000002, attachedTo: 1, parentNode: "bottom" },
      { name: "Parachute", x: 0, y: -1240.0000000000002, attachedTo: null, parentNode: null },
      { name: "Drogue Chute", x: -224.03852391233542, y: -899.0438855317732, attachedTo: null, parentNode: null },
      { name: "MD Decoupler", x: 0, y: -390.0000000000007, attachedTo: 0, parentNode: "bottom" },
      { name: "UR30 Booster", x: 0, y: 529.9999999999995, attachedTo: 3, parentNode: "bottom" }
    ]
  },
  "big-bertha": {
    format: "xopernicus-craft",
    version: 1,
    parts: [
      { name: "Capsule", x: 0, y: -2950, attachedTo: 1, parentNode: "bottom" },
      { name: "Parachute", x: 0, y: -3320.0000000000005, attachedTo: null, parentNode: null },
      { name: "Drogue Chute", x: -224.0385239123357, y: -2979.0438855317734, attachedTo: null, parentNode: null },
      { name: "MD Decoupler", x: 0, y: -2470.0000000000023, attachedTo: 0, parentNode: "bottom" },
      { name: "LG Fuel Tank", x: 0, y: -1029.9999999999989, attachedTo: 3, parentNode: "bottom" },
      { name: "LG Fuel Tank", x: 0, y: 1530.0000000000014, attachedTo: 4, parentNode: "bottom" },
      { name: "Basic Engine", x: 0, y: 3090.0000000000014, attachedTo: 5, parentNode: "bottom" }
    ]
  },
  "Unknown_527's Rocket": {
    format: "xopernicus-craft",
    version: 1,
    "parts": [
      {
        "name": "Upgraded Vacuum Engine",
        "x": 4.074500373572281e-12,
        "y": -5130.000000000005,
        "attachedTo": 1,
        "parentNode": "bottom"
      },
      {
        "name": "MD Hydrolox Tank",
        "x": 4.074500373572281e-12,
        "y": -6050.000000000002,
        "attachedTo": 2,
        "parentNode": "bottom"
      },
      {
        "name": "MD Decoupler",
        "x": 4.074500373572281e-12,
        "y": -6849.999999999999,
        "attachedTo": 3,
        "parentNode": "bottom"
      },
      {
        "name": "Capsule",
        "x": 4.074500373572281e-12,
        "y": -7330,
        "attachedTo": 4,
        "parentNode": "bottom"
      },
      {
        "name": "Parachute",
        "x": 4.074500373572281e-12,
        "y": -7700.000000000002,
        "attachedTo": null,
        "parentNode": null
      },
      {
        "name": "Drogue Chute",
        "x": -177.5153922820732,
        "y": -7501.611199389292,
        "attachedTo": null,
        "parentNode": null
      },
      {
        "name": "MD Decoupler",
        "x": 4.074500373572281e-12,
        "y": -4689.999999999997,
        "attachedTo": 0,
        "parentNode": "bottom"
      },
      {
        "name": "Basic Engine",
        "x": 4.074500373572281e-12,
        "y": 950.0000000000002,
        "attachedTo": 9,
        "parentNode": "bottom"
      },
      {
        "name": "LG Fuel Tank",
        "x": 4.074500373572281e-12,
        "y": -3169.999999999998,
        "attachedTo": 14,
        "parentNode": "bottom"
      },
      {
        "name": "LG Fuel Tank",
        "x": 4.074500373572281e-12,
        "y": -610.0000000000025,
        "attachedTo": 8,
        "parentNode": "bottom"
      },
      {
        "name": "MD Decoupler",
        "x": 4.074500373572281e-12,
        "y": 1390.0000000000005,
        "attachedTo": 7,
        "parentNode": "bottom"
      },
      {
        "name": "UR60 Booster",
        "x": 4.074500373572281e-12,
        "y": 4650.000000000001,
        "attachedTo": 10,
        "parentNode": "bottom"
      },
      {
        "name": "UR60 Booster",
        "x": 640.0000000000043,
        "y": 4650.000000000001,
        "attachedTo": 11,
        "parentNode": "right"
      },
      {
        "name": "UR60 Booster",
        "x": -640.0000000000043,
        "y": 4650.000000000001,
        "attachedTo": 11,
        "parentNode": "left"
      },
      {
        "name": "Turbo Reactionwheel",
        "x": 4.074500373572281e-12,
        "y": -4489.999999999997,
        "attachedTo": 6,
        "parentNode": "bottom"
      }
    ]
  }
};

let craftInput = null;

function craftPick() {
  if (!craftInput) {
    craftInput = document.createElement("input");
    craftInput.type = "file";
    craftInput.accept = ".json,application/json";
    craftInput.style.display = "none";
    document.body.appendChild(craftInput);
    craftInput.addEventListener("change", () => {
      const file = craftInput.files[0];
      craftInput.value = "";   // or the same file twice running fires nothing
      if (file) {
        file.text()
          .then(text => craftLoad(JSON.parse(text)))
          .catch(err => console.warn("craft won't load:", err));
      }
    });
  }
  craftInput.click();
}

function isBasePack(pack) {
  return pack.parts.some(part => part.name === "_vab");
}

function packKey(pack) {
  return JSON.stringify(pack, (key, value) => (key.startsWith("_") || key === "setInfo" ? undefined : value));
}

function saveReplacer(key, value) {
  if (key === "fx" || key.startsWith("_") || key === "setInfo") {
    return undefined;
  }
  return key === "part" ? value.name : value;
}

function gameSave() {
  const save = {
    format: "xopernicus-save",
    version: 1,
    t, balance, careerMode, career: careerMode ? career : undefined, craft: craftData() || undefined, target, camera, rockets, loaded
  };
  const text = JSON.stringify(save, saveReplacer, 2);
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = careerMode ? "career-world.json" : "sandbox-world.json";
  link.click();
  URL.revokeObjectURL(url);
  launchToast(careerMode ? "Career world exported." : "Sandbox world exported.");
}

async function gameLoad(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    console.warn("save won't load:", err);
    launchToast("Save won't load.");
    return;
  }
  if (raw.format !== "xopernicus-save" || !Array.isArray(raw.rockets)) {
    launchToast("Not a save file.");
    return;
  }
  if (raw.careerMode && raw.career && careerHasProgress() &&
      !confirm("This career world replaces your current career progress. Import it anyway?")) {
    return;
  }
  if (Array.isArray(raw.loaded) && raw.loaded.length) {
    const known = new Set(loaded.map(packKey));
    let addedMods = false;
    for (const pack of raw.loaded.filter(pack => !isBasePack(pack))) {
      const key = packKey(pack);
      if (!known.has(key)) {
        known.add(key);
        if (await loadPack(pack, { silent: true })) {
          addedMods = true;
        }
      }
    }
    if (addedMods) {
      await loadPartTextures();
    }
  }
  const parts = partAPI.list();
  let save;
  try {
    save = JSON.parse(text, (key, value) => {
      if (key !== "part") {
        return value;
      }
      const part = parts.find(p => p.name === value) || hiddenPart(value);
      if (!part) {
        throw new Error(`save wants a part that isn't loaded: ${value}`);
      }
      return part;
    });
  } catch (err) {
    console.warn("save won't load:", err);
    launchToast("Save won't load.");
    return;
  }
  t = save.t;
  balance = save.balance;
  careerMode = save.careerMode;
  if (careerMode && save.career) {
    restoreCareer(save.career);
  }
  target = save.target;
  camera = save.camera;
  rockets = save.rockets;
  if (raw.craft) {
    craftLoad(raw.craft);
  }
  threadQueues = [];   // the old threads point at rockets that are gone
  updateBodies();
  launchToast(careerMode ? "Career world imported." : "Sandbox world imported.");
}

let saveInput = null;

function gamePick() {
  if (!saveInput) {
    saveInput = document.createElement("input");
    saveInput.type = "file";
    saveInput.accept = ".json,application/json";
    saveInput.style.display = "none";
    document.body.appendChild(saveInput);
    saveInput.addEventListener("change", () => {
      const file = saveInput.files[0];
      saveInput.value = "";   // or the same file twice running fires nothing
      if (file) {
        file.text().then(gameLoad);
      }
    });
  }
  saveInput.click();
}

function launchToast(message) {
  toasts.push({
    message: message,
    hide: t + 3
  })
}

function launch() {
  if (!vab.parts.length) {
    return;
  }
  if (!vab.parts.some(inst => {
    const controller = (inst.part.modules || {})["Controller Module"];
    return !!controller && controller["Provides Control"] !== false;
  })) {
    launchToast("Needs a pod or probe core");
    return;
  }
  if (vab.parts.some(inst => !partAvailable(inst.part))) {
    launchToast("Rocket has locked parts.");
    return;
  }
  balance -= stackCost();
  if (careerMode) {
    saveCareer();
  }
  const earth = getBody("Earth");
  const stack = stackSnapshot();
  const halfHeight = stack.h / 2 / c.partUnits;
  const wet = Math.max(stackMass() * c.kgPerTon, 1);
  const trim = Math.min(1, wet / Math.max(totalFuel(stackFuel()) * c.kgPerTon, 1));
  fillTanks(stack, trim);
  const tanks = stackTanks(stack);
  const fuel = totalFuel(tanks);
  const padAngle = radians(c.launchPadRotation);
  const out = { x: Math.sin(padAngle), y: -Math.cos(padAngle) };
  const pad = { x: earth.pos.x + out.x * earth.size, y: earth.pos.y + out.y * earth.size };
  rockets = rockets.filter(rocket => Math.hypot(rocket.pos.x - pad.x, rocket.pos.y - pad.y) > 150);
  const rocket = {
    pos: {
      x: earth.pos.x + out.x * (earth.size + halfHeight),
      y: earth.pos.y + out.y * (earth.size + halfHeight)
    },
    vel: { x: earth.vel.x, y: earth.vel.y },
    mass: wet,
    dryMass: Math.max(wet - fuel, 1),
    fuel,
    fuelMax: fuel,
    tanks,
    tanksMax: { ...tanks },
    angle: padAngle,
    dragArea: 10,
    dragCoeff: 0.5,
    id: `flight-${rockets.length + 1}`,
    parentBody: "Earth",
    landed: { x: out.x, y: out.y },
    launchNo: careerMode ? ++career.launches : 0,
    stack
  };
  rockets.push(rocket);
  splitRocket(rocket, () => false, 0);
  target = rocket.id;
  rocketTimeline = [];
  timelineLastThrottle = null;
  timelineLastTurn = null;
  timelineLastSample = -Infinity;
  logTimelineEvent(rocket, "launch");
  if (careerMode) {
    saveCareer();
  }
  inVab = false;
}

function partTooltip(part) {
  const lines = [part.name];
  const modules = part.modules || {};
  for (const moduleName in modules) {
    lines.push(moduleName);
    const props = modules[moduleName];
    for (const key in props) {
      lines.push(`  ${key}: ${props[key]}`);
    }
  }
  return lines;
}

let rockets = [
  {
    pos: { x: 0, y: -3911000 },
    vel: { x: 3487, y: 0 },
    mass: 1000,
    angle: 0,
    dragArea: 10,
    dragCoeff: 0.5,
    id: "untitled-1",
    parentBody: "Mars"
  }
]

let planets = [
  {
    id: "Sun",
    parentBody: null,
    size: 696340000,
    surfaceGravity: 274,
    texture: "Sun",
    glow: 2000000000,
    glowTexture: "SunAtmo",
    glowColor: "#ffd333",
    hazeColor: "#e6c98f",
    hazeMax: 1,
    noSurface: true,
    luminosity: 3.828e26,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Mercury",
    parentBody: "Sun",
    orbitRadius: 57909050000,
    orbitPeriod: 7600544,
    orbitPhase: 2.1,
    size: 2439700,
    surfaceGravity: 3.7,
    texture: "Mercury",
    fallbackColor: "#8c8a89",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Venus",
    parentBody: "Sun",
    orbitRadius: 108208000000,
    orbitPeriod: 19414166,
    orbitPhase: 4.4,
    size: 6051800,
    surfaceGravity: 8.87,
    atmosphereHeight: 250000,
    density: 65,
    scaleHeight: 15900,
    atmoTransition: 60000,
    scaleHeightTop: 5000,
    texture: "Venus",
    fallbackColor: "#e8cda2",
    skyColor: "#e8b962",
    hazeColor: "#e6c98f",
    hazeMax: 0.98,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Earth",
    parentBody: "Sun",
    orbitRadius: 149598023000,
    orbitPeriod: 31558150,
    size: 6371000,
    waterColor: "#213c6e",
    surfaceGravity: 9.80665,
    atmosphereHeight: 140000,
    density: 1.225,
    scaleHeight: 8500,
    texture: "Earth",
    cloudTexture: "EarthClouds",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Moon",
    parentBody: "Earth",
    orbitRadius: 384400000,
    orbitPeriod: 2360591.5,
    size: 1737400,
    surfaceGravity: 1.62,
    texture: "Moon",
    fallbackColor: "#8c8a89",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Mars",
    parentBody: "Sun",
    orbitRadius: 227939366000,
    orbitPeriod: 59355036,
    orbitPhase: 0.8,
    size: 3389500,
    surfaceGravity: 3.72076,
    atmosphereHeight: 125000,
    density: 0.02,
    scaleHeight: 11100,
    texture: "Mars",
    fallbackColor: "#c1440e",
    skyColor: "#c98f63",
    hazeColor: "#d9a06a",
    hazeMax: 0.3,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Jupiter",
    parentBody: "Sun",
    gasGiant: true,
    orbitRadius: 778500000000,
    orbitPeriod: 374335776,
    orbitPhase: 5.5,
    size: 69911000,
    surfaceGravity: 24.79,
    atmosphereHeight: 6000000,
    density: 0.16,
    scaleHeight: 200000,
    texture: "Jupiter",
    fallbackColor: "#c8a882",
    skyColor: "#c9a06a",
    hazeColor: "#d8b48c",
    hazeMax: 0.2,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Ceres",
    parentBody: "Sun",
    orbitRadius: 413690250000,
    orbitPeriod: 145164960,
    orbitPhase: 3.3,
    size: 469700,
    surfaceGravity: 0.28,
    texture: "Ceres",
    fallbackColor: "#8f8b85",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Saturn",
    parentBody: "Sun",
    gasGiant: true,
    orbitRadius: 1433530000000,
    orbitPeriod: 929596608,
    orbitPhase: 1.7,
    size: 58232000,
    surfaceGravity: 10.44,
    atmosphereHeight: 6000000,
    density: 0.19,
    scaleHeight: 260000,
    texture: "Saturn",
    fallbackColor: "#d9c08a",
    skyColor: "#e0c58f",
    hazeColor: "#ecd6a6",
    hazeMax: 0.2,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Uranus",
    parentBody: "Sun",
    gasGiant: true,
    orbitRadius: 2870972000000,
    orbitPeriod: 2651370019,
    orbitPhase: 4.9,
    size: 25362000,
    surfaceGravity: 8.69,
    atmosphereHeight: 3000000,
    density: 0.42,
    scaleHeight: 270000,
    texture: "Uranus",
    fallbackColor: "#a9d6e0",
    skyColor: "#9fd0dc",
    hazeColor: "#bfe4ec",
    hazeMax: 0.2,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  },
  {
    id: "Neptune",
    parentBody: "Sun",
    gasGiant: true,
    orbitRadius: 4498396000000,
    orbitPeriod: 5199724800,
    orbitPhase: 0.3,
    size: 24622000,
    surfaceGravity: 11.15,
    atmosphereHeight: 3000000,
    density: 0.45,
    scaleHeight: 200000,
    texture: "Neptune",
    fallbackColor: "#3f5fd0",
    skyColor: "#4a6ad8",
    hazeColor: "#6f8ce4",
    hazeMax: 0.2,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 }
  }
]

let skyTip;
let skySurface;
let hazeColor;
let textures = {};
let booting = true;

const bootTextures = {
  Earth: "assets/Earth.avif",
  EarthClouds: "assets/EarthClouds.avif",
  Sun: "assets/Sun.avif",
  Venus: "assets/Venus.avif",
  Mercury: "assets/Mercury.avif",
  SunAtmo: "assets/SunAtmo.avif",
  Mars: "assets/Mars.avif",
  Moon: "assets/Moon.avif",
  Jupiter: "assets/Jupiter.avif",
  Ceres: "assets/Ceres.avif",
  Saturn: "assets/Saturn.avif",
  Uranus: "assets/Uranus.avif",
  Neptune: "assets/Neptune.avif",
  CoolScreen: "assets/CoolScreen.avif",
  VAB: "assets/VAB.png",
  Launchpad: "assets/Launchpad.webp",
  Launchtower: "assets/Launchtower.webp"
};

function assetBytesLoaded() {
  let total = 0;
  for (const entry of performance.getEntriesByType("resource")) {
    if (entry.name.includes("/assets/")) {
      total += entry.transferSize || entry.encodedBodySize || 0;
    }
  }
  return total;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(0)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const splashHold = 500; //500
const splashFade = 400; //400
let credits = "p5.js | textures by Solar System Scope | font: DM Mono";

if (developerMode) {
  credits = "p5.js | textures by Solar System Scope | font: DM Mono | DEVELOPER BUILD"
}

const injectionsKey = "weborbit-injections";

function loadInjections() {
  try {
    const list = JSON.parse(localStorage.getItem(injectionsKey));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveInjections(list) {
  localStorage.setItem(injectionsKey, JSON.stringify(list));
}

function runInjections() {
  let current = "";
  const onError = (e) => console.error(`Injection "${current}" failed`, e.error || e.message);
  window.addEventListener("error", onError);
  for (const inj of loadInjections()) {
    if (!inj.on) {
      continue;
    }
    current = inj.name;
    const el = document.createElement("script");
    el.textContent = `${inj.code}\n//# sourceURL=injection-${encodeURIComponent(inj.name)}.js`;
    document.head.append(el);
    el.remove();
  }
  window.removeEventListener("error", onError);
}

function drawBootMenu(title, items, sel, help) {
  const fs = height > 800 ? 32 : 16;
  const bx = fs;
  const by = fs * 3.5;
  const bw = width - fs * 2;
  const bh = height - by - fs * 6;
  push();
  resetMatrix();
  background(0);
  textFont(bootFont);
  rawTextSize(fs);
  fill(255);
  noStroke();
  textAlign(CENTER, TOP);
  text(title, width / 2, fs);
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(bx, by, bw, bh);
  noStroke();
  textAlign(LEFT, TOP);
  const rows = Math.floor((bh - fs) / fs);
  const first = Math.max(0, Math.min(sel - rows + 1, items.length - rows));
  for (let i = 0; i < Math.min(rows, items.length); i++) {
    const y = by + fs / 2 + i * fs;
    const on = first + i === sel;
    if (on) {
      fill(200);
      rect(bx + 4, y, bw - 8, fs);
      fill(0);
    } else {
      fill(255);
    }
    text((on ? "*" : " ") + items[first + i], bx + 8, y);
  }
  fill(255);
  text(help, fs * 2.5, height - fs * 4.5, width - fs * 5, fs * 4);
  pop();
}

let bootFontFace;

function editInjection(inj) {
  const fs = height > 800 ? 32 : 16;
  bootFontFace ||= new FontFace("BootFont", "url(assets/Bootloader.ttf)").load().then((f) => document.fonts.add(f));
  const wrap = document.createElement("div");
  wrap.style.cssText = `position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;gap:${fs / 2}px;padding:${fs}px;background:#000;color:#fff;font:${fs}px BootFont,monospace`;
  const field = "background:#000;color:#fff;border:2px solid #fff;font:inherit;outline:none;padding:4px;";
  const name = document.createElement("input");
  name.style.cssText = field;
  name.placeholder = "Injection name";
  name.value = inj ? inj.name : "";
  const code = document.createElement("textarea");
  code.style.cssText = field + "flex:1;resize:none;white-space:pre;tab-size:2";
  code.spellcheck = false;
  code.placeholder = "Paste JavaScript here";
  code.value = inj ? inj.code : "";
  const hint = document.createElement("div");
  hint.textContent = "Ctrl+Enter to save, ESC to cancel.";
  wrap.append(name, code, hint);
  return bootFontFace.then(() => new Promise((resolve) => {
    wrap.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        wrap.remove();
        resolve(e.key === "Escape" ? null : { name: name.value.trim() || "Untitled", code: code.value });
      }
    });
    document.body.append(wrap);
    (inj ? code : name).focus();
  }));
}

function exportInjections(list) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(list, null, 2)], { type: "application/json" }));
  a.download = "weborbit-injections.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importInjections() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("cancel", () => resolve(null));
    input.addEventListener("change", async () => {
      try {
        const data = JSON.parse(await input.files[0].text());
        resolve(data.filter((i) => i && typeof i.name === "string" && typeof i.code === "string").map((i) => ({ name: i.name, code: i.code, on: i.on !== false })));
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}

async function runBootloader() {
  const keys = [];
  const onKey = (e) => {
    keys.push(e.key);
    e.preventDefault();
  };
  window.addEventListener("keydown", onKey);
  let screen = "main";
  let sel = 0;
  let list = loadInjections();
  let note = "";
  let done = false;
  while (!done) {
    const injScreen = screen === "inj";
    const items = injScreen
      ? [...list.map((i) => `[${i.on ? "x" : " "}] ${i.name}`), "Add injection"]
      : ["WebOrbit", "Manage Injections", "Export Injections", "Import Injections"];
    const n = items.length;
    sel = constrain(sel, 0, n - 1);
    let help = "Use the \u2191 and \u2193 keys to select which entry is highlighted.\nPress enter to boot the selected entry or ESC to boot normally.";
    if (injScreen) {
      help = "Press enter to toggle the selected injection, 'e' to open the code editor, 'd' to delete it, or ESC to return to the previous menu.";
    }
    if (note) {
      help += `\n${note}`;
    }
    drawBootMenu("WebOrbit Boot Manager", items, sel, help);
    while (keys.length) {
      const k = keys.shift();
      if (k === "ArrowUp") {
        sel = (sel + n - 1) % n;
      } else if (k === "ArrowDown") {
        sel = (sel + 1) % n;
      } else if (k === "Enter") {
        if (!injScreen) {
          if (sel === 0) {
            done = true;
          } else if (sel === 1) {
            screen = "inj";
            sel = 0;
          } else if (sel === 2) {
            exportInjections(list);
            note = `Exported ${list.length} injection(s).`;
          } else {
            const imported = await importInjections();
            keys.length = 0;
            if (imported) {
              list.push(...imported);
              saveInjections(list);
            }
            note = imported ? `Imported ${imported.length} injection(s).` : "Import failed or cancelled.";
          }
        } else if (sel === list.length) {
          const made = await editInjection(null);
          if (made && made.code) {
            list.push({ ...made, on: true });
            saveInjections(list);
          }
        } else {
          list[sel].on = !list[sel].on;
          saveInjections(list);
        }
      } else if (k === "Escape") {
        if (injScreen) {
          screen = "main";
          sel = 1;
        } else {
          done = true;
        }
      } else if (injScreen && sel < list.length && k === "d") {
        list.splice(sel, 1);
        saveInjections(list);
      } else if (injScreen && sel < list.length && k === "e") {
        const edited = await editInjection(list[sel]);
        if (edited) {
          Object.assign(list[sel], edited);
          saveInjections(list);
        }
      }
    }
    await nextFrame();
  }
  window.removeEventListener("keydown", onKey);
}

function nextFrame() {
  return new Promise(r => requestAnimationFrame(r));
}

function drawSplash(alpha) {
  const y = height / 2;
  background(0);
  noStroke();
  textAlign(CENTER, CENTER);
  fill(255, alpha);
  textSize(54);
  if (developerMode) {
    fill("Yellow");
  }
  text("WebOrbit", width / 2, y - 24);
  fill(160, alpha);
  textSize(19);
  text("by @sorabora", width / 2, y + 28);
  fill(100, alpha);
  textSize(14);
  text(credits, width / 2, y + 84);
}

async function runSplash() {
  const start = performance.now();
  for (;;) {
    const t = performance.now() - start;
    if (t >= splashHold + splashFade) break;
    drawSplash(255 * (t < splashHold ? 1 : 1 - (t - splashHold) / splashFade));
    await nextFrame();
  }
}

// off the right edge, only half showing, while assets are still loading
function loadingEarthGeom() {
  const r = Math.min(width, height) * 0.58;
  return { x: width - r * 0.35, y: height / 2, r };
}

// bigger and off the left edge instead, once Play has been pressed
function menuEarthGeom() {
  const r = Math.min(width, height) * 0.75;
  return { x: -r * 0.1, y: height / 2, r };
}

let introEarth = null;

function drawIntroEarth(geom) {
  let img;

  if (rng >= 30) {
    img = textures.Earth;
  } else if (rng >= 5) {
    img = textures.Mars;
  } else if (rng >= 2) {
    img = textures.Jupiter;
  } else if (rng == 1) {
    img = textures.Sun
  }
  if (!img) {
    return;
  }
  push();

  let glowRGB = "125,180,255";
  let tintRGB = "125,180,255";
  let tintA = 0.8;
  if (img == textures.Mars) {
    glowRGB = "255,140,90";
    tintRGB = "255,100,60";
    tintA = 0.56;
  } else if (img == textures.Jupiter) {
    glowRGB = "235,200,150";
    tintRGB = "230,180,120";
    tintA = 0.56;
  } else if (img == textures.Sun) {
    glowRGB = "255,210,90";
    tintRGB = "255,190,60";
    tintA = 0.56;
  }

  const atmoR = geom.r * 1.1;
  const glow = drawingContext.createRadialGradient(
    geom.x, geom.y, geom.r * 0.9,
    geom.x, geom.y, atmoR
  );
  glow.addColorStop(0, `rgba(${glowRGB},0.55)`);
  glow.addColorStop(1, `rgba(${glowRGB},0)`);
  drawingContext.save();
  drawingContext.fillStyle = glow;
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, atmoR, 0, TWO_PI);
  drawingContext.fill();
  drawingContext.restore();

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, geom.r, 0, TWO_PI);
  drawingContext.clip();
  imageMode(CENTER);
  image(img, geom.x, geom.y, geom.r * 2, geom.r * 2);
  let clouds = textures.EarthClouds;
  if (img == textures.Mars) {
    clouds = textures.Jupiter;
    // overlayed jupiter looks like faint clouds
    // pretty neat right?
  } else if (img != textures.Earth) {
    clouds = null;
  }
  if (clouds) {
    blendMode(SCREEN);
    drawingContext.globalAlpha = c.cloudMax;
    push();
    translate(geom.x, geom.y);
    rotate(millis() / 8000);
    image(clouds, 0, 0, geom.r * 2 * c.cloudScale, geom.r * 2 * c.cloudScale);
    pop();
    drawingContext.globalAlpha = 1;
    blendMode(BLEND);
  }
  if (img == textures.Earth) {
    const haze = drawingContext.createRadialGradient(
      geom.x, geom.y, 0,
      geom.x, geom.y, geom.r
    );
    haze.addColorStop(0, `rgba(${tintRGB},0.05)`);
    haze.addColorStop(1, `rgba(${tintRGB},${tintA})`);
    drawingContext.fillStyle = haze;
  } else {
    drawingContext.fillStyle = `rgba(${tintRGB},${tintA})`;
  }
  drawingContext.beginPath();
  drawingContext.arc(geom.x, geom.y, geom.r, 0, TWO_PI);
  drawingContext.fill();
  drawingContext.restore();
  pop();
}

function drawBootScreen(progress) {
  const barW = min(width * 0.4, 420);
  const barH = 10;
  const x = (width - barW) / 2;
  const y = height * 0.82;
  background(0);
  drawIntroEarth(loadingEarthGeom());
  noStroke();
  textAlign(CENTER, CENTER);
  fill(170);
  textSize(15);
  text(formatBytes(assetBytesLoaded()), width / 2, y - 28);
  fill(38);
  rect(x, y, barW, barH, barH / 2);
  fill("#3a7bd5");
  rect(x, y, barW * constrain(progress, 0, 1), barH, barH / 2);
  eProgress = progress;
  fill(85);
  textSize(13);
  text(credits, width / 2, height - 44);
  if (bootloaderOn && bootFont) {
    push();
    textFont(bootFont);
    rawTextSize(16);
    fill(110);
    textAlign(CENTER, BOTTOM);
    text("Press DEL to enter the boot manager", width / 2, height - 12);
    pop();
  }
}

function playButtonRect() {
  const sx = 200;
  const sy = 60;
  return { x: width * 0.08, y: height * 0.55, sx, sy };
}

async function waitForPlay() {
  let wasPressed = mouseIsPressed;
  for (;;) {
    background(0);
    drawIntroEarth(loadingEarthGeom());
    noStroke();
    textAlign(LEFT, CENTER);
    fill("White");
    textSize(90);
    text("WebOrbit", width * 0.08, height * 0.32);
    GUIAPI.buttons = [];
    GUIAPI.blockers = [];
    GUIAPI.order = 0;
    const btn = playButtonRect();
    textSize(22);
    GUIAPI.button(btn.x, btn.y, btn.sx, btn.sy, { id: "intro-play", ...menuStyle }, "Play");
    fill(85);
    textSize(13);
    textAlign(CENTER, CENTER);
    text(credits, width / 2, height - 44);
    if (mouseIsPressed && !wasPressed && GUIAPI.clicked("intro-play")) {
      break;
    }
    wasPressed = mouseIsPressed;
    await nextFrame();
  }
}

// a plain lerp from where it was loading to where the menu keeps it, no easing
async function runEarthTransition() {
  const from = loadingEarthGeom();
  const to = menuEarthGeom();
  const duration = 900;
  const start = performance.now();
  for (;;) {
    const p = constrain((performance.now() - start) / duration, 0, 1);
    introEarth = {
      x: lerp(from.x, to.x, p),
      y: lerp(from.y, to.y, p),
      r: lerp(from.r, to.r, p)
    };
    background(0);
    drawIntroEarth(introEarth);
    if (p >= 1) {
      break;
    }
    await nextFrame();
  }
}

async function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  GUIAPI.onButton = buttonOnClick;
  bootFont = await loadFont('assets/Bootloader.ttf');
  rawTextSize = textSize;

  Object.defineProperty(window, "textSize", {
    configurable: true,
    enumerable: true,
    value: (size) => rawTextSize(size / 1.2)
  });
  skyTip = color("#000000");
  skySurface = color("#3a7bd5");
  hazeColor = color(c.hazeColor);

  const bootNames = Object.keys(bootTextures);
  const bootSteps = bootNames.length + 1;
  let bootDone = 0;
  let loaded = false;

  gameFont = await loadFont('assets/Font.ttf'); // DM Mono
  textFont(gameFont);

  const loadAll = (async () => {
    for (const name of bootNames) {
      textures[name] = await loadImage(bootTextures[name]);
      bootDone++;
    }
    await restoreLoadedMods();
    await loadPartTextures();
    bootDone++;
  })().finally(() => (loaded = true));

  let wantBoot = false;
  const onBootKey = (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      wantBoot = true;
    }
  };
  if (bootloaderOn) {
    window.addEventListener("keydown", onBootKey);
  }
  while (!loaded) {
    if (wantBoot) {
      wantBoot = false;
      await runBootloader();
    }
    drawBootScreen(bootDone / bootSteps);
    await nextFrame();
  }
  await loadAll;
  window.removeEventListener("keydown", onBootKey);
  if (wantBoot) {
    await runBootloader();
  }
  runInjections();
  if (!skipPlayScreen) {
    await waitForPlay();
    await runEarthTransition();
  }
  booting = false;

  if (skipPlayScreen && prototypeCareerModeEnabled) {
    startCareer();
  }

  updateBodies();
  for (const rocket of rockets) {
    const body = getBody(rocket.parentBody);
    rocket.pos.x += body.pos.x;
    rocket.pos.y += body.pos.y;
    rocket.vel.x += body.vel.x;
    rocket.vel.y += body.vel.y;
  }
}

async function executeLowPriority() {
  if (localStorage.getItem("weborbit-metadata") === null) {
    localStorage.setItem("weborbit-metadata", {
      firstUsed: Date.now()
    });
  }

  featuredMods = await getData();
}

function getBody(id) {
  return planets.find(planet => planet.id === id);
}

function gravParam(body) {
  return body.surfaceGravity * body.size * body.size;
}

// solves Kepler's equation E - e*sin(E) = M by Newton
function eccentricAnomaly(mean, e) {
  if (!e) {
    return mean;
  }
  let E = mean;
  for (let i = 0; i < 12; i++) {
    const step = (E - e * Math.sin(E) - mean) / (1 - e * Math.cos(E));
    E -= step;
    if (Math.abs(step) < 1e-12) {
      break;
    }
  }
  return E;
}

function updateBodies() {
  for (const body of planets) {
    if (!body.parentBody) {
      continue;
    }
    const parent = getBody(body.parentBody);
    // orbitRadius is the semi-major axis, periapsis sits along +x
    const a = body.orbitRadius;
    const e = body.orbitEccentricity || 0;
    const b = a * Math.sqrt(1 - e * e);
    const laps = (t / body.orbitPeriod) % 1;
    const mean = (body.orbitPhase || 0) + TWO_PI * laps;
    const E = eccentricAnomaly(mean, e);
    body.pos.x = parent.pos.x + a * (Math.cos(E) - e);
    body.pos.y = parent.pos.y + b * Math.sin(E);
    const rate = (TWO_PI / body.orbitPeriod) / (1 - e * Math.cos(E));
    body.vel.x = parent.vel.x - a * Math.sin(E) * rate;
    body.vel.y = parent.vel.y + b * Math.cos(E) * rate;
  }
}

// sphere of influence radius: a * (m/M)^(2/5)
function soiRadius(body) {
  if (!body.parentBody) {
    return Infinity;
  }
  const parent = getBody(body.parentBody);
  return body.orbitRadius * Math.pow(gravParam(body) / gravParam(parent), 0.4);
}

function distanceTo(rocket, body) {
  return Math.hypot(body.pos.x - rocket.pos.x, body.pos.y - rocket.pos.y);
}

function updateSOI(rocket) {
  let body = getBody(rocket.parentBody);
  while (body.parentBody && distanceTo(rocket, body) > soiRadius(body)) {
    body = getBody(body.parentBody);
  }
  let entered = true;
  while (entered) {
    entered = false;
    for (const child of planets) {
      if (child.parentBody === body.id && distanceTo(rocket, child) < soiRadius(child)) {
        body = child;
        entered = true;
        break;
      }
    }
  }
  rocket.parentBody = body.id;
}

function format(unit, value) {
  switch (unit) {
    case "speed":
      if (value >= 299792458 * 0.01) {
        if (value / 299792458 >= 1) {
          return `${(value / 299792458).toFixed(2)}c`;
        } else {
          return `${(value / 299792458 * 100).toFixed(1)}% c`;
        }
      } else if (value >= 99999) {
        return `${Math.round(value / 1000)} km/s`;
      } else {
        return `${Math.round(value)} m/s`;
      }
    case "distance":
      if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(3)} Gm`;
      } else if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(2)} Mm`;
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(1)} km`;
      } else {
        return `${Math.round(value)} m`;
      }
    case "pressure":
      if (value >= 1000) {
        return `${(value / 1000).toFixed(2)} kPa`;
      } else if (value >= 1) {
        return `${value.toFixed(2)} Pa`;
      } else if (value >= 1e-3) {
        return `${(value * 1e3).toFixed(2)} mPa`;
      } else if (value >= 1e-6) {
        return `${(value * 1e6).toFixed(2)} µPa`;
      } else if (value >= 1e-11) {
        return `${(value * 1e9).toFixed(2)} nPa`;
      } else {
        return `Vacuum`;
      }
    case "temperature":
      return `${(value - 273.15).toFixed(1)} °C`;
  }
}

const stefanBoltzmann = 5.670374e-8;

function calculateTemperature() {
  const rocket = rockets.find(rocket => rocket.id === target);
  return format("temperature", ambientTemperature(rocket));
}

function ambientTemperature(rocket) {
  const body = getBody(rocket.parentBody);

  let flux = 0;
  for (const planet of planets) {
    if (!planet.luminosity) {
      continue;
    }
    const r = distanceTo(rocket, planet);
    if (r > 0) {
      flux += planet.luminosity / (4 * Math.PI * r * r);
    }
  }

  const albedo = rocket.albedo || 0;
  const equilibriumTemp = Math.pow(((1 - albedo) * flux) / (4 * stefanBoltzmann), 0.25);

  const rawAlt = distanceTo(rocket, body) - body.size;
  const alt = hasSurface(body) ? Math.max(rawAlt, 0) : rawAlt;
  const pressure = pressureAt(body, alt);

  const referencePressure = 101325; // Earth sea-level, Pa
  const ratio = pressure > 0 ? pressure / referencePressure : 0;
  const greenhouseFactor = ratio > 0
    ? 1 + 0.10 * Math.log10(ratio + 1) * Math.log10(ratio + 10)
    : 1;

  return equilibriumTemp * greenhouseFactor;
}

function heatBox(entry) {
  const bb = partBBox(entry.part);
  const turned = (entry.rot || 0) % 2 !== 0;
  return { x: entry.ox, y: entry.oy, hw: (turned ? bb.h : bb.w) / 2, hh: (turned ? bb.w : bb.h) / 2 };
}

function rayHitsBox(px, py, dx, dy, box) {
  let near = 0;
  let far = Infinity;
  for (const [p, d, low, high] of [[px, dx, box.x - box.hw, box.x + box.hw], [py, dy, box.y - box.hh, box.y + box.hh]]) {
    if (Math.abs(d) < 1e-9) {
      if (p < low || p > high) {
        return false;
      }
      continue;
    }
    const a = (low - p) / d;
    const b = (high - p) / d;
    near = Math.max(near, Math.min(a, b));
    far = Math.min(far, Math.max(a, b));
    if (near > far) {
      return false;
    }
  }
  return far > 1e-6;
}

function heatExposure(boxes, blockBoxes, index, dir) {
  const mine = boxes[index];
  const reach = Math.abs(dir.y) * mine.hw + Math.abs(dir.x) * mine.hh;
  let open = 0;
  for (const share of [-0.8, -0.4, 0, 0.4, 0.8]) {
    const px = mine.x - dir.y * reach * share;
    const py = mine.y + dir.x * reach * share;
    if (!blockBoxes.some((box, j) => j !== index && rayHitsBox(px, py, dir.x, dir.y, box))) {
      open++;
    }
  }
  return open / 5;
}

function localDir(rocket, wx, wy) {
  const cos = Math.cos(rocket.angle);
  const sin = Math.sin(rocket.angle);
  return { x: wx * cos + wy * sin, y: -wx * sin + wy * cos };
}

function starLight(rocket) {
  let flux = 0;
  let dx = 0;
  let dy = 0;
  for (const planet of planets) {
    if (!planet.luminosity) {
      continue;
    }
    const vx = planet.pos.x - rocket.pos.x;
    const vy = planet.pos.y - rocket.pos.y;
    const r = Math.hypot(vx, vy);
    if (r > 0) {
      const f = planet.luminosity / (4 * Math.PI * r * r);
      flux += f;
      dx += (vx / r) * f;
      dy += (vy / r) * f;
    }
  }
  const length = Math.hypot(dx, dy);
  return flux > 0 && length > 0 ? { flux, x: dx / length, y: dy / length } : null;
}

function shieldArea(entry) {
  return Math.PI * (heatBox(entry).hw / c.partUnits) ** 2;
}

function explodeParts(rocket, entries) {
  rocket.stack.parts = rocket.stack.parts.filter(entry => !entries.includes(entry));
  if (rocket.id === target) {
    launchToast(entries.length > 1 ? `${entries.length} parts overheated` : `${entries[0].part.name} overheated`);
  }
  logTimelineEvent(rocket, "overheat", { parts: entries.map(entry => entry.part.name) });
  if (!rocket.stack.parts.length) {
    cd.body = rocket.parentBody;
    cd.speed = 0;
    cd.limit = 0;
    cd.time = t;
    cd.message = "Every part burned up";
    cd.messageAt = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", { reason: "burned up" });
    return;
  }
  splitRocket(rocket, () => false, 0, true);
}

function updateRocketTemp(rocket, dt) {
  const body = getBody(rocket.parentBody);
  const ambient = ambientTemperature(rocket);
  if (rocket.temp === undefined) {
    rocket.temp = ambient;
  }
  const alt = Math.max(distanceTo(rocket, body) - body.size - rocketRadius(rocket), 0);
  const inAir = !!body.atmosphereHeight && alt < body.atmosphereHeight;
  const vel = relativeVelocity(rocket, body);
  const speed = Math.hypot(vel.x, vel.y);
  const flux = inAir
    ? 0.5 * densityAt(body, alt) * Math.pow(Math.max(speed - c.reentryMinSpeed, 0), 3) * c.reentryHeatFactor
    : 0;
  const blend = 1 - Math.exp(-c.reentryCoolRate * dt);
  const parts = rocket.stack ? rocket.stack.parts : [];
  if (!parts.length) {
    const targetTemp = Math.pow(Math.pow(ambient, 4) + flux / stefanBoltzmann, 0.25);
    rocket.temp = Math.max(ambient, rocket.temp + (targetTemp - rocket.temp) * blend);
    return;
  }

  const floor = inAir ? ambient : 3;
  const boxes = parts.map(heatBox);
  const blockBoxes = parts.map((entry, i) => {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    return shield ? { ...boxes[i], hw: boxes[i].hw * 1.2, hh: boxes[i].hh * 1.2 } : boxes[i];
  });
  const airDir = flux > 0 && speed > 0 ? localDir(rocket, vel.x / speed, vel.y / speed) : null;
  const star = starLight(rocket);
  const starDir = star ? localDir(rocket, star.x, star.y) : null;
  let skin = 0;
  parts.forEach((entry, i) => {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    if (shield && entry.ablator === undefined) {
      entry.ablator = shield.Ablator * c.kgPerTon;
      entry.ablatorMax = entry.ablator;
    }
    if (entry.temp === undefined) {
      entry.temp = ambient;
    }
    const nose = Math.sqrt(1 / Math.max(boxes[i].hw / c.partUnits, 0.25));
    const absorbed = (airDir ? flux * nose * heatExposure(boxes, blockBoxes, i, airDir) : 0) +
      (starDir ? star.flux * 0.5 * heatExposure(boxes, blockBoxes, i, starDir) : 0);
    let target = Math.pow(Math.pow(floor, 4) + absorbed / stefanBoltzmann, 0.25);
    entry.surface = target;
    if (shield && entry.ablator > 0) {
      const held = shield["Ablation Temperature"] ?? 1000;
      if (target > held) {
        const rate = shieldArea(entry) * stefanBoltzmann * (Math.pow(target, 4) - Math.pow(held, 4)) / c.ablatorHeat;
        const used = Math.min(entry.ablator, rate * dt);
        entry.ablator -= used;
        rocket.dryMass = Math.max(rocket.dryMass - used, 1);
        target = held;
      }
    }
    entry.temp += (target - entry.temp) * blend;
    skin = Math.max(skin, entry.surface);
  });

  const near = stackNeighbours(rocket.stack);
  const conduct = 1 - Math.exp(-c.conduction * dt);
  const next = parts.map((entry, i) => near[i].length
    ? entry.temp + conduct * (near[i].reduce((sum, j) => sum + parts[j].temp, 0) / near[i].length - entry.temp)
    : entry.temp);
  parts.forEach((entry, i) => {
    entry.temp = next[i];
  });

  rocket.temp = Math.max(skin, ...parts.map(entry => entry.temp));
  const blown = parts.filter(entry => entry.temp > c.partMaxTemp);
  if (blown.length) {
    explodeParts(rocket, blown);
  }
}

function scaleHeightAt(body, alt) {
  if (body.scaleHeightTop && alt > body.atmoTransition) {
    return body.scaleHeightTop;
  }
  return body.scaleHeight;
}

function densityAt(body, alt) {
  if (!body.atmosphereHeight) {
    return 0;
  }
  if (!body.scaleHeightTop || alt <= body.atmoTransition) {
    return body.density * Math.exp(-alt / body.scaleHeight);
  }
  const atTransition = body.density * Math.exp(-body.atmoTransition / body.scaleHeight);
  return atTransition * Math.exp(-(alt - body.atmoTransition) / body.scaleHeightTop);
}

function relativeVelocity(rocket, body) {
  return {
    x: rocket.vel.x - body.vel.x,
    y: rocket.vel.y - body.vel.y
  };
}

function calculateVelocity() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  return ` ${format("speed", speed)}`;
}

function calculateNumVelocity() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  return speed;
}
 
function calculateFuel() {
  const rocket = rockets.find(rocket => rocket.id === target);
  if (!rocket || !rocket.fuelMax) {
    return "none";
  }
  const tanks = rocket.tanks || {};
  const names = Object.keys(tanks);
  if (names.length <= 1) {
    return `${(rocket.fuel / c.kgPerTon).toFixed(2)}t`;
  }
  return names
    .map(name => `${name} ${(tanks[name] / c.kgPerTon).toFixed(2)}t`)
    .join(", ");
}

function calculateG() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const push = thrustAccel(rocket);
  let ax = push.x;
  let ay = push.y;

  const alt = Math.max(distanceTo(rocket, body) - body.size - rocketRadius(rocket), 0);
  if (body.atmosphereHeight && alt < body.atmosphereHeight) {
    const vel = relativeVelocity(rocket, body);
    const speed = Math.hypot(vel.x, vel.y);
    if (speed > 0) {
      const drag = (0.5 * densityAt(body, alt) * dragArea(rocket) * speed * speed) / rocket.mass;
      ax -= (vel.x / speed) * drag;
      ay -= (vel.y / speed) * drag;
    }
  }
  // sitting on the ground, the floor pushes back and the g-meter reads 1g.
  // nothing holds you up over a body with no surface, so it stays in freefall
  if (alt <= 1 && hasSurface(body)) {
    const up = localUp(rocket, body);
    ax += up.x * body.surfaceGravity;
    ay += up.y * body.surfaceGravity;
  }
  return `${(Math.hypot(ax, ay) / G0).toFixed(2)} g`;
}

function calculatePitch() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return `${Math.round(currentPitch(rocket, body))}° (aim ${Math.round(recommendedPitch(rocket, body))}°)`;
}

function calculateAltitude() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return format("distance", distanceTo(rocket, body) - body.size);
}

function calculateAltitudeRaw() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  return ("distance", distanceTo(rocket, body) - body.size);
}

function getOrbit() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const mu = gravParam(body);
  const rx = rocket.pos.x - body.pos.x;
  const ry = rocket.pos.y - body.pos.y;
  const r = Math.sqrt(rx ** 2 + ry ** 2);
  const vel = relativeVelocity(rocket, body);
  const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
  const h = rx * vel.y - ry * vel.x;
  const energy = (speed * speed) / 2 - mu / r;
  const a = -mu / (2 * energy);
  const e = Math.sqrt(Math.max(1 + (2 * energy * h * h) / (mu * mu), 0));
  return {
    eccentricity: e,
    periapsis: a * (1 - e) - body.size,
    apoapsis: e < 1 ? a * (1 + e) - body.size : Infinity
  };
}

function calculateApoapsis() {
  const apoapsis = getOrbit().apoapsis;
  if (!isFinite(apoapsis)) {
    return "escaping";
  }
  return format("distance", apoapsis);
}

function calculatePeriapsis() {
  return format("distance", getOrbit().periapsis);
}

function pressureAt(body, alt) {
  if (!body.atmosphereHeight) {
    return 0;
  }
  return densityAt(body, alt) * body.surfaceGravity * scaleHeightAt(body, alt);
}

function calculatePressure() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  if (!body.atmosphereHeight) {
    return format("pressure", 0);
  }
  const rawAlt = distanceTo(rocket, body) - body.size;
  const alt = hasSurface(body) ? Math.max(rawAlt, 0) : rawAlt;
  if (pressureAt(body, alt) <= 0.07 && !inMainMenu && !inVab) {
    rocket.escapedAtmosphere = true;
    rocket.enteredAtmosphere = false;
  }
  if (pressureAt(body, alt) >= 0.085 && !inMainMenu && !inVab && rocket.escapedAtmosphere) {
    rocket.enteredAtmosphere = true;
    rocket.escapedAtmosphere = false;
  }
  if (rocket.enteredAtmosphere) {
    const rawAltNow = calculateAltitudeRaw();
    let maxIdx = 7;
    if (rawAltNow <= 10000) {
      maxIdx = 5;
    }
    if (rawAltNow <= 2500) {
      maxIdx = 4;
    }
    if (c.timewarp > timeWarpSteps[maxIdx]) {
      c.timewarp = timeWarpSteps[maxIdx];
    }
    timeWarpCounter = Math.min(timeWarpCounter, maxIdx);
  }
  return format("pressure", pressureAt(body, alt));
}

function bodyColor(body, key, fallback) {
  const cached = key + "Obj";
  if (!body[cached]) {
    body[cached] = body[key] ? color(body[key]) : fallback;
  }
  return body[cached];
}

// every body pulls. only using the parent leaves its own acceleration
// uncancelled, and the orbit slowly warps
function totalGravity(x, y) {
  let ax = 0;
  let ay = 0;
  for (const body of planets) {
    const dx = body.pos.x - x;
    const dy = body.pos.y - y;
    const r2 = dx * dx + dy * dy;
    if (r2 === 0) {
      continue;
    }
    const invR = 1 / Math.sqrt(r2);
    const g = gravParam(body) / r2;
    ax += dx * invR * g;
    ay += dy * invR * g;
  }
  return { x: ax, y: ay };
}

const G0 = 9.80665;

function fillTanks(stack, trim) {
  for (const entry of stack.parts) {
    const tank = (entry.part.modules || {})["Resource Module"];
    if (!tank) {
      continue;
    }
    entry.tanks = {};
    entry.tanksMax = {};
    for (const p of tankResources(tank)) {
      const held = p.amount * c.kgPerTon * trim;
      entry.tanks[p.resource] = (entry.tanks[p.resource] || 0) + held * p.startFraction;
      entry.tanksMax[p.resource] = (entry.tanksMax[p.resource] || 0) + held;
    }
  }
}

function stackTanks(stack, key) {
  const total = {};
  for (const entry of stack.parts) {
    const held = entry[key || "tanks"];
    for (const name in held || {}) {
      total[name] = (total[name] || 0) + held[name];
    }
  }
  return total;
}

function partsTouch(a, b) {
  const ba = partBBox(a.part);
  const bbx = partBBox(b.part);
  const slack = 2;
  return (
    Math.abs(a.ox - b.ox) <= (ba.w + bbx.w) / 2 + slack &&
    Math.abs(a.oy - b.oy) <= (ba.h + bbx.h) / 2 + slack
  );
}

function stackNeighbours(stack) {
  if (stack.neighbours) {
    return stack.neighbours;
  }
  const near = stack.parts.map(() => []);
  for (let i = 0; i < stack.parts.length; i++) {
    for (let j = i + 1; j < stack.parts.length; j++) {
      if (partsTouch(stack.parts[i], stack.parts[j])) {
        near[i].push(j);
        near[j].push(i);
      }
    }
  }
  stack.neighbours = near;
  return near;
}

function feedTanks(stack, index, resource) {
  const near = stackNeighbours(stack);
  const seen = new Set([index]);
  const queue = near[index].slice();
  const feed = [];
  const self = stack.parts[index];
  if ((self.tanks || {})[resource] !== undefined) {
    feed.push(self);
  }
  while (queue.length) {
    const i = queue.shift();
    if (seen.has(i)) {
      continue;
    }
    seen.add(i);
    const entry = stack.parts[i];
    if (!(entry.part.modules || {})["Resource Module"]) {
      continue;
    }
    if ((entry.tanks || {})[resource] !== undefined) {
      feed.push(entry);
    }
    for (const n of near[i]) {
      if (!seen.has(n)) {
        queue.push(n);
      }
    }
  }
  return feed;
}

function feedHeld(feed, resource) {
  let held = 0;
  for (const entry of feed) {
    held += (entry.tanks || {})[resource] || 0;
  }
  return held;
}

function engineOutput(rocket) {
  const out = { thrust: 0, vx: 0, vy: 0, torque: 0, draws: [] };
  if (!rocket.stack || rocket.id !== target) {
    return out;
  }
  const level = throttle / 100;
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const engine = (entry.part.modules || {})["Engine Module"];
    if (!engine) {
      continue;
    }
    if (!entry.on) {
      continue;
    }
    const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
    const propellants = engineResources(engine).map(p => ({ ...p, feed: feedTanks(rocket.stack, i, p.resource) }));
    const ready = propellants.every(p => p.feed.length && (direction < 0 || feedHeld(p.feed, p.resource) > 0));
    if (!ready) {
      continue;
    }
    if (engine["SRB Mode"]) {
      if (level > 0) {
        entry.srbIgnited = true;
      }
    } else if (level > 0 && !entry.consumedIgnition) {
      const used = entry.ignitionsUsed || 0;
      if (used >= maxIgnitions(entry.part.name)) {
        continue;
      }
      entry.ignitionsUsed = used + 1;
      entry.consumedIgnition = true;
    }
    const engineLevel = engine["SRB Mode"] ? (entry.srbIgnited ? 1 : 0) : level;
    const thrust = (engine.Thrust || 0) * c.newtonsPerThrust * engineLevel;
    out.thrust += thrust;
    const ra = (entry.rot || 0) * HALF_PI;
    const fx = thrust * Math.sin(ra);
    const fy = -thrust * Math.cos(ra);
    out.vx += fx;
    out.vy += fy;
    out.torque += (entry.ox / c.partUnits) * fy - (entry.oy / c.partUnits) * fx;
    const isp = engine.ISP || 0;
    if (isp > 0) {
      const totalRate = (thrust / (isp * G0)) * direction;
      for (const p of propellants) {
        out.draws.push({ feed: p.feed, resource: p.resource, rate: totalRate * p.ratio });
      }
    }
  }
  return out;
}

function rcsOutput(rocket) {
  const out = { vx: 0, vy: 0, draws: [], firing: new Set() };
  if (!rocket.stack || rocket.id !== target || !hasControl(rocket)) {
    return out;
  }
  const touched = touchHeldCodes();
  const down = code => held.has(code) || touched.has(code);
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    const rcs = (entry.part.modules || {})["RCS Module"];
    if (!rcs) {
      continue;
    }
    const resource = rcs.Resource || defaultResource;
    const feed = feedTanks(rocket.stack, i, resource);
    if (!feed.length || feedHeld(feed, resource) <= 0) {
      continue;
    }
    const thrust = (rcs.Thrust || 0) * c.newtonsPerThrust;
    const dirs = rcs["Thruster Directions"] || [];
    let used = 0;
    if (dirs.includes("Top") && down("KeyI")) { out.vy -= thrust; used += thrust; }
    if (dirs.includes("Bottom") && down("KeyK")) { out.vy += thrust; used += thrust; }
    if (dirs.includes("Left") && down("KeyJ")) { out.vx -= thrust; used += thrust; }
    if (dirs.includes("Right") && down("KeyL")) { out.vx += thrust; used += thrust; }
    if (used > 0) {
      out.firing.add(entry);
      const isp = rcs.ISP || 0;
      if (isp > 0) {
        out.draws.push({ feed, resource, rate: used / (isp * G0) });
      }
    }
  }
  return out;
}

function thrustAccel(rocket) {
  const out = engineOutput(rocket);
  const rcs = rcsOutput(rocket);
  const vx = out.vx + rcs.vx;
  const vy = out.vy + rcs.vy;
  if (vx === 0 && vy === 0) {
    return { x: 0, y: 0 };
  }
  const cos = Math.cos(rocket.angle);
  const sin = Math.sin(rocket.angle);
  return {
    x: (vx * cos - vy * sin) / rocket.mass,
    y: (vx * sin + vy * cos) / rocket.mass
  };
}

function burnFuel(rocket, h) {
  if (!rocket.stack || !rocket.tanks) {
    return;
  }
  runFuelpipes(rocket, h);
  const draws = [...engineOutput(rocket).draws, ...rcsOutput(rocket).draws];
  for (const draw of draws) {
    const want = draw.rate * h;
    let share = 0;
    for (const entry of draw.feed) {
      const inTank = entry.tanks[draw.resource] || 0;
      const capacity = (entry.tanksMax || {})[draw.resource] || 0;
      share += draw.rate > 0 ? inTank : capacity - inTank;
    }
    for (const entry of draw.feed) {
      const inTank = entry.tanks[draw.resource] || 0;
      const capacity = (entry.tanksMax || {})[draw.resource] || 0;
      const mine = draw.rate > 0 ? inTank : capacity - inTank;
      const portion = share > 0 ? mine / share : 1 / draw.feed.length;
      entry.tanks[draw.resource] = constrain(inTank - want * portion, 0, capacity);
    }
  }
  rocket.tanks = stackTanks(rocket.stack);
  rocket.tanksMax = stackTanks(rocket.stack, "tanksMax");
  rocket.fuel = totalFuel(rocket.tanks);
  rocket.fuelMax = totalFuel(rocket.tanksMax);
  rocket.mass = rocket.dryMass + rocket.fuel;
}

function localUp(rocket, body) {
  const x = rocket.pos.x - body.pos.x;
  const y = rocket.pos.y - body.pos.y;
  const r = Math.hypot(x, y) || 1;
  return { x: x / r, y: y / r };
}

function noseVector(rocket) {
  return { x: Math.sin(rocket.angle), y: -Math.cos(rocket.angle) };
}

function currentPitch(rocket, body) {
  const up = localUp(rocket, body);
  const nose = noseVector(rocket);
  return degrees(Math.asin(constrain(nose.x * up.x + nose.y * up.y, -1, 1)));
}

function recommendedPitch(rocket, body) {
  const ceiling = body.atmosphereHeight || c.turnCeiling;
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  const p = constrain(alt / ceiling, 0, 1);
  const table = c.turnProfile;
  for (let i = 1; i < table.length; i++) {
    if (p <= table[i][0]) {
      const [p0, a0] = table[i - 1];
      const [p1, a1] = table[i];
      return a0 + ((a1 - a0) * (p - p0)) / (p1 - p0);
    }
  }
  return table[table.length - 1][1];
}

function turnSide(rocket, body) {
  const up = localUp(rocket, body);
  const nose = noseVector(rocket);
  return up.x * nose.y - up.y * nose.x < 0 ? -1 : 1;
}

function drawPitchGuide(rocket) {
  const body = getBody(rocket.parentBody);
  const aim = recommendedPitch(rocket, body);
  const up = localUp(rocket, body);
  const tilt = radians(90 - aim) * turnSide(rocket, body);
  const dir = {
    x: up.x * Math.cos(tilt) - up.y * Math.sin(tilt),
    y: up.x * Math.sin(tilt) + up.y * Math.cos(tilt)
  };
  const sx = width / 2 + (rocket.pos.x - camera.pos.x) * scale;
  const sy = height / 2 + (rocket.pos.y - camera.pos.y) * scale;
  const tipX = sx + dir.x * c.guideLength;
  const tipY = sy + dir.y * c.guideLength;

  push();
  stroke("#5cf9");
  strokeWeight(2);
  line(sx, sy, tipX, tipY);
  noStroke();
  fill("#5cf");
  circle(tipX, tipY, 6);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`${Math.round(aim)}°`, tipX + dir.x * 14, tipY + dir.y * 14);
  pop();
}

function drawBurnGuide(rocket) {
  if (!rocket.parentBody) {
    return;
  }
  const burn = pendingBurnWait(rocket);
  if (!burn || !burn.dv) {
    return;
  }
  const parent = getBody(rocket.parentBody);
  const vel = relativeVelocity(rocket, parent);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed <= 0) {
    return;
  }
  const sign = Math.sign(burn.dv);
  const dir = { x: (vel.x / speed) * sign, y: (vel.y / speed) * sign };
  const perp = { x: -dir.y, y: dir.x };
  const sx = width / 2 + (rocket.pos.x - camera.pos.x) * scale;
  const sy = height / 2 + (rocket.pos.y - camera.pos.y) * scale;
  const tipX = sx + dir.x * c.guideLength;
  const tipY = sy + dir.y * c.guideLength;
  const heading = Math.atan2(dir.y, dir.x);

  push();
  stroke("#ffb347");
  strokeWeight(2);
  line(sx, sy, tipX, tipY);
  noStroke();
  fill("#ffb347");
  push();
  translate(tipX, tipY);
  rotate(heading);
  triangle(9, 0, -6, -5, -6, 5);
  pop();
  // offset perpendicular to the arrow, not further along it, so the label
  // never lands on top of the line no matter which way it's pointing
  translate(tipX + perp.x * 16, tipY + perp.y * 16);
  rotate(-camera.angle);
  textSize(12);
  textAlign(CENTER, CENTER);
  const when = burn.due ? "now" : `in ${formatTime(burn.seconds)}, warp to it`;
  text(`${burn.label} Δv ${format("speed", Math.abs(burn.dv))} ${when}`, 0, 0);
  pop();
}

function chuteState(rocket, entry, chute) {
  if (entry.torn) {
    return "  torn";
  }
  if (entry.deployed) {
    return "  deployed";
  }
  const body = getBody(rocket.parentBody);
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  const need = (chute["Minimum Deploy Pressure"] || 0) * 1000;
  if (pressureAt(body, alt) < need) {
    return `  too high, needs ${format("pressure", need)}`;
  }
  const vel = relativeVelocity(rocket, body);
  if (Math.hypot(vel.x, vel.y) > (chute["Max Deploy Speed"] || Infinity)) {
    return `  click to deploy (over ${chute["Max Deploy Speed"]} m/s, will tear)`;
  }
  return "  click to deploy";
}

function formatKg(kg) {
  const abs = Math.abs(kg);
  if (abs >= 1e6) {
    return `${(kg / 1e6).toFixed(2)} kt`;
  }
  if (abs >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${kg.toFixed(1)} kg`;
}

function resourceLines(entry) {
  const max = entry.tanksMax || {};
  return Object.keys(max)
    .filter(name => max[name] > 0)
    .map(name => `  ${name}: ${formatKg(entry.tanks[name] || 0)} / ${formatKg(max[name])}`);
}

function drawPartHover(rocket) {
  const entry = flightPartAt(rocket, mouseX, mouseY);
  if (!entry) {
    return;
  }
  const modules = entry.part.modules || {};
  let action = null;
  if (modules["Decoupler Module"]) {
    action = "  click to decouple";
  } else if (modules["Parachute Module"]) {
    action = chuteState(rocket, entry, modules["Parachute Module"]);
  } else if (modules["Engine Module"]) {
    action = entry.on ? "  click to shut down" : "  click to light";
    const max = maxIgnitions(entry.part.name);
    if (Number.isFinite(max)) {
      const used = entry.ignitionsUsed || 0;
      action += used >= max && !entry.on ? "  (out of ignitions)" : `  (ignitions ${used}/${max})`;
    }
  } else if (modules["Togglable Module"]) {
    action = entry.on ? "  click to disable" : "  click to enable";
  } else if (modules["Docking Module"] && rocket.dockedWith) {
    action = "  click to undock";
  }

  const shield = modules["Heat Shield Module"];
  let ablatorLine = null;
  if (shield) {
    const max = entry.ablatorMax ?? shield.Ablator * c.kgPerTon;
    const left = entry.ablator ?? max;
    ablatorLine = `  ablator: ${Math.round(left)}/${Math.round(max)} kg`;
  }

  const s = scale / c.partUnits;
  const bb = partBBox(entry.part);
  push();
  translate(
    width / 2 + (rocket.pos.x - camera.pos.x) * scale,
    height / 2 + (rocket.pos.y - camera.pos.y) * scale
  );
  rotate(rocket.angle);
  noFill();
  stroke(action ? "#5cf" : "#ffffff55");
  strokeWeight(2);
  translate(entry.ox * s, entry.oy * s);
  rotate((entry.rot || 0) * HALF_PI);
  rect((-bb.w / 2) * s, (-bb.h / 2) * s, bb.w * s, bb.h * s);
  pop();

  GUIAPI.pendingTooltip = {
    lines: [entry.part.name, action, ablatorLine, ...resourceLines(entry)].filter(Boolean),
    x: mouseX,
    y: mouseY
  };
}

function flightPartAt(rocket, mx, my) {
  if (!rocket || !rocket.stack) {
    return null;
  }
  const s = scale / c.partUnits;
  const m = unrotate(mx, my);
  const dx = m.x - (width / 2 + (rocket.pos.x - camera.pos.x) * scale);
  const dy = m.y - (height / 2 + (rocket.pos.y - camera.pos.y) * scale);
  const a = -rocket.angle;
  const lx = (dx * Math.cos(a) - dy * Math.sin(a)) / s;
  const ly = (dx * Math.sin(a) + dy * Math.cos(a)) / s;
  for (let i = rocket.stack.parts.length - 1; i >= 0; i--) {
    const entry = rocket.stack.parts[i];
    const bb = partBBox(entry.part);
    const ra = -(entry.rot || 0) * HALF_PI;
    const rx = lx - entry.ox;
    const ry = ly - entry.oy;
    const px = rx * Math.cos(ra) - ry * Math.sin(ra) + bb.cx;
    const py = rx * Math.sin(ra) + ry * Math.cos(ra) + bb.cy;
    for (const group of entry.part.groups) {
      if (group.noCollision) {
        continue;
      }
      if (pointInPolygon(px, py, group.points)) {
        return entry;
      }
    }
  }
  return null;
}

function stackHalf(entries) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let wet = 0;
  const cap = {};
  for (const e of entries) {
    const bb = partBBox(e.part);
    minX = Math.min(minX, e.ox - bb.w / 2);
    maxX = Math.max(maxX, e.ox + bb.w / 2);
    minY = Math.min(minY, e.oy - bb.h / 2);
    maxY = Math.max(maxY, e.oy + bb.h / 2);
    wet += (e.part.mass || 0) * c.kgPerTon;
    const tank = (e.part.modules || {})["Resource Module"];
    if (tank) {
      for (const p of tankResources(tank)) {
        cap[p.resource] = (cap[p.resource] || 0) + p.amount * c.kgPerTon;
      }
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    cx, cy, wet, cap,
    stack: {
      w: maxX - minX,
      h: maxY - minY,
      parts: entries.map((e) => ({ ...e, ox: e.ox - cx, oy: e.oy - cy }))
    }
  };
}

function partsTouch(a, b) {
  const A = partBBox(a.part);
  const B = partBBox(b.part);
  const gap = 1;
  return Math.abs(a.ox - b.ox) <= (A.w + B.w) / 2 + gap &&
         Math.abs(a.oy - b.oy) <= (A.h + B.h) / 2 + gap;
}

function connectedGroups(entries, cut) {
  const seen = new Set();
  const groups = [];
  for (const start of entries) {
    if (seen.has(start)) {
      continue;
    }
    seen.add(start);
    const group = [start];
    for (let i = 0; i < group.length; i++) {
      for (const other of entries) {
        if (seen.has(other) || cut(group[i], other) || !partsTouch(group[i], other)) {
          continue;
        }
        seen.add(other);
        group.push(other);
      }
    }
    groups.push(group);
  }
  return groups;
}

function splitRocket(rocket, cut, impulse, force) {
  const groups = connectedGroups(rocket.stack.parts, cut);
  if (groups.length < 2 && !force) {
    return;
  }
  const sin = Math.sin(rocket.angle);
  const cos = Math.cos(rocket.angle);
  const halves = groups.map(stackHalf);
  const main = halves.reduce((a, b) => (b.cy < a.cy ? b : a));
  const ground = halves.reduce((a, b) => (b.cy > a.cy ? b : a));

  const build = (side) => {
    const tanks = stackTanks(side.stack);
    const tanksMax = stackTanks(side.stack, "tanksMax");
    const fuel = totalFuel(tanks);
    const dryMass = Math.max(side.wet - totalFuel(tanksMax), 1);
    const mass = dryMass + fuel;
    const dv = (impulse / mass) * (side === main ? 1 : -1);
    return {
      pos: {
        x: rocket.pos.x + (side.cx * cos - side.cy * sin) / c.partUnits,
        y: rocket.pos.y + (side.cx * sin + side.cy * cos) / c.partUnits
      },
      vel: { x: rocket.vel.x + sin * dv, y: rocket.vel.y - cos * dv },
      landed: side === ground ? rocket.landed : null,
      mass,
      dryMass,
      fuel,
      fuelMax: totalFuel(tanksMax),
      tanks,
      tanksMax,
      stack: side.stack
    };
  };

  for (const side of halves) {
    if (side === main) {
      continue;
    }
    rockets.push({
      angle: rocket.angle,
      dragArea: rocket.dragArea,
      dragCoeff: rocket.dragCoeff,
      id: `debris-${Math.random().toString(36).slice(2, 8)}`,   // random, so ids stay unique across removals and loads
      parentBody: rocket.parentBody,
      ...build(side)
    });
  }
  Object.assign(rocket, build(main));
}

function decouple(rocket, entry) {
  const impulse = ((entry.part.modules["Decoupler Module"] || {})["Separation Force"] || 0) * c.newtonsPerThrust;
  const cut = (a, b) => (a === entry && b.oy < entry.oy) || (b === entry && a.oy < entry.oy);
  splitRocket(rocket, cut, impulse);
}

function dockingParts(rocket) {
  if (!rocket.stack) {
    return [];
  }
  return rocket.stack.parts.filter(entry => (entry.part.modules || {})["Docking Module"]);
}

function undock(rocket) {
  const other = rockets.find(r => r.id === rocket.dockedWith);
  if (!other) {
    return;
  }
  const force = Math.max(
    ...dockingParts(rocket).map(e => e.part.modules["Docking Module"]["Disconnect Force"] || 0),
    ...dockingParts(other).map(e => e.part.modules["Docking Module"]["Disconnect Force"] || 0)
  );
  const dx = other.pos.x - rocket.pos.x;
  const dy = other.pos.y - rocket.pos.y;
  const dist = Math.hypot(dx, dy) || 1;
  const impulse = force * c.newtonsPerThrust;
  rocket.vel.x -= (dx / dist) * (impulse / rocket.mass);
  rocket.vel.y -= (dy / dist) * (impulse / rocket.mass);
  other.vel.x += (dx / dist) * (impulse / other.mass);
  other.vel.y += (dy / dist) * (impulse / other.mass);
  rocket.dockedWith = null;
  other.dockedWith = null;
}

function updateDocking(dt) {
  for (const rocket of rockets) {
    if (rocket.dockedWith && !rockets.some(r => r.id === rocket.dockedWith)) {
      rocket.dockedWith = null;
    }
  }
  for (let i = 0; i < rockets.length; i++) {
    const a = rockets[i];
    if (a.destroyed || !dockingParts(a).length) {
      continue;
    }
    for (let j = i + 1; j < rockets.length; j++) {
      const b = rockets[j];
      if (b.destroyed || !dockingParts(b).length) {
        continue;
      }
      if (a.dockedWith === b.id || b.dockedWith === a.id) {
        continue;
      }
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0 || dist > c.dockRange) {
        continue;
      }
      if (dist < c.dockConnect) {
        a.dockedWith = b.id;
        b.dockedWith = a.id;
        const vx = (a.vel.x * a.mass + b.vel.x * b.mass) / (a.mass + b.mass);
        const vy = (a.vel.y * a.mass + b.vel.y * b.mass) / (a.mass + b.mass);
        a.vel.x = b.vel.x = vx;
        a.vel.y = b.vel.y = vy;
        continue;
      }
      const forceA = Math.max(...dockingParts(a).map(e => e.part.modules["Docking Module"]["Attractive Force"] || 0));
      const forceB = Math.max(...dockingParts(b).map(e => e.part.modules["Docking Module"]["Attractive Force"] || 0));
      const pull = Math.min(forceA, forceB) * c.newtonsPerThrust;
      if (pull <= 0) {
        continue;
      }
      const ux = dx / dist;
      const uy = dy / dist;
      a.vel.x += ((ux * pull) / a.mass) * dt;
      a.vel.y += ((uy * pull) / a.mass) * dt;
      b.vel.x -= ((ux * pull) / b.mass) * dt;
      b.vel.y -= ((uy * pull) / b.mass) * dt;
    }
  }
}

function rocketRadius(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  return rocket.stack.h / 2 / c.partUnits;
}

function hasSurface(body) {
  return !body.noSurface && !body.gasGiant;
}

function isWater(body, dx, dy) {
  if (!body.waterColor) {
    return false;
  }
  const img = textures[body.texture];
  if (!img) {
    return false;
  }
  if (!img._px) {
    img.loadPixels();
    img._px = img.pixels;
    img._water = [
      unhex(body.waterColor.slice(1, 3)),
      unhex(body.waterColor.slice(3, 5)),
      unhex(body.waterColor.slice(5, 7))
    ];
  }
  const r = Math.hypot(dx, dy) || 1;
  const u = Math.floor((((dx / r) * 0.99 + 1) / 2) * img.width);
  const v = Math.floor((((dy / r) * 0.99 + 1) / 2) * img.height);
  const i = (v * img.width + u) * 4;
  const px = img._px;
  if (i < 0 || i + 2 >= px.length) {
    return false;
  }
  const want = img._water;
  return (
    Math.hypot(px[i] - want[0], px[i + 1] - want[1], px[i + 2] - want[2]) <
    (body.waterTolerance === undefined ? 60 : body.waterTolerance)
  );
}

function surfaceCollide(rocket, body) {
  if (!hasSurface(body)) {
    return;
  }
  const dx = rocket.pos.x - body.pos.x;
  const dy = rocket.pos.y - body.pos.y;
  const r = Math.hypot(dx, dy);
  if (r === 0) {
    return;
  }

  const contact = propContact(body, rocket, dx, dy, r);
  if (!contact && isWater(body, dx, dy)) {
    if (r < body.size + rocketRadius(rocket)) {
      const splash = relativeVelocity(rocket, body);
      const speed = Math.hypot(splash.x, splash.y);
      if (speed >= c.waterCrashSpeed) {
        cd.speed = speed;
        cd.limit = c.waterCrashSpeed;
        cd.body = body.id;
        cd.time = t;
        rocket.destroyed = true;
        logTimelineEvent(rocket, "destroyed", { reason: "water crash", speed });
      }
    }
    return;
  }
  const floor = (contact ? contact.top : body.size) + rocketRadius(rocket);
  if (contact && contact.mode === "side") {
    const hit = relativeVelocity(rocket, body);
    if (Math.hypot(hit.x, hit.y) >= c.crashSpeed) {
      cd.speed = Math.hypot(hit.x, hit.y);
      cd.limit = c.crashSpeed;
      cd.body = body.id;
      cd.time = t;
      rocket.destroyed = true;
      logTimelineEvent(rocket, "destroyed", { reason: "side crash", speed: cd.speed });
      return;
    }
    const tan = { x: -dy / r, y: dx / r };
    rocket.pos.x += tan.x * contact.dist * contact.dir;
    rocket.pos.y += tan.y * contact.dist * contact.dir;
    const slide =
      (rocket.vel.x - body.vel.x) * tan.x + (rocket.vel.y - body.vel.y) * tan.y;
    rocket.vel.x -= tan.x * slide;
    rocket.vel.y -= tan.y * slide;
    return;
  }
  if (r >= floor) {
    return;
  }

  const impact = relativeVelocity(rocket, body);
  if (Math.hypot(impact.x, impact.y) >= c.crashSpeed) {
    cd.speed = Math.hypot(impact.x, impact.y);
    cd.limit = c.crashSpeed;
    cd.body = body.id;
    cd.time = t;
    rocket.destroyed = true;
    logTimelineEvent(rocket, "destroyed", { reason: "surface crash", speed: cd.speed });
    return;
  }
  rocket.pos.x = body.pos.x + (dx / r) * floor;
  rocket.pos.y = body.pos.y + (dy / r) * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  rocket.landed = { x: dx / r, y: dy / r };
}

function restRadius(rocket) {
  const halfWidth = Math.max(rocket.stack.w / 2 / c.partUnits, 0);
  const halfHeight = rocketRadius(rocket);
  const tip = tipAngle(rocket);
  return halfHeight * Math.abs(Math.cos(tip)) + halfWidth * Math.abs(Math.sin(tip));
}

function restOnSurface(rocket, h) {
  const body = getBody(rocket.parentBody);
  const floor = surfaceRadiusAt(body, rocket.landed.x, rocket.landed.y) + restRadius(rocket);
  rocket.pos.x = body.pos.x + rocket.landed.x * floor;
  rocket.pos.y = body.pos.y + rocket.landed.y * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  burnFuel(rocket, h);
  if (liftsOff(rocket)) {
    rocket.landed = null;
  }
}

function hasControl(rocket) {
  return !!rocket.stack && rocket.stack.parts.some(entry => {
    const controller = (entry.part.modules || {})["Controller Module"];
    return !!controller && controller["Provides Control"] !== false;
  });
}

function controllerTorque(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  let torque = 0;
  for (const entry of rocket.stack.parts) {
    const controller = (entry.part.modules || {})["Controller Module"];
    if (controller) {
      torque += controller.Torque || 0;
    }
  }
  return torque;
}

// reaction-wheel command, reusing the old rate formula as an acceleration so
// held turn input ramps spin up instead of snapping the angle straight there
function wheelMaxAccel(rocket) {
  const torque = controllerTorque(rocket);
  if (!torque) {
    return 0;
  }
  return (torque * c.turnPower) / (rocket.mass / c.kgPerTon);
}

function isThrusting(rocket) {
  if (!rocket.stack) {
    return false;
  }
  return rocket.stack.parts.some((entry, i) => {
    const engine = (entry.part.modules || {})["Engine Module"];
    if (!engine || !entry.on) {
      return false;
    }
    const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
    const propellants = engineResources(engine).map(p => ({ ...p, feed: feedTanks(rocket.stack, i, p.resource) }));
    return propellants.every(p => p.feed.length && (direction < 0 || feedHeld(p.feed, p.resource) > 0));
  });
}

function wheelSpinAccel(rocket) {
  const maxAccel = wheelMaxAccel(rocket);
  if (!maxAccel) {
    return 0;
  }
  if (rocket.id === target && rocket.turnInput) {
    return maxAccel * rocket.turnInput;
  }
  if (!rocket.sas || !hasFeature("sas") || !hasControl(rocket)) {
    return 0;
  }
  let targetAngle = rocket.sasAngle;
  if (!isThrusting(rocket)) {
    const retro = reentryRetrogradeAngle(rocket, getBody(rocket.parentBody));
    if (retro) {
      targetAngle = retro.angle;
    }
  }
  let error = targetAngle - rocket.angle;
  error = ((error + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  const command = c.sasStiffness * error - c.sasDamping * (rocket.spin || 0);
  return constrain(command, -maxAccel, maxAccel);
}

// the "up" direction (radially away from the body) at this rocket's landing spot
function landedUpAngle(rocket) {
  const out = rocket.landed;
  return Math.atan2(out.x, -out.y);
}

// angle this rocket's stack is pointing away from local "up" at its landing spot
function tipAngle(rocket) {
  const a = rocket.angle - landedUpAngle(rocket);
  return ((a + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

function gravityTipAccel(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const g = Math.hypot(acc.x, acc.y);
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  return ((1.5 * g) / len) * Math.sin(tipAngle(rocket));
}

// past +-90 deg (lying flat) the stack would have to dig through the ground
// to keep turning, so the ground stops it there like a real fallen rocket
function landedSpinStep(rocket, h) {
  if (!rocket.stack) {
    return;
  }
  const alpha = gravityTipAccel(rocket) + wheelSpinAccel(rocket);
  rocket.spin = (rocket.spin || 0) + alpha * h;
  rocket.spin *= Math.max(1 - c.landedTipDamping * h, 0);
  rocket.angle += rocket.spin * h;
  const tip = tipAngle(rocket);
  if (tip > HALF_PI) {
    rocket.angle = landedUpAngle(rocket) + HALF_PI;
    rocket.spin = Math.min(rocket.spin, 0);
  } else if (tip < -HALF_PI) {
    rocket.angle = landedUpAngle(rocket) - HALF_PI;
    rocket.spin = Math.max(rocket.spin, 0);
  }
}

// off the ground once the engines out-push whatever gravity is holding it down
function liftsOff(rocket) {
  const push = thrustAccel(rocket);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const out = rocket.landed;
  return (push.x + acc.x) * out.x + (push.y + acc.y) * out.y > 0;
}

function aeroStability(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  let stability = 0;
  for (const entry of rocket.stack.parts) {
    const aero = (entry.part.modules || {})["Aero Module"];
    if (aero) {
      stability += aero.Stability || 0;
    }
  }
  return stability;
}

function reentryRetrogradeAngle(rocket, body) {
  if (!body.atmosphereHeight) {
    return null;
  }
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (alt >= body.atmosphereHeight) {
    return null;
  }
  const density = densityAt(body, alt);
  if (density <= 0) {
    return null;
  }
  const vel = relativeVelocity(rocket, body);
  const speed = Math.hypot(vel.x, vel.y);
  if (speed < c.reentryMinSpeed) {
    return null;
  }
  return { angle: Math.atan2(-vel.x, vel.y), density, speed };
}

function aeroStabilityAccel(rocket) {
  const stability = aeroStability(rocket);
  if (!stability) {
    return 0;
  }
  const body = getBody(rocket.parentBody);
  const retro = reentryRetrogradeAngle(rocket, body);
  if (!retro) {
    return 0;
  }
  let error = retro.angle - rocket.angle;
  error = ((error + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  const q = 0.5 * retro.density * retro.speed * retro.speed;
  const inertia = (rocket.mass * len * len) / 12;
  const restoring = c.aeroStabilityFactor * stability * q * Math.sin(error);
  const damping = c.aeroStabilityDamping * stability * q * (rocket.spin || 0);
  const accel = (restoring - damping) / inertia;
  return constrain(accel, -c.aeroStabilityMaxAccel, c.aeroStabilityMaxAccel);
}

function spinAccel(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const out = engineOutput(rocket);
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  const gimbal = out.torque ? out.torque / ((rocket.mass * len * len) / 12) : 0;
  return gimbal + wheelSpinAccel(rocket) + aeroStabilityAccel(rocket);
}

function integrateAttitude(rocket, h) {
  const micro = Math.max(1, Math.min(Math.ceil(h / c.attitudeMicroStep), c.attitudeMaxMicro));
  const hi = Math.min(h / micro, c.attitudeMicroStep);
  for (let i = 0; i < micro; i++) {
    rocket.spin = (rocket.spin || 0) + spinAccel(rocket) * hi;
    rocket.angle += rocket.spin * hi;
  }
  rocket.angle += rocket.spin * Math.max(h - hi * micro, 0);
}

// leapfrog: the two half-kicks sample gravity at each end of the step
function kickDrift(rocket, h) {
  updateSOI(rocket);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const push = thrustAccel(rocket);
  rocket.vel.x += ((acc.x + push.x) * h) / 2;
  rocket.vel.y += ((acc.y + push.y) * h) / 2;
  rocket.pos.x += rocket.vel.x * h;
  rocket.pos.y += rocket.vel.y * h;
  integrateAttitude(rocket, h);
}

// the ship plus whatever canopies are out. Drag is a CdA, straight out of
// v = sqrt(2mg / (density * Drag))
function dragArea(rocket) {
  let total = rocket.dragCoeff * rocket.dragArea;
  for (const entry of rocket.stack ? rocket.stack.parts : []) {
    const chute = (entry.part.modules || {})["Parachute Module"];
    if (chute && entry.deployed && !entry.torn) {
      total += chute.Drag || 0;
    }
  }
  return total;
}

function tearChutes(rocket, speed) {
  for (const entry of rocket.stack ? rocket.stack.parts : []) {
    const chute = (entry.part.modules || {})["Parachute Module"];
    if (chute && entry.deployed && !entry.torn && speed > (chute["Max Deploy Speed"] || Infinity)) {
      entry.torn = true;
    }
  }
}

function deployChute(rocket, entry) {
  const chute = entry.part.modules["Parachute Module"];
  if (entry.deployed) {
    return;
  }
  const body = getBody(rocket.parentBody);
  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (pressureAt(body, alt) < (chute["Minimum Deploy Pressure"] || 0) * 1000) {
    return;
  }
  entry.deployed = true;
  const vel = relativeVelocity(rocket, body);
  tearChutes(rocket, Math.hypot(vel.x, vel.y));
}

function kickFinish(rocket, h) {
  const body = getBody(rocket.parentBody);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const push = thrustAccel(rocket);
  rocket.vel.x += ((acc.x + push.x) * h) / 2;
  rocket.vel.y += ((acc.y + push.y) * h) / 2;

  const alt = Math.max(distanceTo(rocket, body) - body.size, 0);
  if (body.atmosphereHeight && alt < body.atmosphereHeight) {
    const density = densityAt(body, alt);
    // the air moves with the planet, so drag acts on the relative velocity
    const vel = relativeVelocity(rocket, body);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    tearChutes(rocket, speed);   // before the drag, so a shredded one stops pulling
    if (speed > 0) {
      const k = (0.5 * density * dragArea(rocket)) / rocket.mass;
      const decay = 1 / (1 + k * speed * h);
      rocket.vel.x = body.vel.x + vel.x * decay;
      rocket.vel.y = body.vel.y + vel.y * decay;
    }
  }

  if (distanceTo(rocket, body) < body.size) {
    const vel = relativeVelocity(rocket, body);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (speed > 0 && isWater(body, rocket.pos.x - body.pos.x, rocket.pos.y - body.pos.y)) {
      const k = (0.5 * c.waterDensity * dragArea(rocket)) / rocket.mass;
      const decay = 1 / (1 + k * speed * h);
      rocket.vel.x = body.vel.x + vel.x * decay;
      rocket.vel.y = body.vel.y + vel.y * decay;
    }
  }

  burnFuel(rocket, h);

  surfaceCollide(rocket, body);
}

function glowStops(body) {
  if (body.glowStops) {
    return body.glowStops;
  }
  const img = textures[body.glowTexture];
  img.loadPixels();
  const middle = floor(img.width / 2);
  const stops = [];
  for (let i = 0; i < c.glowSteps; i++) {
    const p = i / (c.glowSteps - 1);
    const row = round((1 - p) * (img.height - 1));
    const o = 4 * (row * img.width + middle);
    const alpha = (img.pixels[o + 3] / 255) * c.glowMax;
    stops.push([
      p,
      `rgba(${img.pixels[o]}, ${img.pixels[o + 1]}, ${img.pixels[o + 2]}, ${alpha})`
    ]);
  }
  body.glowStops = stops;
  return stops;
}

function updateCamera(rocket) {
  if (rocket) {
    const parent = getBody(rocket.parentBody);
    camera.parentBody = rocket.parentBody;
    camera.off.x = rocket.pos.x - parent.pos.x;
    camera.off.y = rocket.pos.y - parent.pos.y;
  }
  const body = getBody(camera.parentBody);
  camera.pos.x = body.pos.x + camera.off.x;
  camera.pos.y = body.pos.y + camera.off.y;
  camera.angle = -HALF_PI - Math.atan2(camera.pos.y - body.pos.y, camera.pos.x - body.pos.x);
}

function unrotate(mx, my) {
  const a = -camera.angle;
  const dx = mx - width / 2;
  const dy = my - height / 2;
  return {
    x: width / 2 + dx * Math.cos(a) - dy * Math.sin(a),
    y: height / 2 + dx * Math.sin(a) + dy * Math.cos(a)
  };
}

function viewReach() {
  return Math.hypot(width, height) / 2;
}

function cssColor(col) {
  return `rgba(${red(col)}, ${green(col)}, ${blue(col)}, ${alpha(col) / 255})`;
}

function drawTextureSlice(img, cx, cy, radius) {
  const left = cx - radius;
  const top = cy - radius;
  const span = radius * 2;
  const reach = viewReach();
  const x0 = Math.max(left, width / 2 - reach);
  const y0 = Math.max(top, height / 2 - reach);
  const x1 = Math.min(cx + radius, width / 2 + reach);
  const y1 = Math.min(cy + radius, height / 2 + reach);
  if (x1 <= x0 || y1 <= y0) {
    return;
  }
  const source = img.canvas || img.elt || null;
  if (!source) {
    image(img, cx, cy, span, span);
    return;
  }
  const sx = ((x0 - left) / span) * img.width;
  const sy = ((y0 - top) / span) * img.height;
  const sw = ((x1 - x0) / span) * img.width;
  const sh = ((y1 - y0) / span) * img.height;
  drawingContext.drawImage(source, sx, sy, sw, sh, x0, y0, x1 - x0, y1 - y0);
}

function traceDisc(ctx, cx, cy, r) {
  ctx.beginPath();
  if (r < 1e6) {
    ctx.arc(cx, cy, r, 0, TWO_PI);
    return;
  }
  const dx = width / 2 - cx;
  const dy = height / 2 - cy;
  const dist = Math.hypot(dx, dy);
  const nx = dx / dist;
  const ny = dy / dist;
  const gap = dist - r;
  const qx = width / 2 - nx * gap;
  const qy = height / 2 - ny * gap;
  const reach = Math.hypot(width, height);
  const depth = Math.max(-gap, 0) + reach * 2;
  const steps = 24;
  const at = u => {
    const sag = (u * u) / (r + Math.sqrt(Math.max(r * r - u * u, 0)));
    return { x: qx - ny * u - nx * sag, y: qy + nx * u - ny * sag };
  };
  const first = at(-reach);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i <= steps; i++) {
    const p = at(-reach + (2 * reach * i) / steps);
    ctx.lineTo(p.x, p.y);
  }
  const last = at(reach);
  ctx.lineTo(last.x - nx * depth, last.y - ny * depth);
  ctx.lineTo(first.x - nx * depth, first.y - ny * depth);
  ctx.closePath();
}

function drawBody(body, rocket) {
  const screenX = width / 2 + (body.pos.x - rocket.pos.x) * scale;
  const screenY = height / 2 + (body.pos.y - rocket.pos.y) * scale;
  const surfaceRadius = body.size * scale;
  const atmosphereHeight = body.atmosphereHeight || 0;
  const atmoRadius = (body.size + atmosphereHeight) * scale;

  const glowRadius = body.glow ? (body.size + body.glow) * scale : 0;

  const reach = max(atmoRadius, glowRadius) + Math.hypot(width, height) / 2;
  if (Math.hypot(screenX - width / 2, screenY - height / 2) > reach) {
    return;
  }

  if (glowRadius > surfaceRadius && textures[body.glowTexture]) {
    const gradient = drawingContext.createRadialGradient(
      screenX,
      screenY,
      surfaceRadius,
      screenX,
      screenY,
      glowRadius
    );
    for (const stop of glowStops(body)) {
      gradient.addColorStop(stop[0], stop[1]);
    }
    drawingContext.save();
    drawingContext.fillStyle = gradient;
    drawingContext.beginPath();
    drawingContext.arc(screenX, screenY, glowRadius, 0, TWO_PI);
    drawingContext.fill();
    drawingContext.restore();
  }

  if (atmosphereHeight > 0) {
    const sky = drawingContext.createRadialGradient(
      screenX, screenY, Math.max(surfaceRadius, 0),
      screenX, screenY, Math.max(atmoRadius, 1)
    );
    const surfaceSky = bodyColor(body, "skyColor", skySurface);
    for (let i = 0; i <= c.skySteps; i++) {
      const p = i / c.skySteps;
      sky.addColorStop(p, cssColor(lerpColor(surfaceSky, skyTip, p)));
    }
    drawingContext.save();
    drawingContext.fillStyle = sky;
    drawingContext.beginPath();
    drawingContext.arc(screenX, screenY, Math.max(atmoRadius, 1), 0, TWO_PI);
    drawingContext.fill();
    drawingContext.restore();
  }

  stroke(0);
  fill(0);

  const surfaceImg = textures[body.texture];
  if (surfaceImg) {
    drawingContext.save();
    traceDisc(drawingContext, screenX, screenY, surfaceRadius);
    drawingContext.clip();
    imageMode(CENTER);
    drawTextureSlice(surfaceImg, screenX, screenY, surfaceRadius * 1.002);
    const cloudImg = textures[body.cloudTexture];
    if (cloudImg) {
      const cloudRadius = surfaceRadius * c.cloudScale;
      blendMode(SCREEN);
      drawingContext.globalAlpha = c.cloudMax;
      push();
      translate(screenX, screenY);
      rotate(TWO_PI * (t / c.cloudPeriod));
      image(cloudImg, 0, 0, cloudRadius * 2, cloudRadius * 2);
      pop();
      drawingContext.globalAlpha = 1;
      blendMode(BLEND);
    }
    drawingContext.restore();
  } else {
    fill(body.fallbackColor || "Green");
    traceDisc(drawingContext, screenX, screenY, surfaceRadius);
    drawingContext.fill();
    drawingContext.stroke();
  }

  const discTint =
    atmosphereHeight > 0
      ? bodyColor(body, "hazeColor", hazeColor)
      : glowRadius > 0
        ? bodyColor(body, "glowColor", null)
        : null;
  if (discTint) {
    const apparentSize = surfaceRadius / height;
    const haze = constrain(
      map(log(apparentSize), log(c.hazeFarSize), log(c.hazeNearSize), 1, 0),
      0,
      1
    );
    if (haze > 0) {
      noStroke();
      const hazeMax = body.hazeMax !== undefined ? body.hazeMax : c.hazeMax;
      const peakAlpha = hazeMax * haze;
      if (body.id === "Earth") {
        const rgb = `${red(discTint)},${green(discTint)},${blue(discTint)}`;
        const grad = drawingContext.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, surfaceRadius
        );
        grad.addColorStop(0, `rgba(${rgb},${peakAlpha * 0.1})`);
        grad.addColorStop(1, `rgba(${rgb},${peakAlpha})`);
        drawingContext.fillStyle = grad;
        drawingContext.beginPath();
        drawingContext.arc(screenX, screenY, surfaceRadius, 0, TWO_PI);
        drawingContext.fill();
      } else {
        discTint.setAlpha(255 * peakAlpha);
        fill(discTint);
        circle(screenX, screenY, surfaceRadius * 2);
      }
      stroke(0);
    }
  }
}

function calculateTWR() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const body = getBody(rocket.parentBody);
  const thrust = engineOutput(rocket).thrust;
  const weight = rocket.mass * body.surfaceGravity;
  if (weight === 0) {
    return "n/a";
  }
  return (thrust / weight).toFixed(2);
}

const easings = {
  "Linear": p => p,
  "Ease In": p => p * p,
  "Ease Out": p => 1 - (1 - p) * (1 - p),
  "Ease In Out": p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  "Bounce": p => {
    const n = 7.5625;
    const d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  },
  "Elastic": p => {
    if (p === 0 || p === 1) return p;
    return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  }
};

function queueThread(owner, tag, tasks) {
  threadQueues.push({ owner, tag, tasks, at: 0, elapsed: 0 });
}

function threadsFor(owner, tag) {
  return threadQueues.filter(t => t.owner === owner && (!tag || t.tag === tag));
}

function stopThreads(owner, tag) {
  threadQueues = threadQueues.filter(t => !(t.owner === owner && (!tag || t.tag === tag)));
}

function tweenTask(slot, key, from, to, seconds, easing) {
  const ease = easings[easing] || easings.Linear;
  return {
    seconds,
    run: (p) => {
      slot[key] = from + (to - from) * ease(p);
    }
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
  threadQueues = threadQueues.filter(t => t.at < t.tasks.length);
}

function baseBlur(part) {
  return Number(((part.modules || {})["Blur Module"] || {}).Blur) || 0;
}

function fxDefault(property, part) {
  return property === "Blur" ? baseBlur(part) : 1;   // width and height are multipliers
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
    const id = (row["Whole Prefab"] ? "part" : `g${Number(row.Group) || 0}`) + ":" + key;
    let chain = chains.get(id);
    if (!chain) {
      const start = slot[key] === undefined ? fxDefault(key, entry.part) : slot[key];
      chain = { slot, key, at: start, tasks: [] };
      chains.set(id, chain);
    }
    const to = Number(row.To) || 0;
    chain.tasks.push(
      tweenTask(chain.slot, chain.key, chain.at, to, Number(row.Seconds) || 0, row.Easing)
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
    "No Fuel": fuel <= 0
  };
  const results = picks.map(name => !!tests[name]);
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
        const flameAnim = flamePart && (flamePart.modules || {})["Animate Module"];
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
  threadQueues = threadQueues.filter(t => live.has(t.owner));
  updateThreads(dt);
}

let prevGuiTarget = null;

function drawPartGUIs() {
  const rocket = flyingRocket();
  if (inVab || inMap || !rocket || !rocket.stack) {
    return;
  }
  const switched = target !== prevGuiTarget;
  prevGuiTarget = target;
  const hovered = flightPartAt(rocket, mouseX, mouseY);
  rocket.stack.parts.forEach((entry, i) => {
    const gui = (entry.part.modules || {})["GUI Module"];
    if (!gui) {
      return;
    }
    if (gui.Trigger === "On Switched to Rocket" && switched) {
      entry.guiOpen = true;
    }
    if (gui.Trigger === "On Hover") {
      entry.guiOpen = entry === hovered;
    }
    if (entry.guiOpen) {
      renderGuiWindow(entry, gui, i);
    }
  });
}

function renderGuiWindow(entry, gui, idx) {
  const sx = 260;
  const sy = 46 + 28 * ((gui.Elements || []).length + 1);
  if (!entry.guiPos) {
    entry.guiPos = { x: (width - sx) / 2 + idx * 24, y: (height - sy) / 2 + idx * 24 };
  }
  const offsetX = gui.Popup ? 0 : entry.guiPos.x - (width - sx) / 2;
  const offsetY = gui.Popup ? 0 : entry.guiPos.y - (height - sy) / 2;
  const scope = moduleScope(entry);
  const panel = GUIAPI.panel(sx, sy, { borderColor: "#555", offsetX, offsetY, id: "gui-window-" + idx }, entry.part.name, ui => {
    for (const el of gui.Elements || []) {
      if (el.Type === "Label") {
        ui.label(interpolate(el.Label, scope));
      } else if (el.Type === "Button") {
        ui.button(0, 0, undefined, 26, { id: "gui-btn-" + idx + "::" + el.ID }, el.Label || el.ID);
      } else if (el.Type === "String Input" || el.Type === "Number Input") {
        ui.button(0, 0, undefined, 26, { id: "gui-input-" + idx + "::" + el.ID },
          (el.Label || el.ID) + ": " + (partVars(entry)[el.ID] ?? ""));
      }
    }
  });
  GUIAPI.button(panel.x + sx - 26, panel.y + 6, 20, 20, { id: "gui-close-" + idx, baseColor: "#733" }, "x");

  if (!gui.Popup && GUIAPI.contains(panel.x, panel.y, sx, 28)) {
    if (mouseIsPressed) {
      if (!entry._guiDrag) {
        entry._guiDrag = { dx: mouseX - entry.guiPos.x, dy: mouseY - entry.guiPos.y };
      }
      entry.guiPos.x = mouseX - entry._guiDrag.dx;
      entry.guiPos.y = mouseY - entry._guiDrag.dy;
    } else {
      entry._guiDrag = null;
    }
  } else if (!mouseIsPressed) {
    entry._guiDrag = null;
  }
}

function reentryGlowColor(tempC) {
  const stops = [
    [800, [255, 40, 0]],
    [1300, [255, 140, 0]],
    [1600, [255, 220, 60]],
    [1900, [255, 255, 255]]
  ];
  if (tempC <= stops[0][0]) {
    return `rgb(${stops[0][1].join(",")})`;
  }
  for (let i = 1; i < stops.length; i++) {
    if (tempC <= stops[i][0]) {
      const f = (tempC - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      const mix = stops[i - 1][1].map((v, ch) => Math.round(v + (stops[i][1][ch] - v) * f));
      return `rgb(${mix.join(",")})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(",")})`;
}

function drawReentryGlow(rocket, s) {
  if (rocket.temp === undefined) {
    return;
  }
  const tempC = rocket.temp - 273.15;
  const alpha = constrain((tempC - 800) / 700, 0, 1);
  if (alpha <= 0) {
    return;
  }
  const flamePart = hiddenPart("_flame");
  if (!flamePart) {
    return;
  }
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const entry of rocket.stack.parts) {
    const bb = partBBox(entry.part);
    minX = Math.min(minX, entry.ox - bb.w / 2);
    maxX = Math.max(maxX, entry.ox + bb.w / 2);
    maxY = Math.max(maxY, entry.oy + (bb.maxY - bb.cy));
  }
  const flameBB = partBBox(flamePart);
  const wide = ((maxX - minX) / flameBB.w) * 1.3;
  const tall = wide * 0.8;
  const cx = (minX + maxX) / 2;
  const flameY = maxY + (flameBB.maxY - flameBB.cy) * tall * 0.6;
  drawPart(flamePart, cx * s, flameY * s, s, {
    wide,
    tall: -tall,
    alpha,
    recolor: reentryGlowColor(Math.round(tempC / 25) * 25)
  });
}

const surfaceProps = [
  { part: "_vab", body: "Earth", angle: c.launchPadRotation, x: -120000, y: -225, solid: true, scaleX: 10, scaleY: 10, collideY: 0.8 },
  { part: "_launchtower", body: "Earth", angle: c.launchPadRotation, x: -33000, y: -225, solid: true, scaleX: 4, scaleY: 4, collideX: 0.35, collideY: 0.85 },
  { part: "_launchpad", body: "Earth", angle: c.launchPadRotation, x: -3000, y: -225, solid: true, scaleX: 3, scaleY: 3, collideY: 0.193, collideX: 0.95 },
  { part: "_monolith", body: "Earth", angle: 120, x: 0, y: -22500, solid: false }
];

// topmost solid point of the part at each column across it, measured up from
// the bottom edge that rests on the ground
function propProfile(part) {
  if (part._profile) {
    return part._profile;
  }
  const bb = partBBox(part);
  const columns = constrain(Math.round(bb.w / c.partUnits), 16, 1024);
  const step = bb.w / columns;
  const heights = new Array(columns).fill(0);
  for (let i = 0; i < columns; i++) {
    const x = bb.minX + (i + 0.5) * step;
    let top = Infinity;
    for (const group of part.groups) {
      if (group.cutout) {
        continue;
      }
      const points = group.points;
      for (let j = 0; j < points.length; j++) {
        const [x1, y1] = points[j];
        const [x2, y2] = points[(j + 1) % points.length];
        if ((x1 <= x && x2 > x) || (x2 <= x && x1 > x)) {
          top = Math.min(top, y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
        }
      }
    }
    heights[i] = top === Infinity ? 0 : bb.maxY - top;
  }
  part._profile = { heights, step, minX: bb.minX };
  return part._profile;
}

function propScales(prop) {
  const scaleX = prop.scaleX === undefined ? 1 : prop.scaleX;
  const scaleY = prop.scaleY === undefined ? 1 : prop.scaleY;
  return {
    scaleX,
    scaleY,
    collideX: prop.collideX === undefined ? scaleX : prop.collideX,
    collideY: prop.collideY === undefined ? scaleY : prop.collideY
  };
}

function propPlacement(prop) {
  const part = hiddenPart(prop.part);
  const body = getBody(prop.body);
  if (!part || !body) {
    return null;
  }
  const bb = partBBox(part);
  const scales = propScales(prop);
  const a = radians(prop.angle || 0);
  const out = { x: Math.sin(a), y: -Math.cos(a) };
  const side = (prop.x || 0) / c.partUnits;
  const lift = (prop.y || 0) / c.partUnits;
  const stand = body.size + (bb.h * scales.scaleY) / 2 / c.partUnits + lift;
  return {
    part,
    body,
    bb,
    scales,
    angle: a,
    x: body.pos.x + out.x * stand + Math.cos(a) * side,
    y: body.pos.y + out.y * stand + Math.sin(a) * side,
    base: body.size + lift,
    bearing: a + side / body.size
  };
}

function bearingOf(dx, dy) {
  return Math.atan2(dx, -dy);
}

function propContact(body, rocket, dx, dy, r) {
  const bottom = r - rocketRadius(rocket);
  const bearing = bearingOf(dx, dy);
  for (const prop of surfaceProps) {
    if (!prop.solid || prop.body !== body.id) {
      continue;
    }
    const place = propPlacement(prop);
    if (!place) {
      continue;
    }
    const profile = propProfile(place.part);
    const { collideX, collideY } = place.scales;
    const delta = bearing - place.bearing;
    const along = Math.atan2(Math.sin(delta), Math.cos(delta)) * body.size * c.partUnits;
    const column = Math.floor((along - profile.minX * collideX) / (profile.step * collideX));
    if (column < 0 || column >= profile.heights.length || profile.heights[column] <= 0) {
      continue;
    }
    const top = place.base + (profile.heights[column] * collideY) / c.partUnits;
    if (bottom >= top) {
      continue;
    }
    const clear = (bottom - place.base) * c.partUnits / collideY;
    let left = column;
    let right = column;
    while (left >= 0 && profile.heights[left] > clear) {
      left--;
    }
    while (right < profile.heights.length && profile.heights[right] > clear) {
      right++;
    }
    const stepWorld = (profile.step * collideX) / c.partUnits;
    const leftDist = left < 0 ? Infinity : (column - left + 1) * stepWorld;
    const rightDist = right >= profile.heights.length ? Infinity : (right - column + 1) * stepWorld;
    const sideDist = Math.min(leftDist, rightDist);
    if (sideDist < top - bottom) {
      return { mode: "side", dist: sideDist, dir: leftDist <= rightDist ? -1 : 1 };
    }
    return { mode: "up", top };
  }
  return null;
}

function surfaceRadiusAt(body, dx, dy) {
  let radius = body.size;
  const bearing = bearingOf(dx, dy);
  for (const prop of surfaceProps) {
    if (!prop.solid || prop.body !== body.id) {
      continue;
    }
    const place = propPlacement(prop);
    if (!place) {
      continue;
    }
    const delta = bearing - place.bearing;
    const along = Math.atan2(Math.sin(delta), Math.cos(delta)) * body.size * c.partUnits;
    const profile = propProfile(place.part);
    const { collideX, collideY } = place.scales;
    const column = Math.floor((along - profile.minX * collideX) / (profile.step * collideX));
    if (column < 0 || column >= profile.heights.length) {
      continue;
    }
    const height = profile.heights[column] * collideY;
    if (height > 0) {
      radius = Math.max(radius, place.base + height / c.partUnits);
    }
  }
  return radius;
}

function drawProps(cur) {
  const s = scale / c.partUnits;
  for (const prop of surfaceProps) {
    const place = propPlacement(prop);
    if (!place || place.bb.h * place.scales.scaleY * s < 2) {
      continue;
    }
    const screenX = width / 2 + (place.x - cur.pos.x) * scale;
    const screenY = height / 2 + (place.y - cur.pos.y) * scale;
    const reach = Math.max(place.bb.w * place.scales.scaleX, place.bb.h * place.scales.scaleY) * s;
    if (screenX < -reach || screenX > width + reach || screenY < -reach || screenY > height + reach) {
      continue;
    }
    push();
    translate(screenX, screenY);
    rotate(place.angle);
    drawPart(place.part, 0, 0, s, { wide: place.scales.scaleX, tall: place.scales.scaleY });
    pop();
  }
}

function walkEntities(value, found) {
  if (!value || typeof value !== "object") {
    return;
  }
  if (typeof value.type === "string" && "group" in value) {
    found.push(value);
    return;
  }
  for (const v of Object.values(value)) {
    walkEntities(v, found);
  }
}

function entityValues(modules) {
  const found = [];
  for (const value of Object.values(modules || {})) {
    walkEntities(value, found);
  }
  return found;
}

function partGroupCenter(part, index) {
  const sets = partSets(part);
  if (sets.tagged) {
    return sets.centres.get(index) || null;
  }
  const group = (part.groups || [])[index];
  if (!group) {
    return null;
  }
  const xs = group.points.map(p => p[0]);
  const ys = group.points.map(p => p[1]);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

function drawEntities(entry, s) {
  for (const entity of entityValues(entry.part.modules)) {
    const target = hiddenPart(entity.type);
    if (!target || entity.group == null) {
      continue;
    }
    const anchor = partGroupCenter(entry.part, entity.group);
    if (!anchor) {
      continue;
    }
    const ra = (entry.rot || 0) * HALF_PI;
    const lx = anchor.x + (entity.offsetX || 0);
    const ly = anchor.y + (entity.offsetY || 0);
    const wx = entry.ox + lx * Math.cos(ra) - ly * Math.sin(ra);
    const wy = entry.oy + lx * Math.sin(ra) + ly * Math.cos(ra);
    push();
    translate(wx * s, wy * s);
    rotate(ra + radians(entity.rotation || 0));
    drawPart(target, 0, 0, s, { wide: entity.sizeX ?? 1, tall: entity.sizeY ?? 1 });
    pop();
  }
}

function drawRocket(rocket, cur) {
  if (!rocket.stack) {
    return;
  }
  const screenX = width / 2 + (rocket.pos.x - cur.pos.x) * scale;
  const screenY = height / 2 + (rocket.pos.y - cur.pos.y) * scale;
  const s = scale / c.partUnits;

  if (screenX < -width || screenX > width * 2 || screenY < -height || screenY > height * 2) {
    return;
  }

  if (rocket.stack.h * s < 4) {
    noStroke();
    fill("#fff");
    circle(screenX, screenY, 4);
    return;
  }

  // spun about the middle of the stack, which is the point pos tracks. rotate()
  // is safe here, unlike scale(), which the global `scale` shadows
  push();
  translate(screenX, screenY);
  rotate(rocket.angle);
  drawReentryGlow(rocket, s);
  const rcsFiring = rcsOutput(rocket).firing;
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    drawPart(entry.part, entry.ox * s, entry.oy * s, s, { fx: entry.fx, rot: entry.rot, layer: "back", paint: entry.paint });
    drawEntities(entry, s);
    const engine = entry.part.modules["Engine Module"];
    let hasFuel = false;
    if (engine) {
      const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
      hasFuel = engineResources(engine).every(p => {
        const feed = feedTanks(rocket.stack, i, p.resource);
        return feed.length > 0 && (direction < 0 || feedHeld(feed, p.resource) > 0);
      });
    }
    if (engine && hasFuel && entry.on && throttle > 0) {
      const flamePart = hiddenPart(engine.Flame || "_flame");
      if (flamePart) {
        const bb = partBBox(entry.part);
        const flameBB = partBBox(flamePart);

        const raw = Number(engine["Flame Scale"]);
        const flameScale = Number.isFinite(raw) ? raw : 1;

        const fx = entry.flame && entry.flame.fx;
        const squish = ((fx && fx.part && fx.part.Height) === undefined) ? 1 : fx.part.Height;
        const off = (bb.maxY - bb.cy) + (flameBB.maxY - flameBB.cy) * flameScale * squish;
        const ra = (entry.rot || 0) * HALF_PI;
        drawPart(
          flamePart,
          (entry.ox - off * Math.sin(ra)) * s,
          (entry.oy + off * Math.cos(ra)) * s,
          s * flameScale,
          { fx, rot: entry.rot }
        );
      }
    }
    const rcsMod = entry.part.modules["RCS Module"];
    if (rcsMod && rcsFiring.has(entry)) {
      const flamePart = hiddenPart(rcsMod.Flame || "_flame");
      if (flamePart) {
        const bb = partBBox(entry.part);
        const touched = touchHeldCodes();
        const down = code => held.has(code) || touched.has(code);
        const dirs = rcsMod["Thruster Directions"] || [];
        const nozzles = [
          { key: "KeyI", dir: "Top", dx: 0, dy: bb.maxY - bb.cy, quarter: 0 },
          { key: "KeyK", dir: "Bottom", dx: 0, dy: bb.minY - bb.cy, quarter: 2 },
          { key: "KeyJ", dir: "Left", dx: bb.maxX - bb.cx, dy: 0, quarter: 1 },
          { key: "KeyL", dir: "Right", dx: bb.minX - bb.cx, dy: 0, quarter: 3 }
        ];
        const rcsScale = 0.16;
        const ra = (entry.rot || 0) * HALF_PI;
        for (const n of nozzles) {
          if (!dirs.includes(n.dir) || !down(n.key)) {
            continue;
          }
          const rx = n.dx * Math.cos(ra) - n.dy * Math.sin(ra);
          const ry = n.dx * Math.sin(ra) + n.dy * Math.cos(ra);
          drawPart(
            flamePart,
            (entry.ox + rx) * s,
            (entry.oy + ry) * s,
            s * rcsScale,
            { rot: ((entry.rot || 0) + n.quarter) % 4 }
          );
        }
      }
    }
    const chute = entry.part.modules["Parachute Module"];
    if (chute && entry.deployed) {
      const chutePart = hiddenPart("_parachute");
      if (chutePart) {
        const bb = partBBox(entry.part);
        const chuteBB = partBBox(chutePart);
        const ratio = Math.max((chute.Drag || 0) / c.chuteDrag, 1e-4);
        const wide = Math.pow(ratio, c.chuteWidthPower);
        const tall = Math.pow(ratio, c.chuteHeightPower);
        const off = (bb.minY - bb.cy) - (chuteBB.maxY - chuteBB.cy) * tall;
        const ra = (entry.rot || 0) * HALF_PI;
        drawPart(chutePart, (entry.ox - off * Math.sin(ra)) * s, (entry.oy + off * Math.cos(ra)) * s, s, {
          wide,
          tall,
          alpha: entry.torn ? 0.35 : undefined,
          rot: entry.rot
        });
      }
    }
  }
  for (const entry of rocket.stack.parts) {
    drawPart(entry.part, entry.ox * s, entry.oy * s, s, { fx: entry.fx, rot: entry.rot, layer: "front", paint: entry.paint });
  }
  for (const entry of rocket.stack.parts) {
    const shield = (entry.part.modules || {})["Heat Shield Module"];
    if (!shield) {
      continue;
    }
    const glow = heatShieldGlow(entry, shield);
    if (glow) {
      drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
        rot: entry.rot,
        recolor: glow.color,
        alpha: glow.alpha
      });
    }
  }
  for (const entry of rocket.stack.parts) {
    const tint = partHeatTint(entry);
    if (tint) {
      drawPart(entry.part, entry.ox * s, entry.oy * s, s, {
        rot: entry.rot,
        recolor: "#ff0000",
        alpha: tint
      });
    }
  }
  pop();
}

function partHeatTint(entry) {
  const tempC = (entry.temp ?? 0) - 273.15;
  return constrain(tempC / 1200, 0, 1);
}

function heatShieldGlow(entry, shield) {
  const held = (shield["Ablation Temperature"] ?? 1000) - 273.15;
  const tempC = (entry.surface ?? entry.temp ?? 0) - 273.15;
  const f = constrain(tempC / held, 0, 1.2);
  if (f <= 0.15) {
    return null;
  }
  const glowUp = constrain((f - 0.15) / 0.85, 0, 1);
  const color = [255, Math.round(60 + 160 * glowUp), Math.round(220 * Math.max(0, glowUp - 0.5) * 2)];
  return { color: `rgb(${color.join(",")})`, alpha: Math.min(0.85, glowUp) };
}

function formatTime(t) {
  const s = Math.floor(t % 60);
  const m = Math.floor(t / 60 % 60);
  const h = Math.floor(t / 3600 % 24);
  const d = Math.floor(t / 86400 % 365);
  const y = Math.floor(t / 31536000 % 1000000);
  const mil = Math.floor(t / 31536000000000);

  if (t < 60) return `${Math.round(t * 100) / 100}s`;
  if (t < 3600) return `${m}m ${s}s`;
  if (t < 86400) return `${h}h ${m}m ${s}s`;
  if (t < 31536000) return `${d}d ${h}h ${m}m ${s}s`;
  if (t < 31536000000000) return `${y}y ${d}d ${h}h ${m}m ${s}s`;
  return `${mil}myr ${y}y ${d}d ${h}h ${m}m ${s}s`;
}

function calculateAblator() {
  const rocket = rockets.find(rocket => rocket.id === target);
  const shields = rocket.stack ? rocket.stack.parts.filter(entry => entry.ablatorMax > 0) : [];
  const max = shields.reduce((sum, entry) => sum + entry.ablatorMax, 0);
  if (!max) {
    return "none";
  }
  return `${Math.round((shields.reduce((sum, entry) => sum + entry.ablator, 0) / max) * 100)}%`;
}

function calculateRocketTemp() {
  const rocket = rockets.find(rocket => rocket.id === target);
  return format("temperature", rocket.temp ?? ambientTemperature(rocket));
}

function draw() {
  background("#000000");

  if (bankrupt) {
    fill("#ff3b3b");
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME OVER", width / 2, height / 2 - 40);
    fill("#ccc");
    textSize(20);
    text("Every bank has called in its loans and you still can't cover them. Bankruptcy.", width / 2, height / 2 + 20);
    return;
  }

  GUIAPI.beginFrame();

  flightControls();

  runAnimations(1 / frameRate());
  runPartLogic(1 / frameRate());

  if (warpUntil !== null) {
    const remaining = warpUntil - t;
    if (remaining <= 0) {
      c.timewarp = timeWarpSteps[timeWarpCounter];
      warpUntil = null;
    } else {
      const perFrame = 1 / frameRate();
      let idx = timeWarpSteps.length - 1;
      while (idx > 0 && timeWarpSteps[idx] * perFrame > remaining) {
        idx--;
      }
      c.timewarp = timeWarpSteps[idx];
    }
  }

  clampTimewarpForOrbit(flyingRocket());

  if (burnLogging) {
    const controlled = flyingRocket();
    if (controlled) {
      const eo = engineOutput(controlled);
      const ro = rcsOutput(controlled);
      if (eo.thrust > 0) {
        logBurnEvent(controlled, "manual-engine", null);
      }
      if (ro.firing.size > 0) {
        logBurnEvent(controlled, "manual-rcs", null);
      }
    }
  }

  const dt = Math.min(
    (1 / frameRate()) * c.timewarp,
    warpUntil !== null ? Math.max(warpUntil - t, 1 / frameRate()) : Infinity
  );

  const substeps = constrain(ceil(dt / c.maxStep), 1, c.maxSubsteps);
  const h = dt / substeps;
  updateBodies();
  updateDocking(dt);
  for (let step = 0; step < substeps; step++) {
    for (const rocket of rockets) {
      if (rocket.destroyed) {
        continue;
      }
      if (rocket.landed) {
        landedSpinStep(rocket, h);
      } else {
        kickDrift(rocket, h);
      }
    }
    t += h;
    updateBodies();
    for (const hook of physicsHooks) {
      hook(h);
    }
    for (const rocket of rockets) {
      if (rocket.destroyed) {
        continue;
      }
      if (rocket.landed) {
        restOnSurface(rocket, h);
      } else {
        kickFinish(rocket, h);
      }
    }
  }
  if (careerMode) {
    checkCrewLosses();
  }
  rockets = rockets.filter(rocket => !rocket.destroyed);

  if (careerMode) {
    updateCareer();
  }

  for (const rocket of rockets) {
    updateRocketTemp(rocket, dt);
  }

  const curRocket = rockets.find(rocket => rocket.id === target);
  updateCamera(curRocket);

  if (rocketTimelineEnabled && curRocket) {
    const parent = curRocket.parentBody && getBody(curRocket.parentBody);
    const alt = parent ? distanceTo(curRocket, parent) - parent.size : null;
    const inAir = !!(parent && parent.atmosphereHeight && alt !== null && alt < parent.atmosphereHeight);
    const interval = inAir ? c.timelineAtmosphereSampleInterval : c.timelineSampleInterval;
    if (t - timelineLastSample >= interval) {
      logTimelineEvent(curRocket, "sample");
      timelineLastSample = t;
    }
  }

  push();
  translate(width / 2, height / 2);
  rotate(camera.angle);
  translate(-width / 2, -height / 2);

  const ordered = [...planets].sort(
    (a, b) => distanceTo(camera, b) - distanceTo(camera, a)
  );
  for (const body of ordered) {
    drawBody(body, camera);
  }

  drawProps(camera);

  for (const rocket of rockets) {
    drawRocket(rocket, camera);
  }
  if (curRocket && curRocket.stack && !inVab) {
    if (showPitchGuide) {
      drawPitchGuide(curRocket);
    }
    drawBurnGuide(curRocket);
    if (!inMap) {
      drawPartHover(curRocket);
    }
  }
  pop();

  runHook("draw:foreground", { rocket: curRocket, camera });

  fill("white");
  textSize(width/70);
  const lineHeight = width / 55;
  if (curRocket) {
    const other = rendezvousTarget && rockets.find(rocket => rocket.id === rendezvousTarget);
    const rel = other && rendezvousPlan(curRocket, other);
    const close = rel && rel.distance <= 20000;

    text(`Reference: ${curRocket.parentBody}`, 25, 50)
    text(close ? `Rel. Velocity: ${format("speed", rel.matchDv)}` : `Velocity: ${calculateVelocity()}`, 25, 50 + lineHeight)
    text(close ? `Rel. Distance: ${format("distance", rel.distance)}` : `Altitude: ${calculateAltitude()}`, 25, 50 + lineHeight * 2)
    text(`Atmospheric Pressure: ${calculatePressure()}`, 25, 50 + lineHeight * 3)
    text(`Apoapsis: ${calculateApoapsis()}`, 25, 50 + lineHeight * 4)
    text(`Periapsis: ${calculatePeriapsis()}`, 25, 50 + lineHeight * 5)
    text(`Temperature: ${calculateTemperature()}`, 25, 50 + lineHeight * 6)
    text(`Time: ${formatTime(t)}`, 25, 50 + lineHeight * 7)
    text(`Timewarp: ${formatTime(c.timewarp)}/s [${formatTimeWarpCounter()}▶]`, 25, 50 + lineHeight * 8);
    fill("White");
    text(`Throttle: ${throttle}%`, 25, 50 + lineHeight * 9)
    text(`Fuel: ${calculateFuel()}`, 25, 50 + lineHeight * 10)
    text(`TWR: ${calculateTWR()}`, 25, 50 + lineHeight * 11)
    text(`Pitch: ${calculatePitch()}`, 25, 50 + lineHeight * 12)
    text(`G force: ${calculateG()}`, 25, 50 + lineHeight * 13)
    text(`Rocket Temp: ${calculateRocketTemp()}`, 25, 50 + lineHeight * 14)
    text(`Heat shield: ${calculateAblator()}`, 25, 50 + lineHeight * 15)
  } else {
    text("Vessel destroyed", 25, 50)
    text(`Time: ${formatTime(t)}`, 25, 50 + lineHeight)
  }

  if (inVab) {
    drawVab();
  } else if (inMap) {
    drawMap();
  } else if (inMainMenu) {
    drawMainMenu();
    if (inCreditsMenu) {
      drawCreditsMenu();
    }
    if (inModLoaderMenu) {
      drawModLoaderMenu();
    }
    if (inFeaturedModsMenu) {
      drawFeaturedModsMenu();
    }
    if (inKeyBindsMenu) {
      drawKeyBindsMenu();
    }
  } else {
    cursor("default");
    const vb = vabButton();
    GUIAPI.button(vb.x, vb.y, vb.size, vb.size, {
      id: "vab",
      ...menuStyle,
      tooltip: ["Back to the bay", "  the flight keeps running"]
    }, "VAB");
    GUIAPI.button(vb.x - 75, vb.y, vb.size, vb.size, hasFeature("map")
      ? { id: "map", ...menuStyle }
      : { id: "map", ...menuStyleDisabled, tooltip: ["Map view", "  locked, research Orbital Tracking"] }
    , "Map");
    GUIAPI.button(vb.x - 150, vb.y, vb.size, vb.size, { id: "save", ...menuStyle }, "Save");
    GUIAPI.button(vb.x - 225, vb.y, vb.size, vb.size, { id: "load", ...menuStyle }, "Load");
    if (curRocket) {
      GUIAPI.button(vb.x - 225, vb.y + vb.size + 10, vb.size, vb.size, !hasFeature("sas")
        ? { id: "sas-toggle", ...menuStyleDisabled, tooltip: ["Stability assist [T]", "  locked, research Rudimentary Guidance"] }
        : curRocket.sas
        ? { id: "sas-toggle", baseColor: "#1f6b2f", hoverColor: "#2f8f45", activeColor: "#164f23", tooltip: ["Stability assist [T]", "  holds current heading"] }
        : { id: "sas-toggle", ...menuStyle, tooltip: ["Stability assist [T]", "  holds current heading"] }
      , "SAS");
    }
    if (careerMode && canRecover(curRocket)) {
      const unit = u.careerMode.modules["Career Module"].Unit;
      const value = recoveryValue(curRocket).toLocaleString("en-US");
      GUIAPI.button(vb.x - 475, vb.y + vb.size + 10, vb.size * 4, vb.size, {
        id: "recover",
        baseColor: "#1f6b2f",
        hoverColor: "#2f8f45",
        activeColor: "#164f23",
        tooltip: ["Recover vessel", "  refunds the parts still attached"]
      }, `Recover ${unit}${value}`);
    }
    const dueBurn = curRocket && pendingBurnWait(curRocket);
    if (dueBurn && dueBurn.due) {
      GUIAPI.button(vb.x - 550, vb.y, vb.size * 3, vb.size, {
        id: "automate-burn",
        baseColor: "#8f5a1f",
        hoverColor: "#c07a2a",
        activeColor: "#70481a",
        tooltip: [`Instantly perform the ${format("speed", Math.abs(dueBurn.dv))} burn`]
      }, "Automate Burn");
    } else if (warpUntil !== null) {
      GUIAPI.button(vb.x - 900, vb.y, vb.size * 3, vb.size, {
        id: "flight-warp-cancel",
        baseColor: "#7a2a2a",
        hoverColor: "#a03c3c",
        activeColor: "#5e1f1f"
      }, `Warping... ${formatTime(Math.max(warpUntil - t, 0))}`);
    } else if (dueBurn) {
      GUIAPI.button(vb.x - 900, vb.y, vb.size * 3, vb.size, {
        id: "flight-warp-burn",
        baseColor: "#8f5a1f",
        hoverColor: "#c07a2a",
        activeColor: "#70481a",
        tooltip: [`Warp ${formatTime(dueBurn.seconds)} to the ${dueBurn.label}`]
      }, `Warp to ${dueBurn.label}`);
    }
    if (isMobile) {
      for (const b of mobileFlightButtons()) {
        GUIAPI.button(b.x, b.y, b.sx, b.sy, { id: "touch-" + b.code, ...menuStyle }, b.label);
      }
      GUIAPI.button(vb.x - 300, vb.y, vb.size, vb.size, { id: "warp-up", ...menuStyle }, "▶▶");
      GUIAPI.button(vb.x - 375, vb.y, vb.size, vb.size, { id: "warp-down", ...menuStyle }, "◀◀");
    }
    GUIAPI.drawTooltip();
  }

  if (careerMissionsOpen) {
    drawMissions();
  }

  if (milestonesOpen) {
    drawMilestones();
  }

  if (loansOpen) {
    drawLoans();
  }

  if (!curRocket && !inVab && !inMainMenu) {
    skillIssue =GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "skill-issue" }, undefined, ui => {
      ui.label("Catastrophic Failure!", { size: 28, align: CENTER, height: 40 });
      ui.label(cd.message && cd.messageAt === cd.time ? cd.message : `Hit ${cd.body} at ${Math.round(cd.speed)} m/s, over the ${cd.limit === undefined ? c.crashSpeed : cd.limit} m/s the airframe takes`);
      ui.label(`Time of loss: ${Math.round(cd.time * 100) / 100}s`);
      ui.button(0, 10, undefined, 40, { id: "skillissue-vab", ...menuStyle }, "Go to VAB");
    });
  } else {
    skillIssue = null;
  }

  runHook("draw:main", { rocket: curRocket, camera });
  textSize(12);
  if (inMainMenu) {
    fill("black")
    rect(width - 195, height - 65, 150, 50)
  }
  fill("gold");
  text(`v${gameVersion} [GOLD]`, width - 120, height - 40);

  if (careerMode) {
    if (inVab) {
      drawCostBox();
    }
    drawBalanceBox();
    textSize(18);
    const barX = (inVab ? bayCentre() : width / 2) - (4 * 175 + 3 * 10) / 2;
    GUIAPI.button(barX, 50, 175, 40, {
      id: "career-missions",
      ...menuStyle
    }, "Missions");
    GUIAPI.button(barX + 185, 50, 175, 40, {
      id: "career-tech",
      ...menuStyle
    }, "Tech Tree");
    GUIAPI.button(barX + 370, 50, 175, 40, {
      id: "career-milestones",
      ...menuStyle
    }, "Milestones");
    GUIAPI.button(barX + 555, 50, 175, 40, {
      id: "career-loans",
      ...(balance < 0 ? { baseColor: "#7a2020", hoverColor: "#9c2b2b" } : menuStyle)
    }, "Loans");
  }

  if (techTreeOpen) {
    drawTechTree();
  }

  if (consoleOpen) {
    drawDevConsole();
  }

  toasts = toasts.filter(toast => toast.hide > t);
  toasts.forEach((toast, i) => {
    fill("#ccc");
    rect(width / 2 - 125, height / 2 - 37.5 + i * 85, 250, 75);
    fill("Black");
    text(toast.message, width / 2 - 120, height / 2 + 5 + i * 85);
  });

  if (inWorldCreation) {
    GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "example-rockets" }, undefined, ui => {
      ui.label("Create a World", { size: 28, align: CENTER, height: 40 });

      const row = ui.row(80);
      const dropdownW = 400;
      const labelGap = 30;
      textSize(30);
      const labelW = textWidth("Gamemode");
      const startX = row.x + (row.sx - (labelW + labelGap + dropdownW)) / 2;

      push();
      noStroke();
      fill(menuStyle.textColor || "#fff");
      textSize(30);
      textAlign(LEFT, CENTER);
      text("Gamemode", startX, row.y + row.sy / 2);
      pop();

      textSize(30);
      qualityIndex = GUIAPI.dropdown(startX + labelW + labelGap, row.y, dropdownW, 80, { id: "quality", ...menuStyle }, qualityOptions, qualityIndex);

      if (qualityOptions[qualityIndex] === "Career") {
        const row2 = ui.row(80);
        textSize(30);
        const labelW2 = textWidth("Difficulty");
        const startX2 = row2.x + (row2.sx - (labelW2 + labelGap + dropdownW)) / 2;

        push();
        noStroke();
        fill(menuStyle.textColor || "#fff");
        textSize(30);
        textAlign(LEFT, CENTER);
        text("Difficulty", startX2, row2.y + row2.sy / 2);
        pop();

        textSize(30);
        difficultyIndex = GUIAPI.dropdown(startX2 + labelW2 + labelGap, row2.y, dropdownW, 80, { id: "difficulty", ...menuStyle, baseColor: difficultyColors[difficultyIndex] }, difficultyOptions, difficultyIndex);
      }

      const buttonRow = ui.row(85);
      const btnGap = 20;
      const btnW = (buttonRow.sx - btnGap) / 2;
      GUIAPI.button(buttonRow.x, buttonRow.y + 20, btnW, 85, { id: "world-create", ...menuStyle }, "Create World");
      GUIAPI.button(buttonRow.x + btnW + btnGap, buttonRow.y + 20, btnW, 85, { id: "world-cancel", ...menuStyle, baseColor: "#733" }, "Cancel");
    });
  }

  if (exampleRocketsOpen) {
    GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555", id: "example-rockets" }, undefined, ui => {
      ui.label("Example Rockets", { size: 28, align: CENTER, height: 40 });

      ui.button(0, 0, 350, 85, {
        id: "example-little-bob",
        ...menuStyle
      }, "Little Bob - Atmospheric");

      ui.button(0, 0, 350, 85, {
        id: "example-big-bertha",
        ...menuStyle
      }, "Big Bertha - Suborbital");

      ui.button(0, 0, 350, 85, {
        id: "example-unknown-527",
        ...menuStyle
      }, "Simple Orbiter - Orbital");

      ui.button(0, 0, 350, 85, {
        id: "example-close",
        ...menuStyle
      }, "Close");
    });
  }

  drawPartGUIs();

  runHook("draw:absolute", { rocket: curRocket, camera });

  if (developerMode) {
    fill("Red");
    circle(10, 10, 5);
  }

  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );
  // thanks google AI overview for the check T_T

  if (isLocalhost) {
    fill("Yellow");
    circle(20, 10, 5);   
  }

  tt++;
}

function drawBalanceBox() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  hudBox(`${unit}${Math.round(balance).toLocaleString("en-US")}`, 54, balance < 0 ? "#ff6b6b" : "#8be08b");
}

function drawTechTreeButton() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  hudBox(`${unit}${Math.round(balance).toLocaleString("en-US")}`, 54, balance < 0 ? "#ff6b6b" : "#8be08b");
}

function drawCostBox() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  let color = "#ffd479";
  
  if (balance < stackCost()) {
    color = "#ff1b1b"
  }

  hudBox(`Cost: ${unit}${Math.round(stackCost()).toLocaleString("en-US")}`, 12, color);
}

function hudBox(label, offset, textColor) {
  const vb = vabButton();
  push();
  textSize(16);
  textStyle(BOLD);
  const pad = 12;
  const boxH = 34;
  const boxW = Math.max(110, textWidth(label) + pad * 2);
  const x = width - boxW - 20;
  const y = vb.y + vb.size + offset;
  noStroke();
  fill("#242a31dd");
  rect(x, y, boxW, boxH, 6);
  noFill();
  stroke("#5aa9ff");
  strokeWeight(2);
  rect(x, y, boxW, boxH, 6);
  noStroke();
  fill(textColor);
  textAlign(RIGHT, CENTER);
  text(label, x + boxW - pad, y + boxH / 2);
  pop();
}

const consoleTheme = {
  lineHeight: 18,
  inputHeight: 30,
  gap: 6,
  maxLines: 300,
  maxHistory: 50
};

function consoleBox() {
  const sx = Math.min(760, width - 80);
  const sy = constrain(height / 2, 220, 420);
  return {
    x: Math.round((width - sx) / 2),
    y: Math.round((height - sy) / 2),
    sx,
    sy
  };
}

function devLog(...parts) {
  const text = parts.map(part => {
    if (typeof part === "string") {
      return part;
    }
    try {
      return JSON.stringify(part);
    } catch (e) {
      return String(part);
    }
  }).join(" ");

  for (const line of text.split("\n")) {
    devConsole.lines.push(line);
  }
  while (devConsole.lines.length > consoleTheme.maxLines) {
    devConsole.lines.shift();
  }
  GUIAPI.autoBottom["console"] = true;
}

function runCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) {
    return;
  }
  devConsole.history.unshift(cmd);
  while (devConsole.history.length > consoleTheme.maxHistory) {
    devConsole.history.pop();
  }

  if (cmd === "js" || cmd.startsWith("js ")) {
    commandJs(cmd.slice(3));
    return;
  }

  const param = [];
  let buf = "";
  let depth = 0;
  for (const ch of cmd) {
    if (ch === "[" && depth++ === 0) continue;
    if (ch === "]" && --depth === 0) continue;
    if (ch === " " && depth === 0) {
      if (buf.length) param.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.length) param.push(buf);

  switch (param[0]) {
    case "tp":
      commandTp(param.slice(1));
      break;
    case "togglehidden":
      commandToggleHidden();
      break;
    default:
      devLog(`Unknown command ${cmd}`)
  }
}

function commandJs(code) {
  try {
    devLog(String(eval(code)));
  } catch (err) {
    devLog(String(err));
  }
}

function commandToggleHidden() {
  if (showHidden) {
    devLog("Untoggled hidden parts")
  } else {
    devLog("Toggled hidden parts")
  }
  showHidden = !showHidden;
}

// tp <String: Planet> <Number: Altitude> <Number: Rotation Around Planet> <Number: Velocity>
function commandTp(param) {
  if (param.length !== 4) {
    devLog("usage: tp <planet> <altitude> <rotation> <velocity>");
    return;
  }

  const rocket = rockets.find(rocket => rocket.id === target);
  if (!rocket) {
    devLog("no vessel to teleport");
    return;
  }

  const body = planets.find(planet => planet.id.toLowerCase() === param[0].toLowerCase());
  if (!body) {
    devLog(`no planet called ${param[0]}`);
    devLog(`  known: ${planets.map(planet => planet.id).join(", ")}`);
    return;
  }

  const altitude = Number(param[1]);
  const rotation = Number(param[2]);
  const speed = Number(param[3]);
  if (!isFinite(altitude) || !isFinite(rotation) || !isFinite(speed)) {
    devLog("altitude, rotation and velocity all have to be numbers");
    return;
  }
  const radius = body.size + altitude;
  if (radius <= 0) {
    devLog(`that altitude is inside ${body.id}`);
    return;
  }

  const angle = radians(rotation);
  const out = { x: Math.sin(angle), y: -Math.cos(angle) };
  const prograde = { x: Math.cos(angle), y: Math.sin(angle) };

  rocket.pos.x = body.pos.x + out.x * radius;
  rocket.pos.y = body.pos.y + out.y * radius;
  rocket.vel.x = body.vel.x + prograde.x * speed;
  rocket.vel.y = body.vel.y + prograde.y * speed;
  rocket.angle = angle;
  rocket.parentBody = body.id;
  rocket.landed = null;
  updateSOI(rocket);

  devLog(`${rocket.id} -> ${body.id}, ${format("distance", altitude)} up, ${rotation}°, ${format("speed", speed)}`);
  if (rocket.parentBody !== body.id) {
    devLog(`  that is outside ${body.id}'s SOI, now under ${rocket.parentBody}`);
  }
}

function consoleKeyPressed(event) {
  const code = event.code;

  if (code === "Enter" || code === "NumpadEnter") {
    runCommand(devConsole.input);
    devConsole.input = "";
    devConsole.historyIndex = -1;
    return;
  }
  if (code === "Backspace") {
    devConsole.input = devConsole.input.slice(0, -1);
    return;
  }
  if (code === "Escape") {
    devConsole.focused = false;
    return;
  }
  if (code === "ArrowUp" && devConsole.history.length) {
    devConsole.historyIndex = Math.min(devConsole.historyIndex + 1, devConsole.history.length - 1);
    devConsole.input = devConsole.history[devConsole.historyIndex];
    return;
  }
  if (code === "ArrowDown") {
    devConsole.historyIndex = Math.max(devConsole.historyIndex - 1, -1);
    devConsole.input = devConsole.historyIndex === -1 ? "" : devConsole.history[devConsole.historyIndex];
    return;
  }

  if (code === "KeyV" && (event.ctrlKey || event.metaKey)) {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(pasted => {
        devConsole.input += pasted.replace(/[\r\n]+/g, " ").trim();
      }).catch(() => {
        devLog("clipboard blocked by the browser");
      });
    }
    return;
  }

  if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    devConsole.input += event.key;
  }
}

function consoleInputTail(str, room) {
  let out = str;
  while (out.length && textWidth(out) > room) {
    out = out.slice(1);
  }
  return out;
}

function drawDevConsole() {
  const box = consoleBox();
  const { lineHeight, inputHeight, gap } = consoleTheme;

  const panel = GUIAPI.panel(box.sx, box.sy, {
    id: "console",
    borderColor: "#555",
    gap: 0,
    footer: inputHeight + gap,
    hint: "ctrl+4 to hide"
  }, "Console", ui => {
    for (const line of devConsole.lines) {
      ui.label(line, { size: 13, color: "#ddd", height: lineHeight });
    }
  });

  const field = { x: panel.footer.x, y: panel.footer.y + gap, sx: panel.footer.sx, sy: inputHeight };

  push();
  noStroke();
  fill("#1e1e1e");
  stroke(devConsole.focused ? "#2a6ac0" : "#555");
  strokeWeight(1);
  rect(field.x, field.y, field.sx, field.sy, 4);

  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);
  fill("#7fb2ff");
  text(">", field.x + 8, field.y + field.sy / 2);

  const textX = field.x + 22;
  const shownInput = consoleInputTail(devConsole.input, field.sx - 34);
  fill("#fff");
  text(shownInput, textX, field.y + field.sy / 2);

  if (devConsole.focused && frameCount % 60 < 30) {
    stroke("#fff");
    strokeWeight(1);
    const caretX = textX + textWidth(shownInput) + 1;
    line(caretX, field.y + 7, caretX, field.y + field.sy - 7);
  }
  pop();
}

function debug() {
  console.log("debug fired!")
}

const held = new Set();
const isMobile = forceMobileMode || matchMedia("(pointer: coarse)").matches;

function mobileFlightButtons() {
  const s = Math.min(width, height) / 7;
  const pad = s / 4;
  const y = height - s - pad;
  return [
    { code: "KeyQ", label: "◀", x: pad, y },
    { code: "KeyE", label: "▶", x: pad * 2 + s, y },
    { code: "KeyX", label: "X", x: width - (s + pad) * 2, y: y - s - pad },
    { code: "KeyZ", label: "Z", x: width - s - pad, y: y - s - pad },
    { code: "ControlLeft", label: "−", x: width - (s + pad) * 2, y },
    { code: "ShiftLeft", label: "+", x: width - s - pad, y }
  ].map(b => ({ ...b, sx: s, sy: s }));
}

function touchHeldCodes() {
  const codes = new Set();
  if (!isMobile || inVab || inMap || inMainMenu) {
    return codes;
  }
  const points = mouseIsPressed ? [...touches, { x: mouseX, y: mouseY }] : touches;
  for (const b of mobileFlightButtons()) {
    if (points.some(p => p.x >= b.x && p.x <= b.x + b.sx && p.y >= b.y && p.y <= b.y + b.sy)) {
      codes.add(b.code);
    }
  }
  return codes;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(event) {
  if ((keyCode === 52 && (keyIsDown(CONTROL) || keyIsDown(17))) && developerMode) {
    consoleOpen = !consoleOpen;
    devConsole.focused = consoleOpen;
    return false;
  }
  // while the console has focus the keys are text, not flight controls
  if (consoleOpen && devConsole.focused) {
    consoleKeyPressed(event);
    return false;
  }

  if (event.code === "KeyL" && event.shiftKey) {
    burnLogging = !burnLogging;
    launchToast(burnLogging ? "Burn logging on." : "Burn logging off.");
    return false;
  }

  if (event.code === "KeyP" && event.shiftKey) {
    downloadBurnLog();
    return false;
  }

  if (event.code === "KeyT" && !inVab) {
    toggleSAS();
    return false;
  }

  if (event.code === "KeyC" && !event.shiftKey && !event.ctrlKey && !event.metaKey && rocketTimelineEnabled && !inVab) {
    downloadRocketTimeline();
    return false;
  }

  if (inVab) {
    if (event.code === "KeyR" && vab.drag) {
      vab.drag.inst.rot = ((vab.drag.inst.rot || 0) + 1) % 4;
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyC" && vab.drag) {
      vab.clipboard = cloneParts(subtree(vab.drag.inst));
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyV" && vab.clipboard) {
      const copies = cloneParts(vab.clipboard);
      const root = copies[0];
      const dx = mouseX - root.x;
      const dy = mouseY - root.y;
      for (const p of copies) {
        p.x += dx;
        p.y += dy;
      }
      vab.parts.push(...copies);
      vab.drag = { inst: root, dx: 0, dy: 0, fromPalette: true };
      vab.snap = null;
      return false;
    }
    if ((event.code === "Delete" || event.code === "Backspace") && vab.drag) {
      const drop = new Set(subtree(vab.drag.inst));
      vab.parts = vab.parts.filter(p => !drop.has(p));
      vab.drag = null;
      vab.snap = null;
      return false;
    }
  }

  held.add(event.code);

  if (event.code === "Comma") {
    if (timeWarpCounter > 0) {
      timeWarpCounter--;
    }
    c.timewarp = timeWarpSteps[timeWarpCounter]
  }
  if (event.code === "Period") {
    if (timeWarpCounter < timeWarpSteps.length - 1) {
      timeWarpCounter++;
    }
    c.timewarp = timeWarpSteps[timeWarpCounter]
  }
}

function keyReleased(event) {
  held.delete(event.code);
}

window.addEventListener("blur", () => held.clear());

function flightControls() {
  const rocket = rockets.find(rocket => rocket.id === target);
  if (inVab || !rocket || !rocket.stack) {
    return;
  }
  const touched = touchHeldCodes();
  const down = code => held.has(code) || touched.has(code);

  if (!hasControl(rocket)) {
    rocket.turnInput = 0;
    return;
  }

  if (down("ShiftLeft") || down("ShiftRight")) {
    throttle = constrain(throttle + c.throttleStep, 0, 100);
  }
  if (down("ControlLeft") || down("ControlRight")) {
    throttle = constrain(throttle - c.throttleStep, 0, 100);
  }
  if (down("KeyX")) {
    throttle = 0;
  }
  if (down("KeyZ")) {
    throttle = 100;
  }

  let input = 0;
  if (down("KeyQ") || down("ArrowLeft")) {
    input -= 1;
  }
  if (down("KeyE") || down("ArrowRight")) {
    input += 1;
  }
  rocket.turnInput = input;
  if (input) {
    rocket.sasAngle = rocket.angle;
  }

  if (throttle !== timelineLastThrottle) {
    logTimelineEvent(rocket, "throttle", { throttle });
    timelineLastThrottle = throttle;
  }
  if (input !== timelineLastTurn) {
    logTimelineEvent(rocket, "turn", { turnInput: input });
    timelineLastTurn = input;
  }
}

function toggleSAS() {
  const rocket = rockets.find(rocket => rocket.id === target);
  if (!rocket) {
    return;
  }
  if (!hasFeature("sas")) {
    launchToast("SAS is locked");
    return;
  }
  if (!hasControl(rocket)) {
    launchToast("No pod or probe core");
    return;
  }
  rocket.sas = !rocket.sas;
  if (rocket.sas) {
    rocket.sasAngle = rocket.angle;
  }
  logTimelineEvent(rocket, "sas", { sas: rocket.sas });
}

function buttonOnClick(button) {
  const id = button.id;
  const data = button.data;
  const label = button.label;
  const x = button.x;
  const y = button.y;
  const sx = button.sx;
  const sy = button.sy;

  if (id && id.startsWith("paint-")) {
    paintClick(id);
    return;
  }

  if (data && data.type) {
    if (data.type === "featured-mod") {
      loadFeaturedMod(data);
    }
  }

  if (id && id.startsWith("gui-close-")) {
    const rocket = flyingRocket();
    const entry = rocket && rocket.stack.parts[Number(id.slice("gui-close-".length))];
    if (entry) {
      entry.guiOpen = false;
    }
  } else if (id && id.startsWith("gui-btn-")) {
    const [idxStr, elId] = id.slice("gui-btn-".length).split("::");
    const rocket = flyingRocket();
    const entry = rocket && rocket.stack.parts[Number(idxStr)];
    const gui = entry && (entry.part.modules || {})["GUI Module"];
    const action = gui && (gui.Actions || []).find(a => a.ID === elId);
    if (action && action.func === "Run Function" && action["Function Name"]) {
      runClockFunction(entry, action["Function Name"]);
    }
  } else if (id && id.startsWith("gui-input-")) {
    const [idxStr, elId] = id.slice("gui-input-".length).split("::");
    const rocket = flyingRocket();
    const entry = rocket && rocket.stack.parts[Number(idxStr)];
    if (entry) {
      const val = prompt("Set " + elId);
      if (val !== null) {
        partVars(entry)[elId] = parseLogicValue(val);
      }
    }
  }
}

function beginNewCareer() {
  for (const key in career) {
    delete career[key];
  }
  Object.assign(career, {
    completed: [], techs: ["basicRocketry"], science: 0, offers: [],
    active: null, milestones: {}, launches: 0, loans: defaultLoans(),
    difficulty: difficultyOptions[difficultyIndex]
  });
  career.offers = generateMissions(3);
  inMainMenu = false;
  inVab = true;
  careerMode = true;
  balance = Math.round(u.careerMode.modules["Career Module"]["Starting Cash"] * u.careerMode.modules["Career Module"]["Base multi"] * difficultyMult("startFunds"));
  saveCareer();
}

function startCareer() {
  inMainMenu = false;
  inVab = true;
  careerMode = true;
  career.difficulty = difficultyOptions[difficultyIndex];
  balance = Math.round(u.careerMode.modules["Career Module"]["Starting Cash"] * u.careerMode.modules["Career Module"]["Base multi"] * difficultyMult("startFunds"));
  // what the fuck?
  loadCareer();
}

async function mousePressed() {
  if (consoleOpen) {
    const box = consoleBox();
    if (GUIAPI.contains(box.x, box.y, box.sx, box.sy)) {
      devConsole.focused = true;
      return;
    }
    devConsole.focused = false;
  }

  GUIAPI.dispatch();

  if (careerMode && careerClick()) {
    return;
  }

  if (inVab) {
    if (GUIAPI.clicked("example-rockets")) {
      exampleRocketsOpen = !exampleRocketsOpen;
    }
    if (GUIAPI.clicked("vab-staging")) {
      stagingOpen = !stagingOpen;
    }
    if (stagingOpen) {
      vab.parts.forEach((inst, i) => {
        if (GUIAPI.clicked("stage-cycle-" + i)) {
          inst.stage = ((inst.stage ?? 0) + 1) % 10;
        }
      });
    }
    if (GUIAPI.clicked("example-little-bob")) {
      craftLoad(exampleCrafts["little-bob"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("example-big-bertha")) {
      craftLoad(exampleCrafts["big-bertha"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("example-unknown-527")) {
      craftLoad(exampleCrafts["Unknown_527's Rocket"]);
      exampleRocketsOpen = false;
    }
    if (GUIAPI.clicked("vab-mainmenu")) {
      inVab = false;
      inMainMenu = true;
    }
    if (GUIAPI.clicked("vab-export-world")) {
      gameSave();
      return;
    }
    if (GUIAPI.clicked("vab-import-world")) {
      gamePick();
      return;
    }
  }
  if (inMap && !inVab) {
    if (GUIAPI.clicked("map-fly")) {
      inMap = false;
    } else if (GUIAPI.clicked("map-recenter")) {
      mapPan.x = 0;
      mapPan.y = 0;
    } else if (GUIAPI.clicked("map-warp-cancel")) {
      warpUntil = null;
    } else if (GUIAPI.clicked("map-warp-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn) {
        warpUntil = t + burn.seconds;
      }
    } else {
      mapClick = { x: mouseX, y: mouseY };
    }
    return;
  }
  if (exampleRocketsOpen) {
    if (GUIAPI.clicked("example-close")) {
      exampleRocketsOpen = false;
    }
  }
  if (inMainMenu) {
    if (GUIAPI.clicked("credits-close")) {
      inCreditsMenu = false;
      return;
    }
    if (GUIAPI.clicked("modloader-close")) {
      inModLoaderMenu = false;
      return;
    }
    for (let i = 1; i < loaded.length; i++) {
      if (GUIAPI.clicked("mod-delete-" + i)) {
        loaded.splice(i, 1);
        persistLoadedMods();
        return;
      }
    }
    if (GUIAPI.clicked("modloader-new")) {
      const answer = prompt("Paste JSON of part pack data here");
      if (answer) {
        try {
          const pack = JSON.parse(answer);
          if (await loadPack(pack)) {
            await loadPartTextures();
          }
        } catch (err) {
          alert(`Couldn't parse that part pack: ${err.message}`);
        }
      }
      console.log(loaded);
      return;
    }
    if (GUIAPI.clicked("featured-mods-close")) {
      inFeaturedModsMenu = false;
      return;
    }
    if (GUIAPI.clicked("keybinds-close")) {
      inKeyBindsMenu = false;
      return;
    }
    if (GUIAPI.clicked("keybind-invert-vab-zoom")) {
      controls.invertVabZoom = !controls.invertVabZoom;
      return;
    }
    if (GUIAPI.clicked("keybind-invert-flight-zoom")) {
      controls.invertFlightZoom = !controls.invertFlightZoom;
      return;
    }
    if (GUIAPI.clicked("menu-build")) {
      careerMode = false;
      inMainMenu = false;
      inVab = true;
      return;
    }
    if (GUIAPI.clicked("menu-world")) {
      inWorldCreation = true;
      return;
    }
    if (GUIAPI.clicked("menu-career")) {
      startCareer();
      return;
    }
    if (GUIAPI.clicked("world-create")) {
      const worldExists = careerHasProgress() || vab.parts.length > 0;
      if (worldExists && !confirm("Starting a new world will overwrite your current progress. Continue?")) {
        return;
      }
      inWorldCreation = false;
      vab.parts = [];
      if (qualityOptions[qualityIndex] === "Career") {
        beginNewCareer();
      } else {
        for (const key in career) {
          delete career[key];
        }
        Object.assign(career, { completed: [], techs: ["basicRocketry"], science: 0, offers: [], active: null, milestones: {}, launches: 0, loans: {}, difficulty: "Normal" });
        careerMode = false;
        balance = 0;
        inMainMenu = false;
        inVab = true;
      }
      return;
    }
    if (GUIAPI.clicked("world-cancel")) {
      inWorldCreation = false;
      return;
    }
    if (GUIAPI.clicked("menu-disabled-career")) {
      alert("Career mode is in super WIP! As you can see by this plain alert box instead of some clean one.")
    }
    if (GUIAPI.clicked("menu-credits")) {
      inCreditsMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-modloader")) {
      inModLoaderMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-featured-mods")) {
      inFeaturedModsMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-keybinds")) {
      inKeyBindsMenu = true;
      return;
    }
    return;
  }
  if (!inVab) {
    if (GUIAPI.clicked("skillissue-vab")) {
      inVab = true;
      return;
    }
    if (GUIAPI.clicked("save")) {
      gameSave();
      return;
    }
    if (GUIAPI.clicked("load")) {
      gamePick();
      return;
    }
    if (GUIAPI.clicked("recover")) {
      recoverRocket();
      return;
    }
    if (GUIAPI.clicked("sas-toggle")) {
      toggleSAS();
      return;
    }
    if (GUIAPI.clicked("automate-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn && burn.due) {
        executeAutomatedBurn(ship, burn.dv);
      }
      return;
    }
    if (GUIAPI.clicked("flight-warp-cancel")) {
      warpUntil = null;
      return;
    }
    if (GUIAPI.clicked("flight-warp-burn")) {
      const ship = flyingRocket();
      const burn = ship && pendingBurnWait(ship);
      if (burn) {
        warpUntil = t + burn.seconds;
      }
      return;
    }
    if (GUIAPI.clicked("warp-down")) {
      if (timeWarpCounter > 0) {
        timeWarpCounter--;
      }
      c.timewarp = timeWarpSteps[timeWarpCounter];
      return;
    }
    if (GUIAPI.clicked("warp-up")) {
      if (timeWarpCounter < timeWarpSteps.length - 1) {
        timeWarpCounter++;
      }
      c.timewarp = timeWarpSteps[timeWarpCounter];
      return;
    }
    if (GUIAPI.blocked() && !GUIAPI.clicked("vab") && !GUIAPI.clicked("map")) {
      return;
    }
    if (GUIAPI.clicked("vab")) {
      inVab = true;
      return;
    }

    if (GUIAPI.clicked("map")) {
      if (hasFeature("map")) {
        inMap = true;
      } else {
        launchToast("Map view is locked");
      }
      return;
    }

    const rocket = rockets.find(rocket => rocket.id === target);
    const entry = flightPartAt(rocket, mouseX, mouseY);
    const modules = entry ? (entry.part.modules || {}) : {};
    const gui = modules["GUI Module"];
    if (gui && (gui.Trigger === "On Click" || (gui.Trigger === "On Right Click" && mouseButton === RIGHT))) {
      entry.guiOpen = gui.Popup ? !entry.guiOpen : true;
    }
    if (modules["Disable Action on Click"]) {
      return;
    }
    if (modules["Decoupler Module"]) {
      decouple(rocket, entry);
    } else if (modules["Parachute Module"]) {
      deployChute(rocket, entry);
    } else if (modules["Engine Module"] || modules["Togglable Module"]) {
      const engineMod = modules["Engine Module"];
      if (engineMod && engineMod["SRB Mode"]) {
        if (!entry.on)  {
          entry.on = true;
        }
      } else if (engineMod && !entry.on) {
        const used = entry.ignitionsUsed || 0;
        if (used < maxIgnitions(entry.part.name)) {
          entry.on = true;
        }
      } else {
        if (engineMod && entry.on) {
          entry.consumedIgnition = false;
        }
        entry.on = !entry.on;
      }
    } else if (modules["Docking Module"] && rocket.dockedWith) {
      undock(rocket);
    }
    return;
  }
  if (mouseX < panelWidth()) {
    if (GUIAPI.clicked("launch")) {
      launch();
      return;
    }
    if (GUIAPI.clicked("vab-fly")) {
      inVab = false;
      return;
    }
    for (const zb of zoomButtons()) {
      if (GUIAPI.clicked(zb.id)) {
        zoomVab(zb.factor, bayCentre(), height / 2);
        return;
      }
    }
    for (const cb of craftButtons()) {
      if (GUIAPI.clicked(cb.id)) {
        cb.action();
        return;
      }
    }
    for (const tab of categoryTabs()) {
      if (GUIAPI.clicked(tab.id)) {
        vab.category = tab.cat;
        vab.scroll = 0;
        return;
      }
    }
    for (const b of visiblePaletteLayout()) {
      if (GUIAPI.clicked(b.id)) {
        const inst = { part: b.part, x: mouseX, y: mouseY, attachedTo: null };
        vab.parts.push(inst);
        vab.drag = { inst, dx: 0, dy: 0, fromPalette: true };
        return;
      }
    }
    return;
  }
  if (GUIAPI.blocked()) {
    return;
  }
  const hit = partAt(mouseX, mouseY);
  if (hit) {
    detach(hit);
    vab.drag = { inst: hit, dx: mouseX - hit.x, dy: mouseY - hit.y, fromPalette: false, start: { x: mouseX, y: mouseY } };
  } else {
    vab.selected = null;
    vab.panning = true;
  }
}

function mouseDragged() {
  if (techTreeOpen) {
    techView.x += mouseX - pmouseX;
    techView.y += mouseY - pmouseY;
    return;
  }
  if (inMap && !inVab) {
    mapPan.x -= (mouseX - pmouseX) / mapScale;
    mapPan.y -= (mouseY - pmouseY) / mapScale;
    return;
  }
  if (inVab && vab.panning) {
    for (const inst of vab.parts) {
      inst.x += mouseX - pmouseX;
      inst.y += mouseY - pmouseY;
    }
    return;
  }
  if (!inVab || !vab.drag) {
    return;
  }
  const inst = vab.drag.inst;
  moveSubtree(inst, mouseX - vab.drag.dx - inst.x, mouseY - vab.drag.dy - inst.y);

  const snap = findSnap(inst);
  if (snap) {
    moveSubtree(inst, snap.dx, snap.dy);
  }
  vab.snap = snap;
}

function mouseReleased() {
  if (techTreeOpen) {
    if (techClick && Math.hypot(mouseX - techPress.x, mouseY - techPress.y) < 5) {
      researchTech(techClick);
    }
    techClick = null;
    return;
  }
  if (inMap && !inVab && mapClick) {
    if (Math.hypot(mouseX - mapClick.x, mouseY - mapClick.y) < 4) {
      const ship = flyingRocket();
      const anchor = ship ? ship.pos : camera.pos;
      const cx = anchor.x + mapPan.x;
      const cy = anchor.y + mapPan.y;
      const hitRocket = rockets.find(rocket => {
        if (rocket.id === target) {
          return false;
        }
        const x = width / 2 + (rocket.pos.x - cx) * mapScale;
        const y = height / 2 + (rocket.pos.y - cy) * mapScale;
        return Math.hypot(mouseX - x, mouseY - y) <= 8;
      });
      if (hitRocket) {
        rendezvousTarget = hitRocket.id;
      } else {
        const hit = planets.find(body => {
          const x = width / 2 + (body.pos.x - cx) * mapScale;
          const y = height / 2 + (body.pos.y - cy) * mapScale;
          return Math.hypot(mouseX - x, mouseY - y) <= Math.max(body.size * mapScale, 4) + 6;
        });
        transferTarget = hit && transferPlan(ship, hit) ? hit.id : null;
        rendezvousTarget = null;
      }
    }
    mapClick = null;
    return;
  }
  vab.panning = false;
  if (!inVab || !vab.drag) {
    return;
  }
  const inst = vab.drag.inst;
  if (vab.drag.start && Math.hypot(mouseX - vab.drag.start.x, mouseY - vab.drag.start.y) < 4) {
    vab.selected = inst;
  }
  if (mouseX < panelWidth()) {
    const drop = new Set(subtree(inst));
    vab.parts = vab.parts.filter(p => !drop.has(p));
  } else {
    const snap = findSnap(inst);
    if (snap) {
      moveSubtree(inst, snap.dx, snap.dy);
      if (snap.side === "top") {
        attach(snap.target, inst, "bottom");
      } else if (snap.target) {
        attach(inst, snap.target, snap.side);
      }
    }
  }
  vab.drag = null;
  vab.snap = null;
}

function mouseWheel(event) {
  if (techTreeOpen) {
    zoomTechTree(event.delta < 0 ? 1.12 : 1 / 1.12);
    return false;
  }
  if (GUIAPI.scroll(event.delta)) {
    return false;
  }
  if (inVab) {
    if (mouseX < panelWidth() && mouseY >= paletteTop()) {
      vab.scroll = constrain(vab.scroll + event.delta, 0, paletteMaxScroll());
      return false;
    }
    const up = controls.invertVabZoom ? event.delta <= 0 : event.delta > 0;
    zoomVab(up ? 1 + c.zoomPower : 1 - c.zoomPower, mouseX, mouseY);
    return;
  }
  const up = controls.invertFlightZoom ? event.delta <= 0 : event.delta > 0;
  if (inMap) {
    const factor = up ? 1 + c.zoomPower : 1 - c.zoomPower;
    mapScale = constrain(mapScale * factor, c.mapZoomMin, c.mapZoomMax);
    return;
  }
  if (up) {
    scale *= 1 + c.zoomPower;
  } else {
    scale *= 1 - c.zoomPower;
  }
}

document.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

executeLowPriority();
