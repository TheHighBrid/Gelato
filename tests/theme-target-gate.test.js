const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateThemeTarget, MAX_EVIDENCE_AGE_MS } = require('../scripts/check-theme-target.cjs');

const now = Date.parse('2026-11-21T04:00:00.000Z');
const evidence = {
  intendedThemeId: '162873704703',
  verifiedLiveThemeId: '162873704703',
  verifiedRole: 'main',
  verifiedAt: new Date(now - 1000).toISOString()
};
test('accepts matching target with recent MAIN evidence', () => {
  assert.equal(validateThemeTarget(evidence, now), true);
});
test('historical reconciliation ID is not a deployment requirement', () => {
  assert.equal(validateThemeTarget({ ...evidence, manifestThemeId: '167790772479' }, now), true);
});
test('rejects mismatched live theme ID', () => {
  assert.throws(() => validateThemeTarget({ ...evidence, intendedThemeId: '167790772479' }, now), /differ/);
});
test('rejects non-MAIN role and missing role', () => {
  for (const verifiedRole of ['unpublished', 'demo', undefined, 'MAIN']) {
    assert.throws(() => validateThemeTarget({ ...evidence, verifiedRole }, now), /role main/);
  }
});
test('rejects missing, future and stale verification timestamps', () => {
  for (const verifiedAt of [undefined, '', 'not-a-date', new Date(now + 1).toISOString(), new Date(now - MAX_EVIDENCE_AGE_MS - 1).toISOString()]) {
    assert.throws(() => validateThemeTarget({ ...evidence, verifiedAt }, now), /timestamp/);
  }
  assert.equal(validateThemeTarget({ ...evidence, verifiedAt: new Date(now - MAX_EVIDENCE_AGE_MS).toISOString() }, now), true);
});
test('fails closed on missing or malformed IDs', () => {
  for (const value of [undefined, '', '0', ' 123', '123abc', 162873704703]) {
    assert.throws(() => validateThemeTarget({ ...evidence, intendedThemeId: value }, now), /BLOCKED/);
    assert.throws(() => validateThemeTarget({ ...evidence, verifiedLiveThemeId: value }, now), /BLOCKED/);
  }
});
