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

  // The PDP uses native <details> for Story, Construction, Fit, Material, Care
  // and Shipping. Legacy theme code can mutate the open attribute after a click.
  // Shopper intent owns that state until the shopper explicitly toggles it again.
  function bindStablePdpDetail(detail) {
    if (!(detail instanceof HTMLDetailsElement) || detail.dataset.melatoStableDetail === 'true') return;
    const summary = detail.querySelector(':scope > summary');
    if (!summary) return;

    detail.dataset.melatoStableDetail = 'true';
    let intendedOpen = detail.open;
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
      setOpen(!intendedOpen);
    }, true);

    new MutationObserver(() => {
      if (internalMutation || detail.open === intendedOpen) return;
      requestAnimationFrame(() => setOpen(intendedOpen));
    }).observe(detail, { attributes: true, attributeFilter: ['open'] });
  }

  function bindStablePdpDetails(root = document) {
    root.querySelectorAll([
      '[id^="MelatoPDP-"] details',
      '.melato-clean-pdp details.pdp-detail',
      '.melato-pdp-rebuild details.pdp-spec',
      '.melato-pdp-rebuild details.pdp-mini-detail',
      'details.ml-meta-card'
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

  let bindFrame = 0;
  const bindDynamicPdpDetails = () => {
    if (bindFrame) return;
    bindFrame = requestAnimationFrame(() => {
      bindFrame = 0;
      bindStablePdpDetails(document);
    });
  };

  const init = () => {
    bindStablePdpDetails(document);
    if (document.body) {
      new MutationObserver(bindDynamicPdpDetails).observe(document.body, { childList: true, subtree: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', (event) => bindStablePdpDetails(event.target));
})();
