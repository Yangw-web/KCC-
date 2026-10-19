const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const routes = [['1%의 힘', 2], ['AI X파일', 3], ['케비의 은밀한 출장', 1], ['팀캐를 찾아라', 6], ['아묻따 KCC', 4], ['ROOM SOS', 5]];
for (const [file, expected] of [['index.html', 6], ['main2.html', 6], ['arc1.html', 6], ['arc2.html', 7]]) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(!html.includes('아몰따 KCC'));
  const blocks = file === 'main2.html'
    ? html.match(/<a class="main2-(?:special__card|story)"[\s\S]*?<\/a>/g)
    : html.match(/<article class="(?:special__card|inside__card|archive-card)[^"]*"[^>]*>[\s\S]*?<\/article>/g);
  let checked = 0;
  for (const block of blocks) {
    const route = routes.find(([label]) => block.includes('>' + label + '<') || block.includes('>' + label + '!<'));
    if (!route) continue;
    const href = block.match(/<a[^>]+href="([^"]+)"/)[1];
    assert.equal(href, './sub' + route[1] + '.html', file + ': ' + route[0]);
    assert.ok(fs.existsSync(path.join(root, href)));
    checked++;
  }
  assert.equal(checked, expected, file);
}
console.log('PASS: all 25 corresponding thumbnails link to the requested subpages; corrected category spelling.');
