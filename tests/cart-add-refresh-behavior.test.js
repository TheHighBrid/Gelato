'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual submit handler. A successful add must never be retried
// just because the subsequent cart refresh fails.
function boot(responses) {
  const listeners = {};
  const requests = [];
  const drawer = {
    hidden: true, style: {}, classList: { add() {}, remove() {} },
    setAttribute() {}, removeAttribute() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, addEventListener() {}
  };
  const document = {
    currentScript: null, activeElement: null,
    documentElement: { lang: 'en-CA' }, body: { style: {} },
    getElementById(id) { return id === 'cart-drawer' ? drawer : null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener(type, fn) { listeners[type] = fn; }
  };
  const location = { assigned: null, assign(url) { this.assigned = url; } };
  const button = {
    disabled: false, textContent: 'Add to cart', dataset: {},
    classList: { add() {}, remove() {} }, matches() { return true; }
  };
  const form = {
    getAttribute(name) { return name === 'action' ? '/cart/add' : null; },
    querySelector(selector) {
      if (selector === '[name="id"]') return { value: '12345' };
      return button;
    },
    matches() { return false; }
  };
  const window = {
    Shopify: { routes: { root: '/' } }, location,
    setTimeout() {}, dispatchEvent() {}
  };
  const context = {
    document, window, navigator: { language: 'en-CA' },
    console: { error() {}, warn() {} }, Intl, Number, String, Date,
    Promise, Set, Map, WeakSet, clearTimeout() {},
    FormData: class { constructor() { this.values = new Map([['id', '12345']]); }
      get(key) { return this.values.get(key); }
      set(key, value) { this.values.set(key, value); } },
    CustomEvent: class {},
    fetch: async (url, options) => {
      requests.push({ url, options });
      const response = responses.shift();
      if (!response) throw new Error('Unexpected network request');
      return { ok: response.ok !== false, status: response.status || 200,
        json: async () => response.body };
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'melato-cart-drawer.js' });
  function submit() {
    let prevented = false;
    listeners.submit({
      target: form, submitter: button, defaultPrevented: false,
      preventDefault() { prevented = true; }
    });
    return prevented;
  }
  return { submit, requests, location, button };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('successful add plus two failed refreshes navigates without duplicate POST', async () => {
  const app = boot([
    { body: { id: 12345 } },
    { ok: false, status: 503, body: {} },
    { ok: false, status: 503, body: {} }
  ]);
  assert.equal(app.submit(), true);
  await flush(); await flush(); await flush();
  assert.deepEqual(app.requests.map(request => request.url),
    ['/cart/add.js', '/cart.js', '/cart.js?melato_refresh=' + app.requests[2].url.split('melato_refresh=')[1]]);
  assert.equal(app.requests.filter(request => request.url.endsWith('/cart/add.js')).length, 1);
  assert.equal(app.location.assigned, '/cart');
  assert.equal(app.button.disabled, false);
});

test('failed add does not navigate to cart or perform refresh', async () => {
  const app = boot([{ ok: false, status: 422, body: { description: 'Sold out' } }]);
  assert.equal(app.submit(), true);
  await flush(); await flush();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].url, '/cart/add.js');
  assert.equal(app.location.assigned, null);
  assert.equal(app.button.disabled, false);
});
