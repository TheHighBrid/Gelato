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

test('product-supplied palette and surface values cannot break HTML data attributes', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  for (const [attribute, expression] of [
    ['data-palette-1', 'palette_1'],
    ['data-palette-2', 'palette_2'],
    ['data-palette-3', 'palette_3'],
    ['data-foreground', 'fg_seed'],
    ['data-surface', 'section.settings.surface'],
    ['data-pdp-family', 'family'],
  ]) {
    assert.ok(source.includes(attribute + '="{{ ' + expression + ' | escape }}"'), attribute + ' must HTML-escape its value');
    assert.ok(!source.includes(attribute + '="{{ ' + expression + ' }}"'), attribute + ' must not interpolate unescaped values');
  }
});


test('dynamic product navigation URLs are escaped inside href attributes', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  for (const expression of ['size_guide_url', 'matching_product.url']) {
    assert.ok(source.includes('href="{{ ' + expression + ' | escape }}"'), expression + ' link must be escaped');
    assert.ok(!source.includes('href="{{ ' + expression + ' }}"'), expression + ' must not be unescaped');
  }
});

test('fit and matching-product labels are escaped as plain text', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  assert.match(source, /for item in fit_details -%}<li>\{\{ item \| escape \}\}<\/li>/);
  assert.match(source, /\{\{ fit_copy \| escape \}\}/);
  assert.match(source, /\{\{ matching_product\.title \| escape \}\}<\/a>/);
  assert.doesNotMatch(source, /\{\{ matching_product\.title \}\}<\/a>/);
});


test('product titles and subtitle are HTML-escaped across all PDP text surfaces', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  for (const tag of ['h1', 'h3', 'strong']) {
    assert.match(source, new RegExp('<' + tag + '[^>]*>\\{\\{ product\\.title \\| escape \\}\\}<\\/' + tag + '>'));
  }
  assert.match(source, /<p class="pdp-thesis">\{\{ subtitle \| escape \}\}<\/p>/);
  assert.doesNotMatch(source, /\{\{ product\.title \}\}/);
  assert.doesNotMatch(source, /\{\{ subtitle \}\}/);
});
