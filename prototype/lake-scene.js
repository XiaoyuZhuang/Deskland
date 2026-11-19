/* Original lake artwork, shared canvas wallpaper adapter. */
(() => {
  const { CachedScene, clamp, ellipse, grain, gradient, random, surface, tau } = Scenery;
  const defaults = { seed: 704195, adaptive: 1, sigma: 10, fish: 15, wind: 1 };
  const ranges = { sigma: [0, 40], fish: [0, 24], wind: [0, 2] };
  const greens = [
    ['#9fb87e', '#6e985f', '#406d51', '#2e554b'],
    ['#b0bc82', '#769963', '#4e7853', '#325949'],
    ['#88ad81', '#598e6d', '#3d7560', '#28584d'],
    ['#a8b47b', '#809964', '#5a7e51', '#3c5d45'],
  ];
  const fishColors = [
    ['#ffe0a4', '#c7975b', '#9b6b45'],
    ['#f3b996', '#cc805f', '#ab6456'],
    ['#e1e8d7', '#a9c1ad', '#638f88'],
    ['#f5dc98', '#c1a75b', '#8c8045'],
  ];

  function leafSprite(colors, seed) {
    const canvas = surface(336, 336);
    const ctx = canvas.getContext('2d');
    const rand = random(seed);
    const detail = canvas.width / 156;
    ctx.setTransform(detail, 0, 0, detail, canvas.width / 2, canvas.height / 2);
    const outline = new Path2D();
    const bend = rand() * tau;
    const gap = 0.16 + rand() * 0.035;
    const points = Array.from({ length: 38 }, (_, i) => {
      const a = gap + (tau - 2 * gap) * i / 37;
      const r = 62 * (1 + 0.028 * Math.sin(a * 3 + bend) + 0.017 * Math.cos(a * 6 - bend));
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    const [startX, startY] = points[0], [endX, endY] = points.at(-1);
    outline.moveTo(34, 0.5);
    outline.bezierCurveTo(46, 1.7, startX - 7, startY + 2.8, startX, startY);
    for (let i = 0; i < points.length - 1; i++) {
      const [x, y] = points[i], [nx, ny] = points[i + 1];
      outline.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }
    outline.quadraticCurveTo(endX, endY, endX - 2.2, endY + 0.8);
    outline.bezierCurveTo(49, -6, 42, -0.8, 34, 0.5);
    outline.closePath();

    ctx.save();
    ctx.translate(0.7, 2.2);
    ctx.shadowColor = '#142f3768';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#244743a0';
    ctx.fill(outline);
    ctx.restore();
    ctx.fillStyle = gradient(ctx, -52, -56, 112, 122, colors);
    ctx.fill(outline);
    ctx.save();
    ctx.clip(outline);

    const sheen = ctx.createRadialGradient(-29, -27, 3, -28, -23, 71);
    sheen.addColorStop(0, '#e1e9ac49');
    sheen.addColorStop(0.56, '#d6e6a71c');
    sheen.addColorStop(1, '#d6e6a700');
    ctx.fillStyle = sheen;
    ctx.fillRect(-69, -69, 138, 138);
    const hollow = ctx.createRadialGradient(-3, 0, 0, -3, 0, 24);
    hollow.addColorStop(0, '#254d4638');
    hollow.addColorStop(1, '#254d4600');
    ctx.fillStyle = hollow;
    ctx.fillRect(-28, -26, 54, 54);

    for (let i = 0; i < 370; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#243d2d14' : '#edecad18';
      ctx.fillRect(rand() * 126 - 63, rand() * 126 - 63, 0.32 + rand() * 1.02, 0.35 + rand() * 0.71);
    }

    ctx.lineCap = 'round';
    for (let i = 0; i < 11; i++) {
      const a = (i + 0.5) * tau / 11 + (rand() - 0.5) * 0.07, r = 52 + rand() * 9;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      const cx = Math.cos(a + 0.13) * 29, cy = Math.sin(a + 0.13) * 29;
      const vein = ctx.createLinearGradient(-3, 1, x, y);
      vein.addColorStop(0, '#e3e6ae40');
      vein.addColorStop(0.42, '#dde7a735');
      vein.addColorStop(1, '#e7ebb900');
      ctx.strokeStyle = vein;
      ctx.lineWidth = 0.68 + rand() * 0.30;
      ctx.beginPath();
      ctx.moveTo(-3, 1);
      ctx.quadraticCurveTo(cx, cy, x, y);
      ctx.stroke();

      ctx.strokeStyle = '#e0e8b32b';
      ctx.lineWidth = 0.43;
      ctx.beginPath();
      ctx.moveTo(cx * 0.86, cy * 0.86);
      ctx.quadraticCurveTo(Math.cos(a + 0.18) * 39, Math.sin(a + 0.18) * 39,
        Math.cos(a + 0.27) * 51, Math.sin(a + 0.27) * 51);
      ctx.moveTo(cx * 1.1, cy * 1.1);
      ctx.quadraticCurveTo(Math.cos(a - 0.055) * 42, Math.sin(a - 0.055) * 42,
        Math.cos(a - 0.21) * 53, Math.sin(a - 0.21) * 53);
      ctx.stroke();
    }

    const edge = ctx.createLinearGradient(-51, -49, 52, 57);
    edge.addColorStop(0, '#e5edb779');
    edge.addColorStop(0.44, '#c8dc9b32');
    edge.addColorStop(0.73, '#28584155');
    edge.addColorStop(1, '#1a43355a');
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.3;
    ctx.stroke(outline);
    ellipse(ctx, -3, 1.2, 1.6, 1.4, '#e3eac452');
    for (const [x, y, r] of [[-28, -25, 3.25], [-33, -18, 1.95], [18, 31, 2.2]]) {
      ellipse(ctx, x + 0.9, y + 1.0, r * 1.18, r * 0.76, '#21473542');
      ellipse(ctx, x, y, r, r * 0.82, '#cdebbd43');
      ellipse(ctx, x - r * 0.25, y - r * 0.24, r * 0.43, r * 0.30, '#f5fce9ac');
    }
    ctx.restore();
    return canvas;
  }

  function paintLeaf(ctx, pad) {
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.scale(pad.rx, pad.ry);
    ctx.rotate(pad.angle);
    ctx.drawImage(pad.sprite, -1.24, -1.24, 2.48, 2.48);
    ctx.restore();
  }

  class LakeScene extends CachedScene {
    constructor() {
      super();
      this.sprites = greens.map((colors, index) => leafSprite(colors, 6912 + index * 181));
    }

    build(width, height, dpr, params) {
      super.build(width, height, dpr, params);
      // Keep the water cache at its normal resolution and give the foreground leaves more pixels.
      const resolution = Math.min(dpr, Math.sqrt(2850000 / (width * height)));
      if (Math.round(width * resolution) > this.current.width) {
        this.previous = surface(width * resolution, height * resolution);
        this.current = surface(width * resolution, height * resolution);
      }
    }

    prepare(params) {
      const { w, h, scale, sprites } = this;
      const rand = random(params.seed);
      this.water = surface(this.current.width, this.current.height);
      const ctx = this.water.getContext('2d');
      ctx.setTransform(this.water.width / w, 0, 0, this.water.height / h, 0, 0);
      ctx.fillStyle = gradient(ctx, 0, 0, w * 0.94, h * 0.84, ['#397a76', '#2b6d77', '#194c62', '#224b64']);
      ctx.fillRect(0, 0, w, h);

      const shallowBanks = [
        { x: w * 0.04, y: h * 0.91, rx: w * 0.34, ry: h * 0.42 },
        { x: w * 1.015, y: h * 0.08, rx: w * 0.37, ry: h * 0.48 },
        { x: w * -0.05, y: h * 0.05, rx: w * 0.21, ry: h * 0.35 },
      ];
      for (const bank of shallowBanks) {
        ctx.save();
        ctx.translate(bank.x, bank.y);
        ctx.scale(bank.rx, bank.ry);
        ctx.rotate(0.31);
        const wash = ctx.createRadialGradient(-0.16, -0.17, 0.04, 0, 0, 1.03);
        wash.addColorStop(0, '#e1ce8dcb');
        wash.addColorStop(0.42, '#89b6a18c');
        wash.addColorStop(0.78, '#69aaa472');
        wash.addColorStop(1, '#6dafa500');
        ctx.fillStyle = wash;
        ctx.fillRect(-1.05, -1.05, 2.1, 2.1);
        ctx.restore();

        for (let i = 0; i < 68; i++) {
          const a = rand() * tau, d = Math.sqrt(rand()) * 0.88;
          const x = bank.x + Math.cos(a) * d * bank.rx, y = bank.y + Math.sin(a) * d * bank.ry;
          const r = scale * (2 + 22 * rand() ** 3);
          ctx.globalAlpha = 0.15 + (1 - d) * 0.55;
          ellipse(ctx, x + r * 0.24, y + r * 0.14, r, r * 0.54, '#385f58');
          ellipse(ctx, x, y, r, r * (0.44 + rand() * 0.25), i % 3 ? '#8fa99a' : '#b5b58c');
          ellipse(ctx, x - r * 0.27, y - r * 0.19, r * 0.59, r * 0.23, '#d8dabb');
        }
      }
      ctx.globalAlpha = 1;

      // Soft light across the water, with quieter detail beneath the icon labels.
      for (let i = 0; i < 86; i++) {
        const x = rand() * w, y = rand() * h;
        const rx = scale * (12 + rand() * 72);
        ctx.globalAlpha = 0.017 + rand() * 0.035;
        ellipse(ctx, x, y, rx, rx * (0.07 + rand() * 0.14), i % 2 ? '#c6e7bc' : '#153d59');
      }
      ctx.globalAlpha = 1;
      grain(ctx, w, h, rand, ['#f5eacb22', '#dea86915', '#08192b23', '#a9dfd924'], 9200);

      const clusters = [[0.18, 0.71], [0.82, 0.30], [0.65, 0.92], [0.24, 0.13], [0.93, 0.76]];
      this.ambientPads = Array.from({ length: 31 }, (_, i) => {
        const [cx, cy] = clusters[i % clusters.length];
        const angle = rand() * tau, spread = 0.025 + rand() * 0.072;
        const rx = scale * (9 + rand() * 19);
        return { x: (cx + Math.cos(angle) * spread) * w, y: (cy + Math.sin(angle) * spread) * h,
          rx, ry: rx * (0.73 + rand() * 0.16), angle: rand() * tau, sprite: sprites[i % sprites.length] };
      });
      this.pads = [];

      const schools = [[0.32, 0.39, 0.23, 0.16, 0.3], [0.65, 0.58, 0.23, 0.22, 2.1],
        [0.48, 0.73, 0.28, 0.16, 4.1], [0.71, 0.29, 0.19, 0.18, 2.8]];
      this.swimmers = Array.from({ length: ranges.fish[1] }, (_, i) => {
        const [cx, cy, ax, ay, groupPhase] = schools[i % schools.length];
        const row = Math.floor(i / schools.length);
        return {
          cx: cx + (rand() - 0.5) * 0.056, cy: cy + (rand() - 0.5) * 0.065,
          ax, ay, phase: groupPhase + (row - 2) * 0.21 + rand() * 0.19,
          speed: 0.14 + (i % schools.length) * 0.021, direction: i % 2 ? -1 : 1,
          size: (31 + rand() * 24) * scale, depth: 0.68 + rand() * 0.29,
          color: fishColors[(i + row) % fishColors.length],
        };
      });
      this.ripples = Array.from({ length: 22 }, () => ({
        x: rand() * w, y: rand() * h, size: scale * (14 + rand() * 37), phase: rand(),
      }));
    }

    drawLayout(ctx, sigma) {
      ctx.drawImage(this.water, 0, 0, this.w, this.h);
      const iconPads = this.icons.map((icon, i) => ({
        x: icon.x + icon.w / 2, y: icon.y + icon.h / 2,
        rx: icon.w * 0.75 + sigma, ry: icon.h * 0.75 + sigma,
        angle: -0.65 + Math.sin(i * 2.1) * 0.32, sprite: this.sprites[i % this.sprites.length],
      }));
      const ambient = this.ambientPads.filter(pad => iconPads.every(icon =>
        ((pad.x - icon.x) / (pad.rx + icon.rx)) ** 2 + ((pad.y - icon.y) / (pad.ry + icon.ry)) ** 2 > 1.04));
      this.pads = ambient.concat(iconPads);
      ctx.imageSmoothingQuality = 'high';
      for (const pad of this.pads) paintLeaf(ctx, pad);
    }

    fishPosition(fish, time) {
      const a = fish.phase + fish.direction * fish.speed * time;
      const x = this.w * (fish.cx + fish.ax * Math.cos(a) + 0.023 * Math.cos(2 * a + 0.8));
      const y = this.h * (fish.cy + fish.ay * Math.sin(a) + 0.033 * Math.sin(2 * a));
      const dx = fish.direction * this.w * (-fish.ax * Math.sin(a) - 0.046 * Math.sin(2 * a + 0.8));
      const dy = fish.direction * this.h * (fish.ay * Math.cos(a) + 0.066 * Math.cos(2 * a));
      return { x, y, angle: Math.atan2(dy, dx) };
    }

    paintFish(ctx, fish, time) {
      const { x, y, angle } = this.fishPosition(fish, time);
      let visibility = 1;
      for (const pad of this.pads) {
        const u = (x - pad.x) / (pad.rx + fish.size * 0.25);
        const v = (y - pad.y) / (pad.ry + fish.size * 0.25);
        visibility = Math.min(visibility, clamp((u * u + v * v - 0.86) / 0.69));
        if (visibility === 0) return;
      }
      const [back, belly, fin] = fish.color;
      const swish = Math.sin(time * 5.4 + fish.phase * 3) * 4.4;
      ctx.save();
      ctx.globalAlpha = visibility * fish.depth;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(fish.size / 52, fish.size / 52);
      ellipse(ctx, 0, 3.4, 23, 6.2, '#143e5280');
      ctx.fillStyle = fin;
      ctx.beginPath();
      ctx.moveTo(-14, swish * 0.23);
      ctx.quadraticCurveTo(-24, swish - 8.7, -32, swish - 8);
      ctx.lineTo(-27, swish * 0.74);
      ctx.lineTo(-32, swish + 7.6);
      ctx.quadraticCurveTo(-23, swish + 7.7, -14, swish * 0.23);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(17.5, 0.5);
      ctx.bezierCurveTo(15, -10.6, -4, -11.4, -17, swish * 0.35);
      ctx.bezierCurveTo(-5, 9.2, 13, 10.1, 17.5, 0.5);
      ctx.fillStyle = gradient(ctx, -2, -8, 2, 16, [back, belly, fin]);
      ctx.fill();
      ellipse(ctx, 9.4, -3.0, 3.5, 1.25, '#fff1c663');
      ellipse(ctx, 12.1, -2.25, 1.0, 1.0, '#3a574a');
      ctx.restore();
    }

    animate(ctx, time) {
      ctx.globalAlpha = 1;
      for (let i = 0; i < Math.round(this.settings.fish); i++) this.paintFish(ctx, this.swimmers[i], time);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#d8eee9';
      ctx.lineWidth = Math.max(0.55, 0.95 * this.scale);
      for (const wave of this.ripples) {
        const at = (wave.phase + time * 0.105) % 1;
        if (this.pads.some(pad => Math.abs(pad.x - wave.x) < pad.rx + wave.size && Math.abs(pad.y - wave.y) < pad.ry + 4)) continue;
        const size = wave.size * (0.70 + 0.48 * at);
        ctx.globalAlpha = 0.07 + 0.26 * Math.sin(at * Math.PI) ** 2;
        ctx.beginPath();
        ctx.moveTo(wave.x - size, wave.y);
        ctx.quadraticCurveTo(wave.x - size * 0.12, wave.y - size * 0.105, wave.x + size * 0.57, wave.y);
        ctx.stroke();
      }
    }
  }

  window.wallpaperScene = {
    scene: new LakeScene(), defaults, ranges, demoHint: 'Drag a sample icon to move its lily pad',
  };
})();
