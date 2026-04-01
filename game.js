// ============================================================
//  PIZZA TAPPER — game.js
// ============================================================

const COLS = 3;               // number of table lanes
const INGREDIENT_TYPES = ['dough', 'tomato', 'cheese'];

// Colour palette
const C = {
  greenDark:  '#2d5a27',
  greenMid:   '#3a7a32',
  cream:      '#f5f0e8',
  tableSide:  '#6b4f12',
  tableTop:   '#a07820',
  tableLight: '#c9a43a',
  tableDark:  '#7a5c10',
  dough:      '#f5e6c8',
  doughShad:  '#c9b48a',
  tomato:     '#e53935',
  tomatoShad: '#b71c1c',
  tomShine:   '#ef9a9a',
  cheese:     '#ffd54f',
  cheeseShad: '#f9a825',
  cheeseEdge: '#ffe082',
  white:      '#ffffff',
  shadow:     'rgba(0,0,0,0.25)',
};

// ─── Screen management ──────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── Canvas helpers ─────────────────────────────────────────
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

// ─── Drawing primitives ──────────────────────────────────────

function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill)  { ctx.fillStyle = fill;   ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.stroke(); }
}

// Draw a vertical table lane (3D perspective — near end is wider)
function drawTable(ctx, cx, topY, botY, topW, botW) {
  // Table surface (trapezoid)
  ctx.beginPath();
  ctx.moveTo(cx - topW/2, topY);
  ctx.lineTo(cx + topW/2, topY);
  ctx.lineTo(cx + botW/2, botY);
  ctx.lineTo(cx - botW/2, botY);
  ctx.closePath();
  ctx.fillStyle = C.tableTop;
  ctx.fill();

  // Lighter centre stripe
  const grd = ctx.createLinearGradient(cx - topW/2, 0, cx + topW/2, 0);
  grd.addColorStop(0,   'rgba(0,0,0,0.15)');
  grd.addColorStop(0.35,'rgba(255,255,255,0.18)');
  grd.addColorStop(0.65,'rgba(255,255,255,0.18)');
  grd.addColorStop(1,   'rgba(0,0,0,0.15)');
  ctx.beginPath();
  ctx.moveTo(cx - topW/2, topY);
  ctx.lineTo(cx + topW/2, topY);
  ctx.lineTo(cx + botW/2, botY);
  ctx.lineTo(cx - botW/2, botY);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();

  // Left side face
  ctx.beginPath();
  ctx.moveTo(cx - topW/2, topY);
  ctx.lineTo(cx - botW/2, botY);
  ctx.lineTo(cx - botW/2, botY + 14);
  ctx.lineTo(cx - topW/2, topY + 10);
  ctx.closePath();
  ctx.fillStyle = C.tableSide;
  ctx.fill();

  // Right side face
  ctx.beginPath();
  ctx.moveTo(cx + topW/2, topY);
  ctx.lineTo(cx + botW/2, botY);
  ctx.lineTo(cx + botW/2, botY + 14);
  ctx.lineTo(cx + topW/2, topY + 10);
  ctx.closePath();
  ctx.fillStyle = C.tableDark;
  ctx.fill();
}

