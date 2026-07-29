/**
 * DRIP Theme - theme.js
 * Version: 1.0.0
 * Vanilla JS, no dependencies, ES6+
 */

'use strict';

/* ==========================================================================
   1. UTILITIES
   ========================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, wait = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function formatMoney(cents, format) {
  if (!format) format = window.DRIP.shop.moneyFormat;
  const amount = (cents / 100).toFixed(2);
  return format.replace('{{amount}}', amount)
               .replace('{{amount_no_decimals}}', Math.floor(cents / 100))
               .replace('{{amount_with_comma_separator}}', amount.replace('.', ','));
}

const focusTrapHandlers = new WeakMap();

function trapFocus(element) {
  releaseFocus(element);
  const focusable = $$('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])', element);
  if (!focusable.length) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  const handler = e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  focusTrapHandlers.set(element, handler);
  element.addEventListener('keydown', handler);
}

function releaseFocus(element) {
  const handler = focusTrapHandlers.get(element);
  if (!handler) return;
  element.removeEventListener('keydown', handler);
  focusTrapHandlers.delete(element);
}

/* ==========================================================================
   2. TOAST NOTIFICATION
   ========================================================================== */

const Toast = {
  el: null,
  timer: null,

  init() {
    this.el = $('#drip-toast');
  },

  show(message, duration = 3000) {
    if (!this.el) return;
    this.el.textContent = message;
    this.el.classList.add('is-visible');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), duration);
  },

  hide() {
    if (!this.el) return;
    this.el.classList.remove('is-visible');
  }
};

/* ==========================================================================
   3. OVERLAY
   ========================================================================== */

const Overlay = {
  el: null,
  callbacks: [],

  init() {
    this.el = $('#drip-overlay');
    this.el?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
  },

  open(onClose) {
    this.el?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    if (onClose) this.callbacks.push(onClose);
  },

  close() {
    this.el?.classList.remove('is-visible');
    document.body.style.overflow = '';
    // Clear first because a component callback may call Overlay.close() itself.
    // Keeping the callbacks in place until after iteration caused recursion.
    const callbacks = this.callbacks;
    this.callbacks = [];
    callbacks.forEach(cb => cb());
  }
};

/* ==========================================================================
   4. HEADER
   ========================================================================== */

const Header = {
  el: null,
  lastScroll: 0,

  init() {
    this.el = $('.site-header');
    if (!this.el) return;

    if (this.el.classList.contains('site-header--sticky')) {
      this.bindScroll();
    }

    // Transparent header support
    if (this.el.dataset.transparent === 'true') {
      this.el.classList.add('site-header--transparent');
    }
  },

  bindScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  onScroll() {
    const scrollY = window.scrollY;
    const threshold = 80;

    if (scrollY > threshold) {
      this.el.classList.add('site-header--scrolled');
      this.el.classList.remove('site-header--transparent');
    } else {
      this.el.classList.remove('site-header--scrolled');
      if (this.el.dataset.transparent === 'true') {
        this.el.classList.add('site-header--transparent');
      }
    }

    // Hide on scroll down, show on scroll up
    if (scrollY > this.lastScroll && scrollY > 200) {
      this.el.classList.add('site-header--hidden');
    } else {
      this.el.classList.remove('site-header--hidden');
    }

    this.lastScroll = Math.max(0, scrollY);
  }
};

/* ==========================================================================
   5. MOBILE MENU
   ========================================================================== */

const MobileMenu = {
  menu: null,
  toggle: null,
  isOpen: false,

  init() {
    this.menu  = $('.mobile-menu');
    this.toggle = $('[data-menu-toggle]');
    if (!this.menu || !this.toggle) return;

    this.toggle.addEventListener('click', () => this.isOpen ? this.close() : this.open());

    // Sub-menu toggles
    $$('[data-submenu-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const submenu = btn.nextElementSibling;
        const isOpen  = submenu.style.maxHeight;
        $$('.mobile-submenu').forEach(s => s.style.maxHeight = '');
        if (!isOpen) submenu.style.maxHeight = submenu.scrollHeight + 'px';
      });
    });
  },

  open() {
    this.isOpen = true;
    this.menu.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.toggle.querySelector('.hamburger')?.classList.add('hamburger--open');
    Overlay.open(() => this.close());
    trapFocus(this.menu);
  },

  close() {
    this.isOpen = false;
    this.menu.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.querySelector('.hamburger')?.classList.remove('hamburger--open');
    Overlay.close();
    releaseFocus(this.menu);
  }
};

