// after piecing together my one year of p5.js and two years of javascript
// i've made this creation...

let scale = 5;
let mapScale = 5e-5;
let mapPan = { x: 0, y: 0 };
let transferTarget = null;
let mapClick = null;
let throttle = 0;
let target = "untitled-1";
let inVab = false;
let inMap = false; 
let careerMode = false;
let inMainMenu = true;
let exampleRocketsOpen = false;
let gameFont;
let eProgress = 0;
let inCreditsMenu = false;
let inModLoaderMenu = false;
let inAnnouncementsMenu = false;
let inKeyBindsMenu = false;
let careerMissionsOpen = false;
let techTreeOpen = true;
const controls = { 
  invertVabZoom: false, 
  invertFlightZoom: false 
};
let timeWarpSteps = [0.25, 0.5, 1, 2, 3, 5, 25, 100, 500, 2500, 10000, 50000, 250000, 1000000, 5000000, 25000000, 100000000, 500000000]
let timeWarpCounter = 2;
let toasts = [];
let t = 0;
let elapsed = 0;
let tt = 0;
let cd = {};
let anRes = null;
let consoleOpen = false;
let showHidden = false;
let balance = 0;
let devConsole = {
  focused: true,
  input: "",
  lines: [],
  history: [],
  historyIndex: -1,
  scroll: 0
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
  partUnits: 100,
  newtonsPerThrust: 1000,
  turnPower: 1.5,
  throttleStep: 2,
  crashSpeed: 55,
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
  chuteWidthPower: 0.5,
  chuteHeightPower: 0.1,
  launchPadRotation: 300
}

