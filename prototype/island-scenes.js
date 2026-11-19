/* Three original island treatments on the same adaptive shoreline geometry. */
(() => {
  const { tau, clamp, random, surface, ellipse, shape, gradient, grain, clearOfIcons, CachedScene } = Scenery;
  const palette = {
    ocean: {
      water: ['#448ccc', '#256dc2', '#153a87'],
      land: ['#d8d6a2', '#8cab72', '#4a866e'],
      coast: [[54, '#7ce1e630'], [24, '#5ac1d77d'], [9, '#c5e9df87']],
      marks: ['#aadce1bc', '#457850a9', '#ecf1bf70'],
    },
    maldives: {
      water: ['#56daca', '#169fba', '#087898'],
      land: ['#fff5db', '#eddbb4', '#ddc395'],
      coast: [[120, '#81edce38'], [75, '#a4f6d45c'], [43, '#bcf1cf85'], [19, '#d9f2dc96']],
      marks: ['#e6ffeeaf', '#af957170', '#fff8dbac'],
    },
    nauticalmap: {
      water: ['#ecdcaa', '#eddbaf', '#c9aa77'],
      land: ['#e7cb91', '#ceb078', '#c39557'],
      coast: [[28, '#a9814d23'], [15, '#f6eabc80'], [8, '#8f663c47'], [1.9, '#765334']],
      marks: ['#85613a72', '#7753349e', '#f4dc9b81'],
    },
  };

  function sailSprite(chart) {
    const canvas = surface(138, 120);
    const ctx = canvas.getContext('2d');
    ctx.translate(69, 63);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.65;
    if (chart) {
      for (const [x, h] of [[-25, 34], [1, 52], [26, 39]]) {
        shape(ctx, [[x, 21], [x, -h]], null, '#503726');
        shape(ctx, [[x, -h], [x + 11, -h + 2], [x, -h + 7]], '#a4633b', '#7c5138');
        ctx.beginPath();
        ctx.moveTo(x - 10, -h + 9);
        ctx.quadraticCurveTo(x - 5, -h + 26, x - 10, -h + 34);
        ctx.quadraticCurveTo(x + 8, -h + 37, x + 16, -h + 28);
        ctx.quadraticCurveTo(x + 14, -h + 13, x + 9, -h + 10);
        ctx.closePath();
        ctx.fillStyle = '#f4e2b0';
        ctx.fill();
        ctx.strokeStyle = '#755139';
        ctx.stroke();
      }
      shape(ctx, [[-48, 13], [-21, 17], [30, 15], [52, 7], [41, 26], [-27, 29]], '#84573a', '#543826');
      shape(ctx, [[-31, 22], [29, 21], [42, 17]], null, '#d3a56c');
    } else {
      shape(ctx, [[-27, 3], [16, 29], [46, 43], [29, -24], [5, -42]], '#10375246');
      shape(ctx, [[-48, 7], [-24, -5], [29, -8], [47, 1], [28, 13], [-34, 15]], '#ecf6ed', '#406b78');
      shape(ctx, [[-35, 7], [22, 2], [32, 5], [-33, 12]], '#84a3a0');
      shape(ctx, [[-9, -47], [-15, 13]], null, '#584e44');
      shape(ctx, [[-9, -46], [-12, 9], [-39, 6], [-25, -12]], '#f5f9ed', '#7796a3');
      shape(ctx, [[-5, -36], [-8, 5], [31, -4], [12, -21]], '#dfedf2', '#91adb1');
    }
    return canvas;
  }

  function palmCrown(lagoon, seed) {
    const canvas = surface(168, 152);
    const ctx = canvas.getContext('2d');
    const rand = random(seed);
    ctx.translate(84, 76);
    ctx.scale(3.5, 3.5);
    for (let i = 0; i < 8; i++) {
      const angle = (i + rand() * 0.44) * tau / 8;
      const length = 12.4 + rand() * 6.3, width = 2.2 + rand() * 1.0;
      const bend = 2.5 + rand() * 2.4;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(length * 0.35, -width * 1.4, length * 0.82, bend - width * 1.5, length, bend);
      ctx.quadraticCurveTo(length * 0.51, bend + width * 0.68, 0, 0);
      ctx.fillStyle = gradient(ctx, 0, -width, length, bend + 2,
        i % 3 === 0 ? ['#42795d', '#548b65', '#8bbb76'] :
          lagoon ? ['#285c4d', '#4a8c5c', '#7fa968'] : ['#235850', '#387961', '#69a37b']);
      ctx.fill();
      ctx.strokeStyle = '#aedc856b';
      ctx.lineWidth = 0.38;
      ctx.beginPath();
      ctx.moveTo(0.4, 0);
      ctx.quadraticCurveTo(length * 0.52, -1.9, length - 0.4, bend - 0.23);
      ctx.stroke();
      ctx.strokeStyle = '#204e445b';
      ctx.beginPath();
      for (let j = 1; j < 7; j++) {
        const t = j / 8;
        const y = bend * t * t;
        ctx.moveTo(length * t, y);
        ctx.lineTo(length * t + 1.8, y + Math.sin(t * Math.PI) * width);
      }
      ctx.stroke();
      ctx.restore();
    }
    ellipse(ctx, 0, 0, 1.9, 1.9, '#345d41');
    ellipse(ctx, -0.7, -0.7, 0.9, 0.74, '#a3b06c');
    return canvas;
  }

  function palm(ctx, site, scale, clock, crown) {
    const { x, y, phase } = site;
    const s = site.s * scale;
    const wind = Math.sin(clock * 1.67 + phase) * 0.64 +
      Math.sin(clock * 0.71 + x * 0.009 + y * 0.014) * 0.48;
    const bend = 4.1 + wind * 4.9;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((phase - Math.PI) * 0.097);
    ctx.scale(s, s);
    ellipse(ctx, 6 + wind * 2.5, 1.5, 13, 4.5, '#315d513e');
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.65;
    ctx.strokeStyle = '#8e7954';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-3.9 + wind * 0.8, -9.8, bend, -21.6);
    ctx.stroke();
    ctx.lineWidth = 0.65;
    ctx.strokeStyle = '#debf88a4';
    ctx.beginPath();
    ctx.moveTo(-0.8, -0.2);
    ctx.quadraticCurveTo(-4.7 + wind * 0.8, -9.8, bend - 0.5, -21.6);
    ctx.stroke();
    ctx.translate(bend, -21.6);
    ctx.rotate(wind * 0.17);
    ctx.transform(1, 0, wind * 0.1, 0.82 + wind * 0.047, 0, 0);
    ctx.drawImage(crown, -24, -21.7, 48, 43.4);
    ctx.restore();
  }

  function scatterFoam(terrain, points, reach, inset, scale, seed) {
    const rand = random(seed);
    const spacing = clamp(1.72 * Math.sqrt(scale), 1.2, 2.2);
    const start = -inset - 3 * scale;
    const rows = Math.ceil((reach - start) / spacing);
    const columns = [];
    let nextSample = 0;

    // Keep a fixed random grain field, as in the Beach shader. The moving froth mask
    // reveals different grains, instead of carrying a row of drawn dots with the crest.
    for (let i = 0; i < points.length; i++) {
      const p = points[i], q = points[(i + 1) % points.length];
      const length = Math.hypot(q.x - p.x, q.y - p.y);
      for (; nextSample < length; nextSample += spacing) {
        const along = nextSample / length;
        const x = p.x + (q.x - p.x) * along, y = p.y + (q.y - p.y) * along;
        const nx = p.nx + (q.nx - p.nx) * along, ny = p.ny + (q.ny - p.ny) * along;
        const outward = p.outward + (q.outward - p.outward) * along;
        const runup = p.runup + (q.runup - p.runup) * along;
        const angle = p.a + along * tau / points.length;
        const grains = new Float32Array(rows * 5);
        for (let row = 0; row < rows; row++) {
          const depth = start + (row + rand()) * spacing;
          if (depth > outward || depth < -runup - 2.4 * scale) continue;
          const jitter = (rand() - 0.5) * spacing;
          const gx = x + nx * depth - ny * jitter, gy = y + ny * depth + nx * jitter;
          if (depth > 3 * scale && terrain.at(gx, gy) > 0) continue;
          const k = row * 5;
          grains[k] = depth;
          grains[k + 1] = gx;
          grains[k + 2] = gy;
          grains[k + 3] = (0.54 + rand() * 0.94) * Math.sqrt(scale);
          grains[k + 4] = rand();
        }
        columns.push({ angle, runup, grains });
      }
      nextSample -= length;
    }
    return { columns, start, spacing, rows };
  }

  function traceSurf(terrain, rings, scale, lagoon, seed) {
    const reach = (lagoon ? 55 : 69) * scale;
    const inset = (lagoon ? 10 : 8) * scale;
    const derivative = terrain.step * 0.78;
    return rings.filter(ring => ring.length > 9).map((ring, index) => {
      const points = ring.map(({ x, y }, i) => {
        // Use the same midpoints as the smoothed outline and the terrain gradient for outward normals.
        const next = ring[(i + 1) % ring.length];
        x = (x + next.x) / 2;
        y = (y + next.y) / 2;
        const gx = terrain.at(x + derivative, y) - terrain.at(x - derivative, y);
        const gy = terrain.at(x, y + derivative) - terrain.at(x, y - derivative);
        const length = Math.hypot(gx, gy) || 1;
        const nx = -gx / length, ny = -gy / length;
        let outward = reach;
        for (let d = 6 * scale; d < reach; d += 6 * scale) {
          if (terrain.at(x + nx * d, y + ny * d) < -0.4 * scale) continue;
          outward = Math.max(0, d - 6 * scale);
          break;
        }
        const a = i * tau / ring.length;
        return { x, y, nx, ny, outward, a,
          runup: inset * (0.57 + 0.36 * Math.sin(a * 3 + index) ** 2) };
      });
      const { x, y } = points[0];
      const foam = scatterFoam(terrain, points, reach, inset, scale, seed ^ (index + 1) * 719);
      return { points, phase: ((x * 0.0031 + y * 0.0025) % 1 + 1) % 1, reach, foam };
    });
  }

  function strokeWash(ctx, points, front) {
    ctx.beginPath();
    for (const p of points) ctx.lineTo(p.x + p.nx * front * p.runup, p.y + p.ny * front * p.runup);
    ctx.closePath();
    ctx.stroke();
  }

  function paintSurf(ctx, shore, clock, scale, lagoon, opacity) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fffefd';
    for (const contour of shore) {
      const { columns, start, spacing, rows } = contour.foam;
      for (let wave = 0; wave < 2; wave++) {
        const age = (clock * (lagoon ? 0.21 : 0.24) + contour.phase + wave * 0.5) % 1;
        const onSand = age >= 0.74;
        const washAge = clamp((age - 0.74) / 0.26);
        const wash = Math.sin(washAge ** 0.72 * Math.PI);
        const approach = (1 - Math.min(age / 0.74, 1)) ** 1.18;
        const breaking = 1 - approach;
        const strength = clamp(age / 0.25) * clamp((1 - age) / 0.15);
        const width = (1.75 + 2.4 * breaking) * scale;
        const trailLength = (10 + 18 * breaking) * scale;
        if (onSand) {
          ctx.globalAlpha = opacity * wash * 0.18;
          ctx.strokeStyle = lagoon ? '#b68e61' : '#af9e6b';
          ctx.lineWidth = (7 + 3 * wash) * scale;
          strokeWash(ctx, contour.points, -wash * 0.60);
        }
        ctx.beginPath();
        for (const { angle, runup, grains } of columns) {
          const roll = Math.sin(angle * 7 - clock * 1.06) + 0.5 * Math.cos(angle * 21 + clock * 1.4);
          const front = (onSand ? -wash * runup : approach * contour.reach) + roll * (2.2 + breaking) * scale;
          const patch = 0.70 + 0.23 * Math.sin(angle * 11 + clock * 0.63) + 0.07 * roll;
          const first = Math.max(0, Math.floor((front - width - start) / spacing));
          const end = Math.min(rows, Math.ceil((front + trailLength - start) / spacing));
          for (let k = first * 5; k < end * 5; k += 5) {
            const size = grains[k + 3];
            if (!size) continue;
            const delta = grains[k] - front;
            const crest = Math.max(0, 1 - Math.abs(delta) / width);
            const falloff = delta < 0 ? 0 : Math.max(0, 1 - delta / trailLength);
            const spray = falloff ** 3 * (0.23 + 0.40 * breaking);
            const amount = strength * patch * Math.max(crest * 0.86, spray) - grains[k + 4];
            if (amount <= 0) continue;
            const diameter = size * Math.min(1.18, 0.36 + amount * 4.1);
            ctx.rect(grains[k + 1] - diameter / 2, grains[k + 2] - diameter / 2, diameter, diameter);
          }
        }
        ctx.globalAlpha = opacity * 0.93;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function paintSand(ctx, outline, terrain, sites, scale, lagoon) {
    ctx.lineWidth = (lagoon ? 24 : 16) * scale;
    ctx.strokeStyle = lagoon ? '#bd936348' : '#e4c78a72';
    ctx.stroke(outline);
    ctx.lineWidth = (lagoon ? 9 : 6.5) * scale;
    ctx.strokeStyle = lagoon ? '#fcf3d77d' : '#f1edc66d';
    ctx.stroke(outline);
    if (!lagoon) return;

    // Low-frequency sand washes and fragments of older wash lines, drawn once per layout.
    for (const { x, y, s, phase, hue } of sites) {
      const depth = terrain.at(x, y);
      if (depth <= 3 * scale) continue;
      if (hue < 0.29) {
        const r = (8 + s * 33) * scale;
        const wash = ctx.createRadialGradient(x, y, r * 0.12, x, y, r);
        wash.addColorStop(0, hue < 0.10 ? '#bc9a6743' : '#fff9e58a');
        wash.addColorStop(1, '#e8d2a700');
        ellipse(ctx, x, y, r, r * 0.68, wash);
      } else if (hue > 0.56 && depth < 41 * scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(phase) * 0.66);
        ctx.lineWidth = 0.74 * scale;
        ctx.strokeStyle = '#b69b6b74';
        ctx.beginPath();
        ctx.moveTo(-4 * s * scale, 0);
        ctx.quadraticCurveTo(0, 1.2 * scale, 5 * s * scale, -0.6 * scale);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function harbor(ctx, x, y, s, light) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineWidth = 1;
    for (const [dx, height] of (light ? [[0, 18]] : [[-9, 8], [0, 12], [9, 7]])) {
      shape(ctx, [[dx - 3, 2], [dx - 2, 2 - height], [dx + 3, 2 - height], [dx + 4, 2]], '#ebd19d', '#684b32');
      shape(ctx, [[dx - 4, 2 - height], [dx, -height - 3], [dx + 4, 2 - height]], '#a36b48', '#684b32');
      if (light) shape(ctx, [[5, -15], [16, -20], [17, -11]], '#fbe5a399', '#88643c60');
    }
    ctx.restore();
  }

  function kraken(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const ink = '#785536a2';
    for (let arm = 0; arm < 8; arm++) {
      const angle = 0.12 + arm * (Math.PI - 0.24) / 7;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(2, -1);
      ctx.bezierCurveTo(21, -9, 19, 18, 36, 10);
      ctx.bezierCurveTo(47, 4, 41, -9, 33, -6);
      ctx.bezierCurveTo(25, -3, 31, 8, 36, 4);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4 - (arm % 3) * 0.65;
      ctx.lineCap = 'round';
      ctx.stroke();
      for (const [dx, dy] of [[12, 1], [17, 4], [21, 8], [27, 11], [33, 10]]) ellipse(ctx, dx, dy, 1.1, 1.1, '#e8ce9a');
      ctx.restore();
    }
    ellipse(ctx, 0, -12, 13, 20, '#9a754b9b');
    ellipse(ctx, -5, -8, 2.4, 2.3, '#60402b');
    ellipse(ctx, 5, -8, 2.4, 2.3, '#60402b');
    ctx.restore();
  }

  class IslandScene extends CachedScene {
    constructor(mode) {
      super();
      this.mode = mode;
      this.chart = mode === 'nauticalmap';
      this.lagoon = mode === 'maldives';
      this.colors = palette[mode];
      this.ship = sailSprite(this.chart);
      if (!this.chart) this.crowns = [4102, 17389, 30927].map(seed => palmCrown(this.lagoon, seed));
    }

    prepare(params) {
      const { w, h, scale } = this;
      const rand = random(params.seed ^ 11903);
      this.terrain = new WorldMapTerrain(w, h, params.seed, 'islands');
      this.water = surface(this.current.width, this.current.height);
      const ctx = this.water.getContext('2d');
      ctx.scale(this.water.width / w, this.water.height / h);
      ctx.fillStyle = gradient(ctx, 0, 0, w * 0.72, h, this.colors.water);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 105; i++) {
        const x = rand() * w, y = rand() * h, r = (18 + rand() ** 2 * 177) * scale;
        const wash = ctx.createRadialGradient(x, y, r * 0.10, x, y, r);
        const light = this.lagoon ? '#1b657e' : this.chart ? '#876139' : '#a5e9f4';
        const dark = this.chart ? '#fff3c3' : '#215a96';
        const tint = i % 3 ? light : dark;
        wash.addColorStop(0, tint + (this.lagoon ? '45' : '25'));
        wash.addColorStop(1, tint + '00');
        ellipse(ctx, x, y, r, r, wash);
      }
      grain(ctx, w, h, rand, this.chart ? ['#5536191d', '#ffefba59'] :
        ['#d5fff139', '#185a9330', '#ffffff29'], Math.min(15000, w * h / 71));
      this.sites = Array.from({ length: 760 }, () => ({
        x: rand() * w, y: rand() * h, s: 0.5 + rand() * 1.12, phase: rand() * tau, hue: rand(),
      }));
      this.palms = [];
      this.retiringPalms = [];
      this.enteringPalms = new Set();
      this.surf = [];
    }

    drawLayout(ctx, sigma) {
      const { w, h, scale, terrain, colors } = this;
      terrain.setIcons(this.icons, sigma, true);
      const rings = this.chart ? [] : terrain.contours();
      const outline = this.chart ? terrain.outline() : terrain.outline(0, rings);
      this.surf = this.chart ? [] : traceSurf(terrain, rings, scale, this.lagoon, this.settings.seed);
      ctx.drawImage(this.water, 0, 0, w, h);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.save();
      if (!this.chart) ctx.filter = `blur(${3.8 * scale * ctx.getTransform().a}px)`;
      for (const [line, color] of colors.coast) {
        ctx.lineWidth = line * scale;
        ctx.strokeStyle = color;
        ctx.stroke(outline);
      }
      ctx.restore();

      ctx.save();
      ctx.clip(outline, 'evenodd');
      ctx.fillStyle = gradient(ctx, 0, 0, w * 0.45, h, colors.land);
      ctx.fillRect(0, 0, w, h);
      if (!this.chart) paintSand(ctx, outline, terrain, this.sites, scale, this.lagoon);
      const rand = random(this.settings.seed ^ 27073);
      grain(ctx, w, h, rand, [colors.marks[1], colors.marks[2]], Math.min(12500, w * h / 60));
      const details = [];
      for (const site of this.sites) {
        const { x, y, s } = site;
        const size = s * scale;
        const leavesClear = this.chart ? clearOfIcons(this.icons, x, y - 6 * scale, 18 * scale, 16 * scale) :
          clearOfIcons(this.icons, x + 2 * size, y - 18 * size, 23 * size, 23 * size);
        if (terrain.at(x, y) < 15 * scale || !leavesClear ||
          details.some(p => Math.hypot(x - p.x, y - p.y) < 32 * scale)) continue;
        details.push(site);
        if (this.chart && details.length <= 23) harbor(ctx, x, y, size, details.length % 4 === 1);
      }
      if (!this.chart) {
        const previous = new Set(this.palms);
        const next = this.lagoon ? details.slice(0, this.settings.palms) : details;
        const active = new Set(next);
        this.retiringPalms = this.palms.filter(site => !active.has(site));
        this.enteringPalms = new Set(next.filter(site => !previous.has(site)));
        this.palms = next;
      }
      ctx.restore();
      if (this.chart) {
        ctx.strokeStyle = '#715033be';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke(outline);
      }

      this.marks = [];
      this.paths = [];
      const reefs = [];
      let monster;
      const buffer = (this.lagoon ? 39 : 25) * scale;
      const maxPaths = this.chart ? chartShipLimit : 8;
      const spacing = (this.chart ? 82 : 110) * scale;
      for (const site of this.sites) {
        const { x, y, s, hue } = site;
        if (terrain.at(x, y) > -12 * scale) continue;
        if (hue < (this.chart ? 0.59 : 0.48)) {
          ctx.lineWidth = (this.lagoon ? 0.7 : 0.85) * scale;
          ctx.strokeStyle = colors.marks[0];
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + s * 4 * scale, y - 2.4 * s * scale, x + s * 8 * scale, y);
          ctx.stroke();
        }
        if (this.lagoon && hue > 0.81 && terrain.at(x, y) < -34 * scale &&
          reefs.length < 29 && reefs.every(reef => Math.hypot(reef.x - x, reef.y - y) > 58 * scale)) {
          reefs.push(site);
          for (let j = 0; j < 12; j++) {
            const a = j * 2.4 + site.phase;
            const radius = (2 + j * 1.38) * scale;
            const px = x + Math.cos(a) * radius, py = y + Math.sin(a) * radius * 0.68;
            if (terrain.at(px, py) < -21 * scale) ellipse(ctx, px, py, s * (2 + j % 3) * scale,
              s * 1.16 * scale, j % 3 ? '#235f7a46' : '#2d887a66');
          }
        }
        if (terrain.at(x, y) > -buffer || !clearOfIcons(this.icons, x, y, 46 * scale, 42 * scale)) continue;
        if (!monster && this.chart && x > w * 0.32 && x < w * 0.79 && y > h * 0.29 &&
          y < h * 0.82 && terrain.at(x, y) < -50 * scale) monster = site;
        if (this.marks.length < 54 && hue > 0.65) this.marks.push(site);
        if (this.paths.length >= maxPaths || hue > 0.55 || x < 45 * scale || x > w - 45 * scale ||
          y < 49 * scale || y > h - 43 * scale ||
          this.paths.some(p => Math.hypot(p.x - x, p.y - y) < spacing)) continue;
        const angle = site.phase;
        const span = (this.chart ? 96 : 126) * scale;
        const dx = Math.cos(angle) * span, dy = Math.sin(angle) * span * 0.65;
        let open = true;
        for (let i = -1; i <= 1; i += 0.20) {
          const px = x + dx * i;
          const py = y + dy * i;
          if (px < 45 * scale || px > w - 45 * scale || py < 49 * scale || py > h - 43 * scale ||
            terrain.at(px, py) > -buffer) { open = false; break; }
        }
        this.paths.push({ x, y, dx: open ? dx : 0, dy: open ? dy : 0, angle, phase: site.phase });
      }
      if (this.chart) {
        ctx.setLineDash([2 * scale, 5 * scale]);
        ctx.lineWidth = 1.35 * scale;
        for (const { x, y, dx, dy } of this.paths) {
          if (!dx && !dy) continue;
          ctx.strokeStyle = '#865c3e8a';
          ctx.beginPath();
          ctx.moveTo(x - dx, y - dy);
          ctx.quadraticCurveTo(x, y - 18 * scale, x + dx, y + dy);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        if (monster) kraken(ctx, monster.x, monster.y, Math.min(scale * 1.15, -terrain.at(monster.x, monster.y) / 55));
        const border = Math.min(w, h) * 0.020;
        ctx.strokeStyle = '#6c4b38b5';
        ctx.lineWidth = 1.4 * scale;
        ctx.strokeRect(border, border, w - border * 2, h - border * 2);
        ctx.strokeStyle = '#8e684f71';
        ctx.strokeRect(border * 1.32, border * 1.32, w - border * 2.64, h - border * 2.64);
        const label = [[0.50, 0.075], [0.75, 0.09], [0.52, 0.89]].find(([x,y]) =>
          clearOfIcons(this.icons, x * w, y * h, 115 * scale, 20 * scale) &&
          terrain.at(x * w - 90 * scale, y * h) < 0 && terrain.at(x * w + 90 * scale, y * h) < 0);
        if (label) {
          ctx.fillStyle = '#765033';
          ctx.font = 'italic small-caps ' + (24 * scale) + 'px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.fillText('Mare Ventorum', label[0] * w, label[1] * h, w * 0.45);
        }
      }
    }

    animate(ctx, clock) {
      const { scale, paths, settings } = this;
      const opacity = ctx.globalAlpha;
      if (!this.chart) paintSurf(ctx, this.surf, clock, scale, this.lagoon, opacity);
      if (this.lagoon) {
        for (let i = 0; i < Math.min(settings.fishSchools, paths.length); i++) {
          const { x, y, dx, dy, phase } = paths[i];
          const t = Math.sin(clock * 0.23 + phase);
          for (let j = 0; j < 10; j++) {
            const a = j * 2.4, spread = 4 + j * 0.7;
            const px = x + dx * t + Math.cos(a) * spread * scale;
            const py = y + dy * t + Math.sin(a) * spread * 0.73 * scale;
            ellipse(ctx, px, py + Math.sin(clock * 2.2 + j) * 1.3 * scale, 2.3 * scale, 0.94 * scale, '#1d6d818e');
          }
        }
      } else {
        const count = this.chart ? settings.ships : settings.boats;
        for (let i = 0; i < Math.min(count, paths.length); i++) {
          const { x, y, dx, dy, angle, phase } = paths[i];
          const t = Math.sin(clock * 0.16 + phase);
          const rock = Math.sin(clock * 1.18 + phase);
          ctx.save();
          ctx.translate(x + dx * t, y + dy * t - (this.chart ? (1 - t * t) * 9 * scale : 0) + rock * 1.4 * scale);
          ctx.rotate((this.chart ? 0 : angle) + rock * 0.08);
          if (!this.chart && (dx || dy)) {
            ctx.lineWidth = 1.3 * scale;
            shape(ctx, [[-43 * scale, 5 * scale], [-23 * scale, 0], [-43 * scale, -5 * scale]], null, '#c9f3f792');
          }
          ctx.drawImage(this.ship, -34 * scale, -40 * scale, 68 * scale, 58 * scale);
          ctx.restore();
        }
      }
      for (const { x, y, phase } of this.marks) {
        const light = 0.08 + 0.29 * (0.5 + 0.5 * Math.sin(clock + phase));
        ellipse(ctx, x, y, (1.1 + light * 5.6) * scale, 0.6 * scale,
          this.chart ? 'rgba(121,89,59,' + light + ')' : 'rgba(226,255,245,' + light + ')');
      }
      if (!this.chart) {
        if (this.blend < 1) {
          ctx.globalAlpha = 1 - this.blend;
          for (const site of this.retiringPalms) {
            palm(ctx, site, scale, clock, this.crowns[Math.floor(site.hue * this.crowns.length)]);
          }
        }
        for (const site of this.palms) {
          ctx.globalAlpha = this.enteringPalms.has(site) ? this.blend : 1;
          palm(ctx, site, scale, clock, this.crowns[Math.floor(site.hue * this.crowns.length)]);
        }
        ctx.globalAlpha = opacity;
      }
    }
  }

  const chartShipLimit = 12;
  const variants = {
    ocean: {
      defaults: { seed: 921502, adaptive: 1, sigma: 53, wind: 1, boats: 5 },
      ranges: { sigma: [15, 130], wind: [0, 2], boats: [0, 8] },
    },
    maldives: {
      defaults: { seed: 746331, adaptive: 1, sigma: 61, wind: 1, palms: 18, fishSchools: 4 },
      ranges: { sigma: [15, 140], wind: [0, 2], palms: [0, 35], fishSchools: [0, 8] },
    },
    nauticalmap: {
      defaults: { seed: 823077, adaptive: 1, sigma: 47, wind: 1, ships: 8 },
      ranges: { sigma: [15, 125], wind: [0, 2], ships: [0, chartShipLimit] },
    },
  };
  const mode = document.body.dataset.scene;
  window.wallpaperScene = { ...variants[mode], scene: new IslandScene(mode), demoHint: 'Drag an icon to move its island' };
})();
