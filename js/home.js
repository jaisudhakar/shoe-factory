/* Home page: preloader, hero carousel, particles, tech scroll scene, story. */
(() => {
  const { $, $$, reduceMotion, cardHTML, bindCards, bindTilt, split } = window.VOLT;
  const { products } = window.VOLT_DATA;

  const hero = $('.hero');
  const slides = [
    { eyebrow: '// Next gen moves', l1: 'Air-light.', l2: 'Lightning fast.', model: 'VOLT RUNNER X1', price: '$189',
      href: 'product.html?id=volt-runner-x1', stats: { speed: 3, cushion: 3, stability: 3 }, color: [127, 240, 184] },
    { eyebrow: '// Limited colourway', l1: 'Glow loud.', l2: 'Run louder.', model: 'X1 · HOT PINK', price: '$189',
      href: 'product.html?id=volt-runner-x1&color=pink', stats: { speed: 3, cushion: 2, stability: 2 }, color: [255, 79, 154] },
    { eyebrow: '// Max stack', l1: 'Float on.', l2: 'Ride the aurora.', model: 'STRATO RUN', price: '$179',
      href: 'product.html?id=strato-run&color=violet', stats: { speed: 2, cushion: 3, stability: 1 }, color: [143, 163, 255] },
  ];
  let current = 0;
  const DURATION = 7000;

  /* ---------------- Preloader ---------------- */

  function runLoader() {
    const loader = $('.loader');
    const pct = $('[data-pct]');
    const logo = $('.loader__logo');
    const fast = reduceMotion || sessionStorage.getItem('volt-seen');
    sessionStorage.setItem('volt-seen', '1');
    const total = fast ? 250 : 1500;
    const imgReady = new Promise((res) => {
      const img = $('[data-shoe="0"] img');
      if (img.complete) res(); else { img.onload = res; img.onerror = res; }
    });
    const t0 = performance.now();
    return new Promise((resolve) => {
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / total);
        const e = 1 - Math.pow(1 - k, 2);
        pct.textContent = Math.round(e * 100);
        logo.style.setProperty('--p', e * 100 + '%');
        if (k < 1) requestAnimationFrame(tick);
        else imgReady.then(() => {
          loader.classList.add('is-done');
          setTimeout(() => loader.remove(), 1100);
          resolve();
        });
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------------- Hero slides ---------------- */

  const title = $('.hero__title');
  const bars = $$('.slider-nav__bars button');
  const ctaPrice = $('.price-swap');
  let timer;

  function renderStats(s) {
    $$('[data-stat]').forEach((el) => {
      const v = s.stats[el.dataset.stat];
      el.innerHTML = [0, 1, 2].map((i) => `<i style="--i:${i}" class="${i < v ? 'on' : ''}"></i>`).join('');
    });
  }

  function setTitle(s) {
    title.innerHTML = `<span class="l1">${s.l1}</span><br><span class="l2">${s.l2}</span>`;
    delete title.dataset.splitDone;
    split(title);
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add('is-in')));
  }

  function swapText(el, text) {
    el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 250, fill: 'forwards' })
      .finished.then(() => {
        el.textContent = text;
        el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      });
  }

  function goTo(i, { user = false } = {}) {
    const next = (i + slides.length) % slides.length;
    if (next === current) return restartTimer();
    const prev = current;
    current = next;
    const s = slides[current];
    hero.dataset.slide = current;

    // Shoe swap
    const prevImg = $(`[data-shoe="${prev}"]`);
    const nextImg = $(`[data-shoe="${current}"]`);
    prevImg.classList.remove('is-active');
    prevImg.classList.add('is-leaving');
    nextImg.classList.remove('is-leaving');
    void nextImg.offsetWidth;
    nextImg.classList.add('is-active');
    setTimeout(() => prevImg.classList.remove('is-leaving'), 1200);

    // Copy
    title.classList.remove('is-in');
    setTimeout(() => setTitle(s), reduceMotion ? 0 : 380);
    swapText($('[data-slide-text="eyebrow"]'), s.eyebrow);
    swapText($('[data-slide-text="model"]'), s.model);
    renderStats(s);
    $('[data-count]').textContent = String(current + 1).padStart(2, '0');
    $('[data-hero-cta]').href = s.href;

    // Price ticker rolls up
    const old = ctaPrice.firstElementChild;
    const neu = document.createElement('span');
    neu.textContent = s.price;
    neu.style.transform = 'translateY(100%)';
    ctaPrice.append(neu);
    requestAnimationFrame(() => {
      old.style.transform = 'translateY(-100%)';
      neu.style.transform = 'none';
    });
    setTimeout(() => old.remove(), 750);

    // Callouts only belong to the exploded view
    $$('.callout').forEach((c) => c.classList.toggle('is-on', current === 0));

    bars.forEach((b, k) => {
      b.classList.remove('is-active');
      b.classList.toggle('is-done', k < current);
    });
    void bars[current].offsetWidth;
    bars[current].classList.add('is-active');
    restartTimer();
    if (user) hero.classList.remove('is-paused');
  }

  function restartTimer() {
    clearTimeout(timer);
    if (reduceMotion) return;
    timer = setTimeout(() => goTo(current + 1), DURATION);
    bars.forEach((b) => b.style.setProperty('--dur', DURATION + 'ms'));
  }

  bars.forEach((b, i) => b.addEventListener('click', () => goTo(i, { user: true })));
  addEventListener('keydown', (e) => {
    if (hero.getBoundingClientRect().bottom < 0) return;
    if (e.key === 'ArrowRight') goTo(current + 1, { user: true });
    if (e.key === 'ArrowLeft') goTo(current - 1, { user: true });
  });

  // Pause the autoplay while the hero is off-screen or the tab is hidden.
  let heroVisible = true;
  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    if (heroVisible) { hero.classList.remove('is-paused'); restartTimer(); } else { clearTimeout(timer); hero.classList.add('is-paused'); }
  }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(timer); hero.classList.add('is-paused'); } else if (heroVisible) { hero.classList.remove('is-paused'); restartTimer(); }
  });

  // Swipe / drag the stage to change slides.
  const stage = $('.hero__stage');
  let sx = null;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 60) goTo(current + (dx < 0 ? 1 : -1), { user: true });
  });

  /* ---------------- Mouse parallax + scroll ---------------- */

  const shoe = $('.shoe');
  const copy = $('.hero__copy');
  let mx = 0, my = 0, tx = 0, ty = 0;
  if (!reduceMotion) {
    hero.addEventListener('pointermove', (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
    hero.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    (function loop() {
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;
      const sy = Math.min(scrollY, innerHeight);
      const k = sy / innerHeight;
      shoe.style.transform = `translate3d(${tx * -40}px, ${ty * -30 + sy * 0.25}px, 0) rotateY(${tx * 14}deg) rotateX(${ty * -10}deg) rotate(${k * -8}deg) scale(${1 - k * 0.12})`;
      copy.style.transform = `translate3d(${tx * 16}px, ${ty * 10 + sy * -0.15}px, 0)`;
      copy.style.opacity = 1 - k * 1.2;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Particles ---------------- */

  function particles() {
    const canvas = $('.hero__canvas');
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const N = innerWidth < 720 ? 40 : 90;
    const pts = [];
    let pmx = -999, pmy = -999;
    let col = slides[0].color.slice();

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener('resize', size);
    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        pink: Math.random() < 0.2,
      });
    }
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pmx = e.clientX - r.left; pmy = e.clientY - r.top;
    });

    function draw() {
      if (!heroVisible) return requestAnimationFrame(draw);
      const target = slides[current].color;
      col = col.map((c, i) => c + (target[i] - c) * 0.04);
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - pmx, dy = p.y - pmy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const f = (1 - d2 / 14400) * 1.6; p.x += (dx / Math.sqrt(d2 + 1)) * f; p.y += (dy / Math.sqrt(d2 + 1)) * f; }
        p.x += p.vx; p.y += p.vy; p.tw += 0.03;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.6 + Math.sin(p.tw) * 0.4);
        const c = p.pink ? [255, 79, 154] : col;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;
        ctx.shadowColor = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},1)`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------- Tech sticky scene ---------------- */

  function techScene() {
    const sec = $('.tech');
    const items = $$('.tech__item', sec);
    const lenses = $$('.tech__lens img', sec);
    const bar = $('.tech__progress i', sec);
    const img = $('.tech__shoe', sec);
    const lens = $('.tech__lens', sec);
    const sticky = getComputedStyle($('.tech__sticky', sec)).position === 'sticky';
    let step = -1;
    const setStep = (s) => {
      if (s === step) return;
      step = s;
      sec.dataset.step = s;
      items.forEach((el, i) => el.classList.toggle('is-active', i === s));
      lenses.forEach((el, i) => el.classList.toggle('is-active', i === s));
    };
    items.forEach((el, i) => el.addEventListener('click', () => {
      if (!sticky) return setStep(i);
      const r = sec.getBoundingClientRect();
      const span = sec.offsetHeight - innerHeight;
      scrollTo({ top: scrollY + r.top + span * ((i + 0.5) / 3), behavior: 'smooth' });
    }));
    setStep(0);
    if (!sticky) return;
    const lensPos = [{ x: 0, y: 0 }, { x: -30, y: -160 }, { x: -60, y: 40 }];
    const update = () => {
      const r = sec.getBoundingClientRect();
      const span = sec.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      bar.style.width = p * 100 + '%';
      setStep(Math.min(2, Math.floor(p * 3)));
      if (!reduceMotion) {
        img.style.transform = `rotate(${-6 + p * 12}deg) scale(${0.92 + Math.sin(p * Math.PI) * 0.1}) translateY(${(p - 0.5) * -40}px)`;
        const lp = lensPos[Math.min(2, Math.floor(p * 3))];
        lens.style.transform = `translate(${lp.x}px, ${lp.y}px)`;
      }
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* ---------------- Collection rail ---------------- */

  function rail() {
    const track = $('[data-rail-track]');
    track.innerHTML = products.slice(0, 8).map((p, i) => cardHTML(p, i)).join('');
    bindCards(track);
    bindTilt(track);
    $$('[data-rail]').forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.rail) * (track.firstElementChild.offsetWidth + 22), behavior: 'smooth' });
    }));
    // Mouse drag-to-scroll (touch already scrolls natively).
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      setTimeout(() => track.classList.remove('is-dragging'), 0);
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  /* ---------------- Story: words light up as you scroll ---------------- */

  function story() {
    const el = $('[data-story]');
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((n) => {
      const cls = n.nodeType === 1 ? n.className : '';
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(' ');
        const s = document.createElement('span');
        s.className = 'word ' + cls;
        s.textContent = part;
        frag.append(s);
      });
    });
    el.innerHTML = '';
    el.append(frag);
    const words = $$('.word', el);
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();

    // Count-up stats
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const to = Number(en.target.dataset.countTo);
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        en.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(tick);
      };
      reduceMotion ? (en.target.textContent = to) : requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    $$('[data-count-to]').forEach((n) => io.observe(n));
  }

  function ctaGlow() {
    const band = $('.cta-band');
    band.addEventListener('pointermove', (e) => {
      const r = band.getBoundingClientRect();
      band.style.setProperty('--mx', e.clientX - r.left + 'px');
      band.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }

  /* ---------------- Boot ---------------- */

  renderStats(slides[0]);
  split(title);
  rail();
  techScene();
  story();
  ctaGlow();
  if (!reduceMotion) particles();

  runLoader().then(() => {
    document.body.classList.add('is-ready');
    setTimeout(() => title.classList.add('is-in'), 150);
    setTimeout(() => $$('.callout').forEach((c) => c.classList.add('is-on')), 900);
    restartTimer();
    bars[0].classList.add('is-active');
  });
})();
