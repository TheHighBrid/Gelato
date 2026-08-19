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
      '@media(min-width:1180px){',
      '.mxh__left{gap:16px!important}',
      '.mxh__desktop-nav{display:flex;align-items:center;gap:clamp(10px,1.25vw,20px);min-width:0}',
      '.mxh__desktop-nav a{position:relative;white-space:nowrap;font-family:var(--font-mono-family,monospace);font-size:10px;line-height:1;letter-spacing:.09em;text-transform:uppercase;opacity:.78;transition:opacity .2s ease}',
      '.mxh__desktop-nav a:hover,.mxh__desktop-nav a[aria-current="page"]{opacity:1}',
      '.mxh__desktop-nav a:after{content:"";position:absolute;left:0;right:100%;bottom:-7px;height:1px;background:currentColor;transition:right .22s ease}',
      '.mxh__desktop-nav a:hover:after,.mxh__desktop-nav a[aria-current="page"]:after{right:0}',
      '.mxh__menu-text{display:none}',
      '}',
      '@media(min-width:1180px) and (max-width:1320px){.mxh__desktop-nav a:nth-child(n+4){display:none}}'
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
        .slice(0, 4);
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

      menu.insertAdjacentElement('afterend', nav);
    });
  }

  function restoreAnnouncement(root) {
    var scope = root && root.querySelector ? root : document;
    var bar = scope.querySelector('#melato-announcement-bar') || document.querySelector('#melato-announcement-bar');
    if (!bar) return;
    ensureStyles();
    bar.classList.remove('is-melato-static');
    bar.querySelectorAll('.melato-ann__secondary-message').forEach(function (item) {
      item.classList.remove('melato-ann__secondary-message');
    });
  }

  function run(root) {
    window.requestAnimationFrame(function () {
      normalizeLinks(root || document);
      ensureDesktopNav(root || document);
      restoreAnnouncement(root || document);
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