const avatar = document.getElementById('avatar');
const idleTopVideo = document.getElementById('idleTopVideo');
const idleBottomVideo = document.getElementById('idleBottomVideo');
const scrollWrap = document.querySelector('.scroll-wrap');
const menuOverlay = document.querySelector('.menu-overlay');
const heroOverlay = document.querySelector('.hero-overlay');
const debug = document.getElementById('debug');

// ---- 序列圖設定 ----
const startFrame = 18;
const endFrame = 222;

const baseName = '4974438-uhd_4096_2160_25fps';

// ---- 模式門檻 ----
const topThreshold = 0.05;
const bottomThreshold = 0.95;

let currentMode = 'top';

// --------------
function padNumber(num, size) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

// ---- 捲動進度（0~1）----
function getScrollProgress() {
  const rect = scrollWrap.getBoundingClientRect();
  const scrollHeight = scrollWrap.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;

  if (scrollHeight <= 0) return 0;
  let progress = scrolled / scrollHeight;

  return Math.min(1, Math.max(0, progress));
}

// ---- 更新序列圖 ----
function updateFrame(progress) {
  let frameIndex = Math.round(startFrame + (endFrame - startFrame) * progress);

  frameIndex = Math.max(startFrame, Math.min(endFrame, frameIndex));

  const frameName = padNumber(frameIndex, 4);
  avatar.src = `img_A_sequence/${baseName}${frameName}.jpg`;

  if (debug) {
    debug.textContent =
      `mode: ${currentMode} | progress: ${progress.toFixed(2)} | frame: ${frameIndex}`;
  }
}

// ---- 顯示/隱藏 helper ----
function show(el) {
  if (el) el.style.display = 'block';
}

function hide(el) {
  if (el) el.style.display = 'none';
}

// ---- 模式切換（不再控制 h1 opacity）----
function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  if (mode === 'top') {
    show(idleTopVideo);
    idleTopVideo.play().catch(() => {});

    hide(avatar);
    hide(idleBottomVideo);

    show(heroOverlay);
    hide(menuOverlay);
  }

  else if (mode === 'scroll') {
    show(avatar);

    hide(idleTopVideo);
    hide(idleBottomVideo);

    show(heroOverlay);
    hide(menuOverlay);
  }

  else if (mode === 'bottom') {
    show(idleBottomVideo);
    idleBottomVideo.play().catch(() => {});

    hide(avatar);
    hide(idleTopVideo);

    show(heroOverlay);
    show(menuOverlay);
  }
}

// ---- h1 scroll 漸層淡出邏輯（唯一控制 opacity 的地方）----
function updateH1Opacity(progress) {
  const h1 = heroOverlay.querySelector("h1");

  const fadeStart = 0.5;   // 從 50% 開始淡入
  const fadeEnd   = 0.9;   // 到 90% 完全顯示

  if (progress <= fadeStart) {
    h1.style.opacity = 0;   // ⭐ 上半段：不顯示
  } 
  else if (progress >= fadeEnd) {
    h1.style.opacity = 1;   // ⭐ 底部：完全顯示
  } 
  else {
    const t = (progress - fadeStart) / (fadeEnd - fadeStart);
    h1.style.opacity = t;   // ⭐ 中段：線性淡入（0 → 1）
  }
}
// ---- 預載圖 ----
function preloadImages() {
  for (let i = startFrame; i <= endFrame; i++) {
    const img = new Image();
    img.src = `img_A_sequence/${baseName}${padNumber(i, 4)}.png`;
  }
}
preloadImages();

// ---- 捲動事件 ----
window.addEventListener('scroll', () => {
  const progress = getScrollProgress();

  updateH1Opacity(progress);

  if (progress < topThreshold) {
    setMode('top');
  } 
  else if (progress > bottomThreshold) {
    setMode('bottom');
  } 
  else {
    setMode('scroll');
    requestAnimationFrame(() => updateFrame(progress));
  }
});

// ---- 初始化 ----
avatar.src = `img_A_sequence/${baseName}${padNumber(startFrame, 4)}.png`;
setMode('top');
