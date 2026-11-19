// Deskland shares the canvas, draw function and icon rectangles with share.js.
const query = new URLSearchParams(location.search);
const WALL = query.has('wallpaper');
const preview = query.has('preview');
const cv = document.getElementById('pond');
const ctx = cv.getContext('2d', { alpha: false });
const iconLayer = document.getElementById('icons');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const defaults = { seed: 637134, adaptive: 1, sigma: 24, density: 1, fish: 5, flowers: 1 };
const ranges = { sigma: [0, 100], density: [0, 1.25], fish: [0, 10], flowers: [0, 1.25] };
const params = { ...defaults };
const tau = Math.PI * 2;
const leafColors = [
  ['#c0d785', '#7caf70', '#397368'],
  ['#a6cd86', '#5f9a73', '#327269'],
  ['#a7c992', '#74a982', '#3f7b70'],
  ['#d0dc8c', '#91b66e', '#507c5b'],
  ['#91ba72', '#5d9874', '#396b65'],
  ['#add1a0', '#66a282', '#377a71'],
];
const flowerColors = [
  ['#fff2d3', '#f2abb0', '#a34d77'],
  ['#fce0df', '#ed99ac', '#a2466e'],
  ['#fff8de', '#f0cbba', '#af7380'],
];
const koiColors = [
  ['#f1ac79', '#f2d9af', '#ce664d'],
  ['#e9d8ab', '#f7e7c2', '#b56753'],
  ['#e6bd89', '#edc18a', '#c88757'],
];

let W = 0, H = 0, icons = [], frameN = 0, paused = false;
let water, pads = [], swimmers = [];
let clock = 0, lastFrame = 0, dirty = true, receivedIcons = false;
let paintedWidth = 0, paintedHeight = 0;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let bits = Math.imul(state ^ state >>> 15, state | 1);
    bits ^= bits + Math.imul(bits ^ bits >>> 7, bits | 61);
    return ((bits ^ bits >>> 14) >>> 0) / 4294967296;
  };
}

function surface(width, height = width) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function ellipse(g, x, y, rx, ry, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, tau);
  g.fill();
}

function paintWater(rand) {
  const scale = Math.min(1, 1600 / Math.max(W, H), Math.sqrt(960000 / (W * H)));
  const canvas = surface(Math.max(1, Math.round(W * scale)), Math.max(1, Math.round(H * scale)));
  const g = canvas.getContext('2d', { alpha: false });
  g.scale(canvas.width / W, canvas.height / H);
  const base = g.createLinearGradient(0, 0, W * 0.84, H);
  base.addColorStop(0, '#397776');
  base.addColorStop(0.53, '#265b61');
  base.addColorStop(1, '#183f4a');
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  const side = Math.min(W, H);
  for (let i = 0; i < 28; i++) {
    const x = rand() * W, y = rand() * H, radius = (0.09 + rand() * 0.29) * side;
    const wash = g.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(0, i % 3 ? '#78b39620' : '#163a611f');
    wash.addColorStop(1, '#00000000');
    g.fillStyle = wash;
    g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const grains = Math.min(17000, Math.round(W * H / 70));
  for (let i = 0; i < grains; i++) {
    g.fillStyle = i % 3 ? '#dce9b708' : '#082d3d13';
    const size = 0.5 + rand() * 1.15;
    g.fillRect(rand() * W, rand() * H, size * 1.4, size);
  }
  return canvas;
}

function leafSprite(colors, index) {
  const sprite = surface(280);
  const g = sprite.getContext('2d');
  const rand = random(500 + index);
  const rim = new Path2D();
  const notch = 0.18 + rand() * 0.38;
  const direction = 0.65;
  const radiusAt = a => 96 + 3.9 * Math.sin(6 * a + index) + 1.8 * Math.cos(13 * a);
  rim.moveTo(7, 5);
  for (let i = 0; i <= 128; i++) {
    const angle = direction + notch / 2 + (tau - notch) * i / 128;
    const r = radiusAt(angle);
    rim.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * 0.94);
  }
  rim.closePath();
  g.translate(140, 140);
  g.save();
  g.translate(6, 11);
  g.shadowColor = '#133f43a0';
  g.shadowBlur = 13;
  g.fillStyle = '#173f4580';
  g.fill(rim);
  g.restore();

  const green = g.createLinearGradient(-76, -105, 69, 103);
  colors.forEach((color, i) => green.addColorStop([0, 0.51, 1][i], color));
  g.fillStyle = green;
  g.fill(rim);
  g.save();
  g.clip(rim);
  for (let i = 0; i < 14; i++) {
    const a = direction + notch / 2 + (tau - notch) * (i + 0.32) / 14;
    const x = Math.cos(a), y = Math.sin(a);
    const reach = (0.84 + rand() * 0.14) * radiusAt(a);
    g.beginPath();
    g.moveTo(3, 3);
    g.quadraticCurveTo(x * 43 - y * 9, y * 39 + x * 9, x * reach, y * reach * 0.94);
    g.strokeStyle = i % 3 ? '#e2efad46' : '#1d634d51';
    g.lineWidth = i % 3 ? 1.1 : 1.4;
    g.stroke();
  }
  for (let i = 0; i < 720; i++) {
    g.fillStyle = i % 2 ? '#fff4ac16' : '#23514319';
    g.fillRect(rand() * 204 - 102, rand() * 204 - 102, 1.5, 1.0);
  }
  g.restore();
  g.strokeStyle = '#396d58a8';
  g.lineWidth = 1.5;
  g.stroke(rim);
  ellipse(g, 3, 3, 3.4, 2.7, '#c4d984ac');
  return sprite;
}

