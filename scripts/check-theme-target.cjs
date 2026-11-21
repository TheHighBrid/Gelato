'use strict';

// The October 2026 reconciliation manifest is historical evidence, not a release target.
// A release must supply an intended theme ID and a freshly confirmed Shopify MAIN ID.
function validateThemeTarget({ intendedThemeId, verifiedLiveThemeId }) {
  const valid = value => typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
  if (!valid(intendedThemeId) || !valid(verifiedLiveThemeId)) {
    throw new Error('BLOCKED: intended and freshly verified live Shopify theme IDs must be positive decimal strings');
  }
  if (intendedThemeId !== verifiedLiveThemeId) {
    throw new Error('BLOCKED: intended target and freshly verified Shopify MAIN theme IDs differ');
  }
  return true;
}

if (require.main === module) {
  try {
    validateThemeTarget({
      intendedThemeId: process.env.MELATO_TARGET_THEME_ID,
      verifiedLiveThemeId: process.env.MELATO_VERIFIED_LIVE_THEME_ID
    });
    console.log('Theme identity gate passed. This does NOT authorize publication or verify storefront behavior.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { validateThemeTarget };