/* ==========================================================================
   6. SEARCH DRAWER
   ========================================================================== */

const SearchDrawer = {
  drawer: null,
  input: null,
  isOpen: false,

  init() {
    this.drawer = $('.search-drawer');
    this.input  = $('.search-drawer__input');
    if (!this.drawer) return;

    $$('[data-search-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.isOpen ? this.close() : this.open());
    });

    $('[data-search-close]')?.addEventListener('click', () => this.close());
  },

  open() {
    this.isOpen = true;
    this.drawer.classList.add('is-open');
    Overlay.open(() => this.close());
    setTimeout(() => this.input?.focus(), 100);
  },

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('is-open');
    Overlay.close();
  }
};

/* ==========================================================================
   7. CART
   ========================================================================== */

const Cart = {
  drawer: null,
  isOpen: false,
  data: window.DRIP?.cart || {},

  init() {
    this.drawer = $('.cart-drawer');
    if (!this.drawer) return;

    $$('[data-cart-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.isOpen ? this.close() : this.open());
    });

    $('[data-cart-close]')?.addEventListener('click', () => this.close());

    this.bindCartEvents();
    this.updateCount(this.data.item_count || 0);
    this.renderFreeShipping();
  },

  async open() {
    await this.fetchAndRender();
    this.isOpen = true;
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    Overlay.open(() => this.close());
    trapFocus(this.drawer);
    $('[data-cart-close]')?.focus();
  },

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    Overlay.close();
    releaseFocus(this.drawer);
  },

  async fetchAndRender() {
    try {
      const res  = await fetch('/cart.js');
      this.data  = await res.json();
      this.renderItems();
      this.renderSubtotal();
      this.updateCount(this.data.item_count);
      this.renderFreeShipping();
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  },

  renderItems() {
    const container = $('.cart-drawer__items');
    if (!container) return;

    if (!this.data.items?.length) {
      container.innerHTML = `
        <div class="cart-drawer__empty" style="padding:48px 24px;text-align:center;">
          <p class="text-label" style="margin-bottom:20px;">${window.DRIP.strings.cartEmpty}</p>
          <a href="/collections/all" class="btn btn--primary btn--sm" data-cart-close>
            ${window.DRIP.strings.addToCart.replace('Add to Cart', 'Shop Now')}
          </a>
        </div>`;
      return;
    }

    container.innerHTML = this.data.items.map(item => `
      <div class="cart-item" data-line="${item.key}">
        <a href="${item.url}">
          <img
            class="cart-item__img"
            src="${item.featured_image?.url || item.image}"
            alt="${item.title}"
            width="80"
            loading="lazy"
          >
        </a>
        <div class="cart-item__info">
          <a href="${item.url}" class="cart-item__title">${item.product_title}</a>
          ${item.variant_title ? `<span class="cart-item__variant">${item.variant_title}</span>` : ''}
          <div class="cart-item__footer">
            <div class="qty-stepper" aria-label="Quantity">
              <button class="qty-stepper__btn" data-qty-change="-1" data-line="${item.key}" aria-label="Decrease quantity">−</button>
              <input
                class="qty-stepper__value"
                type="number"
                value="${item.quantity}"
                min="0"
                data-line="${item.key}"
                aria-label="Quantity"
              >
              <button class="qty-stepper__btn" data-qty-change="+1" data-line="${item.key}" aria-label="Increase quantity">+</button>
            </div>
            <span class="price">${formatMoney(item.final_line_price)}</span>
          </div>
        </div>
      </div>`).join('');
  },

  renderSubtotal() {
    const el = $('.cart-subtotal__amount');
    if (el && this.data.total_price !== undefined) {
      el.textContent = formatMoney(this.data.total_price);
    }
  },

  renderFreeShipping() {
    const bar = $('.cart-free-shipping');
    if (!bar) return;

    const threshold = parseFloat(window.DRIP?.shop?.freeShippingThreshold || 0) * 100;
    if (!threshold) return;

    const total      = this.data.total_price || 0;
    const remaining  = Math.max(0, threshold - total);
    const pct        = Math.min(100, (total / threshold) * 100);
    const fill       = bar.querySelector('.cart-free-shipping__fill');
    const text       = bar.querySelector('.cart-free-shipping__text');

    if (fill) fill.style.width = pct + '%';
    if (text) {
      text.textContent = remaining > 0
        ? window.DRIP.strings.addedToCart.replace('Added to cart', `${formatMoney(remaining)} away from free shipping`)
        : '🎉 You\'ve unlocked free shipping!';
    }
  },

  updateCount(count) {
    $$('.cart-count').forEach(el => {
      el.textContent = count > 0 ? count : '';
      if (count > 0) {
        el.classList.add('cart-count--bump');
        setTimeout(() => el.classList.remove('cart-count--bump'), 300);
      }
    });
  },

  bindCartEvents() {
    // Qty steppers
    document.addEventListener('click', async e => {
      const btn = e.target.closest('[data-qty-change]');
      if (!btn) return;
      const line  = btn.dataset.line;
      const input = $(`[data-line="${line}"].qty-stepper__value`) ||
                    btn.closest('.qty-stepper')?.querySelector('.qty-stepper__value');
      if (!input) return;
      const currentQty = parseInt(input.value);
      const delta = parseInt(btn.dataset.qtyChange);
      const newQty = Math.max(0, currentQty + delta);
      await this.updateItem(line, newQty);
    });

    // Qty input direct edit
    document.addEventListener('change', async e => {
      const input = e.target.closest('.qty-stepper__value');
      if (!input) return;
      const line = input.dataset.line;
      await this.updateItem(line, parseInt(input.value) || 0);
    });
  },

  async addItem(id, quantity = 1, properties = {}) {
    try {
      const res = await fetch(window.DRIP.shop.routes.cartAdd, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id, quantity, properties })
      });

      if (!res.ok) {
        const err = await res.json();
        Toast.show(err.description || window.DRIP.strings.addedToCart);
        return;
      }

      await this.fetchAndRender();
      Toast.show(window.DRIP.strings.addedToCart);
      this.open();
    } catch (err) {
      console.error('Add to cart error:', err);
      Toast.show('Something went wrong. Please try again.');
    }
  },

  async updateItem(line, quantity) {
    try {
      await fetch(window.DRIP.shop.routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: line, quantity })
      });
      await this.fetchAndRender();
    } catch (err) {
      console.error('Cart update error:', err);
    }
  }
};

