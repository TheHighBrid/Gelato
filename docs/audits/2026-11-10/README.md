# November 10 storefront remediation

Status: **in progress, publication and approved ingredient evidence blocked**. Target: a verified public storefront score of at least 94/100. No 94-point result is claimed.

## Evidence and changes

Published theme: `162873704703`, READY: Sep 19 Audit Fix + PDP Color Details. Fifteen relevant theme files were fetched from Admin and matched repository bytes before editing. The working branch starts at `d2a8216`; Shopify subsequently synced French rack translations to main.

| Audit finding | Applied to Shopify | Theme patch awaiting publication |
|---|---|---|
| Pocket Change false bundle | Removed companion_product, matching_product, matching_piece and set_partner | Product-specific labels; available-variant fallback; unavailable sets disabled |
| Pocket Change repeated copy | Description reduced to its existing unique narrative; existing material, care, construction and fit facts copied to canonical fields | Suppress duplicate subtitle; preserve Story and Construction; decompose legacy technical headings without discarding unique disclosures |
| Delivery overpromise | French announcement explicitly says standard delivery | Standard delivery wording across active and legacy theme sources; Bible patch version 1.1.1 |
| French localization | 60 native translations registered, including campaign, announcement and rack UI | Complete locale-key coverage, navigation labels, footer labels, localized homepage/cart SEO and locale-preserving links |
| Uniform destination | No theme setting write possible | Homepage uses tracksuits rather than frontpage |
| Fragrance INCI | No ingredient invention or replacement | Approved finished-product lists still required for Petal Veil, Open Air, Silk Bloom and Obsidian Coast |
| Appointment marquee | Concise French native translation | Concise English copy; one accessible contact link; decorative repetitions excluded from accessibility tree |

Blush Ledger's missing explicit SEO title was also repaired using its existing product description. The catalogue check covered all 114 ACTIVE records, with unique IDs and complete pagination. `catalog-quality.json` is Admin QA, not evidence of public defects or a storefront score.

## Repeated verification

1. Reproduced original public HTML defects and reconciled live theme bytes.
2. Added failing tests before patches for labels, unavailable sets, duplicate intro, canonical disclosures, collection destination, French keys, locale URLs and marquee access.
3. Independent review found additional bundle availability, marquee focus, legacy matcher and disclosure-preservation issues. Added regressions and repaired them.
4. Re-fetched public pages. `live-recheck.json` confirms Pocket Change has no jacket/pant labels or matching-piece panel and has one introduction and one construction list. It also explicitly records remaining English French-route SEO and rack heading pending theme publication.
5. Browser interaction verified one Pocket Change item added successfully, then removed it and verified the cart was empty. Browser initially had a preview cookie; exited preview before the published-theme test.

Run:

```sh
npm test
node scripts/validate-melato-product-page-bible.mjs
```

The storefront integrity workflow's Python contract and every asset's JavaScript syntax are additional mandatory gates. Shopify Theme Check validation passed with warnings; existing complexity/unused-variable warnings remain. Validation used the toolkit's bundled documentation fallback after the fresh documentation download timed out.

## Deployment boundary

The Shopify connector blocks themeFilesUpsert on MAIN and theme publishing. themeDuplicate returned no new theme and no errors; themeCreate failed with `Src is empty` using both documented GitHub archive and direct archive sources. No unrelated draft was overwritten and no theme was deleted. Keep this patch in an owner-reviewed PR because canonical policy copy changes require that review. Do not merge solely to bypass the live-theme write restriction.

After owner review and publication, repeat browser, public HTML, language, bundle and cart checks on the actual published theme. Only then score the same six storefront categories used by the supplied audit. Performance remains unscored without valid measurements. Do not convert unit-test pass rate or Admin completeness into a storefront score.

## Ingredient evidence still needed

Shopify fragrance records, project PDFs, the prior product audit and a targeted search of the connected brand inbox did not provide approved finished-product INCI declarations. All four fragrances currently carry the same general disclosure rather than a finished list. Obtain packaging text or the manufacturer's approved declaration and retain provenance before writing the canonical ingredient field.

Health Canada's current [cosmetic labelling guidance](https://www.canada.ca/en/health-canada/services/cosmetics/cosmetic-advertising-labelling-ingredients.html) and [industry guide](https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/industry-professionals/labelling-cosmetics.html) distinguish INCI ingredient labelling and applicable allergen disclosures. Missing online INCI is an unresolved shopping-information requirement here; this review does not establish that physical packaging is unlawful.

## Security review scope

The changed theme paths were reviewed for unsafe interpolation, DOM injection and cart submission regressions. New navigation labels and URLs escape output; bundle labels escape product titles. No introduced exploitable issue was established. Repository pattern scans require context: ten secret-pattern hits were font/JSON-LD URLs or an image token, not confirmed credentials; 63 OWASP-pattern hits are review leads, not 63 verified vulnerabilities.

| OWASP area | Result within this patch |
|---|---|
| A01 access control | Shopify-managed; no new privileged endpoint |
| A02 cryptographic failures | No cryptographic changes |
| A03 injection | Changed interpolations escaped; no introduced exploit established |
| A04 insecure design | Bundle stock and selector inconsistency repaired |
| A05 configuration | No security protection weakened |
| A06 components | Separate Next scaffold audit: 1 high and 7 moderate dependency findings; upstream fix requires a Next major upgrade. No Next code is deployed by this Liquid patch |
| A07 authentication | Shopify-managed; unchanged |
| A08 integrity | Fresh tests, reconciliation hashes and syntax checks required |
| A09 logging | No new sensitive logging |
| A10 SSRF | No server-side fetch surface introduced |

The invoked correlation skill is not applicable to these deterministic content checks: no statistical relationship or causal uplift is inferred. The code-mentor workflow was used only as code-review guidance, not as a user tutoring session.
