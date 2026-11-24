/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const { JSDOM } = require('jsdom');
const { rootedFiles } = require('../scripts/rooted-files.cjs');

const repoFiles = rootedFiles(path.resolve(__dirname, '..'));
const read = file => repoFiles.read(file, 'utf8');
const parseJson = file => JSON.parse(read(file).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));

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
  engine.registerTag('form', {
    parse(token, remain) {
      this.args = token.args;
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain);
      stream
        .on('tag:endform', () => stream.stop())
        .on('template', tpl => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      emitter.write('<form>');
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      emitter.write('</form>');
    }
  });
  engine.registerTag('style', {
    parse(_token, remain) {
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain);
      stream
        .on('tag:endstyle', () => stream.stop())
        .on('template', tpl => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      emitter.write('<style>');
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      emitter.write('</style>');
    }
  });
  engine.registerFilter('money', n => `$${(Number(n || 0) / 100).toFixed(2)}`);
  engine.registerFilter('money_with_currency', n => `$${(Number(n || 0) / 100).toFixed(2)} CAD`);
  engine.registerFilter('json', v => JSON.stringify(v ?? null));
  engine.registerFilter('asset_url', v => `/assets/${v}`);
  engine.registerFilter('stylesheet_tag', url => `<link rel="stylesheet" href="${url}">`);
  engine.registerFilter('image_url', v => (typeof v === 'string' ? v : v?.src || 'https://melato.ca/cdn/shop/test.jpg'));
  engine.registerFilter('image_tag', (url, ...pairs) => {
    const args = Object.fromEntries(pairs.filter(Array.isArray));
    const attrs = [`src="${url}"`];
    if (args.class) attrs.push(`class="${args.class}"`);
    if (args.alt !== undefined && args.alt !== null) attrs.push(`alt="${args.alt}"`);
    if (args['aria-hidden']) attrs.push(`aria-hidden="${args['aria-hidden']}"`);
    return `<img ${attrs.join(' ')}>`;
  });
  engine.registerFilter('video_tag', () => '<video><source src="video.mp4"><img src="https://melato.ca/cdn/shop/files/preview_images/thumb.jpg"></video>');
  engine.registerFilter('payment_type_svg_tag', t => `<svg data-payment="${t}"></svg>`);
  engine.registerFilter('pluralize', (count, singular, plural) => (Number(count) === 1 ? singular : plural));
  engine.registerFilter('default_pagination', () => '');
  return engine;
}

test('F-NOV23-FR-CANONICAL-HREFLANG & F-NOV23-HOME-TITLE-ENTITY: theme head self-canonicalizes /fr PDPs and avoids double-escaped &amp;amp;', async () => {
  const en = parseJson('locales/en.default.json');
  const engine = createEngine({
    request: {
      locale: { iso_code: 'fr', primary: false, root_url: '/fr' },
      path: '/fr/products/purljury-knit-dress'
    },
    shop: { name: 'Melato', secure_url: 'https://melato.ca', currency: 'CAD' },
    routes: { root_url: '/fr', search_url: '/fr/search', cart_url: '/fr/cart', all_products_collection_url: '/fr/collections/all' },
    settings: { font_size_base: 16, line_height_body: 1.5, color_accent: '#000', color_accent_hover: '#000', color_error: '#f00' },
    template: { name: 'product' },
    current_page: 1,
    canonical_url: 'https://melato.ca/products/purljury-knit-dress',
    page_title: 'Purljury Knit Dress &amp; Co'
  });
  engine.registerFilter('t', key => key.split('.').reduce((o, k) => o?.[k], en) || key);

  const headSource = read('layout/theme.liquid').split('</head>')[0] + '</head>';
  const frHead = await engine.parseAndRender(headSource, {});
  assert.match(frHead, /<link rel="canonical" href="https:\/\/melato\.ca\/fr\/products\/purljury-knit-dress">/);
  assert.match(frHead, /<meta property="og:url" content="https:\/\/melato\.ca\/fr\/products\/purljury-knit-dress">/);
  assert.match(frHead, /<title>Purljury Knit Dress &amp; Co \| Melato<\/title>/);
  assert.doesNotMatch(frHead, /&amp;amp;/);

  const homeHead = await engine.parseAndRender(headSource, {
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/' },
    template: { name: 'index' },
    canonical_url: 'https://melato.ca/'
  });
  assert.match(homeHead, /<title>Melato \| Designer Apparel, Accessories &amp; Fragrance<\/title>/);
  assert.doesNotMatch(homeHead, /&amp;amp;/);
});