// Draw dough ball
function drawDough(ctx, x, y, r) {
  // shadow
  ctx.beginPath();
  ctx.ellipse(x, y + r*0.4, r*0.9, r*0.35, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // ball
  const grd = ctx.createRadialGradient(x - r*0.25, y - r*0.25, r*0.1, x, y, r);
  grd.addColorStop(0, '#fff9f0');
  grd.addColorStop(0.5, C.dough);
  grd.addColorStop(1, C.doughShad);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = grd;
  ctx.fill();

  // flour dusting
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw tomato
function drawTomato(ctx, x, y, r) {
  // shadow
  ctx.beginPath();
  ctx.ellipse(x, y + r*0.4, r*0.9, r*0.3, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // body
  const grd = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.05, x, y, r);
  grd.addColorStop(0, '#ff6b6b');
  grd.addColorStop(0.5, C.tomato);
  grd.addColorStop(1, C.tomatoShad);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = grd;
  ctx.fill();

  // shine
  ctx.beginPath();
  ctx.ellipse(x - r*0.2, y - r*0.25, r*0.2, r*0.12, -0.5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();

  // stem
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r*0.3, y - r*1.35, x + r*0.1, y - r*1.15);
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x - r*0.3, y - r*1.3, x - r*0.1, y - r*1.1);
  ctx.strokeStyle = '#388e3c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Draw cheese block
function drawCheese(ctx, x, y, r) {
  const hw = r * 1.1;
  const hh = r * 0.75;

  // shadow
  ctx.beginPath();
  ctx.ellipse(x, y + hh*0.6, hw*0.9, hh*0.3, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // bottom face (3d)
  drawRoundRect(ctx, x - hw, y + hh*0.15, hw*2, hh*0.55, 3, C.cheeseShad);

  // top face
  drawRoundRect(ctx, x - hw, y - hh, hw*2, hh*1.2, 4, C.cheese);

  // shine
  drawRoundRect(ctx, x - hw*0.6, y - hh*0.8, hw*0.5, hh*0.3, 2, 'rgba(255,255,255,0.5)');

  // holes
  for (const [ox, oy] of [[-hw*0.3, 0], [hw*0.2, -hh*0.3]]) {
    ctx.beginPath();
    ctx.ellipse(x + ox, y + oy, r*0.12, r*0.09, 0, 0, Math.PI*2);
    ctx.fillStyle = C.cheeseShad;
    ctx.fill();
  }
}

function drawIngredient(ctx, type, x, y, r) {
  if (type === 'dough')  drawDough(ctx, x, y, r);
  if (type === 'tomato') drawTomato(ctx, x, y, r);
  if (type === 'cheese') drawCheese(ctx, x, y, r);
}

// ─── Chef drawing ────────────────────────────────────────────

function drawChef(ctx, x, y, scale, facing, hat, armRaise) {
  // facing: 1 = right, -1 = left
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);

  const bc = '#f5f0e8'; // body cream
  const sc = '#3a7a32'; // shirt / apron green
  const sk = '#ffcc80'; // skin

  // shadow under chef
  ctx.beginPath();
  ctx.ellipse(0, 32, 22, 7, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  // legs
  ctx.fillStyle = '#37474f';
  drawRoundRect(ctx, -12, 18, 10, 16, 3, '#37474f');
  drawRoundRect(ctx,   2, 18, 10, 16, 3, '#4a5568');
  // shoes
  drawRoundRect(ctx, -14, 31, 12, 6, 3, '#212121');
  drawRoundRect(ctx,   2, 31, 12, 6, 3, '#212121');

  // body / apron
  ctx.beginPath();
  ctx.roundRect(-16, -5, 32, 26, 4);
  ctx.fillStyle = sc;
  ctx.fill();
  // apron white panel
  ctx.beginPath();
  ctx.roundRect(-8, -2, 16, 22, 3);
  ctx.fillStyle = bc;
  ctx.fill();

  // arm (raised if armRaise)
  const armY = armRaise ? -14 : 5;
  ctx.beginPath();
  ctx.roundRect(14, armY, 9, armRaise ? 18 : 14, 4);
  ctx.fillStyle = sc;
  ctx.fill();
  // hand
  ctx.beginPath();
  ctx.arc(18, armY + (armRaise ? 18 : 14), 5, 0, Math.PI*2);
  ctx.fillStyle = sk;
  ctx.fill();

  // other arm
  ctx.beginPath();
  ctx.roundRect(-23, 2, 9, 14, 4);
  ctx.fillStyle = sc;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-18, 16, 5, 0, Math.PI*2);
  ctx.fillStyle = sk;
  ctx.fill();

  // neck & head
  ctx.fillStyle = sk;
  ctx.beginPath();
  ctx.roundRect(-5, -14, 10, 12, 3);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, -22, 14, 14, 0, 0, Math.PI*2);
  ctx.fillStyle = sk;
  ctx.fill();

  // face
  // eyes
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-5, -24, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -24, 2, 0, Math.PI*2);  ctx.fill();
  // smile
  ctx.beginPath();
  ctx.arc(0, -20, 6, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (hat) {
    // hat brim
    drawRoundRect(ctx, -16, -34, 32, 5, 2, bc);
    // hat body
    ctx.beginPath();
    ctx.moveTo(-12, -34);
    ctx.lineTo(-10, -60);
    ctx.lineTo(10, -60);
    ctx.lineTo(12, -34);
    ctx.closePath();
    ctx.fillStyle = bc;
    ctx.fill();
    // hat crease
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(0, -34);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

// Crate/basket of ingredients at far end
function drawIngredientCrate(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const w = 40, h = 28;
  // box
  drawRoundRect(ctx, -w/2, -h, w, h, 4, C.tableSide);
  // slats
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = C.tableLight;
    ctx.fillRect(-w/2 + 2 + i*14, -h + 2, 11, h - 4);
  }
  // ingredients peeking out
  drawTomato(ctx, -10, -h - 6, 6);
  drawDough(ctx, 8, -h - 4, 5);
  ctx.restore();
}

// ─── Intro chef canvas ───────────────────────────────────────
function renderIntroChef() {
  const canvas = document.getElementById('introChefCanvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = 180 * dpr;
  canvas.height = 220 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  // draw table snippet
  drawTable(ctx, 90, 90, 200, 60, 100);
  // ingredient on table
  drawTomato(ctx, 90, 130, 14);
  drawDough(ctx,  55, 148, 12);
  drawChef(ctx, 90, 200, 1.2, 1, true, true);
  drawIngredientCrate(ctx, 90, 100, 1);
}

// ─── Gameover chef ───────────────────────────────────────────
function renderGameoverChef() {
  const canvas = document.getElementById('gameoverChefCanvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = 120 * dpr;
  canvas.height = 150 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  drawChef(ctx, 60, 135, 1.1, 1, true, false);
}

// ─── GAME STATE ──────────────────────────────────────────────

let state = null;

function newGame() {
  return {
    score:       0,
    level:       1,
    levelTarget: 10,
    lives:       1,          // single life — miss = game over
    playerCol:   1,          // 0, 1, 2
    ingredients: [],         // { col, y, type, speed }
    spawnTimer:  0,
    spawnInterval: 110,      // frames between spawns
    speed:       1.0,        // ingredient speed multiplier
    running:     true,
    frame:       0,
    playerX:     0,          // computed each frame
    playerMoving: false,
    playerTargetCol: 1,
    playerAnimT: 0,
  };
}

// ─── Game canvas setup ───────────────────────────────────────

const gameCanvas = document.getElementById('gameCanvas');
let GW = 0, GH = 0;      // logical pixels
let CTX = null;

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

// ─── Layout helpers ──────────────────────────────────────────

// Returns { cx, topY, botY, topW, botW } for each column
function tableLayout() {
  const margin = GW * 0.06;
  const spacing = (GW - margin * 2) / COLS;
  const tables = [];
  for (let c = 0; c < COLS; c++) {
    const cx = margin + spacing * c + spacing / 2;
    tables.push({
      cx,
      topY: GH * 0.08,
      botY: GH * 0.82,
      topW: spacing * 0.38,
      botW: spacing * 0.68,
    });
  }
  return tables;
}

function colX(col, tables) {
  return tables[col].cx;
}

// Ingredient radius grows with y (perspective)
function ingredientRadius(y, table) {
  const t = (y - table.topY) / (table.botY - table.topY);
  return 10 + t * 12;
}

// ─── Collision / catch zone ──────────────────────────────────
// The player catches ingredients when they reach near botY
const CATCH_Y_FACTOR = 0.88;   // fraction of botY where catch happens
const MISS_Y_FACTOR  = 0.98;   // fraction where miss is registered

// ─── RENDER ─────────────────────────────────────────────────

function render(st) {
  const ctx = CTX;
  ctx.clearRect(0, 0, GW, GH);

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, GH);
  bg.addColorStop(0, C.greenDark);
  bg.addColorStop(1, C.greenMid);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, GW, GH);

  const tables = tableLayout();

  // Draw tables (back to front for correct layering)
  for (let c = 0; c < COLS; c++) {
    const t = tables[c];
    drawTable(ctx, t.cx, t.topY, t.botY, t.topW, t.botW);
  }

  // Far-end chef (tosser) — sits at top of middle table
  const tosserX = tables[1].cx;
  drawChef(ctx, tosserX, tables[1].topY + 8, 0.55, 1, true, true);

  // Ingredient crates flanking far chef
  drawIngredientCrate(ctx, tables[0].cx, tables[0].topY + 5, 0.55);
  drawIngredientCrate(ctx, tables[2].cx, tables[2].topY + 5, 0.55);

  // Draw ingredients
  for (const ing of st.ingredients) {
    const t = tables[ing.col];
    const r = ingredientRadius(ing.y, t);
    drawIngredient(ctx, ing.type, t.cx, ing.y, r);
  }

  // Player chef — near end, moves left/right
  const playerT  = tables[st.playerCol];
  const playerChefY = tables[1].botY + 20;

  // smooth lateral movement
  const px = st.playerX !== undefined ? st.playerX : playerT.cx;
  drawChef(ctx, px, playerChefY, 0.9, 1, true, false);

  // catch flash
  if (st.catchFlash > 0) {
    const t2 = tables[st.playerCol];
    ctx.beginPath();
    ctx.arc(t2.cx, t2.botY, 24, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,220,50,${st.catchFlash * 0.6})`;
    ctx.fill();
    st.catchFlash -= 0.08;
  }
}

// ─── GAME LOOP ───────────────────────────────────────────────

let rafId = null;
let highScore = 0;

function spawnIngredient(st) {
  const col  = Math.floor(Math.random() * COLS);
  const type = INGREDIENT_TYPES[Math.floor(Math.random() * INGREDIENT_TYPES.length)];
  const tables = tableLayout();
  st.ingredients.push({
    col,
    y: tables[col].topY + 5,
    type,
    speed: st.speed * (0.85 + Math.random() * 0.35),
  });
}

function gameLoop() {
  if (!state || !state.running) return;

  state.frame++;
  state.spawnTimer++;

  // Spawn
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnIngredient(state);
    // Sometimes spawn a second ingredient after a short delay — higher levels
    if (state.level >= 3 && Math.random() < 0.35) {
      setTimeout(() => {
        if (state && state.running) spawnIngredient(state);
      }, 300);
    }
  }

  const tables = tableLayout();

  // Smooth player X
  const targetX = tables[state.playerCol].cx;
  if (state.playerX === undefined) state.playerX = targetX;
  state.playerX += (targetX - state.playerX) * 0.25;

  // Move ingredients
  for (const ing of state.ingredients) {
    const t = tables[ing.col];
    // speed scaled by perspective (faster near bottom)
    const perspScale = 0.7 + ((ing.y - t.topY) / (t.botY - t.topY)) * 0.8;
    ing.y += ing.speed * perspScale;
  }

  // Check catches & misses
  const catchY = GH * CATCH_Y_FACTOR;
  const missY  = GH * MISS_Y_FACTOR;

  for (let i = state.ingredients.length - 1; i >= 0; i--) {
    const ing = state.ingredients[i];
    if (ing.y >= catchY) {
      if (ing.col === state.playerCol) {
        // Caught!
        state.score++;
        state.catchFlash = 1;
        state.ingredients.splice(i, 1);
        updateHUD();
        checkLevelUp();
      } else if (ing.y >= missY) {
        // Missed — game over
        state.ingredients.splice(i, 1);
        gameOver();
        return;
      }
    }
  }

  render(state);
  rafId = requestAnimationFrame(gameLoop);
}

function checkLevelUp() {
  if (state.score >= state.level * state.levelTarget) {
    state.level++;
    state.speed += 0.18;
    state.spawnInterval = Math.max(45, state.spawnInterval - 12);
    updateHUD();
  }
}

function updateHUD() {
  document.getElementById('score-num').textContent  = state.score;
  document.getElementById('target-num').textContent = state.level * state.levelTarget;
  document.getElementById('level-num').textContent  = state.level;
}

function gameOver() {
  state.running = false;
  if (rafId) cancelAnimationFrame(rafId);
  if (state.score > highScore) highScore = state.score;
  document.getElementById('final-score').textContent = state.score;
  document.getElementById('high-score').textContent  = highScore;
  renderGameoverChef();
  setTimeout(() => showScreen('screen-gameover'), 200);
}

// ─── INPUT ───────────────────────────────────────────────────

function moveLeft() {
  if (state && state.running && state.playerCol > 0) state.playerCol--;
}
function moveRight() {
  if (state && state.running && state.playerCol < COLS - 1) state.playerCol++;
}

// Touch zones
document.getElementById('zone-left').addEventListener('touchstart',  e => { e.preventDefault(); moveLeft();  }, { passive: false });
document.getElementById('zone-right').addEventListener('touchstart', e => { e.preventDefault(); moveRight(); }, { passive: false });
document.getElementById('zone-left').addEventListener('mousedown',   () => moveLeft());
document.getElementById('zone-right').addEventListener('mousedown',  () => moveRight());

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') moveLeft();
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
});

// ─── START / RESTART ─────────────────────────────────────────

function startGame() {
  showScreen('screen-game');
  resizeGameCanvas();
  state = newGame();
  state.playerX = tableLayout()[1].cx;
  state.catchFlash = 0;
  updateHUD();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

document.getElementById('btn-start').addEventListener('click',   startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

// Resize handler
window.addEventListener('resize', () => {
  if (document.getElementById('screen-game').classList.contains('active')) {
    resizeGameCanvas();
  }
});

// ─── BOOT ────────────────────────────────────────────────────
renderIntroChef();
