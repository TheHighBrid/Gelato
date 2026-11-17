const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const { rootedFiles } = require('../scripts/rooted-files.cjs');

const repoFiles = rootedFiles(path.resolve(__dirname, '..'));

function read(file) {
  return repoFiles.read(file, 'utf8');
}

function parseJson(file) {
  const content = read(file).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  return JSON.parse(content);
}

function createEngine(globals = {}) {
  const engine = new Liquid({
    root: path.resolve(__dirname, '..', 'snippets'),
    extname: '.liquid',
    globals
  });
  engine.registerTag('doc', {
    parse(_token, remain) {
      while (remain.length && remain.shift().name !== 'enddoc') {}
    },
    render() {
      return '';
    }
  });
  engine.registerTag('paginate', {
    parse(_token, remain) {
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain);
      stream
        .on('tag:endpaginate', () => stream.stop())
        .on('template', tpl => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
    }
  });
  engine.registerFilter('money', n => `${(Number(n) / 100).toFixed(2)}`);
  engine.registerFilter('money_with_currency', n => `${(Number(n) / 100).toFixed(2)} CAD`);
  engine.registerFilter('json', v => JSON.stringify(v ?? null));
  engine.registerFilter('image_url', () => 'https://melato.ca/cdn/shop/test.jpg');
  engine.registerFilter('image_tag', (_url, args) => `<img class="${args.class || ''}" alt="${args.alt || ''}">`);
  return engine;
}

test('F-P05-SEARCH-DEADEND: zero results search renders empty discovery recovery block', async () => {
  const engine = createEngine({ routes: { root_url: '/', all_products_collection_url: '/collections/all' } });
  const searchSource = read('sections/melato-main-search.liquid').split('{% schema %}')[0];
  const rendered = await engine.parseAndRender(searchSource, {
    section: { id: 'search-test' },
    search: { performed: true, results_count: 0, terms: 'xyzimpossiblequery12345', results: [] }
  });
  assert.match(rendered, /class="melato-search-empty-recovery"/);
  assert.match(rendered, /Explore Melato/);
  assert.match(rendered, /href="\/collections\/new-arrivals"/);
  assert.match(rendered, /href="\/collections\/tracksuits"/);
  assert.match(rendered, /href="\/collections\/all"/);
});

test('F-P08-SCHEMA-DUPLICATE-BREADCRUMBS: melato-product-jsonld and melato-global-jsonld do not duplicate BreadcrumbList on PDP', () => {
  const productJsonLd = read('snippets/melato-product-jsonld.liquid');
  const globalJsonLd = read('snippets/melato-global-jsonld.liquid');

  assert.match(globalJsonLd, /\{% unless template\.name == 'product' %\}/);
  assert.match(globalJsonLd, /"@type":"BreadcrumbList"/);
  assert.match(productJsonLd, /"@type":\s*"BreadcrumbList"/);
});

test('F-P03-SPEC-PLACEHOLDER: eyewear placeholder copy is stripped and apparel size guide suppressed', async () => {
  const engine = createEngine();
  const rawPdp = `
    <div class="pdp-buybox-specs">
      <details class="pdp-buybox-spec"><summary><span>Materials</span></summary><div class="pdp-rte"><p>Hand-polished Italian acetate frame; CR-39 lenses, final lens material not specified</p></div></details>
      <a class="size-guide-trigger" href="/pages/size-guide">Fit guide</a>
    </div>
  `;
  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawPdp,
    context: 'main',
    template: { name: 'product' },
    product: { title: 'Babidi Sunglasses', type: 'Eyewear', metafields: { custom: {} } }
  });
  assert.doesNotMatch(filtered, /final lens material not specified/);
  assert.doesNotMatch(filtered, /class="size-guide-trigger"/);
});

test('F-P04-SPEC-DUPLICATION: duplicate Construction accordion is suppressed in rebuild logic', () => {
  const rebuildSource = read('sections/melato-product-page-rebuild.liquid');
  assert.match(rebuildSource, /construction_check contains 'material:'/);
  assert.match(rebuildSource, /assign construction_paragraph = blank/);
});

test('F-P07-IMAGE-ALT-INCONSISTENCY: Complete the Set images render descriptive alt text', async () => {
  const engine = createEngine();
  const rawSet = `
    <article class="pdp-set-card">
      <img class="pdp-set-image" loading="lazy" widths="300, 500, 800" alt="">
      <p class="pdp-set-piece-label">Selected piece</p>
    </article>
    <article class="pdp-set-card">
      <img class="pdp-set-image" loading="lazy" widths="300, 500, 800" alt="">
      <p class="pdp-set-piece-label">Matching piece</p>
    </article>
  `;
  const productA = {
    title: 'Shell Company Technical Track Jacket',
    type: 'Track Jacket',
    featured_image: { alt: '' },
    metafields: { custom: {} }
  };
  const productB = {
    title: 'Shell Company Technical Track Pant',
    type: 'Track Pant',
    featured_image: { alt: '' },
    metafields: { custom: {} }
  };
  productA.metafields.custom.companion_product = { value: productB };

  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawSet,
    context: 'main',
    template: { name: 'product' },
    product: productA
  });
  assert.match(filtered, /alt="Shell Company Technical Track Jacket - Front view"/);
  assert.match(filtered, /alt="Shell Company Technical Track Pant - Front view"/);
  assert.doesNotMatch(filtered, /alt=""/);
});

