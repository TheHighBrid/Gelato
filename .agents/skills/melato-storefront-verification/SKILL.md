---
name: melato-storefront-verification
description: >-
  Run full verification, test suite, Product Page Bible audit, and reconciliation
  hash updates for Melato storefront changes before committing or pushing.
---

# Melato Storefront Verification

Use this skill whenever editing Shopify theme Liquid templates, layouts, CSS/JS assets,
or product metadata.

## Standard Verification Sequence

1. **Verify JavaScript Syntax**:
   ```bash
   find assets -maxdepth 1 -type f -name '*.js' -print0 | sort -z | xargs -0 -n1 node --check
   ```

2. **Validate Product Page Bible**:
   ```bash
   node scripts/validate-melato-product-page-bible.mjs
   ```

3. **Execute Full Test Suite**:
   ```bash
   npm test
   ```
   *Note: If `jsdom` or `liquidjs` are missing in a fresh environment, ensure `npm install` has been run.*

4. **Run Storefront Integrity Guard**:
   Ensure `melato-audit-nav-collections.js` is loaded exactly once in `layout/theme.liquid` and all JSON files parse correctly:
   ```bash
   python3 -c "
   from pathlib import Path
   import json, re

   layout = Path('layout/theme.liquid').read_text()
   assert layout.count('melato-audit-nav-collections.js') == 1, 'nav audit script must load exactly once'
   print('Storefront integrity check passed.')
   "
   ```

5. **Updating Reconciliation Checksum**:
   If `layout/theme.liquid` or any reconciled file in `docs/MELATO_THEME_RECONCILIATION.json` was deliberately modified:
   ```bash
   shasum -a 256 <file>
   ```
   Update the matching `candidateSha256` in `docs/MELATO_THEME_RECONCILIATION.json`, then rerun `node --test tests/theme-reconciliation.test.js`.

6. **Remote CI Check**:
   After pushing to GitHub:
   ```bash
   gh run list -L 6
   ```
   Confirm all 6 workflows complete with `✓`.
