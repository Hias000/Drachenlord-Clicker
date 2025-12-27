/* ===== INTRO + MUSIK ===== */

const introTexts = [
  "Der Drache muss seinen Ford Blu abbezahlen",
  "Dazu muss er 1.000.000 Pfandflaschen sammeln",
  "Du bist der Auserwählte Haider",
  "Du musst seine Pfandflaschen sammeln"
];

const introScreen = document.getElementById("introScreen");
const introText = document.getElementById("introText");
const startButton = document.getElementById("startButton");
const gameScreen = document.getElementById("gameScreen");
const prestigeSound = document.getElementById("prestigeSound");
const devToolsSound = new Audio("fx1.mp3");
devToolsSound.volume = 0.7;



let introIndex = 0;
introText.textContent = introTexts[0];

/* MUSIK */
const music = document.getElementById("music");
const tracks = [
  "epic1.mp3",
  "epic2.mp3",
  "epic3.mp3",
  "epic4.mp3",
  "epic5.mp3",
  "epic6.mp3"
];
let trackIndex = 0;
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  playTrack();
}

function playTrack() {
  music.src = tracks[trackIndex];
  music.volume = 0.5;
  music.play();
}

music.onended = () => {
  trackIndex = (trackIndex + 1) % tracks.length;
  playTrack();
};

introScreen.onclick = function () {
  console.log("INTRO CLICK");

  startMusic();

  if (introIndex < introTexts.length - 1) {
    introIndex++;
    introText.textContent = introTexts[introIndex];
  } else {
    startButton.classList.remove("hidden");
  }
};

let gameStarted = false;

startButton.addEventListener("click", (e) => {
  e.stopPropagation();

  prestigeSound.currentTime = 0;
  prestigeSound.play();

  introScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  gameStarted = true;
  loadGame();

  document.getElementById("devToolsWrapper").classList.remove("hidden");
});

/* ===== GAME ===== */

const GOAL = 1_000_000;
const MAX_PRESTIGE = 10;

let bottles = 0;
let prestige = 0;

let clickUpgrades = 0;
let helpers = 0;
let machines = 0;

let upgradeCost = 20;
let helperCost = 100;
let machineCost = 800;

const prestigeNames = [
  "Haider😡",
  "DrachenNoob☠️",
  "Drachenkrieger🗡️",
  "Drachenmeister🔥",
  "Drachenfürst⚜️",
  "Der Drache arbeitet für dich😎",
  "Uralter Drache🐉",
  "Drachenlegende🏰⚔️",
  "Drachenmythos🔮",
  "Unbesigt auf Evig⚔️",
  "Drachenlord🐉👑"
];

const prestigeBonuses = [
  { level: 1, text: "Starte mit 50 Flaschen" },
  { level: 2, text: "Auto-Klicks +25%" },
  { level: 3, text: "+1 extra Pfand" },
  { level: 4, text: "Upgrade-Kosten reduziert" },
  { level: 5, text: "Helfer & Maschinen +30% Speed" },
  { level: 6, text: "Upgrades -15%" },
  { level: 7, text: "10% Chance auf gratis Upgrade" },
  { level: 8, text: "Alle Boni leicht Erhöht" },
  { level: 9, text: "Helfer & Maschinen 2x" },
  { level: 10, text: "Alle Boni 2x" },

];

/* ELEMENTE */
const countEl = document.getElementById("count");
const perClickEl = document.getElementById("perClick");
const perSecondEl = document.getElementById("perSecond");

const trash = document.getElementById("trash");
const prestigeBtn = document.getElementById("prestigeBtn");
const prestigeOverlay = document.getElementById("prestigeOverlay");

const upgradeBtn = document.getElementById("upgradeClick");
const helperBtn = document.getElementById("buyHelper");
const machineBtn = document.getElementById("buyMachine");

const upgradeCostEl = document.getElementById("upgradeCost");
const helperCostEl = document.getElementById("helperCost");
const helperCountEl = document.getElementById("helperCount");
const machineCostEl = document.getElementById("machineCost");
const machineCountEl = document.getElementById("machineCount");
const clickCountEl = document.getElementById("clickCount");

function prestige8Boost(value, boostedValue) {
  return prestige >= 8 ? boostedValue : value;
}

function prestige10Boost(value) {
  return prestige >= 10 ? value * 2 : value;
}

// ⭐ START-PFANDFLASCHEN PRO PRESTIGE ⭐
function getPrestigeStartBottles() {
  if (prestige >= 1) {
    return prestige10Boost(
      prestige8Boost(50, 75)
    );
  }
  return 0;
}