function flowerSprite(colors, index) {
  const sprite = surface(132);
  const g = sprite.getContext('2d');
  const rand = random(83 + index);
  g.translate(66, 66);
  ellipse(g, 5, 10, 35, 30, '#284d494f');
  const layers = [[9, 45, 14], [7, 33, 12], [5, 22, 8]];
  for (const [count, length, width] of layers) {
    for (let i = 0; i < count; i++) {
      const a = tau * (i + rand() * 0.25) / count;
      const tip = length * (0.85 + rand() * 0.24);
      g.save();
      g.rotate(a);
      const wash = g.createLinearGradient(0, 0, 0, -tip);
      wash.addColorStop(0, colors[2]);
      wash.addColorStop(0.54, colors[1]);
      wash.addColorStop(1, colors[0]);
      g.fillStyle = wash;
      g.beginPath();
      g.moveTo(0, 2);
      g.bezierCurveTo(-width, -tip * 0.31, -width * 0.72, -tip * 0.79, 1, -tip);
      g.bezierCurveTo(width * 1.02, -tip * 0.69, width * 0.86, -tip * 0.29, 0, 2);
      g.fill();
      g.restore();
    }
  }
  ellipse(g, 0, 0, 7.2, 6.7, '#d39759');
  for (let i = 0; i < 11; i++) {
    const a = i * 2.4, r = i * 0.52;
    ellipse(g, Math.cos(a) * r, Math.sin(a) * r, 1.35, 1.35, '#ffe4a0');
  }
  return sprite;
}

const leafSprites = leafColors.map(leafSprite);
const flowerSprites = flowerColors.map(flowerSprite);

function createPond() {
  const rand = random(params.seed);
  const side = Math.min(W, H);
  const size = clamp(side / 880, 0.30, 1.35);
  water = paintWater(random(params.seed ^ 0x7f941b));
  pads = [];
  const baseCount = clamp(Math.round(W * H / (size * size * 18800)), 24, 105);
  const maxDensity = ranges.density[1];
  const extraCount = Math.ceil(baseCount * (maxDensity - 1));
  const spacing = 0.76;

  // Fill the largest gaps first so every density covers the whole pond.
  for (let index = 0; index < baseCount + extraCount; index++) {
    let x = 0, y = 0, bestClearance = -Infinity;
    for (let sample = 0; sample < 40; sample++) {
      const px = rand() * W, py = rand() * H;
      let clearance = Infinity;
      for (const pad of pads) {
        const dx = pad.x - px, dy = pad.y - py;
        clearance = Math.min(clearance, Math.sqrt(dx * dx + dy * dy) - pad.radius * spacing);
      }
      if (clearance > bestClearance) {
        x = px;
        y = py;
        bestClearance = clearance;
      }
    }
    const radius = Math.min((27 + rand() ** 1.2 * 65) * size, bestClearance / spacing);
    if (radius < 19 * size) break;

    const densityRank = index < baseCount ? (index + 0.5) / baseCount :
      1 + (maxDensity - 1) * (index - baseCount + 0.5) / extraCount;
    pads.push({
      x, y, radius, angle: rand() * tau, phase: rand() * tau,
      sprite: leafSprites[Math.floor(rand() * leafSprites.length)],
      flower: flowerSprites[Math.floor(rand() * flowerSprites.length)],
      densityRank, flowerRank: rand(), opacity: 0, target: 0, bloom: 0, bloomTarget: 0,
      displayRadius: radius, radiusTarget: radius,
    });
  }
  pads.sort((a, b) => b.radius - a.radius);

  const fishRand = random(params.seed ^ 0x419ac7);
  swimmers = Array.from({ length: ranges.fish[1] }, (_, index) => ({
    u: 0.27 + fishRand() * 0.44, v: 0.27 + fishRand() * 0.46, phase: fishRand() * tau,
    direction: index % 2 ? -1 : 1, speed: 0.12 + fishRand() * 0.09,
    length: (38 + fishRand() * 32) * size, colors: koiColors[index % koiColors.length],
  }));
  layout(true);
}

