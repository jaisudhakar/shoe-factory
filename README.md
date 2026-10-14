# VOLT — animated sneaker storefront

A static, animated storefront for the **VOLT Runner X1** sneaker drop. It is built from the four design mockups (hero, product page, shop grid, cart drawer).
It's plain HTML, CSS and vanilla JS, with no build step and no dependencies.

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works. Opening `index.html` straight from disk also works.)

## Pages

| Page | What's animated |
| --- | --- |
| `index.html` | Charging preloader · 3-slide hero carousel (auto-play progress bars, word-by-word headline reveal, shoe swap, rolling price) · floating exploded shoe with mouse parallax and 3D tilt · interactive particle field · callout lines that draw in · marquee · sticky "three layers" scroll scene · draggable collection rail with tilt cards · story text that lights up as you scroll · count-up stats |
| `shop.html` | Live filters (category, size, colour, under $150) and sorting, staggered card entrance, 3D tilt + spotlight cards, colour dots that recolour the shoe, wishlist hearts, hover quick-add |
| `product.html?id=…` | Gallery with drag-to-rotate 3D viewer, colour swatches that recolour the shoe with a spin, size picker (sold-out sizes disabled), add-to-cart fly animation + spark burst, related products |

Shared on every page: a glassy header that hides on scroll, a slide-in cart drawer (quantities, remove, animated subtotal, free-shipping progress), search overlay (press `/`), custom cursor, page-wipe transitions and a mobile menu.
The cart and wishlist persist in `localStorage`. Every animation respects `prefers-reduced-motion`.

## Structure

```
index.html  shop.html  product.html
css/style.css        all styles (design tokens at the top)
js/data.js           product catalogue and colourways
js/app.js            shared chrome: header, cart, search, cursor, reveals, cards
js/home.js           home-page scenes
js/shop.js           filters + grid
js/product.js        product viewer + buy box
assets/img/          shoe artwork cut from the mockups
tools/extract_assets.py  regenerates assets/img from the mockups
```

Colourways are CSS filters on one photo; for example, Hot Pink is a 180° hue swap of the mint shoe. To add a product, add an entry to `js/data.js`.

To regenerate the images, put the four mockups (`1.webp` … `4.webp`, 1536×1024) in a folder and run
`python3 tools/extract_assets.py <folder>` (needs Pillow and NumPy).
