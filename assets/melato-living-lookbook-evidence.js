const initializeMelatoEvidenceArchives = (scope = document) => {
  const archives = scope.querySelectorAll('[data-evidence-archive]');

  archives.forEach((archive) => {
    if (archive.dataset.evidenceInitialized === 'true') return;
    archive.dataset.evidenceInitialized = 'true';

    const triggers      = Array.from(archive.querySelectorAll('[data-evidence-open]'));
    const viewer        = archive.querySelector('[data-evidence-viewer]');
    const viewerImage   = archive.querySelector('[data-evidence-viewer-image]');
    const viewerLabel   = archive.querySelector('[data-evidence-viewer-label]');
    const viewerCounter = archive.querySelector('[data-evidence-counter]');
    const closeButton   = archive.querySelector('[data-evidence-close]');
    const prevButton    = archive.querySelector('[data-evidence-previous]');
    const nextButton    = archive.querySelector('[data-evidence-next]');
    const shopStrip     = archive.querySelector('[data-evidence-shop]');

    if (!triggers.length || !viewer || !viewerImage) return;

    let activeIndex       = 0;
    let lastFocusedEl     = null;
    const productCache    = {};

    /* ── helpers ── */
    const pad = (v) => String(v).padStart(2, '0');

    function fmt(cents) {
      const n = (cents / 100).toFixed(2);
      if (window.DRIP && window.DRIP.shop && window.DRIP.shop.moneyFormat) {
        return window.DRIP.shop.moneyFormat
          .replace('{{ amount }}', n)
          .replace('{{amount}}', n);
      }
      return 'CA$' + n;
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ── render viewer frame ── */
    const render = (index) => {
      activeIndex = (index + triggers.length) % triggers.length;
      const trigger = triggers[activeIndex];
      const code    = trigger.dataset.evidenceCode || pad(activeIndex + 1);

      viewerImage.src = trigger.dataset.evidenceFull;
      viewerImage.alt = `Melato Living Lookbook evidence frame ${code}`;
      viewerLabel.textContent  = `EXHIBIT ${code}`;
      viewerCounter.textContent = `${code} / ${pad(triggers.length)}`;

      /* commerce strip */
      const handle = trigger.dataset.productHandle;
      if (shopStrip) {
        if (handle) {
          loadProductStrip(handle, shopStrip);
        } else {
          shopStrip.innerHTML = '';
          shopStrip.hidden = true;
        }
      }
    };

    /* ── product strip ── */
    function loadProductStrip(handle, stripEl) {
      stripEl.removeAttribute('hidden');
      stripEl.innerHTML = renderStripSkeleton();

      if (productCache[handle]) {
        renderStrip(productCache[handle], stripEl);
        return;
      }
      fetch('/products/' + encodeURIComponent(handle) + '.js')
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then((data) => {
          productCache[handle] = data;
          renderStrip(data, stripEl);
        })
        .catch(() => { stripEl.innerHTML = ''; stripEl.hidden = true; });
    }

    function renderStripSkeleton() {
      return '<div class="mea-shop-strip mea-shop-strip--loading"><span class="mea-shop-skel"></span><span class="mea-shop-skel mea-shop-skel--sm"></span><span class="mea-shop-skel mea-shop-skel--btn"></span></div>';
    }

    function renderStrip(product, stripEl) {
      const v = product.variants[0];
      const priceStr = fmt(v.price);

      /* build variant buttons if Size option exists */
      const sizeIdx = product.options.indexOf('Size') !== -1
        ? product.options.indexOf('Size')
        : (product.options.indexOf('Taille') !== -1 ? product.options.indexOf('Taille') : -1);

      let variantsHTML = '';
      if (product.variants.length > 1 && sizeIdx !== -1) {
        const seen = {};
        product.variants.forEach((pv) => {
          const sz = pv.options[sizeIdx];
          if (!seen[sz]) {
            seen[sz] = pv;
            variantsHTML += `<button type="button" class="mea-shop-size" data-variant-id="${pv.id}"${pv.available ? '' : ' disabled'}>${escapeHtml(sz)}</button>`;
          }
        });
        variantsHTML = `<div class="mea-shop-sizes" data-mea-sizes>${variantsHTML}</div>`;
      }

      stripEl.innerHTML = `
        <div class="mea-shop-strip">
          <div class="mea-shop-info">
            <p class="mea-shop-label">MELATO / SHOP THIS FRAME</p>
            <p class="mea-shop-title">${escapeHtml(product.title)}</p>
            <p class="mea-shop-price" data-mea-price>${priceStr}</p>
          </div>
          ${variantsHTML}
          <button type="button" class="mea-shop-atc" data-mea-atc data-selected-variant="${v.id}">ADD TO BAG</button>
          <p class="mea-shop-msg" data-mea-msg aria-live="polite"></p>
          <a class="mea-shop-link" href="/products/${encodeURIComponent(product.handle)}">View full product →</a>
        </div>`;

      bindStrip(product, sizeIdx, stripEl);
    }

    function bindStrip(product, sizeIdx, stripEl) {
      let selectedVariantId = product.variants[0].id;

      /* size selection */
      stripEl.querySelectorAll('.mea-shop-size').forEach((btn) => {
        btn.addEventListener('click', () => {
          stripEl.querySelectorAll('.mea-shop-size').forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedVariantId = parseInt(btn.dataset.variantId, 10);
          const pv = product.variants.find((x) => x.id === selectedVariantId);
          if (pv) {
            const priceEl = stripEl.querySelector('[data-mea-price]');
            if (priceEl) priceEl.textContent = fmt(pv.price);
          }
        });
      });

      /* add to cart */
      const atcBtn = stripEl.querySelector('[data-mea-atc]');
      const msgEl  = stripEl.querySelector('[data-mea-msg]');
      if (!atcBtn) return;

      atcBtn.addEventListener('click', () => {
        if (!selectedVariantId) { msgEl.textContent = 'Please select a size.'; msgEl.className = 'mea-shop-msg is-error'; return; }
        atcBtn.disabled = true;
        atcBtn.textContent = 'ADDING…';
        msgEl.textContent = '';
        msgEl.className = 'mea-shop-msg';

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ id: selectedVariantId, quantity: 1 })
        })
          .then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.description || 'Error'); }); return r.json(); })
          .then(() => {
            atcBtn.textContent = 'ADDED ✓';
            msgEl.textContent = 'Item added to your bag.';
            msgEl.className = 'mea-shop-msg';
            fetch('/cart.js').then((r) => r.json()).then((c) => {
              document.querySelectorAll('[data-cart-count],[data-cart-badge]').forEach((el) => { if (el.tagName !== 'INPUT') el.textContent = c.item_count; });
            });
            setTimeout(() => { atcBtn.disabled = false; atcBtn.textContent = 'ADD TO BAG'; }, 2200);
          })
          .catch((err) => {
            atcBtn.disabled = false;
            atcBtn.textContent = 'ADD TO BAG';
            msgEl.textContent = err.message || 'Could not add. Try again.';
            msgEl.className = 'mea-shop-msg is-error';
          });
      });
    }

    /* ── open/close ── */
    const openViewer = (index) => {
      lastFocusedEl = document.activeElement;
      render(index);
      viewer.hidden = false;
      viewer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      closeButton.focus();
    };

    const closeViewer = () => {
      viewer.hidden = true;
      viewer.setAttribute('aria-hidden', 'true');
      viewerImage.removeAttribute('src');
      document.documentElement.style.overflow = '';
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    };

    /* ── events ── */
    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => openViewer(index));
    });

    closeButton.addEventListener('click', closeViewer);
    prevButton.addEventListener('click', () => render(activeIndex - 1));
    nextButton.addEventListener('click', () => render(activeIndex + 1));

    viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });

    viewer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape')     { closeViewer(); return; }
      if (e.key === 'ArrowLeft')  { render(activeIndex - 1); return; }
      if (e.key === 'ArrowRight') { render(activeIndex + 1); return; }
      if (e.key === 'Tab') {
        const focusable = [closeButton, prevButton, nextButton].filter(Boolean);
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  });
};

