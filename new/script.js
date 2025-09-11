
const teamSwiper = new Swiper('.team-swiper', {
  slidesPerView: 3,
  spaceBetween: 25,
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 10000, // كل 10 ثواني
    disableOnInteraction: false,
  },
  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});


// ===== Open a specific PDF in a new tab =====
const PDF_PATH = 'docs/profile.pdf';
document.getElementById("downloadPDF")?.addEventListener("click", function (e) {
  e.preventDefault();
  window.open(PDF_PATH, "_blank", "noopener");
});

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
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
      } else {
        faqAnswer.style.maxHeight = 0;
      }
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

});
