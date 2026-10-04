// Deterministic PRNG so placeholder charts look the same on every load.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Random walk drifting in the requested direction.
function walk(seed, n, drift = 0.35, noise = 2.4) {
  const r = rng(seed);
  const pts = [];
  let v = 0;
  for (let i = 0; i < n; i++) pts.push((v += drift + (r() - 0.5) * noise));
  return pts;
}

function scale(pts, w, h, pad = 2) {
  const min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  return pts.map((p, i) => [(i / (pts.length - 1)) * w, pad + (1 - (p - min) / span) * (h - pad * 2)]);
}
const pathOf = (xy) => xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");

let uid = 0;
function areaSvg(svg, pts, color, { w = 100, h = 40, stroke = 1.6, opacity = 0.3 } = {}) {
  const d = pathOf(scale(pts, w, h));
  const id = `ag${uid++}`;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.innerHTML =
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
    `<path d="${d}L${w},${h}L0,${h}Z" fill="url(#${id})"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
}

function barsSvg(svg, heights, colorFn, { w = 64, h = 44, gap = 2 } = {}) {
  const bw = (w - gap * (heights.length - 1)) / heights.length;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.innerHTML = heights.map((v, i) =>
    `<rect x="${(i * (bw + gap)).toFixed(1)}" y="${(h - v * h).toFixed(1)}" width="${bw.toFixed(1)}" height="${(v * h).toFixed(1)}" rx="1" fill="${colorFn(i, v)}"/>`
  ).join("");
}

// Specialized tool mini visualizations.
document.querySelectorAll("svg.viz").forEach((svg) => {
  const color = svg.dataset.color;
  const kind = svg.dataset.viz;
  if (kind === "line") {
    areaSvg(svg, walk(Number(svg.dataset.seed), 24, 0.45, 2.6), color, { w: 64, h: 44, opacity: 0 });
  } else if (kind === "bars") {
    const shapes = {
      up: [0.2, 0.3, 0.45, 0.6, 0.8, 1],
      down: [1, 0.85, 0.6, 0.45, 0.35, 0.25],
      mixed: [0.35, 0.55, 0.3, 1, 0.5, 0.75],
    };
    const hs = shapes[svg.dataset.shape];
    barsSvg(svg, hs, (i) => color, { gap: 4 });
    svg.querySelectorAll("rect").forEach((r, i) => r.setAttribute("opacity", (0.45 + (i / hs.length) * 0.55).toFixed(2)));
  } else if (kind === "candles") {
    const r = rng(Number(svg.dataset.seed));
    const w = 64, h = 44, n = 7;
    let v = 0.5;
    let out = "";
    for (let i = 0; i < n; i++) {
      const open = v;
      v = Math.min(0.9, Math.max(0.1, v + (r() - 0.42) * 0.35));
      const up = v >= open;
      const top = Math.max(open, v), bot = Math.min(open, v);
      const x = i * (w / n) + 1.5;
      const c = up ? "#22c55e" : "#ef4444";
      out += `<line x1="${x + 3}" x2="${x + 3}" y1="${h - (top + 0.1) * h}" y2="${h - (bot - 0.1) * h}" stroke="${c}" stroke-width="1.2"/>`;
      out += `<rect x="${x}" y="${h - top * h}" width="6" height="${Math.max(4, (top - bot) * h)}" rx="1" fill="${c}"/>`;
    }
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = out;
  }
});

// Main demo chart with timeframe switching.
const TF = {
  "1D": { seed: 42, n: 140, change: "+2.14%", x: ["12:00", "15:00", "18:00", "21:00", "00:00", "03:00", "06:00", "09:00"] },
  "7D": { seed: 7, n: 140, change: "+5.62%", x: ["Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 1", "Oct 2", "Oct 3"] },
  "1M": { seed: 19, n: 120, change: "-3.08%", x: ["Sep 3", "Sep 10", "Sep 17", "Sep 24", "Oct 1"] },
  "3M": { seed: 27, n: 120, change: "+11.4%", x: ["Jul", "Aug", "Sep", "Oct"] },
  "1Y": { seed: 33, n: 120, change: "+38.7%", x: ["Oct", "Dec", "Feb", "Apr", "Jun", "Aug", "Oct"] },
  ALL: { seed: 51, n: 120, change: "+1,204%", x: ["2016", "2018", "2020", "2022", "2024", "2026"] },
};

function drawMain(key) {
  const cfg = TF[key];
  const svg = document.getElementById("main-chart");
  const W = 800, H = 196, VOL = 40;
  const down = cfg.change.startsWith("-");
  const color = down ? "#ef4444" : "#22c55e";
  const pts = walk(cfg.seed, cfg.n, down ? -0.3 : 0.32, 2.6);
  const xy = scale(pts, W, H - VOL - 4, 6);
  const d = pathOf(xy);
  const r = rng(cfg.seed + 1);
  const bw = W / cfg.n;
  let vol = "";
  for (let i = 0; i < cfg.n; i++) {
    const vh = 4 + r() * (VOL - 6);
    vol += `<rect x="${(i * bw).toFixed(1)}" y="${(H - vh).toFixed(1)}" width="${(bw * 0.7).toFixed(2)}" height="${vh.toFixed(1)}" fill="#3b4252" opacity=".55"/>`;
  }
  let grid = "";
  for (let g = 0; g < 5; g++) {
    const y = 6 + g * ((H - VOL - 16) / 4);
    grid += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#1a1f29" stroke-dasharray="2 4"/>`;
  }
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML =
    `<defs><linearGradient id="mainG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
    grid + vol +
    `<path d="${d}L${W},${H - VOL}L0,${H - VOL}Z" fill="url(#mainG)"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;

  // Y axis: label price levels around the current price.
  const base = 3276, spread = Math.max(40, Math.abs(parseFloat(cfg.change)) * 12);
  const yAxis = document.getElementById("y-axis");
  yAxis.innerHTML = [0, 1, 2, 3, 4].map((i) => `<span>${Math.round(base + spread / 2 - (i * spread) / 4).toLocaleString()}</span>`).join("");
  document.getElementById("x-axis").innerHTML = cfg.x.map((t) => `<span>${t}</span>`).join("");

  const ch = document.getElementById("tf-change");
  ch.textContent = cfg.change;
  ch.className = down ? "down" : "up";
}

document.querySelectorAll(".tf button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tf button").forEach((x) => x.classList.toggle("on", x === b));
    drawMain(b.dataset.tf);
  })
);
drawMain("1D");

// Code sample tabs.
document.querySelectorAll(".code-tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".code-tabs button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".code pre").forEach((p) => (p.hidden = p.dataset.code !== b.dataset.lang));
  })
);

// Search: ⌘K / Ctrl+K and "/" focus the box; example chips fill it.
const search = document.getElementById("search");
document.addEventListener("keydown", (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
    e.preventDefault();
    search.focus();
    search.select();
  }
  if (e.key === "Escape" && document.activeElement === search) search.blur();
});
document.querySelectorAll("[data-focus-search]").forEach((b) => b.addEventListener("click", () => search.focus()));
// Searching opens the token report (template for now; see token.html).
document.getElementById("hero-search").addEventListener("submit", (e) => {
  if (!search.value.trim()) { e.preventDefault(); search.focus(); }
});
document.querySelectorAll("[data-try]").forEach((b) =>
  b.addEventListener("click", () => { location.href = `token.html?q=${encodeURIComponent(b.dataset.try)}`; })
);

document.getElementById("year").textContent = new Date().getFullYear();
