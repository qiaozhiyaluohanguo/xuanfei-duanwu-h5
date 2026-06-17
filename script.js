const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const idleBtn = document.getElementById("idleBtn");
const playfield = document.getElementById("playfield");
const scoreText = document.getElementById("scoreText");
const packetText = document.getElementById("packetText");
const finalScore = document.getElementById("finalScore");
const timeText = document.getElementById("timeText");
const tipCard = document.getElementById("tipCard");
const tipKind = document.getElementById("tipKind");
const tipText = document.getElementById("tipText");
const blessingText = document.getElementById("blessingText");
const resultCopy = document.getElementById("resultCopy");
const unlockCard = document.getElementById("unlockCard");
const unlockKicker = document.getElementById("unlockKicker");
const unlockTitle = document.getElementById("unlockTitle");
const unlockText = document.getElementById("unlockText");
const dots = [...document.querySelectorAll("#dots i")];

const GAME_SECONDS = 45;
const blessings = [
  { label: "药投福包", kind: "红包", copy: "收下甘肃药投的端午祝福。", score: 1, type: "packet", asset: "./assets/red-packet.svg" },
  { label: "企业名片", kind: "企业宣传", copy: "甘肃药投：立足陇药资源，服务中医药产业发展。", score: 1, type: "packet", asset: "./assets/red-packet.svg" },
  { label: "产品福包", kind: "产品宣传", copy: "宣肺止嗽合剂：产品宣传素材已解锁。", score: 1, type: "product", asset: "./assets/xuanfei-bottle.webp" },
  { label: "艾草安康", kind: "端午习俗", copy: "端午悬艾，寄托安康顺遂的节日心愿。", score: 1, type: "leaf", asset: "./assets/mugwort.svg" },
  { label: "粽香有礼", kind: "端午习俗", copy: "粽香传情，把节日问候送到屏幕前。", score: 1, type: "zongzi", asset: "./assets/zongzi.svg" },
  { label: "祝福签", kind: "互动奖励", copy: "继续收集红包，解锁完整企业祝福卡。", score: 1, type: "paper", asset: "./assets/blessing-card.svg" }
];

const milestones = [
  {
    count: 3,
    kicker: "企业名片已解锁",
    title: "甘肃药投",
    text: "核心产品：宣肺止嗽合剂、元胡止痛滴丸。",
    target: "继续收集 6 个红包"
  },
  {
    count: 6,
    kicker: "产品名片已解锁",
    title: "宣肺止嗽合剂",
    text: "端午安康场景下的产品宣传互动已完成露出。",
    target: "继续收集 9 个红包"
  },
  {
    count: 9,
    kicker: "祝福卡已生成",
    title: "端午安康",
    text: "企业形象、产品信息、节日祝福已完成闭环展示。",
    target: "祝福已集齐"
  }
];

let score = 0;
let packets = 0;
let timeLeft = GAME_SECONDS;
let spawnTimer = 0;
let clockTimer = 0;
let tipTimer = 0;
let unlockTimer = 0;
let running = false;

function showScreen(screen) {
  [startScreen, gameScreen, resultScreen].forEach(item => item.classList.remove("is-active"));
  screen.classList.add("is-active");
}

function resetGame() {
  score = 0;
  packets = 0;
  timeLeft = GAME_SECONDS;
  running = false;
  if (scoreText) scoreText.textContent = "0";
  packetText.textContent = "0";
  timeText.textContent = String(GAME_SECONDS);
  blessingText.textContent = "收集 3 个红包";
  dots.forEach(dot => dot.classList.remove("is-lit"));
  playfield.innerHTML = "";
  tipCard.classList.remove("is-visible");
  unlockCard.classList.remove("is-visible");
  clearInterval(spawnTimer);
  clearInterval(clockTimer);
  clearTimeout(tipTimer);
  clearTimeout(unlockTimer);
}

