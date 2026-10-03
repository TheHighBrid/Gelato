const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pdp = read('sections/melato-product-page-rebuild.liquid');
const hero = read('sections/hero-video.liquid');
const template = read('templates/product.json');
const hotfix = read('snippets/melato-theme-audit-hotfix.liquid');

test('canonical PDP emits currency explicitly instead of depending on output hotfixes', () => {
  assert.match(pdp, /current_variant\.price \| money_with_currency/);
  assert.match(pdp, /current_variant\.compare_at_price \| money_with_currency/);
});

test('hero owns an explicit user-controlled sound toggle while preserving muted autoplay', () => {
  assert.match(hero, /data-melato-hero-sound/);
  assert.match(hero, /video\.muted=false/);
  assert.match(hero, /video\.muted=true/);
  assert.match(hero, /muted: true/);
});

test('default PDP exposes one recommendation section, not a second hotfix-generated block', () => {
  assert.match(template, /"type": "related-products"/);
  assert.doesNotMatch(hotfix, /melato-related-products--curated/);
});
