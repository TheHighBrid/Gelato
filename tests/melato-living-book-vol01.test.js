const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

function parseJsonTemplate(file) {
  const source = read(file).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  return JSON.parse(source);
}

test('Living Lookbook production template uses Living Book Vol. 01', () => {
  const template = parseJsonTemplate('templates/page.living-lookbook.json');
  const sectionIds = new Set(Object.keys(template.sections));
  for (const sectionId of template.order) assert.ok(sectionIds.has(sectionId), `Missing ordered section: ${sectionId}`);
  assert.equal(template.order.length, 1);
  assert.equal(template.sections.main?.type, 'melato-living-book-vol01');
  assert.equal(template.sections.main?.settings?.hide_store_chrome, true);
});

test('Living Book Vol. 01 section, assets and engine are present', () => {
  const section = read('sections/melato-living-book-vol01.liquid');
  assert.match(section, /melato-living-book-vol01\.css/);
  assert.match(section, /melato-living-book-vol01\.js/);
  assert.match(section, /data-lbv-root/);
  assert.match(section, /hide_store_chrome/);

  const css = read('assets/melato-living-book-vol01.css');
  assert.match(css, /body\.template-page--living-lookbook/);
  assert.match(css, /\.lbv-book/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /100dvh/);
  assert.match(css, /\.lbv-spread\.is-current/);
  assert.match(css, /\.lbv-enter/);
  assert.match(css, /\.lbv-reader\[hidden\]/);
  assert.match(css, /\.lbv-toc:not\(\[hidden\]\)/);
  assert.doesNotMatch(css, /rotateY/);
  assert.doesNotMatch(css, /filter:\s*blur/);
  assert.doesNotMatch(css, /animation-fill-mode:\s*both/);
  assert.doesNotMatch(css, /\.lbv-spread\.enter[^{]*both/);

  const engine = read('assets/melato-living-book-vol01.js');
  assert.match(engine, /The Living Book/);
  assert.match(engine, /cdn\.shopify\.com\/s\/files\/1\/0809\/3358\/5151\/files/);
  assert.match(engine, /\/collections\/tracksuits/);
  assert.match(engine, /\/pages\/our-story/);
  assert.match(engine, /is-arming/);
  assert.match(engine, /Enter the book/);
  assert.match(engine, /mountSpread\(0, 'is-current'\)/);
  assert.match(engine, /divididos-velour-track-jacket-view-03/);
  assert.match(engine, /Split on purpose/);
  assert.match(engine, /Je devais voir Anne-So/);
  assert.match(engine, /rex-x-fur-jacket-view-05/);
  assert.match(engine, /blush-ledger-satin-shirt-view-01/);
  assert.match(engine, /@divididosCast/);
  assert.match(engine, /data-lbv-assets/);
  assert.doesNotMatch(engine, /The_Living_Lookbook-Frame-02_5/);
  assert.doesNotMatch(engine, /The_Living_Lookbook-Frame-0_10/);
  assert.doesNotThrow(() => new vm.Script(engine));

  assert.match(section, /data-lbv-assets/);
  assert.match(section, /lbv-goldset-front\.jpg/);
  assert.match(section, /lbv-divididos-cast\.jpg/);
  assert.match(section, /lbv-waqaa-front\.jpg/);
  assert.match(section, /lbv-astro-front\.jpg/);
  assert.match(section, /lbv-suit-back\.jpg/);
  for (const file of [
    'lbv-goldset-front.jpg',
    'lbv-goldset-back.jpg',
    'lbv-sidetape-back.jpg',
    'lbv-divididos-cast.jpg',
    'lbv-divididos-exit.jpg',
    'lbv-waqaa-front.jpg',
    'lbv-astro-front.jpg',
    'lbv-astro-profile.jpg',
    'lbv-suit-back.jpg'
  ]) {
    assert.ok(fs.existsSync(path.join(repo, 'assets', file)), 'missing theme frame ' + file);
  }
});

test('House living book route points at the editorial page', () => {
  const house = read('assets/melato-house.js');
  assert.match(house, /livingBook:\s*'\/pages\/living-lookbook'/);
  const rail = read('snippets/melato-world-rail.liquid');
  assert.match(rail, /href="\/pages\/living-lookbook"/);
});
