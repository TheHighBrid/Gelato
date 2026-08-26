(() => {
  'use strict';

  // Global storefront QA layer. Derive the sibling Shopify asset URL from this script
  // so the fix stays cache-versioned with the theme instead of hard-coding a CDN host.
  try {
    const current = document.currentScript?.src || '';
    if (current && !document.querySelector('script[data-melato-mobile-qa]')) {
      const qaUrl = current.replace(/melato-cart-drawer\.js(?:\?[^#]*)?$/i, 'melato-mobile-qa-20260826.js');
      if (qaUrl !== current) {
        const qa = document.createElement('script');
        qa.src = qaUrl;
        qa.defer = true;
        qa.dataset.melatoMobileQa = 'true';
        document.head.appendChild(qa);
      }
    }
  } catch (error) {
    console.warn('Melato QA loader:', error);
  }

  const drawer = document.getElementById('cart-drawer') || document.querySelector('.cart-drawer');
  if (!drawer) return;

  const overlay = document.getElementById('drip-overlay') || document.querySelector('[data-overlay]');
  const pendingForms = new WeakSet();
  let lastFocused = null;

  const locale = () => document.documentElement.lang || navigator.language || 'en-CA';
  const rootPath = () => {
    const root = String(window.Shopify?.routes?.root || '/');
    return root.endsWith('/') ? root : `${root}/`;
  };
  const route = path => `${rootPath()}${String(path || '').replace(/^\//, '')}`;
  const currency = cart => String((cart && cart.currency) || window.DRIP?.shop?.currency || 'CAD').toUpperCase();
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]));

  function formatMoney(cents, code) {
    const amount = Number(cents || 0) / 100;
    const currencyCode = String(code || window.DRIP?.shop?.currency || 'CAD').trim().toUpperCase();
    try {
      return new Intl.NumberFormat(locale(), {
        style:'currency', currency:currencyCode, currencyDisplay:'narrowSymbol'
      }).format(amount);
    } catch (error) {
      if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
        return window.Shopify.formatMoney(Number(cents || 0), window.DRIP?.shop?.moneyFormat || '${{amount}}');
      }
      return `$${amount.toFixed(2)}`;
    }
  }

  function toast(message) {
    const node = document.getElementById('drip-toast');
    if (!node || !message) return;
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('is-visible'), 2200);
  }

  async function fetchCart(attempt = 0) {
    const suffix = attempt ? `?melato_refresh=${Date.now()}` : '';
    const response = await fetch(`${route('cart.js')}${suffix}`, {
      method:'GET',
      credentials:'same-origin',
      cache:'no-store',
      headers:{ Accept:'application/json', 'X-Requested-With':'XMLHttpRequest' }
    });
    if (!response.ok) {
      if (attempt < 1) return fetchCart(attempt + 1);
      throw new Error(`Cart request failed (${response.status}).`);
    }
    const payload = await response.json().catch(() => null);
    if (!payload || !Array.isArray(payload.items)) {
      if (attempt < 1) return fetchCart(attempt + 1);
      throw new Error('Cart response was invalid.');
    }
    return payload;
  }

  function openCart() {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    overlay?.classList.add('is-visible');
    overlay?.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => drawer.querySelector('[data-cart-close],button,a,input,textarea,select')?.focus(), 40);
  }

  function closeCart() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    drawer.setAttribute('inert','');
    overlay?.classList.remove('is-visible');
    overlay?.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function updateChrome(cart) {
    const count = Number(cart?.item_count || 0);
    const code = currency(cart);
    document.querySelectorAll('[data-cart-item-count],.cart-count,.mxh__bag-count').forEach(node => node.textContent = String(count));
    document.querySelectorAll('.mxh__bag').forEach(node => node.setAttribute('aria-label', `Cart with ${count} ${count === 1 ? 'item' : 'items'}`));
    drawer.querySelectorAll('[data-cart-subtotal],.cart-subtotal__amount').forEach(node => node.textContent = formatMoney(cart?.total_price || 0, code));
    drawer.querySelectorAll('[data-checkout-btn],button[name="checkout"]').forEach(button => button.disabled = count === 0);
    const countLabel = drawer.querySelector('[data-cart-count-label]');
    if (countLabel) countLabel.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  const emptyTemplate = drawer.querySelector('[data-cart-empty-template]');
  const initialEmptyMarkup = emptyTemplate?.innerHTML.trim() || '<div class="cart-drawer__empty"><p class="cart-drawer__empty-text">Your cart is empty.</p><a href="/collections/new-arrivals" class="melato-cart-cta">Explore new arrivals</a></div>';

  function renderItems(cart) {
    const host = drawer.querySelector('[data-cart-items],.cart-drawer__items');
    if (!host) return;
    if (!cart?.items?.length) {
      host.innerHTML = initialEmptyMarkup;
      return;
    }
    const code = currency(cart);
    host.innerHTML = cart.items.map(item => {
      const title = escapeHtml(item.product_title || item.title || 'Product');
      const url = escapeHtml(item.url || '#');
      const imageUrl = escapeHtml(item.image || item.featured_image?.url || '');
      const image = imageUrl ? `<img class="cart-item__img" src="${imageUrl}" alt="${title}" width="88" height="110" loading="lazy" decoding="async">` : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title' ? `<span class="cart-item__variant">${escapeHtml(item.variant_title)}</span>` : '';
      const key = escapeHtml(item.key || '');
      const quantity = Math.max(0, Number(item.quantity || 0));
      return `<div class="cart-item" role="listitem" data-line-key="${key}">
        <a href="${url}" class="cart-item__img-link" tabindex="-1" aria-hidden="true">${image}</a>
        <div class="cart-item__info">
          <div class="cart-item__top"><a href="${url}" class="cart-item__title">${title}</a><button class="cart-item__remove" type="button" aria-label="Remove ${title}" data-remove-line="${key}">×</button></div>
          ${variant}
          <div class="cart-item__footer">
            <div class="qty-stepper" aria-label="Quantity for ${title}">
              <button class="qty-stepper__btn" type="button" aria-label="Decrease quantity" data-qty-change="-1" data-line-key="${key}">−</button>
              <input class="qty-stepper__value" type="number" value="${quantity}" min="0" inputmode="numeric" aria-label="Quantity for ${title}" data-line-key="${key}">
              <button class="qty-stepper__btn" type="button" aria-label="Increase quantity" data-qty-change="1" data-line-key="${key}">+</button>
            </div>
            <span class="price">${formatMoney(item.final_line_price, code)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderCart(cart) {
    renderItems(cart);
    updateChrome(cart);
  }

  async function updateLine(key, quantity) {
    if (!key) return;
    drawer.classList.add('is-updating');
    try {
      const response = await fetch(route('cart/change.js'), {
        method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json',Accept:'application/json','X-Requested-With':'XMLHttpRequest'},
        body:JSON.stringify({id:key,quantity:Math.max(0,Number(quantity || 0))})
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.description || payload.message || 'Cart could not be updated.');
      renderCart(payload);
    } catch (error) {
      console.error('Melato cart update:', error);
      toast(error.message || 'Cart could not be updated.');
      fetchCart().then(renderCart).catch(() => {});
    } finally {
      drawer.classList.remove('is-updating');
    }
  }

  function isProductAddForm(form) {
    if (!form) return false;
    const action = form.getAttribute('action') || '';
    const hasVariant = Boolean(form.querySelector('[name="id"]'));
    const hasAdd = Boolean(form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]'));
    return action.includes('/cart/add') || form.matches('.pdp-form,.melato-clean-product__form,[data-product-form]') || (hasVariant && hasAdd);
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button.dataset.melatoOriginalText = button.textContent || '';
      button.dataset.melatoWasDisabled = button.disabled ? 'true' : 'false';
      button.disabled = true;
      button.classList.add('is-loading');
      button.textContent = 'Adding';
    } else {
      button.classList.remove('is-loading');
      button.textContent = button.dataset.melatoOriginalText || 'Add to cart';
      button.disabled = button.dataset.melatoWasDisabled === 'true';
    }
  }

  async function addForm(form, submitter) {
    if (pendingForms.has(form)) return;
    const id = form.querySelector('[name="id"]');
    if (!id?.value) {
      toast('Select an available option.');
      return;
    }
    pendingForms.add(form);
    const button = submitter?.matches?.('button,input[type="submit"]') ? submitter : form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]');
    setButtonLoading(button, true);
    try {
      const data = new FormData(form);
      if (!data.get('quantity')) data.set('quantity','1');
      const response = await fetch(route('cart/add.js'), {
        method:'POST', credentials:'same-origin', headers:{Accept:'application/json','X-Requested-With':'XMLHttpRequest'}, body:data
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.description || payload.message || 'Unable to add to cart.');
      const cart = await fetchCart();
      renderCart(cart);
      openCart();
      toast('Added to cart');
      window.dispatchEvent(new CustomEvent('cart:updated',{detail:{cart}}));
    } catch (error) {
      console.error('Melato add to cart:', error);
      toast(error.message || 'Unable to add to cart.');
    } finally {
      pendingForms.delete(form);
      setButtonLoading(button, false);
    }
  }

  function trapTab(event) {
    const nodes = Array.from(drawer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node => !node.hidden && node.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!isProductAddForm(form) || event.defaultPrevented) return;
    const submitter = event.submitter || document.activeElement;
    if (submitter?.closest?.('.shopify-payment-button,.shopify-payment-button__button')) return;
    event.preventDefault();
    addForm(form, submitter);
  });

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-cart-open],[data-cart-toggle],.mxh__bag');
    if (opener && !opener.closest('.cart-drawer')) {
      event.preventDefault();
      fetchCart().then(cart => {
        renderCart(cart);
        openCart();
      }).catch(error => {
        // Never paint a large failure toast over editorial content. If the AJAX
        // endpoint genuinely fails after retry, fall back to Shopify's cart page.
        console.error('Melato cart open:', error);
        window.location.assign(route('cart'));
      });
      return;
    }

    if (event.target.closest('[data-cart-close]')) { event.preventDefault(); closeCart(); return; }

    const quantityButton = event.target.closest('[data-qty-change]');
    if (quantityButton?.closest('.cart-drawer')) {
      event.preventDefault();
      const row = quantityButton.closest('.cart-item');
      const key = quantityButton.dataset.lineKey || row?.dataset.lineKey;
      const input = row?.querySelector('.qty-stepper__value');
      updateLine(key, Math.max(0, Number(input?.value || 0) + Number(quantityButton.dataset.qtyChange || 0)));
      return;
    }

    const removeButton = event.target.closest('[data-remove-line]');
    if (removeButton?.closest('.cart-drawer')) {
      event.preventDefault();
      updateLine(removeButton.dataset.removeLine || removeButton.closest('[data-line-key]')?.dataset.lineKey, 0);
      return;
    }

    const noteToggle = event.target.closest('.cart-note-toggle');
    if (noteToggle?.closest('.cart-drawer')) {
      const field = drawer.querySelector('#cart-note-field');
      const expanded = noteToggle.getAttribute('aria-expanded') === 'true';
      noteToggle.setAttribute('aria-expanded', String(!expanded));
      if (field) { field.hidden = expanded; field.setAttribute('aria-hidden', String(expanded)); }
    }
  });

  drawer.addEventListener('change', event => {
    const quantityInput = event.target.closest('.qty-stepper__value[data-line-key]');
    if (quantityInput) { updateLine(quantityInput.dataset.lineKey, Number(quantityInput.value || 0)); return; }
    const note = event.target.closest('[data-note-input]');
    if (note) {
      const hidden = drawer.querySelector('[data-note-hidden]');
      if (hidden) hidden.value = note.value;
    }
  });

  drawer.addEventListener('input', event => {
    const note = event.target.closest('[data-note-input]');
    if (!note) return;
    const hidden = drawer.querySelector('[data-note-hidden]');
    if (hidden) hidden.value = note.value;
  });

  overlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', event => {
    if (!drawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeCart(); }
    else if (event.key === 'Tab') trapTab(event);
  });
})();
