# MELATO PRODUCT PAGE BIBLE

**Status:** MANDATORY  
**Version:** 1.0.0  
**Adopted:** 2026-09-08  
**Applies to:** every new Melato product, every future PDP change, and every legacy-product migration  
**Authority:** this file plus `config/melato-product-page-bible.json`

This is the single product-page standard for Melato. Shopify Admin, the Gelato theme, GitHub automation, manual product entry, and autonomous agents must follow it exactly.

If another document, old product, theme setting, prompt, model output, or legacy metafield conflicts with this Bible, this Bible wins.

No agent may invent a second structure, alternate naming convention, duplicate field, or category-specific copy system.

---

## 1. NON-NEGOTIABLE PRINCIPLES

1. **One fact, one owner.** A fact is stored once in its canonical field. It may be rendered in one appropriate place. Do not restate it elsewhere.
2. **No invented facts.** Never infer fiber percentages, manufacturing country, fit measurements, ingredients, certifications, technical protection, weight, performance, or construction details from an image.
3. **Minimal copy.** Every sentence must add information. Remove adjectives that do not add meaning.
4. **No claim stacking.** Do not write strings such as "premium luxury high-quality best-in-class." Use at most one quality descriptor when it materially improves the sentence.
5. **No duplicate reassurance.** A trust claim such as secure checkout, complimentary delivery, returns, limited production, or shipping speed appears once per PDP unless a functional checkout control requires otherwise.
6. **No section duplication.** Fit belongs in Fit. Fiber content belongs in Material. Cleaning belongs in Care. Construction belongs in Construction. Story does not repeat these sections.
7. **No empty sections.** A section renders only when its category requires it and valid content exists, except structural controls such as price, variants, recommendations, and recently viewed.
8. **No placeholder copy on live products.** Never publish "TBD," "Coming soon," "Material unknown," generic AI filler, or guessed specifications.
9. **Canonical data beats legacy data.** Legacy fields may be read as temporary migration fallbacks. New products must never write to legacy aliases.
10. **Melato stays Melato.** Vendor is always `Melato`.

---

## 2. DATA OWNERSHIP

Melato uses three data layers. Do not duplicate the same fact across layers.

### 2.1 Shopify Product Category and category metafields

Shopify taxonomy is the canonical source for taxonomy facts whenever the selected product category exposes them.

Use native category metafields for applicable attributes including:

- Color
- Fabric
- Care instructions
- Target gender
- Sleeve length type
- Neckline
- Activewear clothing features
- Activity
- Fit
- Pants length type
- Waist rise
- Bag closure
- Other category-specific Shopify taxonomy attributes

**DO:** select the most specific correct Shopify Product Category before completing category metafields.

**DO NOT:** create a custom product metafield that duplicates a category attribute solely because it is easier to find.

### 2.2 Melato Product Specification metaobject

`melato_product_specification` is the canonical technical evidence record. Use it for verified facts that require traceability or structured depth.

Canonical fields include:

- product type
- category
- design story
- construction
- main fabric
- main composition
- contrast fabric
- contrast composition
- trim materials
- fit
- fit notes
- colors
- palette
- care
- measurements
- country of origin
- finished weight
- model fit context
- technical compliance
- evidence sources
- verified at

`custom.product_specification` links the Shopify product to this metaobject.

**DO:** populate evidence-backed values only.

**DO NOT:** put marketing filler into technical evidence fields.

### 2.3 Product metafields in namespace `custom`

Product metafields control presentation, PDP relationships, and concise product-specific copy.

The canonical new-product keys are:

