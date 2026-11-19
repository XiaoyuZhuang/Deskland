(() => {
  const { tau, random, surface, ellipse, shape, gradient, clearOfIcons, CachedScene } = Scenery;
  const sky = [
    ['#337ec2', '#5ba4d0', '#a5d1e3', '#fffffc', '#e6edf5', '#ccd9e6'],
    ['#4d598d', '#a378aa', '#f5b999', '#fff1dd', '#f7dce0', '#d2b9d5'],
    ['#111f45', '#273967', '#485683', '#e6ebff', '#b3c7e8', '#859ac3'],
  ];

  function shade(from, to, amount) {
    const channel = start => Math.round(parseInt(from.slice(start, start + 2), 16) * (1 - amount) +
      parseInt(to.slice(start, start + 2), 16) * amount);
    return 'rgb(' + [channel(1), channel(3), channel(5)].join(',') + ')';
  }

  function paintCloud(ctx, base, circles, colors, mask, rim, light, shadow) {
    const joined = new Path2D();
    for (const [x, y, r] of circles) {
      joined.moveTo(x + r, y);
      joined.arc(x, y, r, 0, tau);
      joined.closePath();
    }
    const alpha = mask.getContext('2d'), edge = rim.getContext('2d');
    alpha.resetTransform();
    alpha.clearRect(0, 0, mask.width, mask.height);
    alpha.setTransform(ctx.getTransform());
    alpha.fill(base, 'evenodd');
    alpha.fill(joined);
    edge.clearRect(0, 0, rim.width, rim.height);
    edge.globalCompositeOperation = 'source-over';
    edge.drawImage(mask, 0, 0);
    edge.globalCompositeOperation = 'destination-out';
    edge.drawImage(mask, light * 0.6 * ctx.getTransform().a, light * 0.8 * ctx.getTransform().d);
    edge.globalCompositeOperation = 'source-in';
    edge.fillStyle = colors[3];
    edge.fillRect(0, 0, rim.width, rim.height);
    edge.globalCompositeOperation = 'source-over';

    if (shadow) {
      ctx.save();
      ctx.translate(shadow * 0.7, shadow);
      ctx.fillStyle = '#294c7f3d';
      ctx.fill(base, 'evenodd');
      ctx.fill(joined);
      ctx.restore();
    }
    ctx.fillStyle = shade(colors[4], colors[5], 0.45);
    ctx.fill(base, 'evenodd');
    circles.sort((a, b) => a[1] - b[1]);
    for (const [x, y, r, tone] of circles) {
      ellipse(ctx, x, y, r, r, shade(colors[4], colors[5], tone * 0.6));
    }
    ctx.save();
    ctx.resetTransform();
    ctx.drawImage(rim, 0, 0);
    ctx.restore();
  }

  function cloudSprite(colors, seed) {
    const canvas = surface(300, 164);
    const ctx = canvas.getContext('2d');
    const { circles } = MeadowClouds.skyCircles(random(seed));
    const left = Math.min(...circles.map(([x, , r]) => x - r));
    const right = Math.max(...circles.map(([x, , r]) => x + r));
    const top = Math.min(...circles.map(([, y, r]) => y - r));
    const bottom = Math.max(...circles.map(([, y, r]) => y + r));
    const scale = Math.min(283 / (right - left), 147 / (bottom - top));
    const cx = (left + right) * 0.5, cy = (top + bottom) * 0.5;
    const puffs = circles.map(([x, y, r, tone]) => [150 + (x - cx) * scale, 82 + (y - cy) * scale, r * scale, tone]);
    paintCloud(ctx, new Path2D(), puffs, colors, surface(300, 164), surface(300, 164), 9, 0);
    return canvas;
  }

  class CloudScene extends CachedScene {
    prepare(params) {
      const rand = random(params.seed ^ 7752);
      this.mask = surface(this.current.width, this.current.height);
      this.rim = surface(this.current.width, this.current.height);
      this.terrain = new WorldMapTerrain(this.w, this.h, params.seed, 'empty');
      const variants = Array.from({ length: 6 }, () => Math.trunc(rand() * 0x7fffffff));
      this.sprites = sky.map(colors => variants.map(seed => cloudSprite(colors, seed)));
      this.distant = Array.from({ length: 24 }, (_, i) => ({
        x: rand(), y: rand(), span: 95 + rand() * 155, speed: 4 + rand() * 13, phase: rand() * tau,
        variant: i % variants.length,
      }));
      this.stars = Array.from({ length: 170 }, () => ({ x: rand(), y: rand(), size: 0.5 + rand() ** 4 * 2.1 }));
    }

    drawLayout(ctx, sigma) {
      const { w, h, scale } = this;
      const mode = Math.round(this.settings.time);
      const colors = sky[mode];
      ctx.fillStyle = gradient(ctx, w * 0.51, 0, -w * 0.24, h, colors.slice(0, 3));
      ctx.fillRect(0, 0, w, h);
      if (mode === 2) {
        for (const { x, y, size } of this.stars) ellipse(ctx, x * w, y * h, size * scale, size * scale, '#fff6d4bb');
      }
      const sunX = w * 0.77, sunY = h * (mode ? 0.22 : 0.12);
      if (clearOfIcons(this.icons, sunX, sunY, 52 * scale, 52 * scale)) {
        const radius = (mode === 2 ? 28 : 37) * scale;
        const glow = ctx.createRadialGradient(sunX, sunY, radius * 0.8, sunX, sunY, radius * 3.8);
        glow.addColorStop(0, mode === 2 ? '#faeec65a' : '#ffedb783');
        glow.addColorStop(1, '#ffedb700');
        ellipse(ctx, sunX, sunY, radius * 3.8, radius * 3.8, glow);
        ellipse(ctx, sunX, sunY, radius, radius, mode === 2 ? '#f4e9cf' : '#ffebba');
      }
      this.anchors = this.icons.map(icon => ({
        x: icon.x + icon.w * 0.5, y: icon.y + icon.h * 0.5,
        width: icon.w + sigma * 2.2, height: icon.h + sigma * 2,
      }));
      this.terrain.setIcons(this.icons, sigma + 15 * scale, true);
      if (!this.icons.length) return;
      const randAt = (x, y, salt) =>
        random(this.settings.seed ^ Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(salt, 83492791))();
      const distance = (x, y) => -this.terrain.at(x * scale, y * scale) / scale;
      const mass = MeadowClouds.massCircles(w / scale, h / scale, distance, randAt);
      const puffs = [];
      for (let i = 0; i < mass.length; i += 4) {
        puffs.push([mass[i] * scale, mass[i + 1] * scale, mass[i + 2] * scale, mass[i + 3]]);
      }
      const core = this.terrain.outline(57 * scale);
      paintCloud(ctx, core, puffs, colors, this.mask, this.rim, 17 * scale, 9 * scale);
    }

    animate(ctx, clock) {
      const { w, h, scale, settings } = this;
      const mode = Math.round(settings.time);
      for (let i = 0; i < Math.round(this.distant.length * settings.cover); i++) {
        const puff = this.distant[i];
        const width = puff.span * scale;
        const x = (puff.x * (w + width * 2) + clock * puff.speed * scale) % (w + width * 2) - width;
        const y = puff.y * h + Math.sin(clock * 0.22 + puff.phase) * 4 * scale;
        if (this.anchors.some(a => Math.abs(x - a.x) < (width + a.width) * 0.57 &&
          Math.abs(y - a.y) < width * 0.25 + a.height * 0.63)) continue;
        ctx.save();
        ctx.globalAlpha *= mode === 2 ? 0.27 : 0.58;
        ctx.drawImage(this.sprites[mode][puff.variant], x - width / 2, y - width * 0.27, width, width * 0.55);
        ctx.restore();
      }
      const frequency = Math.round(settings.plane);
      if (!frequency || mode === 2) return;
      const period = frequency === 2 ? 19 : 46;
      const progress = (clock + 9) % period / (frequency === 2 ? 16 : 25);
      if (progress > 1) return;
      const x = -90 * scale + (w + 180 * scale) * progress;
      const y = h * 0.32 - Math.sin(progress * 2.1) * h * 0.095;
      if (!clearOfIcons(this.icons, x, y, 35 * scale, 20 * scale)) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.lineWidth = 1.4;
      shape(ctx, [[-145, 4], [-106, 3], [-23, 0]], null, '#fbf4dea0');
      shape(ctx, [[-20, 0], [-11, -5], [20, -5], [23, -1], [14, 2], [-14, 3]], '#f4e6c6', '#5d6476');
      shape(ctx, [[-7, -2], [-1, -12], [7, -12], [4, 1]], '#b86d5c', '#714e54');
      shape(ctx, [[-21, 2], [-15, -3], [-9, -3]], '#b86d5c', '#714e54');
      ctx.restore();
    }
  }

  window.wallpaperScene = {
    scene: new CloudScene(),
    defaults: { seed: 206053, adaptive: 1, sigma: 41, wind: 1, cover: 0.48, time: 0, plane: 1 },
    ranges: { sigma: [12, 125], wind: [0, 2], cover: [0, 1], time: [0, 2], plane: [0, 2] },
    demoHint: 'Drag an icon to move its cloud',
  };
})();
