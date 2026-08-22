// ------------------
// DEVELOPMENT FLAGS
// "Deep into the modding"
// ------------------
// Turning off or on flags will make the game
// boot into developer mode
// - sorabora

const showPitchGuide = true; // That blue pitch indicator on the rocket
const prototypeCareerModeEnabled = true; // Enables the broken career mode
const forceMobileMode = false; // Pretends your desktop is a phone

//

let developerMode = true;
if (!showPitchGuide) {
    developerMode = true;
}
if (prototypeCareerModeEnabled) {
    developerMode = true;
}
