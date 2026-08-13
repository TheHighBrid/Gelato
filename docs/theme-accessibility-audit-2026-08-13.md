# Theme accessibility audit — 2026-08-13

## Scope

The review focused on the global theme shell and the highest-frequency keyboard journeys: opening and closing the navigation drawer, opening search from either header location, dismissing overlays, and browsing with reduced motion enabled.

## Findings implemented

1. **Modal semantics:** the navigation and search overlays now expose dialog semantics, an accessible heading, `aria-modal`, and an inert closed state.
2. **Keyboard containment:** focus cycles within the active overlay instead of escaping behind it. Escape closes only the active overlay.
3. **Focus lifecycle:** opening navigation moves focus to its close control; opening search moves focus to the search field; closing either surface returns focus to the control that launched it.
4. **Overlay race condition:** switching directly from navigation to search previously allowed the navigation close timer to unlock page scrolling while search remained open. Dialog state now owns the scroll lock and stale hide timers are cancelled.
5. **Reduced motion:** the base stylesheet previously required an additional body class that the theme did not set. The operating-system preference now works without JavaScript and also disables smooth scrolling.

## Storefront QA

- Test navigation and search using Tab, Shift+Tab, Enter, and Escape at desktop and mobile widths.
- Confirm focus returns to the correct opener when search is launched from both the header and navigation drawer.
- Enable the operating system's reduced-motion setting and confirm animated sections and smooth scrolling settle immediately.
- Repeat in a Shopify preview with app embeds enabled to confirm third-party widgets do not introduce focusable elements behind the overlays.
