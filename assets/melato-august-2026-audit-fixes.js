(() => {
  'use strict';

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const SKIP_TEXT_PARENTS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION']);
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  function walkTextNodes(root, callback) {
    if (!root || !document.createTreeWalker) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement || SKIP_TEXT_PARENTS.has(node.parentElement.tagName)) {
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
    walkTextNodes(root, (node) => {
      const current = node.nodeValue;
      let next = current;

      replacements.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
      });

      if (next !== current) node.nodeValue = next;
    });
  }

  function closestModule(element) {
    return element?.closest(
      'details, article, .pdp-panel, .accordion, [class*="accordion"], [class*="size-guide"], [class*="measurements"], [data-size-guide], [class*="drawer"]'
    ) || element?.parentElement;
  }

  function hideModule(element) {
    const module = closestModule(element);
    if (!module) return;
    module.classList.add('melato-audit-hidden');
    module.setAttribute('aria-hidden', 'true');
  }

  function fixAnnouncement() {
    const bar = document.querySelector('#melato-announcement-bar, .melato-ann');
    if (!bar) return;

    replaceText(bar, [
      [/POPUP SHOW #4\s*[·|•-]*\s*JULY 21\s*[·|•-]*/gi, ''],
      [/\s*[·|•-]\s*POPUP SHOW #4\s*[·|•-]*\s*JULY 21/gi, '']
    ]);

    bar.querySelectorAll('.melato-ann__item').forEach((item) => {
      const text = normalize(item.textContent).toUpperCase();
      if (text.includes('JULY 21') && !text.includes('AUGUST 20')) {
        item.classList.add('melato-audit-hidden');
        item.setAttribute('aria-hidden', 'true');
      }
    });

    bar.querySelectorAll('.melato-ann__group').forEach((group, index) => {
      group.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });
  }

  function fixCartLanguage() {
    const cart = document.querySelector('#cart-drawer');
    if (!cart) return;

    cart.querySelectorAll('.cart-drawer__empty-sub').forEach((node) => {
      node.textContent = 'Explore the current Melato rotation.';
    });

    cart.querySelectorAll('.cart-drawer__empty a, .cart-drawer__empty button').forEach((node) => {
      if (normalize(node.textContent).toLowerCase() !== 'shop the uniform') return;
      node.textContent = 'Shop new arrivals';
      if (node.tagName === 'A') node.setAttribute('href', '/collections/new-arrivals');
    });

    cart.querySelectorAll('.cart-drawer__tax-note, [data-cart-tax-note]').forEach((node) => {
      node.textContent = 'Complimentary standard delivery. Taxes and applicable duties calculated at checkout.';
    });

    replaceText(cart, [
      [/Explore the latest uniform pieces\./gi, 'Explore the current Melato rotation.'],
      [/Taxes\s*&\s*shipping calculated at checkout/gi, 'Complimentary standard delivery. Taxes and applicable duties calculated at checkout.'],
      [/Taxes and shipping calculated at checkout/gi, 'Complimentary standard delivery. Taxes and applicable duties calculated at checkout.']
    ]);
  }

  function fixReturnsEmail() {
    document.querySelectorAll('a[href^="mailto:orders@melato.ca" i]').forEach((link) => {
      link.setAttribute('href', 'mailto:support@melato.ca');
      if (normalize(link.textContent).toLowerCase() === 'orders@melato.ca') {
        link.textContent = 'support@melato.ca';
      }
    });

    replaceText(document, [[/orders@melato\.ca/gi, 'support@melato.ca']]);
  }

  function fixHomepageCopy() {
    if (path !== '/') return;
    replaceText(document, [[
      /Browse selected pieces from the current Melato rotation, then complete the set with matching jackets and pants\./gi,
      'A curated edit from the current Melato rotation, spanning apparel, fragrance and limited statement pieces.'
    ]]);
  }

  function fixGeneralCareCopy() {
    if (!/\/(pages\/)?faq/i.test(path)) return;
    replaceText(document, [[
      /Wash cold on a gentle cycle,?\s*wash inside out[^.]*\.?/gi,
      'Care varies by product and material. Always follow the product page and sewn-in care label. Fur, leather, silk, fragrance and structured garments require specialist instructions.'
    ]]);
  }

  function fixContactCopy() {
    if (!/\/pages\/contact/i.test(path)) return;
    replaceText(document, [
      [/Visit Us In-Store/gi, 'Visit the Melatelier pop-up'],
      [/Melatelier is located at Tanger Outlets Ottawa\.?/gi, 'The Melatelier pop-up opens only on announced dates.']
    ]);
  }

  function fixCollectionFilters() {
    if (!document.body.classList.contains('template-collection')) return;

    replaceText(document, [
      [/\bFilter\s+0\b/gi, 'Filter'],
      [/\bIn stock\s*\(\d+\)/gi, 'In stock'],
      [/\bOut of stock\s*\(\d+\)/gi, 'Out of stock'],
      [/\bToiletry Bags\b/g, 'Travel Cases'],
      [/\bEaux De Toilette\b/g, 'Eaux de Toilette'],
      [/\bEaux De Parfum\b/g, 'Eaux de Parfum'],
      [/\bTrack jackets\b/g, 'Track Jackets'],
      [/\bTrack pants\b/g, 'Track Pants']
    ]);

    document.querySelectorAll('[data-active-filter-count], .active-filter-count, [class*="filter-count"]').forEach((node) => {
      if (normalize(node.textContent) === '0') {
        node.classList.add('melato-audit-hidden');
        node.setAttribute('aria-hidden', 'true');
      }
    });

    if (!/\/collections\/best-sellers/i.test(path)) return;

    document.querySelectorAll('[data-product-grid], .product-grid, .collection-grid, [class*="products-grid"]').forEach((grid) => {
      if (grid.dataset.melatoAvailabilitySorted === 'true') return;

      const children = Array.from(grid.children);
      if (children.length < 2) return;

      const soldOut = children.filter((card) => /\bsold out\b/i.test(normalize(card.textContent)));
      if (!soldOut.length || soldOut.length === children.length) return;

      soldOut.forEach((card) => grid.appendChild(card));
      grid.dataset.melatoAvailabilitySorted = 'true';
    });
  }

  function fixPdpSemantics() {
    if (!document.body.classList.contains('template-product')) return;
    const root = document.querySelector('#main-content') || document;

    root.querySelectorAll('.pdp-trust-row, [class*="trust-row"], [class*="assurance"]').forEach((row) => {
      if (row.matches('script, style')) return;
      row.setAttribute('role', 'list');
      Array.from(row.children).forEach((child) => child.setAttribute('role', 'listitem'));
    });

    replaceText(root, [[
      /Customers rate us\s+([0-9.]+)\/5\s+based on\s+(\d+)\s+reviews?\.?/gi,
      'MELATO STORE RATING $1/5 from $2 verified customer reviews'
    ]]);

    const title = normalize(root.querySelector('h1')?.textContent);
    if (!title) return;

    const descriptors = ['front view', 'alternate angle', 'rear view', 'detail view', 'close-up detail', 'side view'];
    root.querySelectorAll('.pdp-gallery img, [class*="product-gallery"] img, [class*="product__media"] img').forEach((image, index) => {
      const current = normalize(image.getAttribute('alt'));
      const generic = !current || current.toLowerCase() === title.toLowerCase() || current.toLowerCase() === `image: ${title}`.toLowerCase();
      if (generic) image.setAttribute('alt', `${title} ${descriptors[index] || `view ${index + 1}`}`);
    });
  }

  function fixConciergeLabels() {
    const mappings = [
      [/fit\s+fit concierge/i, 'Fit Concierge'],
      [/delivery\s+delivery concierge/i, 'Delivery Concierge'],
      [/care\s*order companion/i, 'Order Companion'],
      [/access\s*the preview room/i, 'The Preview Room']
    ];

    document.querySelectorAll('a, button').forEach((control) => {
      const text = normalize(control.textContent);
      const mapping = mappings.find(([pattern]) => pattern.test(text));
      if (mapping) control.setAttribute('aria-label', mapping[1]);
    });
  }

  function insertSpecCard(target, id, title, rows) {
    if (!target || document.getElementById(id)) return;

    const card = document.createElement('section');
    card.id = id;
    card.className = 'melato-audit-spec-card';
    card.setAttribute('aria-labelledby', `${id}-title`);

    const eyebrow = document.createElement('p');
    eyebrow.className = 'melato-audit-spec-card__eyebrow';
    eyebrow.textContent = 'Product intelligence';

    const heading = document.createElement('h2');
    heading.id = `${id}-title`;
    heading.textContent = title;

    const list = document.createElement('dl');
    rows.forEach(([term, description]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = description;
      list.append(dt, dd);
    });

    card.append(eyebrow, heading, list);
    target.insertAdjacentElement('afterend', card);
  }

  function fixPetalVeil() {
    if (path !== '/products/petal-veil-eau-de-toilette') return;

    document.querySelectorAll('table').forEach((table) => {
      const text = normalize(table.textContent).toLowerCase();
      if (['chest', 'waist', 'hip', 'inseam'].every((word) => text.includes(word))) hideModule(table);
    });

    document.querySelectorAll('h2, h3, h4, summary, strong').forEach((heading) => {
      const label = normalize(heading.textContent).toLowerCase();
      if (label === 'fit' || label.includes('size guide') || label === 'garment measurements') hideModule(heading);
    });

    replaceText(document, [
      [/Premium everyday fit\. Choose your usual size for the intended silhouette\./gi, ''],
      [/Wash cold inside out where applicable\. Hang dry or lay flat\.[^.]*(?:\.|$)/gi, 'Apply to pulse points. Avoid rubbing the fragrance into the skin. Store upright away from heat and direct sunlight.'],
      [/Returns are eligible when items are unworn, unwashed, tagged[^.]*\.?/gi, 'Returns follow the posted Melato policy. Contact support@melato.ca before use if you may need return assistance.']
    ]);

    const anchor = document.querySelector('.pdp-form, form[action*="/cart/add"], [class*="product-form"]');
    insertSpecCard(anchor, 'MelatoFragranceSpecifications', 'Fragrance specifications', [
      ['Size', '100 mL'],
      ['Concentration', 'Eau de Toilette'],
      ['Application', 'Apply to pulse points. Avoid rubbing the fragrance into the skin.'],
      ['Storage', 'Store upright away from heat and direct sunlight.'],
      ['Returns', 'Returns follow the posted Melato policy. Contact support@melato.ca before use if you may need return assistance.']
    ]);
  }

  function fixRexCare() {
    if (path !== '/products/rex-x-fur-jacket-copy') return;
    replaceText(document, [[
      /Wash cold inside out where applicable\. Hang dry or lay flat\. Avoid direct heat over embroidery, patches, prints, trims, or branded details\./gi,
      'Professional fur cleaning only. Do not machine wash or hand wash. Store in a cool, ventilated space. Avoid moisture, direct heat and prolonged sunlight. Use a broad-shouldered hanger.'
    ]]);
  }

  function fixBlushLedger() {
    if (path !== '/products/blush-ledger-satin-shirt') return;
    replaceText(document, [
      [/Melato piece with Melato’s current-season product language\./gi, 'Silk satin shirt from the current Melato rotation.'],
      [/Premium construction selected for feel, structure, and everyday wearability\./gi, 'Material currently published: silk. Additional construction specifications must come from verified product records.'],
      [/Built to sit clean on body without stealing movement\./gi, 'Designed for a relaxed drape. Refer to verified garment measurements when published.'],
      [/Wash cold inside out where applicable\.[^.]*(?:\.|$)/gi, 'Follow the sewn-in care label. Contact support@melato.ca before cleaning if the label is unclear.']
    ]);
  }

  function run() {
    fixAnnouncement();
    fixCartLanguage();
    fixReturnsEmail();
    fixHomepageCopy();
    fixGeneralCareCopy();
    fixContactCopy();
    fixCollectionFilters();
    fixPdpSemantics();
    fixConciergeLabels();
    fixPetalVeil();
    fixRexCare();
    fixBlushLedger();
  }

  let timer = null;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 80);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();