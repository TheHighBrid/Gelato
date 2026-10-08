const test = require('node:test');
const assert = require('node:assert/strict');
const { EXHIBITS, ACTS, getExhibit, getPrefetchWindow } = require('../src/lib/exhibits');
const { resolveVariant, formatPrice, getInventoryScarcityNotice, getExposedSizeOptions } = require('../src/lib/variants');
const { calculatePixelPosition, clampWithinBounds, ensureMinTouchTarget } = require('../src/lib/hotspots');
const { CartStateMachine, createShopifyAjaxPayload } = require('../src/lib/cart-engine');

test('registry has 31 unique frames across 4 non-overlapping acts', () => {
  assert.equal(EXHIBITS.length, 31);
  assert.equal(new Set(EXHIBITS.map(e => e.id)).size, 31);
  assert.equal(Object.keys(ACTS).length, 4);
  for (const e of EXHIBITS) {
    assert.ok(e.id >= ACTS[e.act].frameRange[0] && e.id <= ACTS[e.act].frameRange[1]);
    assert.equal(e.hotspots.length, 2);
    for (const h of e.hotspots) {
      assert.ok(h.xPercent >= 0 && h.xPercent <= 100);
      assert.ok(h.yPercent >= 0 && h.yPercent <= 100);
    }
  }
});
test('lookup & prefetch clip at the archive edges', () => {
  assert.equal(getExhibit(1).exhibitNumber, '01');
  assert.equal(getExhibit('31').exhibitNumber, '31');
  assert.equal(getExhibit(32), null);
  assert.deepEqual(getPrefetchWindow(1), [1,2,3]);
  assert.deepEqual(getPrefetchWindow(31), [29,30,31]);
  assert.deepEqual(getPrefetchWindow(0), []);
});
test('variants resolve selections and do not claim unknown inventory is depleted', () => {
  const variants = [
    { id: 10, option1: 'S', option2: 'Noir', available: true, inventory_quantity: null },
    { id: 11, option1: 'M', option2: 'Noir', available: true, inventory_quantity: 2 },
    { id: 12, option1: 'L', option2: 'Noir', available: false, inventory_quantity: 0 }
  ];
  assert.equal(resolveVariant(variants, { option1: 'M', option2: 'Noir' }).id, 11);
  assert.equal(resolveVariant(variants, { option1: 'XL' }), null);
  assert.equal(getInventoryScarcityNotice(variants[0]), null);
  assert.equal(getInventoryScarcityNotice(variants[1]).level, 'LOW_STOCK');
  assert.equal(getInventoryScarcityNotice(variants[2]).level, 'SOLD_OUT');
  assert.deepEqual(getExposedSizeOptions(variants, 'S').map(v => v.disabled), [false, false, true]);
  assert.equal(formatPrice(125050), '$1,250.50');
});
test('hotspots position, clamp, and respect minimum touch targets', () => {
  assert.deepEqual(calculatePixelPosition({ xPercent: 50, yPercent: 25 }, { width: 400, height: 800 }), { x:200, y:200 });
  assert.deepEqual(clampWithinBounds({ x: 390, y: 790 }, { width: 100, height: 100 }, { width: 400, height: 800 }), { x:300, y:700 });
  assert.equal(ensureMinTouchTarget(16).hitBoxSize, 44);
  assert.equal(ensureMinTouchTarget(60).hitBoxSize, 60);
});
test('cart formats valid Shopify AJAX payloads and maintains isolated optimistic totals', () => {
  assert.deepEqual(createShopifyAjaxPayload('123', 2), { items: [{ id:123, quantity:2, properties:{} }] });
  assert.throws(() => createShopifyAjaxPayload('not-an-id'));
  assert.throws(() => createShopifyAjaxPayload(123, 0));
  const cart = new CartStateMachine();
  let notifications = 0;
  const unsubscribe = cart.subscribe(() => notifications++);
  cart.addItem({ variantId: 123, price: 9500, quantity: 1 });
  cart.addItem({ variantId: '123', price: 9500, quantity: 2 });
  assert.equal(cart.getState().itemCount, 3);
  assert.equal(cart.getState().subtotalCents, 28500);
  cart.openCart();
  assert.equal(cart.getState().isOpen, true);
  cart.removeItem(123);
  assert.equal(cart.getState().itemCount, 0);
  unsubscribe();
  assert.equal(notifications, 4);
});
