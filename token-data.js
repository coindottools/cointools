// Sample token report. This mirrors the shape we expect our backend to return
// for GET /api/token/:chain/:address, so the page can switch to live data later
// by replacing this object with a fetch.
window.SAMPLE_TOKEN = {
  isSample: true,
  updatedMinutesAgo: 4,

  token: {
    name: "Pepe",
    symbol: "PEPE",
    chain: "Ethereum",
    address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    logoEmoji: "🐸",
    tags: ["Meme", "Ethereum", "DEX", "High Liquidity"],
    website: "pepe.vip",
    socials: ["x", "telegram", "discord", "web"],
    age: "1 year, 3 months",
  },

  market: {
    price: 0.00001234,
    change24h: 4.28,
    marketCap: { value: 5.19e9, change: 4.28 },
    volume24h: { value: 612.4e6, change: -12.3 },
    liquidity: { value: 83.4e6, change: 3.1 },
    holders: { value: 1247391, change24h: 2841 },
  },

  analysis: {
    headline: "Strong momentum, but concentrated ownership and thin liquidity relative to valuation.",
    summary:
      "PEPE has shown significant price appreciation (+184% in 72 hours) with increasing volume, but holder growth is relatively low and ownership is more concentrated than it appears. Our analysis shows coordinated wallets and potential exit risks.",
    score: 68,
    scoreBreakdown: [
      { label: "Momentum", value: 82 },
      { label: "Liquidity", value: 58 },
      { label: "Holder Health", value: 46 },
      { label: "Contract Safety", value: 85 },
    ],
    overallRisk: "Moderate",
    insights: [
      { tone: "red", title: "Concentrated Ownership", body: "Top 100 wallets control 48.2% of supply. 17 wallets are connected through common funding sources.", cta: "View wallet map" },
      { tone: "orange", title: "Liquidity Lagging", body: "Market cap increased from $1.8B → $5.2B (+184%) while DEX liquidity only increased from $61M → $83M (+36%).", cta: "View liquidity analysis" },
      { tone: "green", title: "Whales Holding", body: "Of the top 25 non-exchange holders, 21 have not materially reduced their positions during the rally.", cta: "View whale activity" },
      { tone: "blue", title: "Growing Volume", body: "24h volume is up 312% compared to 7 days ago, driven primarily by existing wallets rather than new participants.", cta: "View volume analysis" },
    ],
  },

  keyStats: [
    ["Current Price", "$0.00001234"],
    ["Market Cap", "$5,186,210,000"],
    ["Fully Diluted Value", "$5,186,210,000"],
    ["24H Volume", "$612,438,291"],
    ["Liquidity (DEX)", "$83,395,442"],
    ["Circulating Supply", "420,690,000,000,000"],
    ["Total Supply", "420,690,000,000,000"],
    ["Max Supply", "420,690,000,000,000"],
    ["Holders", "1,247,391"],
    ["Age", "1 year, 3 months"],
  ],

  holderNetwork: {
    connectedWallets: 17,
    sourceWallets: 3,
    connectedSupplyPct: 8.4,
  },

  smartMoney: [
    { wallet: "0x8f12...9a77", action: "Buy", amount: "420.6B", value: "$4.9M", time: "2d ago" },
    { wallet: "0x3c9a...7d44", action: "Buy", amount: "310.2B", value: "$3.6M", time: "2d ago" },
    { wallet: "0xa4e1...d3f0", action: "Accumulate", amount: "125.6B", value: "$1.5M", time: "3d ago" },
    { wallet: "0x77b2...9c11", action: "Accumulate", amount: "98.4B", value: "$1.2M", time: "3d ago" },
    { wallet: "0x6a19...e2d9", action: "Hold", amount: "840.2B", value: "$9.8M", time: "1d ago" },
    { wallet: "0x9144...6b27", action: "Buy", amount: "215.6B", value: "$2.5M", time: "3d ago" },
  ],

  liquidity: {
    stats: [
      ["Total Liquidity", "$83.4M"],
      ["Top Pool (Uniswap V3)", "$61.4M (73.6%)"],
      ["Other Pools", "$22.0M (26.4%)"],
      ["Potential Sell Pressure", "High", "red"],
      ["Est. Price Impact (Top 10)", "-18.4%", "red"],
    ],
  },

  timeline: [
    { date: "Apr 16, 2023", title: "Token deployed", body: "Initial supply minted. Liquidity added to Uniswap.", tone: "green" },
    { date: "Apr 17, 2023", title: "Early accumulation", body: "Several wallets began accumulating large positions.", tone: "green" },
    { date: "May 5, 2023", title: "First viral wave", body: "Social media attention increased significantly.", tone: "orange" },
    { date: "Aug 23, 2023", title: "Major exchange listings", body: "Price increased 420% following exchange listings.", tone: "purple" },
    { date: "Sep 30, 2025", title: "Recent rally", body: "Price up 184% in 72 hours with increased volume.", tone: "red" },
  ],

  transactions: [
    { time: "2m ago", type: "Buy", amount: "1.42B", value: "$17,523", from: "0x6a...3f2", to: "0x7d...9c1" },
    { time: "3m ago", type: "Sell", amount: "5.00B", value: "$61,730", from: "0x1c...8a7", to: "0x4d...2b9" },
    { time: "5m ago", type: "Transfer", amount: "12.30B", value: "$151,782", from: "0x9b...0e4", to: "0x6a...3f2" },
    { time: "8m ago", type: "Buy", amount: "900.0M", value: "$11,103", from: "0x77...2dc", to: "0x8f...4a1" },
    { time: "12m ago", type: "Sell", amount: "3.40B", value: "$41,957", from: "0x2e...9b8", to: "0x3c...72a" },
    { time: "15m ago", type: "Transfer", amount: "20.00B", value: "$246,920", from: "0x44...1f2", to: "0x91...6b2" },
  ],

  contract: [
    "Contract verified",
    "Ownership renounced",
    "No mint function",
    "No blacklist function",
    "No high-risk permissions",
    "Standard ERC-20 implementation",
  ],
};
