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

// 사용자 조작으로만 재생하며, 정지하면 음성을 처음으로 되돌립니다.
const factoryAudio = document.querySelector('[data-factory-audio]');
const audioPlay = document.querySelector('[data-audio-play]');
const audioStop = document.querySelector('[data-audio-stop]');
const audioVolume = document.querySelector('[data-audio-volume]');
const audioStatus = document.querySelector('[data-audio-status]');
const wave = document.querySelector('[data-audio-wave]');
const player = document.querySelector('.sound-player');
factoryAudio.volume = Number(audioVolume.value);
for (let index = 0; index < 57; index += 1) {
  const bar = document.createElement('span');
  bar.style.setProperty('--wave-height', `${12 + ((index * 17 + index * index * 3) % 51)}px`);
  bar.style.setProperty('--wave-delay', `${-(index % 9) * 95}ms`);
  wave.append(bar);
}
function reflectAudioState() {
  const playing = !factoryAudio.paused && !factoryAudio.ended;
  player.classList.toggle('is-playing', playing);
  audioPlay.setAttribute('aria-pressed', String(playing));
}
audioPlay.addEventListener('click', async () => {
  audioStatus.textContent = '';
  try { await factoryAudio.play(); }
  catch { audioStatus.textContent = '소리를 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.'; }
  reflectAudioState();
});
audioStop.addEventListener('click', () => {
  factoryAudio.pause();
  factoryAudio.currentTime = 0;
  audioStatus.textContent = '';
  reflectAudioState();
});
audioVolume.addEventListener('input', () => { factoryAudio.volume = Number(audioVolume.value); });
['play', 'pause', 'ended'].forEach((eventName) => factoryAudio.addEventListener(eventName, reflectAudioState));
factoryAudio.addEventListener('error', () => {
  audioStatus.textContent = '소리 파일을 불러오지 못했습니다.';
  reflectAudioState();
});
const answers = [...document.querySelectorAll('[data-sound-answer]')];
answers.forEach((answer) => answer.addEventListener('click', () => {
  answers.forEach((option) => option.setAttribute('aria-pressed', String(option === answer)));
  document.querySelector('[data-sound-result]').hidden = false;
}));

// 전달받은 용어 설명을 사용하고, 말풍선이 화면 밖으로 나가지 않도록 배치합니다.
const termDescriptions = {
  car: '자동차 차체의 외관을 구현하고 표면을 보호하기 위해 사용되는 도료.',
  heavy: '선박·산업시설 등 부식 환경에 놓이는 구조물을 장기간 보호하기 위한 고기능성 도료.',
  pcm: 'PCM은 Pre-Coated Metal의 약자다. 금속을 제품 형태로 가공하기 전에 강판 등에 미리 도장하는 방식에 사용되는 도료다. KCC의 과거 사업장 소개 자료에서도 울산공장의 주요 생산 영역으로 소개됐다.',
};
const tooltip = document.querySelector('[data-term-tooltip]');
let activeTerm = null;
let termDismissTimer = 0;
function hideTerm() {
  clearTimeout(termDismissTimer);
  activeTerm?.removeAttribute('aria-describedby');
  activeTerm = null;
  tooltip.classList.toggle('is-visible', false);
  tooltip.hidden = true;
}
function showTerm(term) {
  clearTimeout(termDismissTimer);
  if (activeTerm !== term) tooltip.classList.toggle('is-visible', false);
  activeTerm?.removeAttribute('aria-describedby');
  activeTerm = term;
  term.setAttribute('aria-describedby', tooltip.id);
  tooltip.textContent = termDescriptions[term.dataset.term];
  tooltip.hidden = false;
  const rect = term.getBoundingClientRect();
  const bubble = tooltip.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const left = Math.max(18, Math.min(center - bubble.width / 2, window.innerWidth - bubble.width - 18));
  const above = rect.bottom + bubble.height + 24 > window.innerHeight && rect.top > bubble.height + 24;
  tooltip.classList.toggle('is-above', above);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${above ? rect.top - bubble.height - 11.2 : rect.bottom + 11.2}px`;
  tooltip.style.setProperty('--tooltip-arrow', `${Math.max(18, Math.min(bubble.width - 18, center - left))}px`);
  // 크기 측정으로 초기 opacity: 0을 확정한 뒤 0.3초 동안 나타나게 합니다.
  tooltip.classList.toggle('is-visible', true);
}
function scheduleTermDismiss() { termDismissTimer = window.setTimeout(hideTerm, 140); }
document.querySelectorAll('[data-term]').forEach((term) => {
  term.addEventListener('pointerenter', () => showTerm(term));
  term.addEventListener('pointerleave', scheduleTermDismiss);
  term.addEventListener('focus', () => showTerm(term));
  term.addEventListener('blur', scheduleTermDismiss);
  term.addEventListener('click', () => showTerm(term));
});
tooltip.addEventListener('pointerenter', () => clearTimeout(termDismissTimer));
tooltip.addEventListener('pointerleave', scheduleTermDismiss);
window.addEventListener('scroll', hideTerm, { passive: true });
window.addEventListener('resize', hideTerm);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTerm(); });
