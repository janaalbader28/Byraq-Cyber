// ===== Theme Toggle (default = dark) =====
const themeBtn = document.getElementById('themeToggle');

const icons = {
  sun:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M16.9 16.9l2.2 2.2M2 12h3M19 12h3M4.9 19.1l2.1-2.2M16.9 7l2.2-2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  moon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a7 7 0 1 0 10.2 10.2z" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`
};

function updateIcon(isLight){
  if (!themeBtn) return;
  // في الوضع الغامق نعرض الشمس (للتحويل إلى الفاتح)، وفي الفاتح نعرض القمر
  themeBtn.innerHTML = isLight ? icons.moon : icons.sun;
  themeBtn.title = isLight ? 'الوضع الداكن' : 'الوضع الفاتح';
  themeBtn.setAttribute('aria-label', themeBtn.title);
}

function applyTheme(theme){
  const isLight = theme === 'light';
  document.body.classList.toggle('light-mode', isLight); // يطابق CSS لديك
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateIcon(isLight);
}

// default = dark (بدون الاعتماد على نظام التشغيل)
const saved = localStorage.getItem('theme');
applyTheme(saved || 'dark');

themeBtn?.addEventListener('click', () => {
  const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
  applyTheme(next);
});


document.addEventListener("DOMContentLoaded", () => {

  // ===== Smooth Scroll =====
  const links = document.querySelectorAll('.main-nav .nav-link');

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', a.getAttribute('href'));
      }
    });
  });

  function setActiveByHash(hash) {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  }

  const sections = [...links]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  // ===== Team Swiper =====
  const teamSwiper = new Swiper(".team-swiper", {
    slidesPerView: 3,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
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

  // ===== Intersection Observer for active nav =====
  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      const id = '#' + visible.target.id;
      setActiveByHash(id);
      history.replaceState(null, '', id);
    }
  }, {
    root: null,
    rootMargin: `-${headerHeight + 10}px 0px -55% 0px`,
    threshold: [0.15, 0.3, 0.6]
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

});
