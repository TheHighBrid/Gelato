const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Liquid } = require('liquidjs');
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
    return `<img ${attrs.join(' ')}>`;
  });
  engine.registerFilter('video_tag', () => '<video><source src="video.mp4"><img src="https://melato.ca/cdn/shop/files/preview_images/thumb.jpg"></video>');
  engine.registerFilter('payment_type_svg_tag', t => `<svg data-payment="${t}"></svg>`);
  engine.registerFilter('pluralize', (count, singular, plural) => (Number(count) === 1 ? singular : plural));
  engine.registerFilter('default_pagination', () => '');
  return engine;
}

test('A11Y-HOME-ALT-H3: homepage rack omits empty h3, brand-story and hero-video emit img alt attributes', async () => {
  const rack = read('sections/melato-rack.liquid');
  assert.doesNotMatch(rack, /<h3[^>]*data-rack-name[^>]*>\s*<\/h3>/);
  assert.match(rack, /<p class="mrack__name" data-rack-name><\/p>/);

  const engine = createEngine();
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
});

test('NAV-DUPE-COLS (010 Newsletter): header formats 1..9 with leading zero and 10 without stray zero', async () => {
  const en = parseJson('locales/en.default.json');
  const engine = createEngine({ request: { locale: { iso_code: 'en' } }, shop: { name: 'Melato' }, routes: { root_url: '/', search_url: '/search', cart_url: '/cart', all_products_collection_url: '/collections/all' } });
  engine.registerFilter('t', key => key.split('.').reduce((o, k) => o?.[k], en) || key);
  const links = Array.from({ length: 10 }, (_, idx) => ({
    title: idx === 9 ? 'Newsletter' : `Item ${idx + 1}`,
    url: idx === 9 ? '/pages/newsletter' : `/collections/c-${idx + 1}`,
    active: false,
    links: []
  }));
  const rendered = await engine.parseAndRender(read('sections/melato-header.liquid').split('{% schema %}')[0], {
    section: { id: 'hdr', settings: {} },
    linklists: { 'main-menu': { links } },
    cart: { item_count: 0 }
  });
  assert.match(rendered, /<span>01<\/span>/);
  assert.match(rendered, /<span>09<\/span>/);
  assert.match(rendered, /<span>10<\/span>/);
  assert.doesNotMatch(rendered, /<span>010<\/span>/);
});

