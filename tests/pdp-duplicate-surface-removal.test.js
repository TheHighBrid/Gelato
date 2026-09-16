const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const unification = fs.readFileSync('sections/melato-pdp-unification.liquid', 'utf8');
const defaultTemplate = fs.readFileSync('templates/product.json', 'utf8');
const auditTemplate = fs.readFileSync('templates/product.melato-audit.json', 'utf8');

test('duplicate PDP shipping and story surfaces are suppressed before paint', () => {
  assert.match(unification, /\.pdp-shipping-returns[\s\S]*\.pdp-story[\s\S]*display:\s*none\s*!important/);
  assert.doesNotMatch(unification, /\.pdp-story[\s\S]*\.pdp-spec-grid[\s\S]*display:\s*none\s*!important/);
});

test('canonical Material Fit and Care specification grid remains in the live DOM', () => {
  assert.match(unification, /querySelectorAll\('\.pdp-shipping-returns, \.pdp-story'\)/);
  assert.doesNotMatch(unification, /querySelectorAll\('\.pdp-shipping-returns, \.pdp-story, \.pdp-spec-grid'\)/);
  assert.match(unification, /cleanText\(summary\) === 'construction'/);
  assert.match(unification, /details\.remove\(\)/);
});

test('Material Fit and Care disclosures use the minimized tab treatment', () => {
  assert.match(unification, /section\.pdp-spec-grid\s*>\s*details\.pdp-spec\s*>\s*summary[\s\S]*min-height:\s*42px\s*!important/);
  assert.match(unification, /section\.pdp-spec-grid\s*>\s*details\.pdp-spec[\s\S]*border-radius:\s*0\s*!important[\s\S]*background:\s*transparent\s*!important/);
  assert.match(unification, /@media\s*\(max-width:\s*749px\)[\s\S]*section\.pdp-spec-grid\s*>\s*details\.pdp-spec\s*>\s*summary[\s\S]*min-height:\s*44px\s*!important/);
});

test('cleanup keeps Complete the Set or the surviving specification grid', () => {
  assert.match(unification, /!contentStack\.querySelector\('\.pdp-set, \.pdp-spec-grid \.pdp-spec'\)/);
  assert.match(unification, /contentStack\.remove\(\)/);
});

test('cleanup layer is active on both canonical product templates', () => {
  assert.match(defaultTemplate, /"type":\s*"melato-pdp-unification"/);
  assert.match(auditTemplate, /"type":\s*"melato-pdp-unification"/);
});
