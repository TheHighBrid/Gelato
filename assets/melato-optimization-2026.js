(() => {
  'use strict';

  const FREE_SHIPPING = 'COMPLIMENTARY DELIVERY ON ALL ORDERS';
  const DISPATCH_STATUS = 'DROP001 IS LIVE - ORDERS DISPATCH IN 1 TO 3 BUSINESS DAYS - SHIPS FROM CANADA';
  const FOOTER_COPYRIGHT = '© 2026 Melato.';
  const FOOTER_TAGLINE = 'Cut with intent.';
  const CANONICAL_ALL_PRODUCTS = '/collections/all';
  const DENIM_CANONICAL = '/collections/denim';
  const PUBLIC_FILTER_GROUPS = [
    { label: 'Accessories', raw: ['Clothing Accessories'] },
    { label: 'Ties', raw: ['Neckties'] },
    { label: 'Travel Goods', raw: ['Toiletry Bags'] },
    { label: 'Underwear', raw: ['Men’s Undergarments', "Men's Undergarments", 'Mens Undergarments'] },
    { label: 'Tracksuits', raw: ['Track Jackets', 'Track Pants'] },
    { label: 'Tops', raw: ['Shirts', 'T-Shirts', 'T Shirts', 'T-shirts', 'Polos'] },
    { label: 'Eve’s Wardrobe', raw: ['Bodysuits', 'Dresses', 'Skirts'] }
  ];

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function cleanHref(value) {
    if (!value) return value;
    let href = String(value).trim();
    if (!href || href.charAt(0) === '#') return href;

    href = href.replace(/(\/cart|https?:\/\/[^\s"']+\/cart)\.+(?=($|[?#"'\s]))/gi, '$1');
    href = href.replace(/(^|https?:\/\/[^\s"']+)\/pages\/about(?=($|[?#"'\s]))/gi, '$1/pages/our-story');
    href = href.replace(/(^|https?:\/\/[^\s"']+)\/collections\/denim-1(?=($|[?#"'\s]))/gi, '$1' + DENIM_CANONICAL);
    href = href.replace(/(^|https?:\/\/[^\s"']+)\/collections\/drop-001-texture-form\.*(?=($|[?#"'\s]))/gi, '$1' + CANONICAL_ALL_PRODUCTS);

    return href;
  }

  function normalizeLinks(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href], form[action]').forEach((el) => {
      const attr = el.tagName === 'FORM' ? 'action' : 'href';
      const original = el.getAttribute(attr);
      const cleaned = cleanHref(original);
      if (original && cleaned !== original) el.setAttribute(attr, cleaned);
    });
  }

  function normalizeCopy(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const walker = document.createTreeWalker(scope.body || scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (['script', 'style', 'textarea', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
        const text = node.nodeValue || '';
        if (/COMPLIMENTARY DELIVERY|POPUP SHOW #3|JUNE 21|pre[- ]?order on june 21|drop001 coming soon|Free shipping is available/i.test(text)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

  }

  function normalizeFooter() {
    document.querySelectorAll('footer .melato-footer__copyright, footer [class*="copyright"]').forEach((el) => { el.textContent = FOOTER_COPYRIGHT; });
    document.querySelectorAll('footer .melato-footer__tagline, footer [class*="tagline"]').forEach((el) => {
      const text = (el.textContent || '').trim();
      if (!text || /Like never change|culture wears us|Cut with intent/i.test(text)) el.textContent = FOOTER_TAGLINE;
    });
    document.querySelectorAll('footer a[href]').forEach((a) => {
      const cleaned = cleanHref(a.getAttribute('href'));
      if (cleaned) a.setAttribute('href', cleaned);
    });
  }

  function normalizeFilterKey(value) {
    return String(value || '')
      .replace(/[’‘]/g, "'")
      .replace(/\(\s*\d+\s*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function publicFilterFor(value) {
    const key = normalizeFilterKey(value);
    for (const group of PUBLIC_FILTER_GROUPS) {
      if (normalizeFilterKey(group.label) === key) return group.label;
      if (group.raw.some((raw) => normalizeFilterKey(raw) === key)) return group.label;
    }
    return null;
  }

  function filterGroupForText(value) {
    const text = normalizeFilterKey(value);
    for (const group of PUBLIC_FILTER_GROUPS) {
      if (text.includes(normalizeFilterKey(group.label))) return group;
      if (group.raw.some((raw) => text.includes(normalizeFilterKey(raw)))) return group;
    }
    return null;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function polishFilterCopy(value) {
    let next = String(value || '');
    PUBLIC_FILTER_GROUPS.forEach((group) => {
      const terms = [group.label].concat(group.raw);
      terms.forEach((raw) => {
        const pattern = new RegExp('(^|[^A-Za-zÀ-ÿ])' + escapeRegExp(raw).replace(/[’']/g, "[’']") + '([^A-Za-zÀ-ÿ]|$)', 'gi');
        next = next.replace(pattern, '$1' + group.label + '$2');
      });
    });
    return next;
  }

  function polishTextNodes(scope) {
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (['script', 'style', 'textarea', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
        return filterGroupForText(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const cleaned = polishFilterCopy(node.nodeValue);
      if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
    });
  }

  function removeParamValue(params, name, value) {
    const next = new URLSearchParams();
    params.forEach((currentValue, currentName) => {
      if (currentName === name && currentValue === value) return;
      next.append(currentName, currentValue);
    });
    return next;
  }

  function urlWithoutFilterGroup(group, drawer) {
    let params = new URLSearchParams(window.location.search);
    if (!drawer || !group) return window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    drawer.querySelectorAll('[data-filter-input], input[type="checkbox"]').forEach((input) => {
      if (group.raw.some((raw) => normalizeFilterKey(raw) === normalizeFilterKey(input.value))) {
        params = removeParamValue(params, input.name, input.value);
      }
    });
    const str = params.toString();
    return window.location.pathname + (str ? '?' + str : '');
  }

  function normalizeFilterDrawer() {
    const drawer = document.getElementById('melato-filter-drawer');
    if (!drawer) return;

    PUBLIC_FILTER_GROUPS.forEach((group) => {
      const members = Array.from(drawer.querySelectorAll('[data-filter-input], input[type="checkbox"]'))
        .filter((input) => group.raw.some((raw) => normalizeFilterKey(raw) === normalizeFilterKey(input.value)))
        .map((input) => ({ input, row: input.closest('label') || input.closest('.melato-filter-option') || input.parentElement }))
        .filter((item) => item.row);

      if (!members.length) return;

      const anchor = members[0];
      anchor.input.checked = members.some((item) => item.input.checked);
      anchor.input.dataset.melatoPublicFilterGroup = group.label;
      anchor.row.dataset.melatoPublicFilterLabel = group.label;

      members.slice(1).forEach((item) => {
        item.row.hidden = true;
        item.row.setAttribute('aria-hidden', 'true');
        item.row.dataset.melatoGroupedFilterHidden = group.label;
        item.input.tabIndex = -1;
      });

      if (anchor.input.dataset.melatoGroupBound !== 'true') {
        anchor.input.dataset.melatoGroupBound = 'true';
        anchor.input.addEventListener('change', () => {
          const checked = anchor.input.checked;
          members.forEach((item) => { item.input.checked = checked; });
        });
      }
    });

    polishTextNodes(drawer);
  }

  function normalizeActiveFilterPills() {
    const drawer = document.getElementById('melato-filter-drawer');
    const bars = document.querySelectorAll('[data-active-filters-bar]');
    bars.forEach((bar) => {
      const seen = new Set();
      bar.querySelectorAll('[data-filter-pill], a[href]').forEach((pill) => {
        const group = filterGroupForText(pill.textContent || '');
        polishTextNodes(pill);
        if (!group) return;
        const key = normalizeFilterKey(group.label);
        if (seen.has(key)) {
          pill.hidden = true;
          pill.setAttribute('aria-hidden', 'true');
          return;
        }
        seen.add(key);
        pill.setAttribute('href', urlWithoutFilterGroup(group, drawer));
      });
    });
  }

  function normalizeCollectionFilters(root) {
    if (!document.body.className.includes('template-collection') && !window.location.pathname.includes('/collections/')) return;
    const scope = root && root.querySelectorAll ? root : document;
    normalizeFilterDrawer();
    normalizeActiveFilterPills();
    ['[data-active-filters-bar]', '[data-collection-toolbar]', '#melato-filter-drawer'].forEach((selector) => {
      scope.querySelectorAll(selector).forEach(polishTextNodes);
    });
  }

  function watchCollectionFilters() {
    if (!document.body.className.includes('template-collection') && !window.location.pathname.includes('/collections/')) return;
    let timer;
    const target = document.querySelector('main') || document.body;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => normalizeCollectionFilters(document), 80);
    });
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  function removeDuplicateLegalLine() {
    document.querySelectorAll('main, .main-content, body').forEach((scope) => {
      scope.querySelectorAll('p, small, div, span').forEach((el) => {
        if (el.closest('footer')) return;
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (/© 2026 Melato LLC Inc\..*All rights reserved/i.test(text)) {
          const block = el.closest('section, .section, .page-width, div') || el;
          block.remove();
        }
      });
    });
  }

  function disableDeadReviewLinks() {
    document.querySelectorAll('a[href^="javascript"], a[href="javascript:void(0)"]').forEach((a) => {
      const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (/Customers rate us|5\.0\/5|reviews/i.test(text)) {
        a.setAttribute('href', '#judgeme_product_reviews');
        a.setAttribute('data-melato-fixed-review-link', 'true');
      }
    });
  }

  function removeLegacyHeaderEcho() {
    document.querySelectorAll('header, .site-header, .header, .shopify-section-header, nav').forEach((el) => {
      if (el.closest('.melato-header') || el.closest('footer')) return;
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const rawUrlEcho = /\/account|\/cart/i.test(text);
      const menuEcho = /Menu\s+Home\s+Catalog\s+Search\s+Account\s+Cart/i.test(text) || /Home\s+Catalog\s+Search\s+Account\s+Cart/i.test(text);
      const nearTop = !el.getBoundingClientRect || el.getBoundingClientRect().top < 420;
      if (nearTop && rawUrlEcho && menuEcho) {
        el.setAttribute('hidden', 'hidden');
        el.setAttribute('aria-hidden', 'true');
        el.dataset.melatoLegacyHeaderRemoved = 'true';
      }
    });
  }

  function run(root) {
    normalizeLinks(root);
    normalizeCopy(root);
    normalizeFooter();
    normalizeCollectionFilters(root);
    removeDuplicateLegalLine();
    disableDeadReviewLinks();
    removeLegacyHeaderEcho();
  }

  ready(() => {
    run(document);
    watchCollectionFilters();
  });
  document.addEventListener('shopify:section:load', (event) => run(event.target));
  document.addEventListener('shopify:section:select', (event) => run(event.target));
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const original = link.getAttribute('href');
    const cleaned = cleanHref(original);
    if (original && cleaned !== original) link.setAttribute('href', cleaned);
  }, true);
})();