const loaded = [
{
  "format": "xopernicus-partpack",
  "version": 1,
  "parts": [
    {
      "name": "_launchpad",
      "size": [
        26400,
        14400
      ],
      "mass": 0,
      "groups": [
        {
          "fill": "#858585",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -13200,
              7200
            ],
            [
              -12000,
              7200
            ],
            [
              -12000,
              -7200
            ],
            [
              -13200,
              -7200
            ]
          ]
        },
        {
          "fill": "#ffffff",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -9600,
              -7200
            ],
            [
              -8285.34,
              -7174.17
            ],
            [
              -8400,
              7200
            ],
            [
              -9600,
              7200
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -7200
            ],
            [
              -9600,
              -4800
            ],
            [
              -9600,
              -4200
            ],
            [
              -12000,
              -6600
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -7200
            ],
            [
              -9600,
              -4800
            ],
            [
              -9600,
              -4200
            ],
            [
              -12000,
              -6600
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -6000
            ],
            [
              -9600,
              -3600
            ],
            [
              -9600,
              -3000
            ],
            [
              -12000,
              -5400
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -4800
            ],
            [
              -9600,
              -2400
            ],
            [
              -9600,
              -1800
            ],
            [
              -12000,
              -4200
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -3600
            ],
            [
              -9600,
              -1200
            ],
            [
              -9600,
              -600
            ],
            [
              -12000,
              -3000
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -2400
            ],
            [
              -9600,
              0
            ],
            [
              -9600,
              600
            ],
            [
              -12000,
              -1800
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              -1200
            ],
            [
              -9600,
              1200
            ],
            [
              -9600,
              1800
            ],
            [
              -12000,
              -600
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              0
            ],
            [
              -9600,
              2400
            ],
            [
              -9600,
              3000
            ],
            [
              -12000,
              600
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              1200
            ],
            [
              -9600,
              3600
            ],
            [
              -9600,
              4200
            ],
            [
              -12000,
              1800
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              2400
            ],
            [
              -9600,
              4800
            ],
            [
              -9600,
              5400
            ],
            [
              -12000,
              3000
            ]
          ]
        },
        {
          "fill": "#6b6b6b",
          "points": [
            [
              -12000,
              3600
            ],
            [
              -9600,
              6000
            ],
            [
              -9600,
              6600
            ],
            [
              -12000,
              4200
            ]
          ]
        },
        {
          "fill": "#595959",
          "texture": "LightPlate.avif",
          "points": [
            [
              -6000,
              7200
            ],
            [
              -2400,
              6000
            ],
            [
              9600,
              6000
            ],
            [
              13200,
              7200
            ]
          ]
        }
      ],
      "modules": {}
    },
    {
      "name": "_vab",
      "size": [
        36690.18,
        36288.2
      ],
      "mass": 1,
      "groups": [
        {
          "fill": "#949494",
          "points": [
            [
              -18345.09,
              -17509.62
            ],
            [
              -17654.91,
              18144.1
            ],
            [
              18345.09,
              18144.1
            ],
            [
              17359.85,
              -18144.1
            ]
          ]
        },
        {
          "fill": "#737373",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -9654.91,
              -17855.9
            ],
            [
              10345.09,
              -17855.9
            ],
            [
              10345.09,
              2144.1
            ],
            [
              -9654.91,
              2144.1
            ]
          ]
        }
      ],
      "modules": {}
    },
    {
      "name": "_monolith",
      "size": [
        84000,
        144000
      ],
      "mass": 1,
      "groups": [
        {
          "fill": "#787878",
          "texture": "LightPlate.avif",
          "points": [
            [
              -42000,
              72000
            ],
            [
              42000,
              72000
            ],
            [
              42000,
              -36000
            ],
            [
              18000,
              -72000
            ],
            [
              -18000,
              -72000
            ],
            [
              -42000,
              -36000
            ]
          ]
        }
      ],
      "modules": {}
    },
    {
      "name": "_flame",
      "size": [
        1448.54,
        1603.36
      ],
      "mass": 0,
      "groups": [
        {
          "fill": "#ff8614",
          "gradient": {
            "to": "#000000",
            "angle": 90,
            "toOpacity": 0
          },
          "points": [
            [
              -315.73,
              -801.68
            ],
            [
              -635.73,
              478.32
            ],
            [
              644.27,
              478.32
            ],
            [
              324.27,
              -801.68
            ]
          ]
        },
        {
          "fill": "#ffa629",
          "gradient": {
            "to": "#000000",
            "angle": 90,
            "toOpacity": 0.2,
            "fromOpacity": 0.2
          },
          "points": [
            [
              -475.73,
              -161.68
            ],
            [
              484.27,
              -161.68
            ],
            [
              724.27,
              798.32
            ],
            [
              -724.27,
              801.68
            ]
          ]
        },
        {
          "fill": "#ffeb0a",
          "gradient": {
            "to": "#000000",
            "angle": 90,
            "toOpacity": 0
          },
          "opacity": 0.4,
          "points": [
            [
              -155.73,
              -401.68
            ],
            [
              164.27,
              -401.68
            ],
            [
              484.27,
              478.32
            ],
            [
              -475.73,
              478.32
            ]
          ]
        }
      ],
      "modules": {
        "Animate Module": {
          "To Animate": [
            {
              "Whole Prefab": true,
              "Group": 0,
              "Property": "Height",
              "To": 0.7,
              "Seconds": 0.4,
              "Easing": "Ease In Out"
            },
            {
              "Whole Prefab": true,
              "Group": 0,
              "Property": "Height",
              "To": 1,
              "Seconds": 0.4,
              "Easing": "Ease In Out"
            }
          ],
          "Loop": true,
          "Trigger": [
            "Part Enabled",
            "Throttle Above 0"
          ],
          "Stop if condition false": true,
          "Start Animation": [
            {
              "Whole Prefab": true,
              "Group": 0,
              "Property": "Height",
              "Value": 0
            }
          ],
          "End Animation": [
            {
              "Whole Prefab": true,
              "Group": 0,
              "Property": "Height",
              "To": 0,
              "Seconds": 0.6,
              "Easing": "Linear"
            }
          ]
        },
        "Blur Module": {
          "Blur": 5
        }
      }
    },
    {
      "name": "_parachute",
      "size": [
        3520,
        2480
      ],
      "mass": 0,
      "groups": [
        {
          "fill": "#ff8614",
          "points": [
            [
              -240,
              -1240
            ],
            [
              -1760,
              -360
            ],
            [
              1760,
              -360
            ],
            [
              400,
              -1240
            ]
          ]
        },
        {
          "fill": "#f56565",
          "cutout": true,
          "points": [
            [
              1440,
              -360
            ],
            [
              -1440,
              -360
            ],
            [
              80,
              -920
            ]
          ]
        },
        {
          "fill": "#ffffff",
          "points": [
            [
              60,
              -360
            ],
            [
              100,
              -360
            ],
            [
              100,
              1240
            ],
            [
              60,
              1240
            ]
          ]
        }
      ],
      "modules": {}
    },
    {
      "name": "Capsule",
      "size": [
        640,
        640
      ],
      "mass": 4,
      "groups": [
        {
          "fill": "#bababa",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -120,
              -320
            ],
            [
              -320,
              320
            ],
            [
              320,
              320
            ],
            [
              120,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 5
        }
      }
    },
    {
      "name": "Spider Pod",
      "size": [
        160,
        280
      ],
      "mass": 0.04,
      "groups": [
        {
          "fill": "#4a5f73",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -120
            ],
            [
              -80,
              120
            ],
            [
              80,
              120
            ],
            [
              80,
              -120
            ],
            [
              40,
              -140
            ],
            [
              -40,
              -140
            ]
          ]
        },
        {
          "fill": "#4a5f73",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              120
            ],
            [
              80,
              120
            ],
            [
              40,
              140
            ],
            [
              -40,
              140
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 0
        }
      }
    },
    {
      "name": "Nano Reactionwheel",
      "size": [
        240,
        80
      ],
      "mass": 0.002,
      "groups": [
        {
          "fill": "#828282",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -120,
              40
            ],
            [
              120,
              40
            ],
            [
              120,
              -40
            ],
            [
              -120,
              -40
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 5
        }
      }
    },
    {
      "name": "Turbo Reactionwheel",
      "size": [
        640,
        80
      ],
      "mass": 0.006,
      "groups": [
        {
          "fill": "#666666",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -320,
              -40
            ],
            [
              -320,
              40
            ],
            [
              320,
              40
            ],
            [
              320,
              -40
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 15
        }
      }
    },
    {
      "name": "Large Turbo Reactionwheel",
      "size": [
        1280,
        80
      ],
      "mass": 0.02,
      "groups": [
        {
          "fill": "#666666",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -640,
              -40
            ],
            [
              -640,
              40
            ],
            [
              640,
              40
            ],
            [
              640,
              -40
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 30
        }
      }
    },
    {
      "name": "Extra Large Turbo Reactionwheel",
      "size": [
        2560,
        80
      ],
      "mass": 0.04,
      "groups": [
        {
          "fill": "#666666",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -1280,
              -40
            ],
            [
              -1280,
              40
            ],
            [
              1280,
              40
            ],
            [
              1280,
              -40
            ]
          ]
        }
      ],
      "modules": {
        "Controller Module": {
          "Torque": 60
        }
      }
    },
    {
      "name": "Mars Chute",
      "size": [
        89.18,
        193.12
      ],
      "mass": 0.3,
      "groups": [
        {
          "fill": "#51b2db",
          "points": [
            [
              -12.17,
              96.56
            ],
            [
              44.59,
              -96.56
            ],
            [
              -15.34,
              -71.4
            ],
            [
              -44.59,
              17.99
            ]
          ]
        }
      ],
      "modules": {
        "Parachute Module": {
          "Minimum Deploy Pressure": 0.25,
          "Drag": 50,
          "Max Deploy Speed": 2500
        },
        "Connection Disabler Module": {
          "Connections to Disable": [
            "Left",
            "Right",
            "Top",
            "Bottom"
          ]
        }
      }
    },
    {
      "name": "Drogue Chute",
      "size": [
        89.18,
        193.12
      ],
      "mass": 0.1,
      "groups": [
        {
          "fill": "#dbc451",
          "points": [
            [
              -12.17,
              96.56
            ],
            [
              44.59,
              -96.56
            ],
            [
              -15.34,
              -71.4
            ],
            [
              -44.59,
              17.99
            ]
          ]
        }
      ],
      "modules": {
        "Parachute Module": {
          "Minimum Deploy Pressure": 2.5,
          "Drag": 50,
          "Max Deploy Speed": 200
        },
        "Connection Disabler Module": {
          "Connections to Disable": [
            "Left",
            "Right",
            "Top",
            "Bottom"
          ]
        }
      }
    },
    {
      "name": "Parachute",
      "size": [
        240,
        100
      ],
      "mass": 0.5,
      "groups": [
        {
          "fill": "#cccccc",
          "points": [
            [
              -40,
              -50
            ],
            [
              -120,
              50
            ],
            [
              120,
              50
            ],
            [
              40,
              -50
            ]
          ]
        }
      ],
      "modules": {
        "Parachute Module": {
          "Minimum Deploy Pressure": 5,
          "Drag": 2000,
          "Max Deploy Speed": 70
        },
        "Connection Disabler Module": {
          "Connections to Disable": [
            "Left",
            "Right"
          ]
        }
      }
    },
    {
      "name": "Basic Engine",
      "size": [
        640,
        560
      ],
      "mass": 0.9,
      "groups": [
        {
          "fill": "#949494",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -320,
              -280
            ],
            [
              -320,
              -200
            ],
            [
              320,
              -200
            ],
            [
              320,
              -280
            ]
          ]
        },
        {
          "fill": "#c7c7c7",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -160,
              -200
            ],
            [
              160,
              -200
            ],
            [
              320,
              280
            ],
            [
              -320,
              280
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 1050,
          "ISP": 320,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 1,
          "SRB Mode": false
        }
      }
    },
    {
      "name": "Upgraded Basic Engine",
      "size": [
        660,
        560
      ],
      "mass": 1.1,
      "groups": [
        {
          "fill": "#949494",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -310,
              -280
            ],
            [
              -310,
              -200
            ],
            [
              330,
              -200
            ],
            [
              330,
              -280
            ]
          ]
        },
        {
          "fill": "#c7c7c7",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -150,
              -200
            ],
            [
              170,
              -200
            ],
            [
              330,
              280
            ],
            [
              -310,
              280
            ]
          ]
        },
        {
          "fill": "#ffffff",
          "texture": "LightPlate.avif",
          "points": [
            [
              -210,
              -200
            ],
            [
              -190,
              -200
            ],
            [
              -310,
              160
            ],
            [
              -330,
              160
            ]
          ]
        },
        {
          "fill": "#fff3a8",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -310,
              160
            ],
            [
              -310,
              140
            ],
            [
              290,
              140
            ],
            [
              290,
              160
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 1450,
          "ISP": 305,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 1
        }
      }
    },
    {
      "name": "Alpha Engine",
      "size": [
        1280,
        960
      ],
      "mass": 4,
      "groups": [
        {
          "fill": "#949494",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -640,
              -480
            ],
            [
              -640,
              -320
            ],
            [
              640,
              -320
            ],
            [
              640,
              -480
            ]
          ]
        },
        {
          "fill": "#c7c7c7",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -240,
              -320
            ],
            [
              240,
              -320
            ],
            [
              640,
              480
            ],
            [
              -640,
              480
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 5150,
          "ISP": 305,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 2
        }
      }
    },
    {
      "name": "Falcon-1 Engine",
      "size": [
        1280,
        960
      ],
      "mass": 4,
      "groups": [
        {
          "fill": "#949494",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -640,
              -480
            ],
            [
              -640,
              -320
            ],
            [
              640,
              -320
            ],
            [
              640,
              -480
            ]
          ]
        },
        {
          "fill": "#c7c7c7",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -240,
              -320
            ],
            [
              240,
              -320
            ],
            [
              640,
              480
            ],
            [
              -640,
              480
            ]
          ]
        },
        {
          "fill": "#525252",
          "points": [
            [
              -540,
              -320
            ],
            [
              -480,
              -320
            ],
            [
              -480,
              -160
            ],
            [
              -400,
              100
            ],
            [
              -440,
              140
            ],
            [
              -540,
              -160
            ]
          ]
        },
        {
          "fill": "#858585",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -400,
              100
            ],
            [
              -440,
              140
            ],
            [
              471.14,
              141.16
            ],
            [
              451.63,
              99.67
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 6770,
          "ISP": 264,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 2
        }
      }
    },
    {
      "name": "Vacuum Engine",
      "size": [
        480,
        560
      ],
      "mass": 0.6,
      "groups": [
        {
          "fill": "#dfcfb3",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -240,
              -280
            ],
            [
              -160,
              -200
            ],
            [
              160,
              -200
            ],
            [
              240,
              -280
            ]
          ]
        },
        {
          "fill": "#c4c4c4",
          "texture": "LightPlate.avif",
          "points": [
            [
              -80,
              -200
            ],
            [
              80,
              -200
            ],
            [
              240,
              280
            ],
            [
              -240,
              280
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 235,
          "ISP": 420,
          "Fuel Flow": "Positive",
          "Resource": "Hydrolox",
          "Flame Scale": 1
        }
      }
    },
    {
      "name": "Upgraded Vacuum Engine",
      "size": [
        580,
        560
      ],
      "mass": 0.8,
      "groups": [
        {
          "fill": "#5e5e5e",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -290,
              -280
            ],
            [
              -170,
              -200
            ],
            [
              150,
              -200
            ],
            [
              290,
              -280
            ]
          ]
        },
        {
          "fill": "#5cb8ff",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -90,
              -200
            ],
            [
              70,
              -200
            ],
            [
              230,
              280
            ],
            [
              -250,
              280
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 300,
          "ISP": 450,
          "Fuel Flow": "Positive",
          "Resource": "Hydrolox",
          "Flame Scale": 1
        }
      }
    },
    {
      "name": "Stoat Engine",
      "size": [
        480,
        320
      ],
      "mass": 0.75,
      "groups": [
        {
          "fill": "#dfcfb3",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -240,
              -160
            ],
            [
              -160,
              -80
            ],
            [
              160,
              -80
            ],
            [
              240,
              -160
            ]
          ]
        },
        {
          "fill": "#c4c4c4",
          "texture": "LightPlate.avif",
          "points": [
            [
              -80,
              -80
            ],
            [
              80,
              -80
            ],
            [
              240,
              160
            ],
            [
              -240,
              160
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 250,
          "ISP": 330,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 1
        }
      }
    },
    {
      "name": "Pup engine",
      "size": [
        160,
        220
      ],
      "mass": 0.03,
      "groups": [
        {
          "fill": "#dfcfb3",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -110
            ],
            [
              -20,
              -30
            ],
            [
              20,
              -30
            ],
            [
              80,
              -110
            ]
          ]
        },
        {
          "fill": "#c4c4c4",
          "texture": "LightPlate.avif",
          "points": [
            [
              -20,
              -30
            ],
            [
              20,
              -30
            ],
            [
              80,
              110
            ],
            [
              -80,
              110
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 20,
          "ISP": 315,
          "Fuel Flow": "Positive",
          "Resource": "Kerolox",
          "Flame Scale": 0.25
        }
      }
    },
    {
      "name": "Ion Engine",
      "size": [
        160,
        100
      ],
      "mass": 0.03,
      "groups": [
        {
          "fill": "#383838",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -50
            ],
            [
              -80,
              10
            ],
            [
              80,
              10
            ],
            [
              80,
              -50
            ]
          ]
        },
        {
          "fill": "#999999",
          "texture": "LightPlate.avif",
          "points": [
            [
              -60,
              10
            ],
            [
              60,
              10
            ],
            [
              60,
              50
            ],
            [
              -60,
              50
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 0.0025,
          "ISP": 3000,
          "Fuel Flow": "Positive",
          "Resource": "Xenon",
          "Flame Scale": 0.1
        }
      }
    },
    {
      "name": "Hydrolox Tank",
      "size": [
        640,
        320
      ],
      "mass": 2.7,
      "groups": [
        {
          "fill": "#009dff",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -160
            ],
            [
              -320,
              160
            ],
            [
              320,
              160
            ],
            [
              320,
              -160
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 2.5,
          "Resource": "Hydrolox"
        }
      }
    },
    {
      "name": "SM Hydrolox Tank",
      "size": [
        640,
        640
      ],
      "mass": 5.33,
      "groups": [
        {
          "fill": "#009dff",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -320
            ],
            [
              -320,
              320
            ],
            [
              320,
              320
            ],
            [
              320,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 5,
          "Resource": "Hydrolox"
        }
      }
    },
    {
      "name": "MD Hydrolox Tank",
      "size": [
        640,
        1280
      ],
      "mass": 10.67,
      "groups": [
        {
          "fill": "#009dff",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -640
            ],
            [
              -320,
              640
            ],
            [
              320,
              640
            ],
            [
              320,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 10,
          "Resource": "Hydrolox"
        }
      }
    },
    {
      "name": "LG Hydrolox Tank",
      "size": [
        640,
        2560
      ],
      "mass": 21.33,
      "groups": [
        {
          "fill": "#009dff",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -1280
            ],
            [
              -320,
              1280
            ],
            [
              320,
              1280
            ],
            [
              320,
              -1280
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 20,
          "Resource": "Hydrolox"
        }
      }
    },
    {
      "name": "Xenon Tank",
      "size": [
        320,
        160
      ],
      "mass": 2.4,
      "groups": [
        {
          "fill": "#2b2b31",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -80
            ],
            [
              -160,
              80
            ],
            [
              160,
              80
            ],
            [
              160,
              -80
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 2.2,
          "Resource": "Xenon"
        }
      }
    },
    {
      "name": "Tiny XS Fuel Tank",
      "size": [
        320,
        160
      ],
      "mass": 1.1875,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -80
            ],
            [
              -160,
              80
            ],
            [
              160,
              80
            ],
            [
              160,
              -80
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 1,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "Tiny SM Fuel Tank",
      "size": [
        320,
        320
      ],
      "mass": 2.375,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -160
            ],
            [
              -160,
              160
            ],
            [
              160,
              160
            ],
            [
              160,
              -160
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 2,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "Tiny MD Fuel Tank",
      "size": [
        320,
        640
      ],
      "mass": 4.75,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -320
            ],
            [
              -160,
              320
            ],
            [
              160,
              320
            ],
            [
              160,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 4,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "Tiny LG Fuel Tank",
      "size": [
        320,
        1280
      ],
      "mass": 9.5,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -640
            ],
            [
              -160,
              640
            ],
            [
              160,
              640
            ],
            [
              160,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 8,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "XS Fuel Tank",
      "size": [
        640,
        320
      ],
      "mass": 4.75,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -160
            ],
            [
              -320,
              160
            ],
            [
              320,
              160
            ],
            [
              320,
              -160
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 4.5,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "SM Fuel Tank",
      "size": [
        640,
        640
      ],
      "mass": 9.5,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -320
            ],
            [
              -320,
              320
            ],
            [
              320,
              320
            ],
            [
              320,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 9,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "MD Fuel Tank",
      "size": [
        640,
        1280
      ],
      "mass": 19,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -640
            ],
            [
              -320,
              640
            ],
            [
              320,
              640
            ],
            [
              320,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 18,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "LG Fuel Tank",
      "size": [
        640,
        2560
      ],
      "mass": 38,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -1280
            ],
            [
              -320,
              1280
            ],
            [
              320,
              1280
            ],
            [
              320,
              -1280
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 36,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "XS Big Fuel Tank",
      "size": [
        1280,
        640
      ],
      "mass": 19,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -640,
              -320
            ],
            [
              -640,
              320
            ],
            [
              640,
              320
            ],
            [
              640,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 18,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "SM Big Fuel Tank",
      "size": [
        1280,
        1280
      ],
      "mass": 38,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -640,
              -640
            ],
            [
              -640,
              640
            ],
            [
              640,
              640
            ],
            [
              640,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 36,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "MD Big Fuel Tank",
      "size": [
        1280,
        2560
      ],
      "mass": 76,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -640,
              -1280
            ],
            [
              -640,
              1280
            ],
            [
              640,
              1280
            ],
            [
              640,
              -1280
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 72,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "LG Big Fuel Tank",
      "size": [
        1280,
        5120
      ],
      "mass": 152,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -640,
              -2560
            ],
            [
              -640,
              2560
            ],
            [
              640,
              2560
            ],
            [
              640,
              -2560
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 144,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "XS Massive Fuel Tank",
      "size": [
        2560,
        1280
      ],
      "mass": 76,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -640
            ],
            [
              -1280,
              640
            ],
            [
              1280,
              640
            ],
            [
              1280,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 72,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "SM Massive Fuel Tank",
      "size": [
        2560,
        2560
      ],
      "mass": 152,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -1280
            ],
            [
              -1280,
              1280
            ],
            [
              1280,
              1280
            ],
            [
              1280,
              -1280
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 144,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "MD Massive Fuel Tank",
      "size": [
        2560,
        5120
      ],
      "mass": 304,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -2560
            ],
            [
              -1280,
              2560
            ],
            [
              1280,
              2560
            ],
            [
              1280,
              -2560
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 288,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "LG Massive Fuel Tank",
      "size": [
        2560,
        10240
      ],
      "mass": 608,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -5120
            ],
            [
              -1280,
              5120
            ],
            [
              1280,
              5120
            ],
            [
              1280,
              -5120
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 576,
          "Resource": "Kerolox"
        }
      }
    },
    {
      "name": "Massive Base",
      "size": [
        4160,
        1281
      ],
      "mass": 40,
      "groups": [
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -640.5
            ],
            [
              -2080,
              640.5
            ],
            [
              2080,
              640.5
            ],
            [
              1280,
              -640.5
            ]
          ]
        }
      ],
      "modules": {
        "Resource Module": {
          "Amount": 30,
          "Resource": "Kerolox"
        },
        "Connection Disabler Module": {
          "Connections to Disable": [
            "Left",
            "Right"
          ]
        }
      }
    },
    {
      "name": "UR30 Booster",
      "size": [
        640,
        1520
      ],
      "mass": 18,
      "groups": [
        {
          "fill": "#ffffff",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -160,
              280
            ],
            [
              160,
              280
            ],
            [
              320,
              760
            ],
            [
              -320,
              760
            ]
          ]
        },
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              280
            ],
            [
              320,
              280
            ],
            [
              320,
              -760
            ],
            [
              -320,
              -760
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 720,
          "ISP": 180,
          "Fuel Flow": "Positive",
          "Resource": "Solid Fuel",
          "Flame Scale": 1,
          "SRB Mode": true
        },
        "Resource Module": {
          "Amount": 15,
          "Resource": "Solid Fuel"
        }
      }
    },
    {
      "name": "UR60 Booster",
      "size": [
        640,
        6200
      ],
      "mass": 144,
      "groups": [
        {
          "fill": "#ffffff",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -160,
              2620
            ],
            [
              160,
              2620
            ],
            [
              320,
              3100
            ],
            [
              -320,
              3100
            ]
          ]
        },
        {
          "fill": "#eef1f2",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              2660
            ],
            [
              160,
              2660
            ],
            [
              160,
              -3100
            ],
            [
              -320,
              -3100
            ]
          ]
        },
        {
          "fill": "#525252",
          "texture": "LightPlate.avif",
          "points": [
            [
              160,
              -3100
            ],
            [
              320,
              -3100
            ],
            [
              320,
              2660
            ],
            [
              160,
              2660
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 2650,
          "ISP": 215,
          "Fuel Flow": "Positive",
          "Resource": "Solid Fuel",
          "Flame Scale": 1,
          "SRB Mode": true
        },
        "Resource Module": {
          "Amount": 125,
          "Resource": "Solid Fuel"
        }
      }
    },
    {
      "name": "UR120 Booster",
      "size": [
        1440,
        11520
      ],
      "mass": 758,
      "groups": [
        {
          "fill": "#ffffff",
          "texture": "DarkPlate.avif",
          "points": [
            [
              -160,
              4720
            ],
            [
              160,
              4720
            ],
            [
              720,
              5760
            ],
            [
              -720,
              5760
            ]
          ]
        },
        {
          "fill": "#d6d6d6",
          "texture": "LightPlate.avif",
          "points": [
            [
              -720,
              4800
            ],
            [
              720,
              4800
            ],
            [
              720,
              -5760
            ],
            [
              -720,
              -5760
            ]
          ]
        },
        {
          "fill": "#c4c4c4",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -720,
              4800
            ],
            [
              720,
              4800
            ],
            [
              400,
              4960
            ],
            [
              -400,
              4960
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 14000,
          "ISP": 220,
          "Fuel Flow": "Positive",
          "Resource": "Solid Fuel",
          "Flame Scale": 3,
          "SRB Mode": true
        },
        "Resource Module": {
          "Amount": 650,
          "Resource": "Solid Fuel"
        }
      }
    },
    {
      "name": "XL Decoupler",
      "size": [
        2560,
        1280
      ],
      "mass": 0.4,
      "groups": [
        {
          "fill": "#949494",
          "texture": "LightPlate.avif",
          "points": [
            [
              -1280,
              -640
            ],
            [
              -1280,
              640
            ],
            [
              1280,
              640
            ],
            [
              1280,
              -640
            ]
          ]
        }
      ],
      "modules": {
        "Decoupler Module": {
          "Separation Force": 120
        }
      }
    },
    {
      "name": "LG Decoupler",
      "size": [
        1280,
        640
      ],
      "mass": 0.2,
      "groups": [
        {
          "fill": "#949494",
          "texture": "LightPlate.avif",
          "points": [
            [
              -640,
              -320
            ],
            [
              -640,
              320
            ],
            [
              640,
              320
            ],
            [
              640,
              -320
            ]
          ]
        }
      ],
      "modules": {
        "Decoupler Module": {
          "Separation Force": 100
        }
      }
    },
    {
      "name": "MD Decoupler",
      "size": [
        640,
        320
      ],
      "mass": 0.1,
      "groups": [
        {
          "fill": "#949494",
          "texture": "LightPlate.avif",
          "points": [
            [
              -320,
              -160
            ],
            [
              -320,
              160
            ],
            [
              320,
              160
            ],
            [
              320,
              -160
            ]
          ]
        }
      ],
      "modules": {
        "Decoupler Module": {
          "Separation Force": 80
        }
      }
    },
    {
      "name": "SM Decoupler",
      "size": [
        320,
        160
      ],
      "mass": 0.05,
      "groups": [
        {
          "fill": "#949494",
          "texture": "LightPlate.avif",
          "points": [
            [
              -160,
              -80
            ],
            [
              -160,
              80
            ],
            [
              160,
              80
            ],
            [
              160,
              -80
            ]
          ]
        }
      ],
      "modules": {
        "Decoupler Module": {
          "Separation Force": 60
        }
      }
    },
    {
      "name": "Drill",
      "size": [
        160,
        100
      ],
      "mass": 0.25,
      "groups": [
        {
          "fill": "#383838",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -50
            ],
            [
              -80,
              10
            ],
            [
              80,
              10
            ],
            [
              80,
              -50
            ]
          ]
        },
        {
          "fill": "#999999",
          "texture": "LightPlate.avif",
          "points": [
            [
              -60,
              10
            ],
            [
              60,
              10
            ],
            [
              60,
              50
            ],
            [
              -60,
              50
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 0.0025,
          "ISP": 0.1,
          "Fuel Flow": "Negative",
          "Resource": "Ore",
          "Flame Scale": 0
        },
        "Prototype Module": {}
      }
    },
    {
      "name": "Burner",
      "size": [
        160,
        60
      ],
      "mass": 0.25,
      "groups": [
        {
          "fill": "#ff0000",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -30
            ],
            [
              -80,
              30
            ],
            [
              80,
              30
            ],
            [
              80,
              -30
            ]
          ]
        }
      ],
      "modules": {
        "Engine Module": {
          "Thrust": 0.2,
          "ISP": 0.00001,
          "Fuel Flow": "Positive",
          "Resource": "Ore",
          "Flame Scale": 0
        },
        "Prototype Module": {}
      }
    },
    {
      "name": "Ore Tank",
      "size": [
        160,
        100
      ],
      "mass": 4,
      "groups": [
        {
          "fill": "#383838",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -80,
              -50
            ],
            [
              -80,
              50
            ],
            [
              80,
              50
            ],
            [
              80,
              -50
            ]
          ]
        }
      ],
      "modules": {
        "Prototype Module": {},
        "Resource Module": {
          "Amount": 3.6,
          "Resource": "Ore"
        }
      }
    },
    {
      "name": "Fuel Pipe",
      "size": [
        80,
        100
      ],
      "mass": 4,
      "groups": [
        {
          "fill": "#ff2600",
          "texture": "MetalPlate.avif",
          "points": [
            [
              -40,
              -50
            ],
            [
              -40,
              50
            ],
            [
              40,
              50
            ],
            [
              40,
              -50
            ]
          ]
        }
      ],
      "modules": {
        "Prototype Module": {},
        "Fuelpipe Module": {
          "Input Fuel": "Ore",
          "Output Fuel": "Kerolox",
          "Rate (Kg/Sec)": 100
        }
      }
    }
  ]
}
]


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
        "Special": [
          {
            "Trigger": "First Launch",
            "Amount to Give": 3.5
          },
          {
            "Trigger": "Reach Upper Atmosphere",
            "Amount to Give": 2.5
          },
          {
            "Trigger": "Reach Space",
            "Amount to Give": 6
          }
        ]
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
/*  if (booting) {
    showFatalErrorScreen(message);
}*/
  return true;
};

