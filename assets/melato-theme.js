/**
 * ================================================================
 *  MELATO - melato-theme.js
 *  Master JavaScript for all custom sections
 * ================================================================
 *  MODULES:
 *  01. Header scroll glass effect
 *  02. Mobile drawer open / close / focus trap
 *  03. Search overlay open / close / focus
 *  04. Hero slideshow (autoplay, arrows, dots, swipe, keyboard)
 *  05. Accessibility helpers
 * ================================================================
 */

(function () {
  'use strict';

  /* ── Utility: safe querySelector ─────────────────────────── */
  function qs(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }
  function qsa(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }

  /* ── 01. Header Scroll Glass Effect ──────────────────────── */
  function initHeaderScroll() {
    var header = qs('#m-header');
    if (!header) return;

    var lastY = 0;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (y > 40) {
        header.classList.add('m-header--scrolled');
      } else {
        header.classList.remove('m-header--scrolled');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 02. Mobile Drawer ────────────────────────────────────── */
  function initMobileMenu() {
    var hamburger = qs('#m-hamburger');
    var menu      = qs('#m-mobile-menu');
    var overlay   = qs('#m-menu-overlay');
    var closeBtn  = qs('#m-menu-close');
    var drawer    = qs('#m-menu-drawer');

    if (!hamburger || !menu) return;

    var isOpen = false;
    var focusable = 'a[href], button:not([disabled])';
    var previousFocus = null;

    function openMenu() {
      isOpen = true;
      previousFocus = document.activeElement;
      menu.removeAttribute('hidden');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      /* Allow paint before triggering CSS transition */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          drawer && drawer.classList.add('is-open');
          overlay && (overlay.style.background = 'rgba(0,0,0,0.65)');
          /* Focus first link in drawer */
          var firstLink = drawer ? drawer.querySelector(focusable) : null;
          if (firstLink) firstLink.focus();
        });
      });
    }

    function closeMenu() {
      isOpen = false;
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menu.setAttribute('hidden', '');
      drawer && drawer.classList.remove('is-open');
      overlay && (overlay.style.background = '');
      if (previousFocus) previousFocus.focus();
    }

    hamburger.addEventListener('click', function () {
      isOpen ? closeMenu() : openMenu();
    });

    closeBtn && closeBtn.addEventListener('click', closeMenu);
    overlay  && overlay.addEventListener('click', closeMenu);

    /* Escape key */
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* Focus trap inside drawer */
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isOpen) return;
      var focusables = qsa(focusable, drawer);
      if (!focusables.length) return;
      var first = focusables[0];
      var last  = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ── 03. Search Overlay ───────────────────────────────────── */
  function initSearch() {
    var toggleBtn  = qs('#m-search-toggle');
    var overlay    = qs('#m-search-overlay');
    var closeBtn   = qs('#m-search-close');
    var searchInput = qs('#m-search-input');

    if (!toggleBtn || !overlay) return;

    var isOpen = false;
    var prevFocus = null;

    function openSearch() {
      isOpen = true;
      prevFocus = document.activeElement;
      overlay.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        if (searchInput) searchInput.focus();
      });
    }

    function closeSearch() {
      isOpen = false;
      overlay.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (prevFocus) prevFocus.focus();
    }

    toggleBtn.addEventListener('click', openSearch);
    closeBtn  && closeBtn.addEventListener('click', closeSearch);

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
    });

    /* Click outside search form closes overlay */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });
  }

  /* ── 04. Hero Slideshow ───────────────────────────────────── */
  function initHero() {
    var track    = qs('#m-hero-track');
    var prevBtn  = qs('#m-hero-prev');
    var nextBtn  = qs('#m-hero-next');
    var dots     = qsa('.m-hero__dot');

    if (!track) return;

    var slides = qsa('.m-hero__slide', track);
    var total  = slides.length;

    if (total <= 1) return;

    var interval    = parseInt(track.dataset.interval, 10) || 6000;
    var current     = Math.floor(Math.random() * total); /* random start = shuffle */
    var autoTimer   = null;

    /* Touch swipe state */
    var touchStartX = 0;
    var touchEndX   = 0;
    var SWIPE_THRESHOLD = 50;

    function goTo(idx, userInitiated) {
      /* Clamp & wrap */
      if (idx < 0)      idx = total - 1;
      if (idx >= total) idx = 0;

      current = idx;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      /* Update slides aria-hidden */
      slides.forEach(function (s, i) {
        s.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      });

      /* Update dots */
      dots.forEach(function (d, i) {
        d.classList.toggle('m-hero__dot--active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });

      /* Restart autoplay only if not user-initiated skip */
      if (userInitiated) resetAuto();
    }

    function next(userInitiated) { goTo(current + 1, userInitiated); }
    function prev(userInitiated) { goTo(current - 1, userInitiated); }

    function startAuto() {
      autoTimer = setInterval(function () { next(false); }, interval);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    /* Init at random slide */
    goTo(current, false);
    startAuto();

    /* Arrow buttons */
    prevBtn && prevBtn.addEventListener('click', function () { prev(true); });
    nextBtn && nextBtn.addEventListener('click', function () { next(true); });

    /* Dot clicks */
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i, true); });
    });

    /* Keyboard on hero */
    var hero = qs('#m-hero');
    if (hero) {
      hero.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  prev(true);
        if (e.key === 'ArrowRight') next(true);
      });
    }

    /* Touch swipe */
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var delta = touchStartX - touchEndX;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        delta > 0 ? next(true) : prev(true);
      }
    }, { passive: true });

    /* Pause autoplay when user hovers */
    if (hero) {
      hero.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
      hero.addEventListener('mouseleave', startAuto);
    }
  }

  /* ── 05. DOMContentLoaded init ────────────────────────────── */
  function init() {
    initHeaderScroll();
    initMobileMenu();
    initSearch();
    initHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();