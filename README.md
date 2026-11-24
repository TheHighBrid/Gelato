# Gelato — Melato Shopify Theme

Official theme repository for [melato.ca](https://melato.ca).

This repository contains the production Shopify theme (DRIP-based, heavily customized for Melato) plus the Living Book Next.js prototype under `src/`.

## Structure

- `assets/` — CSS, JS, images, fonts (194 files)
- `sections/` — Liquid sections (88)
- `snippets/` — Reusable Liquid snippets
- `templates/` — JSON templates for pages, products, collections
- `layout/` — theme.liquid (main layout)
- `config/` — settings_schema.json, settings_data.json
- `locales/` — Translations
- `src/` — Next.js Living Book / lookbook prototype
- `tests/` — Theme and feature regression tests
- `docs/` — Audit reports, blueprints, design notes
- `archive/` — Historical zips, exports, large images (gitignored)

## Development

```bash
# Theme is synced from Shopify. Use Shopify CLI for local development.
shopify theme dev

# Living Book (Next.js)
npm install
npm run dev
```

## Notes

- Theme is actively synced from Shopify (shopify[bot] commits).
- Many `melato-*-2026*.css/js` files are incremental audit/feature layers. Prefer consolidating into core files for future changes.
- Live store: melato.ca (Basic plan, CAD, EST).
- Always test changes on a preview theme before publishing.

## CI

GitHub Actions in `.github/workflows/` guard brand policy, PDP disclosures, storefront integrity, etc.