window.addEventListener("unhandledrejection", function(event) {
  fatalError(event.reason.message || event.reason);
  //showFatalErrorScreen(event.reason.message || event.reason);
  event.preventDefault();
});

/*function showFatalErrorScreen(errorMessage) {
// thanks google ai overview again
  alert("FATAL ERROR: " + errorMessage);
}*/

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
  order: 0,
  onButton: null,
  beginFrame() {
    this.order = 0;
    this.blockers = this.blockers.filter(b => b.frame >= frameCount - 1);
    this.buttons = this.buttons.filter(b => b.frame >= frameCount - 1);
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
  panel(sx, sy, extras = {}, title) {
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
    }
    pop();

    const content = {
      x: x + pad,
      y: y + pad + titleHeight,
      sx: sx - pad * 2,
      sy: sy - pad * 2 - titleHeight
    };
    this.into(content);
    return { x, y, sx, sy, content };
  },
  flow: null,
  into(rect, gap = 6, rowHeight = 22) {
    this.flow = { x: rect.x, y: rect.y, sx: rect.sx, gap, rowHeight };
  },
  row(height) {
    const f = this.flow;
    const out = { x: f.x, y: f.y, sx: f.sx, sy: height === undefined ? f.rowHeight : height };
    f.y += out.sy + f.gap;
    return out;
  },
  label(str, extras = {}) {
    const r = this.row(extras.height);
    const align = extras.align || LEFT;
    push();
    noStroke();
    fill(extras.color || "#fff");
    textSize(extras.size || 14);
    textAlign(align, CENTER);
    let tx = r.x;
    if (align === CENTER) {
      tx = r.x + r.sx / 2;
    } else if (align === RIGHT) {
      tx = r.x + r.sx;
    }
    text(str, tx, r.y + r.sy / 2);
    pop();
    return r;
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

  push();
  noStroke();
  fill(swatch);
  rect(x, y, sx, sy);

  stroke(hover ? "#fff" : extras.borderColor || "rgba(0,0,0,0.4)");
  strokeWeight(hover ? 2 : extras.borderColor ? 2 : 1.5);
  noFill();
  rect(x, y, sx, sy);

  if (label) {
    noStroke();
    fill(extras.textColor || "#fff");
    textAlign(CENTER, CENTER);
    text(label, x + sx / 2, y + sy / 2);
  }
  pop();
},
  drawTooltip() {
    if (!this.pendingTooltip) {
      return;
    }
    const lines = this.pendingTooltip.lines;
    const pad = 8;
    const lineH = 18;

    push();
    textSize(13);
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
  return vab.buttonSize * 2 + tabHeight() * 2;
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
    y: vab.buttonSize * 2 + Math.floor(i / 3) * tabHeight(),
    w,
    h: tabHeight()
  }));
}

