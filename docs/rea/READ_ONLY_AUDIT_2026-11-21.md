# MELATO REA read-only preflight (2026-11-21)

Scope: evidence-backed repository reconnaissance; no code changes or Shopify publication. All observations are from GitHub connector reads unless explicitly labeled user-provided terminal logs or automation metadata.

## Source repository and architecture
- Repository: https://github.com/TheHighBrid/Gelato ; default branch `main`, production Shopify theme.
- `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `locales/`, `config/`: Shopify Liquid theme.
- `src/`: experimental Next.js Living Book prototype. **Do not ship Next.js runtime as Shopify theme.**
- `tests/`: Node behavioral/regression tests; `scripts/`: integrity and Product Page Bible validation.
- `package.json`: Next.js 15.5, React 19, GSAP, Lenis, Zustand; `npm test` runs Node tests, `npm run build` builds the prototype.
- README: https://github.com/TheHighBrid/Gelato/blob/main/README.md
- Agent contract: https://github.com/TheHighBrid/Gelato/blob/main/AGENTS.md

## Invariants
- Read `docs/MELATO_PRODUCT_PAGE_BIBLE.md` and `config/melato-product-page-bible.json` **before all product work**. Bible version 1.1.1 at inspection.
- No invented product facts, field aliases, revised product taxonomy or product data.
- Preserve `layout/theme.liquid` loaders: `melato-luxury-tokens.css`, `melato-collection-navigation.css`, `melato-dynamic-announcement.js`, `melato-audit-nav-collections.js`.
- Run `npm test` and `node scripts/validate-melato-product-page-bible.mjs` and storefront integrity workflow; preview on unpublished theme before live publication.
- Historical reconciliation manifest is evidence; do not rewrite historical hashes to silence a test. PR #140 proposes a test fix.

## Existing experiences: reuse, do not rebuild
- `templates/page.living-lookbook.json` currently selects `melato-lookbook-shop` with curated frames and verified product handles. Documentation describes a 28-frame reader with 19 products; see https://github.com/TheHighBrid/Gelato/blob/main/docs/lookbook-audition/README.md . Tested branch functionality is **not equivalent** to verified live publication.
- `docs/THE_LIVING_BOOK_Blueprint_v2.0.md` explicitly calls for Shopify-native dynamic-frame engine, stable asset IDs, no Next.js bundle, reduced-motion fallback; requires verified frame-to-product mappings before shopping overlays.
- `docs/editorial/README.md` describes a **separate** `/pages/editorial` route, with instruction not to overwrite `page.living-lookbook.json` or `melato-living-book-vol01.liquid`. Route choice must be reconciled before edits.
- `docs/rack-atelier/QA.md` describes existing Virtual Rack: 21 transparent images, realistic swing/selection, optional verified back view, responsive/keyboard support. October 25 motion revision is not confirmed deployed. **Never republish entire Lumière preview theme**.
- Other references: `MELATO_RACK_README.md`; `THE_LIVING_BOOK_QuickReference.md` contains an older Next.js scaffolding instruction; defer to production v2 architecture and current repo.

## Open PRs at inspection
- #137 [cart drawer escaping](https://github.com/TheHighBrid/Gelato/pull/137): open draft; edits `assets/melato-cart-drawer.js`, `snippets/cart-drawer.liquid`, cart tests/workflow, reconciliation manifest. Seven PR-triggered GitHub Actions workflows reported success for inspected head commit. Shopify preview/real checkout not verified.
- #136 [main-cart image fallback](https://github.com/TheHighBrid/Gelato/pull/136): open draft; `sections/main-cart.liquid`, tests/workflow, reconciliation manifest. One GitHub workflow failing.
- #138 [PDP catalog escaping](https://github.com/TheHighBrid/Gelato/pull/138): open draft; `sections/melato-product-page-rebuild.liquid`, tests, reconciliation manifest.
- #134 [PDP construction escaping](https://github.com/TheHighBrid/Gelato/pull/134): open draft; overlaps #138 in PDP section and reconciliation manifest.
- #139 [theme identity deployment guard](https://github.com/TheHighBrid/Gelato/pull/139): open draft; `scripts/check-theme-target.cjs`, tests. One GitHub workflow failing.
- #140 [historical reconciliation test correction](https://github.com/TheHighBrid/Gelato/pull/140): open draft; only `tests/theme-reconciliation.test.js`. Six inspected PR-triggered workflows reported success.
- #131 [French/PDP audit](https://github.com/TheHighBrid/Gelato/pull/131): open; edits reconciliation manifest.
- #110 [older PDP Bible audit](https://github.com/TheHighBrid/Gelato/pull/110): open draft; touches main-cart, PDP renderer and related content.
Source: GitHub PR metadata/file lists read on 2026-11-21. Recheck before merging or starting overlapping implementation.

## Specific CI diagnosis
- On inspected #136 head, Product Page Bible Guard failed its `npm test` reconciliation test (`tests/theme-reconciliation.test.js`): `layout/theme.liquid` actual SHA-256 `ea12ae00...` vs stored `c04d22f5...`.
- On inspected #139 head, same reconciliation assertion failed. Other reported workflows succeeded.
- #140's proposed fix pins historical reconciliation to the original Git blob while keeping current functional and candidate-overlay assertions. Its inspected workflows passed, but no merge/rebase/publish was performed.
- Passing workflow runs do **not** establish preview/browser/checkout verification or final approval.

## Current automations
- **Melato Storefront Evolution** enabled hourly, can write to storefront/GitHub.
- **Melato Precision Audit** enabled twice daily, audits/read-only role.
- **Melato Progress Report** enabled twice daily, explicitly read-only.
- Before any development assignment, coordinate with the hourly mutating automation; reserve file ownership or use isolated branches and no shared edits. Do not pause or modify automations without a deliberate separate decision.

## REA setup verification
- User-provided Mac terminal log confirms `npx rea-agents setup --client codex --client antigravity --client gemini_cli` completed, with Codex, Antigravity and Gemini registrations and skill installed; Hopper detected.
- **Live REA MCP functionality remains UNVERIFIED.** The remote Mac endpoint was offline when checked, so no direct `doctor`, MCP handshake or `binary_session` could be executed in this audit.
- No need to reinstall REA. At next available agent startup, perform **one** non-destructive readiness check, not repeated setup. Never treat absent Ghidra/IDA/JADX/Kuna as automatically blocking browser/Shopify design work.
