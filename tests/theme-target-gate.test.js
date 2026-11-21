const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateThemeTarget } = require('../scripts/check-theme-target.cjs');

test('accepts current intended theme when freshly verified Shopify MAIN agrees', () => {
  assert.equal(validateThemeTarget({ intendedThemeId: '162873704703', verifiedLiveThemeId: '162873704703' }), true);
});
test('historical reconciliation theme is not a deployment requirement', () => {
  assert.equal(validateThemeTarget({ manifestThemeId: '167790772479', intendedThemeId: '162873704703', verifiedLiveThemeId: '162873704703' }), true);
});
test('rejects a mismatched live Shopify MAIN ID', () => {
  assert.throws(() => validateThemeTarget({ intendedThemeId: '167790772479', verifiedLiveThemeId: '162873704703' }), /differ/);
});
test('fails closed on missing or malformed IDs', () => {
  for (const value of [undefined, '', '0', ' 123', '123abc', 162873704703]) {
    assert.throws(() => validateThemeTarget({ intendedThemeId: value, verifiedLiveThemeId: '162873704703' }), /BLOCKED/);
    assert.throws(() => validateThemeTarget({ intendedThemeId: '162873704703', verifiedLiveThemeId: value }), /BLOCKED/);
  }
});
