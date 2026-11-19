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
    setAttribute() {}, removeAttribute() {}, addEventListener() {}, focus() {},
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
    Date, Promise, Set, Map, WeakSet, FormData, clearTimeout() {}, CustomEvent: class {},
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

test('cart drawer renders untrusted catalog fields as escaped text and attributes', async () => {
  const app = bootCart([{ body: {
    items: [{
      key: 'line" onmouseover="alert(1)',
      product_title: '<img src=x onerror=alert(1)>',
      variant_title: '<script>alert(1)</script>',
      url: '/products/test?x=" onclick="alert(1)',
      image: 'https://example.com/a" onerror="alert(1)',
      quantity: 1,
      final_line_price: 2500
    }],
    item_count: 1, total_price: 2500, currency: 'CAD'
  } }]);
  app.open();
  await flush();
  await flush();
  const markup = app.items.innerHTML;
  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(markup, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(markup, /data-line-key="line&quot; onmouseover=&quot;alert\(1\)"/);
  assert.match(markup, /href="\/products\/test\?x=&quot; onclick=&quot;alert\(1\)"/);
  assert.match(markup, /src="https:\/\/example\.com\/a&quot; onerror=&quot;alert\(1\)"/);
  assert.doesNotMatch(markup, /<script|<img src=x|onmouseover="alert\(1\)"/);
});

test('cart drawer rejects executable and protocol-relative catalog URLs', async () => {
  const app = bootCart([{ body: {
    items: [{
      key: 'unsafe', product_title: 'Safe product',
      url: 'javascript:alert(1)', image: 'data:image/svg+xml,<svg onload=alert(1)>',
      quantity: 1, final_line_price: 2500
    }],
    item_count: 1, total_price: 2500, currency: 'CAD'
  } }]);
  app.open();
  await flush();
  await flush();
  assert.match(app.items.innerHTML, /href="#"/);
  assert.doesNotMatch(app.items.innerHTML, /javascript:|data:image|<img /);
});
