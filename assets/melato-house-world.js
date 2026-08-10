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

  const metamorphosis = ['OVUM', 'ERUCA', 'EXUVIUM', 'AURELIA', 'ECLOSION', 'IMAGO', 'PAPILIO'];
  const normalizedPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (!WORLD_COLLECTIONS.has(normalizedPath)) return;

  const buildRail = () => {
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
    return nav;
  };

  const buildMetamorphosis = () => {
    const section = document.createElement('section');
    section.className = 'melato-world-cycle';
    section.setAttribute('aria-label', 'Metamorphosis cycle');

    const heading = document.createElement('div');
    heading.className = 'melato-world-cycle__heading';
    const kicker = document.createElement('span');
    kicker.textContent = 'Metamorphosis / Cycle Index';
    const title = document.createElement('strong');
    title.textContent = 'Seven states. One evolving house language.';
    heading.append(kicker, title);

    const index = document.createElement('div');
    index.className = 'melato-world-cycle__index';

    metamorphosis.forEach((name, indexNumber) => {
      const item = document.createElement(indexNumber === 0 ? 'a' : 'div');
      item.className = 'melato-world-cycle__item';
      if (indexNumber === 0) {
        item.href = '/collections/ovum-before-the-world';
        item.setAttribute('aria-current', 'page');
      }
      const number = document.createElement('span');
      number.textContent = String(indexNumber + 1).padStart(2, '0');
      const label = document.createElement('strong');
      label.textContent = name;
      item.append(number, label);
      index.appendChild(item);
    });

    section.append(heading, index);
    return section;
  };

  const ensureCycleStyles = () => {
    if (document.getElementById('MelatoWorldCycleStyles')) return;
    const style = document.createElement('style');
    style.id = 'MelatoWorldCycleStyles';
    style.textContent = '.melato-world-cycle{padding:clamp(54px,7vw,100px) var(--melato-side,32px);border-bottom:1px solid rgba(9,9,9,.2);background:var(--melato-cream,#f0e8d9);color:var(--melato-ink,#090909)}.melato-world-cycle__heading{display:grid;grid-template-columns:.5fr 1fr;gap:24px 60px;margin-bottom:clamp(42px,6vw,80px)}.melato-world-cycle__heading span,.melato-world-cycle__item span{font-family:var(--melato-mono,monospace);font-size:8px;letter-spacing:.14em;text-transform:uppercase}.melato-world-cycle__heading strong{max-width:700px;font-family:var(--melato-editorial,serif);font-size:clamp(30px,4vw,58px);font-style:italic;font-weight:400;line-height:1}.melato-world-cycle__index{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid rgba(9,9,9,.2)}.melato-world-cycle__item{display:flex;min-width:0;min-height:130px;flex-direction:column;justify-content:space-between;padding:18px 12px;border-right:1px solid rgba(9,9,9,.2);color:inherit;text-decoration:none}.melato-world-cycle__item:last-child{border-right:0}.melato-world-cycle__item strong{font-family:var(--melato-ui,Arial,sans-serif);font-size:clamp(12px,1.15vw,17px);font-weight:500;letter-spacing:.02em}.melato-world-cycle__item:not(a){opacity:.42}.melato-world-cycle__item[aria-current=page]{background:var(--melato-ink,#090909);color:var(--melato-cream,#f0e8d9)}@media(max-width:900px){.melato-world-cycle__heading{grid-template-columns:1fr}.melato-world-cycle__index{grid-template-columns:repeat(4,1fr)}.melato-world-cycle__item:nth-child(4){border-right:0}}@media(max-width:749px){.melato-world-cycle{padding-inline:16px}.melato-world-cycle__index{grid-template-columns:repeat(2,1fr)}.melato-world-cycle__item{min-height:104px}.melato-world-cycle__item:nth-child(even){border-right:0}}';
    document.head.appendChild(style);
  };

  const boot = () => {
    const root = document.querySelector('[data-collection-root]');
    const header = root && root.querySelector('.melato-collection-header');
    if (!root || !header) return;

    document.body.classList.add('melato-world-collection');

    if (!root.querySelector('.melato-world-rail')) root.insertBefore(buildRail(), header);

    if (normalizedPath === '/collections/ovum-before-the-world' && !root.querySelector('.melato-world-cycle')) {
      ensureCycleStyles();
      header.insertAdjacentElement('afterend', buildMetamorphosis());
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  document.addEventListener('shopify:section:load', boot);
})();
