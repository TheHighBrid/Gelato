# MELATO REA: low-token execution backlog (2026-11-21)

## Objective and budget
Upgrade the **existing** Gelato storefront using original, reference-informed design changes. No paid APIs, no new subscription, no full rewrite and no extra Next.js storefront runtime. Reserve Codex for rare difficult surgical repairs or independent review. Assign only narrow, evidence-backed coding tasks.

## Completed without Antigravity quota
- [x] Identify production repository, architecture and relevant source locations.
- [x] Read `AGENTS.md`, Product Page Bible 1.1.1 and relevant workflows.
- [x] Review active PRs, changed files and current CI failures.
- [x] Review existing Living Book, Living Lookbook and Virtual Rack implementation documents.
- [x] Confirm installed/registered REA from user setup logs; record distinction from live connection.
- [x] Check active Shopify mutation/audit/report automations.
- [x] Produce conflict and ownership guidance for future assignments.

## Unresolved research gate
- [ ] Determine **actual Shopify published theme ID** from fresh authenticated read, immediately before any release. The October manifest ID is historical and not a live identity.
- [ ] Verify REA MCP live connection once a supported local session is available; no reinstall required.
- [ ] Compare live pages and actual active `page.living-lookbook`/`page.editorial`/rack against repository implementations and decide **which route** gets incremental improvement.
- [ ] Targeted ZARA/SSENSE/SNKRS/Apple Store reference evidence for **specific missing interactions only**, not comprehensive reverse engineering.

## Release and conflict gates, before touching shared files
- [ ] Owner-reviewed merge/land of #140 (historical reconciliation fix), or an equivalent independently verified approach; then rebase/retest #136 and #139 as needed. No rewrite of historical provenance.
- [ ] Finish preview/cart regression of #136, #137, and #139 release gates; check #138/#134 and old #110 before touching PDP. PR #137's green GitHub workflows are not interactive Shopify confirmation.
- [ ] Ensure hourly Melato Storefront Evolution automation has no overlapping in-flight changes with the assigned branch and file ownership.

## Work packages; one executor and one reviewer per package
| ID | Package | Scope | Earliest gate | Verification |
| --- | --- | --- | --- | --- |
| M-00 | Snapshot active site and current routes | Read only, no code | Now | URLs/screenshots, template mapping |
| M-01 | Reference gap matrix | Only missing behaviors in active Shopify UI | M-00 | Evidence table + desired interactions |
| M-02 | Living Lookbook scoped refinement | `melato-lookbook-shop` and associated assets **only if currently active and owner-approved route** | M-01, source ownership | Native cart tests, accessibility, mobile/desktop comparison |
| M-03 | Virtual Rack scoped refinement | Existing rack assets/section and documented motion; no product schema changes | M-01, current draft verification | Keyboard/pointer/mobile, reduced motion, verified-angle guard |
| M-04 | Editorial navigation / shoppable transition | Single existing route and its own navigation component; do not modify other editorial pages | M-01 | Link integrity, no regression to direct product links |
| M-05 | PDP presentation optimization | **Do not start while #134/#138/#110 overlap** | Related PRs integrated | PDP Bible, variants, translated copy and media |
| M-06 | Cart/purchase-path improvements | **Do not start while #136/#137/#110 overlap** | Cart PRs integrated | Cart drawer, fallback, quantity, error/refresh, checkout preview |
| M-07 | QA and release candidate | Targeted changes only, with safe preview | All chosen packages | npm tests, Bible guard, storefront integrity, mobile + Shopify preview |
| M-08 | Production approval | No autonomous publish | M-07 | Owner review + verified target theme |

## File ownership rule
- Cart: `sections/main-cart.liquid`, `snippets/cart-drawer.liquid`, `assets/melato-cart-drawer.js` => reserved until cart PRs resolved.
- PDP: `sections/melato-product-page-rebuild.liquid` => reserved until PDP PRs resolved.
- Global theme: `layout/theme.liquid` and `docs/MELATO_THEME_RECONCILIATION.json` => guarded release infrastructure. No visual experiment should modify casually.
- Lookbook and Rack: separate components, but multiple historical/experimental branches exist. Inspect active Shopify route before selecting one.

## Minimal AI consumption protocol
1. Only one agent does the repo map, with links, once. Read `READ_ONLY_AUDIT_2026-11-21.md` before further research.
2. Agent consumes only task ID, specific files, relevant evidence, acceptance tests, and the current diff.
3. Use deterministic tests and static checks first; do not repeatedly ask models to visually inspect the same evidence.
4. No 1000-line rewrites or undocumented abstractions. Maximum two failed fix attempts per blocker before handoff.
5. Update a brief `HANDOFF`: branch, commit, changed files, passed/failed tests, evidence paths, blocker and next action.
6. Merge/deploy only with owner approval and explicit Shopify theme identity verification.

## Performance-first acceptance
No regression to performance, accessibility, mobile layout, English/French content, product accuracy, variant selection, cart or checkout. Prefer CSS and small vanilla JS patches inside existing Shopify theme. Preserve original MELATO branding, do not clone ZARA/Apple IP.

## Next executor task
Start at M-00 only, unless the live theme and active route have already been independently proven. Antigravity should **not** repeat items marked completed above.
