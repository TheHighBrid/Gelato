const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sections/melato-product-page-rebuild.liquid', 'utf8');

test('unavailable option combinations clear stale variant ID and disable purchase buttons', () => {
  const block = source.match(/function updateVariant\(variant\)\{([\s\S]*?)var idInput=form\.querySelector\('\[data-variant-id\]'\)/);
  assert.ok(block, 'variant update function and valid variant branch must exist');
  assert.match(block[1], /if\(!variant\)\{/);
  assert.match(block[1], /missingId\.value=''/);
  assert.match(block[1], /button\.disabled=true/);
  assert.match(block[1], /return;/);
});

test('form submission rejects missing or unavailable exact variant matches', () => {
  assert.match(source, /form\.addEventListener\('submit',function\(event\)\{/);
  assert.match(source, /if\(!variant\|\|!variant\.available\)\{/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /updateVariant\(variant\)/);
});
