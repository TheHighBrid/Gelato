(() => {
  'use strict';

  const DESKTOP_KEY = 'melato_house_plp_density_desktop';
  const MOBILE_KEY = 'melato_house_plp_density_mobile';
  const MOBILE_QUERY = '(max-width: 900px)';

  const safeGet = (key) => {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  };

  const safeSet = (key, value) => {
    try { window.localStorage.setItem(key, String(value)); } catch (error) {}
  };

  const parseDensity = (value, allowed, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return allowed.includes(parsed) ? parsed : fallback;
  };

  const colourCountFromSwatches = (container) => {
    if (!container || container.dataset.houseColourCountReady === 'true') return;
    const visibleSwatches = container.querySelectorAll('.swatch').length;
    const extraLabel = Array.from(container.querySelectorAll('.text-label')).find((node) => /^\+\d+/.test((node.textContent || '').trim()));
    const extra = extraLabel ? Number.parseInt((extraLabel.textContent || '').replace(/\D/g, ''), 10) || 0 : 0;
    const total = visibleSwatches + extra;
    if (!total) return;

    container.dataset.houseColourCountReady = 'true';
    const label = document.createElement('span');
    label.className = 'text-label melato-house-colour-count';
    label.textContent = `${total} ${total === 1 ? 'colour' : 'colours'}`;
    container.setAttribute('aria-label', label.textContent);
    container.replaceChildren(label);
  };

  const enhanceColourCounts = (scope) => {
    (scope || document).querySelectorAll('.product-card__swatches').forEach(colourCountFromSwatches);
  };

  const createEditorialTile = (root, grid) => {
    if (!root || !grid || grid.querySelector('.melato-house-editorial-tile')) return;

    const hero = root.querySelector('.melato-collection-hero__image');
    const productGrid = grid.querySelector('.melato-product-grid__inner');
    if (!hero || !productGrid) return;

    const items = Array.from(productGrid.children).filter((node) => node.classList.contains('melato-product-grid__item'));
    if (items.length < 6) return;

    const figure = document.createElement('figure');
    figure.className = 'melato-house-editorial-tile';
    figure.setAttribute('aria-label', 'Collection editorial image');

    const image = document.createElement('img');
    image.src = hero.currentSrc || hero.src;
    if (hero.srcset) image.srcset = hero.srcset;
    image.sizes = '100vw';
    image.alt = '';
    image.loading = 'lazy';

    const caption = document.createElement('figcaption');
    const kicker = document.createElement('span');
    kicker.textContent = 'Melato / Collection';
    const title = document.createElement('strong');
    const heading = root.querySelector('.melato-collection-title');
    title.textContent = heading ? heading.textContent.trim() : 'Current collection';

    caption.append(kicker, title);
    figure.append(image, caption);
    items[3].after(figure);
  };

  const buildDensityControls = (root, grid, mediaQuery, setDensity) => {
    const toolbar = root.querySelector('[data-collection-toolbar]');
    if (!toolbar) return null;

    const existing = toolbar.querySelector('[data-house-density-controls]');
    if (existing) return existing;

    const wrapper = document.createElement('div');
    wrapper.className = 'melato-house-density';
    wrapper.dataset.houseDensityControls = '';
    wrapper.setAttribute('aria-label', 'Product grid density');

    const label = document.createElement('span');
    label.className = 'melato-house-density__label';
    label.textContent = 'View';

    const makeGroup = (mode, values) => {
      const group = document.createElement('div');
      group.className = `melato-house-density__group melato-house-density__group--${mode}`;
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', `${mode === 'mobile' ? 'Mobile' : 'Desktop'} grid columns`);

      values.forEach((value) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(value);
        button.dataset.houseDensityValue = String(value);
        button.dataset.houseDensityMode = mode;
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `Show ${value} product${value === 1 ? '' : 's'} per row`);
        button.addEventListener('click', () => setDensity(value, true));
        group.appendChild(button);
      });

      return group;
    };

    wrapper.append(label, makeGroup('desktop', [2, 4, 6]), makeGroup('mobile', [1, 2]));

    const sort = toolbar.querySelector('.melato-sort-wrap');
    if (sort) toolbar.insertBefore(wrapper, sort);
    else toolbar.appendChild(wrapper);

    return wrapper;
  };

  const initCollection = (root) => {
    if (!root || root.dataset.houseCollectionReady === 'true') return;
    const grid = root.querySelector('[data-product-grid]');
    if (!grid) return;

    root.dataset.houseCollectionReady = 'true';
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const desktopFallback = Number.parseInt(grid.dataset.colsDesktop || '4', 10) === 2 ? 2 : 4;
    const mobileFallback = Number.parseInt(grid.dataset.colsMobile || '2', 10) === 1 ? 1 : 2;

    const getPreferredDensity = () => mediaQuery.matches
      ? parseDensity(safeGet(MOBILE_KEY), [1, 2], mobileFallback)
      : parseDensity(safeGet(DESKTOP_KEY), [2, 4, 6], desktopFallback);

    let controls = null;

    const updateButtons = (value) => {
      if (!controls) return;
      controls.querySelectorAll('[data-house-density-value]').forEach((button) => {
        const modeMatches = mediaQuery.matches
          ? button.dataset.houseDensityMode === 'mobile'
          : button.dataset.houseDensityMode === 'desktop';
        const active = modeMatches && Number.parseInt(button.dataset.houseDensityValue, 10) === value;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    const setDensity = (value, persist) => {
      const allowed = mediaQuery.matches ? [1, 2] : [2, 4, 6];
      const fallback = mediaQuery.matches ? mobileFallback : desktopFallback;
      const next = parseDensity(value, allowed, fallback);
      grid.dataset.houseDensity = String(next);
      root.dataset.houseDensity = String(next);
      updateButtons(next);
      if (persist) safeSet(mediaQuery.matches ? MOBILE_KEY : DESKTOP_KEY, next);
      root.dispatchEvent(new CustomEvent('melato:collection-density', { detail: { density: next } }));
    };

    controls = buildDensityControls(root, grid, mediaQuery, setDensity);
    setDensity(getPreferredDensity(), false);

    const enhanceGrid = () => {
      enhanceColourCounts(grid);
      createEditorialTile(root, grid);
    };

    enhanceGrid();

    let enhanceFrame = 0;
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(enhanceFrame);
      enhanceFrame = window.requestAnimationFrame(enhanceGrid);
    });
    observer.observe(grid, { childList: true, subtree: true });

    const syncViewport = () => setDensity(getPreferredDensity(), false);
    if (typeof mediaQuery.addEventListener === 'function') mediaQuery.addEventListener('change', syncViewport);
    else if (typeof mediaQuery.addListener === 'function') mediaQuery.addListener(syncViewport);
  };

  const boot = () => document.querySelectorAll('[data-collection-root]').forEach(initCollection);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('shopify:section:load', boot);
})();
