# MELATO Fragrance Product Page Bible
Version 1.0 · 2026-10-23 · Draft standard, non-deployed

## Scope and precedence
Applies to products explicitly categorized as fragrance (Eau de Parfum, Eau de Toilette, parfum, cologne, discovery sets). It supplements the global Melato commerce, accessibility, and brand standards, and replaces apparel-only Fit, Size Guide, Fabric Composition, and Care requirements for fragrance products. Never infer category solely from title or tags when a normalized product-type/metafield is available. If classification is ambiguous, flag for review rather than silently applying apparel policy.

## Required customer-facing blocks (in order)
1. **Name**: concise, fashion-literate, clever Melato name; product concentration follows as a clear descriptor, not a replacement for the name.
2. **Editorial story**: 1–3 short sentences describing verified scent character, mood and differentiating qualities; no unsubstantiated longevity or performance promises.
3. **Images**: at least two distinct high-resolution photos, e.g. full bottle and packaging/atomizer detail. Separate files, no collage; accessible alt text and zoom.
4. **Concentration, size and price**: show verified EDP/EDT/parfum designation, net volume in mL (and optionally fl oz), selected variant, availability, currency, compare-at price when on sale. Never invent concentration percentages.
5. **Purchase controls**: prominent Add to cart, visible variant selection, out-of-stock states, accessible error handling, no duplicate purchase forms.
6. **Scent profile**: top, heart and base notes, when supplier-confirmed. If a pyramid is not substantiated, use an accurate general scent description instead; do not fabricate notes.
7. **Ingredients / INCI**: full supplier-approved ingredient declaration where applicable, with allergen and regulatory statements appropriate to the destination market. Do not invent ingredients or claim safety certifications without evidence. State that package labeling should be consulted for current formulation where appropriate, without using this as a substitute for legally required online disclosures.
8. **How to use & safety**: verified application guidance and warnings, including flammability and avoiding eyes/irritated skin where applicable. Avoid medical or hypoallergenic claims without substantiation.
9. **Shipping & returns**: one concise, visible, fragrance-specific policy adjacent to CTA, linked to the current policy page. Distinguish unopened/unused eligible returns from opened or used fragrance; do not promise unconditional free returns. Shipping promises must match actual fulfillment rules and restrictions.
10. **Related fragrances**: one category-relevant carousel with unique products; no tracksuit/bestseller fallback, duplicates, or current product. Optional recently viewed section only if it adds value.
11. **Optional editorial module**: at most two supplemental blocks, and only when content warrants them. No apparel-only Complete the Set unless an actual verified fragrance companion/bundle exists.

## Mandatory admin data
Vendor Melato; normalized product type Fragrance; appropriate collections, tags, sales-channel availability, SEO title/description, handle, images/alt text, SKUs/barcodes where applicable, variants, actual stock/tracking, and product status. Store verified concentration, net volume, top/heart/base notes, ingredient list, warnings, usage, origin (if claimed), bottle/packaging details, fragrance family, palette colors, and supplier-verification state in structured metafields/metaobjects. No invented inventory: suggested default 7 is a workflow proposal, not authorization to fabricate stock.

## Dynamic visual system
Use per-product palette metafields for headings, announcement bar, sticky header and supporting surfaces with accessible contrast fallbacks. Retain an editorial luxury layout with generous whitespace, refined typography and concise copy. No hardcoded universal fragrance color.

## Theme contract
- Keep the existing canonical apparel Product Page Bible microcopy and its regression guards unchanged.
- Introduce a dedicated fragrance-specific disclosure snippet/section rendered *instead of* apparel shipping/returns for classified fragrance products; avoid CSS/JS hiding of wrong copy.
- Keep one canonical recommendation renderer with category-aware eligibility; no duplicate headings.
- Suppress garment Fit, Size Guide, fabric and laundry care on fragrance PDPs. Show fragrance notes, INCI, application and safety instead.
- Suppress empty fields and placeholders; flag missing mandatory supplier facts for remediation.
- Ensure JSON-LD Product and Offer reflect visible factual content, price, currency, availability and variants.

## Acceptance tests before release
- EDT, EDP, discovery set, and apparel control product: each receives the correct Bible and one returns disclosure.
- Unopened fragrance return language matches current store policy; no 'unworn' apparel copy on fragrance.
- No garment sizing, fabric, care or fit blocks on fragrance pages.
- Concentration, volume, price, currency, stock, CTA, notes (if verified), ingredients and warnings render correctly.
- At least two distinct images per active fragrance; no duplicates or collages.
- Recommendations are relevant, unique and exclude the current product.
- Keyboard/screen-reader interactions, mobile layouts, currency display, structured data and populated cart policy messaging tested.
- All existing apparel Product Page Bible CI guards remain green; add fragrance-specific guards rather than weakening apparel checks.
- Preview and tests required; no production deployment without explicit approval.

