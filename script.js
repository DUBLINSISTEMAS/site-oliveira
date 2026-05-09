/* =====================================================
   PIZZARIA OLIVEIRA — Interações
   - Navbar scroll
   - Menu mobile (com scrim)
   - Filtros do cardápio
   - Scroll-driven (fallback bidirecional p/ Safari/Firefox)
   - Counter animado das stats
   - Barra de progresso do scroll (fallback)
   ===================================================== */

(function () {
  'use strict';

  /* ---------- Navbar: fundo ao rolar ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 12) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('menu');
  const scrim = document.getElementById('navScrim');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    if (scrim) scrim.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setMenu(!menu.classList.contains('is-open'));
  });

  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => setMenu(false))
  );

  if (scrim) scrim.addEventListener('click', () => setMenu(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880 && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Filtros do cardápio ---------- */
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('#cardapioGrid .card');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.filter;
      cards.forEach((card) => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* =====================================================
     SCROLL-DRIVEN ANIMATIONS
     - Detecta suporte nativo a `animation-timeline: view()`
     - Se NÃO suportar (Safari/Firefox atuais), usa
       IntersectionObserver bidirecional (sem unobserve)
     ===================================================== */

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const supportsViewTimeline =
    CSS && CSS.supports && CSS.supports('animation-timeline: view()');

  const supportsScrollTimeline =
    CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');

  /* ---------- Marca elementos pra revelar (apenas se faltar) ---------- */
  const revealMap = [
    ['.section__header', ''],
    ['.sobre__media',    'left'],
    ['.sobre__text',     'right'],
    ['.cta__text',       'left'],
    ['.cta__media',      'right'],
    ['.quote',           ''],
    ['.card',            'zoom'],
    ['.info-card',       '']
  ];

  if (!supportsViewTimeline) {
    // Aplica data-reveal só onde não tem (CSS legacy controla via .in-view)
    revealMap.forEach(([sel, dir]) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', dir);
        }
      });
    });
  }

  /* ---------- Fallback: IntersectionObserver bidirecional ---------- */
  if (!supportsViewTimeline && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // toggle (sem unobserve) → reverte ao sair de cima/baixo
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  } else if (prefersReducedMotion) {
    // Reduced motion: tudo já visível
    document.querySelectorAll('[data-reveal]').forEach((el) =>
      el.classList.add('in-view')
    );
  }

  /* ---------- Split section titles em chars (todos os browsers) ----------
     Funciona com a transição CSS .section__header.in-view .char */
  document.querySelectorAll('.section__title').forEach((title) => {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.innerHTML = '';
    let i = 0;
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i++);
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      title.appendChild(span);
    }
  });

  /* ---------- IO sempre-on pros section headers (toggle bidirecional) ---------- */
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const headerIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.section__header').forEach((el) => headerIO.observe(el));
  } else if (prefersReducedMotion) {
    document.querySelectorAll('.section__header').forEach((el) =>
      el.classList.add('in-view')
    );
  }

  /* ---------- Pizza scroll fallback (Safari/Firefox sem scroll-timeline) ---------- */
  if (!supportsScrollTimeline && !prefersReducedMotion) {
    const pizzaImg = document.querySelector('.hero__pizza img');
    if (pizzaImg) {
      let ticking = false;
      const updatePizza = () => {
        const max = window.innerHeight * 1.1;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        const rotate = p * 1440;
        const scale = 1 - p * 0.5;
        const tx = -p * 55; // vw negativo
        const blur = p > 0.7 ? (p - 0.7) * 60 : 0;
        const opacity = 1 - Math.max(0, (p - 0.6) * 2.5);
        pizzaImg.style.transform =
          `rotate(${rotate}deg) scale(${scale}) translateX(${tx}vw)`;
        pizzaImg.style.filter = `blur(${blur}px) brightness(${1 - p * 0.4})`;
        pizzaImg.style.opacity = opacity.toFixed(2);
        ticking = false;
      };
      document.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updatePizza);
          ticking = true;
        }
      }, { passive: true });
      updatePizza();
    }
  }

  /* ---------- Stats counter (anima do 0 ao valor real) ---------- */
  const stats = document.querySelector('.hero__stats');
  if (stats && !prefersReducedMotion) {
    const animateNumber = (el, target, suffix = '', duration = 1400) => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statsIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.classList.add('in-view');
            // 60+ / 40 / 4.9★ — anima cada um
            const items = stats.querySelectorAll('strong');
            if (items[0]) animateNumber(items[0], 60, '+');
            if (items[1]) animateNumber(items[1], 40, '');
            if (items[2]) {
              // valor decimal
              const start = performance.now();
              const dur = 1400;
              const tick = (now) => {
                const t = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - t, 3);
                items[2].textContent = (4.9 * eased).toFixed(1) + '★';
                if (t < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }
            statsIO.unobserve(stats); // só uma vez
          }
        });
      },
      { threshold: 0.4 }
    );
    statsIO.observe(stats);
  }

  /* ---------- Barra de progresso (fallback p/ navegadores sem scroll-timeline) ---------- */
  if (!supportsScrollTimeline && !prefersReducedMotion) {
    const bar = document.querySelector('.scroll-progress');
    if (bar) {
      const updateBar = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        bar.style.setProperty('--p', p);
      };
      document.addEventListener('scroll', updateBar, { passive: true });
      window.addEventListener('resize', updateBar);
      updateBar();
    }
  }

  /* ---------- Ano dinâmico no footer ---------- */
  const yearEl = document.querySelector('.footer__bottom span');
  if (yearEl) {
    const y = new Date().getFullYear();
    yearEl.textContent = `© ${y} Pizzaria Oliveira — Todos os direitos reservados.`;
  }
})();
