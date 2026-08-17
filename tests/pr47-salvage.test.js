'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = (path) => fs.readFileSync(path, 'utf8');

test('homepage keeps verified Judge.me social proof blocks', () => {
  const template = read('templates/index.json');
  assert.match(template, /"judge_me_reviews_all_reviews_text_home"/);
  assert.match(template, /"judge_me_reviews_verified_badge_home"/);
  assert.match(template, /"reviews"/);
});

test('empty cart keeps a merchandised recovery rail', () => {
  const snippet = read('snippets/cart-drawer.liquid');
  const runtime = read('assets/melato-cart-drawer.js');
  assert.match(snippet, /cart-recovery/);
  assert.match(snippet, /data-cart-empty-template/);
  assert.match(runtime, /data-cart-empty-template/);
  assert.match(runtime, /new-arrivals/);
});

test('product intent prefetch stays bounded and respects connection hints', () => {
  const layout = read('layout/theme.liquid');
  assert.match(layout, /navigator\.connection/);
  assert.match(layout, /saveData/);
  assert.match(layout, /rel\s*=\s*['"]prefetch['"]/);
  assert.match(layout, /budget\s*=\s*2/);
});

test('integration excludes PR47 stale global loaders and duplicate product review embeds', () => {
  const layout = read('layout/theme.liquid');
  const productTemplate = read('templates/product.json');
  assert.doesNotMatch(layout, /melato-hero-video\.js/);
  assert.equal((layout.match(/melato-audit-nav-collections\.js/g) || []).length, 1);
  assert.doesNotMatch(productTemplate, /judge_me_reviews|shopify:\/\/apps\/judge-me/);
});