| Key | Type | Purpose |
|---|---|---|
| `subtitle` | single line text | Optional one-line PDP hook |
| `background_hex_color_code` | color | Product-aware announcement and header background seed |
| `foreground_hex_color_code` | color | Product-aware foreground seed |
| `palette_1` | color | Primary product palette color |
| `palette_2` | color | Secondary product palette color |
| `palette_3` | color | Tertiary product palette color |
| `fit_notes` | multi-line text | Concise customer fit guidance |
| `material_composition` | multi-line text | Customer-facing verified material composition |
| `care_instructions` | multi-line text | Customer-facing care instructions |
| `construction` | list of single line text | Verifiable construction facts |
| `ingredients` | multi-line text | Fragrance/cosmetic ingredient or note information when applicable |
| `use` | multi-line text | Product use instructions when applicable |
| `made_in` | single line text | Verified country of origin only |
| `size_guide` | page reference | Relevant Melato fit/size guide page |
| `companion_product` | product reference | Single matching piece used by Complete the Set |
| `related_products` | list of product references | Curated You Might Also Like override |
| `material_profile` | single line text | Short controlled material family such as Velour, Denim, Satin |
| `pdp_bible_version` | single line text | Bible version applied to the product |

### 2.4 Legacy aliases

These fields exist in historical data but are **for migration fallback only**:

- `fit`
- `care`
- `care_notes`
- `composition`
- `fabric_composition`
- `matching_product`
- `matching_piece`
- `set_partner`
- `bar_bg`
- `bar_fg`

New products and new automation must not write them.

Migration priority is always:

1. canonical key
2. verified Product Specification value
3. legacy alias
4. render nothing

Never merge conflicting values automatically. Conflict means human/agent evidence review is required.

---

## 3. PRODUCT CREATION ORDER

Every product is created in this exact order:

1. Name
2. Shopify Product Category
3. Vendor
4. Product type
5. Collection membership
6. Story/description
7. Options
8. Variants and sizes
9. Price
10. Inventory
11. Media
12. Category metafields
13. Product metafields
14. Product Specification link
15. Related/companion products
16. Tags
17. SEO
18. Sales channels/publications
19. Catalogues
20. PDP QA
21. Publish

A product does not become ACTIVE until all mandatory category requirements pass.

---

## 4. PRODUCT NAME

### 4.1 Melato naming standard

Melato product names use concise, dark-witted wordplay built around double entendre, paronomasia, idiom subversion, semantic inversion, homophones, lexical fusion, and cultural allusion.

The naming style takes familiar phrases, expressions, and terminology, then alters or recontextualizes them through fashion, tailoring, material, color, or product-specific language. Legal, criminal, psychological, romantic, bureaucratic, and noir vocabulary are recurring reference worlds.

Humor stays dry and intelligent, never goofy. The strongest name feels familiar but slightly tampered with. Wordplay should connect to a real product characteristic whenever possible.

Preferred devices:

- double entendre
- idiom twist
- homophonic substitution
- paronomasia
- portmanteau
- metaphor
- irony
- semantic collision
- deadpan incongruity
- cultural or geographic allusion

The result must feel clever on first read and smarter on the second: short, memorable, fashion-literate, slightly dark, and recognizably Melato.

Reference names include Baggage Claim, Gilt Trip, Interior Motive, Protective Custody, 9 to Noir, Knotorious, Sheer Necessity, Red Handed, Pinkognito, Pleat Your Case, Off-The Cuff, Pressing Matter, CHŪ, Chō, Riyū, Barolo, Ojos, CasaNegra, Casablanca, Kech, Taqburni, Albumen, Hendrix, Berry, Rosetta, Reliance, Conquista, Passion Fruit, Divididos, Side Note, Dirt Rich Denim, Olive Affaire, Ivy Trellis, Ruby Labyrinth, Rosewood Checkboard, Cognac Confession, Emerald Solstice Tile, Dawn-to-Dusk, Bluefin, Smoke Signal, Sunset Deposition, Rex X, Sheer Will, Piccolo, Merlot, Brow, Blue Me Away, Cold Shoulder, Ki, Detour Tee, Vision Moto, Atlas, OVUM, Nuit Blanche, Mint Condition, Bon Courage Blush, Warped Memory, Rossoneri, Obsidian Coast, Silk Bloom, Open Air, Petal Veil, Alabaster, Double Standard, Moula Caramel, Taupe Secret, Off-White Lie, Noir Memoir, Salopette de Salo, Body Language, Hargneux, Aurelia, Agapé, and Crème Brûlée.