test('F-P02-FR-UNTRANSLATED: French locale translates buybox CTA and specification labels', async () => {
  const engine = createEngine({ request: { locale: { iso_code: 'fr' } } });
  const rawBuybox = `
    <button class="pdp-atc" type="submit" name="add" data-pdp-atc>Add to cart</button>
    <details class="pdp-buybox-spec"><summary><span>Materials</span></summary></details>
    <details class="pdp-buybox-spec"><summary><span>Fit</span></summary></details>
    <details class="pdp-buybox-spec"><summary><span>Care</span></summary></details>
    <details class="pdp-spec melato-pdp-bible-section-title"><summary>Construction</summary></details>
    <h2 class="melato-pdp-bible-section-title">Complete the Set</h2>
  `;
  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawBuybox,
    context: 'main',
    template: { name: 'product' },
    product: { title: 'Test Product', type: 'Apparel', metafields: { custom: {} } }
  });
  assert.match(filtered, />\s*Ajouter au panier\s*</);
  assert.match(filtered, /<span>Matières<\/span>/);
  assert.match(filtered, /<span>Coupe<\/span>/);
  assert.match(filtered, /<span>Entretien<\/span>/);
  assert.match(filtered, /<summary>Confection<\/summary>/);
  assert.match(filtered, /Compléter l'ensemble/);
});

test('F-P02-FR-UNTRANSLATED: French locale preserves Complete the Set controls and translates bundle labels and CTA', async () => {
  const engine = createEngine({ request: { locale: { iso_code: 'fr' } }, shop: { currency: 'CAD' } });
  const rawSetLink = '<a class="pdp-set-cta" href="/products/shell-company-technical-track-pant">View matching piece</a>';
  const v1 = { id: 101, available: true, title: 'M', price: 13999 };
  const v2 = { id: 202, available: true, title: 'M', price: 11999 };
  const productA = {
    title: 'Shell Company Technical Track Jacket',
    type: 'Track Jacket',
    url: '/products/shell-company-technical-track-jacket',
    variants: [v1],
    selected_or_first_available_variant: v1,
    metafields: { custom: {} }
  };
  const productB = {
    title: 'Shell Company Technical Track Pant',
    type: 'Track Pant',
    url: '/products/shell-company-technical-track-pant',
    variants: [v2],
    selected_or_first_available_variant: v2,
    metafields: { custom: {} }
  };
  productA.metafields.custom.companion_product = { value: productB };

  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawSetLink,
    context: 'main',
    template: { name: 'product' },
    product: productA,
    shop: { currency: 'CAD' }
  });

  const { JSDOM } = require('jsdom');
  const doc = new JSDOM(filtered).window.document;
  assert.ok(doc.querySelector('[data-melato-set-current]'), 'Current product size selector must be present');
  assert.ok(doc.querySelector('[data-melato-set-matching]'), 'Matching product size selector must be present');
  assert.equal(doc.querySelector('.melato-full-set-button')?.textContent, "AJOUTER L'ENSEMBLE");
  assert.equal(doc.querySelector('.pdp-set-cta')?.textContent, 'Voir la pièce assortie');
  assert.equal(doc.querySelector('.melato-full-set-price span')?.textContent, 'Ensemble complet');
});

test('F-P02-FR-UNTRANSLATED: navigation labels translate accurately for French storefront including numbered prefixes', async () => {
  const engine = createEngine();
  const fr = parseJson('locales/fr.json');
  engine.registerFilter('t', key => key.split('.').reduce((obj, part) => obj?.[part], fr) || key);

  const testNav = '{% render "melato-navigation-label", title: "New Arrivals" %}|{% render "melato-navigation-label", title: "01 New Arrivals" %}|{% render "melato-navigation-label", title: "02 Tracksuits" %}|{% render "melato-navigation-label", title: "05 Accessories" %}|{% render "melato-navigation-label", title: "Fragrance" %}|{% render "melato-navigation-label", title: "Pocket Change" %}';
  const rendered = await engine.parseAndRender(testNav);
  assert.equal(rendered.trim(), 'Nouveautés|01 Nouveautés|02 Survêtements|05 Accessoires|Parfums|Pocket Change');
});

