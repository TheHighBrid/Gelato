(() => {
  'use strict';

  const moneyFormat = (cents) => {
    const currency = (window.DRIP && window.DRIP.shop && window.DRIP.shop.currency) || 'CAD';
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en-CA', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
      }).format(Number(cents || 0) / 100);
    } catch (error) {
      return '$' + (Number(cents || 0) / 100).toFixed(2);
    }
  };

  const debounce = (fn, wait = 220) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  };

  const createSearchCard = (product) => {
    const link = document.createElement('a');
    link.className = 'melato-house-search-result';
    link.href = product.url || '#';

    const media = document.createElement('span');
    media.className = 'melato-house-search-result__media';

    const featured = product.featured_image && (product.featured_image.url || product.featured_image);
    if (featured) {
      const image = document.createElement('img');
      image.src = featured;
      image.alt = product.featured_image && product.featured_image.alt ? product.featured_image.alt : product.title || '';
      image.loading = 'lazy';
      media.appendChild(image);
    }

    const title = document.createElement('span');
    title.className = 'melato-house-search-result__title';
    title.textContent = product.title || '';

    const price = document.createElement('span');
    price.className = 'melato-house-search-result__price';
    price.textContent = moneyFormat(product.price || 0);

    link.append(media, title, price);
    return link;
  };

  const initHouseHeader = (root) => {
    if (!root || root.dataset.houseReady === 'true') return;
    root.dataset.houseReady = 'true';

    const menu = root.querySelector('[data-house-menu]');
    const menuOpen = root.querySelector('[data-house-menu-open]');
    const menuClose = root.querySelector('[data-house-menu-close]');
    const search = root.querySelector('[data-house-search]');
    const searchOpeners = root.querySelectorAll('[data-house-search-open]');
    const searchClose = root.querySelector('[data-house-search-close]');
    const searchInput = root.querySelector('[data-house-search-input]');
    const searchResults = root.querySelector('[data-house-search-results]');
    const searchStatus = root.querySelector('[data-house-search-status]');
    let previousFocus = null;
    let requestController = null;

    const lockPage = (locked) => document.body.classList.toggle('melato-house-lock', !!locked);

    const reveal = (panel) => {
      if (!panel) return;
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      panel.setAttribute('aria-hidden', 'false');
    };

    const conceal = (panel) => {
      if (!panel || panel.hidden) return;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => {
        if (!panel.classList.contains('is-open')) panel.hidden = true;
      }, 330);
    };

    const closeMenu = (restoreFocus = false) => {
      conceal(menu);
      if (menuOpen) menuOpen.setAttribute('aria-expanded', 'false');
      if (!search || !search.classList.contains('is-open')) lockPage(false);
      if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };

    const closeSearch = (restoreFocus = false) => {
      conceal(search);
      searchOpeners.forEach((button) => button.setAttribute('aria-expanded', 'false'));
      if (!menu || !menu.classList.contains('is-open')) lockPage(false);
      if (requestController) requestController.abort();
      requestController = null;
      if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };

    const openMenu = () => {
      previousFocus = document.activeElement;
      closeSearch(false);
      reveal(menu);
      if (menuOpen) menuOpen.setAttribute('aria-expanded', 'true');
      lockPage(true);
      window.setTimeout(() => {
        const first = menu && menu.querySelector('[data-house-menu-close], a, button');
        if (first) first.focus();
      }, 40);
    };

    const openSearch = () => {
      previousFocus = document.activeElement;
      closeMenu(false);
      reveal(search);
      searchOpeners.forEach((button) => button.setAttribute('aria-expanded', 'true'));
      lockPage(true);
      window.setTimeout(() => searchInput && searchInput.focus(), 60);
    };

    const runSearch = debounce(async () => {
      if (!searchInput || !searchResults) return;
      const term = searchInput.value.trim();

      if (requestController) requestController.abort();
      requestController = null;
      searchResults.replaceChildren();

      if (term.length < 2) {
        if (searchStatus) searchStatus.textContent = 'Type at least two characters.';
        return;
      }

      if (searchStatus) searchStatus.textContent = 'Searching Melato';
      requestController = new AbortController();

      const rootPath = window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root
        : '/';
      const endpoint = `${rootPath}search/suggest.json?q=${encodeURIComponent(term)}&resources[type]=product&resources[limit]=8&resources[options][unavailable_products]=show`;

      try {
        const response = await fetch(endpoint, {
          headers: { Accept: 'application/json' },
          signal: requestController.signal
        });
        if (!response.ok) throw new Error(`Predictive search returned ${response.status}`);
        const payload = await response.json();
        const products = payload && payload.resources && payload.resources.results
          ? payload.resources.results.products || []
          : [];

        searchResults.replaceChildren();
        if (!products.length) {
          if (searchStatus) searchStatus.textContent = `No products found for “${term}”.`;
          return;
        }

        const fragment = document.createDocumentFragment();
        products.forEach((product) => fragment.appendChild(createSearchCard(product)));
        searchResults.appendChild(fragment);
        if (searchStatus) searchStatus.textContent = `${products.length} product${products.length === 1 ? '' : 's'} found.`;
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Melato predictive search error:', error);
        if (searchStatus) searchStatus.textContent = 'Search suggestions are temporarily unavailable. Press Enter to search.';
      }
    }, 220);

    if (menuOpen) menuOpen.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', () => closeMenu(true));
    searchOpeners.forEach((button) => button.addEventListener('click', openSearch));
    if (searchClose) searchClose.addEventListener('click', () => closeSearch(true));
    if (searchInput) searchInput.addEventListener('input', runSearch);

    if (menu) {
      menu.addEventListener('click', (event) => {
        if (event.target === menu) closeMenu(true);
      });
    }
    if (search) {
      search.addEventListener('click', (event) => {
        if (event.target === search) closeSearch(true);
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (search && search.classList.contains('is-open')) closeSearch(true);
      else if (menu && menu.classList.contains('is-open')) closeMenu(true);
    });

    const syncScrollState = () => root.classList.toggle('is-scrolled', window.scrollY > 8);
    syncScrollState();
    window.addEventListener('scroll', syncScrollState, { passive: true });
  };

  const syncHousePdpCopy = (root) => {
    if (!root) return;

    const setKicker = root.querySelector('.pdp-set .pdp-kicker');
    if (setKicker) setKicker.textContent = 'Complete the look';

    const setCta = root.querySelector('.pdp-set .pdp-set-cta');
    if (setCta) setCta.textContent = 'View matching piece';

    const setTotalLabel = root.querySelector('.pdp-set-total span');
    if (setTotalLabel) setTotalLabel.textContent = 'Full look';

    root.querySelectorAll('[data-pdp-atc], [data-pdp-sticky-button]').forEach((button) => {
      if (!button.disabled) button.textContent = 'Add to bag';
    });
  };

  const initHousePdp = (root) => {
    if (!root || root.dataset.housePdpReady === 'true') return;
    root.dataset.housePdpReady = 'true';
    syncHousePdpCopy(root);

    document.addEventListener('variant:change', () => {
      window.requestAnimationFrame(() => syncHousePdpCopy(root));
    });
  };

  const boot = () => {
    document.querySelectorAll('[data-house-header]').forEach(initHouseHeader);
    document.querySelectorAll('.melato-pdp-rebuild').forEach(initHousePdp);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('shopify:section:load', boot);
})();
