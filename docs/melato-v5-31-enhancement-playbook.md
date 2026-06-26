# Melato.ca Shopify Theme v5.31 Enhancement Playbook

Date: 2026-06-26  
Target: Gelato v5.31 Shopify theme powering `melato.ca`  
Implementation style: low-risk Shopify Liquid/CSS enhancements designed for a duplicated unpublished theme first.

## 1. Strategic direction

Melato should feel less like a standard Shopify storefront and more like a digital maison: editorial, tactile, curated, and service-led. The goal is to keep the existing v5.31 theme stable while layering a stronger visual system, clearer product discovery, and luxury service cues across the homepage, navigation, collection pages, product pages, cart, and footer.

### Core aesthetic principles

- Use deep obsidian, warm ivory, champagne gold, and espresso surfaces instead of generic black/white contrast.
- Use fewer but stronger calls to action.
- Replace discount-first language with collection, craft, fit, service, and limited-release language.
- Use editorial image crops, fabric detail closeups, campaign panels, and quiet motion.
- Make navigation feel curated, not crowded.

## 2. Visual enhancement: global maison polish

### What this improves

This creates an immediate premium layer across the whole theme: refined colors, better buttons, polished cards, softer collection grids, premium announcement bars, and elevated footer/header treatment.

### Files to create or update

Create a new snippet in Shopify:

`snippets/melato-v531-maison-polish.liquid`

Paste this code:

```liquid
{%- comment -%}
  Melato v5.31 Maison Polish
  Render once before </head> in layout/theme.liquid:
  {% render 'melato-v531-maison-polish' %}
{%- endcomment -%}

<style>
  :root {
    --melato-obsidian: #050608;
    --melato-ink: #0d0d0e;
    --melato-espresso: #17120f;
    --melato-surface: #111217;
    --melato-ivory: #f6efe3;
    --melato-stone: #b7ab9b;
    --melato-gold: #c68b3a;
    --melato-line: rgba(246, 239, 227, .13);
    --melato-shadow: 0 24px 70px rgba(0, 0, 0, .35);
    --melato-radius-lg: 28px;
    --melato-radius-md: 18px;
  }

  body {
    background: var(--melato-obsidian);
    color: var(--melato-ivory);
  }

  .announcement-bar,
  .utility-bar,
  .shopify-section-group-header-group .announcement-bar-section {
    background: linear-gradient(90deg, #070707, #1b130d, #070707) !important;
    color: var(--melato-ivory) !important;
    border-bottom: 1px solid var(--melato-line) !important;
    letter-spacing: .12em;
    text-transform: uppercase;
    font-size: 11px;
  }

  header,
  .header-wrapper,
  sticky-header,
  .shopify-section-header,
  .section-header {
    background: rgba(5, 6, 8, .94) !important;
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--melato-line) !important;
  }

  .header__menu-item,
  .list-menu__item,
  .site-nav__link {
    color: rgba(246, 239, 227, .78) !important;
    font-size: 11px !important;
    letter-spacing: .16em !important;
    text-transform: uppercase !important;
    transition: color .2s ease, opacity .2s ease;
  }

  .header__menu-item:hover,
  .list-menu__item:hover,
  .site-nav__link:hover {
    color: var(--melato-ivory) !important;
  }

  .button,
  .btn,
  .shopify-payment-button__button,
  button[type="submit"] {
    border-radius: 999px !important;
    min-height: 48px;
    padding-inline: 24px !important;
    letter-spacing: .14em !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    transition: transform .22s ease, box-shadow .22s ease, background .22s ease, border-color .22s ease !important;
  }

  .button:hover,
  .btn:hover,
  .shopify-payment-button__button:hover,
  button[type="submit"]:hover {
    transform: translateY(-2px);
    box-shadow: var(--melato-shadow);
  }

  .card,
  .card-wrapper,
  .product-card-wrapper,
  .collection-card-wrapper,
  .article-card-wrapper {
    border-radius: var(--melato-radius-md) !important;
    overflow: hidden;
  }

  .card__media,
  .product-card-wrapper .media,
  .collection-card-wrapper .media {
    background: linear-gradient(135deg, rgba(246, 239, 227, .08), rgba(198, 139, 58, .08));
  }

  .card__heading,
  .product__title,
  .collection-hero__title,
  .main-page-title,
  h1, h2 {
    letter-spacing: -.04em;
    text-wrap: balance;
  }

  .price,
  .card-information,
  .product__text,
  .product__description,
  .rte {
    color: rgba(246, 239, 227, .72);
  }

  footer,
  .footer,
  .shopify-section-footer {
    background:
      radial-gradient(circle at 20% 0%, rgba(198, 139, 58, .12), transparent 30%),
      #0d0d0e !important;
    color: rgba(246, 239, 227, .72) !important;
    border-top: 1px solid var(--melato-line) !important;
  }

  footer a,
  .footer a {
    color: rgba(246, 239, 227, .68) !important;
    text-decoration: none !important;
  }

  footer a:hover,
  .footer a:hover {
    color: var(--melato-ivory) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }
</style>
```

