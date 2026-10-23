# Luxury transition baseline / October 23, 2026

- Repository: TheHighBrid/Gelato
- main: `012a73fcca2e63e04e5a7c8e1e4afe8c9e45d3f9`
- Development branch: `feat/melato-luxury-transition`
- Published theme: `gelato-v1-00`, ID `167790772479`
- Theme metadata updatedAt returned: `2026-10-15T18:19:13Z`

## Read-only text comparison

270 files fetched across layout, config, templates, sections, snippets, CSS/JS assets and locales. Both paginated reads completed. 220 identical, 38 different, 12 live-only. This is not a full media backup. Source snapshot/settings remain outside the public repository.

| Status | Path |
| --- | --- |
| live-only | `assets/app.css` |
| live-only | `assets/app.js` |
| live-only | `assets/melato-apple-design.css` |
| live-only | `assets/melato-apple-design.js` |
| different | `assets/melato-audit-nav-collections.js` |
| live-only | `assets/melato-collection-navigation.css` |
| live-only | `assets/melato-contact-gate.css` |
| live-only | `assets/melato-contact-gate.js` |
| live-only | `assets/melato-dynamic-announcement.css` |
| live-only | `assets/melato-dynamic-announcement.js` |
| live-only | `assets/melato-gelato-hotfix-20260811.css` |
| different | `assets/melato-pdp-cleanup-20260818.css` |
| different | `assets/melato-pdp-cleanup-20260818.js` |
| live-only | `assets/melato-site-cleanup-20260811.css` |
| different | `config/settings_data.json` |
| different | `layout/theme.liquid` |
| different | `locales/ar.json` |
| different | `locales/en.default.schema.json` |
| different | `sections/hero-video.liquid` |
| different | `sections/main-collection.liquid` |
| different | `sections/melato-announcement-bar.liquid` |
| different | `sections/melato-home-conversion.liquid` |
| different | `sections/melato-luxury-product-page.liquid` |
| different | `sections/melato-popup-calendar.liquid` |
| different | `sections/video.liquid` |
| different | `snippets/cart-drawer.liquid` |
| different | `snippets/melato-cart-empty-state.liquid` |
| live-only | `snippets/melato-collection-tabs.liquid` |
| different | `snippets/melato-product-color-engine.liquid` |
| different | `snippets/melato-rendered-output-filters-base.liquid` |
| different | `snippets/melato-theme-audit-hotfix.liquid` |
| different | `snippets/product-card.liquid` |
| different | `templates/article.json` |
| different | `templates/blog.json` |
| different | `templates/cart.json` |
| different | `templates/customers/account.json` |
| different | `templates/customers/addresses.json` |
| different | `templates/customers/login.json` |
| different | `templates/customers/order.json` |
| different | `templates/customers/register.json` |
| different | `templates/index.json` |
| different | `templates/index.melato-ovum-redesign.json` |
| different | `templates/metaobject/best_sellers.json` |
| different | `templates/page.contact-upgrade.json` |
| different | `templates/page.world-orb.json` |
| different | `templates/page.world.json` |
| different | `templates/product.jackets.json` |
| different | `templates/product.json` |
| different | `templates/product.melato-zara.json` |
| different | `templates/search.json` |

## Inherited validation

- `node scripts/validate-melato-product-page-bible.mjs`: PASS.
- `npm test`: 44 tests, 36 pass, 8 fail before changes.

Inherited failing tests:

- trust and returns copy advertises complimentary delivery and protected free returns
- All Products and cart metadata are purpose-built
- Living Book Vol. 01 section, assets and engine are present
- duplicate PDP shipping and story surfaces are suppressed before paint
- homepage keeps verified Judge.me social proof blocks
- canonical PDP emits currency explicitly instead of depending on output hotfixes
- hero owns an explicit user-controlled sound toggle while preserving muted autoplay
- default PDP exposes one recommendation section, not a second hotfix-generated block

## Batch boundary

W1 adds the semantic token source and contextual audit, and makes the Bible guard read-only. The token stylesheet is not yet linked into the storefront. No live file has been replaced, no published setting has changed, and no template integration is being presented as validated.

The live reconciliation batch is now documented in `MELATO_THEME_RECONCILIATION.md`, with all 283 inventory decisions in its companion JSON manifest. The candidate preserves live resources, homepage editor values and exact settings bytes while retaining repository fixes. Local component browser checks and Shopify validation of the changed Liquid/JSON files pass. The luxury stylesheet remains inactive.

Required next work: capture a complete rollback export and full storefront visual baseline, resolve the eight inherited failures, integrate tokens through existing stylesheet owners, and validate the unpublished integrated theme before activation or release. The full suite after reconciliation has 54 tests, 46 passing and the same eight inherited failures.
