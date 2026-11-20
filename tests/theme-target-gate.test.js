const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateThemeTarget } = require('../scripts/check-theme-target.cjs');

test('theme gate accepts three matching explicit IDs', () => {
  assert.equal(validateThemeTarget({manifestThemeId:'167790772479',intendedThemeId:'167790772479',verifiedLiveThemeId:'167790772479'}), true);
});
test('theme gate rejects the previously reported Shopify staging ID mismatch', () => {
  assert.throws(() => validateThemeTarget({manifestThemeId:'167790772479',intendedThemeId:'162873704703',verifiedLiveThemeId:'162873704703'}), /differ/);
});
test('theme gate fails closed on missing, malformed and inconsistent IDs', () => {
  for (const value of [undefined, '', '0', ' 123', '123abc']) {
    assert.throws(() => validateThemeTarget({manifestThemeId:'167790772479',intendedThemeId:value,verifiedLiveThemeId:'167790772479'}), /BLOCKED/);
  }
  assert.throws(() => validateThemeTarget({manifestThemeId:'167790772479',intendedThemeId:'167790772479',verifiedLiveThemeId:'162873704703'}), /differ/);
});
