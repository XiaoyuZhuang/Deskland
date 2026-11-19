/* Canvas wallpaper adapter. Keep the draw, canvas and icon interface used by share.js. */
const QS = new URLSearchParams(location.search);
const WALL = QS.has('wallpaper');
const PREVIEW = QS.has('preview');
const ART_ONLY = QS.has('art');
const cv = document.getElementById('forest');
const ctx = cv.getContext('2d', { alpha: false });
const iconLayer = document.getElementById('icons');
const { scene, defaults: DEFAULTS, ranges, rebuildOn = [], demoHint = 'Drag an icon to move its clearing' } = window.wallpaperScene || {
  scene: new ForestScene(),
  defaults: { seed: 513070, sigma: 45, density: 0.80, wind: 1, stream: 1, adaptive: 1 },
  ranges: { sigma: [0, 150], density: [0.30, 1], wind: [0, 2], stream: [0.60, 1.60] },
  rebuildOn: ['stream'],
};
const params = { ...DEFAULTS };
const demoMode = !WALL && !PREVIEW && !ART_ONLY;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const trees = scene.trees;
let W = 0, H = 0, icons = [], frameN = 0, paused = false;
let clock = 0, lastFrame = 0, dirty = true, iconMessageSeen = false;
let paintedWidth = 0, paintedHeight = 0;

function draw() {
  scene.paint(ctx, cv.width, cv.height, clock);
  paintedWidth = cv.width;
  paintedHeight = cv.height;
  dirty = false;
}

const paintFrame = draw;
function repaint() {
  dirty = true;
}

function frame(now) {
  requestAnimationFrame(frame);
  const recording = draw !== paintFrame;
  const frozen = paused && !recording;
  dirty ||= paintedWidth !== cv.width || paintedHeight !== cv.height;
  if (frozen && !dirty) { lastFrame = 0; return; }
  if (now - lastFrame < 32 && !dirty) return;
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.075) : 1 / 30;
  lastFrame = now;
  const animated = !frozen && !reducedMotion.matches && params.wind > 0;
  if (animated) clock += dt * params.wind;
  const transitioning = scene.advance(dt, frozen || reducedMotion.matches);
  if (dirty || transitioning || recording || animated) {
    draw(now);
    frameN++;
  }
}

function commit(snap = false) {
  scene.setLayout(params.adaptive ? icons : [], params.sigma, params.density,
    snap || paused || reducedMotion.matches, params);
  repaint();
}

function build() {
  scene.build(W, H, window.devicePixelRatio || 1, params);
  commit(true);
}

function placeIcon(icon) {
  Object.assign(icon.element.style, {
    left: icon.x + 'px', top: icon.y + 'px', width: icon.w + 'px', height: icon.h + 'px',
  });
}

function keepOnScreen(icon, x, y) {
  icon.x = Math.min(Math.max(0, x), Math.max(0, W - icon.w));
  icon.y = Math.min(Math.max(0, y), Math.max(0, H - icon.h));
  placeIcon(icon);
}

function resize() {
  const box = cv.getBoundingClientRect();
  W = Math.max(1, box.width);
  H = Math.max(1, box.height);
  cv._scale = PREVIEW ? Math.min(0.48, window.devicePixelRatio || 1) : (window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(W * cv._scale));
  cv.height = Math.max(1, Math.round(H * cv._scale));
  if (demoMode) for (const icon of icons) keepOnScreen(icon, icon.x, icon.y);
  build();
}

function applySettings(values, reset) {
  const clean = reset ? { ...DEFAULTS } : {};
  if (Number.isSafeInteger(values.seed)) clean.seed = values.seed;
  if (values.adaptive === 0 || values.adaptive === 1) clean.adaptive = values.adaptive;
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (Number.isFinite(values[key])) clean[key] = Math.max(min, Math.min(max, values[key]));
  }
  const changed = Object.keys(clean).filter(key => clean[key] !== params[key]);
  Object.assign(params, clean);
  if (changed.includes('seed') || rebuildOn.some(key => changed.includes(key))) build();
  else if (changed.some(key => key !== 'wind')) commit();
  else if (changed.length) repaint();
}

function iconElement(index, ghost, label) {
  const element = document.createElement(ghost ? 'div' : 'button');
  element.className = ghost ? 'icon ghost' : 'icon';
  if (!ghost) element.type = 'button';
  const glyph = document.createElement('i');
  glyph.className = 'glyph' + (index % 2 ? ' page' : '');
  element.append(glyph);
  const line = document.createElement('span');
  if (ghost) line.className = 'line';
  else line.textContent = label;
  element.append(line);
  return element;
}

