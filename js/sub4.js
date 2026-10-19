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

const summary = document.querySelector('[data-summary]');
const summaryToggle = document.querySelector('[data-summary-toggle]');
const summaryPanel = document.querySelector('[data-summary-panel]');
let summaryOpen = false;
let summaryAnimation = null;
let summaryRevision = 0;

async function setSummary(open) {
  if (open === summaryOpen) return;
  summaryOpen = open;
  const revision = ++summaryRevision;
  summaryAnimation?.cancel();
  const buttonRect = summaryToggle.getBoundingClientRect();
  summaryPanel.hidden = false;
  const panelRect = summaryPanel.getBoundingClientRect();
  const style = getComputedStyle(summaryPanel);
  const finalRight = parseFloat(style.right) || 0;
  const collapsed = {
    width: `${buttonRect.width}px`, height: `${buttonRect.height}px`,
    right: `${finalRight + panelRect.right - buttonRect.right}px`, borderRadius: '40px',
  };
  const expanded = {
    width: `${panelRect.width}px`, height: `${panelRect.height}px`,
    right: `${finalRight}px`, borderRadius: style.borderRadius,
  };
  summary.classList.toggle('is-open', open);
  summaryToggle.setAttribute('aria-expanded', String(open));
  summaryPanel.inert = !open;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  summaryAnimation = summaryPanel.animate(open ? [collapsed, expanded] : [expanded, collapsed], {
    duration: reducedMotion ? 0 : 480,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'backwards',
  });
  try { await summaryAnimation.finished; } catch { return; }
  if (revision !== summaryRevision) return;
  summaryAnimation = null;
  if (open) summaryPanel.focus({ preventScroll: true });
  else {
    summaryPanel.hidden = true;
    summaryToggle.focus({ preventScroll: true });
  }
}
summaryToggle.addEventListener('click', () => setSummary(!summaryOpen));
document.querySelector('[data-summary-close]').addEventListener('click', () => setSummary(false));
document.addEventListener('click', (event) => {
  if (summaryOpen && !summary.contains(event.target)) setSummary(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && summaryOpen) {
    event.preventDefault();
    setSummary(false);
  }
});