/* ==========================================================================
   8. ADD TO CART FORMS
   ========================================================================== */

const ProductForm = {
  init() {
    document.addEventListener('submit', async e => {
      const form = e.target.closest('[data-product-form]');
      if (!form) return;
      e.preventDefault();

      const btn  = form.querySelector('[data-atc-btn]');
      const idEl = form.querySelector('[name="id"]');
      if (!idEl) return;

      const id  = idEl.value;
      const qty = parseInt(form.querySelector('[name="quantity"]')?.value || 1);

      // Loading state
      if (btn) {
        btn.classList.add('btn--loading');
        btn.disabled = true;
      }

      await Cart.addItem(id, qty);

      if (btn) {
        btn.classList.remove('btn--loading');
        btn.disabled = false;
      }
    });
  }
};

/* ==========================================================================
   9. VARIANT SELECTOR
   ========================================================================== */

const VariantSelector = {
  init() {
    $$('[data-variant-selector]').forEach(form => {
      this.bindForm(form);
    });
  },

  bindForm(form) {
    const optionBtns = $$('[data-option-value]', form);
    const addToCartBtn = form.querySelector('[data-atc-btn]');
    const priceEl      = form.querySelector('[data-product-price]');
    const idInput      = form.querySelector('[name="id"]');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.optionName;
        // Deselect siblings
        $$(`[data-option-name="${name}"]`, form).forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');

        // Get current selections
        const selected = {};
        $$('[data-option-name]', form).forEach(b => {
          if (b.classList.contains('is-selected')) {
            selected[b.dataset.optionName] = b.dataset.optionValue;
          }
        });

        // Find matching variant
        const variants = JSON.parse(form.dataset.variants || '[]');
        const match = variants.find(v =>
          Object.entries(selected).every(([k, val]) => v.options.includes(val))
        );

        this.updateUI(form, match, addToCartBtn, priceEl, idInput);
      });
    });
  },

  updateUI(form, variant, btn, priceEl, idInput) {
    if (!variant) {
      if (btn) { btn.disabled = true; btn.textContent = window.DRIP.strings.unavailable; }
      return;
    }

    if (idInput) idInput.value = variant.id;

    // Price
    if (priceEl) {
      if (variant.compare_at_price > variant.price) {
        priceEl.innerHTML = `
          <span class="price price--sale">${formatMoney(variant.price)}</span>
          <span class="price price--was">${formatMoney(variant.compare_at_price)}</span>`;
      } else {
        priceEl.innerHTML = `<span class="price">${formatMoney(variant.price)}</span>`;
      }
    }

    // Button state
    if (btn) {
      if (!variant.available) {
        btn.disabled = true;
        btn.textContent = window.DRIP.strings.soldOut;
        btn.classList.add('btn--disabled');
      } else {
        btn.disabled = false;
        btn.textContent = window.DRIP.strings.addToCart;
        btn.classList.remove('btn--disabled');
      }
    }

    // Low stock
    const lowStockEl = form.querySelector('[data-low-stock]');
    if (lowStockEl && variant.inventory_management === 'shopify') {
      const threshold = window.DRIP?.shop?.lowStockThreshold || 5;
      if (variant.inventory_quantity > 0 && variant.inventory_quantity <= threshold) {
        lowStockEl.textContent = `Only ${variant.inventory_quantity} left`;
        lowStockEl.hidden = false;
      } else {
        lowStockEl.hidden = true;
      }
    }

    // Update gallery if variant has image
    if (variant.featured_image) {
      const gallery = document.querySelector('.gallery-main__img');
      if (gallery) {
        gallery.src = variant.featured_image.src;
        gallery.srcset = '';
      }
    }

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('drip:variant:change', { detail: { variant } }));
  }
};

