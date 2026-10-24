# Merge validation checkpoint

October 23, 2026. Owner instruction: implement remaining fixes, then merge with main only when all checks are green. Scope is PR #111, `feat/melato-luxury-transition`, not unrelated open PRs. Shopify publication and luxury-style activation are separate from this merge.

## Remaining implementation and review fixes

- Canonical PDP server-rendered prices, compare-at prices, set prices and sticky prices now use `money_with_currency` instead of plain money. Existing variant/cart architecture and category semantics are preserved.
- Clipboard fallback checks `execCommand`'s result and always removes its temporary textarea. Failure and exception paths display the existing failure state.
- Announcement restart checks document visibility, hover and focus on every attempt, including return from a background tab.
- Dashboard active/hover tab sublabels and hovered service-card numbers use dark ink on paper. Measured active label contrast is 16.75:1. Screen-reader clipping uses `clip-path` instead of deprecated `clip`.
- The color audit now recognizes space-separated white-alpha colors and literal inline SVG color attributes. Neither path changes source colors.
- Added an explicit assembler regression for a symlink replacing a top-level theme directory. The existing rooted boundary rejects it before output creation.
- Corrected remaining callback style findings and simplified dashboard element initialization without changing its six service routes.

## Eight inherited test failures reconciled

| Failure | Evidence and correction |
| --- | --- |
| Return-protection copy | The wrapper delegates to the preserved base filter. The test now follows both layers and checks the qualified live homepage wording. No policy promises were broadened. |
| Cart metadata | The current owner-approved text says "continue to checkout"; the assertion used older "continue securely" text. The purpose-built All Products and cart metadata checks remain. |
| Removed lookbook frame | `ojos` is an approved product destination in SHOP, not a rejected frame in FRAMES. Assertions now inspect frame IDs/titles/captions instead of rejecting any occurrence in the engine. |
| Hidden specification grid | A regex crossed CSS rule boundaries and matched an unrelated later display rule. The test now examines actual hiding-rule selectors and protects the canonical grid. |
| Judge.me homepage widgets | The merchant uses an enabled Judge.me core app embed, not the two removed hardcoded homepage blocks. The test checks the active embed and valid homepage section order. No ratings or review claims were invented. |
| Currency | Fixed the canonical price source rather than depending solely on later output/runtime repair. |
| Hero sound | The active homepage hero is `sections/video.liquid`, which already owns the accessible sound toggle. The test verifies that active template selection, mute/unmute controls and muted autoplay. The deferred secondary hero is unchanged. |
| Duplicate recommendations | The compatibility fallback is guarded by an existing recommendation heading. The test checks one active related-products section and that guard. The rendered storefront audit confirms a single heading. |

## Verification

- `npm test`: **61 tests, 61 pass, 0 fail**.
- The Product Page Bible workflow now runs the full Node suite, including the previously inherited failures; no tests are skipped or marked expected-failure.
- Product Page Bible validator, rendered storefront audit and October calendar/PDP checks pass.
- `scripts/test-mdp-browser.cjs`: six real service-plan routes, copied handoff notes, prototype-key fallback, malicious text, unsafe URL rejection, failed/throwing/successful clipboard fallback and temporary-node cleanup pass.
- `scripts/test-merge-review.cjs`: focused announcement remains paused after tab visibility changes; active-label contrast and hovered-number ink pass.
- Existing announcement/navigation browser checks pass at 390px and 1440px.
- Targeted ESLint checks and `git diff --check` pass. Official Shopify theme validation of the changed PDP has no errors; five pre-existing complexity/unused-variable warnings remain. Its documentation updater used bundled fallbacks after a network timeout.
- Original live body hashes remain provenance; reviewed candidate hashes were refreshed for remediated source. Merchant settings are not committed or deployed.

Browser runners require Playwright in module resolution and optionally accept an explicit Chromium executable. They use isolated local fixtures and the actual source files; no real messages, orders or forms are submitted.

## Conditional merge gate

The earlier commit's six GitHub Actions runs and CodeRabbit status were successful, but Codacy's separate check-run was `action_required`, with 36 annotations. These included the invalid hosted Stylelint rule, protected fixture/CLI path warnings and additional source-style findings. GitHub status contexts alone do not expose that separate failing check-run. The exact final head must pass both status contexts and check-runs before merge. Do not disable checks, reduce thresholds, falsify a status, skip the external check or merge through an administrator bypass.

Codacy's public PR page is readable in the available browser, but it offers Login and does not provide an authenticated configuration session. Correcting the hosted rule and recording reviewed false-positive dispositions requires authenticated project access. Repository fixes can be pushed and checked independently. The owner authorized merge only after all checks are green, so an unresolved external failure remains a merge blocker.
