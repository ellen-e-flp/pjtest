// ============================================================
//  FALLING LEAVES CATCH — game.js
// ============================================================

const ROUND_LENGTH   = 20;   // seconds
const SCORE_TARGET   = 15;   // points needed to unlock reward
const SPAWN_WEIGHTS  = [
  { type: 'leaf',    weight: 0.55, points:  1 },
  { type: 'acorn',   weight: 0.30, points:  1 },
  { type: 'pumpkin', weight: 0.15, points: -2 },
];

const C = {
  cream:      '#f7ede0',
  leafRed:    '#d9491f',
  leafRedDk:  '#a5330f',
  leafGold:   '#e8a33d',
  leafGoldDk: '#b9761f',
  acornCap:   '#5c3a21',
  acornBody:  '#c98a4b',
  acornBodyDk:'#9c6530',
  pumpkinBody:'#c9701f',
  pumpkinRot: '#57633a',
  pumpkinStem:'#3e2a17',
  boxCard:    '#c99a5b',
  boxCardDk:  '#a97c3f',
  boxRed:     '#c62828',
  shadow:     'rgba(0,0,0,0.25)',
};

function trackEvent(name, data) {
  // Lightweight analytics stub — wire to the real pipeline once the
  // analytics requirements in the brief are confirmed.
  console.log('[analytics]', name, data || {});
}

// ─── Screen management ──────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

// ─── Item drawing ────────────────────────────────────────────