## Verification policy
Any claim about live compliance requires exact URL, exact rendered/parsed/source string, evidence capture and classification. Missing verification is not a passing test.

## Appendix A: Supplier-provided master technical specification (MEL-FRG-2026, revision 1.0)

**Source:** User-provided 10-page “MELATO FRAGRANCE MASTER TECHNICAL SPECIFICATION SHEET” (October 2026). These are document claims, **not independently verified laboratory findings**. The document says “Supplier: [Verified Supplier Name]” and asserts IFRA 51st Amendment compliance, France/Grasse manufacture, and FSC packaging without attaching supporting certificates, batch reports or named supplier. Do not publish those claims as independently certified. Obtain supplier identity, batch-linked INCI/COA, IFRA certificate, origin proof, flash-point report, labeling and applicable regulatory review before activation.

| Product / style | Type / claimed concentration | Claimed volume | Family | Top | Heart | Base | Claimed flash point |
|---|---|---|---|---|---|---|---|
| Petal Veil / MEL-FRG-001 | EDP 15% | 50 mL; 100 mL also listed | Floral / Soft Musk | White Peach, Pink Peppercorn, Bergamot | Peony, Jasmine Sambac, Freesia | White Musk, Cashmere Wood, Sandalwood | 42°C closed cup |
| Open Air / MEL-FRG-002 | EDT 10% | 50 mL | Fresh / Aromatic | Italian Bergamot, Grapefruit Zest, Sea Salt Accord | Rosemary, Lavender, Sage | Cedarwood, Ambergris, White Musk | 40°C closed cup |
| Silk Bloom / MEL-FRG-003 | EDP 20% | 100 mL | Warm Floral / Amber | Damask Rose, Saffron, Raspberry | Tuberose, Orange Blossom, Orris Root | Patchouli, Vanilla Bourbon, Amber, Tonka Bean | 45°C closed cup |
| Obsidian Coast / MEL-FRG-004 | EDP 18% | 100 mL | Woody / Oriental (source wording) | Black Pepper, Cardamom, Bergamot | Vetiver, Cedar, Incense | Oud Accord, Leather, Patchouli, Ambergris | 43°C closed cup |

### Supplier-provided INCI, verbatim ingredient ordering
- **Petal Veil:** Alcohol Denat., Parfum (Fragrance), Aqua (Water), Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Ethylhexyl Salicylate, Limonene, Linalool, Citronellol, Geraniol, Benzyl Salicylate.
- **Open Air:** Alcohol Denat., Parfum (Fragrance), Aqua (Water), Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Ethylhexyl Salicylate, Limonene, Linalool, Citral, Coumarin.
- **Silk Bloom:** Alcohol Denat., Parfum (Fragrance), Aqua (Water), Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Ethylhexyl Salicylate, Limonene, Linalool, Citronellol, Geraniol, Benzyl Salicylate, Coumarin, Eugenol.
- **Obsidian Coast:** Alcohol Denat., Parfum (Fragrance), Aqua (Water), Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Ethylhexyl Salicylate, Limonene, Linalool, Coumarin, Eugenol, Citral, Geraniol.

### Bottle, allergen and storage claims
- **Petal Veil:** heavy-wall clear glass, matte white cap; allergens Limonene, Linalool, Citronellol, Geraniol, Benzyl Salicylate.
- **Open Air:** heavy-wall clear glass, matte silver cap; allergens Limonene, Linalool, Citral, Coumarin.
- **Silk Bloom:** heavy-wall clear glass, matte black cap; allergens Limonene, Linalool, Citronellol, Geraniol, Benzyl Salicylate, Coumarin, Eugenol.
- **Obsidian Coast:** smoked black glass, matte gold cap; allergens Limonene, Linalool, Coumarin, Eugenol, Citral, Geraniol.
- **All four:** document says store away from direct sunlight and heat, keep upright; do not freeze, avoid eye contact, flammable. Packaging is described as rigid FSC-certified paper box with magnetic closure and shrink-wrap; claimed shelf life is two years from production.

### Catalog update gate
All four product records remain **PENDING_SUPPLIER_VERIFICATION**. Prepare structured metafield import proposals for product handle, style code, scent family, note pyramid, INCI, allergen list, concentration, volume, bottle, flash point, storage, warnings and evidence status. **Do not write Shopify Admin metafields, change inventory, publish certification/origin/FSC claims, or invent variants.** Check actual 100 mL Petal Veil variant before creating or displaying it. Map source claims to fields only after validation against actual product labels and supplier documentation.