function paletteParts() {
  const parts = partAPI.list();
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
  return [
    { id: "craft-save", x: 0, y: size, size, label: "S", action: craftSave },
    { id: "craft-open", x: size, y: size, size, label: "O", action: craftPick },
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

async function loadPartTextures() {
  const wanted = new Set();
  for (const pack of loaded) {
    for (const part of pack.parts) {
      for (const group of part.groups) {
        if (group.texture) {
          wanted.add(group.texture);
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

function groupPath(points, bb, sx, sy, sw, sh, into, stretch) {
  const path = into || new Path2D();
  if (!points.length) {
    return path;
  }
  const pivot = stretch ? groupCentre(points) : null;
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
  const pivot = stretch ? groupCentre(points) : null;
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
      ctx.drawImage(
        source,
        sx + (bb.minX - bb.cx) * sw,
        sy + (bb.minY - bb.cy) * sh,
        bb.w * sw,
        bb.h * sh
      );
      if (group.fill && group.fill.toLowerCase() !== "#ffffff") {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = group.fill;
        ctx.fill(holed, "evenodd");
        ctx.globalCompositeOperation = "source-over";
      }
    } else {
      ctx.fillStyle = spec.recolor || groupFillOn(ctx, group, bb, sx, sy, sw, sh);
      ctx.fill(holed, "evenodd");
    }
    if (glow <= 0) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.27)";
      ctx.lineWidth = 1.5;
      ctx.stroke(holed);
    }
  } finally {
    // the clip must not outlive the group or everything after it vanishes
    ctx.restore();
  }
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
    part.name, spec.index, w, h,
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
    const groupFx = (fx.groups || {})[gi] || {};
    const stretch =
      groupFx.Width === undefined && groupFx.Height === undefined
        ? null
        : {
            wide: groupFx.Width === undefined ? 1 : groupFx.Width,
            tall: groupFx.Height === undefined ? 1 : groupFx.Height
          };
    const alpha = baseAlpha * (group.opacity === undefined ? 1 : group.opacity);
    const asked = groupFx.Blur === undefined
      ? (partFx.Blur === undefined ? baseBlur(part) : partFx.Blur)
      : groupFx.Blur;
    const drawn = Math.max(bb.w * sw, bb.h * sh);
    const glow = drawn < c.blurMinSize ? 0 : Math.min(asked, c.blurMax);

    const spec = { group, part, bb, sx, sy, sw, sh, cutouts, stretch, glow, alpha, index: gi, recolor: opts.recolor };
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
  const bb = partBBox(inst.part);
  const halfW = (bb.w / 2) * vab.scale;
  const halfH = (bb.h / 2) * vab.scale;
  const base = {
    top: [0, -halfH],
    bottom: [0, halfH],
    left: [-halfW, 0],
    right: [halfW, 0]
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

// a side is an edge rather than a point: a part can sit anywhere along it,
// and several can share it so long as they don't overlap. these work in the
// parent's own frame, where "along" runs the length of the edge and "out"
// points away from it
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

// the point on parent's edge that child would meet it at, if child were left
// where it is: its own point slid along the edge, kept within the ends of it,
// and pulled to the middle when it's near enough that the middle is what was
// meant
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

// every place inst could join something else: for each other part and each
// of its sides, the spot on that edge inst would land, if there's room there.
// meeting another part's top with inst's bottom puts that part under inst
// instead, so inst has to have room along its bottom for it
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
    if (pointInPolygon(lx, ly, group.points)) {
      return true;
    }
  }
  return false;
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
  const bg = textures.CoolScreen;
  if (bg) {
    const s = Math.max(width / bg.width, height / bg.height);
    image(bg, (width - bg.width * s) / 2 + mouseX / 64, (height - bg.height * s) / 2 + mouseY / 64, bg.width * s, bg.height * s);
  } else {
    background("#2b2b2b");
  }
  GUIAPI.button(
    width / 2 - 250,
    225,
    250,
    125,
    { id: "menu-build", ...menuStyle },
    "Build a Rocket"
  );
  if (prototypeCareerModeEnabled) {
    GUIAPI.button(
      width / 2,
      225,
      250,
      125,
      { id: "menu-career", ...menuStyle },
      "Career Mode"
    );
  } else {
    GUIAPI.button(
      width / 2,
      225,
      250,
      125,
      { id: "menu-disabled-career", ...menuStyleDisabled },
      "Career Mode"
    );
  }
  GUIAPI.button(
    width / 2 - 250,
    400,
    250,
    125,
    { id: "menu-credits", ...menuStyle },
    "Credits"
  );
  GUIAPI.button(
    width / 2,
    400,
    250,
    125,
    { id: "menu-modloader", ...menuStyle },
    "Modloader"
  );
  GUIAPI.button(
    width / 2 - 250,
    575,
    250,
    125,
    { id: "menu-announcements", ...menuStyle },
    anRes ? `Announcements (${anRes.data.length})` : "Announcements"
  );
  GUIAPI.button(
    width / 2,
    575,
    250,
    125,
    { id: "menu-keybinds", ...menuStyle },
    "Keybinds"
  );
}

function drawKeyBindsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
  GUIAPI.label("Keybinds", { size: 28, align: CENTER, height: 40 });

  const vabRow = GUIAPI.row(85);
  GUIAPI.button(width/2 - 175, vabRow.y, 350, 85, {
    id: "keybind-invert-vab-zoom",
    ...menuStyle
  }, `Invert VAB Zoom: ${controls.invertVabZoom ? "On" : "Off"}`);

  const flightRow = GUIAPI.row(85);
  GUIAPI.button(width/2 - 175, flightRow.y, 350, 85, {
    id: "keybind-invert-flight-zoom",
    ...menuStyle
  }, `Invert Flight Zoom: ${controls.invertFlightZoom ? "On" : "Off"}`);

  const close = GUIAPI.row(85);
  GUIAPI.button(width/2 - 175, close.y, 350, 85, {
    id: "keybinds-close",
    ...menuStyle
  }, "Close");
}

function drawCreditsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
  GUIAPI.label("Credits", { size: 28, align: CENTER, height: 40 });
  GUIAPI.label("@sorabora - Developer", { size: 28, align: CENTER, height: 80 });
  GUIAPI.label("Planet textures are modified versions of graphics by Solar System Scope (solarsystemscope.com), used under CC BY 4.0.", { size: 15, align: CENTER, height: 20 });
  GUIAPI.label("Open Sans font by Steve Matteson, used under the Apache License 2.0.", { size: 15, align: CENTER, height: 40 });

  GUIAPI.button(width/2 - 175, 380, 350, 85, {
    id: "credits-close",
    baseColor: "#1f398f",
    hoverColor: "#2a32c0",
    activeColor: "#1a1770"
  }, "Close");
}

function drawModLoaderMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
  GUIAPI.label("Modloader", { size: 28, align: CENTER, height: 40 });
  GUIAPI.label("The modloader is only for parts, and to install a mod you have to fork the repo and edit the 'loaded' variable and add a mod to the array.", { size: 18, align: CENTER, height: 60 });
  GUIAPI.label("This is all temporary and code mods and deticated modloading wil be added.", { size: 18, align: CENTER, height: 80 });
  
  for (let i = 0; i < loaded.length; i++) {
    const pack = loaded[i];
    GUIAPI.label(i === 0 ? "Base Game" : pack.name ?? "Unnamed Mod", { size: 20, height: 26 });
    GUIAPI.label(`v${pack.version}   ${pack.parts.length} parts`, { size: 14, color: "#aaa", height: 18 });
  }

  const close = GUIAPI.row(85);
  GUIAPI.button(width/2 - 175, close.y, 350, 85, {
    id: "modloader-close",
    baseColor: "#1f398f",
    hoverColor: "#2a32c0",
    activeColor: "#1a1770"
  }, "Close");
}

