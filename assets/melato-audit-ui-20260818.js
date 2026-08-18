(() => {
  'use strict';

  const state = { bound: false };
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  function currentCollectionHandle() {
    const match = location.pathname.match(/\/collections\/([^/?#]+)/i);
    return match ? match[1].toLowerCase() : '';
  }

  function accountProfileIcon() {
    const account = q('.mxh__account');
    if (!account || account.dataset.melatoProfileReady === 'true') return;
    account.dataset.melatoProfileReady = 'true';
    account.classList.add('melato-mobile-profile');
    account.setAttribute('aria-label', 'Profile and account');
    account.innerHTML = '<span class="melato-mobile-profile__label">Account</span><svg class="melato-mobile-profile__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.25"></circle><path d="M5.75 19c.7-3.28 3.06-5 6.25-5s5.55 1.72 6.25 5"></path></svg>';
  }

  function savedHeaderState() {
    qa('.melato-saved-header-link').forEach((link) => {
      const countNode = q('.melato-saved-header-count', link);
      const count = Number(countNode?.dataset.count || normalize(countNode?.textContent) || 0);
      link.setAttribute('aria-label', count > 0 ? `Wishlist, ${count} saved ${count === 1 ? 'piece' : 'pieces'}` : 'Wishlist');
      link.setAttribute('title', 'Wishlist');
    });
  }

  const editorial = {
    fragrance: {
      intro: 'Four fragrances from Melato, each built around a distinct scent profile, concentration, and mood.',
      eyebrow: 'The fragrance edit',
      title: 'Scent, composed with intention',
      body: 'Melato fragrance is built as an extension of the wardrobe: expressive, precise, and designed to stay close. The collection moves between lighter everyday compositions and deeper eau de parfum profiles, giving each scent a distinct role rather than repeating the same idea at different strengths. Petal Veil and Open Air lean into cleaner, more immediate wear. Silk Bloom and Obsidian Coast carry greater depth and presence. Every fragrance page identifies the concentration, scent profile, application guidance, and storage direction so the difference between pieces is clear before purchase. The goal is simple: choose by mood, character, and how you want the fragrance to sit on skin, not by marketing noise. Wear one as a daily signature, rotate them with the season, or pair scent with the tone of the clothing around it.'
    },
    tracksuits: {
      eyebrow: 'The uniform',
      title: 'Tracksuits built as complete looks',
      body: 'Melato tracksuits are designed as coordinated uniforms rather than separate basics. Jackets and pants share color, trim, proportion, and material language so the full set reads intentionally from every angle. Velour, satin, and performance-led constructions each carry a different weight and attitude, while the silhouettes stay rooted in a relaxed designer fit. Individual product pages surface verified fit, material, construction, care, and matching-piece information where available. For paired styles, the complete-the-set module connects the corresponding jacket and pant so the full look is easier to build without hunting through the catalogue. Wear the pieces together for the strongest visual statement or split them across denim, tees, outerwear, and accessories for a quieter rotation.'
    },
    denim: {
      eyebrow: 'Denim',
      title: 'Shape first, detail second',
      body: 'Melato denim is organized around silhouette. Straight, slim, wide, and flared cuts are treated as distinct proportions, not minor variations of the same jean. Construction details, washes, closures, graphics, and hardware are used to reinforce the shape rather than compete with it. Product pages surface the verified fit and material information available for each piece, while imagery is selected to make rise, leg line, stacking, and hem behavior easier to judge. The collection is built to work with Melato jackets, shirts, and accessories without losing its own identity. Start with the silhouette you want, then choose the wash and detail level that fits the rest of your rotation.'
    },
    accessories: {
      eyebrow: 'Finishing pieces',
      title: 'Accessories that complete the frame',
      body: 'Melato accessories are designed to finish an outfit without turning into afterthoughts. Bags, eyewear, ties, suspenders, and smaller objects carry the same visual discipline as the apparel: controlled branding, deliberate hardware, practical proportions, and a clear role in the complete look. The assortment moves from daily utility pieces to sharper styling accents, making it possible to add structure, contrast, or polish without changing the core outfit. Product pages surface the available material, construction, care, and usage information for each item. Use the collection as the final layer of the wardrobe, whether that means a bag built for movement, eyewear that changes the face of a look, or formal accessories used in a less formal way.'
    },
    'eves-wardrobe': {
      eyebrow: 'Eve\'s Wardrobe',
      title: 'Structure, movement, confidence',
      body: 'Eve\'s Wardrobe brings together the women\'s side of Melato as a complete edit rather than a loose category. The collection moves between fitted pieces, dresses, denim, layering pieces, and accessories with an emphasis on shape, contrast, and movement. Some silhouettes are clean and controlled, others are deliberately dramatic, but every piece is intended to hold its own within the wider Melato wardrobe. Product pages surface verified fit, material, construction, care, and styling information where available so the decision is not left to imagery alone. Build a full look within the collection or combine these pieces with Melato outerwear, bags, eyewear, and unisex styles for a more personal rotation.'
    },
    'womens-zellige-capsule': {
      eyebrow: 'Eve\'s Wardrobe',
      title: 'Structure, movement, confidence',
      body: 'Eve\'s Wardrobe brings together the women\'s side of Melato as a complete edit rather than a loose category. The collection moves between fitted pieces, dresses, denim, layering pieces, and accessories with an emphasis on shape, contrast, and movement. Some silhouettes are clean and controlled, others are deliberately dramatic, but every piece is intended to hold its own within the wider Melato wardrobe. Product pages surface verified fit, material, construction, care, and styling information where available so the decision is not left to imagery alone. Build a full look within the collection or combine these pieces with Melato outerwear, bags, eyewear, and unisex styles for a more personal rotation.'
    }
  };

  function collectionStory() {
    const handle = currentCollectionHandle();
    const content = editorial[handle];
    if (!content) return;

    const desc = q('.melato-collection-desc');
    if (desc && content.intro && normalize(desc.textContent) !== content.intro) desc.textContent = content.intro;

    const collection = q('.melato-collection');
    const grid = q('.melato-collection-grid');
    if (!collection || !grid || q('[data-melato-collection-editorial]', collection)) return;

    const section = document.createElement('section');
    section.className = 'melato-collection-editorial';
    section.dataset.melatoCollectionEditorial = 'true';
    section.setAttribute('aria-label', `${content.title} collection note`);
    section.innerHTML = `<p class="melato-collection-editorial__eyebrow">${content.eyebrow}</p><h2>${content.title}</h2><p>${content.body}</p>`;
    grid.insertAdjacentElement('afterend', section);
  }

  function normalizeShippingLanguage(root = document) {
    const replacements = [
      [/free shipping on orders over\s*\$?60(?:\.00)?/gi, 'complimentary delivery on all orders'],
      [/free shipping over\s*\$?60(?:\.00)?/gi, 'complimentary delivery on all orders'],
      [/\$?60(?:\.00)?\s*away from free shipping/gi, 'complimentary delivery included'],
      [/spend\s*\$?60(?:\.00)?\s*(?:more\s*)?(?:to|for)\s*(?:get\s*)?free shipping/gi, 'complimentary delivery included']
    ];
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,noscript,textarea')) return NodeFilter.FILTER_REJECT;
        const value = node.nodeValue || '';
        return /free shipping|\$60/i.test(value) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue;
      replacements.forEach(([pattern, replacement]) => { value = value.replace(pattern, replacement); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  }

  function matchingHandle(set) {
    const links = qa('.pdp-set-card a[href*="/products/"]', set);
    for (const link of links) {
      const match = link.getAttribute('href')?.match(/\/products\/([^/?#]+)/i);
      if (match) return match[1];
    }
    return '';
  }

  function selectedSize(root) {
    for (const fieldset of qa('.pdp-option', root)) {
      const legend = normalize(q('legend', fieldset)?.textContent).toLowerCase();
      if (legend !== 'size' && legend !== 'taille') continue;
      return q('input[type="radio"]:checked', fieldset)?.value || '';
    }
    return '';
  }

  async function addFullSet(button, set) {
    const root = set.closest('[data-product-section], [id^="MelatoCleanPDP-"]') || document;
    const currentId = Number(q('[data-variant-id]', root)?.value || 0);
    const handle = matchingHandle(set);
    const status = q('[data-melato-full-set-status]', set);
    if (!currentId || !handle) {
      if (status) status.textContent = 'The matching set is not available for one-click add on this piece.';
      return;
    }

    button.disabled = true;
    button.dataset.loading = 'true';
    button.textContent = 'Building set...';
    if (status) status.textContent = '';

    try {
      const response = await fetch(`/products/${encodeURIComponent(handle)}.js`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Matching product could not be loaded.');
      const product = await response.json();
      const size = selectedSize(root);
      const optionNames = Array.isArray(product.options) ? product.options.map((option) => typeof option === 'string' ? option : option?.name).map((name) => String(name || '').toLowerCase()) : [];
      const sizeIndex = optionNames.findIndex((name) => name === 'size' || name === 'taille');
      let matchVariant = null;

      if (size && sizeIndex >= 0) {
        matchVariant = (product.variants || []).find((variant) => variant.available !== false && String(variant.options?.[sizeIndex] || '').toLowerCase() === size.toLowerCase());
        if (!matchVariant) throw new Error(`The matching ${size} is currently unavailable.`);
      } else {
        matchVariant = (product.variants || []).find((variant) => variant.available !== false) || null;
        if (!matchVariant) throw new Error('The matching piece is currently unavailable.');
      }

      const addResponse = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: currentId, quantity: 1 }, { id: Number(matchVariant.id), quantity: 1 }] })
      });
      if (!addResponse.ok) {
        const payload = await addResponse.json().catch(() => ({}));
        throw new Error(payload.description || payload.message || 'The full set could not be added.');
      }

      button.textContent = 'Set added';
      if (status) status.textContent = 'Both pieces are in your bag.';
      window.dispatchEvent(new CustomEvent('cart:updated'));
      window.setTimeout(() => { window.location.href = '/cart'; }, 380);
    } catch (error) {
      button.disabled = false;
      button.dataset.loading = 'false';
      button.textContent = 'Add full set';
      if (status) status.textContent = error?.message || 'The full set could not be added.';
    }
  }

  function fullSetButton() {
    qa('.pdp-set').forEach((set) => {
      if (q('[data-melato-full-set]', set) || !matchingHandle(set)) return;
      const total = q('.pdp-set-total', set);
      const mount = total || q('.pdp-set-grid', set) || set;
      const wrap = document.createElement('div');
      wrap.className = 'melato-full-set-action';
      wrap.innerHTML = '<button type="button" class="melato-full-set-button" data-melato-full-set>Add full set</button><p class="melato-full-set-status" data-melato-full-set-status role="status" aria-live="polite"></p>';
      mount.insertAdjacentElement('afterend', wrap);
    });
  }

  function bind() {
    if (state.bound) return;
    state.bound = true;
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-melato-full-set]');
      if (!button) return;
      event.preventDefault();
      const set = button.closest('.pdp-set');
      if (set) addFullSet(button, set);
    });
    window.addEventListener('melato:saved-updated', savedHeaderState);
  }

  function run() {
    accountProfileIcon();
    savedHeaderState();
    collectionStory();
    normalizeShippingLanguage(document);
    fullSetButton();
  }

  bind();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  let timer;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(run, 120);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
