# The Living Book: archival commerce groundwork

## Scope of this branch
Introduces four CommonJS domain helpers under src/lib (exhibits, variants, hotspots, cart state), isolated styling, and node:test regression coverage. The existing 31-frame Next.js reader (src/lib/frames.ts, FrameEngine and Shopify theme sections) is unchanged.

## Important integration gates
- **No production shopping yet.** The supplied 8 product IDs, handles, SKUs and base prices are editorial placeholders, not verified Shopify catalogue records. The supplied 31 desktop and mobile image URLs are also unverified. Do not render them as real product links, price claims, live inventory, or purchased goods.
- **No automatic frame mapping.** Map each real image to exactly the correct Shopify product by confirmed handle and actual frame imagery. The current sequential pattern is placeholder-only. Avoid the known error of visually unrelated hotspot labels.
- **Shopify remains authoritative.** Variant IDs, available status, inventory, and product prices must be fetched from Shopify; the local CartStateMachine is optimistic UI-only. Add-to-cart must POST to the store's /cart/add.js and reconcile from /cart.js; handle API errors and market/currency differences.
- **Next.js integration is pending.** The new files use CommonJS and are deliberately not imported into TypeScript components (tsconfig allowJs=false) or the theme. Do not assume these utilities change the published lookbook.
- **Visual interaction is pending.** Real hotspots must be anchored to the image's rendered bounds (including object-fit), keyboard accessible, and 44px minimum hit size. UV is a data marker, not a working effect.
- **Tests:** run npm test (Node's built-in test runner). The presence of these helpers does not certify end-to-end checkout or image fidelity.

## Limited safety corrections to the supplied script
Removed the duplicate Act III key, preserved full-page scrolling by scoping CSS rather than locking body overflow, treated unknown Shopify inventory as unknown rather than sold out, validated variant payload inputs, and made cart snapshots defensive copies.
