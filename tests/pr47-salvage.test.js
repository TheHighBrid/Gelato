'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = (path) => fs.readFileSync(path, 'utf8');

test('review integration keeps the active merchant-configured Judge.me app embed', () => {
  const settings = JSON.parse(read('config/settings_data.json').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  const embeds = Object.values(settings.current.blocks).filter(block => block.type.includes('shopify://apps/judge-me-reviews/blocks/judgeme_core/'));
  assert.equal(embeds.length, 1);
  assert.equal(embeds[0].disabled, false);
  const template = JSON.parse(read('templates/index.json').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  for (const id of template.order) assert.ok(template.sections[id], 'Homepage may only order real merchant sections');
});

test('empty cart keeps a merchandised recovery rail', () => {
  const snippet = read('snippets/melato-cart-empty-state.liquid');
  const drawer = read('snippets/cart-drawer.liquid');
  const runtime = read('assets/melato-cart-drawer.js');
  assert.match(snippet, /cart-recovery/);
  assert.match(snippet, /new-arrivals/);
  assert.match(drawer, /data-cart-empty-template/);
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
