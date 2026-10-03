const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const freeReturnMethod = 'free standard return shipping through the Melato return method';
const allProductsMeta = 'Shop Melato tracksuits, denim, dresses, tops, accessories and fragrance, designed in Ottawa with limited-run intent and refined construction';

test('homepage hero keeps the CTAs clear without an unexplained collection minimum price', () => {
  const hero = read('sections/melato-home-conversion.liquid');
  assert.doesNotMatch(hero, /assign hero_from_price = blank/);
  assert.doesNotMatch(hero, /candidate_price = hero_product\.price_min/);
  assert.doesNotMatch(hero, /From \{\{ hero_from_price \| money \}\}/);
  assert.doesNotMatch(hero, /melato-home-clean__price/);
});

test('homepage mobile announcement is centered without the duplicated marquee clone', () => {
  const hero = read('sections/melato-home-conversion.liquid');
  assert.match(hero, /melato-ann__group\[aria-hidden="true"\]\{display:none!important\}/);
  assert.match(hero, /animation:none!important/);
  assert.match(hero, /text-align:center!important/);
});

test('trust and returns copy advertises complimentary delivery and protected free returns', () => {
  const layout = read('layout/theme.liquid');
  const cart = read('sections/main-cart.liquid');
  const filters = read('snippets/melato-rendered-output-filters.liquid');
  const index = read('templates/index.json');

  assert.match(layout, /<span>Secure checkout<\/span>/);
  assert.match(cart, /<strong>Secure checkout<\/strong>/);
  assert.ok(cart.includes('free returns within 30 days'));
  assert.ok(cart.includes(freeReturnMethod));
  assert.ok(filters.includes(freeReturnMethod));
  assert.ok(filters.includes('Fair Use &amp; Return Protection'));
  assert.ok(filters.includes('This protection does not limit rights that cannot be excluded under applicable consumer law'));
  assert.ok(index.includes('COMPLIMENTARY STANDARD DELIVERY'));
  assert.ok(index.includes('FREE RETURNS WITHIN 30 DAYS'));
  assert.doesNotMatch(cart, /customer-paid return shipping/i);
  assert.doesNotMatch(index, /customers pay return shipping/i);
});

test('all product and cart recovery prices omit the parsed Price prefix', () => {
  const card = read('snippets/product-card.liquid');
  const emptyDrawer = read('snippets/melato-cart-empty-state.liquid');
  const drawer = read('snippets/cart-drawer.liquid');

  assert.doesNotMatch(card, /visually-hidden">Price:/);
  assert.doesNotMatch(card, /aria-label="Price"/);
  assert.match(card, /card_price_label/);
  assert.doesNotMatch(emptyDrawer, />Price \{\{ recovery_product\.price \| money \}\}</);
  assert.doesNotMatch(emptyDrawer, /, price \{\{ recovery_product\.price/);
  assert.doesNotMatch(drawer, /aria-label="Price \{\{ item\.final_line_price/);
});

test('All Products and cart metadata are purpose-built', () => {
  const layout = read('layout/theme.liquid');
  assert.equal(allProductsMeta.length, 140);
  assert.ok(layout.includes(allProductsMeta));
  assert.match(layout, /elsif template\.name == 'cart'/);
  assert.match(layout, /assign melato_meta_title = 'Your bag'/);
  assert.match(layout, /Review your Melato bag, update quantities, and continue securely to checkout\./);
});