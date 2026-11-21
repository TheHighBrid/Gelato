'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real cart script rather than asserting that particular strings exist.
function bootCart(responses) {
  const listeners = {};
  const drawerListeners = {};
  const requests = [];
  const nodes = new Map();
  const node = () => ({
    hidden: true, innerHTML: '', textContent: '', style: {}, dataset: {},
    classList: { add() {}, remove() {} },
    setAttribute() {}, removeAttribute() {}, addEventListener() {}, focus() {},
    querySelector() { return null; }, querySelectorAll() { return []; }
  });
  const drawer = node();
  drawer.addEventListener = (type, fn) => { drawerListeners[type] = fn; };
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
      if (next.wait) await next.wait;
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
  const changeQuantity = (key, value) => drawerListeners.change({
    target: {
      value,
      defaultValue: '1',
      dataset: { lineKey: key },
      closest(selector) { return selector.includes('qty-stepper__value') ? this : null; }
    }
  });
  return { open, changeQuantity, requests, items, location };
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

test('failed cart mutation and failed recovery redirect to authoritative native cart', async () => {
  const app = bootCart([
    { ok: false, status: 422, body: { description: 'Cannot update cart' } },
    { body: { items: null, item_count: 0, total_price: 0 } },
    { body: { items: [], item_count: -1, total_price: 0 } }
  ]);
  app.changeQuantity('line-1', '2');
  for (let i = 0; i < 8; i++) await flush();
  assert.equal(app.requests.length, 3);
  assert.match(app.requests[0].url, /cart\/change\.js$/);
  assert.match(app.requests[1].url, /cart\.js$/);
  assert.equal(app.location.assigned, '/cart');
});


test('rapid same-line quantity edits preserve latest intent and serialize writes', async () => {
  let releaseFirst;
  const firstWait = new Promise(resolve => { releaseFirst = resolve; });
  const snapshot = quantity => ({
    items: [{ key: 'line-1', product_title: 'Test', quantity, final_line_price: quantity * 1000 }],
    item_count: quantity, total_price: quantity * 1000, currency: 'CAD'
  });
  const app = bootCart([
    { wait: firstWait, body: snapshot(2) },
    { body: snapshot(4) }
  ]);
  app.changeQuantity('line-1', '2');
  await flush();
  app.changeQuantity('line-1', '3');
  app.changeQuantity('line-1', '4');
  assert.equal(app.requests.length, 1, 'second mutation must wait for first response');
  releaseFirst();
  for (let i = 0; i < 8; i++) await flush();
  assert.equal(app.requests.length, 2);
  assert.deepEqual(app.requests.map(request => JSON.parse(request.options.body).quantity), [2, 4]);
  assert.match(app.items.innerHTML, /value="4"/);
  assert.equal(app.location.assigned, null);
});

test('different cart lines serialize full-cart writes without stale snapshot overwrite', async () => {
  let releaseFirst;
  const firstWait = new Promise(resolve => { releaseFirst = resolve; });
  const snapshot = (first, second) => ({
    items: [
      { key: 'line-a', product_title: 'First', quantity: first, final_line_price: first * 1000 },
      { key: 'line-b', product_title: 'Second', quantity: second, final_line_price: second * 1000 }
    ],
    item_count: first + second, total_price: (first + second) * 1000, currency: 'CAD'
  });
  const app = bootCart([
    { wait: firstWait, body: snapshot(2, 1) },
    { body: snapshot(2, 3) }
  ]);
  app.changeQuantity('line-a', '2');
  await flush();
  app.changeQuantity('line-b', '3');
  assert.equal(app.requests.length, 1, 'second line must wait for the first mutation');
  releaseFirst();
  for (let i = 0; i < 8; i++) await flush();
  assert.equal(app.requests.length, 2);
  assert.deepEqual(app.requests.map(request => JSON.parse(request.options.body).id), ['line-a', 'line-b']);
  assert.deepEqual(app.requests.map(request => JSON.parse(request.options.body).quantity), [2, 3]);
  assert.match(app.items.innerHTML, /data-line-key="line-a"[\s\S]*?value="2"/);
  assert.match(app.items.innerHTML, /data-line-key="line-b"[\s\S]*?value="3"/);
  assert.equal(app.location.assigned, null);
});


test('invalid quantity input never reaches Shopify cart mutation endpoint', async () => {
  const app = bootCart([]);
  for (const invalid of ['-1', '1.5', 'NaN', 'Infinity', '9007199254740992']) {
    app.changeQuantity('line-1', invalid);
  }
  for (let i = 0; i < 3; i++) await flush();
  assert.equal(app.requests.length, 0, 'invalid quantities must not generate cart writes');
  assert.equal(app.location.assigned, null, 'invalid input should not force checkout or redirect');
});
