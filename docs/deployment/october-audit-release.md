# October storefront audit release

Production observed on October 10, 2026: Shopify theme `162873704703`, `READY: Sep 19 Audit Fix + PDP Color Details`. The prepared theme is `167607828735`, `MELATO October 10 Audit Fix Preview`. It was duplicated from production and retains the earlier calendar and PDP-copy repairs.

This release adds first-film shopping links and a poster, repairs the product color-engine syntax, gives desktop category links their own row with Fragrance, wraps the complete announcement, and stops relabelling the contextual New Arrivals module as a second recommendation rail. Existing CAD pricing, cart, size controls and Complete the Set remain intact.

Catalog changes are already live: descriptive image filenames and alternative text, front-first Ryū and Chō jackets, model-first Tinted Testimony, and five canonical product handles with automatic redirects. File formats are preserved; changing a filename does not improve image resolution.

`live-theme-2026-10-10.json` records all 280 production-file MD5 checksums returned by Shopify. It is an evidence snapshot, not a claim that repository main is deployed. Newer approved fixes in main must not be overwritten by an export of the older live theme. Do not add theme ZIP dumps as source changes.

Before publishing, preview the first film, wrapped announcement, desktop Fragrance link and Ryū PDP. Run both audit test scripts and the Bible validator. Publish the prepared theme through Shopify Admin, then verify production's theme ID and the same storefront surfaces. The connector permits draft-theme file changes but blocks MAIN writes and theme publication.

The reported Meta currency warning was reproduced in the browser. The pixel is the Facebook app pixel `1358728403056351`, WebPixel `2355003647`; Shopify HTML supplies CAD. The connection lacks `read_pixels`, so its app-owned implementation/settings cannot be inspected or corrected here. Repair requires the Facebook and Instagram channel/customer-events access and an Events Manager retest, not a second theme tracking script.

Shop Pay is listed in Shopify supported wallets and the primary domain is https://melato.ca. The reported hop error does not establish a Payments configuration defect. Successful payment on a real device has not been verified.

Shopify's GitHub theme connection is not exposed by this connector. Linking the prepared production theme to `TheHighBrid/Gelato` main must be completed in Shopify Admin after reconciling source drift. Do not delete historical branches until their merged/unmerged status and production provenance are established.
