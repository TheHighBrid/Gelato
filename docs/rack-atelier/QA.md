# Melato rack atelier

The previous rack displayed rectangular photos and treated each second product image as a reverse view. This change uses 21 dedicated transparent assets: 14 fronts and seven backs selected from visually checked source galleries. Product galleries, specifications, prices, inventory and the Product Page Bible remain unchanged.

The rail follows mouse travel, supports edge browsing, horizontal dragging and trackpad movement, and settles with a damped hanger swing. Selecting a garment lifts it into a native modal. The hanger and garment turn together; returning the piece runs the reverse motion before the next garment opens. Keyboard arrows, Home, End, Escape, native dialog focus handling and reduced motion are supported. The inspection drawer retains live variant availability and localized cart routes.

This is an image-based spatial presentation. The Angle control applies perspective to a photograph. It is not a volumetric 360-degree garment model. Back rotation is available only for the seven products with a verified reverse asset; other garments turn within 35 degrees. New products require transparent section-block media or an entry in the explicit media registry, so rectangular photos cannot silently re-enter the rail.

## Validation

- 62 repository tests pass, including 13 rack behavior checks.
- Shopify Liquid/schema/theme checks pass for the eight authored theme files.
- Product Page Bible validator passes.
- All 21 WebP assets have genuine alpha, with 29% to 57% fully transparent pixels in their full-resolution source files.
- Native browser checks: open a garment, front/back selection, return, next garment, and size drawer.
- Phone layout checked in a 390 by 844 CSS viewport using an isolated iframe fixture rendering the actual section and assets. This checks responsive layout, not a physical touch device.
- Cart success/error behavior tested with controlled responses; no customer purchase or live checkout was performed.

## Review deployment

The draft `Gelato Lumière Preview` (163975299327) contains the candidate rack at:

https://melato.ca/collections/rack?view=rack-atelier&preview_theme_id=163975299327

The published theme (162873704703) was read and reconciled for the rack files. Its five existing rack files match the repository base except for trailing newlines. No live theme files were written. The Shopify connector allows writes to unpublished themes only. The attempted duplicate operation returned no new theme and no errors; the existing draft was used for the isolated preview instead.

Release only the rack assets, section and snippets, plus merge the `melato_rack` translation object into the existing live locale. Do not publish the entire Lumière theme: it contains unrelated changes. The existing homepage rack section will pick up the new implementation when that scoped patch is deployed; the homepage JSON, theme settings, app embeds and product templates do not need replacement.

Images and the source-gallery provenance are included beside this record. Full-resolution generated PNGs are separate assets; WebP files in the theme are optimized delivery copies.
