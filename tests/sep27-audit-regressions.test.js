const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pdp = read('sections/melato-product-page-rebuild.liquid');
const hero = read('sections/video.liquid');
const template = read('templates/product.json');
const hotfix = read('snippets/melato-theme-audit-hotfix.liquid');

test('canonical PDP emits currency explicitly instead of depending on output hotfixes', () => {
  assert.match(pdp, /current_variant\.price \| money_with_currency/);
  assert.match(pdp, /current_variant\.compare_at_price \| money_with_currency/);
});

test('active homepage video owns its sound toggle while preserving muted autoplay', () => {
  const home = JSON.parse(read('templates/index.json').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  assert.equal(home.sections[home.order.find(id => !home.sections[id].disabled)].type, 'video');
  assert.match(hero, /data-melato-sound-toggle/);
  assert.match(hero, /video\.muted = false/);
  assert.match(hero, /video\.muted = true/);
  assert.match(hero, /autoplay muted loop playsinline/);
});

test('default PDP exposes one recommendation section, not a second hotfix-generated block', () => {
  assert.match(template, /"type": "related-products"/);
  const parsed = JSON.parse(template.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  assert.equal(parsed.order.filter(id => parsed.sections[id].type === 'related-products' && !parsed.sections[id].disabled).length, 1);
  assert.match(hotfix, /unless output contains 'melato-related-products--curated' or output contains 'RelatedHeading-'/);
});
