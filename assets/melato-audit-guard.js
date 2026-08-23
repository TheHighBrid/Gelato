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
    [/Free\s+shipping\s+over\s+\$\s*\d+(?:\.\d{2})?/gi, 'Complimentary delivery on all orders'],
    [/\$\s*\d+(?:\.\d{2})?\s+away\s+from\s+free\s+shipping/gi, 'Complimentary delivery included on every order.'],
    [/Free\s+domestic\s+shipping\s+over\s+\$\s*\d+(?:\.\d{2})?\s+USD\s*\(\$\s*\d+(?:\.\d{2})?\s+CAD\)/gi, 'Complimentary delivery on all orders.'],
    [/On\s+orders\s+over\s+\$\s*\d+(?:\.\d{2})?\s+CAD/gi, 'On all orders'],
    [/On\s+all\s+oders/gi, 'On all orders'],
    [/orders@melato\.ca/gi, 'support@melato.ca'],
    [/inquiries@melato\.ca|inquiry@melato\.ca/gi, 'contact@melato.ca'],
    [/mohamed@melato\.ca|mahfoud@melato\.ca/gi, 'management@melato.ca'],
    [/Bundle\s+Inactive/gi, ''],
    [/bundle\s+inactive/gi, ''],
    [/\./gi, ''],
    [/Cut with intent \| 2026 Melato ©®/g, 'Cut with intent · © 2026 Melato'],
    [/Designer apparel, cut with intention\.\.\./g, 'Designer apparel, cut with intention.']
  ];

  const frenchExact = new Map([
    ['Search', 'Rechercher'],
    ['Account', 'Compte'],
    ['Bag', 'Panier'],
    ['Melato / Navigation', 'Melato / Navigation'],
    ['Designer apparel, cut with intention.', 'Vêtements de créateur, pensés avec intention.'],
    ['Designer apparel, cut with intention.', 'Vêtements de créateur, pensés avec intention.'],
    ['Collection', 'Collection'],
    ['Home', 'Accueil'],
    ['Search the archive', 'Rechercher dans les archives'],
    ['Search Melato', 'Rechercher sur Melato'],
    ['Search products', 'Rechercher des produits'],
    ['Type what you want', 'Recherchez ce que vous voulez'],
    ['Your Cart', 'Votre panier'],
    ['Your cart is empty.', 'Votre panier est vide.'],
    ['New arrivals', 'Nouveautés'],
    ['New Arrivals', 'Nouveautés'],
    ['Tracksuits', 'Survêtements'],
    ['Fragrance', 'Parfums'],
    ['Accessories', 'Accessoires'],
    ['Eve’s Wardrobe', 'Le vestiaire d’Eve'],
    ["Eve's Wardrobe", 'Le vestiaire d’Eve'],
    ['Best Sellers', 'Meilleures ventes'],
    ['Living Lookbook', 'Lookbook vivant'],
    ['The Living Lookbook', 'Le lookbook vivant'],
    ['Newsletter', 'Infolettre'],
    ['Our Story', 'Notre histoire'],
    ['FAQ', 'FAQ'],
    ['Size Guide', 'Guide des tailles'],
    ['Shipping & Returns', 'Livraison et retours'],
    ['Remove', 'Supprimer'],
    ['Quantity', 'Quantité'],
    ['Add order note', 'Ajouter une note'],
    ['Order note', 'Note de commande'],
    ['Subtotal', 'Sous-total'],
    ['Complimentary standard delivery.', 'Livraison standard offerte.'],
    ['Checkout', 'Commander'],
    ['View cart', 'Voir le panier']
  ]);

  const frenchAria = new Map([
    ['Open navigation', 'Ouvrir la navigation'],
    ['Close navigation', 'Fermer la navigation'],
    ['Header tools', 'Outils de navigation'],
    ['Open search', 'Ouvrir la recherche'],
    ['Close search', 'Fermer la recherche'],
    ['Main navigation', 'Navigation principale'],
    ['Shopping cart', 'Panier'],
    ['Cart items', 'Articles du panier'],
    ['Close cart and continue shopping', 'Fermer le panier et continuer les achats']
  ]);

  function patchPlainText(el) {
    if (!el || el.children.length || /^(SCRIPT|STYLE|NOSCRIPT|SVG|PATH|INPUT|TEXTAREA)$/i.test(el.tagName)) return;
    let next = el.textContent || '';
    const before = next;
    textRules.forEach(([from, to]) => { next = next.replace(from, to); });
    if (next !== before) el.textContent = next.replace(/\s{2,}/g, ' ').trim();
  }

  function localizeFrench() {
    if (!/^fr(?:-|$)/i.test(document.documentElement.lang || '')) return;
    const roots = document.querySelectorAll('[data-mxh], .cart-drawer, cart-drawer, [data-cart-drawer], footer');
    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const raw = node.nodeValue || '';
        const trimmed = raw.trim();
        if (!trimmed) return;
        let next = frenchExact.get(trimmed);
        if (!next) {
          next = trimmed
            .replace(/^Cart\s*\/\s*(\d+)$/i, 'Panier / $1')
            .replace(/^Cart with (\d+) item$/i, 'Panier avec $1 article')
            .replace(/^Cart with (\d+) items$/i, 'Panier avec $1 articles');
        }
        if (next && next !== trimmed) node.nodeValue = raw.replace(trimmed, next);
      });
      root.querySelectorAll('[aria-label]').forEach((el) => {
        const label = el.getAttribute('aria-label');
        const direct = frenchAria.get(label);
        if (direct) el.setAttribute('aria-label', direct);
        else if (/^Cart with (\d+) item$/i.test(label)) el.setAttribute('aria-label', label.replace(/^Cart with (\d+) item$/i, 'Panier avec $1 article'));
        else if (/^Cart with (\d+) items$/i.test(label)) el.setAttribute('aria-label', label.replace(/^Cart with (\d+) items$/i, 'Panier avec $1 articles'));
      });
      root.querySelectorAll('input[placeholder]').forEach((el) => {
        if (el.placeholder === 'Type what you want') el.placeholder = 'Recherchez ce que vous voulez';
      });
    });
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

  function labelProductGallery() {
    document.querySelectorAll('.pdp-thumbs').forEach((group) => {
      const productTitle = (document.querySelector('.pdp-title')?.textContent || document.querySelector('h1')?.textContent || 'Product').trim();
      const seen = new Set();
      group.querySelectorAll('[data-pdp-thumb]').forEach((button, index) => {
        const mediaAlt = (button.getAttribute('data-media-alt') || '').trim();
        const key = mediaAlt.toLowerCase();
        const weak = !mediaAlt || /^(image|photo|product)$/i.test(mediaAlt) || mediaAlt === productTitle || seen.has(key);
        const descriptive = weak ? `${productTitle}, product view ${index + 1}` : mediaAlt;
        button.setAttribute('aria-label', `Show ${descriptive}`);
        if (weak) button.setAttribute('data-media-alt', descriptive);
        seen.add((descriptive || mediaAlt).toLowerCase());
      });
    });

    const genericControls = document.querySelectorAll('button[aria-label="Image"], a[aria-label="Image"]');
    if (genericControls.length) {
      const productTitle = (document.querySelector('.pdp-title')?.textContent || document.querySelector('h1')?.textContent || 'Product').trim();
      genericControls.forEach((control, index) => control.setAttribute('aria-label', `${productTitle}, product view ${index + 1}`));
    }
  }

  function clean() {
    if (window.DRIP && window.DRIP.shop) window.DRIP.shop.freeShippingThreshold = 0;
    loadAuditCss();
    document.querySelectorAll('body *').forEach(patchPlainText);
    cleanFilters();
    cleanUtilities();
    labelIcons();
    labelProductGallery();
    localizeFrench();
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
