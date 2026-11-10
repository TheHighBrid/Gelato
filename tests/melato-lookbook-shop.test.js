import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as tick } from 'node:timers/promises';
import fs from 'node:fs';
const template = JSON.parse(fs.readFileSync(new URL('../templates/page.living-lookbook.json', import.meta.url), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
import manifest from '../docs/living-lookbook-frame-manifest.json' with { type: 'json' };
import { createRequire } from 'node:module';
import { renderLookbook } from './helpers/render-lookbook.cjs';
import { initializeLookbook } from '../assets/melato-lookbook-shop.js';

const { JSDOM } = await import(createRequire(import.meta.url).resolve('jsdom'));
const product = { title: 'Reliance Track Jacket', url: '/products/reliance-bamboo-track-jacket', price: 9999, available: true, options: ['Size'], variants: [{ id: 123, title: 'S', price: 9999, available: false }, { id: 456, title: 'XL', price: 10999, available: true }] };
const products = { 'reliance-bamboo-track-jacket': product };
async function setup(fetch, configureWindow) {
  const dom = new JSDOM(await renderLookbook({ products }), { url: 'https://melato.ca/fr/pages/living-lookbook' });
  const w = dom.window;
  w.matchMedia = () => ({ matches: true });
  w.Shopify = { routes: { root: '/fr/' } };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.fetch = fetch;
  if (configureWindow) configureWindow(w);
  initializeLookbook(w);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return dom;
}
function openShop(w) { w.document.querySelector('#frame-01 summary').click(); return w.document.querySelector('[data-tll-dialog]'); }

test('Master sequence has exactly 28 ordered frames, 8 narrative frames, and 19 exact product handles', () => {
  const section = template.sections.main;
  assert.equal(section.block_order.length, 28);
  assert.equal(manifest.filter(f => f.narrative).length, 8);
  assert.deepEqual(manifest.filter(f => f.narrative).map(f => f.frame), [3,5,6,17,18,22,23,28]);
  assert.equal(new Set(manifest.flatMap(f => f.products)).size, 19);
  manifest.forEach((frame,i) => {
    const settings = section.blocks[section.block_order[i]].settings;
    assert.equal(settings.image, 'shopify://shop_images/' + frame.file);
    assert.deepEqual([settings.product_1,settings.product_2].filter(Boolean), frame.products);
    assert.equal(settings.narrative, frame.narrative);
  });
  assert.equal(manifest[14].products[0], 'emerald-solstice-tile-geometric-tie');
  assert.equal(manifest[20].products[0], 'ivy-trellis-harness-suspenders');
});
test('Liquid renders exact product links and disabled sold-out sizes without JavaScript', async () => {
  const dom = new JSDOM(await renderLookbook({ products }));
  const doc = dom.window.document;
  assert.equal(doc.querySelectorAll('[data-tll-frame]').length, 28);
  assert.equal(doc.querySelector('#frame-03 summary'), null);
  const form = doc.querySelector('#frame-01 form');
  assert.equal(form.action.endsWith('/cart/add'), true);
  assert.equal(form.querySelector('option[value="123"]').disabled, true);
  assert.equal(form.querySelector('select').value, '');
  assert.equal(doc.querySelector('#frame-07 [data-tll-products]').textContent.includes('not currently available online'), true);
  assert.ok(doc.querySelector('#frame-01 a[href="/products/reliance-bamboo-track-jacket"]'));
  dom.window.close();
});
test('Shop drawer clones only the current frame and restores focus; index navigates to exact frame', async () => {
  const dom = await setup(); const w = dom.window; const shop = openShop(w);
  assert.equal(shop.open,true);
  assert.equal(shop.querySelectorAll('form').length,1);
  shop.querySelector('[data-tll-close]').click();
  assert.equal(w.document.activeElement, w.document.querySelector('#frame-01 summary'));
  w.document.querySelector('[data-tll-index]').click();
  const index = w.document.querySelector('[data-tll-index-dialog]');
  index.querySelector('a[href="#frame-21"]').click();
  assert.equal(w.location.hash,'#frame-21');
  assert.equal(w.document.querySelector('[data-tll-current]').textContent,'21');
  dom.window.close();
});
test('Cart submits the selected variant once with localized routes and displays variant-specific price', async () => {
  const calls=[]; let resolve;
  const dom = await setup((url,init) => { calls.push({url,init}); if(url.endsWith('add.js')) return new Promise(r => { resolve=r; }); return Promise.resolve({ok:true,json:async()=>({item_count:1})}); });
  const w=dom.window; const shop=openShop(w); const form=shop.querySelector('form');
  const select=form.querySelector('select'); select.value='456'; select.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(shop.querySelector('[data-tll-price]').textContent,'$109.99 CAD');
  function submit() {
    form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  }
  submit(); submit(); assert.equal(calls.length,1);
  assert.equal(calls[0].url,'/fr/cart/add.js');
  assert.deepEqual(JSON.parse(calls[0].init.body),{items:[{id:456,quantity:1}]});
  resolve({ok:true,json:async()=>({items:[{id:456}]})}); await tick();
  assert.match(form.querySelector('[data-tll-status]').textContent,/Added/);
  assert.equal(w.document.querySelector('[data-tll-bag-count]').textContent,'1');
  assert.equal(form.querySelector('button').disabled,false);
  dom.window.close();
});
test('Rejected carts retain selection, re-enable submission, and never announce success', async () => {
  const dom = await setup(async()=>({ok:false,status:422})); const w=dom.window; const form=openShop(w).querySelector('form');
  form.querySelector('select').value='456';
  form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); await tick();
  assert.match(form.querySelector('[data-tll-status]').textContent,/Could not add/);
  assert.equal(form.querySelector('select').value,'456');
  assert.equal(form.querySelector('button').disabled,false);
  assert.equal(w.document.querySelector('[data-tll-live]').textContent,'');
  dom.window.close();
});
test('Missing editorial images preserve frame order and French interface strings render', async () => {
  const dom=new JSDOM(await renderLookbook({missingImage:true,language:'fr'}));
  assert.equal(dom.window.document.querySelectorAll('[data-tll-frame]').length,28);
  assert.equal(dom.window.document.querySelectorAll('.tll-image-error').length,28);
  assert.match(dom.window.document.querySelector('summary').textContent,/Magasiner/);
  dom.window.close();
});


test('Module initialization is idempotent and editor unload disconnects observers and listeners', async () => {
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.frames = []; observers.push(this); }
    observe(frame) { this.frames.push(frame); }
    disconnect() { this.disconnected = true; }
  }
  const dom = await setup(undefined, w => { w.IntersectionObserver = Observer; });
  const w = dom.window;
  initializeLookbook(w);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  assert.equal(observers.length, 1);
  assert.equal(observers[0].frames.length, 28);
  observers[0].callback([{ isIntersecting: true, target: w.document.querySelector('#frame-21') }]);
  assert.equal(w.document.querySelector('[data-tll-current]').textContent, '21');
  const host = w.document.querySelector('[data-tll]').parentElement;
  host.dispatchEvent(new w.Event('shopify:section:unload', { bubbles: true }));
  assert.equal(observers[0].disconnected, true);
  w.document.querySelector('[data-tll-prev]').click();
  assert.equal(w.document.querySelector('[data-tll-current]').textContent, '21');
  host.dispatchEvent(new w.Event('shopify:section:load', { bubbles: true }));
  assert.equal(observers.length, 2);
  assert.equal(w.document.querySelector('[data-tll-current]').textContent, '01');
  dom.window.close();
});

test('Successful add remains successful when refreshing the cart count fails', async () => {
  const dom = await setup(async url => {
    if (url.endsWith('cart.js')) throw new Error('Cart refresh unavailable');
    return { ok: true, json: async () => ({ items: [{ id: 456 }] }) };
  });
  const w = dom.window;
  const form = openShop(w).querySelector('form');
  form.querySelector('select').value = '456';
  form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  assert.match(form.querySelector('[data-tll-status]').textContent, /Added/);
  assert.equal(form.querySelector('button').disabled, false);
  assert.equal(w.document.querySelector('[data-tll-live]').textContent, 'Added to your bag.');
  dom.window.close();
});
