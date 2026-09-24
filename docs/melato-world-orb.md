# Melato World Orb

A full-viewport rotating 3D house navigator for [melato.ca](https://melato.ca). Seven glowing rooms sit on a faceted icosahedron: Living Book, Ready To Wear, Accessories, Editorial, Pop-Up Show & Events, Concierge, Melato Radio.

Drag to spin. Auto-rotate pauses while the visitor interacts. Click a marker or a list item to focus the camera. Enter opens the matching storefront URL.

## Install on the live theme

Files in this PR:

| Path | Role |
| --- | --- |
| `sections/melato-world-orb.liquid` | Shopify 2.0 section + schema |
| `assets/melato-world-orb.js` | Three.js engine (ES module, CDN three@0.185) |
| `assets/melato-world-orb.css` | Overlay HUD, matching Melato ivory / ink |
| `templates/page.world-orb.json` | Dedicated page template |

### Homepage (theme editor)

1. Online Store → Themes → Customize
2. Add section → **Melato World Orb**
3. Place it first (above the conversion hero) or wherever the house should open
4. Edit location URLs if a page handle differs on production

### Dedicated page

1. Online Store → Pages → Add page, e.g. `World`
2. Theme template: **world-orb**
3. URL becomes `https://melato.ca/pages/world`

The section does not require `theme.liquid` edits. It loads its own CSS and a `type="module"` script.

## Content map (defaults)

| Room | Default URL |
| --- | --- |
| Living Book | `/pages/living-lookbook` |
| Ready To Wear | `/collections/new-arrivals` |
| Accessories | `/collections/accessories` |
| Editorial | `/blogs/news` |
| Pop-Up Show & Events | `/pages/popup-calendar` |
| Concierge | `/pages/contact` |
| Melato Radio | `/pages/our-story` (swap when `/pages/radio` exists) |

Latitude / longitude on each block place the marker on the orb. Keep them spread so pins do not stack.

## Notes

- Three.js is loaded from jsDelivr. If a storefront CSP blocks it, vendor `three.module.js` into `assets/` and change the import in `melato-world-orb.js`.
- `prefers-reduced-motion` disables auto-rotate and shortens camera moves.
- Theme editor section load / unload is handled via `shopify:section:load` and `shopify:section:unload`.
