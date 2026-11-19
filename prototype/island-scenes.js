/* Three original island treatments on the same adaptive shoreline geometry. */
(() => {
  const { tau, clamp, random, surface, ellipse, shape, gradient, grain, clearOfIcons, CachedScene } = Scenery;
  const palette = {
    ocean: {
      water: ['#448ccc', '#256dc2', '#153a87'],
      land: ['#d8d6a2', '#8cab72', '#4a866e'],
      coast: [[54, '#7ce1e630'], [24, '#5ac1d77d'], [9, '#c5e9dfb9'], [2.2, '#eef7db']],
      marks: ['#aadce1bc', '#457850a9', '#ecf1bf70'],
    },
    maldives: {
      water: ['#56daca', '#169fba', '#087898'],
      land: ['#fff5db', '#eddbb4', '#ddc395'],
      coast: [[120, '#81edce38'], [75, '#a4f6d45c'], [43, '#bcf1cf85'], [19, '#d9f2dcb6'], [3, '#fff7e4d1']],
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

  function palm(ctx, x, y, s, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ellipse(ctx, 3 * s, 0, 11 * s, 3.4 * s, '#3b5b5333');
    ctx.lineWidth = 2.15 * s;
    ctx.strokeStyle = '#8b714b';
    ctx.beginPath();
    ctx.moveTo(0, 1 * s);
    ctx.quadraticCurveTo(-3 * s, -8 * s, 4 * s, -17 * s);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = i * tau / 7;
      const dx = Math.cos(a) * 11 * s, dy = Math.sin(a) * 8.4 * s;
      ctx.beginPath();
      ctx.moveTo(4 * s, -17 * s);
      ctx.quadraticCurveTo(4 * s + dx * 0.38 - dy * 0.35, -19 * s + dy * 0.3, 4 * s + dx, -17 * s + dy);
      ctx.quadraticCurveTo(5 * s + dx * 0.4, -15 * s + dy * 0.6, 4 * s, -17 * s);
      ctx.fillStyle = i % 2 ? '#4c9269' : '#3b775e';
      ctx.fill();
    }
    ctx.restore();
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
    }

    drawLayout(ctx, sigma) {
      const { w, h, scale, terrain, colors } = this;
      terrain.setIcons(this.icons, sigma, true);
      const outline = terrain.outline();
      ctx.drawImage(this.water, 0, 0, w, h);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const [line, color] of colors.coast) {
        ctx.lineWidth = line * scale;
        ctx.strokeStyle = color;
        ctx.stroke(outline);
      }

      ctx.save();
      ctx.clip(outline, 'evenodd');
      ctx.fillStyle = gradient(ctx, 0, 0, w * 0.45, h, colors.land);
      ctx.fillRect(0, 0, w, h);
      const rand = random(this.settings.seed ^ 27073);
      grain(ctx, w, h, rand, [colors.marks[1], colors.marks[2]], Math.min(12500, w * h / 60));
      const details = [];
      for (const site of this.sites) {
        const { x, y, s, phase } = site;
        if (terrain.at(x, y) < 15 * scale || !clearOfIcons(this.icons, x, y - 6 * scale, 18 * scale, 16 * scale) ||
          details.some(p => Math.hypot(x - p.x, y - p.y) < 32 * scale)) continue;
        details.push(site);
        if (this.chart) {
          if (details.length <= 23) harbor(ctx, x, y, s * scale, details.length % 4 === 1);
        } else if (!this.lagoon || details.length <= this.settings.palms) {
          palm(ctx, x, y, s * scale, (phase - Math.PI) * 0.12);
        }
      }
      ctx.restore();
      ctx.strokeStyle = this.chart ? '#715033be' : this.lagoon ? '#fff5ddea' : '#e9efd0bc';
      ctx.lineWidth = (this.chart ? 1.5 : 1.9) * scale;
      ctx.stroke(outline);

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