async function getData() {
  try {
    const response = await fetch("https://d1p5zy7ykyy2fz.cloudfront.net/api/discussions?filter[tag]=announcements&sort=-createdAt&include=firstPost");
    
    if (!response.ok) {
      console.warn(`announcements: HTTP ${response.status}`);
      return null;
    }

    const res = await response.json();
    return res;
  } catch (e) {
    console.warn("announcements won't load:", e);
    return null;
  }
}

function drawAnnouncementsMenu() {
  GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
  GUIAPI.label("Announcements", { size: 28, align: CENTER, height: 40 });

  let i = 0;
  for (const an of anRes?.data ?? []) {
    if (i <= 10) {
      GUIAPI.button(width / 2 - 250 , 225 + i * 60, 500, 50, {
        id: "announcement-" + an.id,
        data: {
          t: an.id,
          slug: an.attributes.slug,
          createdAt: an.attributes.createdAt,
          type: "an"
        },
        baseColor: "#1f4f8f",
        hoverColor: "#2a6ac0",
        activeColor: "#173d70"
      }, an.attributes.title);
      i++;
    }
  };
  GUIAPI.button(width / 2 - 250 , 225 + i * 60, 500, 50, {
    id: "announcements-close",
    baseColor: "#1f398f",
    hoverColor: "#2a32c0",
    activeColor: "#1a1770"
  }, "Close");
}

