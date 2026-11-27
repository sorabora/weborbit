function fatalError(message) {
  if (false) {
    document.getElementById("defaultCanvas1").remove();
    document.getElementById("fatalError").removeAttribute("hidden");
    document.getElementById("errorDetails").textContent = `${message}`;
    if (eProgress == 1) {
      document.getElementById("errorPhase").textContent =
        `Boot Phase: assetsFinished`;
    } else if (eProgress > 0) {
      document.getElementById("errorPhase").textContent =
        `Boot Phase: loadingAssets`;
    } else if (eProgress == 0) {
      document.getElementById("errorPhase").textContent = `Boot Phase: init`;
    }
  } else {
    if (critError) {
      return;
    }
    critError = true;
    crashRes = (message && message.stack) || String(message);
    try {
      drawCrashScreen();
    } catch (e) {}
  }
}

function drawCrashScreen() {
  if (!critError) {
    return;
  }
  background(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  fill("yellow");
  text("Crash", 30, 30);
  fill("white");
  text(`Version: ${gameVersion}`, 30, 70);
  text(`Booting: ${booting}  Progress: ${eProgress}`, 30, 90);
  text(`Main Menu: ${inMainMenu}  VAB: ${inVab}  Map: ${inMap}  Career: ${careerMode}`, 30, 110);
  text(`Frame: ${frameCount}  Time: ${t}`, 30, 130);
  text(`Rocket: ${rockets.find((rocket) => rocket.id === target)?.name}  Rockets: ${rockets.length}  Target: ${target}`, 30, 150);
  text(`Mods: ${Object.keys(modModules).join(", ") || "none"}`, 30, 170);
  text(`Window: ${window.innerWidth}x${window.innerHeight}`, 30, 190);
  text(crashRes, 30, 230, width - 60, height - 280);
  text("! Resizing may cause this screen to go blank !", 30, height - 30);
}

window.onerror =function (message, source, lineno, colno, error) {
  return true;
};

window.addEventListener("unhandledrejection", function (event) {
  fatalError(event.reason);
  //showFatalErrorScreen(event.reason.message || event.reason);
  event.preventDefault();
});
