const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../snippets/cart-drawer.liquid'), 'utf8');

test('cart drawer renders a visible placeholder for missing product media', () => {
  assert.match(source, /if item\.image != blank[\s\S]*?else[\s\S]*?placeholder_svg_tag: 'cart-item__img cart-item__img--placeholder'/);
  assert.match(source, /if item\.image != blank[\s\S]*?image_url: width: 120/);
  assert.match(source, /if item\.image != blank[\s\S]*?divided_by: item\.image\.aspect_ratio/);
});

test('cart drawer escapes dynamic cart content before HTML interpolation', () => {
  for (const expression of ['item.key', 'item.url', 'item.product.title', 'item.variant.title', 'cart.note']) {
    const raw = new RegExp('\\{\\{\\s*' + expression.replace(/\\./g, '\\\\.') + '\\s*\\}\\}');
    assert.doesNotMatch(source, raw, expression + ' must not be rendered without escaping');
    assert.ok(source.includes('{{ ' + expression + ' | escape }}'), expression + ' must be escaped');
  }
});


test('AJAX cart redraw retains a visible missing-media fallback', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  assert.match(js, /const image = imageUrl \?[^\n]+: '<span class="cart-item__img cart-item__img--placeholder" aria-hidden="true"><\/span>';/);
  assert.match(js, /\$\{image\}<\/a>/);
});

test('cart line updates preserve latest intent and serialize whole-cart mutations', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  assert.match(js, /const pendingLines = new Set\(\)/);
  assert.match(js, /const queuedLineQuantities = new Map\(\)/);
  assert.match(js, /if \(pendingLines\.has\(key\)\) \{\s*queuedLineQuantities\.set\(key, requested\);\s*return;/);
  assert.match(js, /const task = cartMutationTail\.then\(operation\)/);
  assert.match(js, /cartMutationTail = task\.catch\(\(\) => \{\}\)/);
  assert.match(js, /await serializeCartMutation\(async \(\) =>/);
  assert.match(js, /nextQuantity = queuedLineQuantities\.get\(key\)/);
  assert.match(js, /finally \{\s*queuedLineQuantities\.delete\(key\);\s*pendingLines\.delete\(key\);/);
  assert.match(js, /if \(pendingLines\.size === 0\) drawer\.classList\.remove\('is-updating'\)/);
});

test('quantity clicks retain optimistic input changes during in-flight requests', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  assert.match(js, /if \(input\) input\.value = String\(nextQuantity\)/);
  assert.match(js, /updateLine\(key, nextQuantity\)/);
});
