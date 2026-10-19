// 요약은 시안용 고정 콘텐츠이며 실제 AI 요청이나 공유 전송은 하지 않습니다.
const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const topButton = document.querySelector('[data-back-to-top]');
const footer = document.querySelector('[data-footer]');
function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
document.querySelectorAll('.site-footer a[href="#"]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
function updateScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
  topButton.hidden = window.scrollY < window.innerHeight * 0.4;
  const footerVisibleHeight = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
  topButton.style.setProperty('--footer-clearance', `${footerVisibleHeight > 0 ? footerVisibleHeight + 24 : 0}px`);
}
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll);
window.addEventListener('pageshow', updateScroll);
updateScroll();


// The controls below are presentation-only: the article grid is never filtered or reordered.
const filters = [...document.querySelectorAll('[data-filter]')];
filters.forEach((filter) => {
  const label = filter.querySelector('summary');
  const options = [...filter.querySelectorAll('[data-filter-option]')];
  options.forEach((option) => option.addEventListener('click', () => {
    label.textContent = option.textContent;
    options.forEach((item) => item.setAttribute('aria-pressed', String(item === option)));
    filter.open = false;
    label.focus();
  }));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') filters.forEach((filter) => { if (filter.open) { filter.open = false; filter.querySelector('summary').focus(); } });
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.archive-filters')) filters.forEach((filter) => { filter.open = false; });
});
const familyToggle = document.querySelector('[data-family-toggle]');
const familyExtra = document.querySelector('[data-family-extra]');
familyToggle.addEventListener('click', () => {
  const expanded = familyToggle.getAttribute('aria-expanded') !== 'true';
  familyToggle.setAttribute('aria-expanded', String(expanded));
  familyExtra.hidden = !expanded;
  document.querySelector('[data-family-toggle-label]').textContent = expanded ? '계열사 콘텐츠 접기' : '계열사 콘텐츠 전체 보기';
});

const carousel = document.querySelector('[data-archive-carousel]');
const slides = [...carousel.querySelectorAll('[data-archive-slide]')];
const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
const background = carousel.querySelector('[data-carousel-background]');
const pauseButton = carousel.querySelector('[data-carousel-pause]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let carouselTimer = null;
let manuallyPaused = reducedMotion.matches;
let hovering = false;
let focused = false;
function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, current) => {
    const active = current === activeSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
  });
  dots.forEach((dot, current) => dot.setAttribute('aria-pressed', String(current === activeSlide)));
  background.src = slides[activeSlide].dataset.background;
  carousel.querySelector('[data-carousel-status]').textContent = '추천 콘텐츠 ' + (activeSlide + 1) + ' / ' + slides.length;
}
function stopCarousel() {
  if (carouselTimer !== null) window.clearInterval(carouselTimer);
  carouselTimer = null;
}
function startCarousel() {
  stopCarousel();
  if (!manuallyPaused && !hovering && !focused && !document.hidden) {
    carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 4000);
  }
}
function navigateSlide(index) { showSlide(index); startCarousel(); }
carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => navigateSlide(activeSlide - 1));
carousel.querySelector('[data-carousel-next]').addEventListener('click', () => navigateSlide(activeSlide + 1));
dots.forEach((dot, index) => dot.addEventListener('click', () => navigateSlide(index)));
function reflectPause() {
  pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
  pauseButton.setAttribute('aria-label', manuallyPaused ? '자동 슬라이드 재생' : '자동 슬라이드 일시정지');
  pauseButton.querySelector('span').textContent = manuallyPaused ? '▶' : 'Ⅱ';
}
pauseButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; reflectPause(); startCarousel(); });
carousel.addEventListener('mouseenter', () => { hovering = true; stopCarousel(); });
carousel.addEventListener('mouseleave', () => { hovering = false; startCarousel(); });
carousel.addEventListener('focusin', () => { focused = true; stopCarousel(); });
carousel.addEventListener('focusout', (event) => { if (!carousel.contains(event.relatedTarget)) { focused = false; startCarousel(); } });
document.addEventListener('visibilitychange', startCarousel);
reducedMotion.addEventListener('change', (event) => { manuallyPaused = event.matches; reflectPause(); startCarousel(); });
window.addEventListener('pagehide', stopCarousel);
window.addEventListener('pageshow', startCarousel);
showSlide(0);
reflectPause();
startCarousel();