/* ==========================================================================
   10. DROP COUNTDOWN SYSTEM
   ========================================================================== */

const DropSystem = {
  timers: [],

  init() {
    $$('[data-drop-countdown]').forEach(el => {
      this.initCountdown(el);
    });

    $$('[data-waitlist-form]').forEach(form => {
      this.initWaitlist(form);
    });
  },

  initCountdown(el) {
    const dropTime = new Date(el.dataset.dropCountdown).getTime();
    if (isNaN(dropTime)) return;

    const hEl = el.querySelector('[data-cd-hours]');
    const mEl = el.querySelector('[data-cd-minutes]');
    const sEl = el.querySelector('[data-cd-seconds]');

    const tick = () => {
      const now  = Date.now();
      const diff = dropTime - now;

      if (diff <= 0) {
        this.dropIsLive(el);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');

      // Days if > 24h
      const dEl = el.querySelector('[data-cd-days]');
      if (dEl && h >= 24) {
        const d = Math.floor(h / 24);
        dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h % 24).padStart(2, '0');
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    this.timers.push(timer);
  },

  dropIsLive(countdownEl) {
    // Unlock ATC buttons
    $$('[data-drop-locked]').forEach(btn => {
      btn.removeAttribute('data-drop-locked');
      btn.disabled = false;
      btn.textContent = window.DRIP.strings.addToCart;
      btn.classList.remove('btn--disabled');
    });

    // Hide countdown, show drop-live banner
    countdownEl.closest('[data-drop-block]')?.classList.add('drop-is-live');

    const liveMsg = document.querySelector('[data-drop-live-message]');
    if (liveMsg) {
      liveMsg.style.display = 'block';
      liveMsg.textContent = '🔥 Drop is live now!';
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent('drip:drop:live'));
  },

  initWaitlist(form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = form.querySelector('[name="email"]')?.value;
      const btn   = form.querySelector('[type="submit"]');
      if (!email) return;

      if (btn) { btn.classList.add('btn--loading'); btn.disabled = true; }

      // Shopify Customer Events integration or custom endpoint
      try {
        // Subscribe to Shopify back-in-stock / waitlist
        // This integrates with Shopify's native newsletter
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            form_type: 'customer',
            email,
            'contact[tags]': `waitlist,${form.dataset.productHandle || 'general'}`
          })
        });

        if (res.ok) {
          form.innerHTML = `<p class="text-label" style="color:var(--color-accent);text-align:center;">${window.DRIP?.strings?.waitlistSuccess || "You're on the list! 🔥"}</p>`;
        }
      } catch (err) {
        Toast.show('Something went wrong. Please try again.');
      } finally {
        if (btn) { btn.classList.remove('btn--loading'); btn.disabled = false; }
      }
    });
  }
};

