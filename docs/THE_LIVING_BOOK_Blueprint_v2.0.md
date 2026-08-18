# THE LIVING BOOK — Blueprint v2.0

## Production decision

The Living Book is a Shopify-native editorial engine inside the Gelato theme. It is not a separate Next.js application and it has no fixed frame count.

## Runtime architecture

- Source of truth: Shopify CDN evidence manifests.
- Frame count: dynamic (`N`), currently 108 evidence records when Case File 03 is enabled.
- Frame identity: stable `LB-<asset-filename>` IDs. Display order is separate and may change.
- Presentation archetypes: hero, editorial, wide, cinema, tall, quiet, detail.
- Motion presets: depth, drift, reveal, magnify, still.
- Loading: first three images are immediate; later images hydrate inside a 180% viewport prefetch window.
- Rendering: `content-visibility:auto` plus an IntersectionObserver activation window.
- Desktop: pointer-reactive depth on selected archetypes.
- Mobile: CSS-first editorial mode with no persistent WebGL requirement.
- Reduced motion: static editorial fallback.

## Narrative

The four-act spine from v1 is retained and recalculated from the live archive size:

1. THE SCENE: first ~15%
2. THE EVIDENCE: ~15% to 50%
3. THE WITNESSES: ~50% to 85%
4. THE DOSSIER: final ~15%

The act boundaries move automatically when frames are added.

## Commerce

Frames may be mapped to products. Stable frame IDs are preferred. Legacy exhibit numbers remain as a fallback for existing mappings. Product overlays only appear when a mapping is explicitly supplied; the engine never guesses the product shown in a photograph.

## Wayfinding

Navigation remains diegetic and minimal: I / II / III / IV plus SHOP. There is no conventional pagination UI and no frame-count ceiling.

## Intro

First visit: forensic intro up to 4.3 seconds, dismissible immediately by user interaction. Returning visit: about 1.1 seconds. `prefers-reduced-motion` bypasses it.

## Performance guardrails

- No Next.js/R3F bundle on the Shopify storefront.
- No production TIFFs in Git.
- Images remain on Shopify CDN.
- No audio or WebGL is required for LCP.
- Heavy media is not hydrated until it approaches the viewport.
- Future video archetypes must allow at most one actively playing video in the viewport window.

## Expansion protocol

Adding images to a manifest automatically adds frames to the Living Book. No component creation, renumbering, chapter rewrite, or loading-tier rewrite is required.
