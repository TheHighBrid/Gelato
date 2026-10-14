# THE LIVING BOOK: CASE 031
## MELATO | Creative direction and build blueprint | 2026-10-14

**Status:** Design and engineering specification. Not an approved visual asset inventory and not a published Shopify change.

## North star
A 31-frame, wordless, interactive crime-scene fashion editorial for melato.ca. The viewer is a silent investigator, never a shopper in a product grid. Clothing is the recurring physical evidence. No narrative captions, case labels, visible frame numbering, product names or commercial calls to action interrupt the 31 frames.

Melato duality: **CCCC** (Creative Clever Class Clean) provides control, tailored silhouette, disciplined negative space and exquisite detail. **CWUP** (Creative Witty Unique Provocative) supplies the disturbance: a garment abandoned where it should not be, a witness stepping beyond the frame, a clean scene that is not quite clean. Crime-scene iconography without cliché gore, weapons-as-props, forensic instruction, or police cosplay. No blood needed.

**Name:** The Living Book. **Creative arc:** 31 photographs, six visual movements, one unresolved ending. This is a proposed new edition; preserve existing Vol. 01 and archives.

## Visual grammar
- Color: near-black #080809, bone #E8E3D9, forensic amber #B58B55, oxidized burgundy #48252B and flash white #F5F2EC. Amber is an occasional accent, not a constant warm wash.
- Editorial: dark tailoring, velour, dramatic flare, eyewear, gloves, fine hardware, movement, architecture, anonymous objects and believable garment construction. Use real verified Melato SKUs where represented.
- Light: intrusive on-camera flash, distant sodium spill, film-noir edge light, selective cool fluorescents, heavy shadow and meaningful empty floor.
- Graphic language: editorial photography first. No type, numbers, arrows or callouts overlay the 31 narrative frames. UI-only controls are iconographic and visible on interaction/focus; screen-reader labels remain available.
- Frame count: exactly 31 individual media records, in a fixed order. Each image must be a separate independent asset, never collaged or assembled into a multi-panel contact sheet. A few transition effects may overlay two successive full-screen images without fusing assets into a contact sheet.
- No graphic violence, identifiable victim, exploitative criminal imagery, or fake official police seals.

## 31-frame story map
The following are **art-directed scene briefs**, not claims that the photographs already exist.

| # | Movement | Visual shot |
|---|---|---|
| 01 | The Arrival | Empty black hallway, razor slit of white light under door; first trace of a Melato sleeve |
| 02 | The Arrival | Flash-lit narrow stairwell, model turning away, hem suspended mid-step |
| 03 | The Arrival | One glove abandoned on polished stone; cuff stitching sharply readable |
| 04 | The Arrival | Overhead of a chair tipped back, immaculate tailored jacket occupying its seat |
| 05 | The Arrival | Reflected silhouette in fragmented mirror; face unidentifiable |
| 06 | The Arrival | Close cropped hand on doorframe, ring and cuff glinting |
| 07 | The Evidence | Flared denim seam rendered huge against wet concrete |
| 08 | The Evidence | Sunglasses on dark marble beside an empty glass and reflected window |
| 09 | The Evidence | Distinctive Melato zipper caught in a harsh evidence-like flash, without labels |
| 10 | The Evidence | Two footprints on dusty floor; broad trouser hem entering frame |
| 11 | The Evidence | A bent hanger holds an immaculate velour jacket in a stark room |
| 12 | The Evidence | Empty stair landing; long coat shadow leads beyond the photograph |
| 13 | The Witness | Portrait under harsh ceiling light; gaze refuses the camera |
| 14 | The Witness | Second model partly obscured behind translucent glass |
| 15 | The Witness | Close portrait: eyewear and collar with beautiful faithful construction |
| 16 | The Witness | Two people passing without touching, motion blur crossing crisp tailoring |
| 17 | The Witness | A single hand withdrawing behind a heavy curtain |
| 18 | The Pursuit | Extreme wide in underground parking, lone figure at far vanishing point |
| 19 | The Pursuit | Low angle of expressive trousers in motion across painted asphalt |
| 20 | The Pursuit | High-speed blurred reflection in rain-dark glass, apparel still legible |
| 21 | The Pursuit | Surveillance-like overhead composition, no fake CCTV timestamp or labels |
| 22 | The Pursuit | Cut to sharp portrait in an unlit doorway, deep breath implied |
| 23 | The Confession | Deliberately arranged shoes and belt on a hotel room floor |
| 24 | The Confession | Draped white shirt against black walls, red light barely detectable |
| 25 | The Confession | Full-length model confronting camera in an immaculate monochrome look |
| 26 | The Confession | Macro of a hand pinching a torn paper edge; no readable writing |
| 27 | The Confession | Large empty room with a model seated off-axis, face withheld |
| 28 | The Disappearance | Outerwear left hanging on a steel door handle |
| 29 | The Disappearance | Wind moves an open curtain over an abandoned chair |
| 30 | The Disappearance | Back-facing figure crossing into brutal blown-out white |
| 31 | The Disappearance | Return to the first hallway, now empty; a distinct Melato item remains |