function drawMissions() {
  background("#111111")
  fill("#205fff");
  textSize(80);
  text("Missions", width / 2, 80);
  
  const mission1 = GUIAPI.row(50);
  GUIAPI.button(width/2 - 175, mission1.y, 350, 85, {
    id: "mission-1",
    ...menuStyle
  }, "Little Bob - Atmospheric");
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
  drawTransfer(ship, mapX, mapY);

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

  for (const rocket of rockets) {
    const x = mapX(rocket.pos);
    const y = mapY(rocket.pos);
    noStroke();
    fill(rocket.id === target ? "#5ccfff" : "#8888aa");
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
  if (mapPan.x || mapPan.y) {
    GUIAPI.button(mb.x, mb.y + mb.size + 10, mb.size, mb.size, {
      id: "map-recenter",
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: ["Back to the ship"]
    }, "◎");
    GUIAPI.drawTooltip();
  }
  cursor(mouseIsPressed ? "grabbing" : "grab");
}

function transferPlan(ship, dest) {
  if (!ship || !dest) {
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

function drawVab() {
  background("#2b2b2b");
  cursor(vab.drag ? "grabbing" : "default");

  const panelW = panelWidth();
  const dragSet = vab.drag ? new Set(subtree(vab.drag.inst)) : new Set();
  const midX = craftCentre(dragSet);
  stroke(vab.snap && vab.snap.mode === "centre" ? "#55ccff66" : "#ffffff12");
  strokeWeight(2);
  line(midX, 0, midX, height);
  for (const inst of vab.parts) {
    if (!dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, { rot: inst.rot });
    }
  }
  for (const inst of vab.parts) {
    if (dragSet.has(inst)) {
      drawPart(inst.part, inst.x, inst.y, vab.scale, { alpha: 0.9, rot: inst.rot });
    }
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
    GUIAPI.button(cb.x, cb.y, cb.size, cb.size, {
      id: cb.id,
      baseColor: "#4a4a5a",
      hoverColor: "#5b5b6e",
      tooltip: cb.label === "S"
        ? ["Save craft", vab.parts.length ? "  as craft.json" : "  nothing in the bay"]
        : ["Open craft", "  replaces what's in the bay"]
    }, cb.label);
  }
  textSize(14);
  GUIAPI.button(vab.buttonSize * 2, vab.buttonSize, vab.buttonSize * 2, vab.buttonSize, {
    id: "example-rockets",
    baseColor: "#4a4a5a",
    hoverColor: "#5b5b6e"
  }, "Example Rockets");
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
    total += m["Resource Module"].Amount * (cost.resource[m["Resource Module"].Resource] ?? 50);
  }
  if (m["Controller Module"]) total += m["Controller Module"].Torque * cost.torque;
  if (m["Parachute Module"]) total += m["Parachute Module"].Drag * cost.drag;
  if (m["Decoupler Module"]) total += m["Decoupler Module"]["Separation Force"] * cost.separation;
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

function stackFuel() {
  const tanks = {};
  for (const inst of vab.parts) {
    const resource = (inst.part.modules || {})["Resource Module"];
    if (resource) {
      const name = resource.Resource || defaultResource;
      tanks[name] = (tanks[name] || 0) + (resource.Amount || 0);
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
      const resource = engine.Resource || defaultResource;
      for (const tank of feedTanks(stack, i, resource)) {
        feed.add(tank);
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
      rot: inst.rot || 0
    }))
  };
}

function craftSave() {
  if (!vab.parts.length) {
    return;
  }
  const snap = stackSnapshot();
  const craft = {
    format: "xopernicus-craft",
    version: 1,
    parts: vab.parts.map((inst, i) => ({
      name: inst.part.name,
      x: snap.parts[i].ox,
      y: snap.parts[i].oy,
      rot: inst.rot || 0,
      attachedTo: inst.attachedTo ? vab.parts.indexOf(inst.attachedTo) : null,
      parentNode: inst.parentNode || null
    }))
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(craft, null, 2)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "craft.json";
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
      attachedTo: null
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

// the whole game state, downloaded as a json file the same way craftSave works.
// parts are shared objects, so they go out as names and come back by lookup,
// and fx/anim state is left out because runAnimations rebuilds it next frame
function gameSave() {
  const save = {
    format: "xopernicus-save",
    version: 1,
    t, balance, careerMode, target, camera, rockets
  };
  const text = JSON.stringify(save, (key, value) => {
    if (key === "fx") {
      return undefined;
    }
    return key === "part" ? value.name : value;
  }, 2);
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "save.json";
  link.click();
  URL.revokeObjectURL(url);
  launchToast("Game saved.");
}

function gameLoad(text) {
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
  if (save.format !== "xopernicus-save" || !Array.isArray(save.rockets)) {
    launchToast("Not a save file.");
    return;
  }
  t = save.t;
  balance = save.balance;
  careerMode = save.careerMode;
  target = save.target;
  camera = save.camera;
  rockets = save.rockets;
  threadQueues = [];   // the old threads point at rockets that are gone
  updateBodies();
  launchToast("Game loaded.");
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
  if (careerMode && balance < stackCost()) {
    launchToast("Not enough funds to launch the rocket.");
    return;
  }

  if (!vab.parts.length) {
    return;
  }
  balance -= stackCost();
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
    stack
  };
  rockets.push(rocket);
  splitRocket(rocket, () => false, 0);
  target = rocket.id;
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
  CoolScreen: "assets/CoolScreen.avif"
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
let credits = "p5.js | textures by Solar System Scope";

if (developerMode) {
  credits = "p5.js | textures by Solar System Scope | DEVELOPER BUILD"
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

function drawBootScreen(progress) {
  const barW = min(width * 0.4, 420);
  const barH = 10;
  const x = (width - barW) / 2;
  const y = height / 2;
  background(0);
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
}

async function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  GUIAPI.onButton = buttonOnClick;
  skyTip = color("#000000");
  skySurface = color("#3a7bd5");
  hazeColor = color(c.hazeColor);

  const bootNames = Object.keys(bootTextures);
  const bootSteps = bootNames.length + 1;
  let bootDone = 0;
  let loaded = false;

  gameFont = await loadFont('assets/Font.ttf'); // open sans
  textFont(gameFont);

  const loadAll = (async () => {
    for (const name of bootNames) {
      textures[name] = await loadImage(bootTextures[name]);
      bootDone++;
    }
    await loadPartTextures();
    bootDone++;
  })().finally(() => (loaded = true));

  await runSplash();
  while (!loaded) {
    drawBootScreen(bootDone / bootSteps);
    await nextFrame();
  }
  await loadAll;
  drawBootScreen(1);
  booting = false;

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

  anRes = await getData();
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
    const mean = (body.orbitPhase || 0) + TWO_PI * (t / body.orbitPeriod);
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

const STEFAN_BOLTZMANN = 5.670374e-8;

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
  const equilibriumTemp = Math.pow(((1 - albedo) * flux) / (4 * STEFAN_BOLTZMANN), 0.25);

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

function updateRocketTemp(rocket, dt) {
  const body = getBody(rocket.parentBody);
  const ambient = ambientTemperature(rocket);
  if (rocket.temp === undefined) {
    rocket.temp = ambient;
  }

  let flux = 0;
  const alt = Math.max(distanceTo(rocket, body) - body.size - rocketRadius(rocket), 0);
  if (body.atmosphereHeight && alt < body.atmosphereHeight) {
    const vel = relativeVelocity(rocket, body);
    const speed = Math.hypot(vel.x, vel.y);
    const excess = Math.max(speed - c.reentryMinSpeed, 0);
    flux = 0.5 * densityAt(body, alt) * excess * excess * excess;
  }

  const targetTemp = Math.pow(
    Math.pow(ambient, 4) + (flux * c.reentryHeatFactor) / STEFAN_BOLTZMANN,
    0.25
  );
  const blend = 1 - Math.exp(-c.reentryCoolRate * dt);
  rocket.temp = Math.max(ambient, rocket.temp + (targetTemp - rocket.temp) * blend);
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
    const name = tank.Resource || defaultResource;
    const held = (tank.Amount || 0) * c.kgPerTon * trim;
    entry.tanks = { [name]: held };
    entry.tanksMax = { [name]: held };
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
    const resource = engine.Resource || defaultResource;
    const feed = feedTanks(rocket.stack, i, resource);
    const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
    if (!feed.length || (direction > 0 && feedHeld(feed, resource) <= 0)) {
      continue;
    }
    const thrust = (engine.Thrust || 0) * c.newtonsPerThrust * level;
    out.thrust += thrust;
    const ra = (entry.rot || 0) * HALF_PI;
    const fx = thrust * Math.sin(ra);
    const fy = -thrust * Math.cos(ra);
    out.vx += fx;
    out.vy += fy;
    out.torque += (entry.ox / c.partUnits) * fy - (entry.oy / c.partUnits) * fx;
    const isp = engine.ISP || 0;
    if (isp > 0) {
      out.draws.push({ feed, resource, rate: (thrust / (isp * G0)) * direction });
    }
  }
  return out;
}

function thrustAccel(rocket) {
  const out = engineOutput(rocket);
  if (out.thrust === 0) {
    return { x: 0, y: 0 };
  }
  const cos = Math.cos(rocket.angle);
  const sin = Math.sin(rocket.angle);
  return {
    x: (out.vx * cos - out.vy * sin) / rocket.mass,
    y: (out.vx * sin + out.vy * cos) / rocket.mass
  };
}

function burnFuel(rocket, h) {
  if (!rocket.stack || !rocket.tanks) {
    return;
  }
  for (const draw of engineOutput(rocket).draws) {
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
    lines: action ? [entry.part.name, action] : [entry.part.name],
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
      const name = tank.Resource || defaultResource;
      cap[name] = (cap[name] || 0) + (tank.Amount || 0) * c.kgPerTon;
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

function splitRocket(rocket, cut, impulse) {
  const groups = connectedGroups(rocket.stack.parts, cut);
  if (groups.length < 2) {
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
    return;
  }
  const floor = (contact ? contact.top : body.size) + rocketRadius(rocket);
  if (contact && contact.mode === "side") {
    const hit = relativeVelocity(rocket, body);
    if (Math.hypot(hit.x, hit.y) >= c.crashSpeed) {
      cd.speed = Math.hypot(hit.x, hit.y);
      cd.body = body.id;
      cd.time = t;
      rocket.destroyed = true;
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
    cd.body = body.id;
    cd.time = t;
    rocket.destroyed = true;
    return;
  }
  rocket.pos.x = body.pos.x + (dx / r) * floor;
  rocket.pos.y = body.pos.y + (dy / r) * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  rocket.landed = { x: dx / r, y: dy / r };
}

function restOnSurface(rocket, h) {
  const body = getBody(rocket.parentBody);
  const floor = surfaceRadiusAt(body, rocket.landed.x, rocket.landed.y) + rocketRadius(rocket);
  rocket.pos.x = body.pos.x + rocket.landed.x * floor;
  rocket.pos.y = body.pos.y + rocket.landed.y * floor;
  rocket.vel.x = body.vel.x;
  rocket.vel.y = body.vel.y;
  rocket.spin = 0;
  burnFuel(rocket, h);
  if (liftsOff(rocket)) {
    rocket.landed = null;
  }
}

// off the ground once the engines out-push whatever gravity is holding it down
function liftsOff(rocket) {
  const push = thrustAccel(rocket);
  const acc = totalGravity(rocket.pos.x, rocket.pos.y);
  const out = rocket.landed;
  return (push.x + acc.x) * out.x + (push.y + acc.y) * out.y > 0;
}

function spinAccel(rocket) {
  if (!rocket.stack) {
    return 0;
  }
  const out = engineOutput(rocket);
  if (!out.torque) {
    return 0;
  }
  const len = Math.max(rocket.stack.h / c.partUnits, 1);
  return out.torque / ((rocket.mass * len * len) / 12);
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
  rocket.spin = (rocket.spin || 0) + (spinAccel(rocket) * h) / 2;
  rocket.angle += rocket.spin * h;
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
  rocket.spin = (rocket.spin || 0) + (spinAccel(rocket) * h) / 2;

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
    // one radial gradient rather than a stack of stroked rings. zoomed in, each
    // ring was wider than the screen, so the old loop cost 200 full-screen
    // fills a frame per planet and that was the lag
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
    drawingContext.beginPath();
    drawingContext.arc(screenX, screenY, surfaceRadius, 0, TWO_PI);
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
    circle(screenX, screenY, surfaceRadius * 2);
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
      discTint.setAlpha(255 * hazeMax * haze);
      fill(discTint);
      circle(screenX, screenY, surfaceRadius * 2);
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
  // a loop starts again the moment its last thread runs out, carrying on from
  // where the last pass finished. re-applying the start frame here would snap
  // the value back and show as a flicker every time round
  if (anim.Loop && holder.animOn && !threadsFor(holder, "main").length) {
    playRows(holder, anim["To Animate"], "main");
  }
}

function runAnimations(dt) {
  const live = new Set();
  const flamePart = hiddenPart("_flame");
  const flameAnim = flamePart && (flamePart.modules || {})["Animate Module"];
  for (const rocket of rockets) {
    for (const entry of rocket.stack ? rocket.stack.parts : []) {
      const anim = (entry.part.modules || {})["Animate Module"];
      if (anim) {
        live.add(entry);
        driveAnimation(rocket, entry, anim, entry);
      }
      if (flameAnim && (entry.part.modules || {})["Engine Module"]) {
        if (!entry.flame) {
          entry.flame = { part: flamePart };
        }
        live.add(entry.flame);
        driveAnimation(rocket, entry.flame, flameAnim, entry);
      }
    }
  }
  threadQueues = threadQueues.filter(t => live.has(t.owner));
  updateThreads(dt);
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
  { part: "_vab", body: "Earth", angle: c.launchPadRotation, x: -40000, y: -225, solid: true },
  { part: "_launchpad", body: "Earth", angle: c.launchPadRotation, x: -3000, y: -225, solid: true },
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

function propPlacement(prop) {
  const part = hiddenPart(prop.part);
  const body = getBody(prop.body);
  if (!part || !body) {
    return null;
  }
  const bb = partBBox(part);
  const a = radians(prop.angle || 0);
  const out = { x: Math.sin(a), y: -Math.cos(a) };
  const side = (prop.x || 0) / c.partUnits;
  const lift = (prop.y || 0) / c.partUnits;
  const stand = body.size + bb.h / 2 / c.partUnits + lift;
  return {
    part,
    body,
    bb,
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
    const delta = bearing - place.bearing;
    const along = Math.atan2(Math.sin(delta), Math.cos(delta)) * body.size * c.partUnits;
    const column = Math.floor((along - profile.minX) / profile.step);
    if (column < 0 || column >= profile.heights.length || profile.heights[column] <= 0) {
      continue;
    }
    const top = place.base + profile.heights[column] / c.partUnits;
    if (bottom >= top) {
      continue;
    }
    const clear = (bottom - place.base) * c.partUnits;
    let left = column;
    let right = column;
    while (left >= 0 && profile.heights[left] > clear) {
      left--;
    }
    while (right < profile.heights.length && profile.heights[right] > clear) {
      right++;
    }
    const stepWorld = profile.step / c.partUnits;
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
    const column = Math.floor((along - profile.minX) / profile.step);
    if (column < 0 || column >= profile.heights.length) {
      continue;
    }
    const height = profile.heights[column];
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
    if (!place || place.bb.h * s < 2) {
      continue;
    }
    const screenX = width / 2 + (place.x - cur.pos.x) * scale;
    const screenY = height / 2 + (place.y - cur.pos.y) * scale;
    const reach = Math.max(place.bb.w, place.bb.h) * s;
    if (screenX < -reach || screenX > width + reach || screenY < -reach || screenY > height + reach) {
      continue;
    }
    push();
    translate(screenX, screenY);
    rotate(place.angle);
    drawPart(place.part, 0, 0, s);
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
  for (let i = 0; i < rocket.stack.parts.length; i++) {
    const entry = rocket.stack.parts[i];
    drawPart(entry.part, entry.ox * s, entry.oy * s, s, { fx: entry.fx, rot: entry.rot });
    const engine = entry.part.modules["Engine Module"];
    let hasFuel = false;
    if (engine) {
      const resource = engine.Resource || defaultResource;
      const feed = feedTanks(rocket.stack, i, resource);
      const direction = engine["Fuel Flow"] === "Negative" ? -1 : 1;
      hasFuel = feed.length > 0 && (direction < 0 || feedHeld(feed, resource) > 0);
    }
    if (engine && hasFuel && entry.on && throttle > 0) {
      const flamePart = hiddenPart("_flame");
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
  pop();
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

function calculateRocketTemp() {
  const rocket = rockets.find(rocket => rocket.id === target);
  return format("temperature", rocket.temp ?? ambientTemperature(rocket));
}

function draw() {
  background("#000000");

  GUIAPI.beginFrame();

  flightControls();

  runAnimations(1 / frameRate());

  const dt = (1 / frameRate()) * c.timewarp;

  const substeps = constrain(ceil(dt / c.maxStep), 1, c.maxSubsteps);
  const h = dt / substeps;
  updateBodies();
  for (let step = 0; step < substeps; step++) {
    for (const rocket of rockets) {
      if (rocket.destroyed || rocket.landed) {
        continue;
      }
      kickDrift(rocket, h);
    }
    t += h;
    updateBodies();
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
  rockets = rockets.filter(rocket => !rocket.destroyed);

  for (const rocket of rockets) {
    updateRocketTemp(rocket, dt);
  }

  const curRocket = rockets.find(rocket => rocket.id === target);
  updateCamera(curRocket);

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
    text(`Reference: ${curRocket.parentBody}`, 25, 50)
    text(`Velocity: ${calculateVelocity()}`, 25, 50 + lineHeight)
    text(`Altitude: ${calculateAltitude()}`, 25, 50 + lineHeight * 2)
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
    if (inAnnouncementsMenu) {
      drawAnnouncementsMenu();
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
    GUIAPI.button(vb.x - 75, vb.y, vb.size, vb.size, { id: "map", ...menuStyle }, "Map");
    GUIAPI.button(vb.x - 150, vb.y, vb.size, vb.size, { id: "save", ...menuStyle }, "Save");
    GUIAPI.button(vb.x - 225, vb.y, vb.size, vb.size, { id: "load", ...menuStyle }, "Load");
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

  if (!curRocket && !inVab) {
    skillIssue = GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
    GUIAPI.label("Catastrophic Failure!", { size: 28, align: CENTER, height: 40 });
    GUIAPI.label(`Hit ${cd.body} at ${Math.round(cd.speed)} m/s, over the ${c.crashSpeed} m/s the airframe takes`);
    GUIAPI.label(`Time of loss: ${Math.round(cd.time * 100) / 100}s`);
  } else {
    skillIssue = null;
  }

  runHook("draw:main", { rocket: curRocket, camera });
  textSize(12);
  fill("white");
  text("v1.4.7 [Public Beta]", width - 120, height - 40);

  if (careerMode) {
    drawCostBox();
    drawBalanceBox();
    textSize(18);
    GUIAPI.button(width/2 - 87.5, 50, 175, 40, {
      id: "career-missions",
      ...menuStyle
    }, "Missions");
      GUIAPI.button(width/2 + 87.5, 50, 175, 40, {
      id: "career-tech",
      ...menuStyle
    }, "Tech Tree");
  }

  if (consoleOpen) {
    drawDevConsole();
  }

  for (const toast of toasts) {
    if (toast.hide <= t) {
      return;
    }

    fill("#ccc")
    rect(width/2 - 125, height/2 - 37.5, 250, 75);
    fill("Black");
    text(toast.message, width/2 - 120, height/2 + 5)
  }

  if (exampleRocketsOpen) {
    GUIAPI.panel(width / 1.5, height / 1.5, { dim: true, borderColor: "#555" });
    GUIAPI.label("Example Rockets", { size: 28, align: CENTER, height: 40 });

    textSize(25);
    const bob = GUIAPI.row(85);
    GUIAPI.button(width/2 - 175, bob.y, 350, 85, {
      id: "example-little-bob",
      ...menuStyle
    }, "Little Bob - Atmospheric");

    const bertha = GUIAPI.row(85);
    GUIAPI.button(width/2 - 175, bertha.y, 350, 85, {
      id: "example-big-bertha",
      ...menuStyle
    }, "Big Bertha - Suborbital");

    const unknown = GUIAPI.row(85);
    GUIAPI.button(width/2 - 175, unknown.y, 350, 85, {
      id: "example-unknown-527",
      ...menuStyle
    }, "Unknown_527's Rocket - Orbital");

    const close = GUIAPI.row(85);
    GUIAPI.button(width/2 - 175, close.y, 350, 85, {
      id: "example-close",
      ...menuStyle
    }, "Close");
  }

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
  pad: 12,
  titleHeight: 28,
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

function consoleRows() {
  const box = consoleBox();
  const room = box.sy - consoleTheme.pad * 2 - consoleTheme.titleHeight - consoleTheme.inputHeight - consoleTheme.gap;
  return Math.max(1, Math.floor(room / consoleTheme.lineHeight));
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
  devConsole.scroll = 0;
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
    case "js":
      commandJs(param.slice(1).join(" "));
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
  const { pad, titleHeight, lineHeight, inputHeight } = consoleTheme;
  const order = GUIAPI.order++;
  GUIAPI.block(box.x, box.y, box.sx, box.sy, order);

  push();
  noStroke();
  fill("#2a2a2aee");
  stroke("#555");
  strokeWeight(1);
  rect(box.x, box.y, box.sx, box.sy, 6);

  noStroke();
  fill("#fff");
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Console", box.x + pad, box.y + pad + titleHeight / 2);

  textAlign(RIGHT, CENTER);
  textSize(12);
  fill("#999");
  text("ctrl+4 to hide", box.x + box.sx - pad, box.y + pad + titleHeight / 2);

  const rows = consoleRows();
  const start = Math.max(0, devConsole.lines.length - rows - devConsole.scroll);
  const shown = devConsole.lines.slice(start, start + rows);
  const logY = box.y + pad + titleHeight;

  textAlign(LEFT, CENTER);
  textSize(13);
  fill("#ddd");
  for (let i = 0; i < shown.length; i++) {
    text(shown[i], box.x + pad, logY + i * lineHeight + lineHeight / 2);
  }

  const field = {
    x: box.x + pad,
    y: box.y + box.sy - pad - inputHeight,
    sx: box.sx - pad * 2,
    sy: inputHeight
  };
  fill("#1e1e1e");
  stroke(devConsole.focused ? "#2a6ac0" : "#555");
  strokeWeight(1);
  rect(field.x, field.y, field.sx, field.sy, 4);

  noStroke();
  textSize(13);
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
  const step = 1 / frameRate();
  const touched = touchHeldCodes();
  const down = code => held.has(code) || touched.has(code);

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

  let torque = 0;
  for (const entry of rocket.stack.parts) {
    const controller = (entry.part.modules || {})["Controller Module"];
    if (controller) {
      torque += controller.Torque || 0;
    }
  }
  if (torque === 0) {
    return;
  }
  const rate = (torque * c.turnPower) / (rocket.mass / c.kgPerTon);
  rocket.spin = (rocket.spin || 0) - constrain(rocket.spin || 0, -rate * step, rate * step);
  if (down("KeyQ") || down("ArrowLeft")) {
    rocket.angle -= rate * step * c.timewarp;
  }
  if (down("KeyE") || down("ArrowRight")) {
    rocket.angle += rate * step * c.timewarp;
  }
}

function buttonOnClick(button) {
  const id = button.id;
  const data = button.data;
  const label = button.label;
  const x = button.x;
  const y = button.y;
  const sx = button.sx;
  const sy = button.sy;

  if (data && data.type) {
    if (data.type === "an") {
      console.log(data.slug)
      open("https://d1p5zy7ykyy2fz.cloudfront.net/blog/" + data.slug)
    }
  }
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

  if (inVab) {
    if (careerMode) {
      if (GUIAPI.clicked("career-missions")) {
        careerMissionsOpen = true;
        inMainMenu = false;
      }
    }
    if (GUIAPI.clicked("example-rockets")) {
      exampleRocketsOpen = !exampleRocketsOpen;
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
  }
  if (inMap && !inVab) {
    if (GUIAPI.clicked("map-fly")) {
      inMap = false;
    } else if (GUIAPI.clicked("map-recenter")) {
      mapPan.x = 0;
      mapPan.y = 0;
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
    if (GUIAPI.clicked("announcements-close")) {
      inAnnouncementsMenu = false;
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
      inMainMenu = false;
      inVab = true;
      return;
    }
    if (GUIAPI.clicked("menu-career")) {
      inMainMenu = false;
      inVab = true;
      careerMode = true;
      balance = u.careerMode.modules["Career Module"]["Starting Cash"] * u.careerMode.modules["Career Module"]["Base multi"];
      // what the fuck?
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
    if (GUIAPI.clicked("menu-announcements")) {
      inAnnouncementsMenu = true;
      return;
    }
    if (GUIAPI.clicked("menu-keybinds")) {
      inKeyBindsMenu = true;
      return;
    }
    return;
  }
  if (!inVab) {
    if (GUIAPI.clicked("save")) {
      gameSave();
      return;
    }
    if (GUIAPI.clicked("load")) {
      gamePick();
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
      inMap = true;
      return;
    }

    const rocket = rockets.find(rocket => rocket.id === target);
    const entry = flightPartAt(rocket, mouseX, mouseY);
    const modules = entry ? (entry.part.modules || {}) : {};
    if (modules["Decoupler Module"]) {
      decouple(rocket, entry);
    } else if (modules["Parachute Module"]) {
      deployChute(rocket, entry);
    } else if (modules["Engine Module"]) {
      entry.on = !entry.on;
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
  const hit = partAt(mouseX, mouseY);
  if (hit) {
    detach(hit);
    vab.drag = { inst: hit, dx: mouseX - hit.x, dy: mouseY - hit.y, fromPalette: false };
  } else {
    vab.panning = true;
  }
}

function mouseDragged() {
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
  if (inMap && !inVab && mapClick) {
    if (Math.hypot(mouseX - mapClick.x, mouseY - mapClick.y) < 4) {
      const ship = flyingRocket();
      const anchor = ship ? ship.pos : camera.pos;
      const cx = anchor.x + mapPan.x;
      const cy = anchor.y + mapPan.y;
      const hit = planets.find(body => {
        const x = width / 2 + (body.pos.x - cx) * mapScale;
        const y = height / 2 + (body.pos.y - cy) * mapScale;
        return Math.hypot(mouseX - x, mouseY - y) <= Math.max(body.size * mapScale, 4) + 6;
      });
      transferTarget = hit && transferPlan(ship, hit) ? hit.id : null;
    }
    mapClick = null;
    return;
  }
  vab.panning = false;
  if (!inVab || !vab.drag) {
    return;
  }
  const inst = vab.drag.inst;
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
  if (consoleOpen) {
    const box = consoleBox();
    if (GUIAPI.contains(box.x, box.y, box.sx, box.sy)) {
      const top = Math.max(0, devConsole.lines.length - consoleRows());
      devConsole.scroll = constrain(devConsole.scroll + (event.delta > 0 ? -1 : 1), 0, top);
      return false;
    }
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
