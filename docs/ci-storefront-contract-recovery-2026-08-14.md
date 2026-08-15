# Storefront CI contract recovery - 2026-08-14

PR #46 exposed regressions introduced after the verified August 12 storefront repair baseline (`592a3909c6fcabf7771b1912eb93539f4c6608ab`).

The recovery restores the affected guarded storefront files from that baseline while retaining PR #46's accessibility improvements, removal of the unused hero-video loader, and expanded JavaScript/JSON validation.

Recovered contracts include PDP rendering and fit guidance, presentment-currency cart formatting, announcement/footer component isolation, homepage hero media, predictive search, structured-data loader isolation, newsletter form rendering, and enabled 404 content.

The regression guards were not weakened or bypassed.