function iconDistance(x, y, icon) {
  const dx = Math.max(icon.x - x, x - icon.x - icon.w, 0);
  const dy = Math.max(icon.y - y, y - icon.y - icon.h, 0);
  return Math.hypot(dx, dy);
}

function layout(snap = paused || reducedMotion.matches) {
  const protectedIcons = params.adaptive ? icons : [];
  const clearance = params.sigma + 6;
  const bloomRadius = Math.min(35, Math.min(W, H) * 0.04);
  for (const pad of pads) {
    // Fit smaller leaves near a clearing instead of dropping every leaf that touches it.
    let available = pad.radius;
    for (const icon of protectedIcons) {
      available = Math.min(available, iconDistance(pad.x, pad.y, icon) - clearance);
    }
    const minRadius = pad.radius * 0.48;
    pad.radiusTarget = Math.max(available, minRadius);
    pad.target = available >= minRadius && pad.densityRank < params.density ? 1 : 0;
    pad.bloomTarget = pad.target && available >= bloomRadius && pad.flowerRank < params.flowers * 0.46 ? 1 : 0;
    if (snap) {
      pad.opacity = pad.target;
      pad.bloom = pad.bloomTarget;
      pad.displayRadius = pad.radiusTarget;
    }
  }
  dirty = true;
}

function arc(g, x, y, r, squash, start, end) {
  g.beginPath();
  g.ellipse(x, y, r, r * squash, 0, start, end);
  g.stroke();
}

function paintKoi(fish) {
  const a = fish.phase + fish.direction * clock * fish.speed;
  const dx = Math.min(W * 0.24, H * 0.53), dy = H * 0.20;
  const x = W * fish.u + Math.cos(a) * dx;
  const y = H * fish.v + Math.sin(a) * dy + Math.sin(a * 2) * dy * 0.32;
  const heading = Math.atan2((Math.cos(a) + 0.64 * Math.cos(a * 2)) * dy * fish.direction,
    -Math.sin(a) * dx * fish.direction);
  let visibility = 1;
  if (params.adaptive) {
    for (const icon of icons) {
      visibility = Math.min(visibility, clamp((iconDistance(x, y, icon) - params.sigma * 0.45) / fish.length));
      if (!visibility) return;
    }
  }
  const tail = Math.sin(clock * 4.5 + fish.phase) * 6;
  const [fin, scales, patch] = fish.colors;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.scale(fish.length / 61, fish.length / 61);
  ctx.strokeStyle = '#bcdfc7';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 2; i++) {
    const travel = (clock * 0.42 + fish.phase + i * 0.5) % 1;
    ctx.globalAlpha = 0.22 * (1 - travel) * visibility;
    arc(ctx, -23 - travel * 34, 0, 4 + travel * 15, 0.58, 1.8, 4.5);
  }

  ctx.globalAlpha = 0.72 * visibility;
  ctx.fillStyle = fin;
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.quadraticCurveTo(-27, -6 + tail * 0.6, -40, -10 + tail);
  ctx.quadraticCurveTo(-33, -2 + tail, -36, tail);
  ctx.quadraticCurveTo(-33, 3 + tail, -39, 9 + tail);
  ctx.quadraticCurveTo(-26, 6 + tail * 0.6, -16, 2);
  ctx.fill();
  ellipse(ctx, 1, -7, 10, 3.2, '#e7bd99');
  ellipse(ctx, 1, 7, 10, 3.2, '#e7bd99');

  const body = new Path2D();
  body.moveTo(-24, tail * 0.35);
  body.bezierCurveTo(-9, -9, 4, -12, 17, -5);
  body.quadraticCurveTo(27, 0, 17, 5);
  body.bezierCurveTo(4, 12, -9, 9, -24, tail * 0.35);
  ctx.fillStyle = scales;
  ctx.fill(body);
  ctx.clip(body);
  ellipse(ctx, 9, -3, 8, 5, patch);
  ellipse(ctx, -7, 4, 7, 4, patch);
  ellipse(ctx, -17, -3, 4.6, 3, patch);
  ellipse(ctx, 16, -3.4, 1.2, 1.05, '#304c45');
  ellipse(ctx, 16, 3.4, 1.2, 1.05, '#304c45');
  ctx.restore();
}

