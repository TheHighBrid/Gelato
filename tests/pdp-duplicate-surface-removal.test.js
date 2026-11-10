const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const unification = fs.readFileSync('sections/melato-pdp-unification.liquid', 'utf8');
const defaultTemplate = fs.readFileSync('templates/product.json', 'utf8');
const auditTemplate = fs.readFileSync('templates/product.melato-audit.json', 'utf8');

test('canonical Story and specifications remain available without JavaScript cleanup', () => {
  assert.doesNotMatch(unification, /\.pdp-story\s*\{\s*display:\s*none/);
  assert.doesNotMatch(unification, /querySelectorAll\('\.pdp-story'\)/);
  assert.doesNotMatch(unification, /cleanText\(summary\) === 'construction'\) details\.remove/);
});

test('Material Fit and Care disclosures use the minimized tab treatment', () => {
  assert.match(unification, /section\.pdp-spec-grid\s*>\s*details\.pdp-spec\s*>\s*summary[\s\S]*min-height:\s*42px\s*!important/);
  assert.match(unification, /section\.pdp-spec-grid\s*>\s*details\.pdp-spec[\s\S]*border-radius:\s*0\s*!important[\s\S]*background:\s*transparent\s*!important/);
  assert.match(unification, /@media\s*\(max-width:\s*749px\)[\s\S]*section\.pdp-spec-grid\s*>\s*details\.pdp-spec\s*>\s*summary[\s\S]*min-height:\s*44px\s*!important/);
});

test('cleanup keeps Complete the Set or the surviving specification grid', () => {
  assert.match(unification, /!contentStack\.querySelector\('\.pdp-story, \.pdp-set, \.pdp-spec-grid \.pdp-spec'\)/);
  assert.match(unification, /contentStack\.remove\(\)/);
});

test('cleanup layer is active on both canonical product templates', () => {
  assert.match(defaultTemplate, /"type":\s*"melato-pdp-unification"/);
  assert.match(auditTemplate, /"type":\s*"melato-pdp-unification"/);
});
