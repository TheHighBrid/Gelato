# Melato luxury redesign preview

Branch: `feat/melato-luxury-visible`, based on merged foundation `4ddb6fd1084315b239c4f5e34a8c058a9e4ce0b9`.

The white luxury presentation is active in the unpublished Shopify theme **Gelato Lumière Preview**, ID **163975299327**. The published theme was not edited by this work. This is a visual review candidate, not a published release or a claim of complete accessibility/performance certification.

## Visible implementation

- C01: White page, header, collection and PDP surfaces; white studio frames, subtle neutral dividers, readable dark text. Existing dark editorial/video stages remain local exceptions.
- C02: Self-hosted Cormorant Garamond editorial headings and Plus Jakarta Sans commerce/body roles with swap loading. Font licenses are in `docs/fonts`. Commerce numbers use lining/tabular numerals. Existing conflicting body-font and pale-price rules were corrected at their source.
- C03: Responsive gutters, section/module spacing, quieter product cards, less boxed PDP treatment.
- C04: Hero assets, links and playback controls retained. Caption contrast is explicitly local to the media stage. No hero creative replacement.
- C05: Consistent portrait product cards and white media frames, without blend modes or garment/image edits. Existing zoom/gallery logic retained.
- C06: White navigation/search surfaces, dark readable links, preserved logo silhouette and existing destinations; footer tokens migrated to the same system.
- C07: Three desktop columns, two from 375–1023px, one below 375px. Existing merchant density settings remain the source for the main collection. Filter/sort/load-more logic is retained.
- C08: Canonical PDP structure and category data preserved. Existing accent contrast calculations now use the actual white canvas. Product palettes remain supported; price text no longer borrows a pale decorative accent.
- C09: Existing interaction owners retained, visible keyboard focus and reduced-motion behavior; navigation and cart controls have practical touch targets. No new hotspot feature was fabricated for layouts without pins.
- C10: White bag, readable line/quantity text, restrained checkout control and existing service channels. No new staffed-service or shipping promises.

The existing `melato-palette-v3.css` owner was rewritten instead of adding a fourth corrective stylesheet. Important legacy declarations were changed in the files that owned them. No new commerce logic or product-data migration was introduced.

## Current live reconciliation and preview protection

The current published theme is **162873704703**, not the earlier 167790772479 baseline. A fresh complete inventory contained 287 files. Current merchant settings were retained. The old mutation-based cleanup runtime and weaker legacy product templates were not restored over the repository fixes. JSON-only formatting differences were ignored.

Shopify's 20-theme limit prevented creating another theme. The existing unpublished Lumière theme was fully backed up, including all 243 original files, before reuse. The backup and private settings stay outside Git. Preview writes were checked against the unpublished role.

Read-back verification covers 290 candidate theme files. 289 have identical MD5 values. Shopify removes four unsupported, unused CTA settings from the alternate `index.melato-ovum-redesign.json` template; its actual conversion section has fixed shopping links, and the default homepage links remain verified. Seven pre-existing extra preview files were left in place rather than deleted. Non-theme layout instruction `.txt` files were excluded.

Shopify upload validation also exposed inherited schema problems: a 150-step range was changed to a numeric frame setting, blank defaults were removed from optional legacy fields, collection mobile select values were serialized as strings, and both existing theme blocks were included. No product facts were changed.

## Validation and limits

- Full Node suite: 61/61 passing.
- Product Page Bible validator: pass.
- Rendered storefront and October date/copy audits: pass.
- Browser fixture using the real header, collection and bag styles: pass at 320, 390, 768 and 1440px. Checks white surfaces, font role, tabular prices, 1/2/3-column behavior, navigation open/close and horizontal overflow.
- Live unpublished browser inspection confirms the actual white PDP and header, dark price text, editorial heading, white navigation panel, current products and draft preview identity.
- Shopify Liquid validation: no errors; existing/non-blocking warnings remain. No claim of zero warnings.
- The prior foundation's unresolved Codacy findings remain tracked in MDP-24. They were not suppressed or described as cleared.

Final owner visual review, broader product/category coverage, cart/checkout release validation, performance evidence and publication remain subsequent release steps. Do not publish this theme automatically.