### Step-by-step implementation

1. In Shopify Admin, go to **Online Store → Themes**.
2. Duplicate the live Gelato v5.31 theme.
3. Open the duplicate theme in **Edit code**.
4. Create `snippets/melato-v531-maison-polish.liquid`.
5. Paste the snippet above.
6. Open `layout/theme.liquid`.
7. Add this line immediately before `</head>`:

```liquid
{% render 'melato-v531-maison-polish' %}
```

8. Preview desktop and mobile.
9. Confirm header, footer, cards, and buttons still match your brand imagery.
10. Publish only after testing cart, checkout handoff, navigation drawers, and product forms.

## 3. Functionality enhancement: concierge service strip

### What this improves

Luxury ecommerce needs reassurance. Add a reusable service strip to the homepage, product pages, collection pages, and cart so visitors understand shipping, fit help, returns, and private support.

### New section code

Create:

`sections/melato-concierge-strip.liquid`

```liquid
<section class="melato-concierge-strip color-{{ section.settings.color_scheme }}">
  <div class="melato-concierge-strip__inner page-width">
    <div class="melato-concierge-strip__intro">
      <p class="melato-concierge-strip__eyebrow">{{ section.settings.eyebrow }}</p>
      <h2>{{ section.settings.heading }}</h2>
      <p>{{ section.settings.text }}</p>
    </div>

    <div class="melato-concierge-strip__grid">
      {%- for block in section.blocks -%}
        <article class="melato-concierge-strip__card" {{ block.shopify_attributes }}>
          <span>{{ block.settings.kicker }}</span>
          <h3>{{ block.settings.title }}</h3>
          <p>{{ block.settings.text }}</p>
        </article>
      {%- endfor -%}
    </div>
  </div>
</section>

<style>
  .melato-concierge-strip {
    background: #050608;
    color: #f6efe3;
    padding: clamp(42px, 6vw, 86px) 0;
  }

  .melato-concierge-strip__inner {
    display: grid;
    grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr);
    gap: clamp(24px, 4vw, 64px);
    align-items: start;
  }

  .melato-concierge-strip__eyebrow,
  .melato-concierge-strip__card span {
    color: #c68b3a;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .melato-concierge-strip h2 {
    margin: 10px 0 14px;
    max-width: 620px;
    font-size: clamp(34px, 5vw, 72px);
    line-height: .9;
    letter-spacing: -.06em;
  }

  .melato-concierge-strip__intro p:last-child {
    color: rgba(246, 239, 227, .72);
    max-width: 560px;
    line-height: 1.7;
  }

  .melato-concierge-strip__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .melato-concierge-strip__card {
    border: 1px solid rgba(246, 239, 227, .12);
    border-radius: 24px;
    background: rgba(255, 255, 255, .045);
    padding: clamp(20px, 3vw, 30px);
    min-height: 190px;
  }

  .melato-concierge-strip__card h3 {
    margin: 24px 0 8px;
    font-size: clamp(18px, 2vw, 26px);
    letter-spacing: -.035em;
  }

  .melato-concierge-strip__card p {
    margin: 0;
    color: rgba(246, 239, 227, .7);
    line-height: 1.6;
  }

  @media screen and (max-width: 820px) {
    .melato-concierge-strip__inner,
    .melato-concierge-strip__grid {
      grid-template-columns: 1fr;
    }
  }
</style>

{% schema %}
{
  "name": "Melato concierge strip",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow",
      "default": "Client services"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Quiet support before and after every piece."
    },
    {
      "type": "textarea",
      "id": "text",
      "label": "Text",
      "default": "From fit questions to delivery guidance, Melato should feel personal, attentive, and considered at every step."
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "background-1"
    }
  ],
  "blocks": [
    {
      "type": "service",
      "name": "Service card",
      "settings": [
        {
          "type": "text",
          "id": "kicker",
          "label": "Kicker",
          "default": "01"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title",
          "default": "Fit guidance"
        },
        {
          "type": "textarea",
          "id": "text",
          "label": "Text",
          "default": "Invite shoppers to contact the team before purchase for sizing, styling, or silhouette advice."
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Melato concierge strip",
      "blocks": [
        { "type": "service", "settings": { "kicker": "01", "title": "Fit guidance", "text": "Need help choosing a size or silhouette? Contact Melato before you order." } },
        { "type": "service", "settings": { "kicker": "02", "title": "Private preview", "text": "Invite newsletter subscribers to receive first access to upcoming releases." } },
        { "type": "service", "settings": { "kicker": "03", "title": "Considered delivery", "text": "Clarify shipping timelines and packaging expectations before checkout." } },
        { "type": "service", "settings": { "kicker": "04", "title": "Care after purchase", "text": "Add garment care, styling, and support notes to make each order feel complete." } }
      ]
    }
  ]
}
{% endschema %}
```