test('F-P07-IMAGE-ALT-INCONSISTENCY: localized URL emits zero leading newlines, homepage media has alt/no empty h3, and CTS images have descriptive alt', async () => {
  const engine = createEngine({ routes: { root_url: '/fr' } });
  const localized = await engine.parseAndRender('{% render "melato-localized-url", url: "/collections/new-arrivals" %}', {
    routes: { root_url: '/fr' }
  });
  assert.equal(localized, '/fr/collections/new-arrivals');

  const rack = read('sections/melato-rack.liquid');
  assert.doesNotMatch(rack, /<h3[^>]*data-rack-name[^>]*>\s*<\/h3>/);
  assert.match(rack, /<p class="mrack__name" data-rack-name><\/p>/);

  const brandHtml = await engine.parseAndRender(read('sections/brand-story.liquid').split('{% schema %}')[0], {
    section: { settings: { image: { alt: '' }, heading: 'MELATO, IN CONTEXT', eyebrow: 'About', body: 'Story', cta_label: 'Our Story', cta_url: '/pages/our-story' } },
    routes: { root_url: '/' }
  });
  assert.match(brandHtml, /<img[^>]+alt="MELATO, IN CONTEXT"/);

  const heroHtml = await engine.parseAndRender(read('sections/hero-video.liquid').split('{% schema %}')[0], {
    section: { id: 'hero-1', settings: { shopify_video: 'vid', loop_video: true, hero_height: 'full', overlay_opacity: 20, content_position: 'left', content_width: 700 } },
    routes: { all_products_collection_url: '/collections/all', root_url: '/' }
  });
  assert.match(heroHtml, /<img alt="" src=/);

  const realShopifySetHtml = `
    <div class="pdp-set-grid" role="list">
      <article class="pdp-set-card" role="listitem">
        <img src="//melato.ca/cdn/shop/files/ojos-jacket.jpg" alt="" srcset="//melato.ca/cdn/shop/files/ojos-jacket.jpg 800w" width="800" height="1200" loading="lazy" class="pdp-set-image">
        <p class="pdp-set-piece-label">Selected piece</p>
      </article>
      <article class="pdp-set-card" role="listitem">
        <a class="pdp-set-media-link" href="/products/ojos-velour-track-pants">
          <img src="//melato.ca/cdn/shop/files/ojos-pants.png" alt="" srcset="//melato.ca/cdn/shop/files/ojos-pants.png 800w" width="800" height="1000" loading="lazy" class="pdp-set-image">
        </a>
        <p class="pdp-set-piece-label">Matching piece</p>
      </article>
    </div>
  `;
  const setFiltered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: realShopifySetHtml,
    context: 'main',
    template: { name: 'product' },
    product: {
      title: 'Ojos Track Jacket',
      type: 'Track Jacket',
      featured_image: { src: 'jacket.jpg', alt: '' },
      metafields: {
        custom: {
          companion_product: {
            value: {
              title: 'Ojos Track Pant',
              url: '/products/ojos-velour-track-pants',
              featured_image: { src: 'pant.jpg', alt: '' }
            }
          }
        }
      }
    }
  });
  assert.match(setFiltered, /alt="Ojos Track Jacket - Front view"/);
  assert.match(setFiltered, /alt="Ojos Track Pant - Front view"/);
  assert.doesNotMatch(setFiltered, /alt=""/);
});

