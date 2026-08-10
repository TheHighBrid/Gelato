(() => {
  'use strict';

  const WORLD_COLLECTIONS = new Set([
    '/collections/the-living-lookbook',
    '/collections/living-lookbook-shop-the-looks',
    '/collections/ovum-before-the-world'
  ]);

  const links = [
    ['/collections/the-living-lookbook', 'Living Book'],
    ['/collections/ovum-before-the-world', 'Collections'],
    ['/pages/our-story', 'The House'],
    ['/collections/new-arrivals', 'New Work']
  ];

  const normalizedPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (!WORLD_COLLECTIONS.has(normalizedPath)) return;

  const boot = () => {
    const root = document.querySelector('[data-collection-root]');
    const header = root && root.querySelector('.melato-collection-header');
    if (!root || !header || root.querySelector('.melato-world-rail')) return;

    document.body.classList.add('melato-world-collection');

    const nav = document.createElement('nav');
    nav.className = 'melato-world-rail';
    nav.setAttribute('aria-label', 'World of Melato');

    const mark = document.createElement('span');
    mark.className = 'melato-world-rail__mark';
    mark.textContent = 'World of Melato';

    const group = document.createElement('div');
    group.className = 'melato-world-rail__links';

    links.forEach(([href, label]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (href === normalizedPath) link.setAttribute('aria-current', 'page');
      group.appendChild(link);
    });

    nav.append(mark, group);
    root.insertBefore(nav, header);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('shopify:section:load', boot);
})();