function drawLeaf(ctx, x, y, r, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.9, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fill();

  const grd = ctx.createLinearGradient(0, -r, 0, r);
  grd.addColorStop(0, C.leafGold);
  grd.addColorStop(1, C.leafRed);

  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo(r * 0.9, -r * 0.3, r * 0.7, r * 0.7, 0, r);
  ctx.bezierCurveTo(-r * 0.7, r * 0.7, -r * 0.9, -r * 0.3, 0, -r);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = C.leafRedDk;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -r * 0.85);
  ctx.lineTo(0, r * 0.85);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawAcorn(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.ellipse(0, r * 0.75, r * 0.7, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fill();

  // body
  const bodyGrd = ctx.createRadialGradient(-r * 0.25, r * 0.1, r * 0.1, 0, r * 0.2, r * 0.75);
  bodyGrd.addColorStop(0, '#e0a866');
  bodyGrd.addColorStop(1, C.acornBodyDk);
  ctx.beginPath();
  ctx.ellipse(0, r * 0.25, r * 0.62, r * 0.68, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrd;
  ctx.fill();

  // cap
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.28, r * 0.72, r * 0.42, 0, Math.PI, 0);
  ctx.fillStyle = C.acornCap;
  ctx.fill();
  drawRoundRect(ctx, -r * 0.7, -r * 0.32, r * 1.4, r * 0.18, 3, C.acornCap);

  // cap texture
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.13, -r * 0.55);
    ctx.lineTo(i * r * 0.13, -r * 0.18);
    ctx.stroke();
  }

  // stem
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.55);
  ctx.lineTo(0, -r * 0.75);
  ctx.strokeStyle = C.acornCap;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawPumpkin(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.ellipse(0, r * 0.75, r * 0.85, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  const grd = ctx.createRadialGradient(-r * 0.3, -r * 0.2, r * 0.1, 0, 0, r * 0.9);
  grd.addColorStop(0, '#d98a3f');
  grd.addColorStop(1, C.pumpkinBody);

  // ribs
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(i * r * 0.32, 0, r * 0.32, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  // rot blotches — signal "avoid me"
  ctx.fillStyle = C.pumpkinRot;
  ctx.beginPath();
  ctx.ellipse(r * 0.25, r * 0.15, r * 0.22, r * 0.16, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.16, r * 0.12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, r * 0.4, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // stem
  ctx.beginPath();
  ctx.moveTo(-r * 0.08, -r * 0.65);
  ctx.quadraticCurveTo(r * 0.12, -r * 1.05, -r * 0.02, -r * 1.15);
  ctx.strokeStyle = C.pumpkinStem;
  ctx.lineWidth = r * 0.16;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
}

function drawItem(ctx, item) {
  if (item.type === 'leaf')    drawLeaf(ctx, item.x, item.y, item.r, item.rot);
  if (item.type === 'acorn')   drawAcorn(ctx, item.x, item.y, item.r);
  if (item.type === 'pumpkin') drawPumpkin(ctx, item.x, item.y, item.r);
}

// ─── Pizza box (player) ──────────────────────────────────────

function drawBox(ctx, x, y, w, h, flash) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.ellipse(0, h * 0.62, w * 0.55, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // box body
  drawRoundRect(ctx, -w / 2, -h / 2, w, h, 6, C.boxCard, C.boxCardDk);

  // lid seam
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h * 0.1);
  ctx.lineTo(w / 2, -h * 0.1);
  ctx.strokeStyle = C.boxCardDk;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // pizza logo dot
  ctx.beginPath();
  ctx.arc(0, h * 0.18, h * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = C.boxRed;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, h * 0.18, h * 0.22, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (flash > 0) {
    ctx.beginPath();
    ctx.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 8);
    ctx.strokeStyle = flash.color === 'bad'
      ? `rgba(217,73,31,${flash.a})`
      : `rgba(255,220,80,${flash.a})`;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.restore();
}

// ─── GAME STATE ──────────────────────────────────────────────

let state = null;

function newGame() {
  return {
    score:       0,
    running:     true,
    elapsed:     0,
    items:       [],
    spawnTimer:  0,
    boxX:        0,
    targetBoxX:  0,
    flash:       null,
    popups:      [],
    lastTs:      null,
  };
}

// ─── Canvas setup ─────────────────────────────────────────────

const gameCanvas = document.getElementById('gameCanvas');
let GW = 0, GH = 0;
let CTX = null;

const BOX_W = 78, BOX_H = 40;
const BOX_Y_FACTOR = 0.86;

function resizeGameCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  const dpr = window.devicePixelRatio || 1;
  GW = wrap.clientWidth;
  GH = wrap.clientHeight;
  gameCanvas.width  = GW * dpr;
  gameCanvas.height = GH * dpr;
  gameCanvas.style.width  = GW + 'px';
  gameCanvas.style.height = GH + 'px';
  CTX = gameCanvas.getContext('2d');
  CTX.scale(dpr, dpr);
}

function clampBoxX(x) {
  const margin = BOX_W / 2 + 6;
  return Math.max(margin, Math.min(GW - margin, x));
}

// ─── Difficulty curve ─────────────────────────────────────────
// Ramp spawn frequency and fall speed up over the round so the
// final seconds are noticeably harder than the opening ones.
function spawnInterval(f) { return 1.05 - f * 0.65; }   // seconds between spawns: 1.05s -> 0.40s
function fallSpeed(f)     { return 130 + f * 190; }      // px/sec base: 130 -> 320

function pickType() {
  const r = Math.random();
  let acc = 0;
  for (const w of SPAWN_WEIGHTS) {
    acc += w.weight;
    if (r <= acc) return w;
  }
  return SPAWN_WEIGHTS[0];
}

function spawnItem(f) {
  const def = pickType();
  const r = 16 + Math.random() * 6;
  const margin = r + 8;
  state.items.push({
    type: def.type,
    points: def.points,
    x: margin + Math.random() * (GW - margin * 2),
    y: -30,
    r,
    rot: Math.random() * Math.PI * 2,
    vSpin: (Math.random() - 0.5) * 2,
    speed: fallSpeed(f) * (0.85 + Math.random() * 0.3),
  });
}

// ─── RENDER ─────────────────────────────────────────────────

function render(st) {
  const ctx = CTX;
  ctx.clearRect(0, 0, GW, GH);

  const bg = ctx.createLinearGradient(0, 0, 0, GH);
  bg.addColorStop(0, '#2e1a3d');
  bg.addColorStop(1, '#6b3a1f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, GW, GH);

  for (const item of st.items) drawItem(ctx, item);

  const boxY = GH * BOX_Y_FACTOR;
  drawBox(ctx, st.boxX, boxY, BOX_W, BOX_H, st.flash);
  if (st.flash) {
    st.flash.a -= 0.06;
    if (st.flash.a <= 0) st.flash = null;
  }

  for (let i = st.popups.length - 1; i >= 0; i--) {
    const p = st.popups[i];
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.font = '700 20px -apple-system, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
    p.y -= 40 / 60;
    p.life -= 1 / 45;
    if (p.life <= 0) st.popups.splice(i, 1);
  }
}

// ─── GAME LOOP ───────────────────────────────────────────────

let rafId = null;

function updateHUD() {
  document.getElementById('score-num').textContent = state.score;
  const timeLeft = Math.max(0, ROUND_LENGTH - state.elapsed);
  document.getElementById('timer-num').textContent = Math.ceil(timeLeft) + 's';
  const pct = Math.max(0, timeLeft / ROUND_LENGTH) * 100;
  const fill = document.getElementById('timer-bar-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct < 25 ? '#d9491f' : 'var(--leaf-gold)';
}

function gameLoop(ts) {
  if (!state || !state.running) return;
  if (state.lastTs == null) state.lastTs = ts;
  const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
  state.lastTs = ts;
  state.elapsed += dt;

  if (state.elapsed >= ROUND_LENGTH) {
    endRound();
    return;
  }

  const f = Math.min(1, state.elapsed / ROUND_LENGTH);

  state.spawnTimer += dt;
  if (state.spawnTimer >= spawnInterval(f)) {
    state.spawnTimer = 0;
    spawnItem(f);
  }

  // direct-follow with light smoothing for polish
  state.boxX += (state.targetBoxX - state.boxX) * Math.min(1, dt * 18);

  const boxY = GH * BOX_Y_FACTOR;
  const catchTop = boxY - BOX_H / 2;
  const catchBot = boxY + BOX_H / 2;

  for (let i = state.items.length - 1; i >= 0; i--) {
    const item = state.items[i];
    item.y += item.speed * dt;
    item.rot += item.vSpin * dt;

    if (item.y + item.r >= catchTop && item.y - item.r <= catchBot) {
      const halfSpan = BOX_W / 2 + item.r * 0.4;
      if (Math.abs(item.x - state.boxX) <= halfSpan) {
        state.score = Math.max(0, state.score + item.points);
        state.flash = { a: 1, color: item.points < 0 ? 'bad' : 'good' };
        state.popups.push({
          x: item.x, y: item.y,
          text: (item.points > 0 ? '+' : '') + item.points,
          color: item.points < 0 ? '#ff8a65' : '#ffe082',
          life: 1,
        });
        state.items.splice(i, 1);
        updateHUD();
        continue;
      }
    }

    if (item.y - item.r > GH) {
      state.items.splice(i, 1);
    }
  }

  render(state);
  rafId = requestAnimationFrame(gameLoop);
}

function endRound() {
  state.running = false;
  if (rafId) cancelAnimationFrame(rafId);
  render(state);

  const passed = state.score >= SCORE_TARGET;
  trackEvent('round_complete', { score: state.score, passed });

  setTimeout(() => {
    if (passed) {
      trackEvent('threshold_passed', { score: state.score });
      showScreen('screen-success');
    } else {
      document.getElementById('fail-score').textContent = state.score;
      showScreen('screen-fail');
    }
  }, 250);
}

// ─── INPUT — direct-follow drag ─────────────────────────────

function pointerToBoxX(clientX) {
  const rect = gameCanvas.getBoundingClientRect();
  return clampBoxX(clientX - rect.left);
}

function onPointerMove(clientX) {
  if (!state || !state.running) return;
  state.targetBoxX = pointerToBoxX(clientX);
}

gameCanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  onPointerMove(e.touches[0].clientX);
}, { passive: false });

gameCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  onPointerMove(e.touches[0].clientX);
}, { passive: false });

