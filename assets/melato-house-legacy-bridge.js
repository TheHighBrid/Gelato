(() => {
  'use strict';

  const wrapInit = (controller, shouldSkip) => {
    if (!controller || typeof controller.init !== 'function') return;
    const originalInit = controller.init.bind(controller);
    controller.init = function melatoHouseCompatibleInit(...args) {
      if (shouldSkip()) return;
      return originalInit(...args);
    };
  };

  // theme.js is intentionally kept for legacy sections, but the House storefront
  // has dedicated cart and collection controllers. Prevent both implementations
  // from binding to the same DOM and issuing duplicate mutations/requests.
  try {
    if (typeof Cart !== 'undefined') {
      wrapInit(Cart, () => Boolean(document.querySelector('[data-cart-drawer]')));
    }
  } catch (error) {
    console.warn('Melato House cart compatibility bridge was not applied.', error);
  }

  try {
    if (typeof Filters !== 'undefined') {
      wrapInit(Filters, () => Boolean(document.getElementById('melato-product-grid')));
    }
  } catch (error) {
    console.warn('Melato House filter compatibility bridge was not applied.', error);
  }
})();
