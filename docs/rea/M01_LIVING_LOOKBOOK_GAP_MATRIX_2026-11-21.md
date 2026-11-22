# MELATO REA M-01: Living Lookbook reference gap matrix
Date: 2026-11-21
Status: RESEARCH / IMPLEMENTATION SPEC ONLY, no source edits, no deployment
Chosen first route: `/pages/living-lookbook`.
Priority reason: M-00 reported customer-visible headline/frame-title readability failure on an otherwise functional, high-profile editorial route. This is smaller and safer than the concurrent PDP/cart or 79-scene editorial rebuild.

## Evidence and source confidence
- **M-00 observation (provided in user-shared Antigravity report, 2026-11-21):** live theme `162873704703`, `/pages/living-lookbook` HTTP 200 with 28 `tll` frames, 22 distinct product links, dark-on-dark headline and first frame title at 1440 px / 390 px. Captured 20 local screenshots and JSON telemetry; those exact local files were NOT available in connected GitHub at time of this report. Do not treat an uninspected local image as personally reviewed evidence.
- **Independently verified GitHub source:** `templates/page.living-lookbook.json` sets `melato-lookbook-shop`; `sections/melato-lookbook-shop.liquid` renders headings, images, two-product slots, navigation and modal; `assets/melato-lookbook-shop.css` declares background `#11110f` and light text `--tll-paper:#eee9df`; JS initializes navigation, dialogs and cart; `tests/melato-lookbook-shop.test.js` verifies sequence, variants, cart/error handling, focus, French strings, and teardown. A source-level light-text declaration and reported dark-on-dark live display are inconsistent. **Root cause unknown** until computed browser styles/cascade is captured.
- Existing docs describe 28 curated frames, 8 narratives, 19 unique product handles and full-fidelity Shopify commerce. Do not rebuild or duplicate these.
- **Current PR conflict:** #142 (created 2026-11-21) edits global CSS, theme layout, concierge and PDP, plus reconciliation manifest. It does not list `assets/melato-lookbook-shop.css` or `sections/melato-lookbook-shop.liquid` as changed files, but global CSS/theme loader changes can affect cascade. Re-check before implementation.
- **Competitor reference facts:** ZARA uses visual merchandising combined with structured collection navigation (https://www.zara.com/ca/); SSENSE combines fashion shopping with editorial coverage (https://www.ssense.com/en-ca); Nike SNKRS exposes launch feed, in-stock and upcoming release navigation (https://www.nike.com/ca/launch). These are inspiration only, not a license to copy layouts, code, assets or branded graphics.
- `docs/THE_LIVING_BOOK_Blueprint_v2.0.md` favors Shopify-native light/performant experience. Do not introduce a Next.js storefront runtime or WebGL.

## Grounded gap matrix

| ID | Finding | Severity | Evidence | Action / deliberate non-action | Scope |
| --- | --- | --- | --- | --- | --- |
| LB-01 | Intro heading and first frame title reportedly dark-on-dark at desktop and mobile | P0 | M-00 browser capture report + conflicting source CSS | Diagnose computed color/background and winning CSS rule for `.tll h1`, `.tll h2`, affected descendants at 1440x and 390x. Apply smallest **scoped** cascade correction based on actual root cause; preserve established cream/bronze visual system. | `assets/melato-lookbook-shop.css` and a focused regression test only. Avoid global CSS. |
| LB-02 | French pages retain English titles/headers in parts of the editorial experience | P2 / needs classification | M-00 FR route report; `locales/fr.json` has brand-title `The Living Lookbook` intentionally or unintentionally in English. Tests show French controls exist. | Audit **interface labels vs creative frame titles and proper names**. Translate only user-interface strings actually missing; preserve product names and editorial proper nouns unless approved. No speculative bulk translation. | Read-only first, later separate locale-scoped task. |
| LB-03 | Global header/footer intentionally hidden in the lookbook | Not a defect on present evidence | Local CSS `body:has([data-tll]) ... display:none!important`; local `.tll-header` and `.tll-nav` provide branded navigation. | Preserve immersive mode; verify escape/back-to-store, cart and keyboard route. Do not restore global chrome as a generic fix. | Verification only |
| LB-04 | Core shopping behavior already implemented | Preserve | Liquid product snippet and JS; 8 existing lookbook unit/behavior tests | Reuse current variants, stock, localized cart routes, error handling and focus. No duplicate overlay or new cart implementation. | Protected |
| LB-05 | Motion, editorial pacing and immersive hierarchy | P3 enhancement (not confirmed defective) | CSS responsive layout, reduced-motion fallback, ZARA/SSENSE comparison | After P0 is fixed, inspect one representative scroll interaction. Propose at most one subtle transition, with no LCP cost and no autoplay video. | Future isolated task |
| LB-06 | 28-frame block limit vs dynamic archive ambition | Deferred architecture decision | Section schema `max_blocks:28`; v2 blueprint favors dynamic N, but live route uses curated 28 frames. | Do not remove limit/replace schema in current correction; only revisit if approved expansion actually requires it. | Out of scope |
| LB-07 | Live rack / home support-widget overlap | P1, separate feature | M-00 screenshot report; PR #142 includes chat-widget suppression | Do not create duplicate fix. Verify after #142 integration, then ticket only if residual. | Not lookbook |
| LB-08 | Editorial route has 79 stacked scenes, very long page, dark hero and mobile clip | P1, separate route | M-00 capture report | Reserve for a different assignment, after Living Lookbook corrective regression. Avoid touching `page.editorial.json` in this task. | Out of scope |

## Baseline preserve
- Exact 28-frame sequence and curator-approved product handles, native Liquid frames, and Shopify product object lookups.
- 8 narrative frames and shoppable frames; real variant/availability/cart flow; no fake product data.
- Shop dialog focus return; keyboard access; alt text; direct product link; reduced-motion behavior.
- Product Page Bible v1.1.1, existing bilingual commerce integration, no global header/theme/layout changes.

## First implementation candidate: MEL-LOOK-01
**Goal:** correct live contrast issue in lookbook intro and frame headings on 1440px and 390px without changing other pages, imagery, product mappings or interactions.

1. Start from an up-to-date isolated branch, inspect open PR #142 and verify relevant CSS source. Do not scan unrelated repository.
2. Use existing M-00 Playwright evidence if locally available. Compute and record `color` and background for `.tll h1` and `.tll h2`, and identify the winning declaration/rule. Do not assume the local CSS is the root cause.
3. Make the smallest scoped adjustment in `assets/melato-lookbook-shop.css` **only if necessary**, plus a focused reproducible style regression. If root cause is a global or injected `!important` rule, **report and propose** the minimum safe resolution rather than changing `layout/theme.liquid` or PR #142 assets unilaterally.
4. Verify at 1440px and 390px, in English and French. Targets: essential heading/body text WCAG AA where applicable (4.5:1 normal text, 3:1 large text), no clipping/overflow and correct focus visibility. Document computed contrast values and screenshots.
5. Run lookbook tests and existing `npm test`, Product Page Bible validator and available integrity checks. Note unrelated existing CI failures rather than rewriting historical reconciliation.
6. Commit only allowed files on isolated branch. No preview-theme overwrite, merge or production publish. Report branch SHA, changed files, test results and evidence.

**Stop after MEL-LOOK-01.** Return to ChatGPT for diff review and next task selection. If style issue cannot be reproduced, do not commit a cosmetic guess: provide computed-style traces and reroute diagnosis.

## Later order
- MEL-LOOK-02: targeted navigation/mobile focus/scroll QA (only if measured defect).
- MEL-EDITORIAL-01: separately address `/pages/editorial` hero contrast/clipping and duplicated scene length, without touching Living Lookbook.
- MEL-RACK-01: verify any remaining widget overlap after #142; improve only confirmed behavior gaps.
- Then broader reference-informed polish, remaining cart/PDP release coordination and owner-reviewed publication.

## Token economy
M-01, research and file selection already handled in this document. Do not ask another model to re-audit the full repository or every competitor. First coding agent should receive task `MEL-LOOK-01` only, and refer directly to this file.
