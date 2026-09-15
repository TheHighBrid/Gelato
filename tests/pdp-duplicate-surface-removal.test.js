const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const unification = fs.readFileSync('sections/melato-pdp-unification.liquid', 'utf8');
const defaultTemplate = fs.readFileSync('templates/product.json', 'utf8');
const auditTemplate = fs.readFileSync('templates/product.melato-audit.json', 'utf8');

test('duplicate PDP story, spec accordions and trust copy are suppressed before paint', () => {
  assert.match(unification, /\.pdp-shipping-returns[\s\S]*\.pdp-story[\s\S]*\.pdp-spec-grid[\s\S]*display:\s*none\s*!important/);
});

test('duplicate PDP story, spec accordions and trust copy are removed from the live DOM', () => {
  assert.match(unification, /querySelectorAll\('\.pdp-shipping-returns, \.pdp-story, \.pdp-spec-grid'\)/);
  assert.match(unification, /node\.remove\(\)/);
});

test('cleanup keeps Complete the Set and only removes an empty content stack', () => {
  assert.match(unification, /!contentStack\.querySelector\('\.pdp-set'\)/);
  assert.match(unification, /contentStack\.remove\(\)/);
});

test('cleanup layer is active on both canonical product templates', () => {
  assert.match(defaultTemplate, /"type":\s*"melato-pdp-unification"/);
  assert.match(auditTemplate, /"type":\s*"melato-pdp-unification"/);
});
