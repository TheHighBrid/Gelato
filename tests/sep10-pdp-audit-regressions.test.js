const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const filter = read('snippets/melato-rendered-output-filters.liquid');
const base = read('snippets/melato-rendered-output-filters-base.liquid');
const home = read('sections/melato-home-conversion.liquid');

test('PDP cleanup matches normalized assurance markup instead of silently missing it', () => {
  assert.match(base, /replace: '<\/strong><span', '<\/strong> <span'/);
  assert.match(filter, /<strong>Sizing<\/strong> <span>/);
  assert.match(filter, /<strong>Returns<\/strong> <span>/);
  assert.match(filter, /legacy_generic_sizing_row/);
  assert.match(filter, /legacy_conversion_returns_row/);
});

test('customer-facing missing-measurement state is removed and generic drawer is relabeled', () => {
  assert.match(filter, /generic_sizing_row/);
  assert.match(filter, /product_measurements_heading/);
  assert.match(filter, /'Melato Fit Guide'/);
  assert.match(filter, />Fit guide<\/button>/);
});

test('Complete the Set is transactional with independent companion variant selectors', () => {
  assert.match(filter, /data-melato-server-full-set/);
  assert.match(filter, /data-melato-set-current/);
  assert.match(filter, /data-melato-set-matching/);
  assert.match(filter, /data-melato-set-add/);
  assert.match(filter, /ADD FULL SET/);
  assert.match(filter, /fetch\("\/cart\/add\.js"/);
  assert.match(filter, /items:\[\{id:Number\(a\.value\),quantity:1\},\{id:Number\(b\.value\),quantity:1\}\]/);
});

test('server bundle prevents the legacy JavaScript from injecting a duplicate full-set button', () => {
  assert.match(filter, /<span data-melato-full-set hidden aria-hidden="true"><\/span>/);
});

test('homepage campaign media remains intentionally decorative', () => {
  assert.match(home, /aria-hidden="true"/);
  assert.match(home, /alt: ''/);
});
