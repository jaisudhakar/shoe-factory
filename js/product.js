/* Product page: gallery viewer with drag-to-rotate, colour + size pickers. */
(() => {
  const { $, $$, icon, money, reduceMotion, addToCart, openCart, flyToCart, toast, burst, cardHTML, bindCards, bindTilt, bindMagnetic } = window.VOLT;
  const { products, byId } = window.VOLT_DATA;

  const params = new URLSearchParams(location.search);
  const p = byId(params.get('id')) || products[0];
  let color = p.colors.find((c) => c.key === params.get('color')) || p.colors[0];
  let size = p.sizes.find((s) => s >= 8 && !p.soldOut.includes(s)) ?? null;
  let frame = 0;

  document.title = `${p.name} — VOLT`;

  // Single-photo products get extra "angles" from zoomed detail crops
  // (never mirrored, which would flip the logo).
  const frames = p.gallery.length > 1
    ? p.gallery.map((src) => ({ src, t: '' }))
    : [
        { src: p.img, t: '' },
        { src: p.img, t: 'scale(1.9) translate(-14%, 4%)' },
        { src: p.img, t: 'scale(1.9) translate(16%, -2%)' },
        { src: p.img, t: 'rotate(-9deg) scale(1.12)' },
      ];

  /* ---------------- Breadcrumbs ---------------- */

  $('.crumbs').innerHTML = `<a href="shop.html">Shop</a><span>/</span><a href="shop.html?cat=${p.category}">${p.category}</a><span>/</span><span>${p.name}</span>`;

  /* ---------------- Viewer ---------------- */

  const viewer = $('.viewer');
  const stage = $('.viewer__stage');
  const thumbs = $('.thumbs');

  stage.innerHTML = frames.map((f, i) => `<img class="viewer__img ${i === 0 ? 'is-on' : ''}" src="${f.src}" alt="${p.name} view ${i + 1}" draggable="false" data-t="${f.t}">`).join('');
  thumbs.innerHTML = frames.map((f, i) => `<button class="thumb ${i === 0 ? 'is-on' : ''}" role="tab" aria-selected="${i === 0}" aria-label="View ${i + 1}"><img src="${f.src}" alt="" style="transform:${f.t || 'none'}"></button>`).join('');
  const imgs = $$('.viewer__img', stage);
  const thumbBtns = $$('.thumb', thumbs);

  function applyColor() {
    imgs.forEach((im) => { im.style.filter = color.filter + ' drop-shadow(0 40px 50px rgba(0,0,0,.55))'; });
    $$('img', thumbs).forEach((im) => { im.style.filter = color.filter; });
    viewer.style.setProperty('--glow', hexA(color.hex, 0.28));
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function show(i) {
    const prev = frame;
    frame = (i + frames.length) % frames.length;
    imgs.forEach((im, k) => {
      im.classList.toggle('is-on', k === frame);
      im.classList.toggle('is-off-left', k !== frame && (k < frame) === !(prev === frames.length - 1 && frame === 0));
      im.style.transform = k === frame ? (im.dataset.t || 'none') : '';
    });
    thumbBtns.forEach((t, k) => { t.classList.toggle('is-on', k === frame); t.setAttribute('aria-selected', k === frame); });
    $('[data-frame]').textContent = `${String(frame + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
  }

  thumbBtns.forEach((t, i) => t.addEventListener('click', () => show(i)));
  $$('[data-step]', viewer).forEach((b) => b.addEventListener('click', () => show(frame + Number(b.dataset.step))));

  // Drag: the stage tilts in 3D with the pointer; a long enough drag flips to the next angle.
  let dragX = null, dx = 0;
  viewer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    dragX = e.clientX; dx = 0;
    viewer.classList.add('is-grabbing');
    viewer.setPointerCapture(e.pointerId);
  });
  viewer.addEventListener('pointermove', (e) => {
    if (dragX === null) {
      if (reduceMotion || e.pointerType !== 'mouse') return;
      const r = viewer.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -8}deg)`;
      return;
    }
    dx = e.clientX - dragX;
    const rot = Math.max(-40, Math.min(40, dx * 0.25));
    stage.style.transform = `rotateY(${rot}deg) translateX(${dx * 0.15}px)`;
    if (Math.abs(dx) > 140) {
      show(frame + (dx < 0 ? 1 : -1));
      dragX = e.clientX; dx = 0;
    }
  });
  const end = () => {
    if (dragX === null) return;
    if (Math.abs(dx) > 50) show(frame + (dx < 0 ? 1 : -1));
    dragX = null;
    viewer.classList.remove('is-grabbing');
    stage.style.transform = '';
  };
  viewer.addEventListener('pointerup', end);
  viewer.addEventListener('pointercancel', end);
  viewer.addEventListener('pointerleave', () => { if (dragX === null) stage.style.transform = ''; });
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(frame + 1);
    if (e.key === 'ArrowLeft') show(frame - 1);
  });
  viewer.tabIndex = 0;

  /* ---------------- Buy box ---------------- */

  const box = $('.buybox');
  box.innerHTML = `
    <p class="mono">${p.badge ? p.badge + ' · ' : ''}Next gen moves</p>
    <h1 data-split>${p.name}</h1>
    <div class="price">${money(p.price)}</div>
    <p class="desc">${p.description}</p>

    <div class="opt-label"><span>Color<em data-color-name>${color.name}</em></span></div>
    <div class="colors" role="radiogroup" aria-label="Color">
      ${p.colors.map((c) => `<button class="color-opt ${c.key === color.key ? 'is-on' : ''}" role="radio" aria-checked="${c.key === color.key}" data-color="${c.key}" style="--c:${c.hex}"><i></i>${c.name}</button>`).join('')}
    </div>

    <div class="opt-label"><span>Size <em class="mono" style="font-size:11px;letter-spacing:.1em">US</em></span><a href="#" data-size-guide>Size guide ${icon.ext}</a></div>
    <div class="pdp-sizes" role="radiogroup" aria-label="Size">
      ${p.sizes.map((s) => `<button class="size-btn ${s === size ? 'is-on' : ''}" role="radio" aria-checked="${s === size}" data-size="${s}" ${p.soldOut.includes(s) ? 'disabled title="Sold out"' : ''}>${s}</button>`).join('')}
    </div>
    <p class="size-error" data-size-error></p>

    <button class="btn btn--mint btn--block" data-add data-magnetic><span data-add-label>Add to cart</span>${icon.arrow}<span class="arr-end">${icon.arrow}</span></button>
    <button class="btn btn--ghost btn--block" data-buy-now>Express checkout ${icon.bolt}</button>

    <div class="perks">
      <div class="perk">${icon.truck}<div><strong>Free shipping</strong><span>On orders over $100</span></div></div>
      <div class="perk">${icon.box}<div><strong>30-day returns</strong><span>Hassle free</span></div></div>
      <div class="perk">${icon.shield}<div><strong>2 year warranty</strong><span>Built to last</span></div></div>
    </div>`;
  // The add button has a single arrow in the design; keep the trailing one.
  $('[data-add] > svg').remove();

  box.addEventListener('click', (e) => {
    const c = e.target.closest('[data-color]');
    if (c) {
      color = p.colors.find((x) => x.key === c.dataset.color);
      $$('.color-opt', box).forEach((b) => { const on = b === c; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
      const name = $('[data-color-name]', box);
      name.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
      name.textContent = color.name;
      applyColor();
      // A quick spin sells the colour change.
      if (!reduceMotion) stage.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(-25deg) scale(.96)' }, { transform: 'rotateY(0)' }], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' });
      const url = new URL(location.href);
      url.searchParams.set('color', color.key);
      history.replaceState(null, '', url);
    }
    const s = e.target.closest('[data-size]');
    if (s && !s.disabled) {
      size = Number(s.dataset.size);
      $$('.pdp-sizes .size-btn', box).forEach((b) => { const on = b === s; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
      $('[data-size-error]', box).textContent = '';
    }
    if (e.target.closest('[data-size-guide]')) {
      e.preventDefault();
      toast('Runs true to size — between sizes? Go half up.');
    }
    const add = e.target.closest('[data-add]');
    const buy = e.target.closest('[data-buy-now]');
    if (add || buy) {
      if (!size) {
        const err = $('[data-size-error]', box);
        err.textContent = 'Pick a size first.';
        const grid = $('.pdp-sizes', box);
        grid.classList.remove('shake'); void grid.offsetWidth; grid.classList.add('shake');
        return;
      }
      addToCart({ id: p.id, size, color: color.key });
      flyToCart($('.viewer__img.is-on'));
      if (buy) { setTimeout(openCart, 500); return; }
      const label = $('[data-add-label]', add);
      add.classList.add('is-done');
      label.textContent = 'Added to cart ✓';
      burst(add);
      toast(`${p.name} · ${color.name} · size ${size} added`);
      setTimeout(() => { add.classList.remove('is-done'); label.textContent = 'Add to cart'; }, 1800);
    }
  });

  /* ---------------- Related ---------------- */

  const related = products.filter((x) => x.id !== p.id)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 3);
  const rel = $('[data-related]');
  rel.innerHTML = related.map((x, i) => cardHTML(x, i)).join('');
  bindCards(rel);
  bindTilt(rel);
  bindMagnetic(box);

  applyColor();
  show(0);
})();
