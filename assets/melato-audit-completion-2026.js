(() => {
  'use strict';

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const hiddenClass = 'melato-audit-hidden';

  function walkText(root, callback) {
    if (!root || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(callback);
  }

  function replaceText(root, replacements) {
    walkText(root, (node) => {
      let next = node.nodeValue;
      replacements.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
      });
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  function hide(element) {
    if (!element) return;
    element.classList.add(hiddenClass);
    element.setAttribute('aria-hidden', 'true');
  }

  function fixBrandPhrase() {
    const announcement = document.querySelector('#melato-announcement-bar, .melato-ann, [class*="announcement"]');
    if (!announcement) return;
    replaceText(announcement, [
      [/"?LIKE NEVER CHANGE"?\s*[·|•-]?\s*MELATO/gi, 'COMME NEVER CHANGE · MELATO'],
      [/"?LIKE NEVER CHANGE"?/gi, 'COMME NEVER CHANGE'],
      [/COMME NEVER CHANGE\s*MELATO/gi, 'COMME NEVER CHANGE · MELATO']
    ]);
  }

  function fixAllProductsHeading() {
    if (path !== '/collections/all') return;
    const heading = document.querySelector('main h1, #main-content h1');
    if (!heading) return;
    const text = normalize(heading.textContent).toLowerCase();
    if (text === 'products' || text === 'the melato index') heading.textContent = 'All Products';
  }

  function fixPrivacyGrammar() {
    if (!/\/policies\/privacy-policy/i.test(path)) return;
    replaceText(document, [[
      /You may request, correction of, or deletion of your personal information/gi,
      'You may request access to, correction of, or deletion of your personal information'
    ]]);
  }

  function fixPolicyHeadingHierarchy() {
    if (!/\/policies\//i.test(path)) return;
    const headings = Array.from(document.querySelectorAll('main h1, #main-content h1'));
    if (headings.length < 2) return;

    const generated = headings[0];
    const replacement = document.createElement('p');
    replacement.className = `${generated.className || ''} shopify-policy__title-label`.trim();
    replacement.textContent = generated.textContent;
    replacement.setAttribute('aria-hidden', 'true');
    generated.replaceWith(replacement);
  }

  function fixConciergeHeadingOrder() {
    if (!path.startsWith('/pages/')) return;
    const pageHeading = Array.from(document.querySelectorAll('h1')).find((node) => /melato services room/i.test(normalize(node.textContent)));
    const concierge = document.querySelector('.melato-concierge');
    if (!pageHeading || !concierge) return;

    const pageSection = pageHeading.closest('.shopify-section, section, article, header');
    const conciergeSection = concierge.closest('.shopify-section, section');
    if (!pageSection || !conciergeSection || pageSection === conciergeSection) return;
    if (pageSection.compareDocumentPosition(conciergeSection) & Node.DOCUMENT_POSITION_PRECEDING) {
      conciergeSection.parentNode.insertBefore(pageSection, conciergeSection);
    }
  }

  function bundleSignature(module) {
    const urls = Array.from(module.querySelectorAll('a[href*="/products/"]'))
      .map((link) => link.pathname || link.getAttribute('href'))
      .filter(Boolean)
      .sort();
    return urls.join('|') || normalize(module.textContent).toLowerCase().replace(/\$[\d.,]+/g, '').slice(0, 180);
  }

  function fixDuplicateBundles() {
    if (!document.body.classList.contains('template-product')) return;
    const candidates = Array.from(document.querySelectorAll(
      '.pdp-set, .melato-set, .m-cts, [class*="complete-the-set"], [class*="complete_set"], [data-complete-set]'
    )).filter((module) => /complete the set|full .* uniform|full set price/i.test(normalize(module.textContent)));

    const roots = candidates.filter((node, index, list) => !list.some((other, otherIndex) => otherIndex < index && other.contains(node)));
    const seen = new Set();
    roots.forEach((module) => {
      const signature = bundleSignature(module);
      if (seen.has(signature)) hide(module);
      else seen.add(signature);
    });
  }

  function fixEmptyReviews() {
    if (!document.body.classList.contains('template-product')) return;
    document.querySelectorAll('.pdp-reviews, [class*="product-reviews"], [data-product-reviews]').forEach((module) => {
      const count = Number(module.dataset.reviewCount || module.querySelector('[data-review-count]')?.dataset.reviewCount || 0);
      const hasReview = Boolean(module.querySelector('.jdgm-rev, [data-review-id], article.review, .review-card'));
      const widget = module.querySelector('.jdgm-widget, [data-widget="review"]');
      const widgetLoaded = widget?.classList.contains('jdgm--done-setup') || widget?.querySelector('.jdgm-rev-widg');
      if (!hasReview && count === 0 && (!widget || widgetLoaded)) hide(module);
    });
  }

  function fixLivingBook() {
    const root = document.querySelector('[class*="living-lookbook"], [data-living-lookbook], .mea');
    if (!root) return;

    walkText(root, (node) => {
      if (normalize(node.nodeValue).toLowerCase() === 'pl') node.nodeValue = '';
    });

    root.querySelectorAll('a[href*="/collections/"]').forEach((link) => {
      const card = link.closest('[data-product-handle], [data-product-id], article, figure, [class*="frame"], [class*="card"]');
      const hasExactProduct = Boolean(card?.dataset.productHandle || card?.dataset.productId || card?.querySelector('a[href*="/products/"]'));
      const isCommerceControl = link.matches('.mea__shop-tag, [data-evidence-shop] a, [class*="shop-tag"], [class*="product-link"], [class*="shop-cta"]');
      if (isCommerceControl && !hasExactProduct) hide(link);
    });

    root.querySelectorAll('img').forEach((image, index) => {
      const card = image.closest('[data-product-title], [data-product-handle], article, figure, [class*="frame"], [class*="card"]');
      const productTitle = normalize(card?.dataset.productTitle);
      const current = normalize(image.getAttribute('alt'));
      if (productTitle && (!current || /^image\b|^lookbook\b|^frame\b/i.test(current))) {
        image.setAttribute('alt', `${productTitle} editorial lookbook frame ${index + 1}`);
      }
    });
  }

  function run() {
    fixBrandPhrase();
    fixAllProductsHeading();
    fixPrivacyGrammar();
    fixPolicyHeadingHierarchy();
    fixConciergeHeadingOrder();
    fixDuplicateBundles();
    fixEmptyReviews();
    fixLivingBook();
  }

  let timer;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 120);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  window.setTimeout(run, 1200);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
