(() => {
  'use strict';
  if (window.__MELATO_AUDIT_GUARD_V540__) return;
  window.__MELATO_AUDIT_GUARD_V540__ = true;

  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();

  function loadAuditCss() {
    if (document.querySelector('link[href*="melato-premium-audit-fixes.css"]')) return;
    const src = document.currentScript && document.currentScript.src;
    if (!src) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src.replace('melato-audit-guard.js', 'melato-premium-audit-fixes.css');
    document.head.appendChild(link);
  }

  const textRules = [
    [/Free\s+Complimentary\s+Delivery/gi, 'Complimentary delivery'],
    [/Free\s+shipping\s+over\s+\$60/gi, 'Complimentary delivery on all orders'],
    [/FREE\s+SHIPPING\s+OVER\s+\$60/gi, 'COMPLIMENTARY DELIVERY ON ALL ORDERS'],
    [/\$60\.00\s+away\s+from\s+free\s+shipping/gi, 'Complimentary delivery included on every order.'],
    [/Free\s+domestic\s+shipping\s+over\s+\$43\s+USD\s*\(\$60\s+CAD\)/gi, 'Complimentary delivery on all orders.'],
    [/On\s+orders\s+over\s+\$150\s+CAD/gi, 'On all orders'],
    [/On\s+all\s+oders/gi, 'On all orders'],
    [/orders@melato\.ca/gi, 'support@melato.ca'],
    [/inquiries@melato\.ca|inquiry@melato\.ca/gi, 'contact@melato.ca'],
    [/mohamed@melato\.ca|mahfoud@melato\.ca/gi, 'management@melato.ca'],
    [/Bundle\s+Inactive/gi, ''],
    [/bundle\s+inactive/gi, ''],
    [/Exact fibre percentage is not published yet\./gi, ''],
    [/Cut with intent \| 2026 Melato ©®/g, 'Cut with intent · © 2026 Melato'],
    [/Designer apparel, edited with intention\. Built in Ottawa\. Worn anywhere\./g, 'Designer apparel, edited with intention. Worn anywhere.']
  ];

  function patchPlainText(el) {
    if (!el || el.children.length || /^(SCRIPT|STYLE|NOSCRIPT|SVG|PATH|INPUT|TEXTAREA)$/i.test(el.tagName)) return;
    let next = el.textContent || '';
    const before = next;
    textRules.forEach(([from, to]) => { next = next.replace(from, to); });
    if (next !== before) el.textContent = next.replace(/\s{2,}/g, ' ').trim();
  }

  function cleanFilters() {
    const rootSelector = '.facets, .mobile-facets, facet-filters-form, .collection-filters, [data-filter], [data-filter-open], [data-active-filters-bar]';
    if (typeof NodeFilter !== 'undefined') {
      document.querySelectorAll(rootSelector).forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
          const before = node.nodeValue || '';
          const after = before
            .replace(/\bFilters?\s+0\b/gi, (match) => match.toLowerCase().startsWith('filters') ? 'Filters' : 'Filter')
            .replace(/\(\s*\d+\s*\)/g, '')
            .replace(/\bIn stock\b/g, 'Available Now')
            .replace(/\bOut of stock\b/g, 'Archive (Sold Out)')
            .replace(/\s{2,}/g, ' ');
          if (after !== before) node.nodeValue = after;
        });
      });
    }
    document.querySelectorAll('.facets__selected,.facets__summary .count,.facets__label .count,.facet-checkbox .count,.mobile-facets__count,.filter-count,.facet-count,[data-filter-count],[data-facet-count]').forEach((el) => {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function isOpen(el) {
    return el.hasAttribute('open') || el.getAttribute('aria-hidden') === 'false' || ['is-open','open','active','is-active','is-visible','menu-opening','animate'].some((klass) => el.classList.contains(klass));
  }

  function cleanUtilities() {
    document.querySelectorAll('.melato-utility-layer .cart-drawer,.melato-utility-layer .search-drawer,.melato-utility-layer .mobile-menu,.melato-utility-layer .quick-view-modal,.melato-utility-layer .size-guide-modal,.melato-utility-layer [data-cart-drawer],.melato-utility-layer [data-search-drawer],.melato-utility-layer [data-mobile-menu],.melato-utility-layer [data-quick-view],.melato-utility-layer [data-size-guide],cart-drawer,menu-drawer,modal-dialog,details-modal').forEach((el) => {
      if (isOpen(el)) {
        el.removeAttribute('hidden');
        el.removeAttribute('aria-hidden');
        el.removeAttribute('inert');
        try { el.inert = false; } catch (e) {}
      } else {
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('inert', '');
        try { el.inert = true; } catch (e) {}
        el.hidden = true;
      }
    });
  }

  function labelIcons() {
    const labels = [
      ['[data-cart-open],a[href="/cart"],[aria-controls*="cart" i]', 'Open cart'],
      ['[data-search-open],[aria-controls*="search" i]', 'Open search'],
      ['[data-menu-open],[aria-controls*="menu" i],.header__menu-button', 'Open menu'],
      ['[data-filter-open],[aria-controls*="filter" i]', 'Open filters'],
      ['[data-filter-close],[data-close],.modal__close,.drawer__close', 'Close']
    ];
    labels.forEach(([selector, label]) => document.querySelectorAll(selector).forEach((el) => {
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
    }));
  }

  function clean() {
    if (window.DRIP && window.DRIP.shop) window.DRIP.shop.freeShippingThreshold = 0;
    loadAuditCss();
    document.querySelectorAll('body *').forEach(patchPlainText);
    cleanFilters();
    cleanUtilities();
    labelIcons();
  }

  ready(() => {
    let timer;
    let busy = false;
    const schedule = () => {
      if (busy) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        busy = true;
        try { clean(); } finally { busy = false; }
      }, 120);
    };
    clean();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','open','hidden','aria-hidden'] });
    document.addEventListener('click', () => setTimeout(schedule, 40), true);
    document.addEventListener('shopify:section:load', schedule);
    document.addEventListener('cart:updated', schedule);
  });
})();
