# Context.dev read-only storefront QA

This optional **server/CLI-only** tool inspects Melato.ca public pages and
creates local JSON evidence. It does not write to Shopify, edit theme files,
change products, update the Product Page Bible or publish anything.

## Setup and commands

Use Node 20+ and set \`CONTEXT_DEV_API_KEY\` in your gitignored local shell or
deployment secret settings; \`CONTEXT_API_KEY\` is accepted as an alias.
Never use \`NEXT_PUBLIC_\` or include the key in a Liquid asset.

\`\`\`sh
# One explicitly selected URL
node scripts/contextdev-storefront-qa.mjs https://melato.ca/

# A bounded EN/FR product, collection and lookbook verification
node scripts/contextdev-storefront-qa.mjs --fresh \
  https://melato.ca/products/<verified-handle> \
  https://melato.ca/fr/products/<verified-handle> \
  https://melato.ca/collections/<verified-handle> \
  https://melato.ca/fr/collections/<verified-handle> \
  https://melato.ca/pages/<verified-lookbook> \
  https://melato.ca/fr/pages/<verified-lookbook>

# Include screenshots only on explicit visual QA runs
node scripts/contextdev-storefront-qa.mjs --screenshots https://melato.ca/
\`\`\`

Replace placeholders only with validated published routes, including any
market-specific locale routes actually enabled. The CLI accepts at most six
URLs per invocation to limit unplanned credit consumption. Normal requests
allow 30-minute cached responses; \`--fresh\` bypasses cache, costs credits.
Default fetch country is CA. Each URL requests Structured JSON, Markdown,
Images, and the prebuilt Links parser. Images are not deduplicated, so
repeated or missing visual references are observable. Screenshots are optional.

Outputs go to \`.cache/contextdev-storefront/qa-report.json\` with optional
screenshot files; this path must remain ignored by Git. Each page record has
the source and final URLs, EN/FR locale, page type, retrieval time, observed
values, image URLs, links, and independent format statuses. A missing title or
price on a successfully extracted product is not the same as a failed scrape.
Markdown text is capped to 15,000 characters per page with a truncation flag.

This uses \`POST https://api.context.dev/v1/web/scrape\`, a 20-second
per-attempt timeout and one transient retry within 25 seconds. It does not
use browser profiles or authenticated pages. Interactive browser actions
require paid-plan support, so this integration does not attempt them or
treat an access challenge as verified storefront absence.

No products are created or updated from extracted content. Observed fields
are **evidence**, not authoritative Shopify product facts. Compare any
proposed correction against \`docs/MELATO_PRODUCT_PAGE_BIBLE.md\`.

## Offline verification

\`\`\`sh
node --test tests/contextdev-storefront-qa.test.js
npm test
node scripts/validate-melato-product-page-bible.mjs
\`\`\`

Also require the storefront integrity guard and owner signoff before merging.
These tests are offline and must not trigger Context.dev charges.
