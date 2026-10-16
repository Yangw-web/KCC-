const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() { this.style = {}; this.attrs = {}; this.listeners = {}; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
}
function createCarousel() {
  const root = new Element();
  const track = new Element();
  const status = new Element();
  const prev = new Element();
  const next = new Element();
  const slides = Array.from({ length: 3 }, () => new Element());
  const elements = { '[data-case-track]': track, '[data-case-status]': status, '[data-case-prev]': prev, '[data-case-next]': next };
  root.querySelector = (selector) => elements[selector];
  root.querySelectorAll = () => slides;
  return { root, track, status, prev, next, slides };
}
const first = createCarousel();
const second = createCarousel();
const third = createCarousel();
const { root, track, status, prev, next, slides } = first;
const source = fs.readFileSync(path.join(__dirname, '../js/sub2.js'), 'utf8');
const carouselCode = source.slice(source.indexOf('function initializeCaseCarousel'));
vm.runInNewContext(carouselCode, { document: { querySelectorAll: () => [first.root, second.root, third.root] } });
function expect(index) {
  assert.equal(track.style.transform, `translateX(-${index * 100}%)`);
  assert.equal(status.textContent, `CASE 0${index + 1} / 03`);
  slides.forEach((slide, current) => { assert.equal(slide.inert, current !== index); assert.equal(slide.attrs['aria-hidden'], String(current !== index)); });
}
expect(0);
next.listeners.click(); expect(1);
next.listeners.click(); expect(2);
next.listeners.click(); expect(0);
prev.listeners.click(); expect(2);
root.listeners.keydown({ key: 'Home', preventDefault() {} }); expect(0);
root.listeners.keydown({ key: 'ArrowRight', preventDefault() {} }); expect(1);
root.listeners.keydown({ key: 'End', preventDefault() {} }); expect(2);
root.listeners.keydown({ key: 'ArrowLeft', preventDefault() {} }); expect(1);
root.listeners.pointerdown({ target: { closest: () => null }, pointerType: 'touch', pointerId: 1, clientX: 180, clientY: 100 });
root.listeners.pointerup({ pointerId: 1, clientX: 70, clientY: 105 }); expect(2);
root.listeners.pointerdown({ target: { closest: () => null }, pointerType: 'touch', pointerId: 2, clientX: 80, clientY: 100 });
root.listeners.pointerup({ pointerId: 2, clientX: 85, clientY: 200 }); expect(2);
second.next.listeners.click();
assert.equal(second.track.style.transform, 'translateX(-100%)');
expect(2);
prev.listeners.click(); expect(1);
assert.equal(second.status.textContent, 'CASE 02 / 03');
second.prev.listeners.click();
assert.equal(second.track.style.transform, 'translateX(-0%)');
third.prev.listeners.click();
assert.equal(third.status.textContent, 'CASE 03 / 03');
third.next.listeners.click();
assert.equal(third.status.textContent, 'CASE 01 / 03');
assert.equal(second.status.textContent, 'CASE 01 / 03');
expect(1);
console.log('PASS: three independent carousels, next/previous, loop, keyboard navigation, horizontal swipe, vertical-scroll preservation, accessible slide state.');
