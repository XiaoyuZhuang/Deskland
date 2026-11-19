/* Circle geometry shared by Meadow and Sky. */
(() => {
  const sstep = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

  function skyCircles(rnd) {
    const R = 95 * 1.2;                 // 轮廓大一些（云厚一些，才放得下大圆）；圆的大小还是按 95 算
    // 1) 大致的轮廓：底下一排大圆（中间大、两边小），上面再堆几个 → 底宽上窄的一团
    const n = 3 + Math.floor(rnd() * 3), w = R * (1.0 + n * 0.5);
    const body = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5, r = R * (0.6 - Math.abs(t) * 0.45 + rnd() * 0.12);
      body.push([t * w, -r * 0.55, r]);
    }
    for (let i = 0; i < n - 1; i++) {
      const t = n === 2 ? 0 : i / (n - 2) - 0.5, r = R * (0.55 + rnd() * 0.25);
      body.push([t * w * 0.6 + (rnd() - 0.5) * R * 0.4, -R * (0.5 + rnd() * 0.35), r]);
    }
    if (rnd() < 0.6) body.push([(rnd() - 0.5) * w * 0.3, -R * 1.05, R * (0.4 + rnd() * 0.15)]);
    // 离轮廓边多远（<0 在云里）
    const ciOf = (px, py) => { let d = 1e9; for (const [cx, cy, r] of body) d = Math.min(d, Math.hypot(px - cx, py - cy) - r); return d; };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [cx, cy, r] of body) { x0 = Math.min(x0, cx - r); x1 = Math.max(x1, cx + r); y0 = Math.min(y0, cy - r); y1 = Math.max(y1, cy + r); }
    // 2) 和图标下方的云一样：每层一张格子、每格随机一个圆，圆心要在轮廓里，越靠边越小；
    //    小圆、很小的圆只长在靠边的一圈，而且要和比它大的圆叠住一截（不会有飘在外面的小点）
    const circles = [];
    const S = 0.62 / 1.2;                                     // 中圆的格子和原来一样大（59px）
    const layer = (G, size, band, bandFn, attach) => {
      for (let gy = Math.floor((y0 - G) / G); gy <= Math.ceil((y1 + G) / G); gy++) for (let gx = Math.floor((x0 - G) / G); gx <= Math.ceil((x1 + G) / G); gx++) {
        const px = (gx + 0.1 + rnd() * 0.8) * G, py = (gy + 0.1 + rnd() * 0.8) * G;
        const ci = ciOf(px, py);
        if (ci > 0 || ci < band) continue;
        let r = G * (size[0] + (size[1] - size[0]) * rnd()) * bandFn(ci);
        if (attach) {
          let att = 0;
          for (const [cx, cy, cr] of circles) att = Math.max(att, sstep(0.2 * r, 0.6 * r, cr + r - Math.hypot(cx - px, cy - py)));
          r *= att;
        }
        r *= sstep(5, 11, r);
        if (r > 0.5) circles.push([px, py, r, rnd()]);
      }
    };
    const Rm = R * S;
    // 大圆：只长在云厚的地方（圆心在轮廓里够深），云里就有几个大圆弧
    const Gb = 90;
    layer(Gb, [0.55, 0.85], -1e9, ci => sstep(-0.2 * Gb, -0.65 * Gb, ci), false);
    layer(Rm, [0.6, 0.95], -1e9, ci => sstep(-0.1 * Rm, -0.7 * Rm, ci), false);
    // 云的深处圆之间不能有缝：轮廓的大圆缩一点垫在底下
    for (const [cx, cy, r] of body) if (r > 0.75 * Rm) circles.push([cx, cy, r - 0.75 * Rm, rnd()]);
    layer(34 * 0.85, [0.5, 0.9], -1.0 * Rm, ci => sstep(-0.05 * Rm, -0.35 * Rm, ci) * (1 - sstep(-0.7 * Rm, -1.0 * Rm, ci)), true);
    layer(24 * 0.85, [0.45, 0.8], -0.6 * Rm, ci => sstep(0, -0.2 * Rm, ci) * (1 - sstep(-0.4 * Rm, -0.6 * Rm, ci)), true);
    return { circles, hw: Math.max(-x0, x1) + 20 };
  }

  function massCircles(W, H, distance, rnd1, flowT = 0) {
    const list = [];
    // 图标周围的云团：三层圆（大 / 小 / 很小），每层是一张固定的格子，每格随机放一个圆。
    // 圆的基础大小只看圆心在云团里多深，图标不动就不变；显不显示也按基础大小决定，
    // 最后才乘上很轻（±4%）、很慢（一圈 50~70 秒）的"呼吸" → 圆的大小不会忽大忽小
    const R = 95;
    // big：大圆按格子存起来（用基础大小，不含呼吸），小圆要找得到挨着的大圆
    const big = new Map();
    const layer = (G, k0, size, band, isBig) => {
      for (let cy = -Math.ceil(2 * R / G); cy <= Math.ceil((H + 2 * R) / G); cy++) for (let cx = -Math.ceil(2 * R / G); cx <= Math.ceil((W + 2 * R) / G); cx++) {
        const ox = rnd1(cx, cy, k0), oy = rnd1(cx, cy, k0 + 1), rr = rnd1(cx, cy, k0 + 2), ph = rnd1(cx, cy, k0 + 3);
        const x = (cx + 0.1 + ox * 0.8) * G, y = (cy + 0.1 + oy * 0.8) * G;
        const ci = distance(x, y);                        // 圆心处离云团边多远（<0 在云团里）
        if (ci > 0 || ci < band[1] - 10) continue;
        let r = G * (size[0] + (size[1] - size[0]) * rr) * band[2](ci);
        // 要和云团连在一起：碰得到主体（主体边在 ci = -0.6R 处），或（小圆）和某个大圆叠住一截
        const gap = ci + 0.6 * R;
        let att = sstep(gap - 4, gap + 12, r);
        if (!isBig) {
          const bx = Math.floor(x / R), by = Math.floor(y / R);
          for (let j = by - 1; j <= by + 1; j++) for (let i = bx - 1; i <= bx + 1; i++) {
            const o = big.get(i + ',' + j);
            if (!o) continue;
            const ov = o[2] + r - Math.hypot(o[0] - x, o[1] - y);        // 叠住了多少
            att = Math.max(att, sstep(0.2 * r, 0.6 * r, ov));
          }
        }
        r *= att;
        r *= sstep(5, 11, r);                                   // 太小的圆慢慢缩没，不留小点
        if (r < 0.5) continue;
        if (isBig) big.set(cx + ',' + cy, [x, y, r]);
        list.push(x, y, r * (1 + 0.04 * Math.sin(flowT * (0.09 + 0.035 * ph) + ph * 6.283)), ph);
      }
    };
    // 大圆：圆心在云团里，越靠云边越小
    layer(R, 1, [0.55, 0.9], [0, -1e9, ci => sstep(-0.15 * R, -0.8 * R, ci)], true);
    // 小圆：靠云边的一圈（再往里会被大圆盖住，看不见）
    layer(34, 11, [0.5, 0.9], [0, -1.0 * R, ci => sstep(-0.05 * R, -0.3 * R, ci) * (1 - sstep(-0.7 * R, -1.0 * R, ci))], false);
    // 很小的圆：贴着云边一圈，让轮廓上的小鼓包更多
    layer(24, 21, [0.45, 0.8], [0, -0.6 * R, ci => sstep(0, -0.15 * R, ci) * (1 - sstep(-0.4 * R, -0.6 * R, ci))], false);
    return list;
  }

  window.MeadowClouds = { skyCircles, massCircles };
})();
