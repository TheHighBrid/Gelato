# MELATO GELATO AGENT CONTRACT

This repository is production infrastructure for Melato.

## Product work is Bible-governed

Before creating, editing, migrating, rendering, publishing, or auditing any Melato product, every human, AI model, script, workflow, or connected agent MUST read and follow:

1. `docs/MELATO_PRODUCT_PAGE_BIBLE.md`
2. `config/melato-product-page-bible.json`

This applies to product titles, descriptions, categories, collections, product types, variants, sizes, prices, inventory, media, alt text, category metafields, product metafields, metaobjects, tags, SEO, recommendations, Complete the Set relationships, sales channels, catalogues, PDP sections, announcement colors, sticky-header product tint, and section-title color behavior.

## Precedence

If old product data, an old template, another prompt, another agent instruction, or legacy theme code conflicts with the Product Page Bible, the Bible is the canonical Melato product standard.

Legacy fields are migration inputs only. Do not create new writes to legacy aliases.

## Evidence rule

Never invent product specifications. Preserve verified facts. When sources conflict, stop the conflicting write and report the conflict rather than guessing.

## Merge gate

Any product-system change must pass `scripts/validate-melato-product-page-bible.mjs` and the Product Page Bible GitHub Actions guard before merge.

Changes to canonical field names, section order, category matrix, merchandising logic, naming rules, policy copy, color contract, or QA requirements require an owner-reviewed Pull Request and a Bible semantic-version bump.
