/* Sample the coast and trace its outlines only when the desktop layout changes. */
(() => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const cases = [
    [], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 0], [1, 2]], [[0, 2]], [[3, 2]],
    [[2, 3]], [[2, 0]], [[0, 1], [2, 3]], [[2, 1]], [[1, 3]], [[1, 0]], [[0, 3]], [],
  ];

  class WorldMapTerrain {
    static random(seed) {
      let state = seed | 0;
      return () => {
        state = (state + 0x6d2b79f5) | 0;
        let n = Math.imul(state ^ state >>> 15, state | 1);
        n ^= n + Math.imul(n ^ n >>> 7, n | 61);
        return ((n ^ n >>> 14) >>> 0) / 4294967296;
      };
    }

    constructor(width, height, seed, geography = 'continent') {
      this.scale = clamp(Math.min(width, height) / 900, 0.30, 1.50);
      this.step = Math.max(3, 8 * this.scale, Math.max(width, height) / 330);
      this.cols = Math.ceil(width / this.step) + 3;
      this.rows = Math.ceil(height / this.step) + 3;
      this.base = new Float32Array(this.cols * this.rows);
      this.field = new Float32Array(this.base.length);
      this.warp = new Float32Array(this.base.length);
      const rand = WorldMapTerrain.random(seed), phase = rand() * Math.PI * 2;
      const size = Math.min(width, height);
      const basin = (u, v, x, y, rx, ry) =>
        (1 - Math.hypot((u - x) / rx, (v - y) / ry)) * size * Math.min(rx, ry);
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const i = row * this.cols + col;
          const u = (col - 1) * this.step / width, v = (row - 1) * this.step / height;
          const main = basin(u, v, 0.52, 0.51, 0.51, 0.72);
          const north = basin(u, v, 0.61, 0.04, 0.30, 0.25);
          const west = basin(u, v, 0.16, 0.78, 0.28, 0.46);
          const northBay = basin(u, v, -0.036, 0.22, 0.29, 0.29);
          const eastBay = basin(u, v, 0.99, 0.70, 0.25, 0.29);
          const island = basin(u, v, 0.93, 0.94, 0.07, 0.095);
          const roughness = size * (
            0.025 * Math.sin(u * 27 + v * 15 + phase) +
            0.013 * Math.cos(u * 35 - v * 37 - phase) +
            0.005 * Math.sin(u * 97 + v * 81));
          this.warp[i] = this.scale * (
            5 * Math.sin(u * 48 + v * 27 + phase) + 3 * Math.cos(v * 62 - u * 25) +
            1.75 * Math.sin(u * 106 - v * 99));
          let land = Math.max(Math.min(Math.max(main, north, west), -northBay, -eastBay), island) + roughness;
          if (geography === 'islands') {
            land = Math.max(basin(u, v, 0.23, 0.72, 0.091, 0.083), basin(u, v, 0.75, 0.29, 0.088, 0.077),
              basin(u, v, 0.83, 0.76, 0.055, 0.073), basin(u, v, 0.40, 0.36, 0.043, 0.062)) + roughness * 0.28;
          } else if (geography === 'empty') {
            land = -size;
          }
          this.base[i] = row === 0 || col === 0 || row === this.rows - 1 || col === this.cols - 1 ?
            -this.step : land;
        }
      }
    }

    setIcons(icons, sigma, asLand = false) {
      this.field.set(this.base);
      const join = Math.max(10, this.scale * 30);
      const reach = sigma + 10 * this.scale + 9;
      const margin = reach + join * 2 + 12 * this.scale;
      const depth = new Float32Array(this.field.length).fill(Infinity);

      for (const { x, y, w, h } of icons) {
        const left = Math.max(1, Math.floor((x - margin) / this.step) + 1);
        const right = Math.min(this.cols - 2, Math.ceil((x + w + margin) / this.step) + 1);
        const top = Math.max(1, Math.floor((y - margin) / this.step) + 1);
        const bottom = Math.min(this.rows - 2, Math.ceil((y + h + margin) / this.step) + 1);
        for (let row = top; row <= bottom; row++) {
          const py = (row - 1) * this.step;
          const dy = Math.max(y - py, 0, py - y - h);
          for (let col = left; col <= right; col++) {
            const px = (col - 1) * this.step;
            const dx = Math.max(x - px, 0, px - x - w);
            const i = row * this.cols + col;
            const inlet = Math.sqrt(dx * dx + dy * dy) - reach + this.warp[i];
            const blend = Math.max(0, 1 - Math.abs(depth[i] - inlet) / join);
            depth[i] = Math.min(depth[i], inlet) - join * blend * blend * 0.25;
          }
        }
      }
      const direction = asLand ? -1 : 1;
      for (let i = 0; i < depth.length; i++) {
        if (!Number.isFinite(depth[i])) continue;
        const coast = this.field[i] * direction, inlet = depth[i];
        const blend = Math.max(0, 1 - Math.abs(coast - inlet) / join);
        this.field[i] = direction * (Math.min(coast, inlet) - join * blend * blend * 0.25);
      }
    }

    at(x, y) {
      const cx = clamp(x / this.step + 1, 0, this.cols - 1.001);
      const cy = clamp(y / this.step + 1, 0, this.rows - 1.001);
      const left = Math.floor(cx), top = Math.floor(cy), i = top * this.cols + left;
      const fx = cx - left, fy = cy - top;
      const a = this.field[i] * (1 - fx) + this.field[i + 1] * fx;
      const b = this.field[i + this.cols] * (1 - fx) + this.field[i + this.cols + 1] * fx;
      return a * (1 - fy) + b * fy;
    }

    outline(level = 0) {
      const { cols, rows, field, step } = this;
      const joins = new Map();
      const node = id => {
        let point = joins.get(id);
        if (point) return point;
        const i = id >> 1;
        const vertical = id & 1;
        const a = field[i] - level, b = field[i + (vertical ? cols : 1)] - level;
        const t = a / (a - b);
        const x = (i % cols - 1 + (vertical ? 0 : t)) * step;
        const y = (Math.floor(i / cols) - 1 + (vertical ? t : 0)) * step;
        point = { x, y, neighbors: [], visited: false };
        joins.set(id, point);
        return point;
      };

      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const i = row * cols + col;
          const a = field[i] - level, b = field[i + 1] - level;
          const c = field[i + cols + 1] - level, d = field[i + cols] - level;
          const key = Number(a > 0) + 2 * Number(b > 0) + 4 * Number(c > 0) + 8 * Number(d > 0);
          if (key === 0 || key === 15) continue;
          const ambiguous = (key === 5 || key === 10) && a + b + c + d > 0;
          const pairs = cases[ambiguous ? 15 - key : key];
          const edges = [i * 2, (i + 1) * 2 + 1, (i + cols) * 2, i * 2 + 1];
          for (const [from, to] of pairs) {
            const p = node(edges[from]), q = node(edges[to]);
            p.neighbors.push(q);
            q.neighbors.push(p);
          }
        }
      }

      const path = new Path2D();
      for (const start of joins.values()) {
        if (start.visited) continue;
        const points = [];
        let previous, current = start;
        while (current && !current.visited) {
          points.push(current);
          current.visited = true;
          const next = current.neighbors.find(neighbor => neighbor !== previous);
          previous = current;
          current = next;
        }
        if (points.length < 3 || current !== start) continue;
        const end = points.at(-1);
        path.moveTo((end.x + start.x) / 2, (end.y + start.y) / 2);
        for (let i = 0; i < points.length; i++) {
          const p = points[i], next = points[(i + 1) % points.length];
          path.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
        }
        path.closePath();
      }
      return path;
    }
  }

  window.WorldMapTerrain = WorldMapTerrain;
})();
