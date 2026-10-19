const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'arc1.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/arc1.css'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)(?:#[^"]*)?"/g)) assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
assert.equal((html.match(/class="archive-card"/g) || []).length, 9);
assert.equal((html.match(/class="archive-card__thumbnail"/g) || []).length, 9);
assert.equal((html.match(/<a class="archive-card__thumbnail" href="\.\/sub[23]\.html">/g) || []).length, 6);
assert.equal((html.match(/<a class="archive-card__title" href="\.\/sub[23]\.html">/g) || []).length, 6);
assert.ok(css.includes('background-size: 100% 1px'));
assert.ok(css.includes('transform: scale(1.15)'));
assert.ok(css.includes('transform-origin: center center'));
assert.equal((html.match(/data-archive-slide /g) || []).length, 2);
assert.equal((html.match(/data-filter-option/g) || []).length, 12);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length);
assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
const reference = fs.readFileSync(path.join(root, 'sub3.html'), 'utf8');
assert.equal(html.slice(html.indexOf('    <footer')).trim(), reference.slice(reference.indexOf('    <footer')).trim());
assert.equal(html.slice(html.indexOf('    <header'), html.indexOf('    </header>') + 13), reference.slice(reference.indexOf('    <header'), reference.indexOf('    </header>') + 13));
class Element {
  constructor() {
    this.attrs = {}; this.events = {}; this.elements = {}; this.lists = {}; this.dataset = {}; this.classes = new Set();
    this.style = { setProperty() {} };
    this.classList = { toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name) };
  }
  setAttribute(name, value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name]; }
  addEventListener(name, fn) { this.events[name] = fn; }
  querySelector(name) { return this.elements[name] ||= new Element(); }
  querySelectorAll(name) { return this.lists[name] || []; }
  getBoundingClientRect() { return { top: 2000 }; }
  contains() { return false; }
  focus() { this.focused = true; }
}
const elements = {};
const get = name => elements[name] ||= new Element();
const carousel = get('[data-archive-carousel]');
const slides = [new Element(), new Element()];
slides[0].dataset.background = './assets/arc1_2.jpg';
slides[1].dataset.background = './assets/arc1_13.jpg';
const dots = [new Element(), new Element()];
carousel.lists['[data-archive-slide]'] = slides;
carousel.lists['[data-carousel-dot]'] = dots;
const filters = [new Element(), new Element()];
filters[0].lists['[data-filter-option]'] = ['2027년', '2026년', '2025년'].map(text => Object.assign(new Element(), { textContent: text }));
filters[1].lists['[data-filter-option]'] = ['오래된 순', '최신순'].map(text => Object.assign(new Element(), { textContent: text }));
const documentEvents = {};
const document = {
  hidden: false, querySelector: get,
  querySelectorAll: name => name === '[data-filter]' ? filters : [],
  addEventListener(name, fn) { (documentEvents[name] ||= []).push(fn); },
};
let timerId = 0;
const timers = new Map();
const motion = { matches: false, addEventListener() {} };
const window = {
  innerHeight: 900, scrollY: 0, matchMedia: () => motion, addEventListener() {}, scrollTo() {},
  setInterval(fn, delay) { assert.equal(delay, 4000); timers.set(++timerId, fn); return timerId; },
  clearInterval(id) { timers.delete(id); },
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/arc1.js'), 'utf8'), { document, window });
function expectSlide(index) {
  slides.forEach((slide, current) => {
    assert.equal(slide.attrs['aria-hidden'], String(index !== current));
    assert.equal(slide.inert, index !== current);
    assert.equal(dots[current].attrs['aria-pressed'], String(index === current));
  });
  assert.equal(carousel.querySelector('[data-carousel-background]').src, slides[index].dataset.background);
}
expectSlide(0);
assert.equal(timers.size, 1);
[...timers.values()][0](); expectSlide(1);
[...timers.values()][0](); expectSlide(0);
carousel.querySelector('[data-carousel-prev]').events.click(); expectSlide(1);
carousel.querySelector('[data-carousel-next]').events.click(); expectSlide(0);
dots[1].events.click(); expectSlide(1);
carousel.events.mouseenter(); assert.equal(timers.size, 0);
carousel.events.mouseleave(); assert.equal(timers.size, 1);
carousel.events.focusin(); assert.equal(timers.size, 0);
carousel.events.focusout({ relatedTarget: null }); assert.equal(timers.size, 1);
carousel.querySelector('[data-carousel-pause]').events.click(); assert.equal(timers.size, 0);
carousel.querySelector('[data-carousel-pause]').events.click(); assert.equal(timers.size, 1);
document.hidden = true; documentEvents.visibilitychange[0](); assert.equal(timers.size, 0);
document.hidden = false; documentEvents.visibilitychange[0](); assert.equal(timers.size, 1);
filters[0].open = true;
filters[0].lists['[data-filter-option]'][1].events.click();
assert.equal(filters[0].querySelector('summary').textContent, '2026년');
assert.equal(filters[0].open, false);
filters[1].lists['[data-filter-option]'][0].events.click();
assert.equal(filters[1].querySelector('summary').textContent, '오래된 순');
assert.equal((html.match(/class="archive-card"/g) || []).length, 9);
get('[data-family-toggle]').events.click();
assert.equal(get('[data-family-extra]').hidden, false);
assert.equal(get('[data-family-toggle]').attrs['aria-expanded'], 'true');
get('[data-family-toggle]').events.click();
assert.equal(get('[data-family-extra]').hidden, true);
console.log('PASS: all assets, 9 fixed cards, shared header/footer, 4-second looping carousel, arrows, dots, hover/focus/pause/visibility handling, demo filter selection and family expansion.');
