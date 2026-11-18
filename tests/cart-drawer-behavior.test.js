'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real cart script rather than asserting that particular strings exist.
function bootCart(responses) {
  const listeners = {};
  const requests = [];
  const nodes = new Map();
  const node = () => ({
    hidden: true, innerHTML: '', textContent: '', style: {}, dataset: {},
    classList: { add() {}, remove() {} },
    setAttribute() {}, removeAttribute() {}, focus() {},
    querySelector() { return null; }, querySelectorAll() { return []; }
  });
  const drawer = node();
  const items = node();
  drawer.querySelector = selector => selector.includes('cart-items') ? items : null;
  const document = {
    currentScript: null, activeElement: null,
    documentElement: { lang: 'en-CA' }, body: { style: {} },
    getElementById(id) { return id === 'cart-drawer' ? drawer : null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener(type, fn) { listeners[type] = fn; }
  };
  const location = { assigned: null, assign(url) { this.assigned = url; } };
  const window = {
    Shopify: { routes: { root: '/' } }, location,
    setTimeout() {}, dispatchEvent() {}
  };
  const context = {
    document, window, navigator: { language: 'en-CA' },
    console: { error() {}, warn() {} }, Intl, Number, String,
    Date, Promise, Set, Map, WeakSet, FormData, CustomEvent: class {},
    fetch: async (url, options) => {
      requests.push({ url, options });
      const next = responses.shift();
      if (!next) throw new Error('Unexpected cart request');
      return {
        ok: next.ok !== false, status: next.status || 200,
        json: async () => next.body
      };
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'melato-cart-drawer.js' });
  const open = () => listeners.click({
    target: { closest(selector) { return selector.includes('data-cart-open') ? { closest() { return null; } } : null; } },
    preventDefault() {}
  });
  return { open, requests, items, location };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('cart open retries malformed GET and renders only validated snapshot', async () => {
  const cart = { items: [], item_count: 0, total_price: 0, currency: 'CAD' };
  const app = bootCart([
    { body: { items: [], item_count: -1, total_price: 0 } },
    { body: cart }
  ]);
  app.open();
  await flush();
  await flush();
  assert.equal(app.requests.length, 2);
  assert.match(app.requests[0].url, /cart\.js$/);
  assert.match(app.requests[1].url, /cart\.js\?melato_refresh=/);
  assert.match(app.items.innerHTML, /Your cart is empty/);
  assert.equal(app.location.assigned, null);
});

test('cart open fails closed to native cart after two invalid snapshots', async () => {
  const app = bootCart([
    { body: { items: [], item_count: 0, total_price: -1 } },
    { body: { items: null, item_count: 0, total_price: 0 } }
  ]);
  app.open();
  await flush();
  await flush();
  assert.equal(app.requests.length, 2);
  assert.equal(app.location.assigned, '/cart');
  assert.equal(app.items.innerHTML, '');
});
