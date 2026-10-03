'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = path => fs.readFileSync(path, 'utf8');

function parseJsonTemplate(path) {
  return JSON.parse(read(path).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
}

test('default product template keeps one canonical PDP and loads the unification layer', () => {
  const template = parseJsonTemplate('templates/product.json');
  assert.equal(template.sections.main_product.type, 'melato-product-page-rebuild');
  assert.equal(template.sections.proof_integrity.type, 'melato-product-proof-integrity');
  assert.equal(template.sections.pdp_unification.type, 'melato-pdp-unification');
  assert.deepEqual(template.order.slice(0, 3), ['main_product', 'proof_integrity', 'pdp_unification']);
});

test('pending product proof fails safe without JavaScript', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  assert.match(guard, /specification_pending/);
  assert.match(guard, /pdp-story-tech/);
  assert.match(guard, /pdp-proof-mini/);
  assert.match(guard, /pdp-spec-grid\s*>\s*\.pdp-spec:not\(:last-child\)/);
});

test('storefront-ready status overrides stale pending metadata', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  assert.match(guard, /product\.metafields\.custom\.material_spec_status\.value/);
  assert.match(guard, /material_spec_status contains 'ready'/);
  assert.match(guard, /proof_tag == 'specification_pending' and material_spec_ready == false/);
});

test('pending product proof removes provisional technical claims but preserves commerce', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  for (const label of ['story', 'construction', 'fit', 'material', 'care', 'application', 'scent profile']) {
    assert.match(guard, new RegExp(`['\"]${label}['\"]`));
  }
  assert.doesNotMatch(guard, /shipping\s*&\s*returns.*remove/i);
  assert.doesNotMatch(guard, /pdp-atc.*remove/i);
});

test('proof guard never renders a second visible Product Specification panel', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  assert.doesNotMatch(guard, /melato-structured-proof/);
  assert.doesNotMatch(guard, />Product specification</i);
  assert.doesNotMatch(guard, /Construction, material, fit and care/i);
});

test('PDP unification normalizes disclosures, fragrance semantics, sizing and set contrast', () => {
  const layer = read('sections/melato-pdp-unification.liquid');
  assert.match(layer, /pdp-content-stack/);
  assert.match(layer, /pdp-mini-detail__content/);
  assert.match(layer, /pdp-spec \.pdp-rte/);
  assert.match(layer, /Fragrance details/);
  assert.match(layer, /cleanText\(summary\) === 'material'/);
  assert.match(layer, /if \(!isFragrance\)/);
  assert.match(layer, /Product measurements/);
  assert.match(layer, /\/pages\/size-guide/);
  assert.match(layer, /melato-full-set-button/);
  assert.match(layer, /color: #080808 !important/);
});

test('existing PDP still keeps first product media high priority', () => {
  const pdp = read('sections/melato-product-page-rebuild.liquid');
  assert.match(pdp, /loading:\s*'eager'/);
  assert.match(pdp, /fetchpriority:\s*'high'/);
});
