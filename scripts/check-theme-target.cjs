'use strict';

// Historical reconciliation manifests are provenance, not publication targets.
// The caller must supply authenticated, recent Shopify MAIN theme evidence.
const MAX_EVIDENCE_AGE_MS = 5 * 60 * 1000;
function validateThemeTarget({ intendedThemeId, verifiedLiveThemeId, verifiedAt, verifiedRole }, now = Date.now()) {
  const valid = value => typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
  if (!valid(intendedThemeId) || !valid(verifiedLiveThemeId)) {
    throw new Error('BLOCKED: intended and verified Shopify theme IDs must be positive decimal strings');
  }
  if (intendedThemeId !== verifiedLiveThemeId) {
    throw new Error('BLOCKED: intended target and verified Shopify MAIN theme IDs differ');
  }
  if (verifiedRole !== 'main') {
    throw new Error('BLOCKED: verified Shopify theme must have role main');
  }
  const timestamp = typeof verifiedAt === 'string' && /^\d{4}-\d\d-\d\dT/.test(verifiedAt) ? Date.parse(verifiedAt) : NaN;
  if (!Number.isFinite(timestamp) || !Number.isFinite(now) || timestamp > now || now - timestamp > MAX_EVIDENCE_AGE_MS) {
    throw new Error('BLOCKED: Shopify MAIN verification timestamp is missing, future-dated, or older than five minutes');
  }
  return true;
}

if (require.main === module) {
  try {
    validateThemeTarget({
      intendedThemeId: process.env.MELATO_TARGET_THEME_ID,
      verifiedLiveThemeId: process.env.MELATO_VERIFIED_LIVE_THEME_ID,
      verifiedAt: process.env.MELATO_VERIFIED_AT,
      verifiedRole: process.env.MELATO_VERIFIED_THEME_ROLE
    });
    console.log('Theme identity and evidence-age gate passed. Caller must authenticate Shopify evidence; publication is not authorized by this check.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { validateThemeTarget, MAX_EVIDENCE_AGE_MS };
