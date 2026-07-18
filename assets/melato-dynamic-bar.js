/**
 * MELATO Dynamic Announcement Bar Color System
 * Restores support for the custom .melato-marquee bar and applies accent color without fighting the section settings.
 */
(function () {
  'use strict';

  const SCHEMES = {
    'shirts':       { bg: '#0a1628', text: '#c8deff', accent: '#5b9bd5', micro: '#6ba3dc', badge: 'SHIRTS' },
    'jacket':       { bg: '#1a1108', text: '#f5c87a', accent: '#d4a44c', micro: '#c49040', badge: 'JACKETS' },
    'jackets':      { bg: '#1a1108', text: '#f5c87a', accent: '#d4a44c', micro: '#c49040', badge: 'JACKETS' },
    'top':          { bg: '#1a0a0f', text: '#f5d4e0', accent: '#d97090', micro: '#c0607a', badge: 'TOPS' },
    'tops':         { bg: '#1a0a0f', text: '#f5d4e0', accent: '#d97090', micro: '#c0607a', badge: 'TOPS' },
    'bodysuit':     { bg: '#1a0a0f', text: '#f5d4e0', accent: '#d97090', micro: '#c0607a', badge: 'BODYSUITS' },
    'dress':        { bg: '#1f0f1f', text: '#e8d0f8', accent: '#b06fd4', micro: '#9a58bf', badge: 'DRESSES' },
    'dresses':      { bg: '#1f0f1f', text: '#e8d0f8', accent: '#b06fd4', micro: '#9a58bf', badge: 'DRESSES' },
    'accessory':    { bg: '#0d1a0d', text: '#b8d9b8', accent: '#5aab5a', micro: '#489048', badge: 'ACCESSORIES' },
    'accessories':  { bg: '#0d1a0d', text: '#b8d9b8', accent: '#5aab5a', micro: '#489048', badge: 'ACCESSORIES' },
    'jeans':        { bg: '#080d1a', text: '#c0cce8', accent: '#4060b0', micro: '#3551a0', badge: 'DENIM' },
    'denim':        { bg: '#080d1a', text: '#c0cce8', accent: '#4060b0', micro: '#3551a0', badge: 'DENIM' },
    'pant':         { bg: '#080d1a', text: '#c0cce8', accent: '#4060b0', micro: '#3551a0', badge: 'PANTS' },
    'pants':        { bg: '#080d1a', text: '#c0cce8', accent: '#4060b0', micro: '#3551a0', badge: 'PANTS' },
    'skirt':        { bg: '#1a0e08', text: '#f5ddc8', accent: '#c87840', micro: '#b06830', badge: 'SKIRTS' },
    'skirts':       { bg: '#1a0e08', text: '#f5ddc8', accent: '#c87840', micro: '#b06830', badge: 'SKIRTS' },
    'new-arrivals': { bg: '#1a1400', text: '#ffe566', accent: '#ffd700', micro: '#d4b200', badge: 'NEW DROP' },
    'tracksuits':   { bg: '#0f1a0f', text: '#c8f0c8', accent: '#50c050', micro: '#3da83d', badge: 'TRACKSUITS' },
    'all':          { bg: '#0a0a0a', text: '#ffd9a5', accent: '#ff8f6c', micro: '#e07850', badge: 'ALL' },
    'default':      { bg: '#0a0a0a', text: '#ffd9a5', accent: '#ff8f6c', micro: '#e07850', badge: 'MELATO' }
  };

  const BAR_SELECTOR = '.melato-marquee, .melato-announcement-bar, [data-announcement-bar], .announcement-bar__wrapper, .announcement-bar';
  const TRANSITION = 'background-color 0.55s ease, color 0.55s ease, border-color 0.55s ease';

  function cssVar(el, name) {
    return window.getComputedStyle(el).getPropertyValue(name).trim();
  }

  function contextScheme() {
    const body = document.body;
    const tmpl = body.dataset.template || '';
    const pType = (body.dataset.productType || '').toLowerCase().replace(/\s+/g, '-');
    const colHandle = (body.dataset.collection || '').toLowerCase();

    if (tmpl === 'product' && pType && SCHEMES[pType]) return { scheme: SCHEMES[pType], contextual: true };
    if (tmpl === 'collection' && colHandle && SCHEMES[colHandle]) return { scheme: SCHEMES[colHandle], contextual: true };
    return { scheme: SCHEMES.default, contextual: false };
  }

  function setImportant(el, prop, value) {
    if (el && value) el.style.setProperty(prop, value, 'important');
  }

  function applyScheme() {
    const result = contextScheme();
    const bars = document.querySelectorAll(BAR_SELECTOR);
    if (!bars.length) return;

    bars.forEach((bar) => {
      const baseBg = cssVar(bar, '--marquee-bg') || cssVar(bar, '--bar-bg') || result.scheme.bg;
      const baseText = cssVar(bar, '--marquee-text') || cssVar(bar, '--bar-text') || result.scheme.text;
      const sectionAccent = cssVar(bar, '--marquee-accent') || cssVar(bar, '--bar-accent');
      const accent = result.contextual ? result.scheme.accent : (sectionAccent || result.scheme.accent);
      const micro = result.contextual ? (result.scheme.micro || accent) : accent;

      bar.dataset.melatoDynamicBar = result.contextual ? 'contextual' : 'section-accent';
      bar.style.transition = TRANSITION;
      bar.style.setProperty('--bar-bg', baseBg);
      bar.style.setProperty('--bar-text', baseText);
      bar.style.setProperty('--bar-accent', accent);
      bar.style.setProperty('--bar-micro', micro);
      setImportant(bar, 'background-color', baseBg);
      setImportant(bar, 'color', baseText);

      bar.querySelectorAll('.melato-marquee__track, .ann-track, .marquee-track, [data-bar-track]').forEach((el) => {
        setImportant(el, 'background-color', baseBg);
        setImportant(el, 'color', baseText);
      });

      bar.querySelectorAll('.melato-marquee__item, a, .announcement-bar__message, .announcement-bar__link, .announcement-bar__cta, [data-bar-cta]').forEach((el) => {
        setImportant(el, 'color', baseText);
      });

      bar.querySelectorAll('.melato-marquee__divider, .ann-micro, [data-bar-micro]').forEach((el) => {
        setImportant(el, 'color', micro);
      });

      bar.querySelectorAll('.ann-badge, .announcement-bar__badge, [data-bar-badge]').forEach((el) => {
        setImportant(el, 'background-color', accent);
        setImportant(el, 'color', baseBg);
      });
    });
  }

  function init() { applyScheme(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('popstate', init);
  document.addEventListener('shopify:section:load', init);
  window.MELATO_BAR = { refresh: init, schemes: SCHEMES, applyScheme: init };
})();