/* BERECHNUNGEN */
function prestigeMulti() {
  return 1 + prestige * 0.25;
}

function autoClickMulti() {
  return 1 + prestige * 0.5;
}

function perClick() {
  let base = (1 + clickUpgrades) * prestigeMulti();

  // PRESTIGE 3 BONUS: +1 Pfand pro Klick (wirkt auf ALLES)
  if (prestige >= 3) {
    base += 1;
  }

  return Math.floor(base);
}

/* UI */
let lastBottleCount = 0;
let perSecond = 0;

function updateUI() {
  countEl.textContent = bottles.toLocaleString("de-DE");
  perClickEl.textContent = perClick();
  perSecondEl.textContent = Math.floor(perSecond).toLocaleString("de-DE");

  upgradeCostEl.textContent = upgradeCost;
  helperCostEl.textContent = helperCost;
  helperCountEl.textContent = helpers;
  machineCostEl.textContent = machineCost;
  machineCountEl.textContent = machines;
  clickCountEl.textContent = clickUpgrades;
// ===== UPGRADE BUTTON STATUS =====
upgradeBtn.disabled = bottles < upgradeCost;
helperBtn.disabled  = bottles < helperCost;
machineBtn.disabled = bottles < machineCost;


   // PRESTIGE BUTTON NUR BIS PRESTIGE 9 (ENDLOS AB 10)
  if (prestige < 10 && bottles >= GOAL) {
    prestigeBtn.classList.remove("hidden");
  } else {
    prestigeBtn.classList.add("hidden");
  }


  document.getElementById("dragonPrestigeLevel").textContent = `Prestige ${prestige}`;
  document.getElementById("dragonPrestigeName").textContent = prestigeNames[prestige];
  document.getElementById("dragonPrestigeBonus").textContent =
    `Auto-Bonus: ${autoClickMulti().toFixed(2)}×`;

  const bonusList = document.getElementById("bonusList");
  bonusList.innerHTML = "";

  prestigeBonuses.forEach(bonus => {
    if (prestige >= bonus.level) {
      const li = document.createElement("li");
      li.textContent = "✔ " + bonus.text;
      bonusList.appendChild(li);
    }
  });
}

/* CLICKS */
trash.onclick = () => {
  bottles += perClick();
  updateUI();
};

upgradeBtn.onclick = () => {
  let cost = upgradeCost;

  // PRESTIGE 7 BONUS: 10 % Chance auf GRATIS-Upgrade
  let isFree = false;
if (prestige >= 7 && Math.random() < prestige10Boost(prestige8Boost(0.10, 0.15))) {
    cost = 0;
    isFree = true;
  }

  // PRESTIGE 6 BONUS: −15 % Rabatt (nur wenn nicht gratis)
  if (!isFree && prestige >= 6) {
const discount = prestige8Boost(0.85, 0.75); // −15 % / −25 %
const finalDiscount = prestige >= 10 ? discount * 0.9 : discount;
cost = Math.floor(cost * finalDiscount);
}


  if (bottles >= cost) {
    bottles -= cost;
    clickUpgrades++;

    // Kosten-Skalierung (Prestige 4)
    if (prestige >= 4) {
      upgradeCost = Math.floor(upgradeCost * 1.10);
    } else {
      upgradeCost = Math.floor(upgradeCost * 1.25);
    }

    updateUI();
    saveGame();
  }
};

helperBtn.onclick = () => {
  let cost = helperCost;

  // PRESTIGE 7 BONUS: 10 % Chance auf GRATIS-Helfer
  let isFree = false;
if (prestige >= 7 && Math.random() < prestige10Boost(prestige8Boost(0.10, 0.15))) {
    cost = 0;
    isFree = true;
  }

  // PRESTIGE 6 BONUS: −15 % Rabatt
if (!isFree && prestige >= 6) {
const discount = prestige8Boost(0.85, 0.75);
const finalDiscount = prestige >= 10 ? discount * 0.9 : discount;
cost = Math.floor(cost * finalDiscount);
}

  if (bottles >= cost) {
    bottles -= cost;
    helpers++;

    if (prestige >= 4) {
      helperCost = Math.floor(helperCost * 1.15);
    } else {
      helperCost = Math.floor(helperCost * 1.3);
    }

    updateUI();
    saveGame();
  }
};

