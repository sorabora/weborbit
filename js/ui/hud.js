function drawBalanceBox() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  hudBox(
    `${unit}${Math.round(balance).toLocaleString("en-US")}`,
    196,
    balance < 0 ? "#ff6b6b" : "#8be08b",
  );
}

function drawTechTreeButton() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  hudBox(
    `${unit}${Math.round(balance).toLocaleString("en-US")}`,
    196,
    balance < 0 ? "#ff6b6b" : "#8be08b",
  );
}

function drawCostBox() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  let color = "#ffd479";

  if (balance < stackCost()) {
    color = "#ff1b1b";
  }

  hudBox(
    `Cost: ${unit}${Math.round(stackCost()).toLocaleString("en-US")}`,
    162,
    color,
  );
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