let mouseDown = false;
gameCanvas.addEventListener('mousedown', e => { mouseDown = true; onPointerMove(e.clientX); });
gameCanvas.addEventListener('mousemove', e => { if (mouseDown) onPointerMove(e.clientX); });
window.addEventListener('mouseup', () => { mouseDown = false; });

// ─── START / RESTART ─────────────────────────────────────────

function startGame() {
  showScreen('screen-game');
  resizeGameCanvas();
  state = newGame();
  state.boxX = GW / 2;
  state.targetBoxX = GW / 2;
  document.getElementById('target-num').textContent = SCORE_TARGET;
  updateHUD();
  trackEvent('play_started');
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-retry').addEventListener('click', startGame);

document.getElementById('btn-success-done').addEventListener('click', () => {
  showScreen('screen-intro');
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.getElementById('btn-copy-code').addEventListener('click', () => {
  const code = document.getElementById('reward-code').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  trackEvent('reward_claimed', { method: 'copy_code' });
  showToast('Code copied');
});

document.getElementById('btn-wallet').addEventListener('click', () => {
  trackEvent('reward_claimed', { method: 'add_to_wallet' });
  showToast('Added to wallet (demo)');
});

// Resize handler
window.addEventListener('resize', () => {
  if (document.getElementById('screen-game').classList.contains('active')) {
    resizeGameCanvas();
    if (state) {
      state.boxX = clampBoxX(state.boxX);
      state.targetBoxX = clampBoxX(state.targetBoxX);
    }
  }
});

// ─── Attempt portrait lock during play ────────────────────────
async function tryLockPortrait() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('portrait');
    }
  } catch (e) { /* not supported on this device/browser — CSS overlay covers it */ }
}
document.getElementById('btn-start').addEventListener('click', tryLockPortrait);

// ─── Legend icon previews on intro screen ─────────────────────
function renderLegendIcons() {
  document.querySelectorAll('.legend-swatch').forEach(canvas => {
    const dpr = window.devicePixelRatio || 1;
    const size = 40;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const icon = canvas.dataset.icon;
    if (icon === 'leaf')    drawLeaf(ctx, size / 2, size / 2, 15, -0.4);
    if (icon === 'acorn')   drawAcorn(ctx, size / 2, size / 2 + 3, 15);
    if (icon === 'pumpkin') drawPumpkin(ctx, size / 2, size / 2 + 2, 14);
  });
}

// ─── BOOT ────────────────────────────────────────────────────
renderLegendIcons();
