(() => {
  'use strict';

  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    if (!location.pathname.includes('/products/')) return;

    const root = document.querySelector('[id^="MelatoPDP-"]') || document.querySelector('main');
    if (!root) return;

    cleanCopy();
    polishSet();
    dynamicCompleteSet();
    bindGalleryThumbs(root);
    ensureProductGallery(root);

    window.setTimeout(() => ensureProductGallery(root), 900);
// Debounced + LOCK_KEY-aware — defers while guard/nav scripts are mid-patch
const LOCK_KEY = '__MELATO_AUDIT_PATCHING__';
let _polishTimer;
new MutationObserver(() => {
  if (window[LOCK_KEY]) return;
  clearTimeout(_polishTimer);
  _polishTimer = setTimeout(() => {
    if (window[LOCK_KEY]) return;
    cleanCopy();
    polishSet();
    bindGalleryThumbs(root);
  }, 300);
}).observe(root, { childList: true, subtree: true });
  });

  function cleanCopy() {
    document.querySelectorAll('.pdp-rte, .pdp-detail-list li, .pdp-proof-mini span, .pdp-thesis, .product__description, .rte').forEach((el) => {
      if (!el || el.children.length) return;
      const original = el.textContent || '';
      const cleaned = original
        .replace(/Exact fibre percentage is not published yet\.?/gi, '')
        .replace(/fibre percentage is not published yet\.?/gi, '')
        .replace(/fiber percentage is not published yet\.?/gi, '')
        .replace(/to be confirmed|tbd|not provided|information unavailable|details unavailable/gi, '')
        .trim();
      if (cleaned !== original.trim()) {
        el.textContent = cleaned || 'Premium construction selected for clean movement, shape, and everyday wearability.';
      }
    });
  }

  function polishSet() {
    document.querySelectorAll('.pdp-set h2').forEach((el) => {
      const original = el.textContent || '';
      const cleaned = original
        .replace(/\bFull\s+([A-ZÀ-ÝŪ\s]+?)uniform\b/g, 'Full $1 Uniform')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (cleaned && cleaned !== original.trim()) el.textContent = cleaned;
    });

    document.querySelectorAll('.pdp-set-card strong').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'shop matching piece') el.textContent = 'Complete the set.';
    });

    document.querySelectorAll('.pdp-set-label').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'you have') el.textContent = 'Current piece';
      if (text.includes('add matching')) el.textContent = 'Matching piece';
    });

    document.querySelectorAll('.pdp-set-total').forEach((el) => {
      const label = el.querySelector('span');
      const price = el.querySelector('strong');
      if (label) label.textContent = 'Full set price';
      if (price) price.style.marginLeft = 'auto';
    });
  }

  function dynamicCompleteSet() {
    document.querySelectorAll('.melato-set').forEach((box) => {
      if (box.dataset.dynamicPriceLoaded === 'true') return;
      const link = box.querySelector('a[href*="/products/"]');
      if (!link) return;

      const match = link.getAttribute('href').match(/\/products\/([^?#/]+)/);
      if (!match) return;
      box.dataset.dynamicPriceLoaded = 'true';

      fetch(`/products/${match[1]}.js`, { headers: { Accept: 'application/json' } })
        .then((response) => response.ok ? response.json() : null)
        .then((product) => {
          if (!product) return;
          const cents = product.price_min || product.price || 0;
          const name = box.querySelector('.melato-set__name');
          const price = box.querySelector('.melato-set__price');
          if (name) name.textContent = product.title;
          if (price) price.textContent = `$${(cents / 100).toFixed(2)} CAD`;
        })
        .catch(() => { box.dataset.dynamicPriceLoaded = 'false'; });
    });
  }

  function productHandleFromPath() {
    const match = location.pathname.match(/\/products\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  function sizedImage(src, width) {
    if (!src) return '';
    const parts = String(src).split('?');
    const base = parts[0].replace(/(\.(?:jpe?g|png|webp|gif))$/i, `_${width}x$1`);
    return base + (parts[1] ? `?${parts[1]}` : '');
  }

  function imageIsBroken(img) {
    if (!img) return true;
    const src = img.getAttribute('src') || '';
    if (!src || src === 'null' || src === 'undefined') return true;
    return img.complete && img.naturalWidth === 0;
  }

  function bindGalleryThumbs(scope) {
    scope.querySelectorAll('[data-pdp-thumb]').forEach((button) => {
      if (button.dataset.melatoThumbBound === 'true') return;
      button.dataset.melatoThumbBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const gallery = button.closest('.pdp-gallery') || scope;
        const mainImage = gallery.querySelector('.pdp-main-image');
        const nextSrc = button.dataset.mediaSrc || button.dataset.imageSrc;
        if (!mainImage || !nextSrc) return;

        mainImage.src = nextSrc;
        if (button.dataset.mediaSrcset) mainImage.srcset = button.dataset.mediaSrcset;
        else mainImage.removeAttribute('srcset');
        mainImage.style.display = 'block';
        mainImage.style.opacity = '1';
        mainImage.style.visibility = 'visible';

        gallery.querySelectorAll('[data-pdp-thumb]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });
  }

  function ensureProductGallery(root) {
    const gallery = root.querySelector('.pdp-gallery');
    if (!gallery || gallery.dataset.melatoGalleryRepaired === 'true') return;

    const existingImage = gallery.querySelector('.pdp-main-image');
    if (existingImage && !imageIsBroken(existingImage)) {
      gallery.querySelectorAll('img').forEach((img) => {
        img.style.display = 'block';
        img.style.opacity = '1';
        img.style.visibility = 'visible';
      });
      return;
    }

    const handle = productHandleFromPath();
    if (!handle) return;

    fetch(`/products/${handle}.js`, { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((product) => {
        if (!product || !Array.isArray(product.images) || !product.images.length) return;

        const images = product.images.slice(0, 8);
        const title = escapeHtml(product.title || 'Product image');
        const mainSrc = sizedImage(images[0], 1800);
        const mainSrcset = `${sizedImage(images[0], 600)} 600w, ${sizedImage(images[0], 900)} 900w, ${sizedImage(images[0], 1200)} 1200w, ${sizedImage(images[0], 1800)} 1800w`;

        gallery.innerHTML = `
          <div class="pdp-main-media">
            <img class="pdp-main-image" src="${mainSrc}" srcset="${mainSrcset}" sizes="(min-width: 1000px) 58vw, 100vw" alt="${title}" loading="eager" fetchpriority="high">
          </div>
          ${images.length > 1 ? `<div class="pdp-thumbs" role="list" aria-label="Product image thumbnails">
            ${images.map((src, index) => {
              const thumbSrc = sizedImage(src, 220);
              const fullSrc = sizedImage(src, 1800);
              const srcset = `${sizedImage(src, 600)} 600w, ${sizedImage(src, 900)} 900w, ${sizedImage(src, 1200)} 1200w, ${sizedImage(src, 1800)} 1800w`;
              return `<button class="pdp-thumb${index === 0 ? ' is-active' : ''}" type="button" data-pdp-thumb data-media-src="${fullSrc}" data-media-srcset="${srcset}" aria-label="Show product image ${index + 1}"><img class="pdp-thumb-image" src="${thumbSrc}" alt="${title}" loading="lazy"></button>`;
            }).join('')}
          </div>` : ''}
        `;

        gallery.dataset.melatoGalleryRepaired = 'true';
        bindGalleryThumbs(gallery);
      })
      .catch((error) => console.warn('Melato gallery repair failed:', error));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }
})();
