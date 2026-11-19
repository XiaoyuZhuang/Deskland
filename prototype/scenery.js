/* Cached artwork and canvas primitives for the adaptive scenery pages. */
(() => {
  const tau = Math.PI * 2;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const random = WorldMapTerrain.random;

  function surface(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
  }

  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, tau);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function shape(ctx, points, fill, stroke) {
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

  function gradient(ctx, x, y, width, height, colors) {
    const fill = ctx.createLinearGradient(x, y, x + width, y + height);
    colors.forEach((color, i) => fill.addColorStop(i / (colors.length - 1), color));
    return fill;
  }

  function grain(ctx, w, h, rand, colors, count) {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const size = 0.45 + rand() * 1.25;
      ctx.fillRect(rand() * w, rand() * h, size * 1.4, size);
    }
  }

  function clearOfIcons(icons, x, y, w, h) {
    return icons.every(icon => x + w < icon.x || x - w > icon.x + icon.w ||
      y + h < icon.y || y - h > icon.y + icon.h);
  }

  class CachedScene {
    build(width, height, dpr, params) {
      this.w = width;
      this.h = height;
      this.scale = clamp(Math.min(width, height) / 900, 0.30, 1.45);
      const resolution = Math.min(1, dpr, Math.sqrt(1450000 / (width * height)));
      this.previous = surface(width * resolution, height * resolution);
      this.current = surface(width * resolution, height * resolution);
      this.blend = 1;
      this.initialized = false;
      this.prepare(params);
    }

    setLayout(icons, sigma, _density, snap, params) {
      const ctx = this.previous.getContext('2d');
      if (this.initialized && !snap) {
        ctx.globalAlpha = this.blend;
        ctx.drawImage(this.current, 0, 0);
        ctx.globalAlpha = 1;
        this.blend = 0;
      } else {
        this.blend = 1;
      }
      this.icons = icons;
      this.settings = { ...params };
      const out = this.current.getContext('2d');
      out.setTransform(this.current.width / this.w, 0, 0, this.current.height / this.h, 0, 0);
      this.drawLayout(out, sigma);
      this.initialized = true;
    }

    advance(dt, snap) {
      if (this.blend === 1) return false;
      this.blend = snap ? 1 : Math.min(1, this.blend + dt * 3.1);
      return true;
    }

    paint(ctx, width, height, clock) {
      ctx.setTransform(width / this.w, 0, 0, height / this.h, 0, 0);
      if (this.blend < 1) ctx.drawImage(this.previous, 0, 0, this.w, this.h);
      ctx.save();
      ctx.globalAlpha = this.blend;
      ctx.drawImage(this.current, 0, 0, this.w, this.h);
      this.animate(ctx, clock);
      ctx.restore();
    }
  }

  window.Scenery = { tau, clamp, random, surface, ellipse, shape, gradient, grain, clearOfIcons, CachedScene };
})();
