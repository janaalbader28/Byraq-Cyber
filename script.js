/* ========= Smooth scroll ======== */
const links = document.querySelectorAll('.main-nav .nav-link');

/* smooth scrolling on click */
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

/* active link by hash */
function setActiveByHash(hash) {
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
}

const sections = [...links]
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;

/* IntersectionObserver highlights the section that crosses into the "viewport center" */
const io = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (visible) {
    const id = '#' + visible.target.id;
    setActiveByHash(id);
    // keep the URL hash in sync (without scrolling)
    history.replaceState(null, '', id);
  }
}, {
  root: null,
  rootMargin: `-${headerHeight + 10}px 0px -55% 0px`,
  threshold: [0.15, 0.3, 0.6]
});

sections.forEach(sec => io.observe(sec));

/* defaults to #home */
setActiveByHash(location.hash || '#home');

/* handle back/forward navigation */
window.addEventListener('hashchange', () => {
  setActiveByHash(location.hash || '#home');
});

/* ========= Counter Animation for stats ========= */
function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 40); 
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current + "+";
  }, 40); 
}

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".stat-value").forEach(stat => {
    const target = parseInt(stat.textContent, 10); // يقرأ القيمة من HTML (20)
    stat.textContent = "0+";
    animateCounter(stat, target);
  });
});
