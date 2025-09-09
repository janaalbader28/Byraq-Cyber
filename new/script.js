
document.addEventListener('DOMContentLoaded', () => {
  // ===== Smooth Scroll + Immediate Active =====
  const links = document.querySelectorAll('.main-nav .nav-link');

  function setActiveByHash(hash) {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  }

  let suppressIO = false;
  let scrollStopTimer = null;

  function armScrollStopWatcher() {
    window.addEventListener('scroll', onScrollDuringSmooth, { passive: true });
    onScrollDuringSmooth();
  }

  function onScrollDuringSmooth() {
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      suppressIO = false;
      window.removeEventListener('scroll', onScrollDuringSmooth);
    }, 180);
  }

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        setActiveByHash(hash);
        suppressIO = true;
        armScrollStopWatcher();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', hash);
      }
    });
  });

  const sections = [...links]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  // ===== Intersection Observer (updates active link on scroll) =====
  const io = new IntersectionObserver((entries) => {
    if (suppressIO) return;

    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        if (b.intersectionRatio === a.intersectionRatio) {
          const aIsHome = a.target.id === 'home' ? 1 : 0;
          const bIsHome = b.target.id === 'home' ? 1 : 0;
          return aIsHome - bIsHome;
        }
        return b.intersectionRatio - a.intersectionRatio;
      })[0];

    if (visible) {
      const id = '#' + visible.target.id;
      setActiveByHash(id);
      history.replaceState(null, '', id);
    }
  }, {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: [0.15, 0.35, 0.6]
  });

  sections.forEach(sec => io.observe(sec));
  setActiveByHash(location.hash || '#home');
  window.addEventListener('hashchange', () => {
    setActiveByHash(location.hash || '#home');
  });

  // ===== FAQ Toggle =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const faqAnswer = item.querySelector('.faq-answer');
    item.addEventListener('click', () => {
      faqItems.forEach(i => {
        if (i !== item) {
          i.classList.remove('active');
          i.querySelector('.faq-answer').style.maxHeight = 0;
        }
      });
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
      } else {
        faqAnswer.style.maxHeight = 0;
      }
    });
  });

  // ===== Counter Animation =====
  function animateCounter(el, target) {
    let current = 0;
    const duration = 2000;
    const intervalTime = 50;
    const steps = Math.ceil(duration / intervalTime);
    const step = Math.ceil(target / steps);

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current + '+';
    }, intervalTime);
  }

  document.querySelectorAll('.stat-value').forEach(stat => {
    const target = parseInt(stat.textContent, 10);
    stat.textContent = '0+';
    animateCounter(stat, target);
  });

  // ===== Back to Top (shows after leaving #home) =====
  const toTopBtn = document.getElementById('toTop');

  function scrollToTop() {
    const scroller = document.scrollingElement || document.documentElement;
    const supportsSmooth =
      'scrollBehavior' in document.documentElement.style &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (supportsSmooth) {
      scroller.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      const start = scroller.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
      const duration = 450;
      const startTime = performance.now();
      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        scroller.scrollTop = Math.round(start * (1 - eased));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  toTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToTop();
  });

  const homeSection = document.getElementById('home');
  if (homeSection && toTopBtn) {
    const topIO = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e.isIntersecting || e.intersectionRatio < 0.2) {
        toTopBtn.classList.add('show');
      } else {
        toTopBtn.classList.remove('show');
      }
    }, { root: null, threshold: [0, 0.2] });
    topIO.observe(homeSection);
  }

  // ===== Mobile Hamburger Nav =====
  const menuBtn    = document.getElementById('menuToggle');
  const mainNav    = document.getElementById('mainNav');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    mainNav.classList.add('is-open');
    menuBtn?.classList.add('is-open');
    if (navOverlay) {
      navOverlay.hidden = false;
      requestAnimationFrame(() => navOverlay.classList.add('is-open'));
    }
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    mainNav.classList.remove('is-open');
    menuBtn?.classList.remove('is-open');
    navOverlay?.classList.remove('is-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(() => {
      if (navOverlay && !navOverlay.classList.contains('is-open')) {
        navOverlay.hidden = true;
      }
    }, 250);
  }

  menuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  navOverlay?.addEventListener('click', closeMenu);

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu();
  });

  // Close menu when a nav link is clicked (helpful on mobile)
  mainNav?.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      if (mainNav.classList.contains('is-open')) closeMenu();
    });
  });

  // Auto-close drawer if resized to desktop
  const mqDesktop = window.matchMedia('(min-width: 769px)');
  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener('change', (ev) => ev.matches && closeMenu());
  } else if (mqDesktop.addListener) {
    // Safari < 14
    mqDesktop.addListener((ev) => ev.matches && closeMenu());
  }
});
