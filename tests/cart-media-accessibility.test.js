const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cart = fs.readFileSync(path.join(__dirname, '../sections/main-cart.liquid'), 'utf8');

test('cart media handles image-less products without dividing by a missing aspect ratio', () => {
  assert.match(cart, /if item\.image != blank/);
  assert.match(cart, /else[\s\S]*?placeholder_svg_tag: 'cart-item__placeholder-svg'/);
  assert.match(cart, /role="img" aria-label="{{ item\.product\.title \| escape }} image unavailable"/);
  const imageGuard = cart.indexOf('if item.image != blank');
  const ratio = cart.indexOf('item.image.aspect_ratio');
  const fallback = cart.indexOf('placeholder_svg_tag');
  assert.ok(imageGuard !== -1 && imageGuard < ratio && ratio < fallback);
});

test('cart item title, variant and product links escape dynamic values', () => {
  assert.match(cart, /href="{{ item\.url \| escape }}" class="cart-item__title">{{ item\.product\.title \| escape }}/);
  assert.match(cart, /{{ item\.variant\.title \| escape }}/);
  assert.match(cart, /<a href="{{ item\.url \| escape }}" aria-label="{{ item\.product\.title \| escape }}">/);
});

test('cart quantity controls retain line keys and translated checkout action', () => {
  assert.match(cart, /name="updates\[\]"/);
  assert.equal((cart.match(/data-line="{{ item\.key \| escape }}"/g) || []).length, 3);
  assert.match(cart, /name="checkout"/);
  assert.match(cart, /'cart\.checkout' \| t/);
});
