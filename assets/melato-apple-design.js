/**
 * ==========================================================================
 * MELATO ATELIER × APPLE FLUID MOTION CONTROLLER
 * Assets: melato-apple-design.js
 * Translated from WWDC "Designing Fluid Interfaces"
 * ==========================================================================
 */

(function MelatoAppleDesign() {
  'use strict';

  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(function () {
    initHeaderGlassScroll();
    initSmoothAccordions();
    initInterruptibleDrawers();
    initTactilePointerFeedback();
    initCartBadgeObserver();
  });

  /* --------------------------------------------------------------------------
     1. FLUID HEADER GLASS SCROLL
     -------------------------------------------------------------------------- */
  function initHeaderGlassScroll() {
    let headers = document.querySelectorAll('.site-header, .header-wrapper, .mxh, [data-mxh], header');
    if (!headers.length) return;

    let isTicking = false;
    let threshold = 12;

    function update() {
      let scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
      let hasScrolled = scrolled > threshold;

      for (const header of headers) {
        header.classList.toggle('is-scrolled', hasScrolled);
      }
      isTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!isTicking) {
        window.requestAnimationFrame(update);
        isTicking = true;
      }
    }, { passive: true });

    // Initial check
    update();
  }

  /* --------------------------------------------------------------------------
     2. CONTINUOUS ACCORDION DISCLOSURE ANIMATION
     -------------------------------------------------------------------------- */
  function initSmoothAccordions() {
    let accordions = document.querySelectorAll('.melato-accordion');
    if (!accordions.length) return;

    accordions.forEach((accordion) => {
      let summary = accordion.querySelector('summary');
      let content = accordion.querySelector('.melato-accordion__content');
      if (!summary || !content) return;

      let isAnimating = false;

      summary.addEventListener('click', function (e) {
        if (prefersReducedMotion.matches) return; // Allow native snap if user prefers reduced motion

        e.preventDefault();

        if (isAnimating) return;

        if (accordion.open) {
          // Closing animation
          isAnimating = true;
          let startHeight = content.offsetHeight;

          let anim = content.animate([
            { height: startHeight + 'px', opacity: 1 },
            { height: '0px', opacity: 0 }
          ], {
            duration: 260,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
          });

          anim.onfinish = function () {
            accordion.removeAttribute('open');
            isAnimating = false;
          };
        } else {
          // Opening animation
          isAnimating = true;
          accordion.setAttribute('open', '');
          let endHeight = content.offsetHeight;

          let openAnim = content.animate([
            { height: '0px', opacity: 0 },
            { height: endHeight + 'px', opacity: 1 }
          ], {
            duration: 300,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
          });

          openAnim.onfinish = function () {
            isAnimating = false;
          };
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. INTERRUPTIBLE DRAWERS & ESCAPE DISMISSAL
     -------------------------------------------------------------------------- */
  function initInterruptibleDrawers() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        let cartDrawer = document.querySelector('.cart-drawer.is-open');
        let mobileMenu = document.querySelector('.mobile-menu.is-open');
        let searchDrawer = document.querySelector('.search-drawer.is-open');
        let mxhDrawer = document.querySelector('.mxh__drawer.is-open');
        let mxhSearch = document.querySelector('.mxh__search.is-open');
        let overlay = document.querySelector('.drip-overlay.is-visible');

        if (cartDrawer) {
          let closeBtn = cartDrawer.querySelector('[data-cart-drawer-close], .cart-drawer__close');
          if (closeBtn) closeBtn.click();
          else cartDrawer.classList.remove('is-open');
        }

        if (mobileMenu) {
          mobileMenu.classList.remove('is-open');
        }

        if (searchDrawer) {
          searchDrawer.classList.remove('is-open');
        }

        if (mxhDrawer) {
          let menuBtn = document.querySelector('[data-mxh-menu]');
          if (menuBtn) menuBtn.click();
          else mxhDrawer.classList.remove('is-open');
        }

        if (mxhSearch) {
          let searchClose = document.querySelector('[data-mxh-search-close]');
          if (searchClose) searchClose.click();
          else mxhSearch.classList.remove('is-open');
        }

        if (overlay) {
          overlay.classList.remove('is-visible');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. TACTILE DIRECT MANIPULATION POINTER FEEDBACK
     -------------------------------------------------------------------------- */
  function initTactilePointerFeedback() {
    let pressSelector = '.btn, button, .product-form__submit, .mxh__menu, .mxh__text-btn, .quick-add-btn, .variant-picker__button, .swatch';

    document.addEventListener('pointerdown', function (e) {
      let target = e.target.closest(pressSelector);
      if (!target) return;
      target.style.transform = 'scale(0.972)';
    }, { passive: true });

    function release(e) {
      let target = e.target.closest(pressSelector);
      if (!target) return;
      target.style.transform = '';
    }

    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
  }

  /* --------------------------------------------------------------------------
     5. CART BADGE PULSE OBSERVER
     -------------------------------------------------------------------------- */
  function initCartBadgeObserver() {
    let bubbles = document.querySelectorAll('.cart-count-bubble, .header__cart-count, .site-header__cart-count, .mxh__cart-count, [data-cart-item-count]');
    if (!bubbles.length) return;

    let observer = new MutationObserver(function () {
      bubbles.forEach(function (bubble) {
        bubble.classList.remove('badge-pulse');
        // Force reflow for retriggering animation
        void bubble.offsetWidth;
        bubble.classList.add('badge-pulse');
      });
    });

    bubbles.forEach(function (bubble) {
      observer.observe(bubble, { childList: true, characterData: true, subtree: true });
    });
  }
})();
