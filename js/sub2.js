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
  const buttonY = window.innerHeight - Math.max(window.innerHeight * 0.09, 32) - 25;
  const story = document.querySelector('[data-visionary-story]').getBoundingClientRect();
  topButton.classList.toggle('is-light', !(story.top <= buttonY && story.bottom >= buttonY));
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

// 수동 카드뉴스 슬라이드: 마지막/처음 카드에서도 양방향으로 이어집니다.
function initializeCaseCarousel(caseCarousel) {
  const caseTrack = caseCarousel.querySelector('[data-case-track]');
  const caseSlides = [...caseCarousel.querySelectorAll('[data-case-slide]')];
  const caseStatus = caseCarousel.querySelector('[data-case-status]');
  let caseIndex = 0;
  let casePointer = null;
  function selectCase(index) {
    caseIndex = (index % caseSlides.length + caseSlides.length) % caseSlides.length;
    caseTrack.style.transform = `translateX(-${caseIndex * 100}%)`;
    caseSlides.forEach((slide, current) => {
      slide.setAttribute('aria-hidden', String(current !== caseIndex));
      slide.inert = current !== caseIndex;
    });
    caseStatus.textContent = `CASE ${String(caseIndex + 1).padStart(2, '0')} / ${String(caseSlides.length).padStart(2, '0')}`;
  }
  caseCarousel.querySelector('[data-case-prev]').addEventListener('click', () => selectCase(caseIndex - 1));
  caseCarousel.querySelector('[data-case-next]').addEventListener('click', () => selectCase(caseIndex + 1));
  caseCarousel.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') selectCase(0);
    else if (event.key === 'End') selectCase(caseSlides.length - 1);
    else selectCase(caseIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  caseCarousel.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    casePointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  caseCarousel.addEventListener('pointerup', (event) => {
    if (!casePointer || event.pointerId !== casePointer.id) return;
    const dx = event.clientX - casePointer.x;
    const dy = event.clientY - casePointer.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) selectCase(caseIndex + (dx < 0 ? 1 : -1));
    casePointer = null;
  });
  caseCarousel.addEventListener('pointercancel', () => { casePointer = null; });
  caseCarousel.addEventListener('pointerleave', () => { casePointer = null; });
  selectCase(0);
}
document.querySelectorAll('[data-case-carousel]').forEach(initializeCaseCarousel);