/* ── styles for commerce strip ── */
(function () {
  if (document.getElementById('mea-shop-styles')) return;
  const s = document.createElement('style');
  s.id = 'mea-shop-styles';
  s.textContent = `
    .mea-shop-strip {
      padding: 16px 20px;
      background: rgba(14,12,10,.9);
      border-top: 1px solid rgba(246,241,232,.18);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .mea-shop-strip--loading { min-height: 56px; }
    .mea-shop-skel {
      display: block;
      height: 12px;
      width: 120px;
      background: rgba(246,241,232,.1);
      border-radius: 4px;
      animation: mea-skel 1.3s ease-in-out infinite;
    }
    .mea-shop-skel--sm  { width: 70px; height: 10px; }
    .mea-shop-skel--btn { width: 100px; height: 32px; margin-left: auto; }
    @keyframes mea-skel { 0%,100%{opacity:.5} 50%{opacity:1} }
    .mea-shop-info { flex: 0 0 auto; }
    .mea-shop-label {
      margin: 0;
      font-family: ui-monospace,SFMono-Regular,monospace;
      font-size: 9px;
      letter-spacing: .22em;
      text-transform: uppercase;
      color: rgba(246,241,232,.44);
    }
    .mea-shop-title { margin: 2px 0; font-size: 14px; font-weight: 600; color: #f6f1e8; }
    .mea-shop-price { margin: 0; font-size: 12px; color: #c9974a; letter-spacing: .06em; }
    .mea-shop-sizes { display: flex; flex-wrap: wrap; gap: 6px; }
    .mea-shop-size {
      padding: 5px 10px;
      background: transparent;
      border: 1px solid rgba(246,241,232,.26);
      border-radius: 4px;
      color: #f6f1e8;
      font-size: 11px;
      cursor: pointer;
      transition: background .15s, border-color .15s;
    }
    .mea-shop-size:hover { background: rgba(246,241,232,.1); border-color: rgba(246,241,232,.5); }
    .mea-shop-size.is-selected { background: #c9974a; border-color: #c9974a; color: #0a0808; font-weight: 700; }
    .mea-shop-size:disabled { opacity: .35; cursor: not-allowed; }
    .mea-shop-atc {
      margin-left: auto;
      padding: 8px 16px;
      background: #c9974a;
      color: #0a0808;
      border: none;
      border-radius: 6px;
      font-family: ui-monospace,SFMono-Regular,monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity .18s;
    }
    .mea-shop-atc:hover:not(:disabled) { opacity: .85; }
    .mea-shop-atc:disabled { opacity: .45; cursor: wait; }
    .mea-shop-msg { width: 100%; font-size: 11px; color: #8fcf8a; margin: 0; }
    .mea-shop-msg.is-error { color: #e07070; }
    .mea-shop-link {
      font-family: ui-monospace,SFMono-Regular,monospace;
      font-size: 9px;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: rgba(246,241,232,.48);
      text-decoration: none;
    }
    .mea-shop-link:hover { color: #f6f1e8; }
    @media (prefers-reduced-motion:reduce) { .mea-shop-size,.mea-shop-atc { transition:none; } }
  `;
  document.head.appendChild(s);
})();

/* ── boot ── */
initializeMelatoEvidenceArchives();

document.addEventListener('shopify:section:load', (event) => {
  initializeMelatoEvidenceArchives(event.target);
});
