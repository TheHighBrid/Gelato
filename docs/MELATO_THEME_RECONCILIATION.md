# Live theme reconciliation

Evidence date: October 23, 2026. Branch: `feat/melato-luxury-transition`. Draft PR: https://github.com/TheHighBrid/Gelato/pull/111.

## Result and boundary

Reconciled the published `gelato-v1-00` theme, ID `167790772479`, against main `012a73fcca2e63e04e5a7c8e1e4afe8c9e45d3f9` and the W1 branch parent `4581c1c676aad82bbf92bf5bee76acafe791e1ab`. The full paginated live inventory contains 283 files. Provider checksums for the original 270 text records still match the fresh inventory. Reported live `updatedAt`: `2026-10-15T18:19:13Z`.

The luxury token stylesheet remains unlinked. This batch preserves existing live resources and editor content; it does not activate the new aesthetic. No Shopify file, setting, product, policy or published theme was changed. Main is untouched.

Subsequent MDP remediation hardens three imported JavaScript assets and the local filesystem tools. Their original live-body hashes remain provenance; reviewed candidate hashes and `remediate-live` dispositions identify the patched bytes. The original disposition table and verification below describe the reconciliation checkpoint. See `MDP_CODACY_REMEDIATION.md` for the later changes, current checks and ticket-by-ticket evidence.

## Disposition

`MELATO_THEME_RECONCILIATION.json` records every file, its reason, provider checksum and available materialized-body/candidate SHA-256 hashes.

| Decision | Files | Treatment |
| --- | ---: | --- |
| Identical | 231 | Keep matching repository content, including nine lookbook images and two generated blocks |
| Import live | 16 | Thirteen missing dependencies/assets plus layout inclusions, collection navigation inclusion and Arabic translation |
| Retain repository fix | 17 | Preserve newer safety, commerce, calendar, syntax and duplicate-content fixes |
| Equivalent JSON | 16 | Ignore generated headers and formatting; parsed values match |
| Merge | 1 | Preserve all live homepage sections, blocks, order, disabled flags and settings, retaining six existing repository hero shopping controls |
| Private overlay | 1 | Preserve live `config/settings_data.json` in the local candidate without committing captured merchant configuration |
| Exclude probe | 1 | Omit unreferenced `assets/melato-ui-enhancements-check.txt` |

The 13 imports include live app resources, Apple motion resources, announcement rotation/dismissal resources, collection navigation, compatibility stubs, legacy cleanup resources and `icon.svg`. Some are currently unreferenced, but remain part of the captured live source inventory. Their inclusion does not authorize future activation. The five layout resource inclusions preserve their existing live order.

The homepage retains the merchant's `FRAME_100_AP` cover, three additional section slots, seven world-orb blocks, disabled states, app blocks and exact live section order. Existing repository shopping links and heading controls remain supported by `sections/video.liquid`. The storefront audit now checks the editor-selected cover instead of a stale hardcoded `FRAME_261` asset name.

Repository fixes retained include the inert PDP cleanup stub, repaired palette JavaScript, date-aware popup archive, full desktop navigation, readable announcement layout, explicit currency helper, single recommendation rail, single-owner Fit/service copy and canonical PDP template. The manifest explains each exception. The older live DOM-removal observer and malformed palette JavaScript are deliberately excluded.

## Merchant settings and candidate assembly

The live settings file differs semantically only in the announcement fallback text. Its remaining values match repository settings. The repository copy remains unchanged. Candidate assembly overlays the complete captured live file, preserving all merchant settings and app configuration as exact bytes.

```sh
node scripts/prepare-reconciled-theme.mjs /absolute/path/to/live-snapshot /absolute/path/to/new-candidate
```

The output must be a new directory outside the source and snapshot. Assembly verifies the captured settings body SHA-256 before writing, refuses source symlinks, copies theme directories only and performs no upload. The verified local candidate contains 289 files. Seven repository-only files under theme directories are retained, while the one diagnostic probe is excluded. The source includes a legacy layout instruction text file; candidate assembly is a local source-preservation step, and Shopify-supported upload paths still require review before staging.

Provider `checksumMd5` is stored as provider evidence, not recomputed from returned text. For several generated JSON documents, the returned representation has a different digest. `liveBodySha256` records the actual fetched bytes and is the settings assembly gate. A provider digest mismatch is never silently substituted for a matching body hash.

Before any future Shopify staging or activation, refresh the complete live inventory and settings, compare provider checksums with this manifest and reconcile new edits. Keep any refreshed raw settings and candidate directory outside Git. Do not deploy the repository settings file over the live merchant configuration. A complete rollback export and unpublished-theme validation remain release requirements.

## Verification

| Check | Result |
| --- | --- |
| Product Page Bible validator | Pass |
| Six reconciliation tests plus four color-audit tests | 10/10 pass |
| Rendered storefront audit | Pass: palette JavaScript, shopping links, responsive video and single recommendation heading |
| October audit | Pass: eight date boundaries and single-owner PDP copy |
| Shopify theme validator, five changed Liquid/JSON files | No errors; seven performance/routes warnings |
| Imported JavaScript and CSS parsing | Four JavaScript and seven CSS files parse |
| Full homepage data comparison | Every live section/setting/block/order/disabled value retained |
| Candidate settings comparison | Exact live bytes preserved; repository settings untouched |
| Local Chromium component checks, 390px and 1440px | Active category, nested menu links, dismissal persistence, section-reload idempotence, no document overflow and no JavaScript errors |
| Full `npm test` | 54 tests: 46 pass, same eight inherited failures as main; zero added failures |

Browser checks rendered the actual announcement section and collection-tabs snippet with representative data and existing live resources. They do not establish full Shopify runtime, app, checkout, cart or integrated visual acceptance. Chromium was extracted from the installed package after its default archive extraction hit an environment ownership error. Shopify validation used the official helper with temporary dependencies and an absolute theme path.

Inherited failures remain listed in `MELATO_LUXURY_BASELINE.md`. Their assertions were not weakened. Styling activation and release remain blocked pending their resolution, a complete rollback export and full unpublished-theme review.
