/**
 * ==========================================================================
 * MELATO ATELIER × APPLE FLUID MOTION CONTROLLER
 * Assets: melato-apple-design.js
 * Translated from WWDC "Designing Fluid Interfaces"
 * ==========================================================================
 */

(function MelatoAppleDesign() {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    var headers = document.querySelectorAll('.site-header, .header-wrapper, .mxh, [data-mxh], header');
    if (!headers.length) return;

    var isTicking = false;
    var threshold = 12;

    function update() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
      var hasScrolled = scrolled > threshold;

      for (var i = 0; i < headers.length; i++) {
        headers[i].classList.toggle('is-scrolled', hasScrolled);
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
    var accordions = document.querySelectorAll('.melato-accordion');
    if (!accordions.length) return;

    accordions.forEach(function (accordion) {
      var summary = accordion.querySelector('summary');
      var content = accordion.querySelector('.melato-accordion__content');
      if (!summary || !content) return;

      var isAnimating = false;

      summary.addEventListener('click', function (e) {
        if (prefersReducedMotion.matches) return; // Allow native snap if user prefers reduced motion

        e.preventDefault();

        if (isAnimating) return;

        if (accordion.open) {
          // Closing animation
          isAnimating = true;
          var startHeight = content.offsetHeight;

          var anim = content.animate([
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
          var endHeight = content.offsetHeight;

          var openAnim = content.animate([
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
        var cartDrawer = document.querySelector('.cart-drawer.is-open');
        var mobileMenu = document.querySelector('.mobile-menu.is-open');
        var searchDrawer = document.querySelector('.search-drawer.is-open');
        var mxhDrawer = document.querySelector('.mxh__drawer.is-open');
        var mxhSearch = document.querySelector('.mxh__search.is-open');
        var overlay = document.querySelector('.drip-overlay.is-visible');

        if (cartDrawer) {
          var closeBtn = cartDrawer.querySelector('[data-cart-drawer-close], .cart-drawer__close');
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
          var menuBtn = document.querySelector('[data-mxh-menu]');
          if (menuBtn) menuBtn.click();
          else mxhDrawer.classList.remove('is-open');
        }

        if (mxhSearch) {
          var searchClose = document.querySelector('[data-mxh-search-close]');
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
    var pressSelector = '.btn, button, .product-form__submit, .mxh__menu, .mxh__text-btn, .quick-add-btn, .variant-picker__button, .swatch';

    document.addEventListener('pointerdown', function (e) {
      var target = e.target.closest(pressSelector);
      if (!target) return;
      target.style.transform = 'scale(0.972)';
    }, { passive: true });

    function release(e) {
      var target = e.target.closest(pressSelector);
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
    var bubbles = document.querySelectorAll('.cart-count-bubble, .header__cart-count, .site-header__cart-count, .mxh__cart-count, [data-cart-item-count]');
    if (!bubbles.length) return;

    var observer = new MutationObserver(function () {
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
