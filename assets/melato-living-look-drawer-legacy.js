(() => {
  'use strict';

  const ROOT_SELECTOR = '#MelatoLivingLookbook';
  const PRODUCT_LINK_SELECTOR = 'a[href*="/products/"]';
  let observer = null;
  let scanTimer = null;

  const uniqueProducts = card => {
    const seen = new Set();
    return Array.from(card.querySelectorAll(PRODUCT_LINK_SELECTOR)).reduce((products, anchor) => {
      let url;
      try { url = new URL(anchor.href, window.location.origin); } catch (error) { return products; }
      if (url.origin !== window.location.origin || !/\/products\//.test(url.pathname)) return products;
      const path = url.pathname.replace(/\/$/, '');
      if (seen.has(path)) return products;
      seen.add(path);
      const parts = path.split('/').filter(Boolean);
      products.push({
        url: path,
        handle: parts[parts.length - 1] || '',
        title: anchor.dataset.productTitle || anchor.querySelector('strong')?.textContent?.trim() || anchor.textContent?.replace(/[↗→+]/g, '').trim() || 'Melato piece',
        image: card.querySelector('img')?.currentSrc || card.querySelector('img')?.src || ''
      });
      return products;
    }, []);
  };

  const baselineFromCard = card => {
    const frameLabel = card.querySelector('em')?.textContent?.trim() || String(Number(card.dataset.i || 0) + 1).padStart(2, '0');
    const note = card.querySelector('.mlb-card-ov h3')?.textContent?.trim() || '';
    return {
      lookId: `legacy-frame-${frameLabel}`,
      frameLabel,
      note,
      source: 'legacy-editorial-spread',
      products: uniqueProducts(card)
    };
  };

  const getDrawer = () => {
    let drawer = document.querySelector('melato-look-drawer[data-melato-shared-look-drawer]');
    if (!drawer && customElements.get('melato-look-drawer')) {
      drawer = document.createElement('melato-look-drawer');
      drawer.dataset.melatoSharedLookDrawer = 'true';
      document.body.appendChild(drawer);
    }
    return drawer;
  };

  const enhanceCard = card => {
    if (card.dataset.legacyLookDrawerEnhanced === 'true') return;
    const baseline = baselineFromCard(card);
    if (!baseline.products.length) return;

    const overlay = card.querySelector('.mlb-card-ov') || card;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'mlb-view-look-trigger mlb-view-look-trigger--legacy';
    trigger.dataset.lookId = baseline.lookId;
    trigger.dataset.lookSource = baseline.source;
    trigger.innerHTML = '<span>View the Look</span><span aria-hidden="true">+</span>';
    trigger.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const drawer = getDrawer();
      if (drawer && typeof drawer.open === 'function') drawer.open(baselineFromCard(card), trigger);
    });

    const linkHost = card.querySelector('.mlb-card-links');
    if (linkHost) linkHost.hidden = true;
    overlay.appendChild(trigger);
    card.dataset.legacyLookDrawerEnhanced = 'true';
  };

  const scan = root => {
    if (!root) return;
    root.querySelectorAll('.mlb-card').forEach(enhanceCard);
  };

  const scheduleScan = root => {
    clearTimeout(scanTimer);
    scanTimer = window.setTimeout(() => scan(root), 40);
  };

  const init = () => {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return;
    scan(root);
    observer?.disconnect();
    observer = new MutationObserver(() => scheduleScan(root));
    observer.observe(root, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  document.addEventListener('shopify:section:load', init);
})();
