/* Shared chrome + behaviour: header, cart drawer, search, cursor, reveals. */
(() => {
  const { products, byId } = window.VOLT_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + n.toLocaleString('en-US');

  const icon = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.5 3.5h2.6l2.3 11.2h11.1l2-8H6.3"/><circle cx="9.3" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l14 14M19 5 5 19"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12H5m6-6-6 6 6 6"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M12 5v14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 6.5h16M9.5 6.5V4h5v2.5M6 6.5l1 13.5h10l1-13.5M10 10v7M14 10v7"/></svg>',
    truck: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 8h16v14H3zM19 13h6l4 5v4H19"/><circle cx="9" cy="23.5" r="2.3" fill="#101417"/><circle cx="24" cy="23.5" r="2.3" fill="#101417"/></svg>',
    box: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M16 4 27 9.5v13L16 28 5 22.5v-13zM5 9.5 16 15l11-5.5M16 15v13M10.5 6.8l11 5.5"/></svg>',
    shield: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M16 4 26 8v7c0 6.5-4.2 11-10 13-5.8-2-10-6.5-10-13V8z"/><path d="m11.5 16 3.2 3.2 6-6.4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 15 6-6 6 6"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h16M4 16h10"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V3.5a1.5 1.5 0 0 1 3 0V10m0-4a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7S6 19 4.8 16.4L3.4 13a1.5 1.5 0 0 1 2.6-1.5L9 15"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  };

  /* ---------------- Storage helpers ---------------- */

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } },
  };

  /* ---------------- Chrome ---------------- */

  const page = document.body.dataset.page;
  const navLink = (href, label, key) => `<a href="${href}" class="${page === key ? 'is-active' : ''}">${label}</a>`;

  function renderChrome() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container site-header__inner">
        <a href="index.html" class="logo" aria-label="VOLT home">${'VOLT'.split('').map((l) => `<span data-l="${l}">${l}</span>`).join('')}</a>
        <nav class="nav" aria-label="Primary">
          ${navLink('shop.html', 'Shop', 'shop')}
          ${navLink('index.html#collections', 'Collections', 'collections')}
          ${navLink('index.html#story', 'Story', 'story')}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" data-search-open aria-label="Search">${icon.search}</button>
          <span class="divider"></span>
          <button class="cart-btn" data-cart-open aria-label="Open cart">${icon.cart}<span class="label">Cart</span><span class="cart-count">(0)</span></button>
          <button class="icon-btn burger" data-menu aria-label="Menu" aria-expanded="false">${icon.menu}</button>
        </div>
      </div>`;
    document.body.prepend(header);

    const menu = document.createElement('nav');
    menu.className = 'mobile-menu';
    menu.setAttribute('aria-label', 'Mobile');
    menu.innerHTML = `<a href="shop.html">Shop</a><a href="index.html#collections">Collections</a><a href="index.html#story">Story</a>`;
    header.after(menu);

    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-scrim" data-cart-close></div>
      <aside class="drawer" aria-label="Your cart" aria-hidden="true">
        <div class="drawer__head">
          <h2>Your cart</h2>
          <button class="icon-btn drawer__close" data-cart-close aria-label="Close cart">${icon.close}</button>
        </div>
        <div class="drawer__items"></div>
        <div class="drawer__foot">
          <div class="subtotal"><span>Subtotal</span><strong data-subtotal>$0</strong></div>
          <button class="btn btn--mint btn--block btn--lg" data-checkout data-magnetic><span>Checkout</span>${icon.arrow}</button>
          <div class="ship-note">${icon.truck}<span data-ship-msg>Free shipping on orders over $100</span></div>
          <div class="ship-bar"><i data-ship-bar style="width:0"></i></div>
        </div>
      </aside>
      <div class="search" role="dialog" aria-label="Search">
        <div class="search__box">
          <button class="icon-btn search__close" data-search-close aria-label="Close search">${icon.close}</button>
          <p class="mono">// Search the drop</p>
          <input class="search__input" type="search" placeholder="Runner, trail, pink…" autocomplete="off">
        </div>
        <div class="search__results"></div>
      </div>
      <div class="toast" role="status" aria-live="polite"><i>${icon.check}</i><span></span></div>
      <div class="wipe"></div>
      <div class="cursor"></div>`);

    const footer = $('#site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="index.html" class="logo">VOLT</a>
              <p style="color:var(--muted);max-width:340px;margin-top:18px">Next gen performance sneakers for a brighter tomorrow. Get first access to every drop.</p>
              <form class="newsletter" data-newsletter>
                <label class="sr-only" for="nl">Email</label>
                <input id="nl" type="email" placeholder="you@volt.run" required>
                <button type="submit">Join</button>
              </form>
            </div>
            <div><h4 class="mono">Shop</h4><ul><li><a href="shop.html?cat=Runners">Runners</a></li><li><a href="shop.html?cat=Lifestyle">Lifestyle</a></li><li><a href="shop.html?cat=Trail">Trail</a></li><li><a href="shop.html?cat=Basketball">Basketball</a></li></ul></div>
            <div><h4 class="mono">Support</h4><ul><li><a href="#">Size guide</a></li><li><a href="#">Shipping</a></li><li><a href="#">30-day returns</a></li><li><a href="#">Warranty</a></li></ul></div>
            <div><h4 class="mono">Follow</h4><ul><li><a href="#">Instagram</a></li><li><a href="#">TikTok</a></li><li><a href="#">YouTube</a></li><li><a href="#">Strava club</a></li></ul></div>
          </div>
          <div class="footer-mega" aria-hidden="true">VOLT</div>
          <div class="footer-bottom mono"><span>© ${new Date().getFullYear()} Volt Footwear</span><span>Built for a brighter tomorrow</span></div>
        </div>`;
      const mega = $('.footer-mega', footer);
      footer.addEventListener('pointermove', (e) => {
        const r = mega.getBoundingClientRect();
        mega.style.setProperty('--fx', ((e.clientX - r.left) / r.width) * 100 + '%');
      });
      $('[data-newsletter]', footer).addEventListener('submit', (e) => {
        e.preventDefault();
        e.target.reset();
        toast("You're on the list. Next drop lands in your inbox.");
      });
    }
  }

  /* ---------------- Cart ---------------- */

  const CART_KEY = 'volt-cart-v1';
  const FREE_SHIP = 100;
  let cart = store.get(CART_KEY, null);
  if (!cart) {
    // Seed so the first visit matches the design: two pairs already in the bag.
    cart = [
      { id: 'volt-runner-x1', size: 10, color: 'mint', qty: 1 },
      { id: 'pulse-low', size: 9, color: 'white', qty: 1 },
    ];
    store.set(CART_KEY, cart);
  }
  const lineKey = (l) => `${l.id}|${l.size}|${l.color}`;
  const save = () => store.set(CART_KEY, cart);

  function cartCount() { return cart.reduce((n, l) => n + l.qty, 0); }
  function cartTotal() { return cart.reduce((n, l) => n + (byId(l.id)?.price || 0) * l.qty, 0); }

  function renderCart({ bump = false } = {}) {
    const count = $('.cart-count');
    if (count) {
      count.textContent = `(${cartCount()})`;
      if (bump) { count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump'); }
    }
    const list = $('.drawer__items');
    if (!list) return;
    const open = document.body.classList.contains('is-cart-open');
    if (!cart.length) {
      list.innerHTML = `<div class="cart-empty">${icon.cart}<p>Your cart is empty — for now.</p><a href="shop.html" class="btn btn--ghost">Shop the drop ${icon.arrow}</a></div>`;
    } else {
      list.innerHTML = cart.map((l, i) => {
        const p = byId(l.id);
        if (!p) return '';
        const c = p.colors.find((x) => x.key === l.color) || p.colors[0];
        return `
          <div class="cart-item" data-key="${lineKey(l)}" style="transition-delay:${open ? 0 : 0.15 + i * 0.08}s">
            <a href="product.html?id=${p.id}" class="cart-item__img"><img src="${p.img}" alt="${p.name}" style="filter:${c.filter}"></a>
            <div>
              <p class="cart-item__name">${p.name}</p>
              <div class="cart-item__meta">Size ${l.size} · ${c.name}</div>
              <div class="qty">
                <button data-qty="-1" aria-label="Decrease quantity">${icon.minus}</button>
                <output>${l.qty}</output>
                <button data-qty="1" aria-label="Increase quantity">${icon.plus}</button>
              </div>
            </div>
            <div class="cart-item__side">
              <div class="cart-item__price">${money(p.price * l.qty)}</div>
              <button class="remove-btn icon-btn" data-remove aria-label="Remove ${p.name}">${icon.trash}</button>
            </div>
          </div>`;
      }).join('');
    }
    const total = cartTotal();
    tween($('[data-subtotal]'), total);
    const left = FREE_SHIP - total;
    $('[data-ship-msg]').textContent = !cart.length
      ? `Free shipping on orders over ${money(FREE_SHIP)}`
      : left > 0 ? `Add ${money(left)} more for free shipping` : 'Free shipping unlocked on this order';
    $('[data-ship-bar]').style.width = Math.min(100, (total / FREE_SHIP) * 100) + '%';
    $('[data-checkout]').disabled = !cart.length;
  }

  // Animate money values between renders.
  function tween(el, to) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduceMotion || from === to) { el.textContent = money(to); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = money(Math.round(from + (to - from) * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function addToCart({ id, size, color, qty = 1 }) {
    const line = cart.find((l) => lineKey(l) === `${id}|${size}|${color}`);
    if (line) line.qty += qty; else cart.push({ id, size, color, qty });
    save();
    renderCart({ bump: true });
  }

  function openCart() {
    document.body.classList.add('is-cart-open', 'is-locked');
    $('.drawer').setAttribute('aria-hidden', 'false');
    $$('.cart-item').forEach((el, i) => { el.style.transitionDelay = `${0.15 + i * 0.08}s`; });
    setTimeout(() => $('.drawer__close').focus({ preventScroll: true }), 300);
  }
  function closeCart() {
    document.body.classList.remove('is-cart-open', 'is-locked');
    $('.drawer').setAttribute('aria-hidden', 'true');
    $$('.cart-item').forEach((el) => { el.style.transitionDelay = '0s'; });
  }

  function bindCart() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-open]')) { e.preventDefault(); openCart(); }
      if (e.target.closest('[data-cart-close]')) closeCart();
      const item = e.target.closest('.cart-item');
      if (!item) return;
      const line = cart.find((l) => lineKey(l) === item.dataset.key);
      if (!line) return;
      const q = e.target.closest('[data-qty]');
      if (q) {
        line.qty += Number(q.dataset.qty);
        if (line.qty < 1) return removeLine(item, line);
        save();
        renderCart({ bump: true });
      }
      if (e.target.closest('[data-remove]')) removeLine(item, line);
    });

    function removeLine(item, line) {
      item.classList.add('is-removing');
      setTimeout(() => {
        cart = cart.filter((l) => l !== line);
        save();
        renderCart({ bump: true });
      }, 350);
    }

    $('[data-checkout]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (!cart.length) return;
      btn.classList.add('is-loading');
      btn.querySelector('span').textContent = 'Processing…';
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.querySelector('span').textContent = 'Checkout';
        cart = [];
        save();
        renderCart({ bump: true });
        burst(btn);
        toast('Order placed — your pairs are charging up. ⚡');
      }, 1300);
    });
  }

  /* Thumbnail that arcs from the product image into the cart icon. */
  function flyToCart(img) {
    const target = $('.cart-btn');
    if (!img || !target || reduceMotion) return;
    const a = img.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const clone = img.cloneNode();
    clone.className = 'fly';
    Object.assign(clone.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', objectFit: 'contain' });
    document.body.append(clone);
    requestAnimationFrame(() => {
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.06) rotate(-30deg)`;
      clone.style.opacity = '0.4';
    });
    setTimeout(() => clone.remove(), 950);
  }

  /* Little spark burst used for confirmations. */
  function burst(el) {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('i');
      const ang = (i / 16) * Math.PI * 2;
      const dist = 60 + Math.random() * 60;
      Object.assign(s.style, {
        position: 'fixed', zIndex: 140, pointerEvents: 'none',
        left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px',
        width: '6px', height: '6px', borderRadius: '2px',
        background: i % 3 ? 'var(--mint)' : 'var(--pink)',
        boxShadow: '0 0 10px currentColor',
        transition: 'transform .8s cubic-bezier(.22,1,.36,1), opacity .8s',
      });
      document.body.append(s);
      requestAnimationFrame(() => {
        s.style.transform = `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) rotate(${ang * 90}deg)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 850);
    }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('.toast');
    $('span', t).textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2800);
  }

  /* ---------------- Search ---------------- */

  function bindSearch() {
    const wrap = $('.search');
    const input = $('.search__input');
    const results = $('.search__results');
    const open = () => { wrap.classList.add('is-open'); document.body.classList.add('is-locked'); setTimeout(() => input.focus(), 50); run(); };
    const close = () => { wrap.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
    const run = () => {
      const q = input.value.trim().toLowerCase();
      const hits = products.filter((p) => !q || [p.name, p.category, p.tagline, ...p.colors.map((c) => c.name)].join(' ').toLowerCase().includes(q));
      results.innerHTML = hits.length
        ? hits.map((p, i) => `<a class="search__hit" href="product.html?id=${p.id}" style="animation-delay:${i * 0.04}s"><img src="${p.img}" alt="" style="filter:${p.colors[0].filter}"><div><strong>${p.name}</strong><div class="mono" style="margin-top:4px">${p.category}</div></div><span>${money(p.price)}</span></a>`).join('')
        : `<p class="mono" style="text-align:center;padding:40px">No pairs match “${input.value}”</p>`;
    };
    input.addEventListener('input', run);
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-search-open]')) open();
      if (e.target.closest('[data-search-close]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); closeCart(); toggleMenu(false); }
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
  }

  /* ---------------- Header behaviour ---------------- */

  function toggleMenu(force) {
    const menu = $('.mobile-menu');
    const btn = $('[data-menu]');
    const on = force ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', on);
    btn.setAttribute('aria-expanded', on);
    document.body.classList.toggle('is-locked', on);
  }

  function bindHeader() {
    const header = $('.site-header');
    let last = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY;
      header.classList.toggle('is-hidden', y > last && y > 200 && !document.body.classList.contains('is-cart-open'));
      last = y;
    }, { passive: true });
    $('[data-menu]').addEventListener('click', () => toggleMenu());
    $$('.mobile-menu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* ---------------- Motion helpers ---------------- */

  // Wrap each word in a mask so it can slide up.
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.innerHTML = `<span style="--i:${i++}">${part}</span>`;
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.classList.add('split');
  }

  function bindReveals(root = document) {
    $$('[data-split]', root).forEach(split);
    const els = $$('[data-reveal], [data-split]', root).filter((el) => !el.closest('.hero'));
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  function bindCursor() {
    const c = $('.cursor');
    if (!c || matchMedia('(pointer: coarse)').matches || reduceMotion) { c?.remove(); return; }
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('is-live'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('is-live'));
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', (e) => {
      c.classList.toggle('is-hover', !!e.target.closest('a, button, [role=button], label, select'));
      c.classList.toggle('is-drag', !!e.target.closest('[data-drag]'));
    });
  }

  // Buttons lean toward the pointer.
  function bindMagnetic(root = document) {
    if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
    $$('[data-magnetic]', root).forEach((el) => {
      if (el.dataset.magBound) return;
      el.dataset.magBound = '1';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${dx * 14}px, ${dy * 10}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // 3D tilt + spotlight on product cards.
  function bindTilt(root = document) {
    if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
    $$('.card', root).forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = '1';
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------- Product card ---------------- */

  const wishlist = new Set(store.get('volt-wish', []));

  function cardHTML(p, i = 0) {
    const c = p.colors[0];
    return `
      <a class="card" href="product.html?id=${p.id}" style="--i:${i}" data-id="${p.id}">
        <div class="card__top">
          ${p.badge ? `<span class="badge ${p.badge === 'New' ? 'badge--pink' : ''}">${p.badge}</span>` : ''}
          <button class="heart ${wishlist.has(p.id) ? 'is-on' : ''}" data-wish aria-label="Save ${p.name}" aria-pressed="${wishlist.has(p.id)}">${icon.heart}</button>
        </div>
        <div class="card__media">
          <span class="card__shadow"></span>
          <img src="${p.img}" alt="${p.name} in ${c.name}" loading="lazy" style="filter:${c.filter}">
        </div>
        <div class="card__info">
          <div><p class="card__name">${p.name}</p><div class="card__price">${money(p.price)}</div></div>
          <div class="card__dots">${p.colors.map((x, k) => `<button class="dot ${k === 0 ? 'is-on' : ''}" style="--c:${x.hex}" data-color="${x.key}" aria-label="${x.name}"></button>`).join('')}</div>
        </div>
        <button class="quick-add" data-quick>${icon.bolt} Quick add · size ${p.sizes.find((s) => !p.soldOut.includes(s) && s >= 9) || p.sizes[0]}</button>
      </a>`;
  }

  function bindCards(root = document) {
    root.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const p = byId(card.dataset.id);
      const heart = e.target.closest('[data-wish]');
      const dot = e.target.closest('[data-color]');
      const quick = e.target.closest('[data-quick]');
      if (!heart && !dot && !quick) return;
      e.preventDefault();
      if (heart) {
        const on = !wishlist.has(p.id);
        on ? wishlist.add(p.id) : wishlist.delete(p.id);
        heart.classList.toggle('is-on', on);
        heart.setAttribute('aria-pressed', on);
        store.set('volt-wish', [...wishlist]);
        if (on) toast(`${p.name} saved to your wishlist`);
      }
      if (dot) {
        const c = p.colors.find((x) => x.key === dot.dataset.color);
        $$('.dot', card).forEach((d) => d.classList.toggle('is-on', d === dot));
        const img = $('.card__media img', card);
        img.style.filter = c.filter;
        img.alt = `${p.name} in ${c.name}`;
        card.dataset.color = c.key;
      }
      if (quick) {
        const size = p.sizes.find((s) => !p.soldOut.includes(s) && s >= 9) || p.sizes[0];
        addToCart({ id: p.id, size, color: card.dataset.color || p.colors[0].key });
        flyToCart($('.card__media img', card));
        toast(`${p.name} · size ${size} added to cart`);
      }
    });
  }

  /* ---------------- Page transitions ---------------- */

  function bindTransitions() {
    const wipe = $('.wipe');
    if (sessionStorage.getItem('volt-wipe')) {
      sessionStorage.removeItem('volt-wipe');
      wipe.style.transform = 'scaleY(1)';
      requestAnimationFrame(() => { wipe.style.transform = ''; wipe.classList.add('is-out'); });
    }
    if (reduceMotion) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href === location.href) return;
      if (url.pathname === location.pathname && url.hash) return; // same-page anchor
      if (url.href.split('#')[0] === location.href.split('#')[0]) return;
      e.preventDefault();
      sessionStorage.setItem('volt-wipe', '1');
      wipe.classList.remove('is-out');
      wipe.classList.add('is-in');
      setTimeout(() => { location.href = url.href; }, 520);
    });
    // Restore after bfcache back-navigation.
    addEventListener('pageshow', (e) => { if (e.persisted) wipe.classList.remove('is-in'); });
  }

  /* ---------------- Boot ---------------- */

  renderChrome();
  bindHeader();
  bindCart();
  bindSearch();
  bindTransitions();
  renderCart();
  bindCursor();
  if (location.hash === '#cart') openCart();

  window.VOLT = {
    $, $$, icon, money, store, reduceMotion,
    addToCart, openCart, closeCart, flyToCart, toast, burst,
    cardHTML, bindCards, bindTilt, bindMagnetic, bindReveals, split,
  };

  addEventListener('DOMContentLoaded', () => {
    bindReveals();
    bindMagnetic();
  });
})();
