(() => {
  'use strict';

  const ROOT_SELECTOR = '[data-melato-living-book]';
  const PRODUCT_SELECTOR = '.mlb-product[href*="/products/"]';
  const CACHE_TTL = 60 * 1000;
  const productCache = new Map();

  const rootPath = () => {
    const root = String(window.Shopify?.routes?.root || '/');
    return root.endsWith('/') ? root : `${root}/`;
  };

  const route = path => `${rootPath()}${String(path || '').replace(/^\//, '')}`;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));

  const formatMoney = cents => {
    const amount = Number(cents || 0) / 100;
    const currencyCode = String(window.DRIP?.shop?.currency || 'CAD').toUpperCase();
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en-CA', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'narrowSymbol'
      }).format(amount);
    } catch (error) {
      if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
        return window.Shopify.formatMoney(Number(cents || 0), window.DRIP?.shop?.moneyFormat || '${{amount}}');
      }
      return `$${amount.toFixed(2)}`;
    }
  };

  const track = (event, detail = {}) => {
    const payload = { event, ...detail };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent(event, { detail }));
  };

  class MelatoLookDrawer extends HTMLElement {
    constructor() {
      super();
      this.phase = 'closed';
      this.invoker = null;
      this.controller = null;
      this.sequence = 0;
      this.scrollY = 0;
      this.inerted = [];
      this.lookId = '';
      this.source = '';
      this.onKeydown = this.onKeydown.bind(this);
    }

    connectedCallback() {
      if (this.dataset.initialized === 'true') return;
      this.dataset.initialized = 'true';
      this.className = 'melato-look-drawer';
      this.dataset.phase = 'closed';
      this.hidden = true;
      this.innerHTML = `
        <div class="melato-look-drawer__backdrop" data-look-close aria-hidden="true"></div>
        <section class="melato-look-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="MelatoLookDrawerTitle" tabindex="-1">
          <header class="melato-look-drawer__header">
            <div>
              <span class="melato-look-drawer__eyebrow">Melato Living</span>
              <h2 id="MelatoLookDrawerTitle">View the Look</h2>
            </div>
            <button class="melato-look-drawer__close" type="button" data-look-close aria-label="Close look">Close</button>
          </header>
          <div class="melato-look-drawer__body" data-look-body></div>
          <div class="melato-look-drawer__live" role="status" aria-live="polite" aria-atomic="true" data-look-live></div>
        </section>`;

      this.panel = this.querySelector('.melato-look-drawer__panel');
      this.bodyHost = this.querySelector('[data-look-body]');
      this.live = this.querySelector('[data-look-live]');

      this.addEventListener('click', event => {
        if (event.target.closest('[data-look-close]')) {
          event.preventDefault();
          if (this.phase !== 'adding') this.close('explicit');
          return;
        }

        const addButton = event.target.closest('[data-look-add]');
        if (addButton) {
          event.preventDefault();
          this.addToCart(addButton);
          return;
        }

        const productLink = event.target.closest('[data-look-product-link]');
        if (productLink) {
          track('melato:look-product-click', {
            look_id: this.lookId,
            source: this.source,
            product_handle: productLink.dataset.productHandle || ''
          });
        }
      });

      this.addEventListener('change', event => {
        const select = event.target.closest('[data-look-variant]');
        if (!select) return;
        const card = select.closest('[data-look-product-card]');
        const option = select.selectedOptions[0];
        const price = card?.querySelector('[data-look-price]');
        const add = card?.querySelector('[data-look-add]');
        if (price && option) price.textContent = option.dataset.priceLabel || price.textContent;
        if (add && option) {
          add.disabled = option.disabled || option.dataset.available !== 'true';
          add.textContent = add.disabled ? 'Unavailable' : 'Add to Bag';
        }
      });
    }

    announce(message) {
      if (!this.live) return;
      this.live.textContent = '';
      requestAnimationFrame(() => { this.live.textContent = message || ''; });
    }

    setPhase(phase) {
      this.phase = phase;
      this.dataset.phase = phase;
    }

    lockBackground() {
      this.scrollY = window.scrollY || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      this.inerted = [];
      Array.from(document.body.children).forEach(node => {
        if (node === this || ['SCRIPT', 'STYLE', 'LINK'].includes(node.tagName)) return;
        if (!node.hasAttribute('inert')) {
          node.setAttribute('inert', '');
          this.inerted.push(node);
        }
      });
    }

    unlockBackground() {
      this.inerted.forEach(node => node.removeAttribute('inert'));
      this.inerted = [];
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, this.scrollY);
    }

    focusables() {
      return Array.from(this.querySelectorAll(
        'button:not([disabled]),a[href],select:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )).filter(node => !node.hidden && node.offsetParent !== null);
    }

    onKeydown(event) {
      if (this.phase === 'closed') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (this.phase !== 'adding') this.close('escape');
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = this.focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    skeleton(baseline) {
      const title = baseline.frameLabel ? `Look ${escapeHtml(baseline.frameLabel)}` : 'Selected look';
      const cards = baseline.products.map(product => `
        <article class="melato-look-product is-loading" aria-hidden="true">
          <div class="melato-look-product__media melato-look-skeleton"></div>
          <div class="melato-look-product__copy">
            <span class="melato-look-skeleton melato-look-skeleton--line"></span>
            <span class="melato-look-skeleton melato-look-skeleton--line is-short"></span>
          </div>
        </article>`).join('');
      this.bodyHost.innerHTML = `<div class="melato-look-drawer__look-meta"><span>${title}</span></div><div class="melato-look-drawer__products" aria-busy="true">${cards}</div>`;
    }

    async open(baseline, invoker) {
      this.sequence += 1;
      const token = this.sequence;
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      this.invoker = invoker || document.activeElement;
      this.lookId = baseline.lookId;
      this.source = baseline.source || 'editorial-spread';

      if (this.phase === 'closed') {
        this.hidden = false;
        this.setPhase('opening');
        this.lockBackground();
        document.addEventListener('keydown', this.onKeydown);
        requestAnimationFrame(() => {
          if (this.phase === 'opening') this.setPhase('loading');
        });
      } else {
        this.setPhase('loading');
      }

      this.skeleton(baseline);
      this.panel?.focus({ preventScroll: true });
      this.announce('Loading look details.');
      track('melato:look-drawer-open', { look_id: this.lookId, source: this.source });

      try {
        const products = await Promise.all(baseline.products.map(product => this.resolveProduct(product, this.controller.signal)));
        if (token !== this.sequence || this.controller.signal.aborted) return;
        this.renderProducts(baseline, products);
        this.setPhase('ready');
        this.announce('Look details loaded.');
        this.querySelector('[data-look-variant], [data-look-add], [data-look-product-link]')?.focus({ preventScroll: true });
      } catch (error) {
        if (error?.name === 'AbortError' || token !== this.sequence) return;
        console.error('Melato look drawer:', error);
        this.renderFallback(baseline, error);
        this.setPhase('error');
        this.announce('Live product details could not be loaded. Product page links remain available.');
      }
    }

    async resolveProduct(baseline, signal) {
      const cacheKey = baseline.url;
      const cached = productCache.get(cacheKey);
      if (cached && Date.now() - cached.at < CACHE_TTL) return { ...cached.data, baseline };

      const url = new URL(baseline.url, window.location.origin);
      const endpoint = `${url.pathname.replace(/\/$/, '')}.js`;
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        signal,
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!response.ok) throw new Error(`Product request failed (${response.status}).`);
      const product = await response.json();
      if (!product || !Array.isArray(product.variants)) throw new Error('Product response was invalid.');
      productCache.set(cacheKey, { at: Date.now(), data: product });
      return { ...product, baseline };
    }

    renderProducts(baseline, products) {
      const title = baseline.frameLabel ? `Look ${escapeHtml(baseline.frameLabel)}` : 'Selected look';
      const note = baseline.note ? `<p>${escapeHtml(baseline.note)}</p>` : '';
      this.bodyHost.innerHTML = `
        <div class="melato-look-drawer__look-meta"><span>${title}</span>${note}</div>
        <div class="melato-look-drawer__products" aria-busy="false">${products.map(product => this.productCard(product)).join('')}</div>`;
    }

    productCard(product) {
      const baseline = product.baseline || {};
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const availableVariant = variants.find(variant => variant.available) || variants[0];
      const image = product.featured_image || baseline.image || '';
      const title = product.title || baseline.title || 'Melato piece';
      const handle = product.handle || baseline.handle || '';
      const options = variants.map(variant => {
        const available = Boolean(variant.available);
        const selected = availableVariant && String(variant.id) === String(availableVariant.id);
        const variantTitle = variant.title && variant.title !== 'Default Title' ? variant.title : 'Default';
        const label = `${variantTitle} · ${formatMoney(variant.price)}${available ? '' : ' · Sold out'}`;
        return `<option value="${escapeHtml(variant.id)}" data-available="${available}" data-price-label="${escapeHtml(formatMoney(variant.price))}" ${selected ? 'selected' : ''} ${available ? '' : 'disabled'}>${escapeHtml(label)}</option>`;
      }).join('');
      const hasChoices = variants.length > 1 || (variants[0]?.title && variants[0].title !== 'Default Title');
      const selector = variants.length ? `
        <label class="melato-look-product__variant ${hasChoices ? '' : 'is-visually-hidden'}">
          <span>${hasChoices ? 'Choose option' : 'Variant'}</span>
          <select data-look-variant aria-label="Choose option for ${escapeHtml(title)}">${options}</select>
        </label>` : '';
      const addDisabled = !availableVariant || !availableVariant.available;
      const price = availableVariant ? formatMoney(availableVariant.price) : (product.price ? formatMoney(product.price) : 'Unavailable');
      const media = image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">` : '<span class="melato-look-product__media-placeholder" aria-hidden="true"></span>';

      return `
        <article class="melato-look-product" data-look-product-card data-product-handle="${escapeHtml(handle)}">
          <a class="melato-look-product__media" href="${escapeHtml(baseline.url || '#')}" data-look-product-link data-product-handle="${escapeHtml(handle)}" tabindex="-1" aria-hidden="true">${media}</a>
          <div class="melato-look-product__copy">
            <div class="melato-look-product__heading">
              <a href="${escapeHtml(baseline.url || '#')}" data-look-product-link data-product-handle="${escapeHtml(handle)}">${escapeHtml(title)}</a>
              <span data-look-price>${escapeHtml(price)}</span>
            </div>
            ${selector}
            <button type="button" class="melato-look-product__add" data-look-add ${addDisabled ? 'disabled' : ''}>${addDisabled ? 'Unavailable' : 'Add to Bag'}</button>
            <p class="melato-look-product__status" data-look-product-status aria-live="polite"></p>
          </div>
        </article>`;
    }

    renderFallback(baseline, error) {
      const products = baseline.products.map(product => `
        <a class="melato-look-fallback-card" href="${escapeHtml(product.url)}">
          ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy">` : ''}
          <span><strong>${escapeHtml(product.title)}</strong><small>View product</small></span>
        </a>`).join('');
      this.bodyHost.innerHTML = `
        <div class="melato-look-drawer__error">
          <p>Live size and stock details are temporarily unavailable.</p>
          <small>${escapeHtml(error?.message || '')}</small>
        </div>
        <div class="melato-look-drawer__products">${products}</div>`;
    }

    async addToCart(button) {
      if (this.phase === 'adding' || button.disabled) return;
      const card = button.closest('[data-look-product-card]');
      const select = card?.querySelector('[data-look-variant]');
      const variantId = select?.value;
      const status = card?.querySelector('[data-look-product-status]');
      const handle = card?.dataset.productHandle || '';
      if (!variantId) return;

      this.setPhase('adding');
      const original = button.textContent;
      button.disabled = true;
      button.textContent = 'Adding…';
      if (status) status.textContent = '';

      try {
        const response = await fetch(route('cart/add.js'), {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.description || payload.message || 'Unable to add this piece.');

        const cartResponse = await fetch(route('cart.js'), {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        });
        const cart = cartResponse.ok ? await cartResponse.json() : null;
        if (cart) {
          document.querySelectorAll('[data-cart-item-count], .cart-count, .mxh__bag-count').forEach(node => {
            node.textContent = String(cart.item_count || 0);
          });
          window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart, source: 'melato-look-drawer' } }));
        }

        if (status) status.textContent = 'Added to Bag.';
        button.textContent = 'Added';
        this.announce('Added to Bag.');
        track('melato:look-add', { look_id: this.lookId, source: this.source, product_handle: handle, variant_id: String(variantId) });
        window.setTimeout(() => {
          button.disabled = false;
          button.textContent = original;
        }, 900);
      } catch (error) {
        console.error('Melato look add:', error);
        if (status) status.textContent = error.message || 'Unable to add this piece.';
        button.disabled = false;
        button.textContent = original;
        this.announce(error.message || 'Unable to add this piece.');
      } finally {
        this.setPhase('ready');
      }
    }

    close(reason = 'close') {
      if (this.phase === 'closed') return;
      if (this.controller) this.controller.abort();
      this.sequence += 1;
      this.setPhase('closing');
      document.removeEventListener('keydown', this.onKeydown);
      const finish = () => {
        if (this.phase !== 'closing') return;
        this.hidden = true;
        this.setPhase('closed');
        this.bodyHost.innerHTML = '';
        this.unlockBackground();
        if (this.invoker && typeof this.invoker.focus === 'function') this.invoker.focus({ preventScroll: true });
        track('melato:look-drawer-close', { look_id: this.lookId, source: this.source, reason });
      };
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(finish, reduced ? 0 : 280);
    }
  }

  if (!customElements.get('melato-look-drawer')) customElements.define('melato-look-drawer', MelatoLookDrawer);

  function getDrawer() {
    let drawer = document.querySelector('melato-look-drawer[data-melato-shared-look-drawer]');
    if (!drawer) {
      drawer = document.createElement('melato-look-drawer');
      drawer.dataset.melatoSharedLookDrawer = 'true';
      document.body.appendChild(drawer);
    }
    return drawer;
  }

  function baselineFrom(details, source = 'editorial-spread') {
    const figure = details.closest('.mlb-frame');
    const frameLabel = figure?.querySelector('.mlb-num')?.textContent?.trim() || '';
    const note = details.querySelector('.mlb-note')?.textContent?.trim() || '';
    const products = Array.from(details.querySelectorAll(PRODUCT_SELECTOR)).map(anchor => {
      const url = new URL(anchor.href, window.location.origin);
      const parts = url.pathname.split('/').filter(Boolean);
      return {
        url: url.pathname,
        handle: parts[parts.length - 1] || '',
        title: anchor.querySelector('strong')?.textContent?.trim() || anchor.getAttribute('aria-label') || 'Melato piece',
        image: anchor.querySelector('img')?.currentSrc || anchor.querySelector('img')?.src || ''
      };
    });
    return {
      lookId: frameLabel ? `frame-${frameLabel}` : `look-${Math.random().toString(36).slice(2, 8)}`,
      frameLabel,
      note,
      source,
      products
    };
  }

  function enhance(scope = document) {
    const roots = Array.from(scope.querySelectorAll?.(ROOT_SELECTOR) || []);
    if (scope.matches?.(ROOT_SELECTOR)) roots.unshift(scope);
    roots.forEach(root => {
      root.querySelectorAll('.mlb-shop').forEach(details => {
        if (details.dataset.lookDrawerEnhanced === 'true') return;
        const baseline = baselineFrom(details);
        if (!baseline.products.length) return;

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'mlb-view-look-trigger';
        trigger.dataset.lookId = baseline.lookId;
        trigger.dataset.lookSource = baseline.source;
        trigger.innerHTML = '<span>View the Look</span><span aria-hidden="true">+</span>';
        trigger.addEventListener('click', () => getDrawer().open(baselineFrom(details), trigger));

        details.insertAdjacentElement('beforebegin', trigger);
        details.dataset.lookDrawerEnhanced = 'true';
        details.hidden = true;
      });
      root.dataset.lookDrawerReady = 'true';
    });
  }

  const init = () => enhance(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  document.addEventListener('shopify:section:load', event => enhance(event.target));
})();
