# Melato Shopify Drag-and-Drop Implementation

This repository now includes Shopify Online Store 2.0 compatible files that can be copied into a theme and added through the Shopify theme editor.

## Files to install

- `sections/melato-ovum-home-redesign.liquid` — full premium homepage section for the OVUM campaign.
- `sections/melato-digital-maison-suite.liquid` — reusable drag-and-drop section for campaign storytelling, shoppable editorial cards, service cues, scarcity messaging, and lookbook modules.
- `snippets/melato-global-polish.liquid` — defensive global polish for header, footer, CTAs, Instagram card, and copyright treatment.
- `templates/index.melato-ovum-redesign.json` — reference Shopify homepage template.
- `layout/ADD_THIS_BEFORE_HEAD_CLOSE_IN_theme.liquid.txt` — render line for the global polish snippet.

## Shopify install steps

1. Duplicate the live theme before editing.
2. In Shopify Admin, open **Online Store → Themes → Edit code**.
3. Add the files from `sections/`, `snippets/`, and `templates/` to matching Shopify folders.
4. Open `layout/theme.liquid` and paste this once before `</head>`:

   ```liquid
   {% render 'melato-global-polish' %}
   ```

5. Open **Customize** and add these sections by drag-and-drop:
   - **Melato OVUM homepage** for the primary premium homepage experience.
   - **Melato Digital Maison** wherever Melato needs premium campaign, editorial, service, or lookbook content.

## What this fixes from the audit

- Brand world depth: editorial cards can be used for campaigns, founder notes, lookbooks, material stories, and seasonal concepts.
- Collection hierarchy: featured cards let one hero campaign or collection dominate instead of every product receiving equal weight.
- Service layer: the client service row adds private preview, fit concierge, premium delivery, and edition-note cues.
- Editorial commerce: card CTAs can link to collections, PDPs, pages, blogs, or contact routes.
- Premium consistency: global polish supports more refined header, footer, CTA, and social presentation.

## Recommended page order

1. Hero/campaign section.
2. Melato Digital Maison section with one featured campaign card and two supporting cards.
3. Product or collection grid.
4. Melato Digital Maison section configured as client services or lookbook.
5. Newsletter/VIP capture.
