const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const idleBtn = document.getElementById("idleBtn");
const playfield = document.getElementById("playfield");
const scoreText = document.getElementById("scoreText");
const finalScore = document.getElementById("finalScore");
const timeText = document.getElementById("timeText");
const tipCard = document.getElementById("tipCard");
const tipKind = document.getElementById("tipKind");
const tipText = document.getElementById("tipText");
const blessingText = document.getElementById("blessingText");
const resultCopy = document.getElementById("resultCopy");
const dots = [...document.querySelectorAll("#dots i")];

const GAME_SECONDS = 45;
const blessings = [
  { label: "端午安康", kind: "祝福签", copy: "粽香入夏，愿工作顺遂，身心安康。", score: 8, type: "paper", asset: "./assets/blessing-card.svg" },
  { label: "清润守护", kind: "产品提示", copy: "宣肺止嗽合剂产品宣传素材已加入本次互动展示。", score: 12, type: "product", asset: "./assets/xuanfei-product-cutout.png" },
  { label: "艾草纳福", kind: "端午习俗", copy: "端午悬艾，寄托避秽纳福、平安顺遂的节日心愿。", score: 7, type: "leaf", asset: "./assets/mugwort.svg" },
  { label: "粽香有礼", kind: "端午习俗", copy: "一枚粽子，一份心意，愿端午安康常在。", score: 7, type: "zongzi", asset: "./assets/zongzi.svg" },
  { label: "香囊寄意", kind: "节日祝福", copy: "一枚香囊，一份关怀，愿清风常伴。", score: 7, type: "sachet", asset: "./assets/sachet.svg" },
  { label: "药香传承", kind: "知识科普", copy: "中医药文化重在传承，也重在用更亲近的方式被看见。", score: 10, type: "paper", asset: "./assets/blessing-card.svg" },
  { label: "甘味好礼", kind: "产品宣传", copy: "把节日问候和产品形象结合，让广告机成为互动展示窗口。", score: 10, type: "product", asset: "./assets/xuanfei-product-cutout.png" }
];

let score = 0;
let timeLeft = GAME_SECONDS;
let spawnTimer = 0;
let clockTimer = 0;
let tipTimer = 0;
let litCount = 0;
let running = false;

function showScreen(screen) {
  [startScreen, gameScreen, resultScreen].forEach(item => item.classList.remove("is-active"));
  screen.classList.add("is-active");
}

function resetGame() {
  score = 0;
  timeLeft = GAME_SECONDS;
  litCount = 0;
  running = false;
  scoreText.textContent = "0";
  timeText.textContent = String(GAME_SECONDS);
  blessingText.textContent = "清润安康";
  dots.forEach(dot => dot.classList.remove("is-lit"));
  playfield.innerHTML = "";
  tipCard.classList.remove("is-visible");
  clearInterval(spawnTimer);
  clearInterval(clockTimer);
  clearTimeout(tipTimer);
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
  finalScore.textContent = String(score);
  resultCopy.textContent = score >= 160
    ? "祝福满屏，清润入夏。愿每一次触摸，都把产品记忆和节日心意送到眼前。"
    : "愿清风入怀，粽香常在，工作顺遂，身体安康。";
  showScreen(resultScreen);
}

function spawnItem() {
  if (!running) return;
  const item = blessings[Math.floor(Math.random() * blessings.length)];
  const node = document.createElement("button");
  node.type = "button";
  node.className = `falling ${item.type}`;
  node.style.left = `${8 + Math.random() * 74}%`;
  node.style.animationDuration = `${5.2 + Math.random() * 2.8}s`;
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
  scoreText.textContent = String(score);
  blessingText.textContent = node.dataset.label;
  node.classList.add("is-hit");
  lightProgress();
  showTip(node.dataset.kind, node.dataset.copy);
  setTimeout(() => node.remove(), 360);
}

function lightProgress() {
  litCount = Math.min(dots.length, litCount + 1);
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-lit", index < litCount);
  });
  if (litCount === dots.length) {
    litCount = 0;
    setTimeout(() => dots.forEach(dot => dot.classList.remove("is-lit")), 260);
  }
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
