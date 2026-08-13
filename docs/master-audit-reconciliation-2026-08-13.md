# Melato.ca Master Audit Reconciliation

Date: 2026-08-13
Branch: `agent/master-audit-reconciliation-2026-08-13`

## Status vocabulary

- `DONE LIVE`: verified source/data fix applied directly to current Shopify data.
- `DONE BRANCH`: implementation completed in GitHub but not published to the MAIN Shopify theme.
- `PARTIAL`: meaningful correction completed, but residual scope remains.
- `BLOCKED`: verification or write is unavailable through the connected tools.
- `OBSOLETE`: historical audit item no longer exists in current source/data.
- `RECOMMENDATION`: optimization, not a defect that can honestly be marked broken.

## Mandatory August 13 reconciliation scope

| Item | Status | Current evidence and action |
|---|---|---|
| Consolidate `melato-*.css` / JS patch files | PARTIAL | Global runtime had a large patch stack. Branch removes obsolete header override CSS from runtime, scopes legal CSS to pages/policies and PDP CSS/JS to products, makes hero JS homepage-only, retires one redundant global content-policy MutationObserver, and makes fonts non-render-blocking. Full physical CSS/JS merge is deliberately not forced without storefront staging because selector-order regressions would be high-risk. |
| `rn-image_picker_lib_temp_*` product-image filenames | PARTIAL, LIVE | Verified on actual active product media. Clean Shopify file renames were applied in place to Divididos jacket, Passion Fruit jacket, Chū jacket, Conquista jacket, Reliance jacket, several Reliance pant media, Rosetta jeans, Wine Breaker jacket, Noir Alibi dress, Knotorious tie media and additional successfully accepted batches. Product associations were preserved. Additional catalogue media still require cleanup because Shopify safety blocked a later batch. |
| Meta Pixel currency warning | BLOCKED PROVIDER-SIDE | Store currency is CAD. Repository audit found no custom `Purchase` event and no custom pixel value/currency payload causing the warning. Custom concierge events are `trackCustom` and do not send transaction currency. Installed-app/script-tag inspection is permission-blocked, so provider-managed pixel configuration cannot be truthfully repaired from this connector. |
| Klaviyo tracking warning | BLOCKED PROVIDER-SIDE / THEME CLEAN | Klaviyo app embed is enabled. Repository audit found no duplicate custom `static.klaviyo.com` loader. Custom `_learnq` usage is limited and does not duplicate the provider loader. Klaviyo account-side diagnostics are not exposed by the connected permissions. |
| Homepage meta-description typo | DONE BRANCH, SOURCE SETTING BLOCKED | Shopify shop description still contains `This is curated wardrobe pieces.` Branch overrides homepage rendered meta with clean copy. The shop-level description mutation is not exposed by the current Shopify Admin schema, so the underlying setting remains until a capable channel changes it. |
| Desktop primary navigation | DONE BRANCH | Added desktop-only primary nav sourced from `main-menu`, with current-page semantics and no duplicate mobile behavior. |
| Empty-cart merchandising / recovery | DONE BRANCH | Empty cart now merchandises up to three available New Arrivals with responsive images, titles and prices, plus a direct recovery CTA. Cart JS preserves this server-rendered recovery state instead of replacing it with generic empty copy. |
| Review / social-proof density | DONE BRANCH FOR DISPLAY, CONTENT-LIMITED | Shopify review metafield audit showed sparse underlying review supply. No ratings were fabricated. Homepage now surfaces existing Judge.me verified review content and badge blocks. Future density depends on collecting real reviews. |
| Responsive image pipeline across every template | PARTIAL | Current core product gallery, product cards, cart recovery, set cards and brand-story imagery use Shopify responsive image URLs, widths/sizes and lazy/eager priority appropriately. Legacy/unreferenced theme files still contain plain image markup and need route-by-route pruning before claiming every file is compliant. |
| Actual mobile performance / CWV testing | BLOCKED MEASUREMENT | Historical July Lighthouse data is not reused as current truth. Google PSI could not execute from the present environment and the connected browser reported offline. Branch reduces obvious global blocking/runtime cost, but no fresh numeric mobile CWV score is claimed. |
| Speculative PDP prefetching | DONE BRANCH | Added intent-triggered same-origin product-document prefetch: max two documents, delayed hover/focus only, disabled for Save-Data and 2G. No blanket speculative prefetch. |
| Third-party script / runtime cleanup | PARTIAL | Route-specific scripts are now conditionally loaded; one duplicate document-wide content-policy observer is retired; cart no longer performs an unnecessary initial cart fetch. Provider-managed scripts remain controlled by Shopify app embeds and cannot be removed without provider evidence. |
| Deeper image SEO / alt audit across catalogue | PARTIAL, LIVE | Product-media audit found many blank alts. Successful live filename batches also repaired blank alts with product-specific descriptions while preserving existing good alts. Catalogue-wide residual sweep remains because safety blocking interrupted later file mutations. |
| CRO trust reinforcement and sizing placement | DONE BRANCH | Added homepage/PDP trust strip for complimentary standard delivery, 30-day eligible returns and secure checkout. Added localized Size guide / Guide des tailles beside Size/Taille selectors, including products using the generic published Melato size guide. |

## Reconciliation of historical audit findings

### Shipping, returns and trust

