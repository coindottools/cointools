// Deterministic PRNG so charts look the same on every load.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Random walk with a drift toward the requested trend.
function series(seed, n, trend, steep) {
  const r = rng(seed);
  const drift = (trend === "down" ? -1 : 1) * (steep ? 0.9 : 0.35);
  const pts = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += drift + (r() - 0.5) * (steep ? 3.2 : 2.4);
    pts.push(steep ? v * (0.4 + i / n) : v);
  }
  return pts;
}

function toPath(pts, w, h, pad = 2) {
  const min = Math.min(...pts), max = Math.max(...pts);
  const span = max - min || 1;
  return pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = pad + (1 - (p - min) / span) * (h - pad * 2);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
}

const NS = "http://www.w3.org/2000/svg";
let gradId = 0;

function drawSparkline(svg, { area = false, n = 28 } = {}) {
  const w = 100, h = 40;
  const trend = svg.dataset.trend || "up";
  const color = trend === "down" ? "#ef4444" : "#22c55e";
  const pts = series(Number(svg.dataset.seed) || 1, n, trend, svg.dataset.steep);
  const d = toPath(pts, w, h);

  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  if (area) {
    const id = `g${gradId++}`;
    svg.innerHTML =
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${color}" stop-opacity=".25"/>` +
      `<stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${d}L${w},${h}L0,${h}Z" fill="url(#${id})"/>`;
  }
  const line = document.createElementNS(NS, "path");
  line.setAttribute("d", d);
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "1.6");
  line.setAttribute("vector-effect", "non-scaling-stroke");
  line.setAttribute("stroke-linejoin", "round");
  svg.appendChild(line);
}

document.querySelectorAll("svg.spark").forEach((s) => drawSparkline(s, { n: 22 }));
document.querySelectorAll("svg.chart").forEach((s) => drawSparkline(s, { area: true, n: 60 }));

// Search: ⌘K / Ctrl+K and "/" focus the box; "Try" chips fill it.
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
document.querySelectorAll("[data-focus-search]").forEach((b) =>
  b.addEventListener("click", () => search.focus())
);
document.querySelectorAll("[data-try]").forEach((b) =>
  b.addEventListener("click", () => {
    search.value = b.dataset.try;
    search.focus();
  })
);

// Market cap calculator preview: price = mcap / supply, editing price updates mcap.
const calc = document.querySelector("[data-mcap-calc]");
if (calc) {
  const f = (k) => calc.querySelector(`[data-f="${k}"]`);
  const num = (el) => parseFloat(el.value.replace(/[^0-9.]/g, "")) || 0;
  const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
  const priceFmt = (n) => fmt(n, n >= 1 ? 2 : n >= 0.01 ? 4 : 8);

  calc.addEventListener("input", (e) => {
    const k = e.target.dataset.f;
    const supply = num(f("supply"));
    if ((k === "mcap" || k === "supply") && supply) f("price").value = priceFmt(num(f("mcap")) / supply);
    if (k === "price") f("mcap").value = fmt(num(f("price")) * supply);
  });
  calc.addEventListener("focusout", (e) => {
    const el = e.target;
    if (el.dataset.f === "price") el.value = priceFmt(num(el));
    else el.value = fmt(num(el));
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
