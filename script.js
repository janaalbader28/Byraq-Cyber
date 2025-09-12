
document.addEventListener("DOMContentLoaded", () => {
  // ===== Smooth Scroll =====
  const links = document.querySelectorAll('.main-nav .nav-link');

  function setActiveByHash(hash) {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  }

  let suppressIO = false;
  let scrollStopTimer = null;

  function armScrollStopWatcher(){
    window.addEventListener('scroll', onScrollDuringSmooth, { passive: true });
    onScrollDuringSmooth();
  }

  function onScrollDuringSmooth(){
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      suppressIO = false;
      window.removeEventListener('scroll', onScrollDuringSmooth, { passive: true });
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

  function equalizeTeamCards() {
    const slides = document.querySelectorAll('.team-card');
    let maxHeight = 0;
    slides.forEach(card => {
      card.style.height = 'auto';
      const h = card.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });
    slides.forEach(card => {
      card.style.height = maxHeight + 'px';
    });
  }
  window.addEventListener('load', equalizeTeamCards);
  window.addEventListener('resize', equalizeTeamCards);

  const sections = [...links]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  // ===== Team Swiper =====
  const teamSwiper = new Swiper(".team-swiper", {
    slidesPerView: 3,
    spaceBetween: 20,
    loop: true,
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    autoplay: { delay: 4000, disableOnInteraction: false },
    breakpoints: {
      640: { slidesPerView: 1, spaceBetween: 20 },
      768: { slidesPerView: 2, spaceBetween: 25 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
  });

  // ===== FAQ Toggle =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const a = item.querySelector('.faq-answer');
  const q = item.querySelector('.faq-question');

  a.style.maxHeight = '0px';

  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');

    faqItems.forEach(i => {
      if (i !== item) {
        i.classList.remove('active');
        const ai = i.querySelector('.faq-answer');
        ai.style.maxHeight = '0px';
        ai.style.overflow = 'hidden';
      }
    });

    if (isOpen) {
      item.classList.remove('active');
      a.style.maxHeight = '0px';
      a.style.overflow = 'hidden';
    } else {
      item.classList.add('active');
      a.style.overflow = 'hidden';
      a.style.maxHeight = '0px';            
      void a.offsetHeight;
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });

  a.addEventListener('transitionend', (e) => {
    if (item.classList.contains('active') && e.propertyName === 'max-height') {
      a.style.maxHeight = 'none';   
      a.style.overflow = 'visible';
    }
  });
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.faq-item.active .faq-answer').forEach(a => {
    a.style.maxHeight = 'none';
    a.style.overflow = 'visible';
  });
});


  // ===== Intersection Observer =====
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
    rootMargin: `0px 0px -60% 0px`,  
    threshold: [0.15, 0.35, 0.6]
  });

  sections.forEach(sec => io.observe(sec));

  setActiveByHash(location.hash || '#home');

  window.addEventListener('hashchange', () => {
    setActiveByHash(location.hash || '#home');
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
      el.textContent = current + "+";
    }, intervalTime);
  }

  document.querySelectorAll(".stat-value").forEach(stat => {
    const target = parseInt(stat.textContent, 10);
    stat.textContent = "0+";
    animateCounter(stat, target);
  });

  // ===== Back to Top (shows after leaving #home) =====
  const toTopBtn = document.getElementById('toTop');

  function scrollToTop() {
    const scroller = document.scrollingElement || document.documentElement;

    const supportsSmooth = 'scrollBehavior' in document.documentElement.style &&
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

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
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

  // ===== Hamburger =====
const navToggle   = document.getElementById('nav-toggle');
const hamburger   = document.querySelector('.hamburger');
const mainNav     = document.getElementById('mobile-menu');
const navLinksAll = document.querySelectorAll('.main-nav .nav-link');

function updateMenuState() {
  const open = !!navToggle?.checked;
  hamburger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  mainNav?.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.documentElement.style.overflow = open ? 'hidden' : '';
}

function closeMenu() {
  if (navToggle && navToggle.checked) {
    navToggle.checked = false;
    updateMenuState();
  }
}

navToggle?.addEventListener('change', updateMenuState);

// close after clicking any nav link
navLinksAll.forEach(a => {
  a.addEventListener('click', () => {
    closeMenu();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

updateMenuState();





/* ===== Minimal, Professional Intro (center→center; logo shrinks while moving) ===== */
(function(){
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { document.documentElement.classList.add("page-ready"); return; }

  const headerLogo = document.querySelector(".brand-logo");
  const heroIntro  = document.querySelector(".hero-intro");
  if (!headerLogo || !heroIntro) { document.documentElement.classList.add("page-ready"); return; }

  const decodeLogo = headerLogo.decode ? headerLogo.decode().catch(()=>{}) : Promise.resolve();
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.allSettled([decodeLogo, fontsReady]).then(start).catch(start);

  function start(){
    document.documentElement.classList.add("intro-running");

    // Overlay stage (logo LEFT, text RIGHT)
    const stage = document.createElement("div");
    stage.id = "introStage";
    stage.innerHTML = `
      <div class="intro-bg"></div>
      <div class="intro-wrap">
        <img class="intro-logo" alt="بيرق سايبر" />
        <div class="intro-text"></div>
      </div>
    `;
    document.body.appendChild(stage);

    const introBg   = stage.querySelector(".intro-bg");
    const introLogo = stage.querySelector(".intro-logo");
    const introText = stage.querySelector(".intro-text");
    introLogo.src   = headerLogo.currentSrc || headerLogo.src;

    // Clone hero-intro content (strip IDs)
    const cloned = heroIntro.cloneNode(true);
    cloned.removeAttribute("id");
    cloned.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
    while (cloned.firstChild) introText.appendChild(cloned.firstChild);

    // Hide the real elements during the flight
    headerLogo.style.opacity = "0";
    heroIntro.style.opacity  = "0";

    requestAnimationFrame(()=>{
      stage.classList.add("show");

      const textIn = introText.animate(
        [{opacity:0, transform:"translateY(12px) scale(1.03)"},
         {opacity:1, transform:"translateY(0) scale(1)"}],
        {duration:650, easing:"cubic-bezier(.2,.7,.2,1)", fill:"forwards"}
      );
      const logoIn = introLogo.animate(
        [{opacity:0, transform:"translateY(10px) scale(1.06)"},
         {opacity:1, transform:"translateY(0) scale(1)"}],
        {duration:700, easing:"cubic-bezier(.2,.7,.2,1)", fill:"forwards"}
      );

      Promise.all([textIn.finished, logoIn.finished]).then(()=> setTimeout(flyToPositions, 380));
    });

    function flyToPositions(){
      // Begin fading the page in while the overlay background fades out
      document.documentElement.classList.add("page-ready");
      introBg.animate([{opacity:1},{opacity:0}], {duration:1200, easing:"ease-out", fill:"forwards"});

      // ---- center→center measurements (no drift) ----
      const tStartR = introText.getBoundingClientRect();
      const tEndR   = heroIntro.getBoundingClientRect();
      const lStartR = introLogo.getBoundingClientRect();
      const lEndR   = headerLogo.getBoundingClientRect();

      const tStart = center(tStartR), tEnd = center(tEndR);
      const lStart = center(lStartR), lEnd = center(lEndR);

      const tScale = clamp(tEndR.width / Math.max(1, tStartR.width), 0.7, 1.25);

      // Logo end scale: slightly smaller than real to avoid “oversized landing”
      const scaleW = lEndR.width  / Math.max(1, lStartR.width);
      const scaleH = lEndR.height / Math.max(1, lStartR.height);
      const endScale = clamp(Math.min(scaleW, scaleH) * 0.99, 0.6, 1.2);

      const textMove = introText.animate(
        [
          { transform:"translate(0,0) scale(1)", opacity:1 },
          { transform:`translate(${tEnd.x - tStart.x}px, ${tEnd.y - tStart.y}px) scale(${tScale})`, opacity:1 }
        ],
        { duration:1200, easing:"cubic-bezier(.22,.9,.2,1)", fill:"forwards" }
      );

      // Logo: shrink WHILE moving (arc path), no “too big” at the end
      const dxL = lEnd.x - lStart.x, dyL = lEnd.y - lStart.y;
      const logoDuration = 1300;
      const logoMove = introLogo.animate(
        [
          { transform:"translate(0,0) scale(1.08)", opacity:1, filter:"drop-shadow(0 4px 14px rgba(0,0,0,.25))" },
          { offset:0.55, transform:`translate(${dxL*0.55}px, ${dyL*0.55 - 28}px) scale(${(1.08 + endScale)/2})`, opacity:1, filter:"drop-shadow(0 2px 8px rgba(0,0,0,.18))" },
          { transform:`translate(${dxL}px, ${dyL}px) scale(${endScale})`, opacity:1, filter:"drop-shadow(0 0 0 rgba(0,0,0,0))" }
        ],
        { duration:logoDuration, easing:"cubic-bezier(.22,.9,.2,1)", fill:"forwards" }
      );

      // Start revealing the REAL header logo slightly BEFORE the overlay lands
      setTimeout(() => {
        headerLogo.animate([{opacity:0},{opacity:1}], {duration:420, easing:"linear", fill:"forwards"});
      }, Math.max(0, logoDuration - 260));

      Promise.all([textMove.finished, logoMove.finished]).then(()=>{
        // Fade the real intro text in (already centered)
        heroIntro.animate(
          [{opacity:0, transform:"translateY(6px)"},{opacity:1, transform:"none"}],
          {duration:700, easing:"cubic-bezier(.22,.9,.2,1)", fill:"forwards"}
        );

        // Remove stage
        stage.animate([{opacity:1},{opacity:0}], {duration:360, fill:"forwards"}).finished.then(()=>{
          stage.remove();
          headerLogo.style.opacity = "";
          heroIntro.style.opacity  = "";
          document.documentElement.classList.remove("intro-running");
        });
      });
    }

    function center(r){ return { x: r.left + r.width/2, y: r.top + r.height/2 }; }
    function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  }
})();



});
