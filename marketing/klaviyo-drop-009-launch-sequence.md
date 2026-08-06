# MELATO DROP 009 · KLAVIYO LAUNCH PACK

Status: production-ready copy and campaign specification
Timezone: America/Toronto
Launch time convention: **8:00 PM ET**. Use ET rather than EST so daylight-saving time is handled correctly.

## Audience and tracking

- **VIP waitlist:** profiles carrying `back-in-stock` or a Drop 009 VIP tag.
- **Engaged audience:** opened or clicked within 120 days and not suppressed.
- **Recent buyers:** exclude buyers from the previous 7 days from the broad teaser unless cross-sell is intentional.
- **Restock targeting:** use the generated `BIS Product Handle`, `BIS Variant ID`, and `BIS SKU` customer tags for product-specific sends.
- **UTM pattern:** `utm_source=klaviyo&utm_medium=email&utm_campaign=drop-009-[teaser|live|scarcity]&utm_content=[hero|primary-cta]`.
- **Primary landing page:** The Living Book chapter or the final verified Drop 009 collection URL.

> The native Shopify waitlist captures and tags demand. An automated restock email still requires a Klaviyo or Shopify Flow workflow that reacts to those tags and verified inventory changes.

---

## EMAIL 1 · T−72 HOURS · THE TEASER

**Campaign name:** `DROP 009 · T-72 · Teaser`

**Subject A:** Drop 009: Formed with intent.

**Subject B:** Preliminary access layout. Limited run.

**Preview text:** 72 hours until allocations open. Heavyweight bamboo and velour silhouettes.

**Hero direction:** High-contrast macro image of fabric weave, embroidery, hardware, or seam construction. One image, no collage.

### Copy

**THE CULTURE WEARS US.**

**72 HOURS UNTIL CAPSULE ALLOCATION.**

Drop 009 is built around high-density bamboo interlock and custom-milled velour uniforms, developed for structure, movement, and a controlled drape.

Each piece belongs to a limited production allocation. When the available units clear, the colourway moves into the Melato archive.

**ALLOCATION DETAILS**

- Date: `{{ drop_date }}`
- Time: **8:00 PM ET**
- Access: Public release and VIP waitlist

**Primary CTA:** `ENTER THE LIVING BOOK`

**Footer sign-off:** MELATO / OTTAWA

### Send logic

Send to VIP waitlist first if early access is enabled. Otherwise send simultaneously to VIP and engaged audiences. Suppress unengaged profiles according to the active deliverability policy.

---

## EMAIL 2 · T0 · DROP LIVE

**Campaign name:** `DROP 009 · T0 · Live`

**Subject A:** Drop 009 is live. Choose your silhouette.

**Subject B:** The vault is open. Capsule 009.

**Preview text:** Limited allocations are available now. Shipped from Ottawa, Canada.

**Hero direction:** Full uniform in motion, showroom frame, or tightly composed product-on-body image. Avoid a catalogue grid.

### Copy

**DROP 009 IS NOW ACTIVE.**

The complete capsule allocation is live.

**DESIGN SPECIFICATIONS**

- Heavyweight velour track sets with custom hardware and a tapered drape
- Premium bamboo pieces with a smooth hand feel and temperature-conscious layering
- Identity-led cuts designed around silhouette, not only size

Choose the shape that belongs in your rotation. Shop Pay and other available accelerated checkout methods can be used at checkout.

**Primary CTA:** `CLAIM YOUR UNIFORM`

Shipped from Ottawa, Canada.

### Send logic

1. Send to VIP waitlist at launch.
2. Send to the engaged audience 15 to 30 minutes later if VIP early access is not exclusive.
3. Exclude anyone who purchased Drop 009 before the broader send executes.

---

## EMAIL 3 · T+24 HOURS · VERIFIED SCARCITY

**Campaign name:** `DROP 009 · T+24 · Allocation Alert`

**Subject A:** Final allocation notice: Capsule 009

**Subject B:** Core sizes are nearing exhaustion.

**Preview text:** Once this run clears, the colourway enters the archive.

**Hero direction:** One clean image featuring the strongest remaining silhouette. Do not use fake low-stock stamps or a multi-product collage.

### Send gate

Send only when inventory supports the scarcity claim. Before scheduling, verify:

- sell-through percentage for the capsule
- specific variants that are genuinely low stock
- whether the colourway has a confirmed no-rerun policy

Do not send “80% allocated” unless the verified sell-through is at least 80%.

### Copy

**FINAL STOCK ALLOCATION.**

Twenty-four hours after release, key sizes across the Drop 009 velour and bamboo capsule are approaching their final available units.

Past colourways are not automatically reproduced. When this allocation closes, the remaining silhouettes move into the Melato archive.

Complete your order while your preferred size is still available.

**Primary CTA:** `SECURE REMAINING UNITS`

**Footer sign-off:** MELATO STORES

### Dynamic proof block

Populate with verified values immediately before send:

- `{{ verified_sell_through_percent }}`
- `{{ verified_low_stock_variants }}`
- `{{ verified_sold_out_variants }}`

---

## WAITLIST AUTOMATION MAP

**Entry condition:** Shopify customer/profile contains tag `back-in-stock`.

**Branching keys:**

- `BIS Product Handle: [handle]`
- `BIS Variant ID: [variant_id]`
- `BIS SKU: [sku]`

**Recommended messages:**

1. **Confirmation:** sent after profile sync, confirming the selected product and variant.
2. **Inventory return:** sent only after the matching variant is verified available.
3. **No-return alternative:** optional editorial recommendation after 30 days, excluding anyone who purchased or unsubscribed.

**Exit conditions:** matching purchase, unsubscribe, profile suppression, or the product permanently entering the archive.

## QA GATES

- Verify every product URL and CTA destination on the live store.
- Verify the launch date and use **ET**, not a fixed EST label.
- Verify inventory claims immediately before Email 3.
- Confirm all imagery is a standalone image rather than a collage or grid.
- Test mobile dark mode, alt text, tracking parameters, unsubscribe, and checkout links.
- Exclude purchasers from later conversion emails in the sequence.
