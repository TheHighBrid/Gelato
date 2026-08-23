# THE LIVING BOOK v1 Asset Delivery Status

Date: 2026-08-23
Branch: `assets/living-book-forensic-delivery-20260823`
Production manifest: `docs/living-book-v1-production-asset-manifest.json`

## Source contract

Production follows Comprehensive Blueprint v1.0 Sections 1 and 6 plus the Quick Reference Asset Delivery Checklist.

- Forensic noir, high-contrast chiaroscuro, single hard source and negative fill
- Palette: `#0A0A0C`, `#E8E4DC`, `#C41E3A`, `#FFBF00`, `#B5A642`, `#1A1A2E`, `#8B8680`
- Product links are assigned only where the blueprint names a product and the handle was verified against the current Shopify catalog
- Generic, atmospheric and ambiguous frames remain intentionally unlinked

## 31 hero frames

All 31 frame concepts were generated individually as 2:3 4K-class forensic-noir hero images in the connected image workspace.

Important delivery limitation: the image-generation connector exposes the rendered image to the user interface but does not return a raw downloadable asset to the agent. Therefore this branch does not claim that 4000x6000 16-bit TIFF, WebP and AVIF exports have been materialized in GitHub. The target filenames, frame IDs and verified Shopify product handles are fully specified in the production manifest for lossless final export once raw renders are available.

## Video loops

Four seamless background-loop masters were rendered locally for:

- F05 `f05-flash-loop.mp4` / `.webm`
- F19 `f19-doorway-loop.mp4` / `.webm`
- F21 `f21-corridor-loop.mp4` / `.webm`
- F26 `f26-door-light.mp4` / `.webm`

MP4 masters: 3840x2160. WebM fallbacks: 1920x1080. Current loop duration is 4 seconds with periodic motion designed for seamless repetition. This is implementation-ready but shorter than the blueprint's preferred 5-15 second loop range.

## Audio

Eight audio masters were produced at 48 kHz / 24-bit PCM with MP3 320 kbps and OGG web encodes:

- `amb-void-drone-loop`
- `sfx-shutter-click`
- `sfx-tape-rustle`
- `sfx-heartbeat-loop`
- `sfx-wind-corridor`
- `sfx-chair-creak`
- `sfx-button-snap`
- `sfx-seal-crack`

## Texture library

Seven 4096x4096 texture masters were produced and verified READY in Shopify Files:

- `dust-overlay.png` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-dust-overlay.png?v=1787500793`
- `paper-grain.jpg` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-paper-grain.jpg?v=1787500808`
- `fingerprint-alpha.png` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-fingerprint-alpha.png?v=1787500814`
- `concrete-diffuse.jpg` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-concrete-diffuse.jpg?v=1787500826`
- `brass-normal.jpg` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-brass-normal.jpg?v=1787500834`
- `polaroid-frame.png` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-polaroid-frame.png?v=1787500844`
- `crime-tape-alpha.png` -> `https://cdn.shopify.com/s/files/1/0809/3358/5151/files/living-book-crime-tape-alpha.png?v=1787500853`

Shopify GraphQL file inventory confirms all seven are `READY` at 4096x4096 with no file errors.

## Shopify media ingestion

Direct attempts to send MP3/MP4 through the image-upload connector timed out and did not appear in the Shopify Files inventory. They are therefore not represented as uploaded. The seven texture uploads are the only Shopify-hosted production assets claimed here.

## Mapping integrity

Verified product handles used in the 31-frame manifest include:

- `protective-custody`
- `amber-alibi-sunglasses`
- `return-to-sender-chain-wallet`
- `pocket-change-top-handle-bag`
- `divididos-velour-track-jacket`
- `divididos-velour-track-pant`
- `conquista-velour-track-jacket`
- `conquista-velour-track-pant`
- `chu-velour-track-jacket`
- `passion-fruit-velour-track-jacket`
- `passion-fruit-velour-track-pant`

No product handle was guessed for F04, F10, F14, F18, F26 or brand-only/atmospheric frames.
