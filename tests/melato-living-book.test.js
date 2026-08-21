'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const section = fs.readFileSync('sections/melato-living-book.liquid', 'utf8');
const scriptPath = 'assets/melato-living-book.js';
const script = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : '';

test('loads a dedicated Living Book interaction controller', () => {
  assert.match(section, /melato-living-book\.js/);
  assert.match(section, /data-melato-living-book/);
});

test('provides an accessible dialog viewer for editorial frames', () => {
  assert.match(section, /<dialog[^>]*class="mlb-viewer"/);
  assert.match(section, /data-mlb-open/);
  assert.match(section, /data-mlb-viewer-close/);
  assert.match(script, /showModal\(\)/);
  assert.match(script, /keydown/);
});

test('uses native scroll reveal while respecting reduced-motion preferences', () => {
  assert.match(section, /data-mlb-reveal/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion: reduce/);
});

test('keeps a direct product route available from the frame viewer', () => {
  assert.match(section, /data-mlb-viewer-products/);
  assert.match(script, /data-mlb-product-template/);
});

test('defers the viewer image request and reserves its image dimensions', () => {
  assert.match(section, /<img alt="" width="1400" height="1800" data-mlb-viewer-image>/);
  assert.doesNotMatch(section, /<img src="" alt="" data-mlb-viewer-image>/);
});
