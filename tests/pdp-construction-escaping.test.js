const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('canonical construction details render as escaped text, not executable markup', () => {
  const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');
  assert.match(source, /assign construction_details = product\.metafields\.custom\.construction\.value/);
  assert.ok(
    /<li>\{\{ detail \| escape \}\}<\/li>/.test(source) ||
      /echo '<li>'\s+echo detail \| escape\s+echo '<\/li>'/.test(source),
    'construction details must HTML-escape each detail item'
  );
  assert.doesNotMatch(source, /<li>\{\{ detail \}\}<\/li>/);
  assert.doesNotMatch(source, /echo '<li>'\s+echo detail\s+echo '<\/li>'/);
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
  const localizedUrlHelper = fs.readFileSync('snippets/melato-localized-url.liquid', 'utf8');
  assert.ok(
    source.includes('href="{{ size_guide_url | escape }}"') ||
      (source.includes("href=\"{% render 'melato-localized-url', url: size_guide_url %}\"") &&
        localizedUrlHelper.includes('| escape')),
    'size_guide_url link must be escaped'
  );
  assert.ok(!source.includes('href="{{ size_guide_url }}"'), 'size_guide_url must not be unescaped');
  assert.ok(source.includes('href="{{ matching_product.url | escape }}"'), 'matching_product.url link must be escaped');
  assert.ok(!source.includes('href="{{ matching_product.url }}"'), 'matching_product.url must not be unescaped');
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