### 4.2 Naming rules

**DO**

- Use a distinctive core name plus a clear product descriptor when clarity needs it.
- Tie wordplay to material, silhouette, construction, color, function, geography, or collection logic where possible.
- Reuse a core name only for an intentional family or set.
- Preserve intentional accents, diacritics, and non-English words accurately.

**DO NOT**

- force a pun that sounds juvenile
- copy another brand's product name
- use generic SEO sludge such as "Luxury Premium Designer Black Jacket"
- use five adjectives before the product type
- use all caps as a naming gimmick
- call unrelated products by the same core name

**Preferred structure:** `[Melato core name] [clear product descriptor]`

Examples: `Protective Custody Vest`, `Gilt Trip Rimless Sunglasses`, `Nuit Blanche Zip Flare Jean`.

---

## 5. STORY / DESCRIPTION

The description is short, factual, atmospheric, and useful.

### Required format

- 1 paragraph
- 2 to 4 sentences
- target 35 to 80 words
- never exceed 110 words without owner approval

### Content order

1. What the product is.
2. What visually or conceptually distinguishes it.
3. How it wears, carries, or functions if that adds useful information.

### Language rule

Use concrete nouns and verbs first. One premium descriptor is enough.

Allowed when true and useful: `premium`, `refined`, `distinctive`, `high-quality`, `sculpted`, `structured`, `soft`, `dense`, `lightweight`, `limited`.

Use `luxury` as brand positioning, not as a substitute for specifications.

Do not use `best`, `perfect`, `top shelf`, `world-class`, `unmatched`, `ultimate`, or other absolute superiority claims unless the statement is objectively provable. These words age badly and weaken premium copy.

The Story must not repeat composition percentages, washing instructions, shipping terms, or the Fit paragraph.

---

## 6. OPTIONS, SIZES, AND VARIANTS

### 6.1 Option names

Use only customer-readable option names:

- `Size`
- `Color`
- `Volume`

Do not use `Option 1`, `Style 1`, internal factory codes, or inconsistent synonyms.

### 6.2 Size vocabulary

Use exact display values.

**Alpha apparel:** `XS`, `S`, `M`, `L`, `XL`, `XXL`

**Waist sizing:** `28`, `29`, `30`, `31`, `32`, `34`, `36`, `38`, `40`

**Footwear:** `6`, `6.5`, `7`, `7.5`, `8`, `8.5`, `9`, `9.5`, `10`, `10.5`, `11`, `11.5`, `12`

**Universal:** `ONE SIZE`

**Fragrance/volume:** use metric first, with a space: `10 mL`, `30 mL`, `50 mL`, `100 mL`. An imperial equivalent may appear in supporting copy, not as a second variant name unless physically packaged/sold that way.

Do not mix `Small` with `S`, `OS` with `ONE SIZE`, or `10ML` with `10 mL` on the same store.

### 6.3 Color names

Customer-facing color names may be Melato-coded, but must remain understandable. Use the Shopify color taxonomy to preserve machine-readable base color.

Example: customer colorway `Noir Alibi`, taxonomy base color `Black`.

### 6.4 Sold-out variants

Sold-out sizes and colors remain visible but disabled. Never hide a sold-out size unless the variant is permanently discontinued and intentionally removed from the product.

### 6.5 Inventory default

If inventory is not supplied, set **7 available units per sellable variant** at the active fulfillment location.

Inventory tracking must be enabled for every physical product variant.

Do not silently assign 7 when an actual inventory count or supplier quantity is known.

---

## 7. PRICE

Price is mandatory before ACTIVE publication.

- Use CAD store pricing as the source price.
- Do not use fake compare-at prices.
- A compare-at price is allowed only when a genuine former/current reference price exists and the promotion is legitimate.
- Do not place marketing sentences next to the price that repeat information found in Shipping & Returns.

---

