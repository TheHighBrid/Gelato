const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const unification = fs.readFileSync('sections/melato-pdp-unification.liquid', 'utf8');
const defaultTemplate = fs.readFileSync('templates/product.json', 'utf8');
const auditTemplate = fs.readFileSync('templates/product.melato-audit.json', 'utf8');

test('canonical shipping microcopy remains visible while duplicate story is suppressed', () => {
  assert.match(unification, /\.pdp-story\s*\{\s*display:\s*none\s*!important/);
  const hiddenRules = [...unification.matchAll(/([^{}]+)\{([^{}]*display:\s*none\s*!important[^{}]*)\}/g)];
  assert.ok(hiddenRules.some(rule => rule[1].includes('.pdp-story')));
  assert.ok(hiddenRules.every(rule => !rule[1].includes('.pdp-shipping-returns')));
  assert.ok(hiddenRules.every(rule => !/(?:^|,)\s*[^,{}]*\.pdp-spec-grid\s*(?:,|$)/.test(rule[1])), 'No hiding rule may target the canonical specification grid');
});

test('canonical Material Fit and Care specification grid remains in the live DOM', () => {
  assert.match(unification, /querySelectorAll\('\.pdp-story'\)/);
  assert.doesNotMatch(unification, /querySelectorAll\('\.pdp-shipping-returns/);
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
