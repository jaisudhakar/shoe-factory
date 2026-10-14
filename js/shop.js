/* Shop page: filters, sorting and the animated product grid. */
(() => {
  const { $, $$, icon, cardHTML, bindCards, bindTilt } = window.VOLT;
  const { products, colors } = window.VOLT_DATA;

  const CATS = ['Runners', 'Lifestyle', 'Trail', 'Basketball'];
  const SIZES = [6, 7, 8, 9, 10, 11, 12, 13];
  const COLOR_KEYS = ['mint', 'pink', 'white', 'stealth', 'blue', 'violet', 'ember', 'olive', 'taupe'];

  const params = new URLSearchParams(location.search);
  const state = {
    cats: new Set(params.getAll('cat').filter((c) => CATS.includes(c))),
    sizes: new Set(),
    colors: new Set(),
    under: false,
    sort: 'featured',
  };

  const filtersEl = $('.filters');
  const grid = $('.grid');

  const section = (key, title, body) => `
    <div class="filter" data-filter="${key}">
      <button class="filter__head mono" aria-expanded="true">${title}${icon.chevron}</button>
      <div class="filter__body"><div><div class="filter__inner">${body}</div></div></div>
    </div>`;

  const check = (name, value, label, n, checked) => `
    <label class="check">
      <input type="checkbox" name="${name}" value="${value}" ${checked ? 'checked' : ''}>
      <span class="box">${icon.check}</span>${label}<span class="n">${n}</span>
    </label>`;

  function renderFilters() {
    const count = (c) => products.filter((p) => p.category === c).length;
    filtersEl.innerHTML =
      section('cat', 'Category',
        check('all', 'all', 'All Sneakers', products.length, state.cats.size === 0) +
        CATS.map((c) => check('cat', c, c, count(c), state.cats.has(c))).join('')) +
      section('size', 'Size',
        `<div class="sizes">${SIZES.map((s) => `<button class="size-btn" data-size="${s}" aria-pressed="false">${s}</button>`).join('')}</div>`) +
      section('color', 'Color',
        `<div class="swatches">${COLOR_KEYS.map((k) => `<button class="swatch" data-color="${k}" style="--c:${colors[k].hex}" aria-label="${colors[k].name}" title="${colors[k].name}" aria-pressed="false"></button>`).join('')}</div>`) +
      `<div class="filter"><div class="filter__inner" style="padding-top:18px">${check('under', '150', 'Under $150', products.filter((p) => p.price < 150).length, false)}</div></div>` +
      `<button class="clear-btn mono" data-clear>Clear all filters</button>`;
  }

  function matches(p) {
    if (state.cats.size && !state.cats.has(p.category)) return false;
    if (state.sizes.size && ![...state.sizes].some((s) => p.sizes.includes(s) && !p.soldOut.includes(s))) return false;
    if (state.colors.size && !p.colors.some((c) => state.colors.has(c.key))) return false;
    if (state.under && p.price >= 150) return false;
    return true;
  }

  function sorted(list) {
    const l = [...list];
    if (state.sort === 'price-asc') l.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') l.sort((a, b) => b.price - a.price);
    if (state.sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }

  function renderGrid() {
    const list = sorted(products.filter(matches));
    $('[data-count]').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.length
      ? list.map((p, i) => cardHTML(p, i)).join('')
      : `<div class="grid-empty"><strong>No pairs match.</strong>Try loosening a filter — or <button class="mint" data-clear>clear them all</button>.</div>`;
    // Show the swatch that matched the colour filter, if any.
    if (state.colors.size) {
      $$('.card', grid).forEach((card) => {
        const dot = $$('.dot', card).find((d) => state.colors.has(d.dataset.color));
        if (dot && !dot.classList.contains('is-on')) dot.click();
      });
    }
    bindTilt(grid);
    const qs = new URLSearchParams();
    state.cats.forEach((c) => qs.append('cat', c));
    history.replaceState(null, '', qs.toString() ? `?${qs}` : location.pathname);
  }

  filtersEl.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'all') state.cats.clear();
    if (t.name === 'cat') t.checked ? state.cats.add(t.value) : state.cats.delete(t.value);
    if (t.name === 'under') state.under = t.checked;
    $('input[name="all"]', filtersEl).checked = state.cats.size === 0;
    $$('input[name="cat"]', filtersEl).forEach((i) => { i.checked = state.cats.has(i.value); });
    renderGrid();
  });

  document.addEventListener('click', (e) => {
    const head = e.target.closest('.filter__head');
    if (head) {
      const f = head.closest('.filter');
      f.classList.toggle('is-collapsed');
      head.setAttribute('aria-expanded', !f.classList.contains('is-collapsed'));
    }
    const size = e.target.closest('[data-size]');
    if (size) {
      const s = Number(size.dataset.size);
      state.sizes.has(s) ? state.sizes.delete(s) : state.sizes.add(s);
      size.classList.toggle('is-on');
      size.setAttribute('aria-pressed', state.sizes.has(s));
      renderGrid();
    }
    const sw = e.target.closest('.swatch[data-color]');
    if (sw) {
      const k = sw.dataset.color;
      state.colors.has(k) ? state.colors.delete(k) : state.colors.add(k);
      sw.classList.toggle('is-on');
      sw.setAttribute('aria-pressed', state.colors.has(k));
      renderGrid();
    }
    if (e.target.closest('[data-clear]')) {
      state.cats.clear(); state.sizes.clear(); state.colors.clear(); state.under = false;
      renderFilters();
      renderGrid();
    }
    if (e.target.closest('[data-filters-open]')) document.body.classList.add('is-filters-open');
    if (e.target.closest('[data-filters-close]')) document.body.classList.remove('is-filters-open');
  });

  $('[data-sort]').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });

  // Mobile filter drawer reuses the cart scrim styling.
  const scrim = $('[data-filters-close]');
  new MutationObserver(() => {
    const on = document.body.classList.contains('is-filters-open');
    scrim.style.opacity = on ? 1 : '';
    scrim.style.visibility = on ? 'visible' : '';
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  renderFilters();
  renderGrid();
  bindCards(grid);
})();