## 8. PRODUCT PHOTOGRAPHY

Every product needs at least **2 distinct photo styles** from the approved list before publication.

Approved styles:

1. Front
2. Back
3. Macro / Close-up
4. Side
5. Inside Look
6. Model Posing

### Category expectations

- Apparel: Front + Back are the preferred minimum.
- Bags/accessories: Front + detail/side are the preferred minimum.
- Footwear: Side + top/front or outsole/detail are the preferred minimum.
- Fragrance: Front + detail/macro are the preferred minimum.

More angles are encouraged when they reveal new information. Do not add near-duplicate images solely to inflate the gallery.

### Melato product-photo standard

- One image per file.
- No collage, grid, diptych, triptych, contact sheet, or multi-panel file.
- Product geometry, logo placement, trim, embroidery, hardware, color, and construction must remain accurate.
- Product-only apparel images use no ghost mannequin unless specifically authorized for that product.
- Product gallery should mix clean product evidence with editorial/model imagery when available.

### Alt text

Format: `[Product Name] - [View Type] - [Colorway]`

Example: `Nuit Blanche Zip Flare Jean - Back - Midnight Indigo`.

Do not keyword-stuff alt text.

---

## 9. PRIMARY PDP STRUCTURE

All PDPs use the same page skeleton. Category logic decides which technical disclosures appear inside it.

### Fixed top-to-bottom order

1. Product media gallery
2. Product name
3. Price
4. Options / sizes / variants
5. Add to cart / checkout controls
6. Shipping & Returns microcopy
7. Story
8. Category-required technical sections
9. Complete the Set when a companion product exists
10. You Might Also Like
11. Recently Viewed
12. Contextual merchandising modules, maximum 2
13. Footer

Do not reorder this per product for aesthetic experimentation.

---

## 10. CATEGORY SECTION MATRIX

A category gets the following sections. Do not improvise.

| Product family | Required customer-facing technical sections | Conditional sections |
|---|---|---|
| Apparel | Material, Care, Fit | Construction, Complete the Set |
| Denim | Material, Care, Fit, Construction | Complete the Set |
| Footwear | Material, Care, Fit, Construction | Complete the Set |
| Bags | Material, Care | Construction, Use |
| Accessories | Material, Care | Construction, Fit, Use |
| Fragrance | Ingredients, Use | none of Material, Care, Fit, Construction unless genuinely applicable |
| Other | Material/Composition when applicable | Care, Fit, Construction, Use only when applicable |

### 10.1 Fit

- Use `custom.fit_notes` first.
- Link the section to `custom.size_guide` when present.
- If no product-specific size guide exists for apparel/footwear, use the canonical Melato Fit Guide page.
- Fit describes sizing and silhouette only.
- Do not repeat fiber content, care, or construction here.

### 10.2 Material

- Use `custom.material_composition` for concise customer-facing composition.
- Back it with Product Specification evidence.
- Percentages must total correctly when percentages are stated.
- Do not use vague filler such as "premium blend" when exact composition is known.

### 10.3 Care

- Use `custom.care_instructions`.
- Give actions only: wash, temperature, drying, ironing, bleaching, dry cleaning, storage when relevant.
- Do not repeat material composition.

### 10.4 Construction

- Use `custom.construction`.
- List only visible or verified construction facts such as seam architecture, lining, closure, zipper, paneling, pocket construction, embroidery method, hardware, or finish.
- No storytelling sentences.

### 10.5 Ingredients

Fragrance/cosmetic only unless another category legally or functionally requires it.

Do not invent a full INCI list from scent notes. If legal ingredient data is unavailable, use verified fragrance-note information under a clearly appropriate label and do not mislabel notes as ingredients.

### 10.6 Use

Use only when a customer benefits from instructions, application guidance, adjustment, opening/closing, storage, or functional direction.

---

## 11. SHIPPING & RETURNS

One concise customer-facing Shipping & Returns message is allowed on the PDP.

Canonical storefront copy:

