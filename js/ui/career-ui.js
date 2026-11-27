function careerClick() {
  const wasOpen =
    careerMissionsOpen || techTreeOpen || milestonesOpen || loansOpen;
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
    career.offers = generateMissions(offerCount);
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
  return (
    wasOpen || careerMissionsOpen || techTreeOpen || milestonesOpen || loansOpen
  );
}

function drawMissions() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  textSize(18);
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "missions" },
    undefined,
    (ui) => {
      ui.label("Missions", { size: 28, align: CENTER, height: 40 });
      ui.label(
        `Completed ${career.completed.length}   Science ${career.science}`,
        { align: CENTER },
      );
      if (career.active) {
        const status = career.active.rocketId
          ? "Goal reached, land back on Earth"
          : career.active.title;
        ui.label(`Active: ${status}`, { color: "#ffd479", align: CENTER });
        ui.button(
          0,
          0,
          350,
          50,
          { id: "mission-abandon", ...menuStyle },
          "Abandon",
        );
      }
      if (!inVab) {
        ui.label("Return to the VAB to accept a contract", {
          color: "#ff9d00",
          align: CENTER,
        });
      }
      career.offers.forEach((offer, i) => {
        ui.button(
          0,
          0,
          550,
          60,
          {
            id: "mission-accept-" + i,
            ...(inVab ? menuStyle : menuStyleDisabled),
          },
          offer.title,
        );
        const home = offer.crewed ? "   crewed, land back on Earth" : "";
        ui.label(`${unit}${fundsPay(offer).toLocaleString("en-US")}${home}`, {
          size: 13,
          color: "#aaa",
          align: CENTER,
        });
      });
      ui.button(0, 0, 350, 60, { id: "missions-close", ...menuStyle }, "Close");
    },
  );
}

function drawLoans() {
  const unit = u.careerMode.modules["Career Module"].Unit;
  textSize(18);
  GUIAPI.panel(
    width / 1.5,
    height / 1.5,
    { dim: true, borderColor: "#555", id: "loans" },
    undefined,
    (ui) => {
      ui.label("Loans", { size: 28, align: CENTER, height: 40 });
      ui.label(
        `Balance ${unit}${Math.round(balance).toLocaleString("en-US")}`,
        {
          align: CENTER,
          color: balance < 0 ? "#ff6b6b" : "#8be08b",
        },
      );
      for (const key in loanTypes) {
        const type = loanTypes[key];
        const loan = career.loans[key];
        const unlocked = loanUnlocked(key);
        ui.label(`${type.bank}`, { align: CENTER, size: 20 });
        if (!unlocked) {
          ui.label("Locked, keep progressing your career to qualify", {
            align: CENTER,
            color: "#777",
          });
        } else if (loan.taken) {
          const launchesLeft = Math.max(0, loan.dueAtLaunch - career.launches);
          ui.label(
            `Owe ${unit}${loan.owed.toLocaleString("en-US")}, due in ${launchesLeft} launch${launchesLeft === 1 ? "" : "es"}`,
            {
              align: CENTER,
              color: "#ffd479",
            },
          );
          ui.button(
            0,
            0,
            350,
            50,
            {
              id: "loan-pay-" + key,
              ...(balance >= loan.owed ? menuStyle : menuStyleDisabled),
            },
            "Pay Now",
          );
        } else {
          ui.label(
            `Borrow ${unit}${type.amount.toLocaleString("en-US")}, repay ${unit}${Math.round(type.amount * type.repay).toLocaleString("en-US")} within ${type.termLaunches} launches`,
            {
              align: CENTER,
              color: "#aaa",
            },
          );
          ui.button(
            0,
            0,
            350,
            50,
            { id: "loan-take-" + key, ...menuStyle },
            "Take Loan",
          );
        }
      }
      ui.button(0, 0, 350, 60, { id: "loans-close", ...menuStyle }, "Close");
    },
  );
}