test('F-NOV23-CTS-VARIANT-LABEL: Complete the Set strips redundant single-color suffix (S / Ojos -> S) while keeping multi-color labels', async () => {
  const engine = createEngine({ shop: { currency: 'CAD' } });
  const jacketVariants = [
    { id: 1, available: true, title: 'S / Ojos', option1: 'S', option2: 'Ojos', price: 10999 },
    { id: 2, available: true, title: 'M / Ojos', option1: 'M', option2: 'Ojos', price: 10999 },
    { id: 3, available: true, title: 'L / Ojos', option1: 'L', option2: 'Ojos', price: 10999 }
  ];
  const pantVariants = [
    { id: 11, available: true, title: 'S', option1: 'S', price: 6999 },
    { id: 12, available: true, title: 'M', option1: 'M', price: 6999 }
  ];
  const jacket = {
    title: 'Ojos Track Jacket',
    type: 'Track Jacket',
    url: '/products/ojos-velour-track-jacket',
    options_with_values: [
      { name: 'Size', position: 1, values: ['S', 'M', 'L'] },
      { name: 'Color', position: 2, values: ['Ojos'] }
    ],
    variants: jacketVariants,
    selected_or_first_available_variant: jacketVariants[0],
    metafields: {
      custom: {
        companion_product: {
          value: {
            title: 'Ojos Track Pant',
            type: 'Track Pant',
            url: '/products/ojos-velour-track-pants',
            options_with_values: [{ name: 'Size', position: 1, values: ['S', 'M'] }],
            variants: pantVariants,
            selected_or_first_available_variant: pantVariants[0],
            metafields: { custom: {} }
          }
        }
      }
    }
  };
  const filtered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: '<a class="pdp-set-cta" href="/products/ojos-velour-track-pants">View matching piece</a>',
    context: 'main',
    template: { name: 'product' },
    product: jacket,
    shop: { currency: 'CAD' }
  });
  const doc = new JSDOM(filtered).window.document;
  const jacketOpts = [...doc.querySelectorAll('[data-melato-set-current] option')].map(o => o.textContent);
  assert.deepEqual(jacketOpts, ['S', 'M', 'L']);

  const multiColorJacket = {
    ...jacket,
    options_with_values: [
      { name: 'Size', position: 1, values: ['S', 'M'] },
      { name: 'Color', position: 2, values: ['Ojos', 'Noir'] }
    ]
  };
  const multiFiltered = await engine.parseAndRender(read('snippets/melato-rendered-output-filters.liquid'), {
    html: '<a class="pdp-set-cta" href="/products/ojos-velour-track-pants">View matching piece</a>',
    context: 'main',
    template: { name: 'product' },
    product: multiColorJacket,
    shop: { currency: 'CAD' }
  });
  const multiDoc = new JSDOM(multiFiltered).window.document;
  const multiOpts = [...multiDoc.querySelectorAll('[data-melato-set-current] option')].map(o => o.textContent);
  assert.deepEqual(multiOpts, ['S / Ojos', 'M / Ojos', 'L / Ojos']);
});

test('F-NOV23-EMPTY-RECS-HEADING: empty recommendations are hidden on SSR and omitted on recommendations endpoint', async () => {
  const engine = createEngine({
    request: { locale: { iso_code: 'fr' } },
    routes: { product_recommendations_url: '/recommendations/products' }
  });
  const source = read('sections/related-products.liquid').split('{% schema %}')[0];
  const product = { id: 1, title: 'Coat of Silence', type: 'Outerwear', metafields: { custom: {} } };

  const ssrHtml = await engine.parseAndRender(source, {
    section: { id: 'rel', settings: { eyebrow: 'Continue shopping', products_to_show: 4 } },
    product,
    recommendations: { performed: false, products: [] },
    collections: { 'new-arrivals': { products: [] }, 'best-sellers': { products: [] } }
  });
  assert.match(ssrHtml, /<section class="melato-related[^"]*"[^>]*hidden/);
  assert.match(ssrHtml, /Vous aimerez aussi/);

  const ajaxEmptyHtml = await engine.parseAndRender(source, {
    section: { id: 'rel', settings: { eyebrow: 'Continue shopping', products_to_show: 4 } },
    product,
    recommendations: { performed: true, products: [] },
    collections: { 'new-arrivals': { products: [] }, 'best-sellers': { products: [] } }
  });
  assert.doesNotMatch(ajaxEmptyHtml, /You might also like|Vous aimerez aussi|melato-grid|melato-related/);
});

