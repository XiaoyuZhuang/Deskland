/* Original Forest artwork. Static paint and tree silhouettes are cached offscreen. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, value) => {
    const t = clamp((value - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const palette = [
    ['#183d38', '#24534a', '#376a55', '#598561', '#89a574'],
    ['#22433a', '#355e43', '#547c4b', '#719455', '#a1b775'],
    ['#23514d', '#336b5f', '#4b8270', '#699783', '#9bbb91'],
    ['#3d5036', '#587044', '#738d4d', '#9da65c', '#c1bd77'],
    ['#2d493b', '#4f6950', '#6b865d', '#8ea36f', '#baca87'],
    ['#554a36', '#7e6741', '#9c884d', '#bba05e', '#dfbf78'],
  ];

  function random(seed) {
    let state = seed | 0;
    return () => {
      state = (state + 0x6D2B79F5) | 0;
      let n = Math.imul(state ^ (state >>> 15), 1 | state);
      n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
      return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
  }

  function surface(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
  }

  function ellipse(ctx, x, y, rx, ry, color, angle = 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, angle, 0, TAU);
    ctx.fill();
  }

  function paper() {
    const canvas = surface(192, 192);
    const ctx = canvas.getContext('2d');
    const noise = ctx.createImageData(canvas.width, canvas.height);
    const rand = random(73021);
    for (let i = 0; i < noise.data.length; i += 4) {
      const value = rand() < 0.49 ? 32 : 249;
      noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value;
      noise.data[i + 3] = rand() * 62;
    }
    ctx.putImageData(noise, 0, 0);
    return canvas;
  }

  function brushShape(ctx, x, y, rx, ry, rand, color) {
    const points = Array.from({ length: 14 }, (_, i) => {
      const angle = (i + rand() * 0.38) * TAU / 14;
      const radius = 0.85 + rand() * 0.24;
      return [x + Math.cos(angle) * rx * radius, y + Math.sin(angle) * ry * radius];
    });
    const last = points.at(-1);
    ctx.beginPath();
    ctx.moveTo((last[0] + points[0][0]) / 2, (last[1] + points[0][1]) / 2);
    for (let i = 0; i < points.length; i++) {
      const point = points[i], next = points[(i + 1) % points.length];
      ctx.quadraticCurveTo(point[0], point[1], (point[0] + next[0]) / 2, (point[1] + next[1]) / 2);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function fir(ctx, rand, colors) {
    const bend = (rand() - 0.5) * 16;
    for (let level = 0; level < 7; level++) {
      const y = 118 - level * 13.2;
      const width = (39 - level * 4.6) * (0.87 + rand() * 0.22);
      const x = 56 + bend * (level + 1) / 7;
      const top = y - 36 + level * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.quadraticCurveTo(x + width * 0.19, y - 15, x + width * 0.56, y - 6);
      ctx.lineTo(x + width * 0.39, y - 7);
      ctx.quadraticCurveTo(x + width * 0.7, y, x + width, y + 4);
      ctx.quadraticCurveTo(x + width * 0.73, y + 10, x + width * 0.35, y + 5);
      ctx.lineTo(x + width * 0.43, y + 12);
      ctx.quadraticCurveTo(x, y + 9, x - width * 0.27, y + 13);
      ctx.lineTo(x - width * 0.23, y + 7);
      ctx.quadraticCurveTo(x - width * 0.78, y + 10, x - width, y + 3);
      ctx.quadraticCurveTo(x - width * 0.63, y - 2, x - width * 0.44, y - 8);
      ctx.lineTo(x - width * 0.63, y - 6);
      ctx.quadraticCurveTo(x - width * 0.28, y - 15, x, top);
      const paint = ctx.createLinearGradient(x - width, y - 20, x + width * 0.66, y + 10);
      paint.addColorStop(0, colors[level < 4 ? 2 : 3]);
      paint.addColorStop(0.61, colors[1]);
      paint.addColorStop(1, colors[0]);
      ctx.fillStyle = paint;
      ctx.fill();
      ctx.globalAlpha = 0.38;
      for (let i = 0; i < 15; i++) {
        const t = rand(), side = rand() < 0.74 ? -1 : 1;
        ellipse(ctx, x + side * width * t * 0.82, y - 11 + t * 13 + rand() * 4,
          1 + rand() * 3, 0.38 + rand() * 1.05, colors[rand() < 0.65 ? 3 : 4], side * 0.26);
      }
      ctx.globalAlpha = 1;
    }
  }

  function broadleaf(ctx, rand, colors) {
    const crowns = [[56, 65, 38, 46], [75, 83, 29, 35], [31, 80, 24, 33], [53, 98, 31, 28],
      [38, 55, 27, 31], [64, 52, 30, 34], [77, 68, 23, 30], [52, 40, 26, 28], [39, 66, 22, 24]];
    ctx.save();
    ctx.translate(56, 73);
    ctx.rotate((rand() - 0.5) * 0.22);
    ctx.scale(0.89 + rand() * 0.15, 0.78 + rand() * 0.21);
    ctx.translate(-56, -73);
    for (let i = 0; i < crowns.length; i++) {
      const [cx, cy, width, height] = crowns[i];
      const x = cx + (rand() - 0.5) * 11, y = cy + (rand() - 0.5) * 9;
      const paint = ctx.createLinearGradient(x - width, y - height, x + width * 0.27, y + height);
      paint.addColorStop(0, colors[i < 4 ? 2 : 4]);
      paint.addColorStop(0.47, colors[i < 4 ? 1 : 3]);
      paint.addColorStop(1, colors[i < 4 ? 0 : 1]);
      brushShape(ctx, x, y, width, height, rand, paint);
      if (i < 4) continue;
      for (let j = 0; j < 26; j++) {
        const angle = rand() * TAU, radius = rand() * 0.82;
        ctx.globalAlpha = 0.17 + rand() * 0.33;
        ellipse(ctx, x + Math.cos(angle) * width * radius, y + Math.sin(angle) * height * radius - 2,
          1.1 + rand() * 3.4, 0.5 + rand() * 1.6, colors[rand() < 0.62 ? 4 : 2], -0.42 + rand() * 0.9);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function createTreeSprites(texture) {
    return palette.map((colors, colorIndex) => Array.from({ length: 4 }, (_, variant) => {
      const canvas = surface(224, 320);
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const rand = random(103144 + colorIndex * 19 + variant * 141);
      ctx.fillStyle = '#493e35';
      ctx.beginPath();
      ctx.moveTo(49, 150);
      ctx.quadraticCurveTo(53, 143, 51, 63);
      ctx.lineTo(59, 63);
      ctx.quadraticCurveTo(57, 142, 63, 149);
      ctx.quadraticCurveTo(57, 154, 49, 150);
      ctx.fill();
      ctx.fillStyle = '#9b805d';
      ctx.fillRect(53, 114, 2, 34);
      if (variant < 2) fir(ctx, rand, colors);
      else broadleaf(ctx, rand, colors);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = ctx.createPattern(texture, 'repeat');
      ctx.fillRect(0, 0, 112, 160);
      return canvas;
    }));
  }

  class ForestScene {
    constructor() {
      this.texture = paper();
      this.sprites = createTreeSprites(this.texture);
      this.trees = [];
      this.clearings = [];
    }

    naturalRiverAt(y) {
      const t = y / this.height;
      const { bend, scale } = this;
      const center = this.width * (0.695 - t * 0.29 + 0.072 * Math.sin(t * 9 + bend)
        + 0.024 * Math.sin(t * 17 - 0.15));
      const radius = scale * this.riverWidth * (34 + t * 47 + 6 * Math.sin(t * 20 + bend));
      return [center, Math.min(radius, this.width * 0.12)];
    }

    riverAt(y) {
      const [center, radius] = this.naturalRiverAt(y);
      const sample = clamp(y / this.riverRowHeight, 0, this.riverTo.length - 1);
      const row = Math.floor(sample);
      const next = Math.min(row + 1, this.riverTo.length - 1);
      const from = mix(this.riverFrom[row], this.riverFrom[next], sample - row);
      const to = mix(this.riverTo[row], this.riverTo[next], sample - row);
      return [center + mix(from, to, this.riverBlend), radius];
    }

    planRiver(icons, clearance) {
      const result = new Float64Array(this.riverTo.length);
      if (!icons.length) return result;

      // Candidate offsets follow the natural centerline. Reserve room for both banks and
      // the entire icon rectangle, including the label. Nearby rows choose a shared detour.
      const step = Math.max(9 * this.scale, this.width / 152);
      const padding = clamp(6 * this.scale + clearance * 0.28, 8, 34);
      const rows = Array.from(result, (_, i) => {
        const y = i * this.riverRowHeight;
        const [center, radius] = this.naturalRiverAt(y);
        const bank = radius * 1.36 + 13 * this.scale;
        const margin = bank + padding + step * 0.6;
        const edge = Math.min(this.width / 2, bank + 4 * this.scale);
        const vertical = padding + this.riverRowHeight;
        const blocked = icons
          .filter(icon => y >= icon.y - vertical && y <= icon.y + icon.h + vertical)
          .map(icon => [icon.x - margin, icon.x + icon.w + margin]);
        return { center, edge, blocked };
      });
      if (rows.every(({ center, blocked }) => !blocked.some(([left, right]) => center > left && center < right))) {
        return result;
      }

      const middle = Math.ceil(this.width / step);
      const count = middle * 2 + 1;
      const parents = new Int16Array(rows.length * count);
      let previous = new Float64Array(count);
      let costs = new Float64Array(count);
      for (let i = 0; i < rows.length; i++) {
        const { center, edge, blocked } = rows[i];
        for (let j = 0; j < count; j++) {
          const offset = j - middle;
          const x = center + offset * step;
          let cost = offset * offset * 0.18;
          const beyondEdge = Math.max(edge - x, x - (this.width - edge), 0);
          // On crowded desktops choose the least overlap if no corridor fits at full width.
          if (beyondEdge > 0) cost += 10000 + beyondEdge * 40;
          for (const [left, right] of blocked) {
            if (x > left && x < right) cost += 7000 + Math.min(x - left, right - x) * 25;
          }
          let best = Infinity;
          let parent = j;
          for (let k = Math.max(0, j - 4); k <= Math.min(count - 1, j + 4); k++) {
            const candidate = previous[k] + (j - k) ** 2 * 8;
            if (candidate < best) { best = candidate; parent = k; }
          }
          parents[i * count + j] = parent;
          costs[j] = cost + best;
        }
        [previous, costs] = [costs, previous];
      }
      let column = previous.reduce((lowest, value, i) => value < previous[lowest] ? i : lowest, middle);
      for (let i = rows.length - 1; i >= 0; i--) {
        result[i] = (column - middle) * step;
        column = parents[i * count + column];
      }

      // Round the bends without smoothing through the side of an icon chosen above.
      const limits = rows.map(({ center, edge, blocked }, i) => {
        let left = edge, right = this.width - edge;
        const x = center + result[i];
        for (const [start, end] of blocked) {
          if (x <= start) right = Math.min(right, start);
          else if (x >= end) left = Math.max(left, end);
          else return [result[i], result[i]];
        }
        return left <= x && x <= right ? [left - center, right - center] : [result[i], result[i]];
      });
      for (let pass = 0; pass < 4; pass++) {
        const before = result.slice();
        for (let i = 1; i < result.length - 1; i++) {
          const [left, right] = limits[i];
          result[i] = clamp(mix(before[i], (before[i - 1] + before[i + 1]) / 2, 0.66), left, right);
        }
      }
      return result;
    }

    updateRiver(icons, clearance, snap) {
      const next = this.planRiver(icons, clearance);
      if (next.every((offset, i) => offset === this.riverTo[i])) return;
      this.riverFrom = this.riverTo.map((offset, i) => mix(this.riverFrom[i], offset, this.riverBlend));
      this.riverTo = next;
      this.riverProgress = this.riverBlend = snap ? 1 : 0;
      this.riverDirty = true;
    }

    riverShape(ctx, points, widen, drift = 0, offset = 0) {
      ctx.beginPath();
      for (const [y, center, radius] of points) {
        ctx.lineTo(center + offset + drift * Math.sin(y * 0.041) - radius * widen, y);
      }
      for (let i = points.length - 1; i >= 0; i--) {
        const [y, center, radius] = points[i];
        ctx.lineTo(center + offset - drift * Math.cos(y * 0.036) + radius * widen, y);
      }
      ctx.closePath();
    }

    build(width, height, ratio, params) {
      this.width = width;
      this.height = height;
      this.scale = clamp(Math.sqrt(width * height / (1440 * 900)), 0.56, 1.4);
      const rand = random(params.seed);
      this.bend = (rand() - 0.5) * 1.55;
      this.riverWidth = params.stream;
      const rows = Math.max(1, Math.ceil(height / (11 * this.scale)));
      this.riverRowHeight = height / rows;
      this.riverFrom = new Float64Array(rows + 1);
      this.riverTo = new Float64Array(rows + 1);
      this.riverBlend = this.riverProgress = 1;
      this.riverDirty = true;
      this.riverLayer = surface(width * Math.min(ratio, 1), height * Math.min(ratio, 1));
      this.shoreSeed = (params.seed | 0) ^ 0x623f17;
      this.ground = surface(width * ratio, height * ratio);
      const layoutRatio = Math.min(ratio, 0.75);
      this.openGround = surface(width * layoutRatio, height * layoutRatio);
      this.mask = surface(width * layoutRatio, height * layoutRatio);
      this.layout = surface(width * layoutRatio, height * layoutRatio);
      this.previousLayout = surface(width * layoutRatio, height * layoutRatio);
      this.blend = 1;
      this.paintGround(rand);
      this.populate(rand);
    }

    paintGround(rand) {
      const { width, height, scale, ground, openGround } = this;
      const ctx = ground.getContext('2d'), open = openGround.getContext('2d');
      ctx.setTransform(ground.width / width, 0, 0, ground.height / height, 0, 0);
      open.setTransform(openGround.width / width, 0, 0, openGround.height / height, 0, 0);
      const terrain = ctx.createLinearGradient(0, 0, width, height * 0.61);
      terrain.addColorStop(0, '#456752');
      terrain.addColorStop(0.33, '#84925e');
      terrain.addColorStop(0.55, '#788c63');
      terrain.addColorStop(1, '#385e58');
      ctx.fillStyle = terrain;
      ctx.fillRect(0, 0, width, height);
      const neutral = open.createLinearGradient(width * 0.05, height * 0.03, width * 0.99, height);
      neutral.addColorStop(0, '#637751');
      neutral.addColorStop(0.44, '#8b9864');
      neutral.addColorStop(1, '#526f60');
      open.fillStyle = neutral;
      open.fillRect(0, 0, width, height);

      for (let i = 0; i < 125; i++) {
        const x = rand() * width, y = rand() * height, r = scale * (28 + rand() * 125);
        const wash = ctx.createRadialGradient(x, y, r * 0.06, x, y, r);
        wash.addColorStop(0, i % 3 === 0 ? 'rgba(216,195,116,.23)' : 'rgba(25,65,53,.22)');
        wash.addColorStop(1, 'rgba(91,122,75,0)');
        ctx.fillStyle = wash;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      const groundColors = ['#d8be76', '#b1bb7e', '#a0ab69', '#496e58', '#35584a', '#c4a66b'];
      for (let i = 0; i < 5000; i++) {
        const x = rand() * width, y = rand() * height;
        const length = scale * (0.6 + rand() * 4.5);
        const angle = (rand() - 0.5) * 1.6;
        const color = groundColors[Math.floor(rand() * groundColors.length)];
        ctx.globalAlpha = 0.11 + rand() * 0.25;
        ellipse(ctx, x, y, length, scale * (0.32 + rand() * 1.2), color, angle);
        open.globalAlpha = 0.15;
        ellipse(open, x, y, length * 0.64, scale * 0.56, color, angle);
      }

      for (const layer of [ctx, open]) {
        layer.globalAlpha = 0.39;
        layer.fillStyle = layer.createPattern(this.texture, 'repeat');
        layer.fillRect(0, 0, width, height);
        layer.globalAlpha = 1;
      }
    }

    paintRiver() {
      const { width, height, scale, riverLayer } = this;
      const ctx = riverLayer.getContext('2d');
      ctx.setTransform(riverLayer.width / width, 0, 0, riverLayer.height / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const points = [];
      for (let y = -15; y < height + 24; y += 7) points.push([y, ...this.riverAt(y)]);
      const water = ctx.createLinearGradient(width * 0.36, 0, width * 0.73, height);
      water.addColorStop(0, '#2d625d');
      water.addColorStop(0.55, '#367b72');
      water.addColorStop(1, '#4b9181');
      for (const [widen, drift, offset, color] of [
        [1.36, 8, 5, '#525d47'], [1.18, 6, 0, '#afac7b'], [1, 3.5, 0, '#82a595'],
        [0.84, 2, 2, water], [0.45, 4, 3, 'rgba(30,83,83,.22)'],
      ]) {
        this.riverShape(ctx, points, widen, drift * scale, offset * scale);
        ctx.fillStyle = color;
        ctx.fill();
      }

      const rand = random(this.shoreSeed);
      for (let i = 0; i < 230; i++) {
        const y = rand() * height;
        const [center, radius] = this.riverAt(y);
        const x = center + radius * (rand() - 0.5) * 1.45;
        ctx.globalAlpha = 0.11 + rand() * 0.25;
        ellipse(ctx, x, y, scale * (0.6 + rand() * 7), scale * (0.32 + rand() * 1.2),
          i % 3 === 0 ? '#bbd6b3' : '#2d665f', -1.11 + rand() * 0.45);
      }
      ctx.globalAlpha = 1;
      for (let i = 0; i < 165; i++) {
        const y = rand() * height;
        const [center, radius] = this.riverAt(y);
        const side = rand() < 0.5 ? -1 : 1;
        const x = center + side * radius * (0.87 + rand() * 1.25);
        const r = scale * (1 + rand() ** 2.6 * 8.2);
        if (i % 3 === 0) {
          brushShape(ctx, x + r * 0.3, y + r * 0.5, r * 1.43, r * 0.76, rand, '#4f6355');
          brushShape(ctx, x, y, r * 1.24, r * 0.76, rand, i % 2 ? '#9ea898' : '#a6ad93');
          ellipse(ctx, x - r * 0.22, y - r * 0.16, r * 0.71, r * 0.22, '#c6c9aa', -0.19);
        } else {
          for (let j = -1; j <= 1; j++) {
            ellipse(ctx, x + j * r, y - rand() * r, Math.max(0.7, r * 0.25), r * 1.4,
              i % 2 ? '#c5af6d' : '#476c54', j * 0.49);
          }
        }
      }

      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.39;
      ctx.fillStyle = ctx.createPattern(this.texture, 'repeat');
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      for (const tree of this.trees) {
        const [center, radius] = this.riverAt(tree.y - tree.height * 0.21);
        tree.dryness = smooth(8 * scale, 31 * scale, Math.abs(tree.x - center) - radius);
      }
      this.riverDirty = false;
    }

    populate(rand) {
      const { width, height, scale } = this, spacing = 49 * scale;
      this.trees.length = 0;
      for (let y = -spacing; y < height + spacing * 2; y += spacing * 0.84) {
        for (let x = -spacing; x < width + spacing; x += spacing) {
          const px = x + rand() * spacing * 1.12, py = y + rand() * spacing * 0.93;
          const treeHeight = scale * (44 + rand() ** 1.17 * 88 + 19 * clamp(py / height));
          const grove = 0.5 + Math.sin(px / (126 * scale) + py / (173 * scale)) *
            Math.cos(py / (122 * scale) - px / (279 * scale)) * 0.5;
          if (rand() < 0.08) continue;
          const color = rand() < 0.085 && grove > 0.29 ? 5 : Math.floor(rand() * 5);
          const variant = rand() < 0.61 && color !== 5 ? Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2);
          this.trees.push({
            x: px, y: py, height: treeHeight, width: treeHeight * (variant < 2 ? 0.67 : 0.8),
            sprite: this.sprites[color][variant], phase: rand() * TAU, stiffness: 0.62 + rand() * 0.7,
            rank: clamp(rand() * 0.76 + (1 - grove) * 0.25), grow: 0, want: 0,
          });
        }
      }
      this.trees.sort((a, b) => a.y - b.y);
      this.glints = Array.from({ length: 86 }, () => ({
        y: rand(), u: (rand() - 0.5) * 1.52, length: 2.5 + rand() * 16, phase: rand() * TAU,
      }));
      this.pollen = Array.from({ length: 38 }, () => ({
        x: rand(), y: rand(), size: 0.6 + rand() * 1.22, phase: rand() * TAU,
      }));
    }

    setLayout(icons, clearance, density, snap) {
      this.updateRiver(icons, clearance, snap);
      if (!snap) {
        // Keep the visible intermediate state when another icon moves during a transition.
        const previous = this.previousLayout.getContext('2d');
        const blend = smooth(0, 1, this.blend);
        previous.globalCompositeOperation = 'copy';
        previous.globalAlpha = 1 - blend;
        previous.drawImage(this.previousLayout, 0, 0);
        previous.globalCompositeOperation = 'lighter';
        previous.globalAlpha = blend;
        previous.drawImage(this.layout, 0, 0);
        previous.globalCompositeOperation = 'source-over';
        previous.globalAlpha = 1;
      }
      this.blend = snap ? 1 : 0;
      const { width, height, mask, layout, trees } = this;
      const ctx = mask.getContext('2d');
      ctx.setTransform(mask.width / width, 0, 0, mask.height / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      this.clearings = icons.map(icon => {
        const x = icon.x + icon.w / 2, y = icon.y + icon.h / 2;
        const rx = Math.hypot(icon.w * 0.61, icon.h * 0.23) + clearance;
        const ry = Math.hypot(icon.h * 0.61, icon.w * 0.23) + clearance;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(rx, ry);
        const fade = ctx.createRadialGradient(0, 0, 0.43, 0, 0, 1.33);
        fade.addColorStop(0, '#fff');
        fade.addColorStop(0.52, 'rgba(255,255,255,.91)');
        fade.addColorStop(0.78, 'rgba(255,255,255,.52)');
        fade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = fade;
        ctx.fillRect(-1.33, -1.33, 2.66, 2.66);
        ctx.restore();
        return { x, y, rx, ry };
      });
      const composite = layout.getContext('2d');
      composite.globalCompositeOperation = 'copy';
      composite.drawImage(this.openGround, 0, 0);
      composite.globalCompositeOperation = 'destination-in';
      composite.drawImage(mask, 0, 0);
      composite.globalCompositeOperation = 'source-over';
      for (const tree of trees) {
        tree.want = tree.rank <= density && !this.blocksCanopy(tree) ? 1 : 0;
        if (snap) tree.grow = tree.want;
      }
    }

    advance(seconds, snap) {
      this.blend = snap ? 1 : Math.min(1, this.blend + seconds * 2.2);
      let moving = this.blend < 1;
      if (this.riverProgress < 1) {
        this.riverProgress = snap ? 1 : Math.min(1, this.riverProgress + seconds * 2);
        this.riverBlend = smooth(0, 1, this.riverProgress);
        this.riverDirty = true;
        moving = true;
      }
      for (const tree of this.trees) {
        if (tree.grow === tree.want) continue;
        const step = seconds * (tree.want ? 1.8 : 2.9);
        tree.grow = snap ? tree.want : tree.want ? Math.min(1, tree.grow + step) : Math.max(0, tree.grow - step);
        moving = true;
      }
      return moving;
    }

    blocksCanopy(tree) {
      const y = tree.y - tree.height * 0.43;
      return this.clearings.some(clearing => {
        const dx = (tree.x - clearing.x) / (clearing.rx + tree.width * 0.24);
        const dy = (y - clearing.y) / (clearing.ry + tree.height * 0.32);
        return dx * dx + dy * dy < 1.14;
      });
    }

    paint(ctx, pixelsX, pixelsY, time) {
      const { width, height, ground, layout, scale } = this;
      if (this.riverDirty) this.paintRiver();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(ground, 0, 0, pixelsX, pixelsY);
      const blend = smooth(0, 1, this.blend);
      if (blend < 1) {
        ctx.globalAlpha = 1 - blend;
        ctx.drawImage(this.previousLayout, 0, 0, pixelsX, pixelsY);
      }
      ctx.globalAlpha = blend;
      ctx.drawImage(layout, 0, 0, pixelsX, pixelsY);
      ctx.globalAlpha = 1;
      ctx.drawImage(this.riverLayer, 0, 0, pixelsX, pixelsY);
      const sx = pixelsX / width, sy = pixelsY / height;
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.lineCap = 'round';
      for (const glint of this.glints) {
        const y = (glint.y + time * 0.035) % 1 * height;
        const [center, radius] = this.riverAt(y);
        const x = center + radius * glint.u;
        if (this.clearings.some(c => ((x - c.x) / c.rx) ** 2 + ((y - c.y) / c.ry) ** 2 < 1.35)) continue;
        const opacity = (0.5 + 0.5 * Math.sin(y * 0.021 + glint.phase - time * 0.9)) ** 2;
        ctx.globalAlpha = opacity * 0.39;
        ctx.strokeStyle = '#d0e1b8';
        ctx.lineWidth = scale * 0.73;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + glint.length * scale * 0.48, y - scale, x + glint.length * scale, y);
        ctx.stroke();
      }
      for (const tree of this.trees) {
        if (tree.grow <= 0 || tree.dryness <= 0) continue;
        ctx.globalAlpha = tree.grow * tree.dryness * 0.21;
        ellipse(ctx, tree.x + tree.width * 0.21, tree.y - tree.height * 0.07,
          tree.width * 0.58, tree.height * 0.11, '#243f39', -0.29);
      }
      for (const tree of this.trees) {
        if (tree.grow <= 0 || tree.dryness <= 0) continue;
        const sway = Math.sin(time * 1.43 * tree.stiffness + tree.phase) * 0.019
          + Math.sin(time * 0.87 + tree.x * 0.007 + tree.y * 0.019) * 0.032;
        const growth = 0.60 + tree.grow * 0.40;
        ctx.setTransform(sx, 0, sway * sx, sy, tree.x * sx, tree.y * sy);
        ctx.globalAlpha = tree.grow * tree.dryness;
        ctx.drawImage(tree.sprite, -tree.width * growth / 2, -tree.height * growth * 0.93,
          tree.width * growth, tree.height * growth);
      }
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      for (const mote of this.pollen) {
        const x = (mote.x * width + time * 12 * scale) % width;
        const y = mote.y * height + scale * 7 * Math.sin(time * 0.77 + mote.phase);
        ctx.globalAlpha = 0.16 + 0.45 * smooth(-0.3, 1, Math.sin(time * 1.3 + mote.phase));
        ellipse(ctx, x, y, mote.size * scale, mote.size * scale * 0.74, '#f6e2a3', -0.37);
      }
      ctx.globalAlpha = 1;
    }
  }

  window.ForestScene = ForestScene;
})();