`Ships in 1 to 3 business days. Complimentary delivery on all orders. Returns accepted on eligible unworn items under the posted return policy.`

If policy changes globally, update the single canonical theme source and this Bible together. Do not override shipping or return policy per product unless a product has a genuine exception that is clearly documented.

Never repeat `secure checkout`, `complimentary delivery`, or the return promise elsewhere on the same PDP as generic trust filler.

---

## 12. COMPLETE THE SET

`custom.companion_product` is the only canonical new-product relationship for a single matching piece.

Use it for:

- track jacket + matching track pant
- coordinated top + bottom
- intentional two-piece set
- garment + explicitly designed companion

Do not use Complete the Set for merely similar products.

Legacy relationship keys may be read during migration only.

---

## 13. YOU MIGHT ALSO LIKE

This section is mandatory.

Priority:

1. `custom.related_products` when populated
2. Shopify product recommendations when not populated

Show up to 4 products.

Rules:

- Never include the current product.
- Prefer in-stock products.
- Do not duplicate the Complete the Set companion in the first recommendation slot when alternatives exist.
- Recommendation title is always `You might also like`.

---

## 14. RECENTLY VIEWED

This section is mandatory and follows You Might Also Like.

Title is always `Recently viewed`.

Do not rename it per campaign.

---

## 15. CONTEXTUAL MERCHANDISING BEFORE FOOTER

Approved collection modules only:

- New Arrivals
- Accessories
- Fragrance
- Bags
- Denim
- The Uniform

Maximum: **2 modules total**.

### Deterministic density rule

Count the customer-facing enrichment sections rendered from this list:

`Material`, `Care`, `Fit`, `Construction`, `Ingredients`, `Use`, `Complete the Set`.

- If 4 or more are rendered: add exactly **1** contextual merchandising module.
- If 3 or fewer are rendered: add exactly **2** contextual merchandising modules.

### Deterministic module selection

- Fragrance: `New Arrivals`, then `Accessories`
- Bags/Accessories: `New Arrivals`, then `The Uniform`
- Denim: `New Arrivals`, then `The Uniform`
- The Uniform / tracksuit products: `New Arrivals` only when density rule allows 1; if rule allows 2, add `Accessories`
- Other apparel: `New Arrivals`, then `Accessories`
- Footwear: `New Arrivals`, then `The Uniform`
- Other: `New Arrivals`, then `Accessories`

If a required collection does not exist or has zero available products, skip it and use the next eligible approved module in this fallback order:

`New Arrivals` -> `Accessories` -> `The Uniform` -> `Denim` -> `Bags` -> `Fragrance`.

Never show the current product inside these modules.

---

## 16. DYNAMIC PRODUCT COLOR SYSTEM

The product page uses the product itself as the color source.

### Canonical color fields

1. `custom.background_hex_color_code`
2. `custom.foreground_hex_color_code`
3. `custom.palette_1`
4. `custom.palette_2`
5. `custom.palette_3`

All values must be valid 6-digit hex colors stored through Shopify's `color` type.

### Announcement bar

- Background is seeded by `background_hex_color_code` when present.
- Foreground is seeded by `foreground_hex_color_code` when present.
- Palette 1, 2, and 3 may rotate as product-aware accents.
- Foreground contrast must remain readable at every state.
- Dynamic rotation is disabled for `prefers-reduced-motion: reduce`.

### Sticky header

On product pages, the sticky header may receive a restrained product tint derived from the active safe palette color.

Rules:

- preserve legibility before decoration
- never use a fully saturated product color as the entire sticky header background
- transitions must be smooth and non-flashing
- navigation text/icons must retain accessible contrast

### Section titles

Product technical section titles use the current safe product accent.

Rules:

- title color may use Palette 1, 2, or 3 only when contrast against the section surface is at least 4.5:1
- otherwise use the explicit foreground color
- otherwise use the theme's safe text color
- do not color entire paragraphs with the accent
- do not assign random per-section colors

The same palette engine must serve announcement bar, sticky header tint, and section-title accent. Do not build separate competing color systems.

