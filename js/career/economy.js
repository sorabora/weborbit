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
  difficulty: "Normal",
};

const loanTypes = {
  small: {
    bank: "Pebblestone Trust",
    amount: 20000000,
    repay: 1.15,
    termLaunches: 5,
    unlocked: () => true,
  },
  medium: {
    bank: "Ironclad Credit Union",
    amount: 75000000,
    repay: 1.25,
    termLaunches: 12,
    unlocked: () => missionDone("orbit:Earth"),
  },
  big: {
    bank: "Continental Sovereign Bank",
    amount: 250000000,
    repay: 1.35,
    termLaunches: 25,
    unlocked: () => missionDone("crewOrbit:Earth"),
  },
  massive: {
    bank: "Obelisk Reserve",
    amount: 750000000,
    repay: 1.5,
    termLaunches: 50,
    unlocked: () => missionDone("crewLand"),
  },
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
  launchToast(
    `${type.bank} wired you ${Math.round(type.amount).toLocaleString("en-US")}`,
  );
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
    if (
      loan.taken &&
      loan.dueAtLaunch !== null &&
      career.launches >= loan.dueAtLaunch
    ) {
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
  const anyAvailable = Object.keys(loanTypes).some(
    (key) => loanUnlocked(key) && !career.loans[key].taken,
  );
  if (!anyAvailable) {
    bankrupt = true;
  }
}
