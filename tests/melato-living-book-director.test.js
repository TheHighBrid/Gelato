'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const source = fs.readFileSync('assets/melato-living-book-director.js', 'utf8');

test('disconnects the source observer when the Shopify section unloads', () => {
  assert.match(source, /sourceObserver\.disconnect\(\)/);
  assert.match(source, /shopify:section:unload/);
});

test('clears scheduled archive renders when the Shopify section unloads', () => {
  assert.match(source, /clearScheduledRender\(\)/);
  assert.match(source, /shopify:section:unload/);
});