---

## 17. CATEGORY, COLLECTION, VENDOR, TYPE

### Product Category

Mandatory. Select the most specific Shopify taxonomy category that truthfully describes the product.

### Collection

Every ACTIVE product must belong to its intended Melato merchandising collection(s). Collection membership is not replaced by tags.

### Vendor

Always exactly: `Melato`

### Product type

Use one singular, clear, shopper-readable type. Do not create plural/synonym duplicates for the same thing.

Examples: `Track Jacket`, `Track Pant`, `Jean`, `Dress`, `Bag`, `Fragrance`, `Sunglasses`, `Tie`, `Suspender`, `Footwear`.

New product types are allowed only when the existing list cannot truthfully classify a genuinely new product category. Do not invent a new type for a colorway, collection, fabric, or campaign.

---

## 18. CATEGORY METAFIELDS

Complete every relevant Shopify category metafield exposed by the selected Product Category when the fact is known.

Do not fill irrelevant fields merely to make the admin look complete.

Examples:

- Target gender: set when applicable
- Sleeve length: set for tops/jackets when applicable
- Neckline: set for garments where neckline is meaningful
- Fabric: set to the actual primary fabric family
- Care instructions: set to verified taxonomy values
- Activity: use only when the product is genuinely designed for that activity
- Activewear clothing features: use only for real functional features

Empty is better than fabricated.

---

## 19. METADATA, METAOBJECTS, AND METAFIELDS

### Required metadata discipline

- No duplicate custom metafield definitions for the same concept.
- No new metafield without a defined owner, type, renderer, and migration purpose.
- Storefront-readable PDP fields must have storefront read access when the renderer needs Storefront API access.
- Internal evidence fields remain internal when they do not need storefront exposure.
- Product Specification is the preferred structured technical metaobject.

### Bible stamp

Every new product must set:

`custom.pdp_bible_version = 1.0.0`

This stamp means the product was created or migrated against this standard. It is not customer-facing.

---

## 20. TAGS

Tags are for automation, collections, search, and operational grouping. They are not a second product database.

Use controlled lower-case tags where automation requires them.

Preferred prefixes:

- `category_`
- `gender_`
- `collection_`
- `fit_`
- `fabric_`
- `set_`
- `accent_`
- `pdp_`

Do not add six synonyms such as `pants`, `pant`, `trouser`, `trousers`, `bottom`, `bottoms` to make discovery work. Fix the collection/category logic instead.

Do not encode copy, long sentences, shipping policy, or SEO paragraphs as tags.

---

## 21. SEO

Every ACTIVE product requires SEO title and meta description.

### SEO title

Preferred structure:

`[Product Name] | [Product Type] | Melato`

Keep it natural and normally within 60 characters. If the branded product name already contains the type, do not repeat it.

### Meta description

- target 140 to 160 characters
- describe the actual product
- include one meaningful material/silhouette/function cue when verified
- end naturally with Melato only if space permits
- no keyword list
- no fake scarcity
- no ALL CAPS

SEO copy may clarify search intent but must not rewrite the visible product title into generic keyword soup.

---

## 22. PUBLISHING CHANNELS AND CATALOGUES

Every new ACTIVE product must be published to **all available eligible sales channels/publications**.

If a channel rejects the product because the category is ineligible, record the channel exception. Do not silently leave an eligible channel unpublished.

Catalogues:

- include the product in every catalogue for which it is eligible and intentionally sold
- never use catalogue exclusion as a substitute for inventory status
- keep market-specific restrictions only when commercially or legally required

---

## 23. LANGUAGE SYSTEM

### Use

- short sentences
- concrete product nouns
- exact materials and construction terms
- restrained fashion vocabulary
- dry Melato wit in names and occasional story language

### Avoid

- repeated reassurance
- filler headings such as `Why you'll love it`
- fake technicality
- breathless hype
- SEO keyword stuffing
- generic AI phrases
- repeating the product name in every paragraph
- describing the same silhouette in Story, Fit, Material, and Construction

