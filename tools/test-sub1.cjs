const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// 브라우저에 접근하지 않는 이벤트 로직 단위 검사입니다.
class Element {
  constructor(id = '') {
    this.id = id; this.listeners = {}; this.attributes = {}; this.dataset = {};
    this.hidden = true; this.children = []; this.value = '0.7'; this.textContent = '';
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.classes = new Set();
    this.classList = { toggle: (name, on) => { if (on) this.classes.add(name); else this.classes.delete(name); } };
  }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  async emit(name, event = {}) { for (const callback of this.listeners[name] || []) await callback(event); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; }
  append(child) { this.children.push(child); }
  getBoundingClientRect() { return { left: 320, right: 460, top: 200, bottom: 230, width: 140, height: 30 }; }
}
const selectors = ['[data-header]', '[data-menu]', '[data-menu-toggle]', '[data-back-to-top]', '[data-footer]', '[data-summary]', '[data-summary-toggle]', '[data-summary-panel]', '[data-summary-close]', '[data-factory-audio]', '[data-audio-play]', '[data-audio-stop]', '[data-audio-volume]', '[data-audio-status]', '[data-audio-wave]', '.sound-player', '[data-sound-result]', '[data-term-tooltip]'];
const elements = Object.fromEntries(selectors.map((selector) => [selector, new Element()]));
elements['[data-term-tooltip]'].id = 'article-term-tooltip';
const options = Array.from({ length: 4 }, () => new Element());
const terms = ['heavy', 'pcm', 'car'].map((key) => { const el = new Element(); el.dataset.term = key; return el; });
const audio = elements['[data-factory-audio]'];
audio.paused = true; audio.ended = false; audio.currentTime = 0;
audio.play = async () => { audio.paused = false; await audio.emit('play'); };
audio.pause = () => { audio.paused = true; audio.emit('pause'); };
const context = {
  document: {
    querySelector: (selector) => { assert.ok(elements[selector], selector); return elements[selector]; },
    querySelectorAll: (selector) => selector === '[data-sound-answer]' ? options : selector === '[data-term]' ? terms : [],
    createElement: () => new Element(), addEventListener() {},
  },
  window: { scrollY: 0, innerHeight: 900, innerWidth: 1280, addEventListener() {}, matchMedia: () => ({ matches: false }), setTimeout, scrollTo() {} },
  clearTimeout, getComputedStyle: () => ({}), console,
};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../js/sub1.js'), 'utf8'), context);
(async () => {
  assert.equal(audio.volume, 0.7);
  await elements['[data-audio-play]'].emit('click');
  assert.equal(audio.paused, false);
  assert.equal(elements['[data-audio-play]'].getAttribute('aria-pressed'), 'true');
  assert.ok(elements['.sound-player'].classes.has('is-playing'));
  audio.currentTime = 12;
  await elements['[data-audio-stop]'].emit('click');
  assert.equal(audio.paused, true); assert.equal(audio.currentTime, 0);
  assert.equal(elements['[data-audio-play]'].getAttribute('aria-pressed'), 'false');
  elements['[data-audio-volume]'].value = '0.25';
  await elements['[data-audio-volume]'].emit('input'); assert.equal(audio.volume, 0.25);
  for (let index = 0; index < options.length; index++) {
    await options[index].emit('click');
    options.forEach((option, current) => assert.equal(option.getAttribute('aria-pressed'), String(current === index)));
    assert.equal(elements['[data-sound-result]'].hidden, false);
  }
  for (const term of terms) {
    await term.emit('focus');
    assert.equal(elements['[data-term-tooltip]'].hidden, false);
    assert.ok(elements['[data-term-tooltip]'].textContent.length > 20);
    assert.equal(term.getAttribute('aria-describedby'), 'article-term-tooltip');
  }
  audio.ended = true; await audio.emit('ended');
  assert.equal(elements['[data-audio-play]'].getAttribute('aria-pressed'), 'false');
  audio.play = async () => { throw new Error('Test playback failure'); };
  await elements['[data-audio-play]'].emit('click');
  assert.match(elements['[data-audio-status]'].textContent, /재생하지 못했습니다/);
  assert.equal(elements['[data-audio-wave]'].children.length, 57);
  console.log('PASS: play, stop/reset, volume, four choices, three tooltips, ended/error states, waveform.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
