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
  assert.match(engine, /MELATO_TAWAKAL26_TLB_OTTAWA_001/);
  assert.match(engine, /The_Living_Lookbook_Editorial_Shots_Vol2_15/);
  for (const removedFrame of [
    'divFront',
    'divCast',
    'divBack',
    'divExit',
    'sideTape',
    'detourStudio',
    'dressPack',
    'waqaa',
    'astroFront',
    'astroProfile',
    'suitBack',
    'sunday',
    'colourblock',
    'bonjour',
    'ciao',
    'casino',
    'enroute2',
    'riad',
    'redlight',
    'nightedit',
    'burgundy',
    'casting',
    'ojos',
    'goldFront',
    'goldBack',
    'blushStudio',
    'blushCollar',
    'rexWorn',
    'rexCollar',
    'frame0',
    'frame10',
    'colourblock2',
    'intent',
    'The argument, from behind',
    'Divididos, facing',
    'Same set, second body',
    'Leaving, still divided',
    'Side tape, walking',
    'Je devais voir Anne-So',
    'The violation, standing',
    'The other script',
    'Figure XII',
    'In profile, still orbiting',
    'The other uniform',
    'Sunday edition',
    'Colourblock as personality test',
    'Bonjour',
    'Ciao',
    'House always dressed',
    'Still en route',
    'Riad, with citrus',
    'Redlight',
    'The night edit',
    'Blush, under lights',
    'The plaque, close',
    'Rex X, worn',
    'The shawl, at the throat'
  ]) {
    assert.equal(engine.includes(removedFrame), false, 'rejected Living Lookbook frame leaked back in: ' + removedFrame);
  }
  assert.match(engine, /data-lbv-assets/);
  assert.doesNotMatch(engine, /The_Living_Lookbook-Frame-02_5/);
  assert.doesNotMatch(engine, /The_Living_Lookbook-Frame-0_10/);
  assert.doesNotThrow(() => new vm.Script(engine));

  assert.doesNotMatch(section, /data-lbv-assets/);
  assert.doesNotMatch(section, /lbv-(?:goldset|sidetape|divididos|waqaa|astro|suit)-/);
});

test('House living book route points at the editorial page', () => {
  const house = read('assets/melato-house.js');
  assert.match(house, /livingBook:\s*'\/pages\/living-lookbook'/);
  const rail = read('snippets/melato-world-rail.liquid');
  assert.match(rail, /href="\/pages\/living-lookbook"/);
});
