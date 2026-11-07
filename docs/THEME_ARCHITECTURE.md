# Melato Theme Architecture & Future-Proofing Notes

## Current State (as of 2026-11-01)

- Base: DRIP theme
- Customization: Heavy. 46+ melato-*.js and 46+ melato-*.css files layered on top.
- theme.liquid loads ~25 asset scripts (many conditional).
- 88 sections, multiple product templates (product.json, product.melato-*, product.fragrance.json, etc.).
- Living Book features implemented via sections, snippets, and dedicated JS/CSS.
- Synced from Shopify; local extra files (src/, tests/, docs/) are development-only.

## Issues Identified

1. **Asset proliferation**: Incremental audit files (melato-audit-*, melato-optimization-2026*, melato-pdp-*) create maintenance debt. Changes risk missing a layer.
2. **Root clutter**: Large zips, PNGs, MHTs previously in root (now in archive/).
3. **No .gitignore**: Large binaries were tracked.
4. **Multiple product templates**: product.melato-audit.json, product.melato-zara.json, etc. — consolidate where possible.
5. **Live site observations**: Video fallback text visible, repeated address blocks, potential currency display inconsistency (CAD store showing USD in some crawls).
6. **Ownership**: Only shopify[bot] commits; limited local history.

## Recommendations for Future-Proofing

1. **Consolidate assets**:
   - Merge overlapping CSS into `melato-core.css` and `melato-pdp.css`.
   - Merge JS utilities into `melato-core.js` with clear modules.
   - Keep feature-specific files only when truly independent.

2. **Schema-driven**:
   - Prefer section settings over hard-coded strings in Liquid.
   - Use theme settings for colors, fonts, announcement content.

3. **Performance**:
   - Lazy-load non-critical JS.
   - Use Shopify image CDN with widths for all product images.
   - Audit WebP usage (already good in assets/).

4. **Structure**:
   - Keep only standard Shopify theme folders in the root that gets pushed.
   - Move Living Book Next.js to a separate repo or clearly separate package.
   - Maintain tests/ for regressions.

5. **Deployment**:
   - Always preview theme before publish.
   - Use Shopify CLI `theme push --unpublished`.

6. **Shopify Admin**:
   - Review products with 0 inventory (e.g. Ryū set).
   - Ensure currency is consistently CAD.
   - Check navigation and collections for duplicates.

## Next Actions

- [ ] Consolidate top 5 overlapping CSS/JS pairs after testing.
- [ ] Add missing alt text / ARIA where needed.
- [ ] Clean unused product template variants.
- [ ] Set up proper Shopify theme development workflow with CLI.

## Consolidation Done (2026-11-01)

Created:
- `assets/melato-core.css` — concatenated always-loaded global CSS layers (luxury-tokens, collection-navigation, dynamic-announcement, enhancements, palette-logo-updated, header-logo-bigger, palette-v3, audit-upgrades, storefront-tail, apple-design)
- `assets/melato-core.js` — concatenated always-loaded global JS (dynamic-announcement, optimization-2026, audit-nav-collections, cart-drawer, apple-design)

Updated `layout/theme.liquid` to load the core files instead of the individual global layers. Conditional and feature-specific assets (PDP layout, info/legal pages, collection filters, premium-enhancements, Living Book, house, rack, etc.) remain separate.

Source individual files are still present for reference/regeneration. Future changes to global styles/behavior should go into the core files (or regenerate them from updated sources).
