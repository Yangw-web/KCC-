// 기본 브라우저 스크롤만 사용합니다. 기존 메인 시안의 스크롤 연출과 분리되어 있습니다.
const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const hero = document.querySelector('.main2-hero');
const video = document.querySelector('[data-main2-video]');
const fallback = document.querySelector('[data-main2-fallback]');

function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
document.querySelectorAll('.site-footer a[href="#"]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
document.querySelectorAll('.main2-special__card[href="#"], .main2-story[href="#"]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));

function updateHeader() {
  const light = hero.getBoundingClientRect().bottom <= header.offsetHeight;
  header.classList.toggle('is-light', light);
  header.classList.toggle('is-scrolled', light);
  header.style.setProperty('--light-progress', light ? 1 : 0);
}
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
window.addEventListener('pageshow', updateHeader);
updateHeader();
video.addEventListener('error', () => { fallback.hidden = false; });
video.querySelector('source').addEventListener('error', () => { fallback.hidden = false; });
video.play().catch(() => { /* 자동 재생 제한 시 첫 프레임을 유지합니다. */ });