machineBtn.onclick = () => {
  let cost = machineCost;

  // PRESTIGE 7 BONUS: 10 % Chance auf GRATIS-Maschine
  let isFree = false;
if (prestige >= 7 && Math.random() < prestige10Boost(prestige8Boost(0.10, 0.15))) {
    cost = 0;
    isFree = true;
  }

  // PRESTIGE 6 BONUS: −15 % Rabatt
  if (!isFree && prestige >= 6) {
const discount = prestige8Boost(0.85, 0.75);
const finalDiscount = prestige >= 10 ? discount * 0.9 : discount;
cost = Math.floor(cost * finalDiscount);
}


  if (bottles >= cost) {
    bottles -= cost;
    machines++;

    if (prestige >= 4) {
      machineCost = Math.floor(machineCost * 1.25);
    } else {
      machineCost = Math.floor(machineCost * 1.4);
    }

    updateUI();
    saveGame();
  }
};
/* ===== AUTO PRODUKTION ===== */
setInterval(() => {
  let autoBonus = 1;

  // PRESTIGE 2 BONUS
  if (prestige >= 2) {
    autoBonus *= prestige8Boost(1.25, 1.35);
  }

  // PRESTIGE 5 BONUS
  if (prestige >= 5) {
    autoBonus *= prestige8Boost(1.3, 1.45);
  }

  // PRESTIGE 9 BONUS
  if (prestige >= 9) {
    autoBonus *= 2;
  }

  const helperClicks = helpers * 8 * autoBonus;
  const machineClicks = machines * 28 * autoBonus;

  bottles += prestige10Boost(
    (helperClicks + machineClicks) * perClick() * autoClickMulti()
  );

  updateUI();
}, 1000);


/* PRESTIGE */
prestigeBtn.onclick = () => {
  prestigeOverlay.style.display = "flex";
  prestigeSound.currentTime = 0;
  prestigeSound.play();

  // 🚫 DEV TOOLS AUS
  document.getElementById("devToolsWrapper").classList.add("hidden");

  setTimeout(() => {
    prestigeOverlay.style.display = "none";

    prestige++;
    bottles = getPrestigeStartBottles();

    clickUpgrades = 0;
    helpers = 0;
    machines = 0;

    upgradeCost = 20;
    helperCost = 100;
    machineCost = 800;

    updateUI();

    // ✅ DEV TOOLS WIEDER AN
    document.getElementById("devToolsWrapper").classList.remove("hidden");
  }, 2000);
};

setInterval(() => {
  const diff = bottles - lastBottleCount;
  perSecond = Math.max(0, diff);
  lastBottleCount = bottles;
}, 1000);

/* SAVE / LOAD */
setInterval(saveGame, 5000);

function saveGame() {
  if (!gameStarted) return;

  localStorage.setItem("drachenlord_save", JSON.stringify({
    bottles,
    prestige,
    clickUpgrades,
    helpers,
    machines,
    upgradeCost,
    helperCost,
    machineCost
  }));
}

function loadGame() {
  const raw = localStorage.getItem("drachenlord_save");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    bottles = data.bottles ?? 0;
    prestige = data.prestige ?? 0;
    clickUpgrades = data.clickUpgrades ?? 0;
    helpers = data.helpers ?? 0;
    machines = data.machines ?? 0;
    upgradeCost = data.upgradeCost ?? 20;
    helperCost = data.helperCost ?? 100;
    machineCost = data.machineCost ?? 800;
    updateUI();
  } catch {}
}

/* ===== DEV TOOLS ===== */

document.getElementById("devReset").onclick = () => {
  if (!confirm("ALLES zurücksetzen?")) return;
  localStorage.removeItem("drachenlord_save");
  bottles = prestige = clickUpgrades = helpers = machines = 0;
  upgradeCost = 20;
  helperCost = 100;
  machineCost = 800;
  updateUI();
};

document.getElementById("devCash").onclick = () => {
  bottles += 1_000_000;
  updateUI();
  saveGame();
};

const openDevToolsBtn = document.getElementById("openDevTools");
const devLogin = document.getElementById("devLogin");

openDevToolsBtn.onclick = () => {
  // 🔊 Sound abspielen
  devToolsSound.currentTime = 0;
  devToolsSound.play();

  // 👁️ Login ein-/ausblenden
  devLogin.classList.toggle("hidden");
};

const submitDevPassword = document.getElementById("submitDevPassword");
const devToolsBox = document.getElementById("devTools");
const devError = document.getElementById("devError");
const devPassword = document.getElementById("devPassword");

submitDevPassword.onclick = () => {
  if (devPassword.value === "rainer") {
    devLogin.classList.add("hidden");
    devToolsBox.classList.remove("hidden");
    openDevToolsBtn.classList.add("hidden");
    devError.classList.add("hidden");
  } else {
    devError.classList.remove("hidden");
  }
};