| Historical finding | Current state |
|---|---|
| `FREE SHIPPING OVER $60` / progress-bar threshold language | OBSOLETE in current repository and previously cleaned translation data. Current policy is complimentary standard delivery with no minimum. |
| Conflicting delivery threshold or amount-away messages | OBSOLETE in current intended source. Do not reintroduce threshold logic. |
| Returns email mismatch | Previously normalized to the current support path. No contradictory cached claim is carried forward without fresh evidence. |
| Weak reassurance near purchase controls | DONE BRANCH via trust strip and shipping/returns disclosure. |
| Fragrance return handling | Current clean PDP has fragrance-specific return language. |

### Product-detail pages

| Historical finding | Current state |
|---|---|
| Hargneux duplicate Fit/Care | OBSOLETE in current Shopify product description source; current source is story-only with technical fields separated. |
| Protective Custody missing material | Current Shopify data has verified component-level material source. No percentages are invented. |
| Amber Alibi provisional material language | DONE LIVE in prior reconciliation: public provisional material claims removed while internal `specification_pending` evidence is preserved. |
| Generic gallery accessible names | Previously hardened, plus catalogue alt cleanup now improves source metadata. |
| Gallery/image instability | Current clean PDP has native responsive gallery plus contained fallback repair. |
| Sizing friction | DONE BRANCH with direct size-guide placement beside selectors. |
| Complete-the-set clarity | Current PDP contains current/matching-piece logic and set pricing. |
| Generic/material placeholder language | Clean PDP suppresses known provisional language rather than publishing unverified composition. |
| Fragrance receiving apparel Fit controls | Current clean PDP branches fragrance fields separately. |

### Collections, navigation and merchandising

| Historical finding | Current state |
|---|---|
| Desktop navigation too hidden / menu-only | DONE BRANCH with visible desktop primary navigation. |
| Homepage Uniform assortment too short | Current homepage template is configured for 16 products. |
| Sold-out merchandising / collection friction | Historical concern. Current collection-specific state must be measured from current inventory and rendered collection output rather than assumed. |
| `Filter 0` / collection filter defects | Later source contains dedicated collection-filter handling. No old screenshot claim is carried forward as current without rendered evidence. |
| Best Sellers naming / sold-out mix | Historical recommendation, not automatically a current defect. |
| Accessories underrepresented | Merchandising recommendation, not a code error. |
| Empty cart has no recovery path | DONE BRANCH. |

### Localization and SEO

| Historical finding | Current state |
|---|---|
| French Contact mostly English | Current Shopify translation resources were previously verified as fully translated for the Contact page. |
| French `$60` indexed residue | Repository source cleaned. Any remaining external search snippet must be treated as index cache unless exact text is found in current Shopify translation/source data. |
| Duplicate Terms H1 | Previously addressed in current theme generation. Do not reapply a stale patch without current evidence. |
| Missing Product/Breadcrumb JSON-LD | OBSOLETE. Current layout renders `melato-global-jsonld`. |
| Generic OG/Twitter metadata | Current layout outputs page-aware OG/Twitter fields; branch also fixes homepage title/description. |
| Homepage meta-description grammar | DONE BRANCH; underlying Shop description remains blocked as described above. |
| Image SEO and filename hygiene | PARTIAL LIVE, active cleanup documented above. |

### Accessibility and semantics

| Historical finding | Current state |
|---|---|
| Generic product image labels | Hardened in current source plus live alt metadata cleanup. |
| Repeated ticker content exposed semantically | Current ticker repeated track is `aria-hidden`; one semantic text copy is retained. |
| Closed cart drawer focusability | Current cart uses `aria-hidden` plus `inert`, with open/close focus management. |
| Duplicate/hidden utility semantics | Current utility layer is structured; legacy hidden-ui cleanup remains part of architecture consolidation. |

### Performance and theme hygiene

| Historical finding | Current state |
|---|---|
| Mobile Lighthouse 54 / LCP 12.3s from July | HISTORICAL ONLY. Not reused as an August 13 current score. |
| Too many global patch assets | STILL PRESENT, IMPROVED ON BRANCH. Safe consolidation stage completed; physical merge remains pending staged visual regression validation. |
| Multiple document-wide MutationObservers | IMPROVED ON BRANCH by retiring the duplicate content-policy observer. Scoped PDP observer remains for dynamic product UI. |
| Render-blocking Google Fonts | DONE BRANCH with preload/onload + noscript fallback. |
| Route-specific JS loaded globally | IMPROVED ON BRANCH: hero and PDP scripts are now route-scoped. |
| Speculative product navigation warm-up | DONE BRANCH with bounded intent-prefetch, not blanket prefetch. |
| Current mobile CWV | BLOCKED until a current lab/browser run is available. |

### Conversion and brand presentation

| Historical finding | Current state |
|---|---|
| No/weak social proof | DISPLAY FIX DONE BRANCH. Underlying verified review volume remains sparse. |
| Weak empty-cart recovery | DONE BRANCH. |
| Sizing lookup friction | DONE BRANCH. |
| Purchase reassurance | DONE BRANCH. |
| Newsletter underused | Current homepage still includes Melato Notes signup. This is a merchandising/content optimization, not a broken implementation. |
| Founder/editorial storytelling depth | Recommendation. Living Book and editorial work should remain separate from technical defect closure. |

## Deployment boundary

Theme changes above are intentionally isolated on the reconciliation branch. Shopify theme file writes are blocked by the connector safety layer even for the unpublished `MELATO GELATO` theme, so these changes have not been force-published to MAIN. Live Shopify product/media data changes listed as `DONE LIVE` are already applied.

Do not merge this branch solely because an old integrity workflow references legacy PDP files. The current canonical product template uses `melato-product-page-clean.liquid`; CI expectations must be evaluated against the current architecture rather than reverting production code to satisfy stale assertions.
