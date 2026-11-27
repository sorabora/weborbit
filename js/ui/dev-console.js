const consoleTheme = {
  lineHeight: 18,
  inputHeight: 30,
  gap: 6,
  maxLines: 300,
  maxHistory: 50,
};

function consoleBox() {
  const sx = Math.min(760, width - 80);
  const sy = constrain(height / 2, 220, 420);
  return {
    x: Math.round((width - sx) / 2),
    y: Math.round((height - sy) / 2),
    sx,
    sy,
  };
}

function devLog(...parts) {
  const text = parts
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      try {
        return JSON.stringify(part);
      } catch (e) {
        return String(part);
      }
    })
    .join(" ");

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
  runHook("console:command", { cmd });
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
      if (modCommands[param[0]]) {
        modCommands[param[0]](param.slice(1), cmd);
      } else {
        devLog(`Unknown command ${cmd}`);
      }
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
    devLog("Untoggled hidden parts");
  } else {
    devLog("Toggled hidden parts");
  }
  showHidden = !showHidden;
}

// tp <String: Planet> <Number: Altitude> <Number: Rotation Around Planet> <Number: Velocity>
function commandTp(param) {
  if (param.length !== 4) {
    devLog("usage: tp <planet> <altitude> <rotation> <velocity>");
    return;
  }

  const rocket = rockets.find((rocket) => rocket.id === target);
  if (!rocket) {
    devLog("no vessel to teleport");
    return;
  }

  const body = planets.find(
    (planet) => planet.id.toLowerCase() === param[0].toLowerCase(),
  );
  if (!body) {
    devLog(`no planet called ${param[0]}`);
    devLog(`  known: ${planets.map((planet) => planet.id).join(", ")}`);
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

  devLog(
    `${rocket.id} -> ${body.id}, ${format("distance", altitude)} up, ${rotation}°, ${format("speed", speed)}`,
  );
  if (rocket.parentBody !== body.id) {
    devLog(
      `  that is outside ${body.id}'s SOI, now under ${rocket.parentBody}`,
    );
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
    devConsole.historyIndex = Math.min(
      devConsole.historyIndex + 1,
      devConsole.history.length - 1,
    );
    devConsole.input = devConsole.history[devConsole.historyIndex];
    return;
  }
  if (code === "ArrowDown") {
    devConsole.historyIndex = Math.max(devConsole.historyIndex - 1, -1);
    devConsole.input =
      devConsole.historyIndex === -1
        ? ""
        : devConsole.history[devConsole.historyIndex];
    return;
  }

  if (code === "KeyV" && (event.ctrlKey || event.metaKey)) {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard
        .readText()
        .then((pasted) => {
          devConsole.input += pasted.replace(/[\r\n]+/g, " ").trim();
        })
        .catch(() => {
          devLog("clipboard blocked by the browser");
        });
    }
    return;
  }

  if (
    event.key &&
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
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

  const panel = GUIAPI.panel(
    box.sx,
    box.sy,
    {
      id: "console",
      borderColor: "#555",
      gap: 0,
      footer: inputHeight + gap,
      hint: "ctrl+4 to hide",
    },
    "Console",
    (ui) => {
      for (const line of devConsole.lines) {
        ui.label(line, { size: 13, color: "#ddd", height: lineHeight });
      }
    },
  );

  const field = {
    x: panel.footer.x,
    y: panel.footer.y + gap,
    sx: panel.footer.sx,
    sy: inputHeight,
  };

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
  console.log("debug fired!");
}
