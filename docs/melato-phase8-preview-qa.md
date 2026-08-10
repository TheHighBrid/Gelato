# Melato House Phase 8 Preview QA

Date: 2026-08-10

## Safe QA target

- Shopify theme: `MELATO HOUSE QA — PR31 — 2026-08-10`
- Theme ID: `163053469951`
- Theme prefix: `/t/90`
- Role: `UNPUBLISHED`
- Source baseline: current live theme duplicated before overlay
- Redesign overlay: PR #31 House storefront files
- Live theme was not modified or published.

## Server-side preview checks completed

- House storefront overlay completed without Shopify theme-processing errors.
- All redesigned storefront files were present and non-empty in the QA theme.
- Homepage collection handles resolve to current Shopify collections.
- Native Shopify newsletter is active in the House homepage template.
- Representative PDP data includes product palette, size guide, material, fit, care, shipping and active matching-product references.
- Current canonical Client Services templates remain present from main.
- Living Book stale shoppable product handles were corrected to current active product handles.
- Footer Client Services links were synchronized with currently published service pages.
- Concierge design tokens were scoped to `.melato-page` so service CSS cannot mutate the global House shell.
- Canonical service navigation was converted from rounded pill tabs to the House rectangular editorial system.

## Visual gate still required

A browser screenshot/viewport connector was unavailable during this run. Pixel-level desktop/tablet/Android/iOS inspection therefore remains a release gate. Do not treat this document as evidence that responsive visual QA has passed.
