(() => {
  'use strict';

  const drawer = document.getElementById('cart-drawer') || document.querySelector('.cart-drawer');
  const overlay = document.getElementById('drip-overlay') || document.querySelector('[data-overlay]');
  const COMPLIMENTARY_DELIVERY_MESSAGE = 'Complimentary delivery on all orders.';
  const FREE_SHIPPING_THRESHOLD = (window.DRIP && window.DRIP.shop && window.DRIP.shop.freeShippingThreshold) || 0;
  const pendingForms = new WeakSet();
  let lastFocused = null;

  if (!drawer) return;

  function formatMoney(cents) {
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      const fmt = (window.DRIP && window.DRIP.shop && window.DRIP.shop.moneyFormat) || '${{amount}}';
      return window.Shopify.formatMoney(cents, fmt);
    }
    return '$' + (Number(cents || 0) / 100).toFixed(2);
  }

  function escapeHtml(value) {
    return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function showToast(message) {
    const toast = document.getElementById('drip-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      const args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function fetchCart() {
    return fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((response) => response.json());
  }

  function openCart() {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    const focusTarget = drawer.querySelector('[data-cart-close], button, a, input, textarea, select');
    if (focusTarget) window.setTimeout(() => focusTarget.focus(), 40);
  }

  function closeCart() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function trapTab(event) {
    const focusables = Array.from(drawer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function updateCounts(count) {
    document.querySelectorAll('[data-cart-item-count], .cart-count, .mxh__bag-count').forEach((el) => { el.textContent = String(count || 0); });
    document.querySelectorAll('.mxh__bag').forEach((el) => el.setAttribute('aria-label', 'Cart with ' + String(count || 0) + ' ' + ((count || 0) === 1 ? 'item' : 'items')));
  }

  function updateSubtotal(total) {
    drawer.querySelectorAll('[data-cart-subtotal], .cart-subtotal__amount').forEach((el) => { el.textContent = formatMoney(total || 0); });
  }

  function updateCheckout(count) {
    drawer.querySelectorAll('[data-checkout-btn], button[name="checkout"]').forEach((button) => { button.disabled = !count; });
  }

  function updateShipping(cart) {
    const bars = drawer.querySelectorAll('[data-shipping-bar], .cart-free-shipping');
    bars.forEach((bar) => {
      const threshold = FREE_SHIPPING_THRESHOLD;
      if (!threshold || threshold <= 0) {
        // No threshold configured — show flat "complimentary delivery" message
        const textEl = bar.querySelector('[data-shipping-text], .cart-free-shipping__text');
        if (textEl) textEl.textContent = COMPLIMENTARY_DELIVERY_MESSAGE;
        bar.hidden = false;
        bar.style.display = '';
        return;
      }
      const total     = (cart && cart.total_price) ? cart.total_price : 0;
      const remaining = Math.max(0, threshold - total);
      const pct       = Math.min(100, Math.round((total / threshold) * 100));
      const unlocked  = total >= threshold;

      const textEl = bar.querySelector('[data-shipping-text], .cart-free-shipping__text');
      const fillEl = bar.querySelector('[data-shipping-fill], .cart-free-shipping__fill');
      const progressEl = bar.querySelector('[role="progressbar"], .cart-free-shipping__bar');

      if (textEl) {
        textEl.innerHTML = unlocked
          ? '<span class="cart-free-shipping__unlocked">✓ Free shipping unlocked!</span>'
          : '<strong>' + formatMoney(remaining) + '</strong> away from free shipping';
      }
      if (fillEl) {
        fillEl.style.width = pct + '%';
        fillEl.classList.toggle('is-complete', unlocked);
      }
      if (progressEl) {
        progressEl.setAttribute('aria-valuenow', pct);
        progressEl.setAttribute('aria-valuetext', unlocked ? 'Free shipping unlocked' : pct + '% to free shipping');
      }
      bar.hidden = false;
      bar.style.display = '';
    });
  }

  function renderItems(cart) {
    const container = drawer.querySelector('[data-cart-items], .cart-drawer__items');
    if (!container) return;

    if (!cart.items || !cart.items.length) {
      container.innerHTML = '<div class="cart-drawer__empty"><p class="cart-drawer__empty-text">Your cart is empty.</p><p class="cart-drawer__empty-sub">Explore the latest uniform pieces.</p><a href="/collections/drop-001-texture-form" class="melato-cart-cta" data-cart-close>Shop the Uniform</a></div>';
      return;
    }

    container.innerHTML = cart.items.map((item) => {
      const img = item.image ? '<img class="cart-item__img" src="' + item.image + '" alt="' + escapeHtml(item.title) + '" width="88" height="110" loading="lazy">' : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title' ? '<span class="cart-item__variant">' + escapeHtml(item.variant_title) + '</span>' : '';
      const savings = item.original_line_price && item.original_line_price > item.final_line_price ? '<span class="cart-item__savings">Save ' + formatMoney(item.original_line_price - item.final_line_price) + '</span>' : '';
      return '<div class="cart-item" role="listitem" data-line-key="' + escapeHtml(item.key) + '"><a href="' + item.url + '" class="cart-item__img-link" tabindex="-1" aria-hidden="true">' + img + '</a><div class="cart-item__info"><div class="cart-item__top"><a href="' + item.url + '" class="cart-item__title">' + escapeHtml(item.product_title) + '</a><button class="cart-item__remove" type="button" aria-label="Remove ' + escapeHtml(item.product_title) + '" data-remove-line>×</button></div>' + variant + savings + '<div class="cart-item__footer"><div class="qty-stepper" aria-label="Quantity for ' + escapeHtml(item.product_title) + '"><button class="qty-stepper__btn" type="button" aria-label="Decrease quantity" data-qty-change="-1">−</button><input class="qty-stepper__value" type="number" value="' + item.quantity + '" min="0" aria-label="Quantity"><button class="qty-stepper__btn" type="button" aria-label="Increase quantity" data-qty-change="1">+</button></div><span class="price">' + formatMoney(item.final_line_price) + '</span></div></div></div>';
    }).join('');
  }

  function renderCart(cart) {
    if (!cart) return;
    renderItems(cart);
    updateCounts(cart.item_count);
    updateSubtotal(cart.total_price);
    updateShipping(cart);
    updateCheckout(cart.item_count);
  }

  function updateLine(key, quantity) {
    if (!key) return;
    drawer.classList.add('is-updating');
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then((response) => response.json()).then(renderCart).catch((error) => {
      console.error('Melato cart update error:', error);
      showToast('Cart could not be updated.');
    }).finally(() => drawer.classList.remove('is-updating'));
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalText = button.textContent || '';
      button.disabled = true;
      button.classList.add('is-loading', 'btn--loading');
      button.textContent = 'Adding';
    } else {
      button.disabled = false;
      button.classList.remove('is-loading', 'btn--loading');
      button.textContent = button.dataset.originalText || 'Add to cart';
    }
  }

  function isProductAddForm(form) {
    if (!form) return false;
    const action = form.getAttribute('action') || '';
    const hasVariant = !!form.querySelector('[name="id"]');
    const hasAddButton = !!form.querySelector('[name="add"], [data-pdp-atc], [data-atc-btn]');
    return action.includes('/cart/add') || form.matches('.pdp-form, .melato-clean-product__form, [data-product-form]') || (hasVariant && hasAddButton);
  }

  function addFormToCart(form, submitter) {
    if (pendingForms.has(form)) return;
    const idField = form.querySelector('[name="id"]');
    if (!idField || !idField.value) { showToast('Select an available option.'); return; }
    pendingForms.add(form);
    const button = submitter && submitter.matches && submitter.matches('button, input[type="submit"]') ? submitter : form.querySelector('[name="add"], [data-pdp-atc], [data-atc-btn]');
    setButtonLoading(button, true);
    const formData = new FormData(form);
    if (!formData.get('quantity')) formData.set('quantity', '1');
    fetch('/cart/add.js', { method: 'POST', headers: { Accept: 'application/json' }, body: formData }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.description || payload.message || 'Unable to add to cart.');
      return fetchCart();
    }).then((cart) => {
      renderCart(cart);
      openCart();
      showToast('Added to cart');
    }).catch((error) => {
      console.error('Melato add-to-cart error:', error);
      showToast(error.message || 'Unable to add to cart.');
    }).finally(() => {
      pendingForms.delete(form);
      setButtonLoading(button, false);
    });
  }

  document.addEventListener('click', (event) => {
    const openTrigger = event.target.closest('[data-cart-open], [data-cart-toggle], .mxh__bag');
    if (openTrigger && !openTrigger.closest('.cart-drawer')) {
      event.preventDefault();
      fetchCart().then((cart) => { renderCart(cart); openCart(); });
      return;
    }
    if (event.target.closest('[data-cart-close]')) { event.preventDefault(); closeCart(); return; }
    const qtyButton = event.target.closest('[data-qty-change]');
    if (qtyButton && qtyButton.closest('.cart-drawer')) {
      event.preventDefault();
      const row = qtyButton.closest('.cart-item');
      const input = row && row.querySelector('.qty-stepper__value');
      const key = row && row.dataset.lineKey;
      const current = Number(input && input.value || 0);
      updateLine(key, Math.max(0, current + Number(qtyButton.dataset.qtyChange || 0)));
      return;
    }
    const removeButton = event.target.closest('[data-remove-line]');
    if (removeButton && removeButton.closest('.cart-drawer')) {
      event.preventDefault();
      const row = removeButton.closest('.cart-item');
      updateLine(row && row.dataset.lineKey, 0);
      return;
    }
    const noteToggle = event.target.closest('.cart-note-toggle');
    if (noteToggle && noteToggle.closest('.cart-drawer')) {
      const field = drawer.querySelector('#cart-note-field');
      const expanded = noteToggle.getAttribute('aria-expanded') === 'true';
      noteToggle.setAttribute('aria-expanded', String(!expanded));
      if (field) { field.hidden = expanded; field.setAttribute('aria-hidden', String(expanded)); }
    }
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('.cart-drawer input[type="number"].qty-stepper__value');
    if (input) {
      const row = input.closest('.cart-item');
      updateLine(row && row.dataset.lineKey, Math.max(0, Number(input.value || 0)));
    }
    const gift = event.target.closest('[data-gift-wrap]');
    if (gift) fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ attributes: { gift_wrap: gift.checked ? 'yes' : 'no' } }) }).catch(() => {});
  });

  document.addEventListener('input', debounce((event) => {
    const note = event.target.closest('[data-note-input]');
    if (!note) return;
    const hidden = drawer.querySelector('[data-note-hidden]');
    if (hidden) hidden.value = note.value;
    fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ note: note.value }) }).catch(() => {});
  }, 450));

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form');
    if (!isProductAddForm(form)) return;
    const submitter = event.submitter || document.activeElement;
    if (submitter && submitter.closest('.shopify-payment-button, .shopify-payment-button__button')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addFormToCart(form, submitter);
  }, true);

  if (overlay) overlay.addEventListener('click', () => { if (drawer.classList.contains('is-open')) closeCart(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeCart(); if (event.key === 'Tab' && drawer.classList.contains('is-open')) trapTab(event); });
  fetchCart().then(renderCart).catch(() => {});
})();
