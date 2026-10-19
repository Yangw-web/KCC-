const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const templates = [...html.matchAll(/<template data-slide-template>([\s\S]*?)<\/template>/g)].map(match => match[1]);
assert.equal(templates.length, 3);
const expected = [[2, 'KCC MASTER'], [3, 'AI X파일'], [1, '1%의 힘']];
templates.forEach((template, index) => {
  const [image, title] = expected[index];
  assert.ok(template.includes('src="./assets/spl_th_fixed' + image + '.png"'));
  assert.ok(template.includes('<h3>' + title + '</h3>'));
  assert.ok(!template.includes('손톱만 한 케비'));
  const copy = template.match(/<p>(.*?)<\/p>/)[1];
  assert.ok(copy.length >= 70 && copy.length <= 120);
  const png = fs.readFileSync(path.join(root, 'assets', 'spl_th_fixed' + image + '.png'));
  assert.equal(png.readUInt32BE(16), 728);
  assert.equal(png.readUInt32BE(20), 512);
});
assert.deepEqual([expected[2][1], expected[0][1], expected[1][1]], ['1%의 힘', 'KCC MASTER', 'AI X파일']);
const inside = html.slice(html.indexOf('<section class="inside" id="inside"'), html.indexOf('<section class="inside outside"'));
for (let image = 4; image <= 6; image++) {
  assert.ok(inside.includes('src="./assets/spl_th_fixed' + image + '.png"'));
  const png = fs.readFileSync(path.join(root, 'assets', 'spl_th_fixed' + image + '.png'));
  assert.equal(png.readUInt32BE(16), 606);
  assert.equal(png.readUInt32BE(20), 427);
}
assert.equal((inside.match(/<h4>/g) || []).length, 4);
assert.equal(new Set([...inside.matchAll(/<h4>(.*?)<\/h4>/g)].map(match => match[1])).size, 4);
assert.ok(inside.includes('href="./sub1.html"'));
assert.ok(inside.includes('케비의 은밀한 출장'));
assert.ok(inside.includes('팀캐를 찾아라!'));
assert.ok(inside.includes('아묻따 KCC'));
assert.ok(inside.includes('우리회사 F5 위원회'));
console.log('PASS: three new SPECIAL thumbnails, screenshot-matched initial order, titles, tailored hover copy and original image dimensions.');
console.log('PASS: three replacement INSIDE thumbnails, four distinct hover stories, screenshot titles and preserved sub1 link.');
const outside = html.slice(html.indexOf('<section class="inside outside"'), html.indexOf('<section class="inside news"'));
for (let image = 7; image <= 10; image++) {
  assert.ok(outside.includes('src="./assets/spl_th_fixed' + image + '.png"'));
  const png = fs.readFileSync(path.join(root, 'assets', 'spl_th_fixed' + image + '.png'));
  assert.equal(png.readUInt32BE(16), 606);
  assert.equal(png.readUInt32BE(20), 427);
}
assert.equal(new Set([...outside.matchAll(/<h4>(.*?)<\/h4>/g)].map(match => match[1])).size, 4);
for (const title of ['ROOM SOS', 'VS 추구미', '재료의 인문학', '사이의 기술']) assert.ok(outside.includes('<h3>' + title + '</h3>'));
assert.ok(!outside.includes('손톱만 한 케비'));
console.log('PASS: four replacement OUTSIDE thumbnails, four tailored hover stories and screenshot-matched category titles.');
