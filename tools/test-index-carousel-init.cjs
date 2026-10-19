const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const bootstrap = source.slice(source.indexOf('function scrollToSpecial()'), source.indexOf('const newsItems ='));
for (const hash of ['', '#special']) {
  let builds = 0;
  let measurements = 0;
  const listeners = {};
  const scrolls = [];
  const window = {
    location: { hash },
    addEventListener: (type, callback) => { listeners[type] = callback; },
    scrollTo: options => scrolls.push(options),
  };
  vm.runInNewContext(bootstrap, {
    window,
    // Header links now target archive pages, so the former hash link is absent.
    menu: { querySelector: () => null },
    sequenceTop: 100,
    stageHeight: 500,
    sequenceTiming: { specialEnd: 3 },
    reduceMotion: { matches: true },
    buildSlides: () => { builds++; },
    measureSequence: () => { measurements++; },
  });
  assert.equal(builds, 1, 'Cards must be built before the first autoplay tick');
  assert.equal(measurements, 1);
  assert.equal(scrolls.length, hash ? 1 : 0);
  window.location.hash = '#special';
  listeners.hashchange();
  assert.equal(scrolls.at(-1).top, 1600);
  assert.equal(scrolls.at(-1).behavior, 'auto');
}
console.log('PASS: initial carousel build works without the legacy header link; direct hash navigation remains supported.');
