(() => {
  'use strict';

  class MelatoProductRecommendations extends HTMLElement {
    connectedCallback() {
      const url = this.dataset.url;
      if (!url || this.dataset.loaded === 'true') return;
      this.dataset.loaded = 'true';

      fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then((response) => {
          if (!response.ok) throw new Error(`Melato recommendations failed: ${response.status}`);
          return response.text();
        })
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const incoming = html.querySelector('product-recommendations');
          if (incoming && incoming.innerHTML.trim().length > 0) {
            this.innerHTML = incoming.innerHTML;
            this.removeAttribute('data-recommendations-error');
          }
        })
        .catch(() => {
          this.setAttribute('data-recommendations-error', 'true');
        });
    }
  }

  if (!customElements.get('product-recommendations')) {
    customElements.define('product-recommendations', MelatoProductRecommendations);
  }

  // The current PDP uses native <details> for Fit, Material, Care and Shipping.
  // Older theme/audit scripts also observe click/open state. Own the PDP toggle
  // explicitly so a delayed legacy mutation cannot immediately undo the shopper's click.
  function bindStablePdpDetail(detail) {
    if (!(detail instanceof HTMLDetailsElement) || detail.dataset.melatoStableDetail === 'true') return;
    const summary = detail.querySelector(':scope > summary');
    if (!summary) return;

    detail.dataset.melatoStableDetail = 'true';
    let intendedOpen = detail.open;
    let lastUserToggle = 0;
    let internalMutation = false;

    const setOpen = (nextOpen) => {
      intendedOpen = Boolean(nextOpen);
      internalMutation = true;
      detail.open = intendedOpen;
      queueMicrotask(() => { internalMutation = false; });
    };

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      lastUserToggle = Date.now();
      setOpen(!detail.open);
    }, true);

    new MutationObserver(() => {
      if (internalMutation) return;
      const withinInteractionWindow = Date.now() - lastUserToggle < 2500;
      if (withinInteractionWindow && detail.open !== intendedOpen) {
        requestAnimationFrame(() => setOpen(intendedOpen));
      } else if (!withinInteractionWindow) {
        intendedOpen = detail.open;
      }
    }).observe(detail, { attributes: true, attributeFilter: ['open'] });
  }

  function bindStablePdpDetails(root = document) {
    root.querySelectorAll([
      '.melato-clean-pdp details.pdp-detail',
      '.melato-pdp-rebuild details.pdp-spec',
      '.melato-pdp-rebuild details.pdp-mini-detail'
    ].join(',')).forEach(bindStablePdpDetail);
  }

  document.addEventListener('toggle', (event) => {
    const detail = event.target;
    if (!(detail instanceof HTMLDetailsElement)) return;
    if (!detail.classList.contains('melato-accordion')) return;

    const list = detail.closest('.melato-accordion-list');
    if (!list || !detail.open) return;

    list.querySelectorAll('.melato-accordion[open]').forEach((item) => {
      if (item !== detail) item.removeAttribute('open');
    });
  }, true);

  const init = () => bindStablePdpDetails(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => bindStablePdpDetails(event.target));
})();