### One-purpose rule

Each section answers one question:

- Story: What is it and why does it exist?
- Fit: How does it fit?
- Material: What is it made from?
- Construction: How is it built?
- Care: How is it maintained?
- Ingredients: What is in it?
- Use: How is it used?
- Shipping & Returns: What happens after purchase?

If a sentence answers a different section's question, move it.

---

## 24. DO / DON'T MASTER LIST

### DO

- follow this exact section order
- use Shopify taxonomy first for taxonomy facts
- use Product Specification for verified technical evidence
- use canonical custom metafields for storefront presentation
- keep relationship logic to `companion_product` and `related_products`
- provide at least 2 distinct approved photo styles
- track physical inventory
- default to 7 units per variant only when no real count is provided
- publish to all eligible channels
- use all applicable category metafields
- use palette fields to create restrained product-aware color behavior
- verify contrast
- keep sold-out variants visible but disabled
- set `pdp_bible_version`

### DON'T

- invent facts
- publish empty placeholders
- write new data to legacy metafield aliases
- create duplicate trust bars
- repeat shipping, returns, or checkout claims
- hide information in the Story that belongs in a technical section
- build a second color engine
- publish fewer than 2 meaningful product views
- create a collage as a product image
- use a ghost mannequin by default
- make all pages visually identical by ignoring product palettes
- make all pages visually chaotic by allowing random colors
- create unnecessary product types or tag synonyms
- publish before SEO, inventory, media, category, and required PDP fields pass QA

---

## 25. PDP QA GATE

A product may be ACTIVE only when all applicable checks pass.

### Universal gate

- [ ] Name follows Melato naming standard
- [ ] Vendor is `Melato`
- [ ] Most specific truthful Shopify Product Category selected
- [ ] Product type is singular and standardized
- [ ] Intended collection(s) assigned
- [ ] Story is 35 to 80 words unless justified
- [ ] Price is present
- [ ] Options use canonical names
- [ ] Variant size values use canonical vocabulary
- [ ] Physical inventory tracking enabled
- [ ] Inventory count supplied or defaulted to 7 per variant
- [ ] At least 2 distinct approved photo styles exist
- [ ] Image alt text follows format
- [ ] All known applicable category metafields completed
- [ ] Product Specification linked when technical evidence exists
- [ ] Required category technical sections have verified content
- [ ] Shipping & Returns appears once
- [ ] Complete the Set appears only with a true companion
- [ ] You Might Also Like appears
- [ ] Recently Viewed appears
- [ ] Contextual merchandising obeys the 1/2-module density rule
- [ ] Palette colors are valid and contrast-safe
- [ ] SEO title and meta description completed
- [ ] Product is added to every eligible publication/channel
- [ ] `custom.pdp_bible_version` equals `1.0.0`
- [ ] No duplicate claims or duplicated section content
- [ ] No unsupported superlatives or invented facts

---

## 26. AGENT CONTRACT

Any autonomous agent touching Melato product creation, product editing, PDP theme code, metafields, metaobjects, variants, inventory, SEO, tags, collections, publications, or product media must:

1. read this Bible first
2. read `config/melato-product-page-bible.json`
3. inspect current Shopify data before writing
4. prefer canonical fields
5. preserve verified existing facts
6. never convert legacy aliases into new write targets
7. run the repository Bible validator before proposing merge
8. report any unresolved data conflict instead of guessing

This applies equally to OpenAI models, Claude/Sonnet/Haiku, Grok, Manus, Shopify automation, GitHub-connected automation, local scripts, and manual work.

---

## 27. CHANGE CONTROL

This Bible is intentionally difficult to drift.

Any change to the following requires an owner-reviewed Pull Request and a semantic version bump:

- canonical field names
- section order
- category matrix
- merchandising algorithm
- naming rules
- shipping/returns canonical copy
- color contract
- QA gate

New products must follow the current version. Legacy products are migrated forward, never used as precedent to weaken the standard.