test('F-P09-SUPPORT-EMAIL-VARIANCE: policy pages route through filters and contact email is unified', () => {
  const theme = read('layout/theme.liquid');
  assert.match(theme, /template\.name == 'policy' or request\.path contains '\/policies\/'/);
  const contact = read('sections/melato-contact-upgrade.liquid');
  assert.match(contact, /"email":\s*"support@melato\.ca"/);
  assert.doesNotMatch(contact, /"email":\s*"orders@melato\.ca"/);
});

test('F-P06 & F-P11: localized URL maps singular pant collection to plural and preserves locale', async () => {
  const engine = createEngine({ routes: { root_url: '/fr' } });
  const renderedPant = await engine.parseAndRender('{% render "melato-localized-url", url: "/collections/pant" %}', {
    routes: { root_url: '/fr' }
  });
  assert.equal(renderedPant.trim(), '/fr/collections/pants');

  const renderedTracksuits = await engine.parseAndRender('{% render "melato-localized-url", url: "/collections/tracksuits" %}', {
    routes: { root_url: '/fr' }
  });
  assert.equal(renderedTracksuits.trim(), '/fr/collections/tracksuits');
});

test('F-P02-FR-UNTRANSLATED: buybox purchase button with whitespace and rebuild template renders in French', async () => {
  const engine = createEngine({ request: { locale: { iso_code: 'fr' } }, shop: { currency: 'CAD' } });
  const rawPdpButton = `
    <button class="pdp-atc" type="submit" name="add" data-pdp-atc>
      Add to cart
    </button>
  `;
  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawPdpButton,
    context: 'main',
    template: { name: 'product' },
    product: { title: 'Test Garment', type: 'Apparel', metafields: { custom: {} } }
  });
  assert.match(filtered, />\s*Ajouter au panier\s*</);

  const rebuildSource = read('sections/melato-product-page-rebuild.liquid');
  assert.match(rebuildSource, /request\.locale\.iso_code == 'fr'/);
  assert.match(rebuildSource, /Ajouter au panier/);
  assert.match(rebuildSource, /Rupture de stock/);
});

test('F-P02 / Codex P2: category adapter in melato-pdp-product-type-semantics processes French disclosures and strips fit guide link', () => {
  const semantics = read('sections/melato-pdp-product-type-semantics.liquid');
  assert.match(semantics, /isFitDisclosure/);
  assert.match(semantics, /summaryText\.indexOf\('coupe'\)/);
  assert.match(semantics, /Mesures monture et verres/);
  assert.match(semantics, /Dimensions et capacité/);
});

test('F-P01-SLUG-DIRTY: cloned product handles are sanitized in melato-rendered-output-filters', async () => {
  const engine = createEngine();
  const rawHtml = `
    <a href="/products/sunset-deposition-corset-dress-copy">Sunset Deposition</a>
    <a href="/products/rex-x-fur-jacket-1">Rex X Fur</a>
    <a href="/products/blacklist-sunglasses-1">Blacklist</a>
  `;
  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: rawHtml,
    context: 'main',
    template: { name: 'product' },
    product: { title: 'Test', type: 'Apparel', metafields: { custom: {} } }
  });
  assert.doesNotMatch(filtered, /sunset-deposition-corset-dress-copy/);
  assert.doesNotMatch(filtered, /rex-x-fur-jacket-1/);
  assert.doesNotMatch(filtered, /blacklist-sunglasses-1/);
  assert.match(filtered, /\/products\/sunset-deposition-corset-dress"/);
  assert.match(filtered, /\/products\/rex-x-fur-jacket"/);
  assert.match(filtered, /\/products\/blacklist-sunglasses"/);
});



test('F-P01/P02: legacy companion URL normalization retains Complete the Set selectors', async () => {
  const engine = createEngine({ shop: { currency: 'CAD' } });
  const variant = { id: 501, available: true, title: 'One Size', price: 19500 };
  const companion = {
    title: 'Blacklist Sunglasses',
    url: '/products/blacklist-sunglasses-1',
    variants: [variant],
    selected_or_first_available_variant: variant,
    metafields: { custom: {} }
  };
  const product = {
    title: 'Test Accessory',
    type: 'Accessories',
    variants: [variant],
    selected_or_first_available_variant: variant,
    metafields: { custom: { companion_product: { value: companion } } }
  };
  const rendered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: '<a class="pdp-set-cta" href="/products/blacklist-sunglasses-1">View matching piece</a>',
    context: 'main',
    template: { name: 'product' },
    product,
    shop: { currency: 'CAD' }
  });
  assert.match(rendered, /data-melato-set-current/);
  assert.match(rendered, /data-melato-set-matching/);
  assert.match(rendered, /data-melato-set-add/);
  assert.match(rendered, /href="\/products\/blacklist-sunglasses"/);
  assert.doesNotMatch(rendered, /blacklist-sunglasses-1/);
});
