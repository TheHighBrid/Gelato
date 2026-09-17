# Melato FW26 Tracksuit Verified Data

Status: Compliance-verified source of truth
Document refs: MLT-TECH-FW26 / MLT-SPEC-FW26
Issue date: 2026-09-16
Revision: C
Batch: FW26-C1

This file is the authoritative catalog-data reference for Melato FW26 tracksuit PDPs. Do not infer alternate fabrics, GSM, colourways, fit language, or care instructions from older Shopify metafields, descriptions, cached storefront pages, or model-generated documents.

## Shopify PDP field mapping

Customer-facing apparel disclosures are populated from:

- Material: `custom.material_composition`
- Fit: `custom.fit_notes`
- Care: `custom.care_instructions`
- Care fallback where Shopify category constraints block `care_instructions`: `custom.care_notes`
- Bible marker: `custom.pdp_bible_version = 1.0`

The canonical renderer `sections/melato-product-page-rebuild.liquid` reads `care_instructions`, then approved fallbacks including `care_notes`.

## Platform specifications

### Standard velour

- Composition: 80% cotton / 20% polyester
- Fabric: premium knitted velour, cotton-face/poly-back, sheared pile
- Weight: 320 +/-5% GSM
- Pile: 1.2-1.6 mm
- Rib trims: 95% cotton / 5% elastane, 260 GSM
- Fit: relaxed Melato track fit, true to size. Jacket has a straight torso fall, dropped shoulder and stand collar. Pant is relaxed through the thigh with a gentle taper and ribbed ankle.

### Stretch velour

- Composition: 78% cotton / 18% polyester / 4% elastane
- Weight: 340 +/-5% GSM
- 4-way mechanical stretch
- Rib trims: 95% cotton / 5% elastane, 260 GSM
- Applies to MLT-TS-004 and MLT-TS-015.

### Bamboo interlock

- Composition: 60% bamboo viscose / 35% organic cotton / 5% elastane
- Weight: 280 +/-5% GSM
- Fabric: bamboo-cotton interlock, peached hand-feel, moisture-wicking
- Rib trims: 95% cotton / 5% elastane, 260 GSM
- Applies to MLT-TS-007.

### Satin

- Composition: 92% polyester / 8% elastane
- Weight: 220 +/-5% GSM
- Fabric: brushed-back satin track cloth, charmeuse-face
- Rib trims: 95% cotton / 5% elastane, 260 GSM
- Applies to MLT-TS-012, MLT-TS-016 and MLT-TS-023.

## Care standard

Use this exact customer-facing care instruction unless a later signed production revision supersedes Revision C:

`Machine wash cold, gentle cycle, 30°C, inside out. Do not bleach. Hang dry; do not tumble dry. Do not dry clean. Low iron at 110°C inside out; do not steam over embroidery.`

## FW26 style index

| Code | Style | Platform | Fixed colourway |
| --- | --- | --- | --- |
| MLT-TS-001 | Divididos Velour Tracksuit Set | Velour | Ink Black / Oxblood / Cream / Deep Navy / Dusty Pink |
| MLT-TS-002 | Passion Fruit Velour Tracksuit Set | Velour | Burnt Orange / Cream / Espresso |
| MLT-TS-003 | Chi Velour Tracksuit Set | Velour | Deep Navy / Crimson / Cream |
| MLT-TS-004 | Cho Velour Tracksuit Set | Stretch Velour | Jet Black / Charcoal |
| MLT-TS-005 | Conquista Velour Tracksuit Set | Velour | Burgundy / Gold-tone Cream |
| MLT-TS-006 | Ojos Velour Tracksuit Set | Velour | Black / Wine |
| MLT-TS-007 | Reliance Bamboo Tracksuit Set | Bamboo Interlock | Sage / Stone |
| MLT-TS-008 | Aurelia Velour Tracksuit Set | Velour | Golden Aurelia / Ivory Laurel |
| MLT-TS-009 | Agape Velour Tracksuit Set | Velour | Royal Amethyst / Soft Rose |
| MLT-TS-010 | Clockout Velour Tracksuit Set | Velour | Burnt Copper / Black / Burgundy |
| MLT-TS-011 | CRSH Theory Velour Tracksuit Set | Velour | Black / Wine Red / Dusty Lilac |
| MLT-TS-012 | Rossoneiri Satin Tracksuit Set | Satin | Rosso Red / Onyx |
| MLT-TS-013 | Black Cherry Velour Tracksuit Set | Velour | Black Cherry / Deep Plum |
| MLT-TS-014 | Hargneux Velour Tracksuit Set | Velour | Noir / Bleu de Minuit |
| MLT-TS-015 | Midas Runner Tracksuit Set | Stretch Velour | Gilt Gold / Black |
| MLT-TS-016 | Ovum Satin Tracksuit Set | Satin | Ivory / Champagne |
| MLT-TS-017 | Registration Velour Tracksuit Set | Velour | Registry Black / Stamp Red |
| MLT-TS-018 | Reasonable Doubt Velour Tracksuit Set | Velour | Court Blue / Cream |
| MLT-TS-019 | Ki Meridian Velour Tracksuit Set | Velour | Meridian Teal / Black |
| MLT-TS-020 | Structure in Silence Velour Tracksuit Set | Velour | Quiet Grey / Ivory |
| MLT-TS-021 | Ovum Velvet Tracksuit Set - Forest / Cream | Velour | Forest Green / Cream |
| MLT-TS-022 | Ovum Velvet Tracksuit Set - Umber / Emerald | Velour | Umber / Emerald |
| MLT-TS-023 | Ovum Satin Tracksuit Set - Pearl | Satin | Pearl White / Champagne |
| MLT-TS-024 | Dragon Ledger Tracksuit Set | Velour | Dragon Red / Ledger Gold |
| MLT-TS-025 | Forest Script Tracksuit Set | Velour | Forest / Cream |
| MLT-TS-026 | Crimson Confession Wine & Rose Zip-Up Set | Velour | Wine / Rose |
| MLT-TS-027 | Midnight Scribe Caramel Calligraphy Tracksuit Set | Velour | Midnight / Caramel |

Every colourway above is fixed. Do not generate or advertise unspecified colour variants.

## Midas Runner fit exception

MLT-TS-015 uses the Stretch Velour platform and a performance-cut Melato track fit. The pant is relaxed through the thigh with articulated knees and zip ankles.

## Canadian label compliance note

For Canadian sale, an FTC RN number alone is not sufficient dealer identity. Use a Canadian CA number or the dealer name and full postal address as required. Fibre content on permanent labels must be bilingual English/French. Storefront PDP copy and sewn-label copy are separate compliance surfaces and must not be conflated.

## Data integrity rule

Older values such as 70/25/5 bamboo at 300 GSM, 78/22 polyamide performance knit for Midas Runner, 97/3 satin at 200 GSM, 95/5 satin at 210 GSM, 85/15 velour, 92/8 polyester velour for Ojos, or 300/310/330/340 GSM standard velour are superseded for FW26 by Revision C above.
