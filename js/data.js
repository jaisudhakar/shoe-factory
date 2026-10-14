/* Product catalogue. Colorway `filter` values recolour the same photo, so one
   render can ship in several colourways (mint <-> pink is a 180deg hue swap). */
window.VOLT_DATA = (() => {
  const IMG = 'assets/img/';
  const C = {
    mint: { name: 'Neon Mint', hex: '#7ff0b8', filter: 'none' },
    pink: { name: 'Hot Pink', hex: '#ff4f9a', filter: 'hue-rotate(180deg) saturate(1.15)' },
    white: { name: 'Cloud White', hex: '#f2f4f5', filter: 'none' },
    stealth: { name: 'Stealth', hex: '#2b3034', filter: 'saturate(0.12) brightness(0.92)' },
    olive: { name: 'Moss', hex: '#4c5242', filter: 'saturate(0.55) sepia(0.25)' },
    blue: { name: 'Ice Blue', hex: '#6ea8ff', filter: 'hue-rotate(-28deg)' },
    violet: { name: 'Ultra Violet', hex: '#a46bff', filter: 'none' },
    taupe: { name: 'Sand', hex: '#9b9384', filter: 'saturate(0.35) sepia(0.35)' },
    ember: { name: 'Ember', hex: '#ff8a3d', filter: 'hue-rotate(120deg) saturate(1.3)' },
  };
  const cw = (...keys) => keys.map((k) => ({ key: k, ...C[k] }));

  const products = [
    { id: 'volt-runner-x1', name: 'Volt Runner X1', price: 189, category: 'Runners', badge: 'Bestseller',
      img: IMG + 'runner-x1-card.webp', hero: IMG + 'runner-x1.webp', colors: cw('mint', 'pink', 'stealth'),
      sizes: [6, 7, 8, 9, 10, 11, 12, 13], soldOut: [13],
      tagline: 'Ultra-light. Maximum response.',
      description: 'Ultra-light. Maximum response. The Volt Runner X1 is engineered for those who move different — with next gen cushioning and all-day comfort.',
      gallery: [IMG + 'runner-x1.webp', IMG + 'hero-exploded.webp', IMG + 'x1-pair.webp', IMG + 'x1-side.webp', IMG + 'x1-sole.webp'],
      stats: { speed: 3, cushion: 3, stability: 2 } },
    { id: 'pulse-low', name: 'Pulse Low', price: 149, category: 'Lifestyle',
      img: IMG + 'pulse-low.webp', colors: cw('mint', 'white', 'stealth'), sizes: [6, 7, 8, 9, 10, 11, 12], soldOut: [6],
      tagline: 'Clean lines. Quiet glow.',
      description: 'An everyday low-top with a lit-from-within midsole. Pulse Low pairs a breathable knit upper with soft-rebound foam for city miles.',
      stats: { speed: 2, cushion: 3, stability: 2 } },
    { id: 'nova-high', name: 'Nova High', price: 169, category: 'Basketball',
      img: IMG + 'nova-high.webp', colors: cw('pink', 'white', 'stealth'), sizes: [8, 9, 10, 11, 12, 13], soldOut: [],
      tagline: 'Locked in. Lifted off.',
      description: 'High-top lockdown meets explosive court feel. Nova High wraps the ankle in a sculpted collar and launches you with a responsive forefoot pod.',
      stats: { speed: 2, cushion: 2, stability: 3 } },
    { id: 'ghost-trail', name: 'Ghost Trail', price: 159, category: 'Trail',
      img: IMG + 'ghost-trail.webp', colors: cw('mint', 'olive', 'stealth'), sizes: [7, 8, 9, 10, 11, 12], soldOut: [7],
      tagline: 'Disappear into the wild.',
      description: 'Aggressive 5mm lugs, a rock plate and a camo-knit upper built to shrug off mud, scree and night runs.',
      stats: { speed: 2, cushion: 2, stability: 3 } },
    { id: 'strato-run', name: 'Strato Run', price: 179, category: 'Runners',
      img: IMG + 'strato-run.webp', colors: cw('blue', 'violet', 'stealth'), sizes: [6, 7, 8, 9, 10, 11, 12, 13], soldOut: [],
      tagline: 'Ride the aurora.',
      description: 'A max-stack cruiser with an iridescent supercritical foam that glows from ice blue to violet as you pick up the pace.',
      stats: { speed: 3, cushion: 3, stability: 1 } },
    { id: 'circuit-pro', name: 'Circuit Pro', price: 169, category: 'Lifestyle',
      img: IMG + 'circuit-pro.webp', colors: cw('pink', 'white', 'taupe'), sizes: [6, 7, 8, 9, 10, 11], soldOut: [11],
      tagline: 'Wired for the weekend.',
      description: 'Layered overlays, a chunky circuit-traced sole and a neon pink accent that turns heads from across the street.',
      stats: { speed: 1, cushion: 3, stability: 2 } },
    { id: 'flux-sprint', name: 'Flux Sprint', price: 139, category: 'Runners',
      img: IMG + 'runner-x1-card.webp', colors: cw('pink', 'mint', 'ember'), sizes: [6, 7, 8, 9, 10, 11, 12], soldOut: [12],
      tagline: 'Short distance. Zero mercy.',
      description: 'A stripped-back race flat for track sessions and 5Ks. Flux Sprint keeps the X1 geometry and drops every gram it can.',
      stats: { speed: 3, cushion: 1, stability: 2 } },
    { id: 'echo-low', name: 'Echo Low', price: 129, category: 'Lifestyle',
      img: IMG + 'pulse-low.webp', colors: cw('pink', 'white', 'stealth'), sizes: [6, 7, 8, 9, 10, 11], soldOut: [],
      tagline: 'The everyday echo.',
      description: 'Pulse Low’s easygoing sibling with a pink-lit midsole and a softer, wider last for all-day wear.',
      stats: { speed: 1, cushion: 3, stability: 2 } },
    { id: 'apex-court', name: 'Apex Court', price: 179, category: 'Basketball',
      img: IMG + 'nova-high.webp', colors: cw('mint', 'white', 'stealth'), sizes: [8, 9, 10, 11, 12, 13], soldOut: [8],
      tagline: 'Own the paint.',
      description: 'Nova High’s pro-level twin, tuned with a stiffer shank and mint-lit traction for hard cuts and big landings.',
      stats: { speed: 2, cushion: 3, stability: 3 } },
    { id: 'ridge-trail', name: 'Ridge Trail', price: 169, category: 'Trail',
      img: IMG + 'ghost-trail.webp', colors: cw('ember', 'olive', 'stealth'), sizes: [7, 8, 9, 10, 11, 12, 13], soldOut: [],
      tagline: 'Every summit, faster.',
      description: 'A lighter, faster trail racer with a full-length plate and sticky outsole compound for technical descents.',
      stats: { speed: 3, cushion: 2, stability: 2 } },
    { id: 'circuit-mid', name: 'Circuit Mid', price: 149, category: 'Lifestyle',
      img: IMG + 'circuit-pro.webp', colors: cw('mint', 'white', 'taupe'), sizes: [6, 7, 8, 9, 10, 11, 12], soldOut: [],
      tagline: 'Mid-cut. Full charge.',
      description: 'Circuit Pro raised to a mid-cut with a padded collar and a mint signal stripe.',
      stats: { speed: 1, cushion: 2, stability: 3 } },
    { id: 'strato-ember', name: 'Strato Ember', price: 199, category: 'Runners', badge: 'New',
      img: IMG + 'strato-run.webp', colors: cw('ember', 'pink', 'stealth'), sizes: [7, 8, 9, 10, 11, 12], soldOut: [],
      tagline: 'Burn brighter.',
      description: 'A limited Strato Run with an ember-glow midsole and reflective heel pull for low-light long runs.',
      stats: { speed: 3, cushion: 3, stability: 2 } },
  ];

  // Products whose base photo is a different colourway re-map so the first
  // colour shows the shoe in that colour (e.g. Flux Sprint = pink X1).
  const recolour = {
    'flux-sprint': { pink: C.pink.filter, mint: 'none', ember: C.ember.filter },
    'echo-low': { pink: C.pink.filter, white: 'saturate(0.2) brightness(1.05)', stealth: C.stealth.filter },
    'apex-court': { mint: C.pink.filter, white: 'saturate(0.2) brightness(1.08)', stealth: C.stealth.filter },
    'nova-high': { pink: 'none', white: 'saturate(0.2) brightness(1.08)', stealth: C.stealth.filter },
    'circuit-pro': { pink: 'none', white: 'saturate(0.15) brightness(1.04)', taupe: C.taupe.filter },
    'circuit-mid': { mint: C.pink.filter, white: 'saturate(0.15) brightness(1.04)', taupe: C.taupe.filter },
    'pulse-low': { mint: 'none', white: 'saturate(0.1) brightness(1.05)', stealth: C.stealth.filter },
    'strato-run': { blue: 'hue-rotate(-28deg)', violet: 'hue-rotate(28deg)', stealth: C.stealth.filter },
    'strato-ember': { ember: 'hue-rotate(150deg) saturate(1.3)', pink: 'hue-rotate(80deg) saturate(1.2)', stealth: C.stealth.filter },
    'ghost-trail': { mint: 'none', olive: C.olive.filter, stealth: C.stealth.filter },
    'ridge-trail': { ember: 'hue-rotate(200deg) saturate(1.5)', olive: C.olive.filter, stealth: C.stealth.filter },
  };
  products.forEach((p) => {
    const map = recolour[p.id];
    if (map) p.colors = p.colors.map((c) => ({ ...c, filter: map[c.key] ?? c.filter }));
    if (!p.gallery) p.gallery = [p.img];
    if (!p.hero) p.hero = p.img;
  });

  const byId = (id) => products.find((p) => p.id === id);
  return { products, byId, colors: C };
})();
