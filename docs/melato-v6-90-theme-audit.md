# Melato v6.90 theme audit

Audit date: 2026-08-03

Source reviewed: `theme_export__melato-ca-living-book-case-file-draft-product-links__02AUG2026-1004pm.zip`.
The archive was expanded over the repository theme so the review reflects the latest complete export rather than the older July package.

## Findings addressed

1. **Overlay close recursion (critical):** drawer close callbacks could call `Overlay.close()` while the same callback list was still being iterated. The overlay now clears its callback queue before invoking callbacks.
2. **Focus-trap listener accumulation (high):** every drawer opening added a new anonymous keydown handler which could never be removed. Focus handlers are now tracked per element, replaced on open, and removed on close.
3. **Search and cart focus lifecycle (high):** explicit drawer closes now close the shared overlay, and the cart releases its focus trap.
4. **Shipping message regression (medium):** the exported cart script hard-coded a zero threshold and then hid the complimentary-delivery bar. It now consumes the configured storefront threshold and presents the complimentary-delivery message when no threshold is set.
5. **Cart markup output safety (medium):** product and image URLs inserted into generated drawer HTML are now escaped along with product text.
6. **PDP compact-detail accessibility (medium):** the minimizer removed the heading targeted by the panel's `aria-labelledby`. The panel now receives a durable accessible label, and decorative motion follows reduced-motion preferences.
7. **Production console noise (low):** the unconditional enhancement-loader log was removed.

## Verification scope

- Parsed every standard JSON file and every Shopify JSON-with-comments file.
- Checked all JavaScript assets with Node's syntax checker.
- Checked static Liquid `asset_url` references against files in `assets/`.
- Confirmed all template section types resolve to existing section files and every section order entry resolves to a declared section.
- Attempted Shopify Theme Check installation, but the package registries returned HTTP 403 in this environment.

## Recommended store-side QA

Before publishing, preview the theme against live catalog data and verify add-to-cart, quantity updates, checkout, predictive search, mobile navigation, the compact PDP details, app blocks, and theme-editor section reloads. Automated repository checks cannot exercise Shopify-hosted routes or installed app embeds.
