# coin.tools

Every tool you need for crypto: analyze tokens, wallets and transactions, and calculate everything else.

## Run locally

It's a static site with no build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

- `index.html`: landing page markup and the inline SVG icon sprite
- `styles.css`: dark theme, layout, and responsive breakpoints
- `main.js`: sparklines and charts, search shortcuts (⌘K and `/`), and the live market cap calculator preview

Market numbers on the landing page are placeholders for now.