### Step-by-step implementation

1. Create `sections/melato-concierge-strip.liquid` in the duplicated Shopify theme.
2. Paste the code above.
3. Open **Customize** on the duplicate theme.
4. Add **Melato concierge strip** below the hero on the homepage.
5. Add it near the bottom of product templates and cart pages.
6. Use concise service copy:
   - Fit guidance
   - Private preview
   - Considered delivery
   - Care after purchase
7. Link the text to existing contact, shipping, returns, and newsletter pages where possible.

## 4. Navigation enhancement: curated maison menu

### Recommended primary navigation

Use six top-level links maximum:

1. **New Drop** → newest collection or `/collections/new-arrivals`
2. **Ready to Wear** → main apparel collection
3. **Accessories** → accessories collection
4. **OVUM** → campaign or capsule landing page
5. **Stories** → blog/journal
6. **Client Services** → page containing size, shipping, returns, and contact links

### Recommended nested menu structure

```text
New Drop
  Just Arrived
  Limited Release
  Best Sellers

Ready to Wear
  Tops
  Bottoms
  Outerwear
  Dresses / Sets

OVUM
  Campaign
  Shop the Edit
  Lookbook

Stories
  Journal
  Materials
  Styling Notes

Client Services
  Size & Fit
  Shipping & Returns
  Contact Concierge
  Care Guide
```

### Step-by-step implementation

1. In Shopify Admin, go to **Content → Menus**.
2. Open the main menu used by Gelato v5.31.
3. Reduce top-level items to the six recommended items.
4. Move support links into **Client Services** instead of showing them as scattered header links.
5. Rename generic labels:
   - `Catalog` becomes `Ready to Wear`.
   - `Blog` becomes `Stories`.
   - `Contact` becomes `Contact Concierge`.
6. Add a collection image or campaign image to the menu if the theme supports mega-menu media.
7. Test on mobile drawer: every important shopping path should be reachable in two taps.

## 5. Homepage enhancement: editorial campaign structure

### Recommended homepage order

1. Campaign hero: one strong visual, one message, two CTAs.
2. New Drop cards: three to four strongest products or collections.
3. Concierge service strip.
4. Shop the Look / OVUM editorial module.
5. Featured collection row.
6. Stories teaser.
7. VIP newsletter/private preview.

### Premium copy examples

- Hero eyebrow: `OVUM / Limited release`
- Hero heading: `Form, shadow, movement.`
- Hero body: `A restrained capsule built around sculptural lines, tactile surfaces, and evening ease.`
- Primary CTA: `Shop the release`
- Secondary CTA: `View the lookbook`

## 6. Product page enhancement: product dossier model

### What to add

Each product page should answer these questions without making shoppers hunt:

- What makes this piece special?
- How does it fit?
- What is it made from?
- How should it be styled?
- How fast will it ship?
- Who can help if I am unsure?

### Suggested metafields

Create these Shopify product metafields:

| Namespace and key | Type | Purpose |
| --- | --- | --- |
| `custom.fit_notes` | Multi-line text | Fit guidance and sizing notes |
| `custom.material_story` | Multi-line text | Material, texture, and construction story |
| `custom.styling_notes` | Multi-line text | How to wear or pair the item |
| `custom.edition_note` | Single-line text | Limited release, restock, or capsule note |
| `custom.care_note` | Multi-line text | Garment care and handling |

### PDP Liquid block idea

Add this where product information blocks render, usually inside `sections/main-product.liquid` or the equivalent Gelato v5.31 product section:

```liquid
{%- if product.metafields.custom.fit_notes != blank
  or product.metafields.custom.material_story != blank
  or product.metafields.custom.styling_notes != blank
  or product.metafields.custom.care_note != blank -%}
  <div class="melato-product-dossier">
    <p class="melato-product-dossier__eyebrow">Product dossier</p>

    {%- if product.metafields.custom.edition_note != blank -%}
      <p class="melato-product-dossier__edition">{{ product.metafields.custom.edition_note }}</p>
    {%- endif -%}

    {%- if product.metafields.custom.fit_notes != blank -%}
      <details open>
        <summary>Fit notes</summary>
        <div>{{ product.metafields.custom.fit_notes | metafield_tag }}</div>
      </details>
    {%- endif -%}

    {%- if product.metafields.custom.material_story != blank -%}
      <details>
        <summary>Material story</summary>
        <div>{{ product.metafields.custom.material_story | metafield_tag }}</div>
      </details>
    {%- endif -%}

    {%- if product.metafields.custom.styling_notes != blank -%}
      <details>
        <summary>Styling notes</summary>
        <div>{{ product.metafields.custom.styling_notes | metafield_tag }}</div>
      </details>
    {%- endif -%}

    {%- if product.metafields.custom.care_note != blank -%}
      <details>
        <summary>Care</summary>
        <div>{{ product.metafields.custom.care_note | metafield_tag }}</div>
      </details>
    {%- endif -%}
  </div>
{%- endif -%}

<style>
  .melato-product-dossier {
    margin-top: 24px;
    border: 1px solid rgba(246, 239, 227, .14);
    border-radius: 22px;
    background: rgba(255, 255, 255, .04);
    overflow: hidden;
  }

  .melato-product-dossier__eyebrow {
    margin: 0;
    padding: 18px 20px 0;
    color: #c68b3a;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .melato-product-dossier__edition {
    margin: 8px 20px 0;
    color: #f6efe3;
    font-size: 13px;
  }

  .melato-product-dossier details {
    border-top: 1px solid rgba(246, 239, 227, .1);
    padding: 0 20px;
  }

  .melato-product-dossier summary {
    cursor: pointer;
    padding: 18px 0;
    color: #f6efe3;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .melato-product-dossier details > div {
    padding-bottom: 18px;
    color: rgba(246, 239, 227, .72);
    line-height: 1.65;
  }
```

## 7. Collection page enhancement: curated edits

### What to improve

Collection pages should feel like editorial edits instead of raw product grids.

Recommended additions:

- A short collection manifesto above the grid.
- A two-card editorial banner after the first row of products.
- Filters renamed to customer language: size, color, silhouette, availability.
- Fewer products per row on desktop if images are strong.
- Product badges for quiet luxury states: `Limited release`, `Back soon`, `Private preview`.

### Collection copy template

```text
A capsule of sculptural essentials selected for movement, evening texture, and quiet presence. Explore limited pieces designed to layer, repeat, and hold their shape across occasions.
```

## 8. Stories / Journal enhancement

### Why this matters

Stories build the world around the products. They also support SEO and give social/email traffic more reasons to return.

### Recommended first five stories

1. `The OVUM Notes: Form, Shadow, Movement`
2. `How to Style Sculptural Black for Evening`
3. `A Material Guide to Melato Textures`
4. `Behind the Drop: Building a Limited Capsule`
5. `Care Notes: Keeping Your Piece Beautiful Longer`

### Story page structure

- Full-width editorial image.
- Short opening manifesto.
- Two to three image/text sections.
- Shoppable product block.
- Newsletter/private preview CTA.

## 9. Conversion and retention enhancements

### Add these Shopify features

- Back-in-stock notifications for sold-out sizes.
- Newsletter popup only after delay or scroll, not immediately.
- Abandoned cart email with service-forward copy.
- Welcome email with `Private preview` positioning.
- Post-purchase email with care notes and styling suggestions.

### Avoid these patterns

- Aggressive countdown timers.
- Loud sale badges on luxury products.
- Too many homepage CTAs.
- Generic product descriptions copied from supplier language.

## 10. QA checklist before publishing

Run through this list on the duplicated theme:

- Header and mobile drawer links work.
- Add to cart works for all product states.
- Dynamic checkout buttons still render.
- Cart drawer/page still opens and updates quantities.
- Product variants update price and availability.
- Search still works.
- Footer links are readable.
- Text contrast passes visual inspection on mobile.
- Images are compressed and not blurry.
- No custom section appears twice by accident.
- Theme preview is tested in Chrome, Safari, and mobile viewport.

## 11. 14-day rollout plan

### Days 1-2: Duplicate and protect

- Duplicate the live theme.
- Install the global maison polish snippet.
- Confirm no regressions in header, footer, product forms, and cart.

### Days 3-5: Navigation and copy

- Rebuild the main menu using the curated maison menu model.
- Rewrite homepage hero and collection descriptions.
- Create the Client Services page.

### Days 6-8: Service layer

- Add the concierge strip section.
- Add service links to product pages and cart.
- Build fit, shipping, returns, and contact content.

### Days 9-11: Product dossier

- Create metafields.
- Populate top-selling products first.
- Add the product dossier Liquid block.

### Days 12-14: Editorial launch

- Create Stories/Journal content.
- Add shoppable editorial links.
- QA, preview, then publish.

## 12. Success metrics

Track these metrics for 30 days after launch:

- Homepage click-through rate to collections.
- Product page add-to-cart rate.
- Cart abandonment rate.
- Newsletter signup rate.
- Search usage and zero-result searches.
- Mobile conversion rate.
- Most-clicked navigation items.

A successful launch should increase collection discovery, make PDPs more persuasive, and make Melato feel more premium without sacrificing Shopify stability.
