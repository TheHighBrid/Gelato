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
      'section, details, article, .pdp-panel, .accordion, [class*="accordion"], [class*="size-guide"], [class*="measurements"], [data-size-guide], [class*="drawer"]'
    ) || element?.parentElement;
  }

  function hideModule(element) {
    const module = closestModule(element);
    if (!module) return;
    module.classList.add('melato-audit-hidden');
    module.setAttribute('aria-hidden', 'true');
  }

  function disableConcierge() {
    document.querySelectorAll(
      '#shopify-section-melato-concierge-strip, .melato-concierge-strip, .concierge-strip, .concierge-strip--desktop, .concierge-strip--mobile, [data-concierge-strip]'
    ).forEach((node) => node.remove());
  }

  function fixAnnouncement() {
    const bar = document.querySelector('#melato-announcement-bar, .melato-ann');
    if (!bar) return;

    replaceText(bar, [
      [/POPUP SHOW #4\s*[·|•-]*\s*JULY 21\s*[·|•-]*/gi, ''],
      [/\s*[·|•-]\s*POPUP SHOW #4\s*[·|•-]*\s*JULY 21/gi, ''],
      [/"?LIKE NEVER CHANGE"?\s*Melato/gi, 'LIKE NEVER CHANGE · MELATO']
    ]);

    bar.querySelectorAll('.melato-ann__item').forEach((item) => {
      const text = normalize(item.textContent).toUpperCase();
      if (text.includes('JULY 21') && !text.includes('AUGUST 20')) item.remove();
    });

    const groups = Array.from(bar.querySelectorAll('.melato-ann__group'));
    groups.slice(1).forEach((group) => group.remove());
    groups[0]?.removeAttribute('aria-hidden');
  }

  function ensureCartActions(cart) {
    const emptyState = cart.querySelector('.cart-drawer__empty');
    if (!emptyState || emptyState.querySelector('.melato-cart-cta-group')) return;

    const primary = Array.from(emptyState.querySelectorAll('a, button')).find((node) => {
      const text = normalize(node.textContent).toLowerCase();
      return text === 'shop the uniform' || text === 'shop new arrivals';
    });
    if (!primary) return;

    primary.textContent = 'Shop New Arrivals';
    if (primary.tagName === 'A') primary.setAttribute('href', '/collections/new-arrivals');

    const group = document.createElement('div');
    group.className = 'melato-cart-cta-group';
    primary.insertAdjacentElement('beforebegin', group);
    group.appendChild(primary);

    const secondary = document.createElement('a');
    secondary.className = 'melato-cart-cta melato-cart-cta--secondary';
    secondary.href = '/collections/all';
    secondary.textContent = 'View All Pieces';
    secondary.setAttribute('data-cart-close', '');
    group.appendChild(secondary);
  }

  function fixCartLanguage() {
    const cart = document.querySelector('#cart-drawer');
    if (!cart) return;

    cart.querySelectorAll('.cart-drawer__empty-sub').forEach((node) => {
      node.textContent = 'Explore the current Melato rotation.';
    });

    cart.querySelectorAll('.cart-drawer__tax-note, [data-cart-tax-note]').forEach((node) => {
      node.textContent = 'Complimentary standard delivery. Taxes and duties calculated at checkout.';
    });

    replaceText(cart, [
      [/Explore the latest uniform pieces\./gi, 'Explore the current Melato rotation.'],
      [/Taxes\s*&\s*shipping calculated at checkout/gi, 'Complimentary standard delivery. Taxes and duties calculated at checkout.'],
      [/Taxes and shipping calculated at checkout/gi, 'Complimentary standard delivery. Taxes and duties calculated at checkout.'],
      [/Taxes and applicable duties calculated at checkout/gi, 'Taxes and duties calculated at checkout']
    ]);

    ensureCartActions(cart);
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
    replaceText(document, [
      [
        /Browse selected pieces from the current Melato rotation, then complete the set with matching jackets and pants\./gi,
        'A curated edit from the current Melato rotation, spanning apparel, accessories, and limited statement pieces.'
      ],
      [
        /A curated edit from the current Melato rotation, spanning apparel, fragrance and limited statement pieces\./gi,
        'A curated edit from the current Melato rotation, spanning apparel, accessories, and limited statement pieces.'
      ]
    ]);
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

  function fixAllProductsHeading() {
    if (path !== '/collections/all') return;
    const heading = document.querySelector('.melato-collection-title');
    if (heading && normalize(heading.textContent).toLowerCase() === 'products') {
      heading.textContent = 'THE MELATO INDEX';
    }

    const header = heading?.closest('.melato-collection-header__text, .melato-collection-hero__content');
    if (header && !header.querySelector('.melato-index-intro')) {
      const intro = document.createElement('p');
      intro.className = 'melato-collection-desc melato-index-intro';
      intro.textContent = 'The complete catalogue across the current rotation and archive.';
      heading.insertAdjacentElement('afterend', intro);
    }
  }

  function fixBestSellersOrder() {
    if (path !== '/collections/best-sellers') return;

    document.querySelectorAll('[data-product-grid], .product-grid, .collection-grid, [class*="products-grid"]').forEach((grid) => {
      grid.querySelectorAll(':scope > .melato-archive-divider').forEach((divider) => divider.remove());

      const children = Array.from(grid.children);
      if (children.length < 2) return;

      const soldOut = children.filter((card) => /\bsold out\b/i.test(normalize(card.textContent)));
      const available = children.filter((card) => !soldOut.includes(card));
      if (!soldOut.length || !available.length) return;

      available.forEach((card) => grid.appendChild(card));

      const divider = document.createElement('div');
      divider.className = 'melato-archive-divider';
      divider.setAttribute('role', 'separator');
      divider.textContent = 'Archive Icons';
      grid.appendChild(divider);

      soldOut.forEach((card) => grid.appendChild(card));
      grid.dataset.melatoAvailabilitySorted = 'true';
    });
  }

  function fixCollectionFilters() {
    if (!document.body.classList.contains('template-collection')) return;

    replaceText(document, [
      [/\bFilter\s+0\b/gi, 'Filter'],
      [/\bIn stock\s*\(\d+\)/gi, 'In stock'],
      [/\bOut of stock\s*\(\d+\)/gi, 'Out of stock'],
      [/\bClothing Accessories\b/g, 'Accessories'],
      [/\bMen's Undergarments\b/g, 'Underwear'],
      [/\bNeckties\b/g, 'Ties'],
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

    fixAllProductsHeading();
    fixBestSellersOrder();
  }

  function imageDescriptors(title) {
    if (path === '/products/petal-veil-eau-de-toilette') {
      return [
        'bottle front view',
        'cap and atomizer close-up',
        'blush glass base detail',
        'bottle rear view',
        'packaging detail',
        'fragrance editorial view'
      ];
    }

    if (path === '/products/blush-ledger-satin-shirt') {
      return [
        'front view',
        'concealed placket detail',
        'silk satin texture close-up',
        'rear view',
        'collar detail',
        'cuff detail'
      ];
    }

    return ['front view', 'alternate angle', 'rear view', 'detail view', 'close-up detail', 'side view'];
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

    const descriptors = imageDescriptors(title);
    root.querySelectorAll('.pdp-gallery img, .melato-fragrance-pdp__gallery img, [class*="product-gallery"] img, [class*="product__media"] img').forEach((image, index) => {
      const current = normalize(image.getAttribute('alt'));
      const generic = !current || current.toLowerCase() === title.toLowerCase() || current.toLowerCase() === `image: ${title}`.toLowerCase();
      if (generic) image.setAttribute('alt', `${title} ${descriptors[index] || `view ${index + 1}`}`);
    });
  }

  function removeDuplicateBundle() {
    if (!document.body.classList.contains('template-product')) return;
    const root = document.querySelector('#main-content') || document;
    const modules = Array.from(root.querySelectorAll('section')).filter((section) => {
      const text = normalize(section.textContent).toLowerCase();
      return text.includes('complete the set') && text.includes('full set price') && text.includes('add full set');
    });

    modules.slice(1).forEach((module) => module.remove());
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
      [/Wash cold inside out where applicable\. Hang dry or lay flat\.[^.]*(?:\.|$)/gi, 'Spray onto pulse points from approximately 10–15 cm away. Avoid rubbing the fragrance into the skin. Store upright in a cool, dry place away from direct sunlight and heat.'],
      [/Returns are eligible when items are unworn, unwashed, tagged[^.]*\.?/gi, 'Opened or used fragrance products cannot be returned for hygiene and product-integrity reasons. Unopened fragrance products remain eligible under the standard return window unless marked final sale.'],
      [/Eligible unworn items follow posted policy\.?/gi, 'Opened or used fragrance products cannot be returned. Unopened fragrance products follow the posted return policy.']
    ]);

    const anchor = document.querySelector('.pdp-form, form[action*="/cart/add"], [class*="product-form"]');
    insertSpecCard(anchor, 'MelatoFragranceSpecifications', 'Fragrance specifications', [
      ['Size', '100 mL'],
      ['Concentration', 'Eau de Toilette'],
      ['Application', 'Spray onto pulse points from approximately 10–15 cm away. Avoid rubbing the fragrance into the skin.'],
      ['Storage', 'Store upright in a cool, dry place away from direct sunlight and heat.'],
      ['Returns', 'Opened or used fragrance products cannot be returned. Unopened fragrance products follow the posted return policy.']
    ]);
  }

  function fixRexCare() {
    if (path !== '/products/rex-x-fur-jacket-copy') return;
    replaceText(document, [[
      /Wash cold inside out where applicable\. Hang dry or lay flat\. Avoid direct heat over embroidery, patches, prints, trims, or branded details\./gi,
      'Professional fur cleaning only. Do not machine wash or hand wash. Store in a cool, ventilated space. Avoid moisture, direct heat and prolonged sunlight. Use a broad-shouldered hanger.'
    ]]);
  }

  function run() {
    disableConcierge();
    fixAnnouncement();
    fixCartLanguage();
    fixReturnsEmail();
    fixHomepageCopy();
    fixGeneralCareCopy();
    fixContactCopy();
    fixCollectionFilters();
    fixPdpSemantics();
    removeDuplicateBundle();
    fixPetalVeil();
    fixRexCare();
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
