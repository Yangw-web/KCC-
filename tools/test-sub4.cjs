const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'sub4.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)(?:#[^"]*)?"/g)) {
  assert.ok(fs.existsSync(path.join(root, match[1])), `Missing file: ${match[1]}`);
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
assert.equal((html.match(/class="sealant-story__panel/g) || []).length, 8);
assert.ok(html.indexOf('class="article-comments"') < html.indexOf('class="article-discover"'));
assert.ok(html.includes('src="./assets/sub4_1.jpg"'));
assert.ok(html.includes('<h1 id="article-title">EP.01 욕실 실리콘은 왜 자꾸 까매질까?</h1>'));
for (let n = 1; n <= 15; n++) {
  const css = fs.readFileSync(path.join(root, 'css/sub4.css'), 'utf8');
  assert.ok((html + css).includes('sub4_' + n + '.jpg'), 'All supplied assets must be used: ' + n);
}
const css = fs.readFileSync(path.join(root, 'css/sub4.css'), 'utf8');
assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length);
assert.ok(!css.includes('.article-hero'), 'Hero must use the shared subpage layout');
function element() {
  const attrs = {}, events = {}, classes = new Set();
  return {
    attrs, events, hidden: true, inert: true,
    style: { setProperty() {} },
    classList: { toggle(name, value) { value ? classes.add(name) : classes.delete(name); }, contains(name) { return classes.has(name); } },
    setAttribute(name, value) { attrs[name] = value; },
    getAttribute(name) { return attrs[name]; },
    addEventListener(name, callback) { events[name] = callback; },
    getBoundingClientRect() { return { top: 1500, right: 800, width: 500, height: 150 }; },
    animate() { return { finished: Promise.resolve(), cancel() {} }; },
    focus() { this.focused = true; },
    contains(target) { return target === this; },
  };
}
const elements = new Map();
const get = selector => {
  if (!elements.has(selector)) elements.set(selector, element());
  return elements.get(selector);
};
const windowMock = { scrollY: 0, innerHeight: 900, addEventListener() {}, matchMedia: () => ({ matches: true }), scrollTo(value) { this.lastScroll = value; } };
const context = { document: { querySelector: get, querySelectorAll: () => [], addEventListener() {} }, window: windowMock, getComputedStyle: () => ({ right: '0', borderRadius: '28px' }) };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/sub4.js'), 'utf8'), context);
(async () => {
  get('[data-menu-toggle]').events.click();
  assert.equal(get('[data-menu-toggle]').attrs['aria-expanded'], 'true');
  await context.setSummary(true);
  assert.equal(get('[data-summary-panel]').hidden, false);
  assert.equal(get('[data-summary-panel]').inert, false);
  assert.equal(get('[data-summary-toggle]').attrs['aria-expanded'], 'true');
  await context.setSummary(false);
  assert.equal(get('[data-summary-panel]').hidden, true);
  assert.equal(get('[data-summary-toggle]').attrs['aria-expanded'], 'false');
  get('[data-back-to-top]').events.click();
  assert.equal(windowMock.lastScroll.top, 0);
  console.log('PASS: page structure, all local assets, all 15 supplied images, native hero text, unique IDs, CSS braces, menu, summary open/close and back-to-top.');
})().catch(error => { console.error(error); process.exitCode = 1; });


