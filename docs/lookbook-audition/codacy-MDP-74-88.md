# Codacy fixes: MDP-74 through MDP-88

Scope: follow-up to the Living Lookbook audition in PR #128. MDP-88 is the umbrella ticket; MDP-74 through MDP-87 are fourteen individual findings.

| Ticket | Resolution |
| --- | --- |
| MDP-74 | The observer's `forEach` callback now uses a statement body and returns no value. |
| MDP-75 | `jump` is a named function declaration. |
| MDP-76 | The test submit helper is a named function declaration with no returned dispatch value. |
| MDP-77 | Removed the generic JSON reader. The two fixed JSON files use static imports. |
| MDP-78 | The event-registration helper is a named function declaration with no returned value. |
| MDP-79 | `start` is a named function declaration with a statement body. |
| MDP-80 | The image error handler is a named function declaration. |
| MDP-81 | The controller is a native ES module, loaded with `type="module"`. Modules are inherently strict, so the redundant directive was removed without weakening strict-mode behavior. |
| MDP-82 | `select` is a named function declaration. |
| MDP-83 | The scroll stub uses an arrow function; dialog stubs retain their necessary dynamic `this`. |
| MDP-84 | Replaced the custom tick closure with Node's promise-based `setImmediate`. |
| MDP-85 | Removed the test's dynamic JSON path construction and filesystem reader. |
| MDP-86 | Removed the controller source-file read. Tests import the actual controller module directly. |
| MDP-87 | Removed `window.eval`. Tests call the module's exported initializer with their own window, and jsdom uses its default disabled-script-execution mode. |
| MDP-88 | All fourteen child findings are accounted for in this table. Cloud Codacy confirmation is tracked separately from local verification. |

The eight Qwik findings concern a framework that this Shopify controller does not use. Named helper declarations and static imports satisfy the reported patterns without introducing Qwik, lint suppressions, scanner exclusions, or weaker security rules.

The module initializer is idempotent per document. Browser APIs and cart requests use the supplied window, so tests exercise the same code that the storefront loads. Theme editor section unload aborts listeners and disconnects observers; section reload remounts the reader. No design, frame order, product mapping, product data, or live Shopify theme was changed.

## Verification

- The original two files reproduce eleven Biome findings (nine errors and two warnings) with Biome 2.2.6.
- The changed files pass the corresponding five rules with both Biome 2.2.6 and 2.6.6: `useQwikValidLexicalScope`, `useIterableCallbackReturn`, `noRedundantUseStrict`, `useArrowFunction`, and `noGlobalEval`.
- Targeted ESLint: zero errors and zero warnings.
- Full repository suite: 79 tests pass, including in a checkout with no local dependencies and the CI-style external `NODE_PATH` dependency directory. New regressions cover repeated initialization, observer/listener cleanup and editor remount, plus successful adds when cart-count refresh fails.
- Local Semgrep scan of both changed JavaScript files using upstream njsscan's semantic security rules: zero findings and zero scan errors. An additional upstream non-literal filesystem-path rule also reports zero findings.
- Headless Chromium loads the actual `type="module"` script automatically, submits the selected variant exactly once against a mocked cart, navigates to frame 21, and reports no JavaScript errors or mobile overflow at 390×844.
- Shopify's local Liquid/HTML parser accepts the changed section, and its schema JSON parses successfully. The validation wrapper was not used after automatic approval review rejected it over potential source transmission.
- Product Page Bible validator and `git diff --check`: pass.

The jsdom dependency is resolved through Node’s built-in `createRequire` resolver before normal module import, preserving the existing CI workflow’s external `NODE_PATH` dependency layout without changing the workflow or evaluating source strings.

Node may emit `MODULE_TYPELESS_PACKAGE_JSON` while auto-detecting the two ES modules in this repository's otherwise CommonJS package. This is informational. The browser uses the explicit module script type, and Node 22 (the repository's CI runtime) supports module syntax detection and JSON import attributes. The package-wide module type was deliberately preserved to keep existing CommonJS tests and helpers compatible.

No Jira status was changed and no cloud Codacy success is claimed solely from these local results. The updated commit triggers the PR's existing analysis automatically.