/* ==========================================================================
   11. SOCIAL PROOF (LIVE VIEWERS)
   ========================================================================== */

const SocialProof = {
  init() {
    const els = $$('[data-social-proof]');
    if (!els.length) return;

    const min = parseInt(window.DRIP?.shop?.socialProofMin || 4);
    const max = parseInt(window.DRIP?.shop?.socialProofMax || 47);

    const getCount = () => Math.floor(Math.random() * (max - min + 1)) + min;

    els.forEach(el => {
      let count = getCount();
      el.querySelector('[data-viewer-count]').textContent = count;

      // Drift count every 8–20 seconds
      const drift = () => {
        const delta = Math.floor(Math.random() * 5) - 2;
        count = Math.max(min, Math.min(max, count + delta));
        const countEl = el.querySelector('[data-viewer-count]');
        if (countEl) countEl.textContent = count;
        setTimeout(drift, 8000 + Math.random() * 12000);
      };
      setTimeout(drift, 8000 + Math.random() * 12000);
    });
  }
};

/* ==========================================================================
   12. WISHLIST
   ========================================================================== */

const Wishlist = {
  key: 'drip-wishlist',

  init() {
    this.render();
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-wishlist-btn]');
      if (!btn) return;
      const id = btn.dataset.wishlistBtn;
      this.toggle(id, btn);
    });
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { return []; }
  },

  save(list) {
    localStorage.setItem(this.key, JSON.stringify(list));
  },

  toggle(id, btn) {
    const list = this.get();
    const idx  = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
      btn?.classList.remove('is-wishlisted');
      btn?.setAttribute('aria-label', 'Add to wishlist');
      Toast.show('Removed from wishlist');
    } else {
      list.push(id);
      btn?.classList.add('is-wishlisted');
      btn?.setAttribute('aria-label', 'Remove from wishlist');
      Toast.show(window.DRIP?.strings?.wishlisted || 'Saved! ❤️');
    }
    this.save(list);
  },

  render() {
    const list = this.get();
    $$('[data-wishlist-btn]').forEach(btn => {
      if (list.includes(btn.dataset.wishlistBtn)) {
        btn.classList.add('is-wishlisted');
        btn.setAttribute('aria-label', 'Remove from wishlist');
      }
    });
  }
};

/* ==========================================================================
   13. QUICK VIEW
   ========================================================================== */

const QuickView = {
  modal: null,

  init() {
    this.modal = $('.quick-view-modal');
    if (!this.modal) return;

    document.addEventListener('click', async e => {
      const btn = e.target.closest('[data-quick-view]');
      if (!btn) return;
      e.preventDefault();
      const url = btn.dataset.quickView;
      await this.open(url);
    });

    $('[data-quick-view-close]')?.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
  },

  async open(url) {
    this.modal.classList.add('is-open');
    Overlay.open(() => this.close());

    const inner = this.modal.querySelector('.quick-view-modal__inner');
    if (!inner) return;

    inner.innerHTML = '<div style="grid-column:1/-1;padding:60px;text-align:center;"><div class="btn btn--loading" style="margin:0 auto;"></div></div>';

    try {
      const res  = await fetch(`${url}?view=quick-view`);
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('[data-quick-view-content]');
      if (content) {
        inner.innerHTML = content.innerHTML;
        VariantSelector.init();
        trapFocus(this.modal);
      }
    } catch (err) {
      inner.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-muted);">Failed to load product.</div>';
    }
  },

  close() {
    this.modal?.classList.remove('is-open');
    Overlay.close();
  }
};

/* ==========================================================================
   14. SIZE GUIDE
   ========================================================================== */

const SizeGuide = {
  modal: null,

  init() {
    this.modal = $('.size-guide-modal');
    if (!this.modal) return;

    document.addEventListener('click', e => {
      if (e.target.closest('[data-size-guide]')) this.open();
      if (e.target.closest('[data-size-guide-close]')) this.close();
    });
  },

  open() {
    this.modal.classList.add('is-open');
    Overlay.open(() => this.close());
    trapFocus(this.modal);
  },

  close() {
    this.modal.classList.remove('is-open');
    Overlay.close();
  }
};

