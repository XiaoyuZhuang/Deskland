/* Original sepia cartography. Shorelines and ink engravings are cached between layout messages. */
(() => {
  const tau = Math.PI * 2;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const names = ['Valdora', 'Porto Bruma', 'Castrum', 'Bellacqua', 'Rocca Alta', 'Dunmere', 'Montevia',
    'Oriel', 'Vespera', 'Miralba', 'Bracken', 'Serravia', 'Norwick', 'Lunara', 'Selcosta', 'Orlena'];

  function surface(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
  }

  function poly(ctx, points, fill, stroke) {
    ctx.beginPath();
    for (const [x, y] of points) ctx.lineTo(x, y);
    if (fill) {
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, tau);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function makeShip() {
    const canvas = surface(116, 88);
    const ctx = canvas.getContext('2d');
    ctx.translate(58, 62);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.45;
    for (const [x, h] of [[-29, 31], [-4, 49], [23, 37]]) {
      poly(ctx, [[x, 8], [x, -h]], null, '#603a25');
      poly(ctx, [[x, -h + 2], [x + 13, -h + 5], [x, -h + 9]], '#9a573e99', '#76492eb3');
      ctx.beginPath();
      ctx.moveTo(x - 13, -h + 11);
      ctx.quadraticCurveTo(x - 6, -h + 24, x - 12, -h + 31);
      ctx.quadraticCurveTo(x, -h + 35, x + 11, -h + 27);
      ctx.quadraticCurveTo(x + 17, -h + 19, x + 11, -h + 11);
      ctx.closePath();
      ctx.fillStyle = '#f4e4bde8';
      ctx.fill();
      ctx.strokeStyle = '#755034';
      ctx.stroke();
    }
    poly(ctx, [[-51, 0], [-38, 2], [28, 1], [49, -5], [40, 10], [23, 15], [-32, 13]],
      '#896044', '#593b29');
    poly(ctx, [[-34, 6], [14, 9], [36, 5]], null, '#d3aa78');
    return canvas;
  }

  function makeWagon() {
    const canvas = surface(85, 44);
    const ctx = canvas.getContext('2d');
    ctx.translate(42, 24);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const ink = '#5e3c2a';
    const leather = '#9f7149';
    poly(ctx, [[-35, -4], [-18, -6], [-10, -11], [-10, 6], [-34, 6]], leather, ink);
    for (const x of [-30, -14]) {
      ellipse(ctx, x, 8, 5, 5, ink);
      ellipse(ctx, x, 8, 2.2, 2.2, '#d4b17f');
    }
    poly(ctx, [[-32, -4], [-28, -12], [-20, -12], [-18, -5]], '#bd8d61', ink);
    poly(ctx, [[-12, 2], [9, -1]], null, ink);
    ellipse(ctx, 18, -2, 10, 5.3, ink);
    poly(ctx, [[22, -1], [26, -13], [33, -14], [34, -9], [28, -6], [25, 1]], ink);
    poly(ctx, [[10, -3], [4, -8], [1, -6]], null, ink);
    poly(ctx, [[13, 1], [11, 8], [15, 11]], null, ink);
    poly(ctx, [[22, 1], [25, 8], [29, 9]], null, ink);
    return canvas;
  }

  function mountain(ctx, { x, y, size: s, tone }) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = Math.max(0.65, s * 0.039);
    const outline = [[-s * 0.65, s * 0.04], [-s * 0.34, -s * 0.38], [-s * 0.21, -s * 0.43],
      [s * 0.03, -s * 0.86], [s * 0.29, -s * 0.50], [s * 0.40, -s * 0.39], [s * 0.66, s * 0.04]];
    poly(ctx, outline, '#c69b5f4c', tone);
    poly(ctx, [[s * 0.03, -s * 0.86], [s * 0.06, -s * 0.48], [s * 0.21, -s * 0.29],
      [s * 0.20, -s * 0.18], [s * 0.42, s * 0.035], [s * 0.66, s * 0.035], [s * 0.40, -s * 0.39],
      [s * 0.29, -s * 0.50]], '#93633c49', null);
    poly(ctx, [[s * 0.03, -s * 0.86], [s * 0.06, -s * 0.48], [s * 0.21, -s * 0.29],
      [s * 0.17, -s * 0.18]], null, tone);
    for (let i = 0; i < 4; i++) {
      const offset = i * s * 0.082;
      poly(ctx, [[s * 0.22 + offset * 0.51, -s * 0.37 + offset],
        [s * 0.37 + offset, -s * 0.14 + offset * 0.41]], null, '#80522c68');
    }
    ctx.restore();
  }

  function town(ctx, { x, y, name, capital }, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const ink = '#644329';
    ctx.lineWidth = 1;
    ellipse(ctx, 0, 3.4, 17, 3.7, '#91633637');
    for (const [dx, h, w] of [[-11, 8, 7], [8, 9, 8], [0, capital ? 19 : 13, 9]]) {
      poly(ctx, [[dx - w / 2, 3], [dx - w / 2, 3 - h], [dx + w / 2, 3 - h], [dx + w / 2, 3]],
        '#ead09b', ink);
      poly(ctx, [[dx - w * 0.66, 3 - h], [dx, -2 - h], [dx + w * 0.65, 3 - h]],
        capital ? '#ab6245' : '#b17e4f', ink);
      ctx.fillStyle = '#735034';
      ctx.fillRect(dx - 0.9, 3 - h + 3, 1.8, 2.7);
    }
    if (capital) poly(ctx, [[0, -21], [0, -30], [7, -27], [0, -25]], '#a45e40', ink);
    ctx.font = capital ? 'italic bold 14px Georgia, serif' : 'italic 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#583a24';
    ctx.fillText(name, 0, 8);
    ctx.restore();
  }

  function routeAt(route, t) {
    const u = 1 - t;
    return {
      x: u * u * route.a.x + 2 * u * t * route.x + t * t * route.b.x,
      y: u * u * route.a.y + 2 * u * t * route.y + t * t * route.b.y,
    };
  }

  function compass(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(radius / 52, radius / 52);
    ctx.strokeStyle = '#805635a6';
    ctx.lineWidth = 0.8;
    for (const r of [42, 45, 51]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, tau);
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 4);
      const point = i % 2 ? 34 : 52;
      poly(ctx, [[0, -point], [0, 0], [-7, -5]], '#724d33', '#724d33');
      poly(ctx, [[0, -point], [7, -5], [0, 0]], '#e7cb96', '#724d33');
      ctx.restore();
    }
    ellipse(ctx, 0, 0, 3.1, 3.1, '#805434');
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#765033';
    for (const [letter, px, py] of [['N', 0, -61], ['S', 0, 61], ['W', -63, 0], ['E', 62, 0]]) {
      ctx.fillText(letter, px, py);
    }
    ctx.restore();
  }

  function title(ctx, text, x, y, size, color, tracking) {
    ctx.save();
    ctx.translate(x, y);
    ctx.font = 'italic small-caps ' + size + 'px Georgia, serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    const letters = [...text];
    const widths = letters.map(letter => ctx.measureText(letter).width + tracking);
    let offset = -widths.reduce((sum, width) => sum + width, 0) / 2;
    letters.forEach((letter, i) => {
      ctx.fillText(letter, offset, 0);
      offset += widths[i];
    });
    ctx.restore();
  }

  class WorldMapScene {
    constructor() {
      this.ship = makeShip();
      this.wagon = makeWagon();
    }

    build(width, height, ratio, params) {
      this.width = width;
      this.height = height;
      this.scale = clamp(Math.min(width, height) / 870, 0.30, 1.45);
      this.terrain = new WorldMapTerrain(width, height, params.seed);
      const resolution = Math.min(1, ratio, Math.sqrt(1550000 / (width * height)));
      this.paper = surface(width * resolution, height * resolution);
      this.current = surface(this.paper.width, this.paper.height);
      this.previous = surface(this.paper.width, this.paper.height);
      this.lastIcons = null;
      this.blend = 1;
      this.makePaper(WorldMapTerrain.random(params.seed ^ 517427));
      this.makeMarks(WorldMapTerrain.random(params.seed ^ 185527));
    }

    makePaper(rand) {
      const { paper, width, height, scale } = this;
      const ctx = paper.getContext('2d', { alpha: false });
      ctx.scale(paper.width / width, paper.height / height);
      const tone = ctx.createLinearGradient(0, 0, width, height);
      tone.addColorStop(0, '#e1cb9d');
      tone.addColorStop(0.4, '#f0dfb4');
      tone.addColorStop(1, '#d7b782');
      ctx.fillStyle = tone;
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 185; i++) {
        const x = rand() * width, y = rand() * height, r = (9 + rand() ** 1.4 * 146) * scale;
        const wash = ctx.createRadialGradient(x, y, r * 0.08, x, y, r);
        const color = i % 4 ? '#996d3d' : '#fff1ca';
        wash.addColorStop(0, color + (i % 4 ? '28' : '85'));
        wash.addColorStop(1, color + '00');
        ctx.fillStyle = wash;
        ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      const border = ctx.createRadialGradient(width / 2, height / 2,
        Math.min(width, height) * 0.26, width / 2, height / 2, Math.hypot(width, height) * 0.56);
      border.addColorStop(0, '#885b2600');
      border.addColorStop(0.75, '#885b2630');
      border.addColorStop(1, '#70442064');
      ctx.fillStyle = border;
      ctx.fillRect(0, 0, width, height);
      const grains = Math.min(19500, Math.round(width * height / 58));
      for (let i = 0; i < grains; i++) {
        ctx.fillStyle = i % 3 ? '#69482719' : '#fff9e144';
        ctx.fillRect(rand() * width, rand() * height, 0.45 + rand() * 1.3, 0.5 + rand());
      }
    }

    makeMarks(rand) {
      const { width, height, scale } = this;
      const ridgeCount = clamp(Math.round(width * height / (scale * scale * 8500)), 95, 280);
      const ridges = [[0.28, 0.35, 0.17, 0.34], [0.55, 0.26, 0.23, -0.12],
        [0.58, 0.70, 0.27, 0.14], [0.21, 0.76, 0.19, 0.09], [0.80, 0.16, 0.13, 0.14]];
      this.mountains = Array.from({ length: ridgeCount }, (_, i) => {
        const [x, y, dx, dy] = ridges[i % ridges.length];
        const t = rand() - 0.5, drift = rand() - 0.5;
        return {
          x: (x + dx * t + 0.07 * drift) * width,
          y: (y + dy * t + 0.115 * drift + 0.022 * Math.sin(t * 17)) * height,
          size: (8 + rand() ** 1.1 * 25) * scale,
          tone: i % 3 ? '#765132ad' : '#694429b7',
        };
      }).sort((a, b) => a.y - b.y);
      this.hills = Array.from({ length: Math.round(ridgeCount * 1.12) }, () => ({
        x: (0.07 + rand() * 0.87) * width,
        y: (0.065 + rand() * 0.89) * height,
        s: (2.5 + rand() * 4.5) * scale,
      }));
      const towns = [[0.35, 0.17], [0.20, 0.42], [0.49, 0.47], [0.66, 0.33], [0.81, 0.38],
        [0.26, 0.59], [0.45, 0.78], [0.72, 0.63], [0.65, 0.86], [0.15, 0.91], [0.84, 0.84],
        [0.46, 0.24], [0.59, 0.54], [0.36, 0.89], [0.75, 0.12], [0.89, 0.24]];
      this.towns = towns.map(([x, y], i) => ({
        x: (x + (rand() - 0.5) * 0.055) * width, y: (y + (rand() - 0.5) * 0.062) * height,
        name: names[i], capital: i === 2 || i === 7 || i === 0,
      }));
      this.seaMarks = Array.from({ length: 560 }, () => ({
        x: width * (0.02 + rand() * 0.96), y: height * (0.025 + rand() * 0.95),
        s: scale * (2 + rand() * 6.5), phase: rand() * tau,
      }));
    }

    setLayout(icons, clearance, _density, snap, params) {
      this.shipCount = Math.round(params.ships);
      this.wagonCount = Math.round(params.wagons);
      if (icons === this.lastIcons && clearance === this.clearance) {
        if (snap) this.blend = 1;
        return;
      }
      const previous = this.previous.getContext('2d');
      previous.globalAlpha = this.blend;
      previous.drawImage(this.current, 0, 0);
      previous.globalAlpha = 1;
      this.blend = this.lastIcons && !snap ? 0 : 1;
      this.lastIcons = icons;
      this.clearance = clearance;
      this.terrain.setIcons(icons, clearance);
      this.paintMap();
    }

    isClear(x, y, halfW, halfH) {
      return this.lastIcons.every(icon =>
        x + halfW < icon.x || x - halfW > icon.x + icon.w ||
        y + halfH < icon.y || y - halfH > icon.y + icon.h);
    }

    connectTowns(towns) {
      const pairs = [];
      for (let i = 0; i < towns.length; i++) {
        for (let j = i + 1; j < towns.length; j++) {
          const a = towns[i], b = towns[j];
          const length = Math.hypot(a.x - b.x, a.y - b.y);
          if (length < this.scale * 560) pairs.push({ i, j, length });
        }
      }
      pairs.sort((a, b) => a.length - b.length);
      const labels = towns.map((_, i) => i);
      const roads = [];
      for (const { i, j, length } of pairs) {
        if (labels[i] === labels[j]) continue;
        const a = towns[i], b = towns[j];
        const turns = [0.18, -0.19, 0.32, -0.34, 0];
        for (const turn of turns) {
          const route = {
            a, b, length, inset: Math.min(0.27, 29 * this.scale / length),
            x: (a.x + b.x) * 0.5 - (b.y - a.y) * turn,
            y: (a.y + b.y) * 0.5 + (b.x - a.x) * turn,
          };
          const segments = Math.ceil(length / (7 * this.scale));
          let terrestrial = true;
          for (let n = 1; n < segments; n++) {
            const p = routeAt(route, n / segments);
            if (this.terrain.at(p.x, p.y) < this.scale * 4) { terrestrial = false; break; }
          }
          if (!terrestrial) continue;
          roads.push(route);
          const old = labels[j];
          for (let k = 0; k < labels.length; k++) if (labels[k] === old) labels[k] = labels[i];
          break;
        }
      }
      return roads;
    }

    paintMap() {
      const { width, height, current, paper, terrain, scale } = this;
      const ctx = current.getContext('2d');
      ctx.setTransform(current.width / width, 0, 0, current.height / height, 0, 0);
      ctx.drawImage(paper, 0, 0, width, height);
      ctx.fillStyle = '#8e694340';
      ctx.fillRect(0, 0, width, height);
      const land = terrain.outline();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const [line, color] of [[28, '#8e654126'], [18, '#f4d8a63c'], [11, '#69472e2f'], [5, '#f8e0af79']]) {
        ctx.lineWidth = line * scale;
        ctx.strokeStyle = color;
        ctx.stroke(land);
      }
      ctx.save();
      ctx.clip(land, 'evenodd');
      ctx.drawImage(paper, 0, 0, width, height);
      ctx.fillStyle = '#f7e4b026';
      ctx.fillRect(0, 0, width, height);

      const towns = this.towns.filter(({ x, y }) => terrain.at(x, y) > scale * 30 &&
        terrain.at(x - 34 * scale, y + 12 * scale) > 4 * scale &&
        terrain.at(x + 34 * scale, y + 12 * scale) > 4 * scale &&
        this.isClear(x, y, 49 * scale, 31 * scale));
      for (const mark of this.mountains) {
        if (terrain.at(mark.x, mark.y - mark.size * 0.30) < mark.size * 0.58 ||
          towns.some(t => Math.hypot(mark.x - t.x, mark.y - t.y) < scale * 37)) continue;
        mountain(ctx, mark);
      }
      ctx.strokeStyle = '#8f684966';
      ctx.lineWidth = 0.85 * scale;
      for (const { x, y, s } of this.hills) {
        if (terrain.at(x, y) < 18 * scale || towns.some(t => Math.hypot(x - t.x, y - t.y) < 27 * scale)) continue;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.quadraticCurveTo(x - s * 0.06, y - s * 1.08, x + s * 0.75, y + s * 0.1);
        ctx.stroke();
      }
      this.roads = this.connectTowns(towns);
      ctx.setLineDash([2.4 * scale, 4 * scale]);
      ctx.lineWidth = 1.55 * scale;
      ctx.strokeStyle = '#69472db2';
      for (const road of this.roads) {
        ctx.beginPath();
        // Stop the dotted line before it reaches a town symbol or label.
        for (let i = 0; i <= 24; i++) {
          const p = routeAt(road, road.inset + (1 - 2 * road.inset) * i / 24);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const spot of towns) town(ctx, spot, scale);
      ctx.restore();

      ctx.strokeStyle = '#6f4a30c9';
      ctx.lineWidth = 1.4 * scale;
      ctx.stroke(land);
      const locations = [
        [0.53, 0.115, 'Terra Vespera', true],
        [0.11, 0.30, 'Mare Occidens', false],
        [0.90, 0.68, 'Sinus Aureus', false],
      ];
      for (const [u, v, name, isLand] of locations) {
        const x = u * width, y = v * height, reach = Math.min(width * 0.095, 100 * scale);
        if ([x - reach, x, x + reach].every(px => isLand ? terrain.at(px, y) > 9 : terrain.at(px, y) < -9) &&
          this.isClear(x, y, reach, 19 * scale)) {
          title(ctx, name, x, y, (isLand ? 22 : 17) * scale, '#5f3b23c7', 2.9 * scale);
        }
      }

      const compassRadius = 41 * scale;
      const rose = [[0.092, 0.12], [0.90, 0.76], [0.12, 0.32], [0.89, 0.54], [0.92, 0.14]]
        .map(([u, v]) => [u * width, v * height])
        .find(([x, y]) => terrain.at(x, y) < -22 * scale && this.isClear(x, y, compassRadius * 1.45, compassRadius * 1.45));
      this.ships = [];
      for (const dot of this.seaMarks) {
        const { x, y, s } = dot;
        if (terrain.at(x, y) >= -16 * scale || !this.isClear(x, y, 10 * scale, 7 * scale) ||
          (rose && Math.hypot(x - rose[0], y - rose[1]) < compassRadius * 1.7)) continue;
        ctx.lineWidth = 0.73 * scale;
        ctx.strokeStyle = '#76583c63';
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.quadraticCurveTo(x - s * 0.36, y - s * 0.39, x + s * 0.09, y);
        ctx.quadraticCurveTo(x + s * 0.48, y + s * 0.21, x + s, y - s * 0.16);
        ctx.stroke();
        if (this.ships.length < 8 && terrain.at(x, y) < -38 * scale &&
          this.isClear(x, y - 8 * scale, 31 * scale, 28 * scale) &&
          this.ships.every(ship => Math.hypot(x - ship.x, y - ship.y) > 110 * scale)) this.ships.push(dot);
      }
      if (rose) compass(ctx, rose[0], rose[1], compassRadius);

      const inset = Math.min(width, height) * 0.017;
      ctx.lineWidth = 1.25 * scale;
      ctx.strokeStyle = '#64402598';
      ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
      ctx.lineWidth = 0.6 * scale;
      ctx.strokeStyle = '#80532e88';
      ctx.strokeRect(inset * 1.35, inset * 1.35, width - inset * 2.7, height - inset * 2.7);
    }

    advance(dt, snap) {
      if (this.blend >= 1) return false;
      this.blend = snap ? 1 : Math.min(1, this.blend + dt * 2.9);
      return true;
    }

    paint(ctx, width, height, clock) {
      const { scale, current, previous, blend } = this;
      ctx.setTransform(width / this.width, 0, 0, height / this.height, 0, 0);
      if (blend < 1) ctx.drawImage(previous, 0, 0, this.width, this.height);
      ctx.globalAlpha = blend;
      ctx.drawImage(current, 0, 0, this.width, this.height);
      for (let i = 0; i < Math.min(this.shipCount, this.ships.length); i++) {
        const { x, y, phase } = this.ships[i];
        const roll = Math.sin(clock * 0.78 + phase);
        ctx.save();
        ctx.translate(x + Math.sin(clock * 0.26 + phase) * 4 * scale, y + roll * scale);
        ctx.rotate(roll * 0.09);
        ctx.drawImage(this.ship, -27 * scale, -29 * scale, 54 * scale, 41 * scale);
        ctx.restore();
      }
      for (let i = 0; i < Math.min(this.wagonCount, this.roads.length); i++) {
        const road = this.roads[Math.floor(i * this.roads.length / this.wagonCount)];
        const travel = (clock * 13 / road.length + i * 0.37) % 2;
        const t = road.inset + (travel <= 1 ? travel : 2 - travel) * (1 - 2 * road.inset);
        const p = routeAt(road, t), next = routeAt(road, t + (travel <= 1 ? 0.012 : -0.012));
        ctx.save();
        ctx.translate(p.x, p.y + Math.sin(clock * 13 + i) * 0.75 * scale);
        ctx.scale(next.x < p.x ? -1 : 1, 1);
        ctx.drawImage(this.wagon, -17 * scale, -9 * scale, 34 * scale, 17.6 * scale);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  window.wallpaperScene = {
    scene: new WorldMapScene(),
    defaults: { seed: 291873, sigma: 52, wind: 1, ships: 3, wagons: 4, adaptive: 1 },
    ranges: { sigma: [20, 180], wind: [0, 2], ships: [0, 8], wagons: [0, 12] },
    demoHint: 'Drag an icon to reshape the coast',
  };
})();
