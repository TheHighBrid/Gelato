# MDP Codacy ticket remediation

October 23, 2026. Scope: MDP-7 through MDP-71, the 65 Codacy findings in https://melato.atlassian.net/browse/MDP. MDP-1 through MDP-6 are starter/example ideas, not code findings, and are unchanged.

Branch: `feat/melato-luxury-transition`. Review: https://github.com/TheHighBrid/Gelato/pull/111. Starting commit: `de423eebbe035108e3815298354388db93505c09`. No Shopify deployment, styling activation or main merge.

## Disposition

| Disposition | Tickets | Jira treatment |
| --- | ---: | --- |
| Implemented and locally verified | 58 | Ready for delivery, pending PR review and hosted reanalysis |
| Qwik analyzer false positives | 6 | Done with contextual evidence; not claimed as runtime fixes |
| Hosted analyzer configuration blocker | 1 | Discovery with exact reproduction and correction required |

`MDP_CODACY_REMEDIATION.json` maps each ticket to its source and evidence. Findings are grouped by root cause, not treated as 65 independent bugs. No global analyzer exclusion or security-rule suppression was introduced.

## Changes

- The service planner constructs DOM nodes and assigns dynamic text with `textContent`. It no longer uses `innerHTML` or an indexed HTML-escaping lookup. Service-plan and chat CTA protocols are restricted to HTTP, HTTPS and mailto; unsafe protocols fall back to the canonical contact route. The old implementation demonstrably retained a `javascript:` CTA despite HTML escaping.
- Service selection uses only own entries from `SERVICE_META`. Prototype keys such as `__proto__` and `constructor` fall back to fit. The six supported routes and handoff-copy behavior remain functional.
- CLI auditing, candidate assembly and reconciliation fixture reads use a shared filesystem boundary. It rejects absolute/traversal/NUL/drive/backslash paths, checks every existing component for symlinks and root containment, checks regular files, uses no-follow leaf opens where supported, and writes new files exclusively with private permissions. Output creation is exclusive, and dangling output symlinks are rejected. Captured snapshot settings remain checksum-gated and private.
- Motion/announcement controllers use block-scoped declarations. Header traversal uses `for...of`. Callback returns, unused catch bindings and the empty service-worker rejection callback are corrected without changing intended storefront behavior.
- The original captured live checksums remain provenance. Three remediated JavaScript assets now use `remediate-live` dispositions and updated candidate hashes instead of incorrectly claiming byte identity with their live source.

This is a local CLI boundary for owner-selected directories, not a filesystem service exposed to untrusted requests. Dynamic paths are necessary for theme traversal. Purely syntactic non-literal-filename analyzers may still flag validated operations. No claim is made that a concurrent hostile process modifying directory parents is eliminated on every platform.

## Analyzer findings requiring contextual rulings

MDP-28, MDP-31, MDP-35, MDP-37, MDP-49 and MDP-50 demand Qwik `$()` serialization wrappers. These files are ordinary Node/browser JavaScript, not Qwik resumable components. The repository uses Next/React and `node:test`. Adding an undefined `$()` wrapper would create a runtime defect. These are closed as analyzer false positives, with this evidence, rather than changing executable semantics to satisfy an unrelated framework rule.

MDP-24 reports `Unknown rule scss_function-disallowed-list`. The invalid rule does not occur in the source or repository analyzer configuration. Reproduction with Stylelint on the unchanged CSS gives that exact unknown-rule error; replacing the configured rule name with `function-disallowed-list` produces zero warnings for the same file. This is a hosted analyzer configuration defect. Correct the Codacy Stylelint pattern/configuration, then rerun analysis. It remains open because that hosted configuration was not modified or verified here. No source edit or suppression is presented as fixing it.

## Verification

- Focused Node tests: 15/15 pass, including traversal, symlink, exclusive-write and snapshot-boundary regressions. The Bible guard runs all 15 with read-only permissions.
- Browser security/behavior runner: `node scripts/test-mdp-browser.cjs [chromium-executable]`, with Playwright available in module resolution. Tests all six routes, handoff copying, prototype-key fallback, malicious text and JavaScript/data URL rejection.
- Red/green evidence: the unsafe-URL assertion fails against the pre-patch `assets/app.js`, returning `javascript:window.xss=1`, and passes with the patched source. The browser runner uses the actual widget engine and actual app source with an isolated fixture; no real messages, orders or network submissions occur.
- Existing announcement/navigation browser checks at 390px and 1440px pass after the controller cleanup: dismissal persistence, section-reload idempotence, active category, no document overflow and no JavaScript errors.
- Targeted ESLint checks pass for nine changed JavaScript/module/test files using `@eslint/js` recommended rules, browser/Node globals, `no-var` and unused-binding checks. This is not a claim that hosted Codacy is green or that every configured repository lint target passes.
- Product Page Bible validator, rendered storefront audit and October calendar/PDP checks pass.
- Full Node suite: 59 tests, 51 pass, the same eight inherited failures documented in `MELATO_LUXURY_BASELINE.md`; zero added failures. Those failures remain release blockers.
- Candidate assembly succeeds with the original live settings body checksum unchanged. Original live-theme evidence is not overwritten. `git diff --check` passes.

The patch requires review and hosted reanalysis. Styling remains inactive. Full unpublished Shopify/runtime and release validation remain separate gates.
