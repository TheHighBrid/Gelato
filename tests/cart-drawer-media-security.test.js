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


test('cart redraw restores queued shopper quantities after another line completes', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  assert.match(js, /function renderCart\(cart\) \{[\s\S]*?renderItems\(cart\);[\s\S]*?queuedLineQuantities\.forEach\(\(quantity, key\) =>/);
  assert.match(js, /\.find\(node => node\.dataset\.lineKey === key\)/);
  assert.match(js, /if \(input\) input\.value = String\(quantity\)/);
});

test('add-to-cart renders its snapshot inside the serialized mutation', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  const start = js.indexOf('async function addForm(');
  const end = js.indexOf('function trapTab(', start);
  assert.ok(start >= 0 && end > start);
  const addForm = js.slice(start, end);
  assert.match(addForm, /const cart = await serializeCartMutation\(async \(\) => \{[\s\S]*?const latestCart = await fetchCart\(\);[\s\S]*?renderCart\(latestCart\);[\s\S]*?return latestCart;\s*\}\);/);
  assert.doesNotMatch(addForm, /\}\);\s*renderCart\(cart\);/);
});

test('opening cart serializes GET and rendering with cart mutations', () => {
  const js = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  const start = js.indexOf("const opener = event.target.closest(");
  const end = js.indexOf("if (event.target.closest('[data-cart-close]'))", start);
  assert.ok(start >= 0 && end > start);
  const openHandler = js.slice(start, end);
  assert.match(openHandler, /serializeCartMutation\(async \(\) => \{\s*const cart = await fetchCart\(\);\s*renderCart\(cart\);\s*return cart;\s*\}\)/);
  assert.doesNotMatch(openHandler, /fetchCart\(\)\.then\(cart =>/);
});