test('PDP-EMPTY-RECS: empty recommendations are hidden on SSR and omitted on recommendations endpoint', async () => {
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

test('PDP-COPY-BABIDI, PDP-DUPE-REDHANDED & PDP-SPEC-GAP: placeholder stripped, bag specs deduplicated, knit dress Materials extracted', async () => {
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

  const redHandedHtml = await engine.parseAndRender(pdpSource, {
    section: { id: 'pdp', settings: { eyebrow: 'Product' } },
    product: {
      id: 12,
      handle: 'red-handed-top-handle-bag',
      title: 'Red Handed Top Handle Bag',
      type: 'Bag',
      tags: [],
      price: 36500,
      description: '<p>Red Handed bag.</p><h3>Verified materials</h3><p>Exterior: Saffiano calfskin. Lining: suede microfibre.</p><h3>Dimensions</h3><p>28 × 20 × 11 cm. Finished product weight: 520 g.</p><h3>Origin</h3><p>Made in Italy. Production location: Florence, Italy.</p>',
      has_only_default_variant: true,
      selected_or_first_available_variant: { id: 121, price: 36500, available: true },
      variants: [{ id: 121, price: 36500, available: true, options: ['Default Title'] }],
      media: [],
      options_with_values: [],
      metafields: {
        custom: {
          material_composition: { value: 'Exterior: Saffiano Calfskin. Lining: Suede Microfibre. Hardware: Solid Brass, Palladium Finish.' },
          construction: { value: ['Exterior: Saffiano Calfskin.', 'Lining: Suede Microfibre.', 'Hardware: Solid Brass, Palladium Finish.', 'Dimensions: 28 × 20 × 11 cm.', 'Closure: Turn-Lock.', 'Finished product weight: 520 g.', 'Made in Italy; production location Florence, Italy.'] }
        },
        melato: {},
        fragrance: {}
      }
    }
  });
  assert.doesNotMatch(redHandedHtml, /<summary>Verified materials<\/summary>/);
  assert.match(redHandedHtml, /Closure: Turn-Lock\./);
  assert.doesNotMatch(redHandedHtml, /<summary>Construction<\/summary><div class="pdp-rte"><ul><li>Exterior: Saffiano Calfskin\./);

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
  assert.match(purljuryHtml, /<summary><span>Materials<\/span>/);
  assert.match(purljuryHtml, /95% cotton, 5% elastane/);
});

test('I18N-FR-UNTRANSLATED & SEO-FR-COL-META: French trust strip, cart, search, collections, and PDP filters localize cleanly', async () => {
  const fr = parseJson('locales/fr.json');
  const engine = createEngine({
    request: { locale: { iso_code: 'fr' }, path: '/fr' },
    routes: { root_url: '/fr', search_url: '/fr/search', cart_url: '/fr/cart', all_products_collection_url: '/fr/collections/all' },
    shop: { name: 'Melato', currency: 'CAD', enabled_payment_types: [] },
    settings: { font_size_base: 16, line_height_body: 1.5, color_accent: '#000', color_accent_hover: '#000', color_error: '#f00' },
    template: { name: 'collection' },
    collection: { handle: 'new-arrivals', title: 'New Arrivals', url: '/fr/collections/new-arrivals', products_count: 12, filters: [], products: [], default_sort_by: 'manual', sort_by: 'manual' }
  });
  engine.registerFilter('t', key => key.split('.').reduce((o, k) => o?.[k], fr) || key);

  const searchHtml = await engine.parseAndRender(read('sections/melato-main-search.liquid').split('{% schema %}')[0], {
    section: { id: 'search-fr' },
    search: { performed: true, results_count: 0, terms: 'xyznonexistent999', results: [] }
  });
  assert.match(searchHtml, /Rechercher chez Melato/);
  assert.match(searchHtml, /Aucun résultat pour « xyznonexistent999 »/);
  assert.match(searchHtml, /href="\/fr\/collections\/new-arrivals"/);
  assert.doesNotMatch(searchHtml, /\/frcollections\//);
  assert.doesNotMatch(searchHtml, /No results for/);

  const cartHtml = await engine.parseAndRender(read('sections/main-cart.liquid').split('{% schema %}')[0], {
    cart: { item_count: 0, items: [] }
  });
  assert.match(cartHtml, /Votre panier est vide/);
  assert.match(cartHtml, /DÉCOUVRIR LES NOUVEAUTÉS/);
  assert.match(cartHtml, /href="\/fr\/collections\/new-arrivals"/);
  assert.doesNotMatch(cartHtml, /Start with New Arrivals/);

  const colHtml = await engine.parseAndRender(read('sections/main-collection.liquid').split('{% schema %}')[0], {
    section: { id: 'col-fr', settings: { enable_filtering: true, enable_sorting: true, columns_desktop: 3, columns_mobile: 2, products_per_page: 24 } }
  });
  assert.match(colHtml, /<h1 class="melato-collection-title">Nouveautés<\/h1>/);
  assert.match(colHtml, /En vedette/);
  assert.match(colHtml, /Prix croissant/);
  assert.doesNotMatch(colHtml, /Price: low to high/);

  const themeSource = read('layout/theme.liquid');
  assert.match(themeSource, /Garanties d’achat/);
  assert.match(themeSource, /Livraison standard offerte/);
  assert.match(themeSource, /melato_fr_col_title/);

  const searchDrawerSource = read('snippets/search-drawer.liquid');
  assert.match(searchDrawerSource, /Rechercher chez Melato/);
  assert.match(searchDrawerSource, /if\(root\.charAt\(root\.length-1\)!=='\/'\)root\+\='\/'/);
});
