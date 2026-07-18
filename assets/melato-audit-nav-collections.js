/**
 * Melato navigation URL normalizer
 * Theme: Gelato v5.30 staging
 *
 * Shopify/Liquid is the source of truth for navigation structure.
 * This asset only cleans href formatting on links that already exist.
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

  function run(root) {
    window.requestAnimationFrame(function () { normalizeLinks(root || document); });
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
