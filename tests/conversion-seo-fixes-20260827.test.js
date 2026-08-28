const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const returnsPolicy = 'Eligible unworn items may be returned within 30 days; customers pay return shipping unless the item arrived damaged, defective, or incorrect.';
const allProductsMeta = 'Shop Melato tracksuits, denim, dresses, tops, accessories and fragrance, designed in Ottawa with limited-run intent and refined construction';

test('homepage hero exposes a dynamic collection entry price below its CTAs', () => {
  const hero = read('sections/melato-home-conversion.liquid');
  assert.match(hero, /assign hero_from_price = blank/);
  assert.match(hero, /candidate_price = hero_product\.price_min/);
  assert.match(hero, /From \{\{ hero_from_price \| money \}\}/);
  assert.match(hero, /melato-home-clean__price/);
});

test('trust and returns copy is explicit and parser-clean', () => {
  const layout = read('layout/theme.liquid');
  const cart = read('sections/main-cart.liquid');
  const filters = read('snippets/melato-rendered-output-filters.liquid');
  const index = read('templates/index.json');

  assert.match(layout, /<span>Secure checkout<\/span>/);
  assert.match(cart, /<strong>Secure checkout<\/strong>/);
  assert.ok(cart.includes(returnsPolicy));
  assert.ok(filters.includes(returnsPolicy));
  assert.match(index, /ELIGIBLE RETURNS WITHIN 30 DAYS · RETURN SHIPPING PAID BY CUSTOMER/);
});

test('product cards do not emit a parsed Price prefix', () => {
  const card = read('snippets/product-card.liquid');
  assert.doesNotMatch(card, /visually-hidden">Price:/);
  assert.doesNotMatch(card, /aria-label="Price"/);
  assert.match(card, /card_price_label/);
});

test('All Products and cart metadata are purpose-built', () => {
  const layout = read('layout/theme.liquid');
  assert.equal(allProductsMeta.length, 140);
  assert.ok(layout.includes(allProductsMeta));
  assert.match(layout, /elsif template\.name == 'cart'/);
  assert.match(layout, /assign melato_meta_title = 'Your bag'/);
  assert.match(layout, /Review your Melato bag, update quantities, and continue securely to checkout\./);
});