/* ==========================================================================
   15. SCROLL REVEAL ANIMATIONS
   ========================================================================== */

const ScrollReveal = {
  observer: null,

  init() {
    if (!window.IntersectionObserver) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); this.observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.drip-reveal').forEach(el => this.observer.observe(el));
  }
};

/* ==========================================================================
   16. ANNOUNCEMENT BAR
   ========================================================================== */

const AnnouncementBar = {
  init() {
    const bar = $('.announcement-bar');
    const closeBtn = $('.announcement-bar__close');
    if (!bar || !closeBtn) return;

    const dismissed = sessionStorage.getItem('drip-announcement-dismissed');
    if (dismissed) { bar.style.display = 'none'; return; }

    closeBtn.addEventListener('click', () => {
      bar.style.display = 'none';
      sessionStorage.setItem('drip-announcement-dismissed', '1');
    });
  }
};

/* ==========================================================================
   17. STICKY ATC (PRODUCT PAGE)
   ========================================================================== */

const StickyATC = {
  init() {
    const bar    = $('.product-sticky-atc');
    const target = $('[data-atc-target]');
    if (!bar || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);
  }
};

/* ==========================================================================
   18. PRODUCT TABS / ACCORDION
   ========================================================================== */

const Accordion = {
  init() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const content    = document.getElementById(trigger.getAttribute('aria-controls'));

      // Close siblings if not multi
      if (!trigger.closest('[data-accordion-multi]')) {
        const parent = trigger.closest('[data-accordion-group]');
        if (parent) {
          $$('[data-accordion-trigger]', parent).forEach(t => {
            if (t !== trigger) {
              t.setAttribute('aria-expanded', 'false');
              const c = document.getElementById(t.getAttribute('aria-controls'));
              if (c) c.setAttribute('aria-hidden', 'true');
            }
          });
        }
      }

      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (content) content.setAttribute('aria-hidden', String(isExpanded));
    });
  }
};

/* ==========================================================================
   19. GALLERY
   ========================================================================== */

const Gallery = {
  init() {
    $$('[data-gallery]').forEach(gallery => {
      this.bindGallery(gallery);
    });
  },

  bindGallery(gallery) {
    const main   = gallery.querySelector('.gallery-main__img');
    const thumbs = $$('.gallery-thumb', gallery);

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        const src    = thumb.dataset.src;
        const srcset = thumb.dataset.srcset || '';
        if (main && src) {
          main.src    = src;
          main.srcset = srcset;
          thumbs.forEach(t => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
        }
      });
    });

    // Touch swipe for mobile
    let startX = 0;
    const mainWrap = gallery.querySelector('.gallery-main');
    if (!mainWrap) return;

    mainWrap.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
    mainWrap.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      const activeIdx = thumbs.findIndex(t => t.classList.contains('is-active'));
      if (Math.abs(diff) > 50) {
        const nextIdx = diff > 0
          ? Math.min(thumbs.length - 1, activeIdx + 1)
          : Math.max(0, activeIdx - 1);
        thumbs[nextIdx]?.click();
      }
    });
  }
};

/* ==========================================================================
   20. FILTERS (COLLECTION)
   ========================================================================== */

const Filters = {
  drawer: null,

  init() {
    this.drawer = $('.filter-drawer');

    $('[data-filter-open]')?.addEventListener('click',  () => this.open());
    $('[data-filter-close]')?.addEventListener('click', () => this.close());

    // Filter option toggles
    document.addEventListener('click', e => {
      const option = e.target.closest('[data-filter-option]');
      if (!option) return;
      const checkbox = option.querySelector('.filter-option__checkbox');
      checkbox?.classList.toggle('is-checked');
    });

    // Apply filters
    $('[data-filter-apply]')?.addEventListener('click', () => {
      this.applyFilters();
    });

    // Clear all
    $('[data-filter-clear]')?.addEventListener('click', () => {
      $$('.filter-option__checkbox.is-checked').forEach(el => el.classList.remove('is-checked'));
    });
  },

  open() {
    this.drawer?.classList.add('is-open');
    Overlay.open(() => this.close());
  },

  close() {
    this.drawer?.classList.remove('is-open');
  },

  applyFilters() {
    const params = new URLSearchParams(window.location.search);
    // Reset existing filter params
    [...params.keys()].filter(k => k.startsWith('filter.')).forEach(k => params.delete(k));

    $$('.filter-option__checkbox.is-checked').forEach(el => {
      const option = el.closest('[data-filter-option]');
      if (option) {
        params.set(option.dataset.filterParam, option.dataset.filterValue);
      }
    });

    window.location.search = params.toString();
  }
};

