/**
 * assets/melato-collection-filters.js
 * v2.0 — Filter Persistence + AJAX Grid + Sort UX
 *
 * Responsibilities:
 * 1. Filter drawer open/close + focus trap + overlay
 * 2. Filter checkbox → collect params → AJAX fetch → swap grid HTML
 * 3. Sort select → update URL param → AJAX fetch → swap grid HTML
 * 4. sessionStorage persistence: restores active filters on back-navigation
 * 5. Active filter pill bar + badge count live update
 * 6. Clear all — both toolbar button and drawer button
 * 7. History API: pushState so back/forward works correctly
 * 8. Accordion expand/collapse per filter group
 * 9. Price range debounce
 */

(function () {
  'use strict';

  // ── Guards ───────────────────────────────────────────────────────────────
  var grid    = document.getElementById('melato-product-grid');
  var drawer  = document.getElementById('melato-filter-drawer');
  var overlay = document.getElementById('drip-overlay');
  if (!grid) return;

  // ── State ────────────────────────────────────────────────────────────────
  var SESSION_KEY = 'mlto_filters_' + window.location.pathname.replace(/\//g, '_');
  var isFetching  = false;
  var priceTimer  = null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function getSearchParams() {
    return new URLSearchParams(window.location.search);
  }

  function buildURL(params) {
    var str = params.toString();
    return window.location.pathname + (str ? '?' + str : '');
  }

  // ── Collect active filter params from the drawer checkboxes ─────────────
  function collectFilterParams() {
    if (!drawer) return new URLSearchParams();
    var params = new URLSearchParams();

    // Preserve sort_by
    var currentSort = getSearchParams().get('sort_by');
    if (currentSort) params.set('sort_by', currentSort);

    // Checkboxes
    qsa('[data-filter-input]:checked', drawer).forEach(function (input) {
      params.append(input.name, input.value);
    });

    // Price range
    qsa('[data-filter-price-input]', drawer).forEach(function (input) {
      if (input.value.trim() !== '') {
        params.set(input.name, input.value.trim());
      }
    });

    return params;
  }

  // ── AJAX fetch + swap ────────────────────────────────────────────────────
  function fetchAndSwap(url, pushState) {
    if (isFetching) return;
    isFetching = true;
    grid.classList.add('is-loading');

    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) {
        if (!r.ok) throw new Error('Network response not ok');
        return r.text();
      })
      .then(function (html) {
        var parser  = new DOMParser();
        var doc     = parser.parseFromString(html, 'text/html');
        var newGrid = doc.getElementById('melato-product-grid');
        var newToolbar = doc.querySelector('[data-collection-toolbar]');
        var newPills   = doc.querySelector('[data-active-filters-bar]');

        if (newGrid) {
          grid.innerHTML = newGrid.innerHTML;
          grid.classList.remove('is-loading');
          // Re-trigger reveal animations
          qsa('.drip-reveal', grid).forEach(function (el) {
            el.classList.remove('is-visible');
            requestAnimationFrame(function () { el.classList.add('is-visible'); });
          });
        }

        // Swap toolbar count + badges
        if (newToolbar) {
          var oldCount = qs('[data-product-count]');
          var newCount = qs('[data-product-count]', newToolbar);
          if (oldCount && newCount) oldCount.textContent = newCount.textContent;

          var oldBadge = qs('[data-active-filter-count]');
          var newBadge = qs('[data-active-filter-count]', newToolbar);
          if (oldBadge && newBadge) {
            oldBadge.textContent = newBadge.textContent;
            oldBadge.style.display = newBadge.style.display;
          }

          var oldClear = qs('[data-clear-all-filters]');
          var newClear = qs('[data-clear-all-filters]', newToolbar);
          if (oldClear && newClear) {
            oldClear.style.display = newClear.style.display;
          }
        }

        // Swap active filter pills bar
        var currentPillsBar = qs('[data-active-filters-bar]');
        if (currentPillsBar && newPills) {
          currentPillsBar.innerHTML = newPills.innerHTML;
          currentPillsBar.style.display = newPills.style.display || '';
          bindPillClicks();
        }

        // Update filter drawer checkboxes to reflect new active state
        if (drawer) updateDrawerCheckboxes(doc);

        if (pushState) {
          window.history.pushState({ url: url }, '', url);
          persistFilters(url);
        }

        // Scroll grid into view smoothly
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        console.error('Collection filter error:', err);
        grid.classList.remove('is-loading');
      })
      .finally(function () {
        isFetching = false;
        grid.classList.remove('is-loading');
      });
  }

  // ── Sync drawer checkboxes after AJAX swap ───────────────────────────────
  function updateDrawerCheckboxes(doc) {
    var newDrawer = doc.getElementById('melato-filter-drawer');
    if (!newDrawer) return;
    qsa('[data-filter-input]', drawer).forEach(function (input) {
      var match = qs(
        '[data-filter-input][name="' + input.name + '"][value="' + input.value + '"]',
        newDrawer
      );
      if (match) {
        input.checked = match.checked;
        // Update visual box
        var box = input.nextElementSibling;
        if (box && box.classList.contains('melato-filter-option__box')) {
          // CSS handles checked state via :checked sibling selector
        }
        // Update group count badge
        var group = input.closest('.melato-filter-group');
        var matchGroup = match.closest('.melato-filter-group');
        if (group && matchGroup) {
          var oldBadge = qs('.melato-filter-group__count', group);
          var newBadge = qs('.melato-filter-group__count', matchGroup);
          var trigger  = qs('.melato-filter-group__trigger', group);
          if (newBadge && trigger) {
            if (!oldBadge) {
              var span = document.createElement('span');
              span.className = 'melato-filter-group__count';
              // Insert before chevron
              var chevron = qs('.melato-filter-group__chevron', trigger);
              trigger.insertBefore(span, chevron);
              oldBadge = span;
            }
            oldBadge.textContent = newBadge.textContent;
          } else if (oldBadge) {
            oldBadge.remove();
          }
        }
      }
    });
  }

  // ── sessionStorage persistence ───────────────────────────────────────────
  function persistFilters(url) {
    try { sessionStorage.setItem(SESSION_KEY, url); } catch (e) {}
  }

  function restoreFilters() {
    try {
      var saved = sessionStorage.getItem(SESSION_KEY);
      // Only restore if the saved URL matches the current path
      if (saved && saved.split('?')[0] === window.location.pathname) {
        // Only apply if current URL has no filter params already
        var current = window.location.search;
        if (!current || current === '?') {
          window.history.replaceState({ url: saved }, '', saved);
          fetchAndSwap(saved, false);
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // ── Filter drawer open / close ───────────────────────────────────────────
  var lastFocused = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    var btn = qs('[data-filter-open]');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    // Focus first focusable
    setTimeout(function () {
      var first = drawer.querySelector('button,[href],input,[tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    }, 50);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    var btn = qs('[data-filter-open]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (lastFocused) lastFocused.focus();
  }

  // Focus trap
  if (drawer) {
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var els = Array.from(drawer.querySelectorAll(
        'button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      ));
      if (!els.length) return;
      var first = els[0], last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // ── Event delegation ─────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    // Open drawer
    if (e.target.closest('[data-filter-open]')) {
      e.preventDefault(); openDrawer(); return;
    }
    // Close drawer
    if (e.target.closest('[data-filter-close]')) {
      e.preventDefault(); closeDrawer(); return;
    }
    // Overlay click
    if (e.target === overlay && drawer && drawer.classList.contains('is-open')) {
      closeDrawer(); return;
    }
    // Apply filters button (in drawer)
    if (e.target.closest('[data-filter-apply]')) {
      e.preventDefault();
      var params = collectFilterParams();
      fetchAndSwap(buildURL(params), true);
      closeDrawer();
      return;
    }
    // Clear all (toolbar)
    if (e.target.closest('[data-clear-all-filters]')) {
      e.preventDefault();
      // Uncheck all drawer checkboxes
      if (drawer) qsa('[data-filter-input]', drawer).forEach(function (i) { i.checked = false; });
      var params = new URLSearchParams();
      var sort = getSearchParams().get('sort_by');
      if (sort) params.set('sort_by', sort);
      fetchAndSwap(buildURL(params), true);
      return;
    }
    // Clear all (drawer footer)
    if (e.target.closest('[data-filter-drawer-clear]')) {
      e.preventDefault();
      if (drawer) qsa('[data-filter-input]', drawer).forEach(function (i) { i.checked = false; });
      var params2 = new URLSearchParams();
      var sort2 = getSearchParams().get('sort_by');
      if (sort2) params2.set('sort_by', sort2);
      fetchAndSwap(buildURL(params2), true);
      closeDrawer();
      return;
    }
  });

  // Escape key closes drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  // ── Sort select ──────────────────────────────────────────────────────────
  var sortSelect = qs('[data-sort-select]');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      var params = collectFilterParams();
      if (this.value && this.value !== 'manual') {
        params.set('sort_by', this.value);
      } else {
        params.delete('sort_by');
      }
      fetchAndSwap(buildURL(params), true);
    });
  }

  // ── Filter accordion ─────────────────────────────────────────────────────
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var trigger = e.target.closest('.melato-filter-group__trigger');
      if (!trigger) return;
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      var panelId = trigger.getAttribute('aria-controls');
      var panel   = panelId ? document.getElementById(panelId) : null;
      if (panel) panel.setAttribute('aria-hidden', String(expanded));
    });
  }

  // ── Price range debounce ─────────────────────────────────────────────────
  if (drawer) {
    drawer.addEventListener('input', function (e) {
      if (!e.target.matches('[data-filter-price-input]')) return;
      clearTimeout(priceTimer);
      priceTimer = setTimeout(function () {
        var params = collectFilterParams();
        fetchAndSwap(buildURL(params), true);
      }, 700);
    });
  }

  // ── Active filter pill clicks ─────────────────────────────────────────────
  function bindPillClicks() {
    qsa('[data-filter-pill]').forEach(function (pill) {
      pill.addEventListener('click', function (e) {
        e.preventDefault();
        var url = pill.getAttribute('href');
        if (!url) return;
        // Sync the corresponding drawer checkbox off
        if (drawer) {
          var pillText = pill.querySelector('span');
          if (pillText) {
            // Parse "Label: Value" to find the checkbox
            var parts = pillText.textContent.split(':');
            if (parts.length >= 2) {
              var val = parts.slice(1).join(':').trim();
              qsa('[data-filter-input]:checked', drawer).forEach(function (input) {
                if (input.value === val) input.checked = false;
              });
            }
          }
        }
        fetchAndSwap(url, true);
      });
    });
  }
  bindPillClicks();

  // ── Browser back/forward ─────────────────────────────────────────────────
  window.addEventListener('popstate', function (e) {
    var url = (e.state && e.state.url) || window.location.href;
    fetchAndSwap(url, false);
  });

  // ── Restore on page load ─────────────────────────────────────────────────
  // Only restore if no filters active in current URL (i.e. direct navigation)
  if (!window.location.search || window.location.search === '?') {
    restoreFilters();
  } else {
    // Persist current filtered URL for back-navigation
    persistFilters(window.location.href);
  }

  // ── Animate grid items on load ───────────────────────────────────────────
  if (typeof IntersectionObserver !== 'undefined') {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    qsa('.drip-reveal', grid).forEach(function (el) {
      revealObs.observe(el);
    });
  }

})();