function showGhosts() {
  const children = icons.map((icon, index) => {
    icon.element = iconElement(index, true);
    placeIcon(icon);
    return icon.element;
  });
  iconLayer.replaceChildren(...children);
}

function receive(data) {
  let message;
  try { message = typeof data === 'string' ? JSON.parse(data) : data; }
  catch { return; }
  if (!message) return;
  switch (message.t) {
    case 'pause':
      if (!PREVIEW) { paused = Boolean(message.v); repaint(); }
      break;
    case 'settings':
    case 'reset':
      applySettings(message.v || {}, message.t === 'reset');
      break;
    case 'icons': {
      const ratio = window.devicePixelRatio || 1;
      const rects = message.vis && Array.isArray(message.r) ? message.r : [];
      icons = rects.filter(rect => Array.isArray(rect) && rect.length === 4 &&
        rect.every(Number.isFinite) && rect[2] > rect[0] && rect[3] > rect[1])
        .map(([l, t, r, b]) => ({ x: l / ratio, y: t / ratio, w: (r - l) / ratio, h: (b - t) / ratio }));
      if (PREVIEW) showGhosts();
      commit(!iconMessageSeen);
      iconMessageSeen = true;
      break;
    }
  }
}

function addDemoIcons() {
  const english = !navigator.language.toLowerCase().startsWith('zh');
  if (english) document.documentElement.lang = 'en';
  const labels = english ? ['Photos', 'Notes', 'Projects', 'Journal', 'Sketches'] :
    ['照片', '笔记', '项目', '日志', '草图'];
  const points = [[0.08, 0.12], [0.08, 0.24], [0.155, 0.19], [0.78, 0.69], [0.86, 0.74]];
  icons = points.slice(0, W < 550 ? 3 : points.length).map(([x, y], index) => {
    const element = iconElement(index, false, labels[index]);
    const icon = { element, x: x * W, y: y * H, w: 64, h: 61 };
    keepOnScreen(icon, icon.x, icon.y);
    element.addEventListener('keydown', event => {
      const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const delta = movement[event.key];
      if (!delta) return;
      event.preventDefault();
      keepOnScreen(icon, icon.x + delta[0] * 24, icon.y + delta[1] * 24);
      commit();
    });
    iconLayer.append(element);
    return icon;
  });
  let drag = null;
  addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    const icon = icons.find(icon => icon.element.contains(event.target));
    if (!icon) return;
    drag = { icon, id: event.pointerId, dx: event.clientX - icon.x, dy: event.clientY - icon.y };
    icon.element.setPointerCapture(event.pointerId);
  }, true);
  function moveIcon(event) {
    if (drag?.id === event.pointerId) {
      keepOnScreen(drag.icon, event.clientX - drag.dx, event.clientY - drag.dy);
    }
  }
  function finishDrag(event) {
    if (!drag || (event.type !== 'blur' && drag.id !== event.pointerId)) return;
    if (event.type === 'pointerup') moveIcon(event);
    drag = null;
    commit();
  }
  addEventListener('pointermove', moveIcon, true);
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    addEventListener(event, finishDrag, true);
  }
  addEventListener('blur', finishDrag);
  commit(true);
  const toggle = document.getElementById('toggle-motion');
  const update = () => {
    toggle.textContent = paused ? (english ? 'Play' : '继续动画') : (english ? 'Pause' : '暂停动画');
    toggle.setAttribute('aria-pressed', String(paused));
  };
  toggle.addEventListener('click', () => { paused = !paused; update(); repaint(); });
  if (english) document.getElementById('demo-hint').textContent = demoHint;
  update();
  document.getElementById('demo').hidden = false;
}

resize();
requestAnimationFrame(frame);
addEventListener('resize', resize);
reducedMotion.addEventListener('change', repaint);
if (PREVIEW && parent !== window) {
  addEventListener('message', event => { if (event.source === parent) receive(event.data); });
  parent.postMessage(JSON.stringify({ t: 'ready' }), '*');
} else if (WALL && window.chrome?.webview) {
  const host = window.chrome.webview;
  host.addEventListener('message', event => receive(event.data));
  host.postMessage('ready');
} else if (demoMode) addDemoIcons();
