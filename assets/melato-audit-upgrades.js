(() => {
  'use strict';

  /*
    P0 PDP stability, 2026-08-18.
    This asset is intentionally observer-free. The previous runtime dynamically
    loaded melato-pdp-cleanup-20260818.js and attached capture-phase summary click
    interception plus per-detail and document MutationObservers. Those behaviors
    competed with other PDP enhancement scripts and could saturate the main thread
    after the first shopper interaction.
  */

  class MelatoProductRecommendations extends HTMLElement {
    connectedCallback() {
      const url = this.dataset.url;
      if (!url || this.dataset.loaded === 'true') return;

      const section = this.closest('section.melato-related');
      const existingCards = this.querySelectorAll('.melato-grid--cards .melato-card, .melato-related-grid .melato-card');
      if (existingCards.length > 0) {
        this.dataset.loaded = 'true';
        this.dataset.recommendationSource = 'server-fallback';
        if (section) section.hidden = false;
        return;
      }

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
          const cards = incoming ? incoming.querySelectorAll('.melato-card') : [];
          if (incoming && cards.length > 0) {
            this.innerHTML = incoming.innerHTML;
            this.removeAttribute('data-recommendations-error');
            if (section) section.hidden = false;
          } else if (section) {
            section.hidden = true;
          }
        })
        .catch(() => {
          this.setAttribute('data-recommendations-error', 'true');
          if (section) section.hidden = true;
        });
    }
  }

  if (!customElements.get('product-recommendations')) {
    customElements.define('product-recommendations', MelatoProductRecommendations);
  }
})();
