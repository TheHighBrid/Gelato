# Melato Rack (branch: feature/melato-rack)

Horizontal clothing-rack showroom section for Gelato v5.90.

## Files
- sections/melato-rack.liquid
- snippets/melato-rack-item.liquid, snippets/melato-rack-hanger.liquid
- assets/melato-rack.css, assets/melato-rack.js
- templates/collection.rack.json (alternate collection template)

## Product Page Bible compliance
AGENTS.md makes the Product Page Bible canonical for product data.
This branch therefore:
- writes NO product data and adds NO new metafields;
- reads only title, price, url, media and variants;
- uses front = featured image, back = second media.
Hanger-ready cutouts, rack_* metafields, and any media-order rules are
product-system changes: they need an owner-reviewed PR and a Bible
semver bump before use. Run scripts/validate-melato-product-page-bible.mjs
before merging.

## Use
1. Theme editor: Home > Add section > Melato Rack, pick a collection.
2. Collections: assign the "rack" alternate template.
3. Only Active products appear (drafts are not exposed to the storefront).

## Not yet done / verify
- Not tested in a live theme preview (no theme preview or Shopify CLI access here).
- Cart: posts to /cart/add.js and fires `melato:cart-updated`; hook that event to Gelato's cart drawer.
- Strings are hardcoded English; move to locales/ when wiring up.
- homepage patch (melato_homepage_redesign_patch.zip) not reviewed; check for template conflicts.