/* ==========================================================================
   21. NEWSLETTER
   ========================================================================== */

const Newsletter = {
  init() {
    $$('[data-newsletter-form]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.querySelector('[name="email"]')?.value;
        const btn   = form.querySelector('[type="submit"]');
        if (!email) return;

        if (btn) { btn.classList.add('btn--loading'); btn.disabled = true; }

        try {
          // Shopify Customer newsletter signup
          await fetch('/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ form_type: 'customer', email })
          });
          Toast.show(window.DRIP?.strings?.newsletterSuccess || 'Thanks for subscribing! 🔥');
          form.reset();
        } catch {
          Toast.show('Something went wrong. Please try again.');
        } finally {
          if (btn) { btn.classList.remove('btn--loading'); btn.disabled = false; }
        }
      });
    });
  }
};

/* ==========================================================================
   22. RECENTLY VIEWED
   ========================================================================== */

const RecentlyViewed = {
  key: 'drip-recently-viewed',
  max: 8,

  init() {
    this.trackCurrentProduct();
    this.renderSection();
  },

  get() {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { return []; }
  },

  trackCurrentProduct() {
    const el = $('[data-product-id]');
    if (!el) return;

    const id    = el.dataset.productId;
    const title = el.dataset.productTitle;
    const url   = el.dataset.productUrl;
    const img   = el.dataset.productImage;
    const price = el.dataset.productPrice;

    if (!id) return;

    let viewed = this.get();
    viewed = viewed.filter(p => p.id !== id);
    viewed.unshift({ id, title, url, img, price });
    viewed = viewed.slice(0, this.max);
    localStorage.setItem(this.key, JSON.stringify(viewed));
  },

  renderSection() {
    const section = $('[data-recently-viewed]');
    if (!section) return;

    const currentId = $('[data-product-id]')?.dataset.productId;
    const viewed = this.get().filter(p => p.id !== currentId).slice(0, 4);

    if (!viewed.length) { section.style.display = 'none'; return; }

    const grid = section.querySelector('[data-recently-viewed-grid]');
    if (!grid) return;

    grid.innerHTML = viewed.map(p => `
      <div class="product-card">
        <div class="product-card__media">
          <a href="${p.url}" aria-label="${p.title}">
            <img class="product-card__img product-card__img--primary product-card__img--only"
              src="${p.img}" alt="${p.title}" loading="lazy" width="300" height="400">
          </a>
        </div>
        <div class="product-card__info">
          <a href="${p.url}" class="product-card__title">${p.title}</a>
          <div class="product-card__price">
            <span class="price">${formatMoney(parseInt(p.price))}</span>
          </div>
        </div>
      </div>`).join('');
  }
};

/* ==========================================================================
   23. COPY LINK SHARE
   ========================================================================== */

const ShareButton = {
  init() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-share-btn]');
      if (!btn) return;

      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        });
      } else {
        navigator.clipboard?.writeText(window.location.href).then(() => {
          Toast.show('Link copied! 🔗');
        });
      }
    });
  }
};

/* ==========================================================================
   24. INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Overlay.init();
  Header.init();
  MobileMenu.init();
  SearchDrawer.init();
  Cart.init();
  ProductForm.init();
  VariantSelector.init();
  DropSystem.init();
  SocialProof.init();
  Wishlist.init();
  QuickView.init();
  SizeGuide.init();
  ScrollReveal.init();
  AnnouncementBar.init();
  StickyATC.init();
  Accordion.init();
  Gallery.init();
  Filters.init();
  Newsletter.init();
  RecentlyViewed.init();
  ShareButton.init();
});

/* ==========================================================================
   25. EXPORTS (for section-specific use)
   ========================================================================== */

window.DRIP_THEME = {
  Cart,
  Toast,
  Overlay,
  Wishlist,
  formatMoney,
  VariantSelector,
  DropSystem
};