test('F-P03-SPEC-PLACEHOLDER & PDP spec deduplication: placeholder stripped, weight preserved when only dimensions exist, knit dress composition not duplicated', async () => {
  const en = parseJson('locales/en.default.json');
  const engine = createEngine({
    request: { locale: { iso_code: 'en' } },
    shop: { currency: 'CAD', money_format: '${{amount}}' },
    routes: { root_url: '/' }
  });
  engine.registerFilter('t', key => key.split('.').reduce((o, k) => o?.[k], en) || key);
  const pdpSource = read('sections/melato-product-page-rebuild.liquid').split('{% schema %}')[0];

  const babidiHtml = await engine.parseAndRender(pdpSource, {
    section: { id: 'pdp', settings: { eyebrow: 'Product' } },
    product: {
      id: 11,
      handle: 'babidi-sunglasses',
      title: 'Babidi Sunglasses',
      type: 'Eyewear',
      tags: [],
      price: 19500,
      has_only_default_variant: true,
      selected_or_first_available_variant: { id: 111, price: 19500, available: true },
      variants: [{ id: 111, price: 19500, available: true, options: ['Default Title'] }],
      media: [],
      options_with_values: [],
      metafields: {
        custom: {
          pdp_material_details: { value: ['Hand-polished Italian acetate frame; CR-39 OR polycarbonate UV400 lenses, final lens material not specified'] }
        },
        melato: {},
        fragrance: {}
      }
    }
  });
  assert.doesNotMatch(babidiHtml, /final lens material not specified/);
  assert.match(babidiHtml, /Hand-polished Italian acetate frame; CR-39 OR polycarbonate UV400 lenses/);

  const bagOnlyDimensionsHtml = await engine.parseAndRender(pdpSource, {
    section: { id: 'pdp', settings: { eyebrow: 'Product' } },
    product: {
      id: 12,
      handle: 'test-bag',
      title: 'Test Bag',
      type: 'Bag',
      tags: [],
      price: 36500,
      description: '<p>Bag.</p><h3>Dimensions</h3><p>28 × 20 × 11 cm.</p>',
      has_only_default_variant: true,
      selected_or_first_available_variant: { id: 121, price: 36500, available: true },
      variants: [{ id: 121, price: 36500, available: true, options: ['Default Title'] }],
      media: [],
      options_with_values: [],
      metafields: {
        custom: {
          material_composition: { value: 'Exterior: Saffiano Calfskin.' },
          construction: { value: ['Exterior: Saffiano Calfskin.', 'Dimensions: 28 × 20 × 11 cm.', 'Finished product weight: 520 g.', 'Closure: Turn-Lock.'] }
        },
        melato: {},
        fragrance: {}
      }
    }
  });
  assert.match(bagOnlyDimensionsHtml, /Finished product weight: 520 g\./);
  assert.match(bagOnlyDimensionsHtml, /Closure: Turn-Lock\./);
  assert.doesNotMatch(bagOnlyDimensionsHtml, /<li>Exterior: Saffiano Calfskin\.<\/li>/);

  const purljuryHtml = await engine.parseAndRender(pdpSource, {
    section: { id: 'pdp', settings: { eyebrow: 'Product' } },
    product: {
      id: 13,
      handle: 'purljury-knit-dress',
      title: 'Purljury Knit Dress',
      type: 'Dress',
      tags: [],
      price: 24500,
      description: '<p>Ribbed midi dress.</p><h3>Details</h3><ul><li>Fine 1×1 rib knit, 280 gsm</li><li>95% cotton, 5% elastane</li></ul>',
      has_only_default_variant: true,
      selected_or_first_available_variant: { id: 131, price: 24500, available: true },
      variants: [{ id: 131, price: 24500, available: true, options: ['Default Title'] }],
      media: [],
      options_with_values: [],
      metafields: { custom: {}, melato: {}, fragrance: {} }
    }
  });
  const doc = new JSDOM(purljuryHtml).window.document;
  const detailsText = [...doc.querySelectorAll('.pdp-spec')].find(el => el.querySelector('summary')?.textContent === 'Details')?.textContent || '';
  const visibleHtml = purljuryHtml.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.match(purljuryHtml, /<summary><span>Materials<\/span>/);
  assert.equal((visibleHtml.match(/95% cotton, 5% elastane/g) || []).length, 1);
  assert.doesNotMatch(detailsText, /95% cotton, 5% elastane/);
  assert.match(detailsText, /Fine 1×1 rib knit, 280 gsm/);
});