Keep the narrative entirely visual. Internal movement titles here are production metadata and must **never appear within the editorial**.

## Prologue: the intrusion
Stage 0: immediate painted near-black page and accessible skip control. Avoid an unskippable loading screen.
Stage 1 (~0.6 seconds): a near-invisible light leak grazes the Melato emblem, which briefly appears as an embossed object on black paper.
Stage 2 (~0.5 seconds): split-second camera flash reveals the edge of frame 01, then darkness returns. No strobing/repeated flashes.
Stage 3 (~0.8 seconds): a fine slit opens vertically across the screen, expanding to reveal frame 01. Viewer can start immediately; silent by default.
The narrative has no visible introduction paragraph. If the title is visually shown, it appears only on the separate cover before frame 01, not stamped on the 31 pictures.
Respect prefers-reduced-motion: skip flashing, pans and slit animation and land immediately on frame 01. Use no audio autoplay.

## Interactive choreography
- Default one image per viewport: maintain full image, safe object positioning, no collage.
- Desktop: pointer-guided micro parallax on one lightweight foreground layer (max 8 px, disabled on touch/reduced motion); keyboard arrow navigation; subtle drag/page-curl at the edge.
- Mobile: horizontal swipe with a high-threshold gesture; vertical scrolling on surrounding page never forcibly hijacked. Fallback next/previous icon controls.
- Hover or press-and-hold: investigative spotlight reveals detail by locally lifting exposure, not by injecting captions. Pinch and double-tap reveal a zoomed true-resolution crop if supported.
- Progress: 31 hairline ticks or tiny dots, no visible numerals. The indicator may hide automatically during immersion and return on interaction.
- Progress persists in the URL hash or history state (e.g. #frame-17); direct links and browser back work. Store no personal data.
- Every frame remains viewable without animation. Preload the next frame and retain the previous, not all 31 at full size.
- End: frame 31 lingers, then a quiet dark fade returns a minimal symbol-only invitation to revisit frame 01. Do not auto-advance indefinitely.

## Commerce: opt-in, never contaminate story
- The 31 narrative frames never display product labels or prices.
- A separate, discreet bag icon outside image content can open an optional merchandise drawer AFTER intentional action; the story never requires it.
- Product mapping must be explicit and verified. Use a curated frame-ID -> Shopify product GID/handle -> exact variant mapping with human visual approval. No fuzzy matching from filename, ordering or AI title inference. Missing mappings mean NO PRODUCT LINK.
- Drawer inherits the exact frame identifier and only loads approved linked items. If unapproved, drawer remains empty with no substitute guesses.
- Keep Shopify's standard product pages and checkout. Deep-link into verified PDP when authorized.
- Analytics: anonymous frame_view, navigation_mode, intro_skip, drawer_open, verified_product_click; consent-aware and throttled. No PII.

## Architecture
- **Platform:** existing Shopify Online Store + Gelato Liquid theme, no Hydrogen migration or separate hosting.
- **Repo:** TheHighBrid/Gelato. Do not mutate the current page template during blueprint preparation.
- **Known existing main files confirmed 2026-10-14:** templates/page.living-lookbook.json -> sections/melato-living-book-vol01.liquid; linked assets melato-living-book-vol01.css and melato-living-book-vol01.js. These implement a text-heavy chapter reader with splash, page controls and product links. Retain as rollback, do NOT silently refactor in place.
- **New isolated build candidates:** sections/melato-living-book-case031.liquid; assets/melato-living-book-case031.css; assets/melato-living-book-case031.js; templates/page.living-book-case031.json.
- Build the 31 media frames as merchant-editable Shopify section blocks or a strict JSON manifest compiled into theme assets. Frame media and product relations stored separately, not hardcoded commercial guesses.
- For performance, use Shopify CDN responsive image_url/image_tag for section block media; preload the first true hero; lazy-load remaining assets; image aspect ratios and focal positions explicit. JS progressive enhancement with image-only fallback.
- Do not depend on big WebGL bundles or external tracking scripts. Use native CSS transforms, opacity and Web Animations where appropriate.
- Do not hide focus, skip links or accessibility landmarks when suppressing store chrome.
- Desktop / tablet / phone are purpose-designed, not three different story orders. Screen-reader text may identify scenes without visibly violating the wordless direction.

## Delivery workstreams
**Gate 0, repository and media audit (1–2 workdays):** inventory active branches, page template, existing 31 candidates and CDN image rights/availability; collect actual visual asset SHA, image dimensions and products. Reject mismatched scene IDs. Decide whether assets exist or must be commissioned.
**Gate 1, creative preproduction (2–4 workdays):** approve all 31 separate frame compositions, wardrobe continuity, locations and real Melato product usage; shot list and mood reference.
**Gate 2, media production (5–10 workdays if missing):** shoot / edit each frame independently in high resolution, verify labels and garment details, generate accessible scene descriptions. No grids or collages.
**Gate 3, interactive prototype (3–5 workdays):** implement isolated Liquid/CSS/JS edition and preview template on development branch.
**Gate 4, technical QA (2–3 workdays):** iOS Safari, Android Chrome, desktop Chromium/Firefox; CPU/memory; throttle network; reduced motion, VoiceOver/TalkBack, keyboard and focus management.
**Gate 5, Shopify preview release (1–2 workdays):** deploy to an unpublished Shopify theme only, test correct page and asset URLs, check zero regression outside the feature, collect visual sign-off.
**Gate 6, staged launch (1 workday after approval):** merge after CI, theme backup, controlled activation by authorized publisher, monitor Web Vitals and revert to Vol. 01 if the new experience fails.

Timings are planning estimates conditional on asset readiness and review, not confirmed dates.

## Definition of done / acceptance
1. Exactly 31 independently hosted distinct images in correct narrative order, verified against artwork and SHA inventory.
2. No visible captions, titles, numerals, product names, prices or scene explanations on narrative frames.
3. Initial image is visible fast on mid-tier mobile, no black-screen deadlock; target LCP <2.5s at p75 on monitored mobile traffic, CLS <0.1 and INP <200ms.
4. Frame navigation has no lost swipes, double-advances or disruptive vertical scroll interception; state and history consistent.
5. Intro skippable and reduced-motion compliant, sound off, motion does not cause discomfort.
6. Keyboard, screen-reader and high-contrast interaction are tested; every actionable icon has an accessible name.
7. Product drawer contains only signed-off exact product links, or none; no naming override, placeholder, or blind PDP mapping.
8. Pixel review at 390x844, 768x1024, 1440x900 and 1920x1080, plus real mobile browser testing.
9. Checkout/navigation remain independently reachable, theme outside this page unchanged.
10. CI and unpublished-theme visual QA green before publication.

## Risk register and choices
- Existing Vol.01 is text-heavy; direct modification risks breaking the working page. **Solution:** isolated page template, retain rollback.
- Archive has a history of inaccurate inferred links. **Solution:** separate immutable verified product mapping; no fallback.
- 31 huge images risk bandwidth. **Solution:** adaptive sizes, WebP/AVIF through Shopify CDN, nearby preloading only.
- Intro effects risk seizure and motion discomfort. **Solution:** at most one soft flash, no blinking sequence, reduced-motion off switch, instant skip.
- Main page and unpublished theme may differ. **Solution:** explicitly compare theme asset hashes, preview test before promotion.
- Image creation and scene selection not yet verified. **Solution:** production cannot be called complete until every shot exists and is audited.

## Work package sequence
PR A: case031 data schema and explicit asset validation tests.
PR B: accessible image-only reader, keyboard/touch/hash logic.
PR C: intro / light choreography / responsive art direction.
PR D: optional exact-link commerce drawer with mapping approval gate.
PR E: integration tests and preview-only theme wiring.
Merge only after preview comparison; activation remains a separate release gate.