function paintPad(pad) {
  if (!pad.opacity) return;
  const wave = pad.phase + clock * 0.8;
  const motion = Math.sin(wave);
  ctx.save();
  ctx.translate(pad.x + motion * 2.2, pad.y + Math.cos(wave) * 1.7);
  ctx.rotate(pad.angle + motion * 0.025);
  ctx.globalAlpha = pad.opacity;
  const reach = pad.displayRadius * 1.40;
  ctx.drawImage(pad.sprite, -reach, -reach, 2 * reach, 2 * reach);
  if (pad.bloom) {
    ctx.globalAlpha = Math.min(pad.opacity, pad.bloom);
    const size = pad.displayRadius * 1.18;
    ctx.drawImage(pad.flower, -size * 0.23, -size * 0.64, size, size);
  }
  ctx.restore();
}

function draw() {
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  ctx.drawImage(water, 0, 0, W, H);
  for (let i = 0; i < params.fish; i++) paintKoi(swimmers[i]);
  for (const pad of pads) paintPad(pad);
  paintedWidth = cv.width;
  paintedHeight = cv.height;
  dirty = false;
}

const paintFrame = draw;
function frame(now) {
  requestAnimationFrame(frame);
  const recording = draw !== paintFrame;
  const frozen = paused && !recording;
  dirty ||= paintedWidth !== cv.width || paintedHeight !== cv.height;
  if (frozen && !dirty) { lastFrame = 0; return; }
  if (now - lastFrame < 32 && !dirty) return;
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.075) : 1 / 30;
  lastFrame = now;
  const animated = !frozen && !reducedMotion.matches;
  if (animated) clock += dt;
  const step = animated ? dt * 2.8 : 1;
  let changed = false;
  for (const pad of pads) {
    if (pad.opacity === pad.target && pad.bloom === pad.bloomTarget && pad.displayRadius === pad.radiusTarget) continue;
    changed = true;
    pad.opacity += clamp(pad.target - pad.opacity, -step, step);
    pad.bloom += clamp(pad.bloomTarget - pad.bloom, -step, step);
    const radiusStep = step * pad.radius;
    pad.displayRadius += clamp(pad.radiusTarget - pad.displayRadius, -radiusStep, radiusStep);
  }
  if (dirty || changed || recording || animated) {
    draw(now);
    frameN++;
  }
}

function resize() {
  const box = cv.getBoundingClientRect();
  W = Math.max(1, box.width);
  H = Math.max(1, box.height);
  const ratio = window.devicePixelRatio || 1;
  cv._scale = preview ? Math.min(0.48, ratio) : ratio;
  cv.width = Math.max(1, Math.round(W * cv._scale));
  cv.height = Math.max(1, Math.round(H * cv._scale));
  createPond();
}

function applySettings(values, reset) {
  const next = reset ? { ...defaults } : { ...params };
  if (Number.isSafeInteger(values.seed)) next.seed = values.seed;
  if (values.adaptive === 0 || values.adaptive === 1) next.adaptive = values.adaptive;
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (Number.isFinite(values[key])) next[key] = clamp(values[key], min, max);
  }
  next.fish = Math.round(next.fish);
  const newSeed = next.seed !== params.seed;
  Object.assign(params, next);
  if (newSeed) createPond();
  else layout();
}

function updateIcons(message) {
  const ratio = window.devicePixelRatio || 1;
  const rects = message.vis && Array.isArray(message.r) ? message.r : [];
  icons = rects.filter(rect => Array.isArray(rect) && rect.length === 4 &&
    rect.every(Number.isFinite) && rect[2] > rect[0] && rect[3] > rect[1])
    .map(([l, t, r, b]) => ({ x: l / ratio, y: t / ratio, w: (r - l) / ratio, h: (b - t) / ratio }));
  if (preview) {
    iconLayer.replaceChildren(...icons.map(({ x, y, w, h }) => {
      const item = document.createElement('div');
      item.className = 'icon';
      Object.assign(item.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      return item;
    }));
  }
  layout(!receivedIcons || paused || reducedMotion.matches);
  receivedIcons = true;
}

function receive(data) {
  let message;
  try { message = typeof data === 'string' ? JSON.parse(data) : data; }
  catch { return; }
  if (!message) return;
  switch (message.t) {
    case 'pause':
      if (!preview) { paused = Boolean(message.v); dirty = true; }
      break;
    case 'settings':
    case 'reset':
      applySettings(message.v || {}, message.t === 'reset');
      break;
    case 'icons':
      updateIcons(message);
      break;
  }
}

resize();
draw();
requestAnimationFrame(frame);
addEventListener('resize', resize);
reducedMotion.addEventListener('change', () => { dirty = true; });

if (preview && parent !== window) {
  addEventListener('message', event => { if (event.source === parent) receive(event.data); });
  parent.postMessage(JSON.stringify({ t: 'ready' }), '*');
} else if (WALL && window.chrome?.webview) {
  const host = window.chrome.webview;
  host.addEventListener('message', event => receive(event.data));
  host.postMessage('ready');
}
