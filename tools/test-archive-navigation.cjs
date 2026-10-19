const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header, page + ': missing header');
  assert.match(header, /<a href="\.\/arc1\.html"[^>]*>SPECIAL<\/a>/, page);
  assert.match(header, /<a href="\.\/arc2\.html"[^>]*>INSIDE<\/a>/, page);
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(index.includes('<a class="special__more" href="./arc1.html" aria-label="SPECIAL 목차로 이동">'));
assert.ok(index.includes('<a class="special__more inside__more" href="./arc2.html" aria-label="INSIDE 목차로 이동">'));
assert.ok(!index.includes('SPECIAL 목차 (준비 중)'));
assert.ok(!index.includes('INSIDE 목차 (준비 중)'));
console.log('PASS: SPECIAL/INSIDE header links on all ' + pages.length + ' pages, and both index section + links.');
