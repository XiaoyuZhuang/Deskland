/* Original watercolor artwork for Pink Forest. The paper and tree sprites are cached. */
(() => {
  const tau = Math.PI * 2;
  const spriteWidth = 164;
  const spriteHeight = 192;
  const groundLine = 170;
  const paperColor = '#f7efe4';
  const colors = [
    ['#ffd8da', '#e387a0', '#a74968'], // rose
    ['#ffccc6', '#ec9989', '#b65f61'], // coral
    ['#f8c5d5', '#d884a5', '#9f5c85'], // mauve
    ['#ffe1ac', '#e8b46b', '#ab7452'], // apricot
    ['#e1e6ba', '#a8be82', '#6d8569'], // sage
    ['#d4e4e4', '#8eb1bd', '#587c92'], // blue
    ['#f1d4b7', '#c9a589', '#8c7065'], // warm gray
  ];
  const palette = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6];
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

  function random(seed) {
    let state = seed | 0;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
  }

  function ellipse(ctx, x, y, rx, ry, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, tau);
    ctx.fill();
  }

  function paperGrain() {
    const canvas = makeCanvas(192, 192);
    const ctx = canvas.getContext('2d');
    const pixels = ctx.createImageData(192, 192);
    const rand = random(71191);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const shade = rand() < 0.48 ? 96 : 255;
      pixels.data[i] = shade;
      pixels.data[i + 1] = shade;
      pixels.data[i + 2] = shade;
      pixels.data[i + 3] = rand() ** 2 * 28;
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  }

  function brushShape(x, y, rx, ry, rand) {
    const points = Array.from({ length: 13 }, (_, i) => {
      const a = tau * (i + 0.30 * rand()) / 13;
      const swell = 0.88 + 0.21 * rand();
      return [x + rx * Math.cos(a) * swell, y + ry * Math.sin(a) * swell];
    });
    const path = new Path2D();
    const last = points.at(-1);
    path.moveTo((last[0] + points[0][0]) * 0.5, (last[1] + points[0][1]) * 0.5);
    for (let i = 0; i < points.length; i++) {
      const [px, py] = points[i], [qx, qy] = points[(i + 1) % points.length];
      path.quadraticCurveTo(px, py, (px + qx) * 0.5, (py + qy) * 0.5);
    }
    path.closePath();
    return path;
  }

  function canopy(ctx, x, y, rx, ry, palette, rand) {
    const [light, color, edge] = palette;
    const rim = brushShape(x, y, rx, ry, rand);
    const gradient = ctx.createLinearGradient(x - rx * 0.72, y - ry, x + rx * 0.64, y + ry);
    gradient.addColorStop(0, light + 'a6');
    gradient.addColorStop(0.62, color + 'ad');
    gradient.addColorStop(1, edge + '9c');
    ctx.fillStyle = gradient;
    ctx.fill(rim);

    ctx.save();
    ctx.clip(rim);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = edge + '28';
    ctx.stroke(rim);
    for (let i = 0; i < 5; i++) {
      const px = x + (rand() - 0.5) * rx * 1.8, py = y + (rand() - 0.5) * ry * 1.75;
      const r = rx * (0.42 + rand() * 0.62);
      const wash = ctx.createRadialGradient(px, py, 0, px, py, r);
      const shade = i < 2 ? light : edge;
      wash.addColorStop(0, shade + (i < 2 ? '66' : '31'));
      wash.addColorStop(1, shade + '00');
      ellipse(ctx, px, py, r, r, wash);
    }
    const flecks = Math.round(rx * ry / 10);
    for (let i = 0; i < flecks; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#fff2ec38' : edge + '24';
      const size = 0.45 + rand() * 1.4;
      ctx.fillRect(x + (rand() - 0.5) * 2 * rx, y + (rand() - 0.5) * 2 * ry, size * 1.3, size);
    }
    ctx.restore();
  }

  function drawBranches(ctx, bend, form, rand) {
    const center = spriteWidth / 2;
    const tip = 44 + rand() * 20;
    const stem = y => center + bend * ((groundLine - y) / (groundLine - tip)) ** 1.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = '#57444be2';
    ctx.beginPath();
    ctx.moveTo(center - 3, groundLine);
    ctx.quadraticCurveTo(center + bend * 0.38 - 2, 118, center + bend, tip);
    ctx.quadraticCurveTo(center + bend * 0.46 + 1.4, 118, center + 2, groundLine + 0.8);
    ctx.fill();

    const spread = [37, 23, 43, 30][form];
    for (let i = 0; i < 6; i++) {
      const sign = i % 2 ? -1 : 1;
      const y = 139 - i * 11 - rand() * 5;
      const x = stem(y);
      const dx = (spread * (1 - i * 0.10) * (0.69 + 0.35 * rand())) * sign;
      const dy = 13 + rand() * 13;
      ctx.strokeStyle = i % 2 ? '#5c484cbd' : '#695057bc';
      ctx.lineWidth = 1.9 - i * 0.11;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + dx * 0.63, y - dy * 0.32, x + dx, y - dy);
      if (i < 4) {
        ctx.moveTo(x + dx * 0.62, y - dy * 0.47);
        ctx.quadraticCurveTo(x + dx * 0.73, y - dy * 0.9, x + dx * 0.58, y - dy * 1.2);
      }
      ctx.stroke();
    }
  }

  function makeSprite(color, form) {
    const canvas = makeCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext('2d');
    const rand = random(3014 + color * 23 + form * 137);
    const pigment = colors[color];
    const bend = (rand() - 0.5) * 29;
    const x = spriteWidth / 2 + bend * 0.46;
    ellipse(ctx, 87, groundLine + 3, 29, 5, '#88666415');
    ellipse(ctx, 80, groundLine + 2, 13, 2.9, '#78575819');
    switch (form) {
      case 0:
        canopy(ctx, x, 72, 59, 59, pigment, rand);
        canopy(ctx, x + 16, 88, 42, 37, pigment, rand);
        break;
      case 1:
        canopy(ctx, x, 71, 35, 66, pigment, rand);
        canopy(ctx, x - 9, 79, 28, 49, pigment, rand);
        break;
      case 2:
        canopy(ctx, x - 30, 79, 38, 39, pigment, rand);
        canopy(ctx, x + 33, 76, 33, 36, pigment, rand);
        canopy(ctx, x + 3, 57, 42, 46, pigment, rand);
        break;
      case 3:
        for (let row = 0; row < 4; row++) {
          canopy(ctx, x + (row % 2 ? 3 : -3), 110 - row * 22, 43 - row * 8, 18 + row * 2, pigment, rand);
        }
        break;
    }
    drawBranches(ctx, bend, form, rand);
    return canvas;
  }

  class PinkForestScene {
    constructor() {
      this.grain = paperGrain();
      this.sprites = colors.map((_, color) => Array.from({ length: 4 }, (_, form) => makeSprite(color, form)));
      this.trees = [];
      this.perches = [];
    }

    build(width, height, ratio, params) {
      this.width = width;
      this.height = height;
      const scale = clamp(Math.min(width, height) / 870, 0.46, 1.42);
      const paperScale = Math.min(1, ratio, Math.sqrt(1600000 / (width * height)));
      this.ground = makeCanvas(width * paperScale, height * paperScale);
      const rand = random(params.seed);
      this.paintGround(random(params.seed ^ 481798), scale);
      this.trees.length = 0;

      const spacing = Math.max(77 * scale, Math.sqrt(width * height / 300));
      let row = 0;
      for (let y = -spacing * 0.14; y < height + spacing * 0.81; y += spacing * 0.87, row++) {
        for (let x = -spacing; x < width + spacing * 0.55; x += spacing) {
          const px = x + spacing * ((row % 2) * 0.5 + rand() * 0.81);
          const py = y + spacing * (0.19 + rand() * 0.78);
          const form = Math.floor(rand() * 4);
          const color = palette[Math.floor(rand() * palette.length)];
          const depth = clamp(py / height);
          const treeHeight = scale * (42 + depth * 25 + rand() ** 1.34 * 82);
          const treeWidth = treeHeight * (0.84 + rand() * 0.22);
          const widthFactor = [0.52, 0.33, 0.52, 0.39][form];
          this.trees.push({
            x: px, y: py, h: treeHeight, w: treeWidth,
            halfWidth: treeWidth * widthFactor + 4,
            sprite: this.sprites[color][form], phase: rand() * tau, rank: rand(),
            grow: 0, want: 0,
          });
        }
      }
      this.trees.sort((a, b) => a.y - b.y);
    }

    paintGround(rand, scale) {
      const { width, height, ground } = this;
      const ctx = ground.getContext('2d', { alpha: false });
      ctx.scale(ground.width / width, ground.height / height);
      const paper = ctx.createLinearGradient(0, 0, width * 0.63, height);
      paper.addColorStop(0, '#fcf6e9');
      paper.addColorStop(0.56, paperColor);
      paper.addColorStop(1, '#efe1d3');
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 27; i++) {
        const x = rand() * width, y = rand() * height, r = scale * (75 + rand() * 215);
        const wash = ctx.createRadialGradient(x, y, 0, x, y, r);
        const hue = i % 3 ? '#dcacaa' : '#d9c08e';
        wash.addColorStop(0, hue + '32');
        wash.addColorStop(1, hue + '00');
        ctx.fillStyle = wash;
        ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      }

      ctx.globalAlpha = 0.52;
      ctx.fillStyle = ctx.createPattern(this.grain, 'repeat');
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      const details = Math.min(156, Math.round(width * height / (scale * scale * 11500)));
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(0.8, scale * 0.9);
      for (let i = 0; i < details; i++) {
        const x = rand() * width, y = rand() * height, size = scale * (1 + rand() * 3);
        ctx.strokeStyle = i % 3 ? '#96736c47' : '#888a694e';
        ctx.beginPath();
        ctx.moveTo(x - 2 * size, y - size);
        ctx.quadraticCurveTo(x - size, y - size * 0.8, x, y);
        ctx.quadraticCurveTo(x + size * 0.35, y - size * 1.35, x + size, y - size * 1.65);
        ctx.stroke();
      }
    }

    setLayout(icons, clearance, density, snap, params) {
      for (const tree of this.trees) {
        const { x, y, h, halfWidth } = tree;
        const away = icons.every(icon =>
          x + halfWidth < icon.x - clearance || x - halfWidth > icon.x + icon.w + clearance ||
          y + h * 0.07 < icon.y - clearance || y - h > icon.y + icon.h + clearance);
        tree.want = tree.rank < density && away ? 1 : 0;
        if (snap) tree.grow = tree.want;
      }
      this.perches = this.trees.filter(tree => tree.want && tree.x >= 18 && tree.x < this.width - 18 &&
        tree.y - tree.h > 20 && tree.y < this.height && tree.h >= 50);
      this.birds = Math.round(params.birds);
    }

    advance(dt, snap) {
      const step = snap ? 1 : dt * 3.1;
      let moving = false;
      for (const tree of this.trees) {
        if (tree.grow === tree.want) continue;
        tree.grow = tree.want ? Math.min(1, tree.grow + step) : Math.max(0, tree.grow - step);
        moving = true;
      }
      return moving;
    }

    paint(ctx, width, height, clock) {
      ctx.setTransform(width / this.width, 0, 0, height / this.height, 0, 0);
      ctx.drawImage(this.ground, 0, 0, this.width, this.height);
      for (const tree of this.trees) {
        if (tree.grow <= 0) continue;
        const sway = 0.027 * Math.sin(clock * 1.07 + tree.phase) + 0.013 * Math.sin(clock * 0.57 + tree.x * 0.016);
        const stretch = 0.83 + tree.grow * 0.17;
        const height = tree.h * stretch;
        const width = tree.w * stretch;
        ctx.save();
        ctx.globalAlpha = tree.grow;
        ctx.translate(tree.x, tree.y);
        ctx.transform(1, 0, sway, 1, 0, 0);
        ctx.drawImage(tree.sprite, -width / 2, -height, width, height * spriteHeight / groundLine);
        ctx.restore();
      }
      this.paintBirds(ctx, clock);
    }

    paintBirds(ctx, clock) {
      const count = this.perches.length;
      if (count < 2) return;
      for (let i = 0; i < Math.min(this.birds, count); i++) {
        const interval = 13 + i * 1.7;
        const t = clock + i * 3.64;
        const hop = Math.floor(t / interval);
        const fromIndex = (Math.floor(i * count / this.birds) + hop) % count;
        const from = this.perches[fromIndex], to = this.perches[(fromIndex + 1) % count];
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        const flight = clamp(distance / 95, 0.55, 2.6);
        const progress = clamp((t % interval - interval + flight) / flight);
        const x = from.x + (to.x - from.x) * progress;
        const fromY = from.y - from.h * 0.83, toY = to.y - to.h * 0.83;
        const y = fromY + (toY - fromY) * progress - Math.sin(progress * Math.PI) * (12 + distance * 0.035);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(to.x < from.x ? -1 : 1, 1);
        ctx.globalAlpha = from.grow;
        if (progress > 0) {
          const wing = Math.sin(t * 20) * 3.7;
          ctx.strokeStyle = '#624b55c9';
          ctx.lineWidth = 1.25;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-5, wing - 1.5);
          ctx.quadraticCurveTo(-2, wing - 2.4, 0, 0);
          ctx.quadraticCurveTo(2.3, wing - 2.5, 5.4, wing - 1.2);
          ctx.stroke();
        } else {
          ellipse(ctx, -0.8, 0.5, 3.2, 1.9, '#664e57dc');
          ellipse(ctx, 1.9, -0.8, 1.55, 1.4, '#664e57dc');
        }
        ctx.restore();
      }
    }
  }

  window.wallpaperScene = {
    scene: new PinkForestScene(),
    defaults: { seed: 734921, sigma: 26, density: 0.84, wind: 1, birds: 3, adaptive: 1 },
    ranges: { sigma: [0, 150], density: [0.25, 1], wind: [0, 2], birds: [0, 8] },
  };
})();