function startGame() {
  resetGame();
  running = true;
  showScreen(gameScreen);
  spawnItem();
  spawnTimer = setInterval(spawnItem, 680);
  clockTimer = setInterval(() => {
    timeLeft -= 1;
    timeText.textContent = String(timeLeft);
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  running = false;
  clearInterval(spawnTimer);
  clearInterval(clockTimer);
  clearTimeout(tipTimer);
  playfield.innerHTML = "";
  finalScore.textContent = String(packets);
  resultCopy.textContent = packets >= 9
    ? "你已集齐企业名片、产品名片和端午祝福卡。甘肃药投祝您端午安康，工作顺遂。"
    : packets >= 6
      ? "你已解锁宣肺止嗽合剂产品名片。继续收集红包，可生成完整端午祝福卡。"
      : "你已收到甘肃药投端午福包。继续参与，可解锁更多产品宣传内容。";
  showScreen(resultScreen);
}

function spawnItem() {
  if (!running) return;
  const item = blessings[Math.floor(Math.random() * blessings.length)];
  const node = document.createElement("button");
  node.type = "button";
  node.className = `falling ${item.type}`;
  node.style.left = `${8 + Math.random() * 74}%`;
  node.style.animationDuration = `${4.6 + Math.random() * 2.1}s`;
  node.style.setProperty("--drift", `${-7 + Math.random() * 14}vw`);
  node.style.setProperty("--rot-start", `${-18 + Math.random() * 36}deg`);
  node.style.setProperty("--rot-end", `${120 + Math.random() * 180}deg`);
  node.setAttribute("aria-label", `收集${item.label}`);
  node.dataset.score = String(item.score);
  node.dataset.kind = item.kind;
  node.dataset.copy = item.copy;
  node.dataset.label = item.label;

  if (item.asset) {
    const img = document.createElement("img");
    img.className = "item-art";
    img.src = item.asset;
    img.alt = "";
    node.appendChild(img);
  }
  const label = document.createElement("span");
  label.className = "item-label";
  label.textContent = item.label;
  node.appendChild(label);

  node.addEventListener("pointerdown", collectItem, { once: true });
  node.addEventListener("animationend", () => node.remove());
  playfield.appendChild(node);
}

function collectItem(event) {
  if (!running) return;
  const node = event.currentTarget;
  const add = Number(node.dataset.score || 0);
  score += add;
  packets += 1;
  if (scoreText) scoreText.textContent = String(score);
  packetText.textContent = String(packets);
  blessingText.textContent = node.dataset.label;
  node.classList.add("is-hit");
  updateMilestones();
  showTip(node.dataset.kind, node.dataset.copy);
  setTimeout(() => node.remove(), 360);
}

function updateMilestones() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-lit", packets >= milestones[index].count);
  });
  const achieved = milestones.filter(item => packets >= item.count).pop();
  const next = milestones.find(item => packets < item.count);
  blessingText.textContent = next ? `收集 ${next.count} 个红包` : "祝福已集齐";
  if (achieved && packets === achieved.count) {
    showUnlock(achieved);
  }
}

function showUnlock(item) {
  unlockKicker.textContent = item.kicker;
  unlockTitle.textContent = item.title;
  unlockText.textContent = item.text;
  unlockCard.classList.add("is-visible");
  clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => unlockCard.classList.remove("is-visible"), 3600);
}

function showTip(kind, copy) {
  tipKind.textContent = kind;
  tipText.textContent = copy;
  tipCard.classList.add("is-visible");
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => tipCard.classList.remove("is-visible"), 1800);
}

startBtn.addEventListener("click", startGame);
againBtn.addEventListener("click", startGame);
idleBtn.addEventListener("click", () => {
  resetGame();
  showScreen(startScreen);
});

let idleTimer = 0;
function armIdleReturn() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!running && !startScreen.classList.contains("is-active")) {
      resetGame();
      showScreen(startScreen);
    }
  }, 45000);
}

document.addEventListener("pointerdown", armIdleReturn);
armIdleReturn();
