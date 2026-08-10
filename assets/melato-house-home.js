(() => {
  'use strict';

  const boot = () => {
    const home = document.querySelector('[data-house-home]');
    const hero = home && home.querySelector('[data-house-home-hero]');
    const header = document.querySelector('[data-house-header]');
    if (!home || !hero || !header || home.dataset.houseHomeReady === 'true') return;

    home.dataset.houseHomeReady = 'true';
    document.body.classList.add('melato-home-house-ready');

    const syncHeader = () => {
      const threshold = Math.max(160, hero.offsetTop + hero.offsetHeight - (header.offsetHeight * 2));
      header.classList.toggle('is-home-solid', window.scrollY >= threshold);
    };

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader, { passive: true });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(syncHeader);
      resizeObserver.observe(hero);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('shopify:section:load', boot);
})();
