const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('canonical construction details render as escaped text, not executable markup', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  assert.match(source, /assign construction_details = product\.metafields\.custom\.construction\.value/);
  assert.match(source, /<li>\{\{ detail \| escape \}\}<\/li>/);
  assert.doesNotMatch(source, /<li>\{\{ detail \}\}<\/li>/);
  assert.match(source, /<p>\{\{ construction_paragraph \| escape \}\}<\/p>/);
  assert.doesNotMatch(source, /<p>\{\{ construction_paragraph \}\}<\/p>/);
  assert.match(source, /assign construction_details = product\.metafields\.custom\.design_features\.value/);
});
