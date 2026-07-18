(() => {
  class MelatoProductRecommendations extends HTMLElement {
    connectedCallback() {
      const url = this.dataset.url;
      if (!url || this.dataset.loaded === 'true') return;
      this.dataset.loaded = 'true';

      fetch(url)
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
})();
