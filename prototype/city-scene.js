(() => {
  const { tau, clamp, random, surface, ellipse, shape, gradient, grain, clearOfIcons, CachedScene } = Scenery;
  const roofs = ['#857f66', '#a27c5f', '#a05f50', '#706c57', '#9d8b65'];

  function houseSprite(index) {
    const canvas = surface(94, 102);
    const ctx = canvas.getContext('2d');
    const rand = random(730 + index * 29);
    const ink = '#594e3c';
    const wide = 15 + index % 3 * 3;
    const peak = 27 + index % 4 * 5;
    ctx.translate(43, 74);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.5;
    ellipse(ctx, 8, 6, 25, 5, '#6f644337');
    shape(ctx, [[-wide, 5], [-wide, -16], [0, -peak], [wide, -17], [wide, 5]], '#f4e7bd', ink);
    shape(ctx, [[wide, 5], [wide, -17], [wide + 14, -25], [wide + 14, -3]], '#d7c69d', ink);
    shape(ctx, [[-wide - 3, -16], [0, -peak - 7], [wide + 4, -17], [wide, -13], [0, -peak - 2], [-wide, -11]],
      roofs[index % roofs.length], ink);
    shape(ctx, [[0, -peak - 7], [14, -peak - 13], [wide + 17, -26], [wide + 4, -17]],
      roofs[index % roofs.length], ink);
    for (let i = 0; i < 5; i++) {
      const x = 6 + i * 3.4;
      shape(ctx, [[x, -peak - 4 + (x - 6) * 0.35], [x + 5, -peak - 8 + (x - 6) * 0.40]], null, '#ede0af76');
    }
    ctx.fillStyle = '#726450';
    ctx.fillRect(-2.7, -6.5, 6, 11.2);
    for (const x of [-wide * 0.62, wide * 0.48, wide + 5]) {
      ctx.fillStyle = '#71624b';
      ctx.fillRect(x, -10, 3.3, 4.6);
    }
    if (index % 2 === 0) {
      shape(ctx, [[-wide, -9], [wide, -9], [wide + 2, -4], [-wide - 2, -4]], '#ab7059', ink);
      for (let x = -wide + 1; x < wide; x += 5.3) {
        ctx.fillStyle = '#e2bd8a';
        ctx.fillRect(x, -8.5, 2.3, 3.7);
      }
    }
    for (let i = 0; i < 23; i++) {
      ctx.fillStyle = '#7e6b4a43';
      ctx.fillRect(-wide + rand() * wide * 2, -13 + rand() * 16, 1 + rand() * 1.4, 0.65);
    }
    return canvas;
  }

  function pointDistance(x, y, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy));
    return Math.hypot(x - a.x - t * dx, y - a.y - t * dy);
  }

  function nearCanal(routes, x, y, gap) {
    return routes.some(({ points, transverse, step }) => {
      const along = transverse ? x : y;
      const first = Math.max(0, Math.floor((along - gap) / step));
      const last = Math.min(points.length - 2, Math.floor((along + gap) / step));
      for (let i = first; i <= last; i++) {
        if (pointDistance(x, y, points[i], points[i + 1]) < gap) return true;
      }
      return false;
    });
  }

  function planCanal(width, height, scale, transverse, preferred, clear) {
    const depth = transverse ? width : height, breadth = transverse ? height : width;
    const bank = 16.5 * scale, inset = bank + 3 * scale;
    const target = Math.max(5, 8 * scale);
    if (breadth <= inset * 2) return null;
    const columns = Math.ceil((breadth - 2 * inset) / target) + 1;
    const rows = Math.ceil(depth / target) + 1;
    if (rows < 2 || columns < 2) return null;
    const step = depth / (rows - 1), across = (breadth - 2 * inset) / (columns - 1);
    const back = new Int16Array(columns * rows).fill(-1);
    let old = new Float32Array(columns).fill(Infinity);
    let next = new Float32Array(columns);
    const point = (cross, along) => transverse ? { x: along, y: cross } : { x: cross, y: along };
    const passes = (cross, along) => {
      const { x, y } = point(cross, along);
      return clear(x, y);
    };

    // Find the least-detour route across successive rows without cutting across an obstacle.
    for (let row = 0; row < rows; row++) {
      next.fill(Infinity);
      const along = row * step;
      const ideal = preferred(along, depth, breadth);
      let reachable = false;
      for (let col = 0; col < columns; col++) {
        const cross = inset + col * across;
        if (!passes(cross, along)) continue;
        const edge = Math.min(cross, breadth - cross);
        const cost = 2.8 * ((cross - ideal) / breadth) ** 2 + Math.max(0, 1 - edge / (50 * scale)) * 0.85;
        if (!row) {
          next[col] = cost * 4;
          reachable = true;
          continue;
        }
        for (let prev = Math.max(0, col - 3); prev <= Math.min(columns - 1, col + 3); prev++) {
          const offset = col - prev;
          const total = old[prev] + cost + 0.12 * offset * offset;
          if (total >= next[col] || !passes(cross - offset * across * 0.5, along - step * 0.5)) continue;
          next[col] = total;
          back[row * columns + col] = prev;
          reachable = true;
        }
      }
      if (!reachable) return null;
      [old, next] = [next, old];
    }

    let last = 0;
    for (let col = 1; col < columns; col++) if (old[col] < old[last]) last = col;
    const cross = Array(rows);
    for (let row = rows - 1; row >= 0; row--) {
      cross[row] = inset + last * across;
      last = back[row * columns + last];
    }

    // Round grid corners while retaining the full channel clearance.
    for (let pass = 0; pass < 9; pass++) {
      for (let row = 1; row < rows - 1; row++) {
        const a = cross[row - 1], b = cross[row + 1], y = row * step;
        const smoothed = (a + 2 * cross[row] + b) * 0.25;
        if (passes(smoothed, y) && passes((a + smoothed) * 0.5, y - step * 0.5) &&
          passes((smoothed + b) * 0.5, y + step * 0.5)) cross[row] = smoothed;
      }
    }
    const points = cross.map((x, row) => point(x, row * step));
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
      lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    }
    return { points, lengths, transverse, step, length: lengths.at(-1) };
  }

  function alongCanal({ points, lengths }, distance) {
    let first = 0, last = lengths.length - 1;
    while (last - first > 1) {
      const middle = (last + first) >> 1;
      if (lengths[middle] <= distance) first = middle;
      else last = middle;
    }
    const a = points[first], b = points[last];
    const t = (distance - lengths[first]) / (lengths[last] - lengths[first]);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
      bearing: Math.atan2(b.x - a.x, b.y - a.y) };
  }

  class TownScene extends CachedScene {
    constructor() {
      super();
      this.houses = Array.from({ length: 8 }, (_, i) => houseSprite(i));
    }

    prepare(params) {
      const { w, h, scale } = this;
      const rand = random(params.seed);
      this.phase = rand() * tau;
      this.lawns = new WorldMapTerrain(w, h, params.seed, 'empty');
      this.paper = surface(this.current.width, this.current.height);
      this.turf = surface(this.current.width, this.current.height);
      const ctx = this.paper.getContext('2d');
      ctx.scale(this.paper.width / w, this.paper.height / h);
      ctx.fillStyle = gradient(ctx, 0, 0, w * 0.3, h, ['#f7efd0', '#eee2b9', '#e6d4a7']);
      ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, rand, ['#8b795326', '#fff5d158', '#6b5d4218'], Math.min(21000, w * h / 52));
      const turfRand = random(params.seed ^ 148619);
      const turf = this.turf.getContext('2d');
      turf.scale(this.turf.width / w, this.turf.height / h);
      turf.fillStyle = gradient(turf, 0, 0, w * 0.38, h, ['#cbd39b', '#b5c289', '#a8ba83']);
      turf.fillRect(0, 0, w, h);
      for (let i = 0; i < 48; i++) {
        const x = turfRand() * w, y = turfRand() * h, r = (28 + turfRand() * 106) * scale;
        const wash = turf.createRadialGradient(x, y, 0, x, y, r);
        wash.addColorStop(0, i % 3 ? '#7d9b5e43' : '#e5e5ad91');
        wash.addColorStop(1, '#bac88e00');
        ellipse(turf, x, y, r, r, wash);
      }
      grain(turf, w, h, turfRand, ['#62784c4a', '#eddfa46c', '#93ad6c65'], Math.min(17500, w * h / 54));
      this.blocks = [];
      const amount = Math.min(410, Math.round(w * h / (scale * scale * 4260)));
      for (let i = 0; i < amount * 6 && this.blocks.length < amount; i++) {
        const x = rand() * w, y = rand() * h, size = (39 + rand() * 23) * scale;
        const grove = 0.68 + 0.28 * Math.sin(x / (112 * scale) + y / (154 * scale)) *
          Math.sin(y / (138 * scale) - x / (233 * scale));
        if (rand() > grove || this.blocks.some(p => Math.hypot(x - p.x, (y - p.y) * 1.38) < (p.size + size) * 0.32)) continue;
        this.blocks.push({ x, y, size, which: Math.floor(rand() * this.houses.length), green: rand() < 0.19, hue: rand() });
      }
      this.blocks.sort((a, b) => a.y - b.y);
      this.grass = Array.from({ length: Math.min(760, amount * 2) }, () => ({
        x: rand() * w, y: rand() * h, s: (1.3 + rand() * 3.4) * scale, phase: rand() * tau,
      }));
    }

    planCanals() {
      const { w, h, scale, lawns } = this;
      const canals = [];
      const bank = 16.5 * scale;
      const clear = (x, y) => clearOfIcons(this.icons, x, y, bank + 5 * scale, bank + 5 * scale) &&
        !nearCanal(canals, x, y, bank * 2 + 5 * scale);
      const outsideLawns = (x, y) => lawns.at(x, y) < -(bank + 5 * scale) && clear(x, y);
      for (let index = 0; index < Math.round(this.settings.canals); index++) {
        const preferred = (along, depth, breadth) => breadth *
          (0.32 + index * 0.40 + 0.10 * Math.sin(along / depth * 5.8 + this.phase + index)) - along * 0.09;
        const route = planCanal(w, h, scale, false, preferred, outsideLawns) ||
          planCanal(w, h, scale, true, preferred, outsideLawns) ||
          planCanal(w, h, scale, false, preferred, clear) ||
          planCanal(w, h, scale, true, preferred, clear);
        if (route) canals.push(route);
      }
      return canals;
    }

    drawLayout(ctx, sigma) {
      const { w, h, scale, lawns } = this;
      lawns.setIcons(this.icons, sigma, true);
      this.canals = this.planCanals();
      const lawn = lawns.outline();
      ctx.drawImage(this.paper, 0, 0, w, h);
      ctx.save();
      ctx.clip(lawn, 'evenodd');
      ctx.drawImage(this.turf, 0, 0, w, h);
      ctx.restore();

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const { points } of this.canals) {
        ctx.beginPath();
        for (const { x, y } of points) ctx.lineTo(x, y);
        for (const [width, color] of [[33, '#877e58'], [29, '#c3bd85'], [22, '#849e69'], [13, '#9db078']]) {
          ctx.lineWidth = width * scale;
          ctx.strokeStyle = color;
          ctx.stroke();
        }
      }

      for (const { x, y, s, phase } of this.grass) {
        if (nearCanal(this.canals, x, y, 18 * scale + s)) continue;
        const tint = lawns.at(x, y) > 0 ? '#607c4d8b' : phase < 3 ? '#79824f87' : '#88935b72';
        const lean = s * Math.sin(phase) * 0.6;
        ctx.strokeStyle = tint;
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        for (let j = -1; j <= 1; j++) {
          ctx.moveTo(x + j * s * 0.45, y);
          ctx.quadraticCurveTo(x + j * s * 0.53 + lean * 0.34, y - s * 0.48,
            x + j * s * 0.8 + lean, y - s * (j ? 0.75 : 1.15));
        }
        ctx.stroke();
      }
      let count = 0;
      for (const { x, y, size, which, green, hue } of this.blocks) {
        if (lawns.at(x, y - size * 0.24) > -size * 0.54 ||
          !clearOfIcons(this.icons, x, y - size * 0.22, size * 0.40, size * 0.42) ||
          nearCanal(this.canals, x, y - size * 0.19, 19 * scale + size * 0.45)) continue;
        count++;
        if (green) {
          for (let i = 0; i < (hue < 0.55 ? 2 : 3); i++) {
            const tx = x + (i - 1) * size * 0.18;
            const ty = y - Math.sin(i * 3.2 + hue * tau) * size * 0.12;
            const r = size * (0.095 + 0.045 * Math.sin(hue * 8 + i));
            ellipse(ctx, tx + 2.5 * scale, ty - 1.5 * scale, r * 1.1, r * 0.72, '#875f352c');
            ellipse(ctx, tx, ty - 4 * scale, r, r * 0.92,
              hue < 0.47 ? '#9ea676' : '#abb17e');
          }
        } else {
          ctx.drawImage(this.houses[which], x - size * 0.47, y - size * 0.74, size, size * 1.07);
        }
      }
      this.visibleBuildings = count;
    }

    animate(ctx, clock) {
      const { scale } = this;
      for (const [index, route] of this.canals.entries()) {
        for (let boat = 0; boat < 2; boat++) {
          const distance = (clock * (7 + boat * 2.3) + route.length * (0.2 + boat * 0.43 + index * 0.09)) %
            (route.length + 36 * scale) - 18 * scale;
          const { x, y, bearing } = alongCanal(route, distance);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-bearing);
          ctx.lineWidth = 0.9 * scale;
          shape(ctx, [[-2 * scale, -8 * scale], [-3.1 * scale, 5 * scale], [0, 9.5 * scale],
            [3.2 * scale, 5 * scale], [2 * scale, -8 * scale]], '#8c644a', '#654b39');
          ellipse(ctx, 0, -1.5 * scale, 1.5 * scale, 2.5 * scale, '#e3c696');
          ctx.restore();
        }
      }
    }
  }

  window.wallpaperScene = {
    scene: new TownScene(),
    defaults: { seed: 845023, adaptive: 1, sigma: 30, wind: 1, canals: 1 },
    ranges: { sigma: [3, 105], wind: [0, 2], canals: [0, 2] },
    demoHint: 'Drag an icon to move its lawn and redirect the canal',
  };
})();
