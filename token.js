// Renders the token report from a data object (see token-data.js).
(function () {
  const D = window.SAMPLE_TOKEN;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls = "ic") => `<svg class="${cls}"><use href="#i-${name}"/></svg>`;

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const compact = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };
  const pct = (n) => `${n >= 0 ? "▲" : "▼"} ${Math.abs(n)}%`;
  // Small prices keep 4 significant digits: 0.00001234, not 1.234e-5.
  const price = (n) => (n >= 1 ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `$${n.toFixed(Math.max(2, 3 - Math.floor(Math.log10(n))))}`);
  const shortAddr = (a) => (a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a);

  // The address the user searched for (falls back to the sample token's own address).
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").trim();
  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(query) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query);
  const address = isAddress ? query : D.token.address;

  // Header
  const t = D.token, m = D.market;
  document.title = `${t.name} (${t.symbol}) — coin.tools`;
  document.querySelectorAll('[data-bind="name"]').forEach((el) => (el.textContent = t.name));
  document.querySelectorAll('[data-bind="symbol"]').forEach((el) => (el.textContent = t.symbol));
  document.querySelector('[data-bind="logo"]').textContent = t.logoEmoji;
  $("tags").innerHTML = t.tags.map((x) => `<span>${esc(x)}</span>`).join("");
  $("addr").textContent = shortAddr(address);
  $("explorer").href = `https://etherscan.io/token/${encodeURIComponent(address)}`;
  $("copy-addr").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText(address); } catch (_) {}
    const b = e.currentTarget;
    b.classList.add("copied");
    setTimeout(() => b.classList.remove("copied"), 1200);
  });

  $("price").textContent = price(m.price);
  $("price-chg").textContent = pct(m.change24h);
  $("price-chg").className = m.change24h >= 0 ? "g" : "r";

  const stat = (label, value, chg, chgText) =>
    `<div class="tk-stat"><small>${label}</small><b>${value}</b><em class="${chg >= 0 ? "g" : "r"}">${chgText ?? pct(chg)}</em></div>`;
  $("head-stats").innerHTML =
    stat("Market Cap", compact(m.marketCap.value), m.marketCap.change) +
    stat("24H Volume", compact(m.volume24h.value), m.volume24h.change) +
    stat("Liquidity (DEX)", compact(m.liquidity.value), m.liquidity.change) +
    stat("Holders", m.holders.value.toLocaleString(), m.holders.change24h, `▲ +${m.holders.change24h.toLocaleString()} (24h)`);

  // Analysis
  const A = D.analysis;
  $("sample-pill").hidden = !D.isSample;
  $("updated").textContent = `Last updated: ${D.updatedMinutesAgo} minutes ago`;
  $("an-headline").textContent = A.headline;
  $("an-summary").textContent = A.summary;
  $("score").textContent = A.score;
  $("score-ring-num").textContent = A.score;
  $("score-ring").style.setProperty("--v", A.score);
  const scoreTone = (v) => (v >= 70 ? "g" : v >= 50 ? "o" : "r");
  $("score-list").innerHTML =
    A.scoreBreakdown.map((s) => `<li><span>${esc(s.label)}</span><b class="${scoreTone(s.value)}">${s.value}</b></li>`).join("") +
    `<li class="total"><span>Overall Risk</span><b class="o">${esc(A.overallRisk)}</b></li>`;

  const tones = { red: "#ef4444", orange: "#f59e0b", green: "#22c55e", blue: "#60a5fa", purple: "#a78bfa" };
  $("insight-grid").innerHTML = A.insights.map((x, i) => `
    <article class="insight" style="--c:${tones[x.tone]}">
      <h4><i>${i + 1}</i>${esc(x.title)}</h4>
      <p>${esc(x.body)}</p>
      <a href="#" class="btn-outline sm">${esc(x.cta)} ${icon("arrow")}</a>
    </article>`).join("");

  // Key stats (+ website and socials)
  const socialIcon = { x: "x", telegram: "send", discord: "chat", web: "globe" };
  $("key-stats").innerHTML =
    D.keyStats.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("") +
    `<div><dt>Official Site</dt><dd><a class="link" href="https://${esc(t.website)}" target="_blank" rel="noopener">${esc(t.website)} ${icon("ext")}</a></dd></div>` +
    `<div><dt>Socials</dt><dd class="socials">${t.socials.map((s) => `<a href="#" aria-label="${s}">${icon(socialIcon[s])}</a>`).join("")}</dd></div>`;

  // Price & volume chart
  const TF = {
    "1D": { n: 96, seed: 3, x: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"] },
    "7D": { n: 140, seed: 11, x: ["Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 1", "Oct 2", "Oct 3"] },
    "30D": { n: 120, seed: 21, x: ["Sep 4", "Sep 11", "Sep 18", "Sep 25", "Oct 2"] },
    "90D": { n: 120, seed: 29, x: ["Jul", "Aug", "Sep", "Oct"] },
    "1Y": { n: 120, seed: 37, x: ["Oct", "Dec", "Feb", "Apr", "Jun", "Aug", "Oct"] },
  };
  function drawPV(key) {
    const cfg = TF[key], svg = $("pv-chart");
    const W = 600, H = 240, VOL = 90;
    const r = rng(cfg.seed);
    // Price: drift up with a late spike to echo the "+184% in 72h" story.
    const pts = []; let v = 1;
    for (let i = 0; i < cfg.n; i++) {
      const late = i > cfg.n * 0.78 ? 2.4 : 1;
      v = Math.max(0.2, v + (0.012 * late) + (r() - 0.5) * 0.06 * late);
      pts.push(v);
    }
    const min = Math.min(...pts), max = Math.max(...pts);
    const y = (p) => 10 + (1 - (p - min) / (max - min)) * (H - 30);
    const xy = pts.map((p, i) => [(i / (cfg.n - 1)) * W, y(p)]);
    const d = xy.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join("");
    const bw = W / cfg.n;
    let vol = "";
    for (let i = 0; i < cfg.n; i++) {
      const vh = (8 + r() * 30) * (i > cfg.n * 0.75 ? 1.9 : 1) * (0.6 + i / cfg.n * 0.6);
      vol += `<rect x="${(i * bw).toFixed(1)}" y="${(H - vh).toFixed(1)}" width="${(bw * 0.72).toFixed(2)}" height="${vh.toFixed(1)}" fill="#3b82f6" opacity=".55"/>`;
    }
    let grid = "";
    for (let g = 0; g < 4; g++) grid += `<line x1="0" x2="${W}" y1="${10 + g * ((H - 30) / 3)}" y2="${10 + g * ((H - 30) / 3)}" stroke="#1a1f29" stroke-dasharray="2 4"/>`;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML =
      `<defs><linearGradient id="pvG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c55e" stop-opacity=".35"/><stop offset="1" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>` +
      grid + vol + `<path d="${d}L${W},${H}L0,${H}Z" fill="url(#pvG)"/>` +
      `<path d="${d}" fill="none" stroke="#22c55e" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`;
    // Axis labels scaled so the latest point equals the current price.
    const last = pts[pts.length - 1];
    const lvl = (p) => (m.price * p / last).toFixed(6);
    $("pv-y").innerHTML = [max, min + (max - min) * 2 / 3, min + (max - min) / 3, min].map((p) => `<span>${lvl(p)}</span>`).join("");
    $("pv-x").innerHTML = cfg.x.map((s) => `<span>${s}</span>`).join("");
  }
  document.querySelectorAll("#tk-tf button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("#tk-tf button").forEach((x) => x.classList.toggle("on", x === b));
      drawPV(b.textContent);
    })
  );
  drawPV("7D");

  // Holder network graph: a few hubs with clustered wallets around them.
  (function network() {
    const svg = $("net"), r = rng(17);
    const hubs = [
      { x: 70, y: 70, c: "#ef4444", n: 9 }, { x: 140, y: 120, c: "#f59e0b", n: 12 },
      { x: 60, y: 160, c: "#ef4444", n: 8 }, { x: 175, y: 55, c: "#f59e0b", n: 7 },
      { x: 120, y: 190, c: "#60a5fa", n: 6 }, { x: 30, y: 110, c: "#ef4444", n: 5 },
    ];
    let lines = "", dots = "";
    const nodes = [];
    hubs.forEach((h) => {
      for (let i = 0; i < h.n; i++) {
        const a = r() * Math.PI * 2, d = 14 + r() * 32;
        const x = h.x + Math.cos(a) * d, y = h.y + Math.sin(a) * d;
        const c = r() < 0.55 ? "#f59e0b" : r() < 0.5 ? "#64748b" : h.c;
        nodes.push({ x, y, c, s: 1.6 + r() * 1.8 });
        lines += `<line x1="${h.x}" y1="${h.y}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="${h.c === "#60a5fa" ? "ex" : ""}"/>`;
      }
    });
    hubs.forEach((a, i) => hubs.slice(i + 1).forEach((b) => { if (r() < 0.55) lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; }));
    nodes.forEach((n) => (dots += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.s.toFixed(1)}" fill="${n.c}"/>`));
    hubs.forEach((h) => (dots += `<circle cx="${h.x}" cy="${h.y}" r="5.5" fill="${h.c}" style="filter:drop-shadow(0 0 4px ${h.c})"/>`));
    svg.innerHTML = lines + dots;
    const N = D.holderNetwork;
    $("net-callout").innerHTML = `<b>${N.connectedWallets} connected wallets</b>These ${N.connectedWallets} wallets received initial funding from the same ${N.sourceWallets} source wallets and now hold ${N.connectedSupplyPct}% of total supply.`;
  })();

  // Smart money
  $("smart-body").innerHTML = D.smartMoney.map((s) => `
    <tr><td><span class="w-dot"></span><span class="mono">${esc(s.wallet)}</span></td>
    <td class="act-${esc(s.action)}">${esc(s.action)}</td><td>${esc(s.amount)}</td><td>${esc(s.value)}</td><td class="muted">${esc(s.time)}</td></tr>`).join("");

  // Liquidity depth: buy depth falls toward the mid price, sell depth rises away from it.
  (function depth() {
    const svg = $("depth"), r = rng(5);
    const n = 22, bw = 100 / n;
    let out = "";
    for (let i = 0; i < n; i++) {
      const h = 92 - i * 3.6 + r() * 6;
      out += `<rect x="${(i * bw).toFixed(2)}" y="${(100 - h).toFixed(1)}" width="${(bw * 0.8).toFixed(2)}" height="${h.toFixed(1)}" fill="#22c55e" opacity="${(0.45 + (1 - i / n) * 0.5).toFixed(2)}"/>`;
    }
    for (let i = 0; i < n; i++) {
      const h = 8 + i * 3.4 + r() * 6;
      out += `<rect x="${(100 + i * bw).toFixed(2)}" y="${(100 - h).toFixed(1)}" width="${(bw * 0.8).toFixed(2)}" height="${h.toFixed(1)}" fill="#ef4444" opacity="${(0.45 + (i / n) * 0.5).toFixed(2)}"/>`;
    }
    out += `<line x1="100" x2="100" y1="0" y2="100" stroke="#475569" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/>`;
    svg.innerHTML = out;
  })();
  $("liq-stats").innerHTML = D.liquidity.stats.map(([k, v, tone]) => `<div><dt>${esc(k)}</dt><dd class="${tone || ""}">${esc(v)}</dd></div>`).join("");

  // Timeline
  $("timeline-list").innerHTML = D.timeline.map((e) => `
    <li><span class="dot" style="--c:${tones[e.tone]}"></span><time>${esc(e.date)}</time><div><b>${esc(e.title)}</b><span>${esc(e.body)}</span></div></li>`).join("");

  // Transactions
  $("tx-body").innerHTML = D.transactions.map((x) => `
    <tr><td class="muted">${esc(x.time)}</td><td class="act-${esc(x.type)}">${esc(x.type)}</td><td>${esc(x.amount)}</td><td>${esc(x.value)}</td>
    <td><span class="mono">${esc(x.from)}</span><span class="arrow">→</span><span class="mono">${esc(x.to)}</span></td></tr>`).join("");

  // Contract checks
  $("checks").innerHTML = D.contract.map((c) => `<li>${icon("check")}${esc(c)}</li>`).join("");

  // Search: Enter opens a report for whatever was typed; ⌘K / "/" focus the box.
  const search = $("search");
  $("nav-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = search.value.trim();
    if (q) location.href = `token.html?q=${encodeURIComponent(q)}`;
  });
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      e.preventDefault(); search.focus(); search.select();
    }
  });
  if (query) search.value = query;

  // Sidebar: highlight the section in view.
  const links = [...document.querySelectorAll('.tk-side a[href^="#"]')].filter((a) => a.getAttribute("href").length > 1);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting || scrollY < 120) return;
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); if (t && t.id !== "overview") io.observe(t); });
  const setTop = () => { if (scrollY < 120) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#overview")); };
  addEventListener("scroll", setTop, { passive: true });
  requestAnimationFrame(setTop);
})();
