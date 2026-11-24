# Melato luxury transition: locked design decisions

Version 1.1, October 23, 2026. Supersedes the design choices in Phase 2 v1.0 where listed below.

TheHighBrid authorized revision, decision lock and the start of development in this conversation: "revise and then lock thrm then start execution". This authorizes the dedicated development branch and reviewable implementation. It does not authorize merge or Shopify publication.

## Decisions

| ID | Locked disposition |
| --- | --- |
| R-01 | Repository Product Page Bible, JSON contract and executable validator govern product semantics. Preserve canonical order, category disclosures, labels and 35-80-word Story target. Do not turn the conceptual seven-layer description into a new data contract. |
| R-02 | Cormorant Garamond 400 for editorial headings at 28px or larger; Plus Jakarta Sans 400/500 for commerce and body text. Use licensed WOFF2 or verified Shopify font availability. Commerce numbers use utility sans and lining/tabular numerals. No added monospace download. |
| R-03 | Baseline main is 012a73fcca2e63e04e5a7c8e1e4afe8c9e45d3f9; published theme is gelato-v1-00, ID 167790772479. Preserve live differences through reviewed reconciliation before activating or deploying redesigned templates. |
| R-04 | Three standard desktop columns from 1024px; two columns at 375-1023px; one below 375px where needed for readable cards. Existing density controls remain functional. No automatic four-column wide-desktop switch. |
| R-05 | Solid #FFFFFF header above the deferred hero, in normal/sticky document flow, with no negative-margin overlap. Dark readable ink and icons in top, scrolled and drawer-open states. No new scroll-dependent polarity mechanism. Hero media, controls and creative content stay intact. |
| R-06 | Existing canonical contact and service destinations only. No new staffed-service, WhatsApp, live-chat, booking or VIP promises. |
| R-07 | Preserve current category rendering and actual fragrance behavior. Repository main currently declares fragrance Ingredients/Use. Before touching fragrance policy or data, reconcile any subsequently approved fragrance-specific contract and current live implementation. No fragrance data/policy edits in the foundation batch. |
| R-08 | Preserve the canonical policy source and any verified existing category exception. No new delivery threshold meter or express-delivery promise. |

## Technical conditions

- Studio imagery with white baked-in backgrounds uses white media frames; alabaster is reserved for suitable surrounding surfaces. Do not use multiply blending to conceal mismatched backgrounds or alter garment colors.
- Prices, sizes, quantities, filter counts and gallery indexes use `font-variant-numeric: lining-nums tabular-nums` and the utility sans.
- Audit hardcoded colors, white-alpha dividers and embedded SVG colors in their declaration context. Black ink, white action labels and the deferred hero are legitimate exceptions. Never use blind global color replacement.
- Lookbook markers use dual-contrast core/outline tokens, a 24px visual marker and at least a 44px interactive target. This does not certify full WCAG compliance.
- Preserve the single canonical product-palette engine. A white page canvas does not remove safe announcement colors, subtle header tint or section-title accents.
- Remove the Bible workflow's automatic repair/commit/push-to-main path while retaining validation. Keep relevant CI permissions read-only.

## Phase 3 review disposition

The external review referenced pages beyond the delivered 22-page v1.0 PDF and an owner-decision checklist not present there. Those page references are not accepted as evidence. The substantive conditions above are accepted or corrected by requirement ID. Do not represent this as a second independent automated approval.

## Execution sequence and current limits

1. W0: freeze repository and live-theme evidence, record divergence and inherited failures.
2. W1: establish authoritative semantic tokens, contextual audit and read-only validation workflow on `feat/melato-luxury-transition`.
3. Reconcile live code/settings with the repository and review the resulting diff. Preserve app blocks, integrations and current fixes. Do not commit private merchant settings or asset download URLs.
4. Activate foundations through existing CSS owners, then implement chrome, collections, PDP, service and motion. No fourth corrective override layer.
5. Validate the exact unpublished candidate and open the release gate only after regression, accessibility and performance evidence is complete.

The first token asset is deliberately not linked into the storefront during W1. It is the authoritative destination for later alias migration, not an active patch stylesheet. A draft PR is not a release candidate.
