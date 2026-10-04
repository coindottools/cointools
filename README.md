# coin.tools

Understand any coin: real-time intelligence for tokens, wallets, contracts and transactions.

## Run locally

It's a static site with no build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

- `index.html`: landing page markup and the inline SVG icon sprite
- `styles.css`: dark theme, layout, and responsive breakpoints
- `main.js`: placeholder charts (demo chart with timeframe tabs, card decorations, mini tool visuals), hero globe canvas, code-sample tabs, and search shortcuts (⌘K and `/`)

- `token.html` + `token.css` + `token.js`: token report page (opened by searching on the homepage, e.g. `token.html?q=0x...`)
- `token-data.js`: sample token report (PEPE). Its shape is the planned API response, so going live means swapping this object for a fetch.

All numbers are placeholder/sample data for now.
