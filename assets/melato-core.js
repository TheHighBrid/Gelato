/* Melato Core JS — consolidated global layers. Do not edit individual source files; regenerate from them. */

/* ===== melato-dynamic-announcement.js ===== */
(()=>{function boot(){let bar=document.getElementById('melato-announcement-bar');if(!bar||bar.dataset.mxDynamicReady)return;bar.dataset.mxDynamicReady='1';let close=document.createElement('button');close.className='mx-ann-close';close.type='button';close.setAttribute('aria-label','Dismiss announcement bar');close.title='Close announcements';close.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';bar.appendChild(close);let key='melato-announcement-dismissed',dismissed=false;try{dismissed=window.sessionStorage.getItem(key)==='1'}catch { /* Session storage can be disabled; dismissal still works in memory. */ }if(dismissed){bar.hidden=true;bar.style.display='none';return}close.addEventListener('click',()=>{bar.hidden=true;bar.style.display='none';try{window.sessionStorage.setItem(key,'1')}catch { /* Session storage can be disabled; dismissal still works in memory. */ }});let source=bar.querySelector('[data-announcement-source]');if(!source)return;let messages=Array.prototype.slice.call(source.querySelectorAll('.melato-ann__item'));if(messages.length===1){let raw=messages[0].querySelector('span:not(.melato-ann__dot)');if(raw&&raw.textContent.indexOf('|')!==-1){let items=raw.textContent.split('|').map((x)=>{return x.trim()}).filter(Boolean);if(items.length>1){raw.textContent=items[0];items.slice(1).forEach((s)=>{let copy=messages[0].cloneNode(true);let t=copy.querySelector('span:not(.melato-ann__dot)');if(t)t.textContent=s;source.appendChild(copy)});messages=Array.prototype.slice.call(source.querySelectorAll('.melato-ann__item'))}}}let track=bar.querySelector('[data-announcement-track]');if(track){Array.prototype.slice.call(track.querySelectorAll('.melato-ann__group:not([data-announcement-source])')).forEach((n)=>{n.remove()})}if(messages.length<2)return;bar.classList.add('mx-ann-rotating');source.setAttribute('aria-live','off');let idx=0;function show(){messages.forEach((el,i)=>{let on=i===idx;el.hidden=!on;el.setAttribute('aria-hidden',on?'false':'true');if(el.matches('a'))el.tabIndex=on?0:-1})}show();let reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;if(reduced)return;let timer=null;function play(){if(document.hidden||bar.matches(':hover')||bar.contains(document.activeElement))return;if(!timer)timer=window.setInterval(()=>{idx=(idx+1)%messages.length;show()},3000)}function stop(){if(timer){window.clearInterval(timer);timer=null}}bar.addEventListener('mouseenter',stop);bar.addEventListener('mouseleave',play);bar.addEventListener('focusin',stop);bar.addEventListener('focusout',(e)=>{if(!bar.contains(e.relatedTarget))play()});document.addEventListener('visibilitychange',()=>{document.hidden?stop():play()});play()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();document.addEventListener('shopify:section:load',boot)})();
/* ===== melato-optimization-2026.js ===== */
(() => {
  'use strict';

  const FREE_SHIPPING = 'COMPLIMENTARY STANDARD DELIVERY ON ALL ORDERS';
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

/* ===== melato-audit-nav-collections.js ===== */
/**
 * Melato navigation normalizer + desktop discovery layer.
 * Shopify/Liquid remains the source of truth for menu structure and URLs.
 */
(function () {
  'use strict';

  var SKIP_PROTOCOLS = ['mailto:', 'tel:', 'sms:'];

  function shouldSkip(rawHref) {
    if (!rawHref) return true;
    var href = String(rawHref).trim();
    if (!href) return true;
    if (href.charAt(0) === '#') return true;
    if (href.indexOf('{{') !== -1 || href.indexOf('{%') !== -1) return true;
    var lower = href.toLowerCase();
    return SKIP_PROTOCOLS.some(function (protocol) { return lower.indexOf(protocol) === 0; });
  }

  function normalizePath(pathname) {
    var path = pathname || '/';
    path = path.replace(/\/{2,}/g, '/');
    path = path.replace(/\/collections\/denim-1(?=\/|$)/i, '/collections/denim');
    if (path.length > 1) path = path.replace(/\/+$/g, '');
    return path || '/';
  }

  function normalizeHref(rawHref) {
    if (shouldSkip(rawHref)) return rawHref;
    try {
      var url = new URL(rawHref, window.location.origin);
      if (url.origin !== window.location.origin) return rawHref;
      url.pathname = normalizePath(url.pathname);
      return url.pathname + url.search + url.hash;
    } catch (error) {
      return rawHref;
    }
  }

  function normalizeLink(link) {
    if (!link || !link.getAttribute) return;
    var currentHref = link.getAttribute('href');
    var cleanHref = normalizeHref(currentHref);
    if (cleanHref && cleanHref !== currentHref) link.setAttribute('href', cleanHref);
  }

  function normalizeLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href]').forEach(normalizeLink);
  }

  function ensureStyles() {
    if (document.getElementById('MelatoDiscoveryStyles')) return;
    var style = document.createElement('style');
    style.id = 'MelatoDiscoveryStyles';
    style.textContent = [
      '.mxh__desktop-nav{display:none}',
      '#melato-announcement-bar.is-melato-static .melato-ann__viewport{-webkit-mask-image:none!important;mask-image:none!important;overflow:visible!important}',
      '#melato-announcement-bar.is-melato-static .melato-ann__track{animation:none!important;transform:none!important;width:100%!important;display:block!important}',
      '#melato-announcement-bar.is-melato-static .melato-ann__group{display:flex!important;width:100%!important;min-width:0!important;justify-content:center!important;align-items:center!important;flex-direction:column!important;gap:6px!important;padding-inline:0!important}',
      '#melato-announcement-bar.is-melato-static .melato-ann__group[aria-hidden="true"]{display:none!important}',
      '#melato-announcement-bar.is-melato-static .melato-ann__item{flex:0 1 auto!important;white-space:normal!important;text-align:center!important;line-height:1.5!important}',
      '@media(max-width:749px){#melato-announcement-bar.is-melato-static .melato-ann__item:nth-child(n+2){display:none!important}}',
      '@media(min-width:1180px){',
      '.mxh__left{gap:16px!important}',
      '.mxh__desktop-nav{display:flex;align-items:center;justify-content:center;gap:clamp(16px,2vw,32px);min-width:0;padding:12px 20px;border-top:1px solid var(--mxh-line)}',
      '.mxh__desktop-nav a{position:relative;white-space:nowrap;font-family:var(--font-mono-family,monospace);font-size:10px;line-height:1;letter-spacing:.085em;text-transform:uppercase;opacity:.78;transition:opacity .2s ease}',
      '.mxh__desktop-nav a:hover,.mxh__desktop-nav a[aria-current="page"]{opacity:1}',
      '.mxh__desktop-nav a:after{content:"";position:absolute;left:0;right:100%;bottom:-7px;height:1px;background:currentColor;transition:right .22s ease}',
      '.mxh__desktop-nav a:hover:after,.mxh__desktop-nav a[aria-current="page"]:after{right:0}',
      '.mxh__menu-text{display:none}',
      '}',
      '@media(min-width:1180px){#melato-announcement-bar.is-melato-static .melato-ann__item small{display:none}}'
    ].join('');
    document.head.appendChild(style);
  }

  function cleanNavLabel(source) {
    var clone = source.cloneNode(true);
    clone.querySelectorAll('span').forEach(function (node) { node.remove(); });
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function ensureDesktopNav(root) {
    var scope = root && root.querySelectorAll ? root : document;
    ensureStyles();
    scope.querySelectorAll('[data-mxh]').forEach(function (header) {
      if (header.querySelector('.mxh__desktop-nav')) return;
      var left = header.querySelector('.mxh__left');
      var menu = header.querySelector('[data-mxh-menu]');
      if (!left || !menu) return;

      var links = Array.from(header.querySelectorAll('.mxh__drawer .mxh__nav-item > .mxh__nav-link, .mxh__drawer .mxh__nav > .mxh__nav-link'))
        .filter(function (link) { return link.getAttribute('href'); })
        .filter(function (link) { return normalizeHref(link.getAttribute('href')) !== '/collections/sunglasses'; })
        .slice(0, 6);
      if (!links.length) return;

      var nav = document.createElement('nav');
      nav.className = 'mxh__desktop-nav';
      nav.setAttribute('aria-label', 'Primary navigation');

      links.forEach(function (source) {
        var link = document.createElement('a');
        link.href = normalizeHref(source.getAttribute('href'));
        link.textContent = cleanNavLabel(source);
        if (source.classList.contains('is-active')) link.setAttribute('aria-current', 'page');
        nav.appendChild(link);
      });

      header.querySelector('.mxh__bar').insertAdjacentElement('afterend', nav);
    });
  }

  function stabilizeAnnouncement(root) {
    var scope = root && root.querySelector ? root : document;
    var bar = scope.querySelector('#melato-announcement-bar') || document.querySelector('#melato-announcement-bar');
    if (!bar) return;
    ensureStyles();
    bar.classList.add('is-melato-static');
    var groups = bar.querySelectorAll('.melato-ann__group');
    groups.forEach(function (group, index) {
      if (index === 0) {
        group.setAttribute('aria-hidden', 'false');
        group.removeAttribute('inert');
      } else {
        group.setAttribute('aria-hidden', 'true');
        group.setAttribute('inert', '');
      }
    });
  }

  function run(root) {
    window.requestAnimationFrame(function () {
      normalizeLinks(root || document);
      ensureDesktopNav(root || document);
      stabilizeAnnouncement(root || document);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { run(document); }, { once: true });
  } else {
    run(document);
  }

  document.addEventListener('shopify:section:load', function (event) { run(event.target); });
  document.addEventListener('shopify:section:select', function (event) { run(event.target); });
  window.MelatoNavNormalize = function (root) { run(root || document); };
})();

/* ===== melato-cart-drawer.js ===== */
(() => {
  'use strict';

  // Global storefront QA layer. Derive the sibling Shopify asset URL from this script
  // so the fix stays cache-versioned with the theme instead of hard-coding a CDN host.
  try {
    const current = document.currentScript?.src || '';
    if (current && !document.querySelector('script[data-melato-mobile-qa]')) {
      const qaUrl = current.replace(/melato-cart-drawer\.js(?:\?[^#]*)?$/i, 'melato-mobile-qa-20260826.js');
      if (qaUrl !== current) {
        const qa = document.createElement('script');
        qa.src = qaUrl;
        qa.defer = true;
        qa.dataset.melatoMobileQa = 'true';
        document.head.appendChild(qa);
      }
    }
  } catch (error) {
    console.warn('Melato QA loader:', error);
  }

  const drawer = document.getElementById('cart-drawer') || document.querySelector('.cart-drawer');
  if (!drawer) return;

  const overlay = document.getElementById('drip-overlay') || document.querySelector('[data-overlay]');
  const pendingForms = new WeakSet();
  let lastFocused = null;

  const locale = () => document.documentElement.lang || navigator.language || 'en-CA';
  const rootPath = () => {
    const root = String(window.Shopify?.routes?.root || '/');
    return root.endsWith('/') ? root : `${root}/`;
  };
  const route = path => `${rootPath()}${String(path || '').replace(/^\//, '')}`;
  const currency = cart => String((cart && cart.currency) || window.DRIP?.shop?.currency || 'CAD').toUpperCase();
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]));

  function formatMoney(cents, code) {
    const amount = Number(cents || 0) / 100;
    const currencyCode = String(code || window.DRIP?.shop?.currency || 'CAD').trim().toUpperCase();
    try {
      const formatted = new Intl.NumberFormat(locale(), {
        style:'currency', currency:currencyCode, currencyDisplay:'narrowSymbol'
      }).format(amount);
      return formatted.includes(currencyCode) ? formatted : `${formatted} ${currencyCode}`;
    } catch (error) {
      if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
        const formatted = window.Shopify.formatMoney(Number(cents || 0), window.DRIP?.shop?.moneyFormat || '${{amount}}');
        return String(formatted).includes(currencyCode) ? formatted : `${formatted} ${currencyCode}`;
      }
      return `$${amount.toFixed(2)} ${currencyCode}`;
    }
  }

  function toast(message) {
    const node = document.getElementById('drip-toast');
    if (!node || !message) return;
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('is-visible'), 2200);
  }

  async function fetchCart(attempt = 0) {
    const suffix = attempt ? `?melato_refresh=${Date.now()}` : '';
    const response = await fetch(`${route('cart.js')}${suffix}`, {
      method:'GET',
      credentials:'same-origin',
      cache:'no-store',
      headers:{ Accept:'application/json', 'X-Requested-With':'XMLHttpRequest' }
    });
    if (!response.ok) {
      if (attempt < 1) return fetchCart(attempt + 1);
      throw new Error(`Cart request failed (${response.status}).`);
    }
    const payload = await response.json().catch(() => null);
    if (!payload || !Array.isArray(payload.items)) {
      if (attempt < 1) return fetchCart(attempt + 1);
      throw new Error('Cart response was invalid.');
    }
    return payload;
  }

  function openCart() {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.removeAttribute('inert');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    overlay?.classList.add('is-visible');
    overlay?.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => drawer.querySelector('[data-cart-close],button,a,input,textarea,select')?.focus(), 40);
  }

  function closeCart() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    drawer.setAttribute('inert','');
    overlay?.classList.remove('is-visible');
    overlay?.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function updateChrome(cart) {
    const count = Number(cart?.item_count || 0);
    const code = currency(cart);
    document.querySelectorAll('[data-cart-item-count],.cart-count,.mxh__bag-count').forEach(node => node.textContent = String(count));
    document.querySelectorAll('.mxh__bag').forEach(node => node.setAttribute('aria-label', `Cart with ${count} ${count === 1 ? 'item' : 'items'}`));
    drawer.querySelectorAll('[data-cart-subtotal],.cart-subtotal__amount').forEach(node => node.textContent = formatMoney(cart?.total_price || 0, code));
    drawer.querySelectorAll('[data-checkout-btn],button[name="checkout"]').forEach(button => button.disabled = count === 0);
    const countLabel = drawer.querySelector('[data-cart-count-label]');
    if (countLabel) countLabel.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  const emptyTemplate = drawer.querySelector('[data-cart-empty-template]');
  const initialEmptyMarkup = emptyTemplate?.innerHTML.trim() || '<div class="cart-drawer__empty"><p class="cart-drawer__empty-text">Your cart is empty.</p><a href="/collections/new-arrivals" class="melato-cart-cta">Explore new arrivals</a></div>';

  function renderItems(cart) {
    const host = drawer.querySelector('[data-cart-items],.cart-drawer__items');
    if (!host) return;
    if (!cart?.items?.length) {
      host.innerHTML = initialEmptyMarkup;
      return;
    }
    const code = currency(cart);
    host.innerHTML = cart.items.map(item => {
      const title = escapeHtml(item.product_title || item.title || 'Product');
      const url = escapeHtml(item.url || '#');
      const imageUrl = escapeHtml(item.image || item.featured_image?.url || '');
      const image = imageUrl ? `<img class="cart-item__img" src="${imageUrl}" alt="${title}" width="88" height="110" loading="lazy" decoding="async">` : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title' ? `<span class="cart-item__variant">${escapeHtml(item.variant_title)}</span>` : '';
      const key = escapeHtml(item.key || '');
      const quantity = Math.max(0, Number(item.quantity || 0));
      return `<div class="cart-item" role="listitem" data-line-key="${key}">
        <a href="${url}" class="cart-item__img-link" tabindex="-1" aria-hidden="true">${image}</a>
        <div class="cart-item__info">
          <div class="cart-item__top"><a href="${url}" class="cart-item__title">${title}</a><button class="cart-item__remove" type="button" aria-label="Remove ${title}" data-remove-line="${key}">×</button></div>
          ${variant}
          <div class="cart-item__footer">
            <div class="qty-stepper" aria-label="Quantity for ${title}">
              <button class="qty-stepper__btn" type="button" aria-label="Decrease quantity" data-qty-change="-1" data-line-key="${key}">−</button>
              <input class="qty-stepper__value" type="number" value="${quantity}" min="0" inputmode="numeric" aria-label="Quantity for ${title}" data-line-key="${key}">
              <button class="qty-stepper__btn" type="button" aria-label="Increase quantity" data-qty-change="1" data-line-key="${key}">+</button>
            </div>
            <span class="price">${formatMoney(item.final_line_price, code)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderCart(cart) {
    renderItems(cart);
    updateChrome(cart);
  }

  async function updateLine(key, quantity) {
    if (!key) return;
    drawer.classList.add('is-updating');
    try {
      const response = await fetch(route('cart/change.js'), {
        method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json',Accept:'application/json','X-Requested-With':'XMLHttpRequest'},
        body:JSON.stringify({id:key,quantity:Math.max(0,Number(quantity || 0))})
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.description || payload.message || 'Cart could not be updated.');
      renderCart(payload);
    } catch (error) {
      console.error('Melato cart update:', error);
      toast(error.message || 'Cart could not be updated.');
      fetchCart().then(renderCart).catch(() => {});
    } finally {
      drawer.classList.remove('is-updating');
    }
  }

  function isProductAddForm(form) {
    if (!form) return false;
    const action = form.getAttribute('action') || '';
    const hasVariant = Boolean(form.querySelector('[name="id"]'));
    const hasAdd = Boolean(form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]'));
    return action.includes('/cart/add') || form.matches('.pdp-form,.melato-clean-product__form,[data-product-form]') || (hasVariant && hasAdd);
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button.dataset.melatoOriginalText = button.textContent || '';
      button.dataset.melatoWasDisabled = button.disabled ? 'true' : 'false';
      button.disabled = true;
      button.classList.add('is-loading');
      button.textContent = 'Adding';
    } else {
      button.classList.remove('is-loading');
      button.textContent = button.dataset.melatoOriginalText || 'Add to cart';
      button.disabled = button.dataset.melatoWasDisabled === 'true';
    }
  }

  async function addForm(form, submitter) {
    if (pendingForms.has(form)) return;
    const id = form.querySelector('[name="id"]');
    if (!id?.value) {
      toast('Select an available option.');
      return;
    }
    pendingForms.add(form);
    const button = submitter?.matches?.('button,input[type="submit"]') ? submitter : form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]');
    setButtonLoading(button, true);
    try {
      const data = new FormData(form);
      if (!data.get('quantity')) data.set('quantity','1');
      const response = await fetch(route('cart/add.js'), {
        method:'POST', credentials:'same-origin', headers:{Accept:'application/json','X-Requested-With':'XMLHttpRequest'}, body:data
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.description || payload.message || 'Unable to add to cart.');
      const cart = await fetchCart();
      renderCart(cart);
      openCart();
      toast('Added to cart');
      window.dispatchEvent(new CustomEvent('cart:updated',{detail:{cart}}));
    } catch (error) {
      console.error('Melato add to cart:', error);
      toast(error.message || 'Unable to add to cart.');
    } finally {
      pendingForms.delete(form);
      setButtonLoading(button, false);
    }
  }

  function trapTab(event) {
    const nodes = Array.from(drawer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node => !node.hidden && node.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!isProductAddForm(form) || event.defaultPrevented) return;
    const submitter = event.submitter || document.activeElement;
    if (submitter?.closest?.('.shopify-payment-button,.shopify-payment-button__button')) return;
    event.preventDefault();
    addForm(form, submitter);
  });

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-cart-open],[data-cart-toggle],.mxh__bag');
    if (opener && !opener.closest('.cart-drawer')) {
      event.preventDefault();
      fetchCart().then(cart => {
        renderCart(cart);
        openCart();
      }).catch(error => {
        // Never paint a large failure toast over editorial content. If the AJAX
        // endpoint genuinely fails after retry, fall back to Shopify's cart page.
        console.error('Melato cart open:', error);
        window.location.assign(route('cart'));
      });
      return;
    }

    if (event.target.closest('[data-cart-close]')) { event.preventDefault(); closeCart(); return; }

    const quantityButton = event.target.closest('[data-qty-change]');
    if (quantityButton?.closest('.cart-drawer')) {
      event.preventDefault();
      const row = quantityButton.closest('.cart-item');
      const key = quantityButton.dataset.lineKey || row?.dataset.lineKey;
      const input = row?.querySelector('.qty-stepper__value');
      updateLine(key, Math.max(0, Number(input?.value || 0) + Number(quantityButton.dataset.qtyChange || 0)));
      return;
    }

    const removeButton = event.target.closest('[data-remove-line]');
    if (removeButton?.closest('.cart-drawer')) {
      event.preventDefault();
      updateLine(removeButton.dataset.removeLine || removeButton.closest('[data-line-key]')?.dataset.lineKey, 0);
      return;
    }

    const noteToggle = event.target.closest('.cart-note-toggle');
    if (noteToggle?.closest('.cart-drawer')) {
      const field = drawer.querySelector('#cart-note-field');
      const expanded = noteToggle.getAttribute('aria-expanded') === 'true';
      noteToggle.setAttribute('aria-expanded', String(!expanded));
      if (field) { field.hidden = expanded; field.setAttribute('aria-hidden', String(expanded)); }
    }
  });

  drawer.addEventListener('change', event => {
    const quantityInput = event.target.closest('.qty-stepper__value[data-line-key]');
    if (quantityInput) { updateLine(quantityInput.dataset.lineKey, Number(quantityInput.value || 0)); return; }
    const note = event.target.closest('[data-note-input]');
    if (note) {
      const hidden = drawer.querySelector('[data-note-hidden]');
      if (hidden) hidden.value = note.value;
    }
  });

  drawer.addEventListener('input', event => {
    const note = event.target.closest('[data-note-input]');
    if (!note) return;
    const hidden = drawer.querySelector('[data-note-hidden]');
    if (hidden) hidden.value = note.value;
  });

  overlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', event => {
    if (!drawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeCart(); }
    else if (event.key === 'Tab') trapTab(event);
  });
})();

/* ===== melato-apple-design.js ===== */
/**
 * ==========================================================================
 * MELATO ATELIER × APPLE FLUID MOTION CONTROLLER
 * Assets: melato-apple-design.js
 * Translated from WWDC "Designing Fluid Interfaces"
 * ==========================================================================
 */

(function MelatoAppleDesign() {

  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(() => {
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

    window.addEventListener('scroll', () => {
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

      summary.addEventListener('click', (e) => {
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

          anim.onfinish = () => {
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

          openAnim.onfinish = () => {
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
    document.addEventListener('keydown', (e) => {
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

    document.addEventListener('pointerdown', (e) => {
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

    let observer = new MutationObserver(() => {
      bubbles.forEach((bubble) => {
        bubble.classList.remove('badge-pulse');
        // Force reflow for retriggering animation
        void bubble.offsetWidth;
        bubble.classList.add('badge-pulse');
      });
    });

    bubbles.forEach((bubble) => {
      observer.observe(bubble, { childList: true, characterData: true, subtree: true });
    });
  }
})();
