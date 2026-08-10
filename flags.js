// ------------------
// DEVELOPMENT FLAGS
// "Deep into the modding"
// ------------------
// Turning off or on flags will make the game
// boot into developer mode
// - sorabora

const showPitchGuide = true; // That blue pitch indicator on the rocket
const prototypeCareerModeEnabled = false; // Enables the broken career mode

//

let developerMode = false;
if (!showPitchGuide) {
    developerMode = true;
}
if (prototypeCareerModeEnabled) {
    developerMode = true;
}
