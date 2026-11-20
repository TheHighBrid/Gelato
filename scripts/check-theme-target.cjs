'use strict';
const fs = require('node:fs');
const path = require('node:path');

function validateThemeTarget({ manifestThemeId, intendedThemeId, verifiedLiveThemeId }) {
  const valid = value => typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
  if (![manifestThemeId, intendedThemeId, verifiedLiveThemeId].every(valid)) {
    throw new Error('BLOCKED: all three Shopify theme IDs must be explicitly supplied as positive decimal strings');
  }
  if (manifestThemeId !== intendedThemeId || intendedThemeId !== verifiedLiveThemeId) {
    throw new Error('BLOCKED: repository manifest, intended target and freshly verified live theme IDs differ');
  }
  return true;
}

if (require.main === module) {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'MELATO_THEME_RECONCILIATION.json'), 'utf8'));
    validateThemeTarget({
      manifestThemeId: String(manifest.themeId || ''),
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
