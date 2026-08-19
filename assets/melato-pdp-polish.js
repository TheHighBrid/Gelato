(() => {
  'use strict';

  /*
    P0 commerce-safe PDP mode, 2026-08-18.

    Product rendering, variant selection, native details, purchase submission and
    cart behavior are owned by the server-rendered PDP section and core cart runtime.
    The former polish layer added a second gallery/zoom implementation and a subtree
    MutationObserver. It is disabled during the stability incident so a shopper's
    click cannot create a global scroll lock or observer cascade.
  */
  if (!location.pathname.includes('/products/')) return;
  document.documentElement.dataset.melatoPdpPolishRuntime = 'disabled-p0';
})();
