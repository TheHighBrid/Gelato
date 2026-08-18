(() => {
  'use strict';

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const productHandle = () => {
    const match = location.pathname.match(/^\/products\/([^/?#]+)/i);
    return match ? match[1] : '';
  };

  function restoreAnnouncement() {
    const bar = document.querySelector('#melato-announcement-bar');
    if (!bar) return;
    bar.classList.remove('is-melato-static');
    bar.querySelectorAll('.melato-ann__secondary-message').forEach((item) => item.classList.remove('melato-ann__secondary-message'));
  }

  function stabilizeHeader() {
    const header = document.querySelector('.mxh, [data-mxh]');
    if (!header) return;
    const host = header.closest('.shopify-section') || header.parentElement;
    if (host) host.classList.add('melato-header-host');
    header.classList.remove('hidden', 'site-header--hidden');
  }

  function removeRedundantProductUI(root = document) {
    root.querySelectorAll('.pdp-editorial, .melato-clean-pdp .pdp-editorial').forEach((node) => node.remove());
    root.querySelectorAll('.m-recs__type-badge, .melato-card__eyebrow').forEach((node) => node.remove());
    root.querySelectorAll('.melato-buybox-trust').forEach((node) => node.remove());
  }

  function sectionNodes(descriptionRoot, headingText) {
    if (!descriptionRoot) return [];
    const headings = Array.from(descriptionRoot.querySelectorAll('h2,h3,h4'));
    const heading = headings.find((node) => normalize(node.textContent).toLowerCase() === headingText.toLowerCase());
    if (!heading) return [];
    const nodes = [];
    let cursor = heading.nextElementSibling;
    while (cursor && !/^H[234]$/.test(cursor.tagName)) {
      nodes.push(cursor.cloneNode(true));
      cursor = cursor.nextElementSibling;
    }
    return nodes;
  }

  function detail(title, nodes) {
    if (!nodes.length) return null;
    const element = document.createElement('details');
    element.className = 'pdp-spec';
    element.dataset.melatoFragranceDetail = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const summary = document.createElement('summary');
    summary.textContent = title;
    const content = document.createElement('div');
    content.className = 'pdp-rte';
    nodes.forEach((node) => content.appendChild(node));
    element.append(summary, content);
    return element;
  }

  function removeFragranceAuditCard(root) {
    root.querySelectorAll('[data-melato-petal-specs], #melato-petal-veil-specs, .melato-audit-spec-card').forEach((card) => {
      const heading = normalize(card.querySelector('h2,h3')?.textContent || card.textContent).toLowerCase();
      if (heading.includes('fragrance specifications') || card.matches('[data-melato-petal-specs],#melato-petal-veil-specs')) card.remove();
    });
  }

  function cleanFragranceStory(root) {
    root.querySelectorAll('.pdp-story-tech details, .pdp-mini-detail').forEach((item) => {
      const title = normalize(item.querySelector(':scope > summary')?.textContent).toLowerCase();
      if (title === 'construction') item.remove();
    });
    root.querySelectorAll('.pdp-story-tech').forEach((panel) => {
      if (!panel.querySelector('details')) panel.remove();
    });
  }

  function relabelFragranceVolume(root) {
    root.querySelectorAll('.pdp-option').forEach((fieldset) => {
      const legend = fieldset.querySelector('legend');
      if (!legend) return;
      const label = normalize(legend.textContent).toLowerCase();
      if (label === 'size' || label === 'taille') legend.textContent = 'Volume';
    });
    root.querySelectorAll('.melato-size-guide-inline, .size-guide-trigger, [data-open-size-drawer]').forEach((node) => node.remove());
  }

  function rebuildFragranceInformation(root, product) {
    const grid = root.querySelector('.pdp-spec-grid');
    if (!grid) return;

    const description = document.createElement('div');
    description.innerHTML = product.description || '';

    const profileNodes = sectionNodes(description, 'Fragrance profile');
    const noteNodes = sectionNodes(description, 'Note structure');
    const ingredientsNodes = sectionNodes(description, 'Ingredients and disclosure');
    const careNodes = sectionNodes(description, 'Care and storage');
    const safetyNodes = careNodes.filter((node) => /warning|flammable|external use|avoid contact|keep away from/i.test(normalize(node.textContent)));

    const shipping = Array.from(grid.querySelectorAll('details')).find((item) => {
      const title = normalize(item.querySelector(':scope > summary')?.textContent).toLowerCase();
      return title.includes('shipping') && title.includes('returns');
    });

    grid.querySelectorAll('details').forEach((item) => {
      if (item !== shipping) item.remove();
    });

    const fragments = [
      detail('Fragrance profile', profileNodes),
      detail('Notes', noteNodes),
      detail('Ingredients & safety', [...ingredientsNodes, ...safetyNodes])
    ].filter(Boolean);

    fragments.forEach((item) => {
      if (shipping) grid.insertBefore(item, shipping);
      else grid.appendChild(item);
    });
  }

  async function cleanFragrancePdp() {
    if (!document.body.classList.contains('template-product')) return;
    const handle = productHandle();
    if (!handle) return;

    try {
      const response = await fetch(`/products/${encodeURIComponent(handle)}.js`, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const product = await response.json();
      const type = normalize(product.type).toLowerCase();
      const title = normalize(product.title).toLowerCase();
      const isFragrance = type.includes('fragrance') || /eau de toilette|eau de parfum|perfume|parfum/.test(title);
      if (!isFragrance) return;

      document.body.classList.add('melato-fragrance-pdp');
      const root = document.querySelector('.melato-pdp-rebuild, .melato-clean-pdp');
      if (!root) return;

      removeFragranceAuditCard(root);
      cleanFragranceStory(root);
      relabelFragranceVolume(root);
      rebuildFragranceInformation(root, product);
      removeRedundantProductUI(root);
    } catch (_) {
      /* Progressive enhancement only. The base product page remains usable. */
    }
  }

  function run() {
    restoreAnnouncement();
    stabilizeHeader();
    removeRedundantProductUI(document);
    cleanFragrancePdp();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  /* Older audit scripts can mutate these regions after load. Normalize once more
     without introducing a document-wide scroll or resize side effect. */
  window.setTimeout(run, 180);
  window.setTimeout(run, 900);

  const bar = document.querySelector('#melato-announcement-bar');
  if (bar) {
    new MutationObserver(() => restoreAnnouncement()).observe(bar, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
  }

  let mutationTimer = 0;
  new MutationObserver((records) => {
    if (!records.some((record) => record.addedNodes && record.addedNodes.length)) return;
    clearTimeout(mutationTimer);
    mutationTimer = window.setTimeout(() => removeRedundantProductUI(document), 80);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
