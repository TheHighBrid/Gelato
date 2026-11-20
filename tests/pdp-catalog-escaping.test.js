const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../sections/melato-product-page-rebuild.liquid'), 'utf8');
test('PDP catalog-controlled title and option labels are HTML escaped', () => {
  assert.match(source, /<h1 class="pdp-title">{{ product.title \\| escape }}<\\/h1>/);
  assert.match(source, /<legend>{{ option.name \\| escape }}<\\/legend>/);
  assert.match(source, /<span>{{ value \\| escape }}<\\/span>/);
});
test('PDP thumbnail source is attribute escaped', () => {
  assert.match(source, /data-media-src="{{ media \\| image_url: width: 1800 \\| escape }}"/);
});