test('F-P02-FR-UNTRANSLATED & 010 Newsletter: footer tagline, header numbering, cart, search, collections, and core bundle sync localize cleanly', async () => {
  const fr = parseJson('locales/fr.json');
  const engine = createEngine({
    request: { locale: { iso_code: 'fr' }, path: '/fr' },
    routes: { root_url: '/fr', search_url: '/fr/search', cart_url: '/fr/cart', all_products_collection_url: '/fr/collections/all' },
    shop: { name: 'Melato', currency: 'CAD', enabled_payment_types: [] },
    collection: { handle: 'new-arrivals', title: 'New Arrivals', url: '/fr/collections/new-arrivals', products_count: 12, filters: [], products: [], default_sort_by: 'manual', sort_by: 'manual' }
  });
  engine.registerFilter('t', key => key.split('.').reduce((o, k) => o?.[k], fr) || key);

  const footerHtml = await engine.parseAndRender(read('sections/melato-footer.liquid').split('{% schema %}')[0], {
    section: { id: 'ftr', settings: { tagline: 'Join the collective.' } }
  });
  assert.match(footerHtml, /Rejoindre le collectif\./);
  assert.doesNotMatch(footerHtml, /Join the collective\./);

  const links = Array.from({ length: 10 }, (_, idx) => ({
    title: idx === 9 ? 'Newsletter' : `Item ${idx + 1}`,
    url: idx === 9 ? '/pages/newsletter' : `/collections/c-${idx + 1}`,
    active: false,
    links: []
  }));
  const headerHtml = await engine.parseAndRender(read('sections/melato-header.liquid').split('{% schema %}')[0], {
    section: { id: 'hdr', settings: {} },
    linklists: { 'main-menu': { links } },
    cart: { item_count: 0 }
  });
  assert.match(headerHtml, /<span>01<\/span>/);
  assert.match(headerHtml, /<span>10<\/span>/);
  assert.doesNotMatch(headerHtml, /<span>010<\/span>/);

  const searchHtml = await engine.parseAndRender(read('sections/melato-main-search.liquid').split('{% schema %}')[0], {
    section: { id: 'search-fr' },
    search: { performed: true, results_count: 0, terms: 'xyznonexistent999', results: [] }
  });
  assert.match(searchHtml, /Rechercher chez Melato/);
  assert.match(searchHtml, /href="\/fr\/collections\/new-arrivals"/);
  assert.doesNotMatch(searchHtml, /\/frcollections\//);

  const cartHtml = await engine.parseAndRender(read('sections/main-cart.liquid').split('{% schema %}')[0], {
    cart: { item_count: 0, items: [] }
  });
  assert.match(cartHtml, /Votre panier est vide/);
  assert.match(cartHtml, /href="\/fr\/collections\/new-arrivals"/);

  const colHtml = await engine.parseAndRender(read('sections/main-collection.liquid').split('{% schema %}')[0], {
    section: { id: 'col-fr', settings: { enable_filtering: true, enable_sorting: true, columns_desktop: 3, columns_mobile: 2, products_per_page: 24 } }
  });
  assert.match(colHtml, /<h1 class="melato-collection-title">Nouveautés<\/h1>/);
  assert.match(colHtml, /Prix croissant/);

  const coreJs = read('assets/melato-core.js');
  assert.match(coreJs, /syncMainCartPage/);
  assert.match(coreJs, /data-main-cart-section/);
  assert.match(coreJs, /isFrenchLocale/);
});
