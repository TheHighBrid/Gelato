# Living Lookbook Redesign Notes

## Current implementation

The active `melato-living-book` section builds an image manifest from the existing evidence data snippets, divides it into four fixed frame chapters, and preserves product mapping through section blocks. Its current presentation is a dark, chapter-based grid with expandable inline product cards and a wardrobe index. The section contains all CSS inline and has no supporting interaction script.

## Live page baseline

The current public Living Lookbook opens with a cinematic black-and-gold hero, then uses filters and a long archive of individual frame cards. The live structure contains a substantial number of inspection controls for evidence frames. The current experience has strong source imagery and a clear editorial premise, but the visual rhythm and shopping journey are fragmented across a lengthy document.

## Redesign intent

Retain all existing image records and frame-to-product mappings while converting the active Living Book into a more considered editorial archive. The revised experience should introduce a full-screen cover, compact reading progress, chapter-level pacing, richer image treatment, an accessible frame viewer, a product-aware information rail, and performance-conscious scroll-reveal motion that respects reduced-motion preferences.

## Technical constraints

- Preserve the existing Shopify section schema and image-manifest source options.
- Preserve product block mapping and direct product routes.
- Avoid external animation dependencies; use native CSS and small scoped JavaScript.
- Keep responsive behavior and keyboard-accessible modal interactions.
- Avoid modifying the auto-generated page template unless a necessary schema correction is identified.
