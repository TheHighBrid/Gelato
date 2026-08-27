'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = path => fs.readFileSync(path, 'utf8');

function parseJsonTemplate(path) {
  return JSON.parse(read(path).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
}

test('default product template runs proof integrity immediately after the PDP', () => {
  const template = parseJsonTemplate('templates/product.json');
  assert.equal(template.sections.proof_integrity.type, 'melato-product-proof-integrity');
  assert.deepEqual(template.order.slice(0, 2), ['main_product', 'proof_integrity']);
});

test('pending product proof fails safe without JavaScript', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  assert.match(guard, /specification_pending/);
  assert.match(guard, /pdp-story-tech/);
  assert.match(guard, /pdp-proof-mini/);
  assert.match(guard, /pdp-spec-grid\s*>\s*\.pdp-spec:not\(:last-child\)/);
});

test('pending product proof removes provisional technical claims but preserves commerce', () => {
  const guard = read('sections/melato-product-proof-integrity.liquid');
  for (const label of ['construction', 'fit', 'material', 'care']) {
    assert.match(guard, new RegExp(`['\"]${label}['\"]`));
  }
  assert.match(guard, /verified material information/);
  assert.doesNotMatch(guard, /shipping\s*&\s*returns.*remove/i);
  assert.doesNotMatch(guard, /pdp-atc.*remove/i);
});

test('existing PDP still keeps first product media high priority', () => {
  const pdp = read('sections/melato-product-page-rebuild.liquid');
  assert.match(pdp, /loading:\s*'eager'/);
  assert.match(pdp, /fetchpriority:\s*'high'/);
});
