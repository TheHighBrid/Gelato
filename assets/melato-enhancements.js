/**
 * MELATO ENHANCEMENTS - melato-enhancements.js
 * Load in theme.liquid before </body>:
 *   <script src="{{ 'melato-enhancements.js' | asset_url }}" defer></script>
 *
 * Modules:
 *   1. Sticky ATC - IntersectionObserver + Ajax add to cart
 *   2. Size Guide Modal helper (if you use the inline modal)
 *   3. Marquee pause on focus (accessibility)
 */

(function MelatoEnhancements() {
  'use strict';

  /* ================================================================
     UTILITY
  ================================================================ */

  function qs(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }

  function qsa(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }


  /* ================================================================
     1. STICKY ADD TO CART BAR
  ================================================================ */

  function initStickyATC() {
    const bar         = qs('#melato-sticky-atc');
    const satcBtn     = qs('#satc-btn');
    const satcSelect  = qs('#satc-size-select');
    const satcPrice   = qs('#satc-price');

    if (!bar || !satcBtn) return;

    // --- Watch the real ATC button visibility ---
    // We look for the product form's submit button.
    // Adjust this selector to match YOUR theme's ATC button class.
    const realAtcSelectors = [
      '[name="add"]',
      '.product-form__submit',
      '.btn--add-to-cart',
      '[data-action="add-to-cart"]',
      'form[action="/cart/add"] button[type="submit"]',
    ];

    let realAtcBtn = null;
    for (const sel of realAtcSelectors) {
      realAtcBtn = qs(sel);
      if (realAtcBtn) break;
    }

    if (realAtcBtn) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Show sticky bar only when real button is OUT of view
          bar.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
        },
        { rootMargin: '0px', threshold: 0.1 }
      );
      observer.observe(realAtcBtn);
    } else {
      // If we can't find the real button, show bar after scrolling 400px
      let shown = false;
      window.addEventListener('scroll', function onScroll() {
        const shouldShow = window.scrollY > 400;
        if (shouldShow !== shown) {
          shown = shouldShow;
          bar.setAttribute('aria-hidden', shown ? 'false' : 'true');
        }
      }, { passive: true });
    }

    // --- Keep sticky size select in sync with PDP variant selector ---
    const pdpSizeSelect = qs('select[name="Size"], select[id*="option-size"]');

    if (pdpSizeSelect && satcSelect) {
      // Mirror PDP → sticky
      pdpSizeSelect.addEventListener('change', function () {
        satcSelect.value = this.value;
      });

      // Mirror sticky → PDP
      satcSelect.addEventListener('change', function () {
        pdpSizeSelect.value = this.value;
        // Trigger a native 'change' event so Shopify theme JS picks up the variant update
        pdpSizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    // --- Keep price in sync when variant changes ---
    document.addEventListener('variant:change', function (e) {
      const variant = e?.detail?.variant;
      if (variant && satcPrice) {
        satcPrice.textContent = formatMoney(variant.price);
      }
    });

    // --- Ajax Add to Cart from sticky bar ---
    satcBtn.addEventListener('click', async function () {
      const productForm = qs('form[action="/cart/add"]');
      if (!productForm) return;

      // Get variant ID from the main form
      const variantInput = qs('[name="id"]', productForm);
      if (!variantInput) {
        // If no variant found, just scroll up to the real ATC
        realAtcBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const variantId = variantInput.value;
      if (!variantId) return;

      // Loading state
      satcBtn.classList.add('is-loading');
      satcBtn.disabled = true;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 }),
        });

        if (!res.ok) throw new Error('Add to cart failed');

        // Success - flash the button
        satcBtn.classList.remove('is-loading');
        satcBtn.classList.add('is-success');
        const btnText = qs('.m-satc__btn-text', satcBtn);
        const originalText = btnText.textContent;
        btnText.textContent = 'ADDED ✓';

        // Dispatch event so theme cart drawer / counter can update
        document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));

        // Also try to trigger Shopify's native cart update event
        fetch('/cart.js')
          .then(r => r.json())
          .then(cart => {
            document.dispatchEvent(new CustomEvent('cart:refresh', {
              detail: { cart },
              bubbles: true,
            }));

            // Update cart count badges in header
            qsa('[data-cart-count], .cart-count, .header__cart-count').forEach(el => {
              el.textContent = cart.item_count;
            });
          });

        setTimeout(() => {
          satcBtn.classList.remove('is-success');
          if (btnText) btnText.textContent = originalText;
          satcBtn.disabled = false;
        }, 2000);

      } catch (err) {
        console.error('[Melato] Sticky ATC error:', err);
        satcBtn.classList.remove('is-loading');
        satcBtn.disabled = false;

        // Fall back: scroll to real ATC button and let theme handle it
        realAtcBtn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }


  /* ================================================================
     2. SIZE GUIDE MODAL
     (If you add the inline modal HTML from the README)
  ================================================================ */

  function initSizeGuideModal() {
    const triggers   = qsa('.size-guide-trigger');
    const modal      = qs('#size-guide-modal');

    if (!modal) return;

    const overlay = qs('.modal__overlay', modal);
    const closeBtn = qs('.modal__close', modal);

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggers.forEach(t => t.addEventListener('click', openModal));
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // ESC key closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }


  /* ================================================================
     3. MARQUEE - PAUSE ON FOCUS (Accessibility)
  ================================================================ */

  function initMarquee() {
    qsa('.melato-marquee').forEach(marquee => {
      const track = qs('.melato-marquee__track', marquee);
      if (!track) return;

      // Pause when any child receives focus (keyboard nav)
      marquee.addEventListener('focusin', () => {
        track.style.animationPlayState = 'paused';
      });
      marquee.addEventListener('focusout', () => {
        track.style.animationPlayState = 'running';
      });
    });
  }


  /* ================================================================
     4. PRODUCT CARD - TOUCH DEVICE SECONDARY IMAGE ON TAP
     (Since hover doesn't work on touch, show secondary on press)
  ================================================================ */

  function initCardTouchSwap() {
    // Only on touch-capable devices
    if (!window.matchMedia('(hover: none)').matches) return;

    qsa('.pci-wrapper').forEach(wrapper => {
      const secondary = qs('.pci--secondary', wrapper);
      if (!secondary) return;

      secondary.style.display = 'block';

      wrapper.addEventListener('touchstart', () => {
        wrapper.classList.toggle('is-touched');
        const primary = qs('.pci--primary', wrapper);
        if (wrapper.classList.contains('is-touched')) {
          primary.style.opacity = '0';
          secondary.style.opacity = '1';
        } else {
          primary.style.opacity = '1';
          secondary.style.opacity = '0';
        }
      }, { passive: true });
    });
  }


  /* ================================================================
     HELPERS
  ================================================================ */

  function formatMoney(cents) {
    // Simple CAD formatter - matches Shopify money format
    const dollars = (cents / 100).toFixed(2);
    return `$${dollars} CAD`;
  }


  /* ================================================================
     INIT
  ================================================================ */

  ready(function () {
    initStickyATC();
    initSizeGuideModal();
    initMarquee();
    initCardTouchSwap();
    console.log('[Melato] Enhancements loaded ✦');
  });

})();
