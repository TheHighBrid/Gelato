/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const { JSDOM } = require('jsdom');
const { rootedFiles } = require('../scripts/rooted-files.cjs');

const repoFiles = rootedFiles(path.resolve(__dirname, '..'));
const read = (file) => repoFiles.read(file, 'utf8');
const parseJson = (file) => JSON.parse(read(file).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const stripSchema = (source) => source.replace(/{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}/g, '');

function createEngine(globals = {}, localeData = null) {
  const dict = localeData || parseJson('locales/en.default.json');
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
        .on('template', (tpl) => this.templates.push(tpl))
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
        .on('template', (tpl) => this.templates.push(tpl))
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
        .on('template', (tpl) => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      emitter.write('<style>');
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      emitter.write('</style>');
    }
  });
  engine.registerFilter('t', (key) => key.split('.').reduce((o, k) => o?.[k], dict) || key);
  engine.registerFilter('money', (n) => `$${(Number(n || 0) / 100).toFixed(2)}`);
  engine.registerFilter('money_with_currency', (n) => `$${(Number(n || 0) / 100).toFixed(2)} CAD`);
  engine.registerFilter('json', (v) => JSON.stringify(v ?? null));
  engine.registerFilter('asset_url', (v) => `/assets/${v}`);
  engine.registerFilter('stylesheet_tag', (url) => `<link rel="stylesheet" href="${url}">`);
  engine.registerFilter('image_url', (v) => (typeof v === 'string' ? v : v?.src || 'https://melato.ca/cdn/shop/test.jpg'));
  engine.registerFilter('image_tag', (url, ...pairs) => {
    const args = Object.fromEntries(pairs.filter(Array.isArray));
    const attrs = [`src="${url}"`];
    if (args.class) attrs.push(`class="${args.class}"`);
    if (args.alt !== undefined && args.alt !== null) attrs.push(`alt="${args.alt}"`);
    if (args['aria-hidden']) attrs.push(`aria-hidden="${args['aria-hidden']}"`);
    return `<img ${attrs.join(' ')}>`;
  });
  engine.registerFilter('video_tag', () => '<video><source src="video.mp4"><img src="https://melato.ca/cdn/shop/files/preview_images/thumb.jpg"></video>');
  engine.registerFilter('payment_type_svg_tag', (t) => `<svg data-payment="${t}"></svg>`);
  engine.registerFilter('pluralize', (count, singular, plural) => (Number(count) === 1 ? singular : plural));
  engine.registerFilter('default_pagination', () => '');
  return engine;
}

test('AUTH-UNESCAPED-AMP-HEADER & NAV-COPY-POLISH: escapes &region_country=CA in Account/Login links and formats 10/11 nav numbers without leading 0', async () => {
  const loginUrl = 'https://melato.ca/customer_authentication/redirect?locale=en&region_country=CA';
  const menuLinks = Array.from({ length: 11 }, (_, idx) => ({
    title: idx === 9 ? 'Newsletter' : idx === 10 ? 'Editorial' : `Item ${idx + 1}`,
    url: `/pages/item-${idx + 1}`,
    active: false,
    links: []
  }));
  const engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/' },
    shop: { name: 'Melato', customer_accounts_enabled: true },
    routes: {
      root_url: '/',
      search_url: '/search',
      cart_url: '/cart',
      all_products_collection_url: '/collections/all',
      account_url: 'https://melato.ca/customer_authentication/redirect?locale=en&region_country=CA',
      account_login_url: loginUrl,
      account_register_url: loginUrl,
      account_recover_url: loginUrl
    },
    customer: null,
    cart: { item_count: 0 },
    linklists: { 'main-menu': { links: menuLinks } },
    section: { id: 'header', settings: { show_account: true, menu: { links: menuLinks } } },
    settings: {}
  });

  const headerHtml = await engine.parseAndRender(stripSchema(read('sections/melato-header.liquid')), {});
  assert.match(headerHtml, /href="https:\/\/melato\.ca\/customer_authentication\/redirect\?locale=en&amp;region_country=CA"/);
  assert.doesNotMatch(headerHtml, /&region_country=CA/);
  assert.match(headerHtml, /<span>09<\/span>/);
  assert.match(headerHtml, /<span>10<\/span>/);
  assert.match(headerHtml, /<span>11<\/span>/);
  assert.doesNotMatch(headerHtml, /<span>010<\/span>|<span>011<\/span>/);

  const mobileHtml = await engine.parseAndRender(read('snippets/mobile-menu.liquid'), {});
  assert.match(mobileHtml, /href="https:\/\/melato\.ca\/customer_authentication\/redirect\?locale=en&amp;region_country=CA"/);
  assert.doesNotMatch(mobileHtml, /&region_country=CA/);

  const registerHtml = await engine.parseAndRender(stripSchema(read('sections/main-register.liquid')), {});
  assert.match(registerHtml, /&amp;region_country=CA/);
  assert.doesNotMatch(registerHtml, /&region_country=CA/);

  const loginHtml = await engine.parseAndRender(stripSchema(read('sections/main-login.liquid')), {});
  assert.doesNotMatch(loginHtml, /&region_country=CA/);
});

test('SEO-DOUBLE-ESCAPED-TITLE-AND-HREFLANG: avoids &amp;amp; in homepage title/social tags, self-canonicalizes /fr, and emits noindex on /search', async () => {
  const en = parseJson('locales/en.default.json');
  const engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/' },
    shop: { name: 'Melato', url: 'https://melato.ca', secure_url: 'https://melato.ca', currency: 'CAD' },
    routes: { root_url: '/', search_url: '/search', cart_url: '/cart', all_products_collection_url: '/collections/all' },
    settings: { font_size_base: 16, line_height_body: 1.5, color_accent: '#000', color_accent_hover: '#000', color_error: '#f00' },
    template: { name: 'index' },
    current_page: 1,
    canonical_url: 'https://melato.ca/',
    page_title: en.melato_seo.home_title.replace('&', '&amp;')
  }, en);

  const headSource = read('layout/theme.liquid').split('</head>')[0] + '</head>';
  const homeHead = await engine.parseAndRender(headSource, {});
  assert.match(homeHead, /<title>Melato \| Designer Apparel, Accessories &amp; Fragrance<\/title>/);
  assert.match(homeHead, /property="og:title" content="Melato \| Designer Apparel, Accessories &amp; Fragrance"/);
  assert.match(homeHead, /name="twitter:title" content="Melato \| Designer Apparel, Accessories &amp; Fragrance"/);
  assert.doesNotMatch(homeHead, /&amp;amp;/);

  const searchEngine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/search' },
    shop: { name: 'Melato', url: 'https://melato.ca', secure_url: 'https://melato.ca', currency: 'CAD' },
    routes: { root_url: '/', search_url: '/search', cart_url: '/cart', all_products_collection_url: '/collections/all' },
    settings: { font_size_base: 16, line_height_body: 1.5, color_accent: '#000', color_accent_hover: '#000', color_error: '#f00' },
    template: { name: 'search' },
    current_page: 1,
    canonical_url: 'https://melato.ca/search?q=velour',
    page_title: 'Search'
  }, en);
  const searchHead = await searchEngine.parseAndRender(headSource, {});
  assert.match(searchHead, /<meta name="robots" content="noindex,follow">/);

  const arSearchEngine = createEngine({
    request: { locale: { iso_code: 'ar', primary: false, root_url: '/ar' }, path: '/ar/search' },
    shop: { name: 'Melato', url: 'https://melato.ca', secure_url: 'https://melato.ca', currency: 'CAD' },
    routes: { root_url: '/ar', search_url: '/ar/search', cart_url: '/ar/cart', all_products_collection_url: '/ar/collections/all' },
    settings: { font_size_base: 16, line_height_body: 1.5, color_accent: '#000', color_accent_hover: '#000', color_error: '#f00' },
    template: { name: 'search' },
    current_page: 1,
    canonical_url: 'https://melato.ca/ar/search?q=velour',
    page_title: 'Search'
  }, en);
  const arSearchHead = await arSearchEngine.parseAndRender(headSource, {});
  assert.equal((arSearchHead.match(/<meta name="robots" content="noindex,follow">/g) || []).length, 1);

  const frProductHead = await engine.parseAndRender(headSource, {
    template: { name: 'product' },
    request: { locale: { iso_code: 'fr', primary: false, root_url: '/fr' }, path: '/fr/products/purljury-knit-dress' },
    canonical_url: 'https://melato.ca/products/purljury-knit-dress',
    page_title: 'Purljury Knit Dress'
  });
  assert.match(frProductHead, /<link rel="canonical" href="https:\/\/melato\.ca\/fr\/products\/purljury-knit-dress">/);
});

test('PDP-PLACEHOLDER-COPY-SUNGLASSES & JSON-LD spacing: strips placeholder copy and adds space between stripped HTML blocks', async () => {
  const babidi = {
    id: 101,
    title: 'Babidi Sunglasses',
    handle: 'babidi-sunglasses',
    type: 'Sunglasses',
    url: '/products/babidi-sunglasses',
    price: 19500,
    available: true,
    featured_image: { src: 'https://melato.ca/babidi.jpg', alt: '' },
    featured_media: { id: 1, src: 'https://melato.ca/babidi.jpg', alt: '' },
    media: [{ id: 1, media_type: 'image', src: 'https://melato.ca/babidi.jpg', alt: '' }],
    has_only_default_variant: true,
    options: ['Title'],
    options_with_values: [],
    selected_or_first_available_variant: { id: 1001, title: 'Default Title', price: 19500, available: true, options: ['Default Title'] },
    variants: [{ id: 1001, title: 'Default Title', price: 19500, available: true, options: ['Default Title'] }],
    description: '<h2>Materials &amp; Composition</h2><p>Hand-polished Italian acetate frame; CR-39 OR polycarbonate UV400 lenses, final lens material not specified</p><h2>Fit &amp; Construction</h2><p>One size sculptural cat-eye frame.</p>',
    tags: [],
    metafields: {
      custom: {
        pdp_material_details: { value: ['Hand-polished Italian acetate frame; CR-39 OR polycarbonate UV400 lenses, final lens material not specified'] }
      }
    }
  };
  const engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/products/babidi-sunglasses' },
    shop: { name: 'Melato', url: 'https://melato.ca', currency: 'CAD', money_format: '${{amount}}' },
    cart: { currency: { iso_code: 'CAD' } },
    canonical_url: 'https://melato.ca/products/babidi-sunglasses',
    routes: { root_url: '/', all_products_collection_url: '/collections/all' },
    template: { name: 'product' },
    product: babidi,
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } }
  });

  const pdpHtml = await engine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.doesNotMatch(pdpHtml, /final lens material not specified/i);
  assert.match(pdpHtml, /Frame &amp; Lens Measurements/);

  const jsonldHtml = await engine.parseAndRender(read('snippets/melato-product-jsonld.liquid'), {});
  assert.doesNotMatch(jsonldHtml, /final lens material not specified/i);
  assert.match(jsonldHtml, /Materials &amp; Composition Hand-polished/);
  assert.match(jsonldHtml, /lenses Fit &amp; Construction One size/);
});

test('PDP-SCHEMA-AND-FIELD-INCONSISTENCY: purljury material promotion & single Fit guide, bag SSR heading & dedup, fragrance Story spacing & Volume legend', async () => {
  const baseGlobals = {
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/products/test' },
    shop: { name: 'Melato', url: 'https://melato.ca', currency: 'CAD', money_format: '${{amount}}' },
    cart: { currency: { iso_code: 'CAD' } },
    routes: { root_url: '/', all_products_collection_url: '/collections/all' },
    template: { name: 'product' },
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } }
  };

  const dress = {
    id: 201,
    title: 'Purljury Knit Dress',
    handle: 'purljury-knit-dress',
    type: 'Dress',
    price: 24500,
    available: true,
    featured_media: { id: 1, src: 'https://melato.ca/dress.jpg', alt: '' },
    media: [{ id: 1, media_type: 'image', src: 'https://melato.ca/dress.jpg', alt: '' }],
    has_only_default_variant: false,
    options: ['Size'],
    options_with_values: [{ name: 'Size', position: 1, selected_value: 'S', values: ['S', 'M'] }],
    selected_or_first_available_variant: { id: 2001, title: 'S', price: 24500, available: true, option1: 'S', options: ['S'] },
    variants: [{ id: 2001, title: 'S', price: 24500, available: true, option1: 'S', options: ['S'] }],
    description: '<p>Ribbed midi silhouette with straight hem.</p><h3>Details</h3><ul><li>Fine 1x1 rib knit</li><li>95% cotton, 5% elastane</li></ul>',
    tags: [],
    metafields: { custom: { fit_notes: { value: 'Body-contouring fit.' } } }
  };
  const dressEngine = createEngine({ ...baseGlobals, product: dress, canonical_url: 'https://melato.ca/products/purljury-knit-dress' });
  const dressHtml = await dressEngine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.match(dressHtml, /<span>Materials<\/span>[\s\S]*?95% cotton, 5% elastane/);
  assert.equal((dressHtml.match(/\/pages\/size-guide/g) || []).length, 1);
  assert.doesNotMatch(dressHtml, /Melato Fit Guide/);
  assert.match(dressHtml, /straight hem\. Details Fine 1x1/);

  const bag = {
    ...dress,
    id: 202,
    title: 'Red Handed Top Handle Bag',
    handle: 'red-handed-top-handle-bag',
    type: 'Handbag',
    has_only_default_variant: true,
    options: ['Title'],
    options_with_values: [],
    description: '<p>Structured leather top-handle bag.</p><h3>Verified materials</h3><p>Exterior: 100% calf leather. Lining: suede.</p><h3>Origin</h3><p>Made in Italy.</p>',
    metafields: {
      custom: {
        material_composition: { value: '100% full-grain calf leather; suede lining; gold-tone brass hardware.' },
        fit_notes: { value: '28 x 20 x 11 cm; 520 g; fits phone, wallet, and keys.' },
        construction: { value: ['Exterior: 100% calf leather.', 'Lining: suede.', 'Hardware: brass.', 'Dimensions: 28 x 20 x 11 cm.', 'Finished product weight: 520 g.', 'Made in Italy.', 'Hand-painted edges.'] }
      }
    }
  };
  const bagEngine = createEngine({ ...baseGlobals, product: bag, canonical_url: 'https://melato.ca/products/red-handed-top-handle-bag' });
  const bagHtml = await bagEngine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.match(bagHtml, /<span>Dimensions &amp; Capacity<\/span>/);
  assert.doesNotMatch(bagHtml, /<span>Fit<\/span>/);
  assert.doesNotMatch(bagHtml, /Melato Fit Guide/);
  const constructionMatch = bagHtml.match(/<summary>Construction<\/summary>([\s\S]*?)<\/details>/);
  assert.ok(constructionMatch, 'Construction details should render');
  assert.match(constructionMatch[1], /Hand-painted edges\./);
  assert.doesNotMatch(constructionMatch[1], /(Exterior:|Lining:|Hardware:|520 g|Made in Italy)/);

  const fragrance = {
    ...dress,
    id: 203,
    title: 'Obsidian Coast Eau de Parfum',
    handle: 'obsidian-coast-eau-de-parfum',
    type: 'Fragrance',
    options: ['Size'],
    options_with_values: [{ name: 'Size', position: 1, selected_value: '100 mL', values: ['100 mL'] }],
    description: '<p>Mineral bergamot over clean skin.</p><p>Obsidian Coast settles into dry cedar and ambroxan.</p>',
    metafields: { custom: {} }
  };
  const fragEngine = createEngine({ ...baseGlobals, product: fragrance, canonical_url: 'https://melato.ca/products/obsidian-coast-eau-de-parfum' });
  const fragHtml = await fragEngine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.match(fragHtml, /clean skin\. Obsidian Coast settles/);
  assert.match(fragHtml, /<legend>Volume<\/legend>/);
  assert.doesNotMatch(fragHtml, /<legend>Size<\/legend>/);
});

test('MERCH-EMPTY-RECOMMENDATIONS-AND-CART-CURRENCY: hides empty recs, removes scrollY gate, adds CAD to populated /cart, deduplicates /fr/cart', async () => {
  const relatedSource = stripSchema(read('sections/related-products.liquid'));
  const emptyRecEngine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' } },
    routes: { product_recommendations_url: '/recommendations/products' },
    collections: { 'new-arrivals': { products: [] }, 'best-sellers': { products: [] } },
    recommendations: { performed: false, products: [] },
    product: { id: 301, type: 'Trench', metafields: { custom: {} } },
    section: { id: 'related', settings: { eyebrow: 'Continue shopping', products_to_show: 4 } }
  });
  const ssrEmptyHtml = await emptyRecEngine.parseAndRender(relatedSource, {});
  assert.match(ssrEmptyHtml, /<section[^>]*class="melato-related[^"]*"[^>]*\bhidden\b/);

  const apiEmptyHtml = await emptyRecEngine.parseAndRender(relatedSource, {
    recommendations: { performed: true, products: [] }
  });
  assert.doesNotMatch(apiEmptyHtml, /<section[^>]*melato-related/);

  const upgradesJs = read('assets/melato-audit-upgrades.js');
  assert.doesNotMatch(upgradesJs, /scrollY\s*>\s*150/);
  const dom = new JSDOM('<section class="melato-related"><product-recommendations data-url="/recommendations/products"></product-recommendations></section>', {
    url: 'https://melato.ca/products/atlas-woven-duffle',
    runScripts: 'outside-only'
  });
  dom.window.scrollY = 600;
  dom.window.fetch = async () => ({
    ok: true,
    text: async () => '<product-recommendations></product-recommendations>'
  });
  dom.window.eval(upgradesJs);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(dom.window.document.querySelector('section.melato-related').hidden, true);
  dom.window.close();

  const en = parseJson('locales/en.default.json');
  const cartEngine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' } },
    cart: {
      item_count: 1,
      total_price: 17998,
      items: [{
        key: '1:abc',
        url: '/products/ojos-velour-track-jacket',
        image: 'https://melato.ca/ojos.jpg',
        product: { title: 'Ojos Velour Track Jacket' },
        variant: { title: 'S' },
        quantity: 1,
        final_line_price: 17998
      }]
    }
  }, en);
  const populatedCartHtml = await cartEngine.parseAndRender(stripSchema(read('sections/main-cart.liquid')), {});
  assert.match(populatedCartHtml, /\$179\.98 CAD/);

  const fr = parseJson('locales/fr.json');
  const frCartEngine = createEngine({
    request: { locale: { iso_code: 'fr', primary: false, root_url: '/fr' } },
    routes: { root_url: '/fr', collections_url: '/fr/collections' },
    collections: { 'best-sellers': { products: [], products_count: 0 }, all: { products: [], products_count: 0 } },
    shop: { enabled_payment_types: [] },
    cart: { item_count: 0, items: [] }
  }, fr);
  const frEmptyCartHtml = await frCartEngine.parseAndRender(stripSchema(read('sections/main-cart.liquid')), {});
  assert.match(frEmptyCartHtml, /Votre panier est vide/);
  assert.doesNotMatch(frEmptyCartHtml, /Your cart/);
});

test('A11Y-MISSING-ALT-HOMEPAGE & NAV-COPY-POLISH: hero-video, brand-story alt hygiene and /collections/rack <h1>', async () => {
  const engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' } },
    template: { name: 'index' },
    routes: { all_products_collection_url: '/collections/all', root_url: '/' },
    section: {
      id: 'hero-1',
      settings: {
        shopify_video: 'video.mp4',
        loop_video: true,
        hero_height: 'full',
        overlay_opacity: 40,
        content_position: 'left',
        content_width: 680,
        image: { src: 'https://melato.ca/story.jpg', alt: '' },
        heading: 'MELATO, IN CONTEXT'
      },
      blocks: []
    }
  });
  const heroHtml = await engine.parseAndRender(stripSchema(read('sections/hero-video.liquid')), {});
  assert.match(heroHtml, /<img alt="" src="https:\/\/melato\.ca\/cdn\/shop\/files\/preview_images\/thumb\.jpg">/);

  const brandHtml = await engine.parseAndRender(stripSchema(read('sections/brand-story.liquid')), {});
  assert.match(brandHtml, /alt="MELATO, IN CONTEXT"/);

  const rackSource = stripSchema(read('sections/melato-rack.liquid'));
  const rackCollectionHtml = await engine.parseAndRender(rackSource, {
    template: { name: 'collection' },
    collection: { title: 'Rack', url: '/collections/rack', products_count: 0, products: [] }
  });
  assert.match(rackCollectionHtml, /<h1 class="mrack__heading">/);

  const rackHomeHtml = await engine.parseAndRender(rackSource, {
    template: { name: 'index' },
    collection: { title: 'Rack', url: '/collections/rack', products_count: 0, products: [] }
  });
  assert.match(rackHomeHtml, /<h2 class="mrack__heading">/);
  assert.doesNotMatch(rackHomeHtml, /<h1 class="mrack__heading">/);
});

test('LOCALE-FR-REDIRECT-AND-UNTRANSLATED: translates /fr PDP eyebrow, /fr collection chrome, and /fr search page', async () => {
  const fr = parseJson('locales/fr.json');
  const engine = createEngine({
    request: { locale: { iso_code: 'fr', primary: false, root_url: '/fr' }, path: '/fr/collections/tracksuits' },
    routes: { root_url: '/fr', search_url: '/fr/search', all_products_collection_url: '/fr/collections/all' },
    shop: { name: 'Melato', currency: 'CAD', money_format: '${{amount}}' },
    cart: { currency: { iso_code: 'CAD' } },
    template: { name: 'collection' },
    collection: {
      handle: 'tracksuits',
      title: 'Tracksuits',
      url: '/fr/collections/tracksuits',
      products_count: 2,
      sort_by: 'manual',
      default_sort_by: 'manual',
      filters: [],
      products: []
    },
    linklists: { 'main-menu': { links: [{ title: 'Tracksuits', url: '/fr/collections/tracksuits', links: [] }] } },
    section: { id: 'col', settings: { enable_filtering: true, enable_sorting: true, columns_desktop: 3, columns_mobile: 2, products_per_page: 24 } }
  }, fr);

  const colHtml = await engine.parseAndRender(stripSchema(read('sections/main-collection.liquid')), {});
  assert.match(colHtml, /<h1 class="melato-collection-title">Survêtements<\/h1>/);
  assert.match(colHtml, /<span>Filtrer<\/span>/);
  assert.match(colHtml, /<label for="melato-sort-select" class="visually-hidden">Trier par<\/label>/);
  assert.match(colHtml, /Afficher les résultats/);
  assert.match(colHtml, /Tout voir/);

  const pdpSource = stripSchema(read('sections/melato-product-page-rebuild.liquid'));
  const frPdpHtml = await engine.parseAndRender(pdpSource, {
    template: { name: 'product' },
    product: {
      id: 401,
      title: 'Coat of Silence Gloss Trench',
      handle: 'coat-of-silence-gloss-trench',
      type: 'Trench',
      price: 54900,
      available: true,
      featured_media: { id: 1, src: 'https://melato.ca/trench.jpg', alt: '' },
      media: [{ id: 1, media_type: 'image', src: 'https://melato.ca/trench.jpg', alt: '' }],
      has_only_default_variant: true,
      options: ['Title'],
      options_with_values: [],
      selected_or_first_available_variant: { id: 4001, title: 'Default Title', price: 54900, available: true, options: ['Default Title'] },
      variants: [{ id: 4001, title: 'Default Title', price: 54900, available: true, options: ['Default Title'] }],
      description: '<p>Glossy trench coat.</p>',
      tags: [],
      metafields: { custom: { material_composition: { value: '100% cotton' } } }
    },
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } }
  });
  assert.match(frPdpHtml, /<p class="pdp-eyebrow">Focus produit<\/p>/);
  assert.match(frPdpHtml, /Ajouter au panier/);
  assert.match(frPdpHtml, /<span>Matières<\/span>/);
  assert.match(frPdpHtml, /href="\/fr\/pages\/shipping-returns"/);

  const frSearchHtml = await engine.parseAndRender(stripSchema(read('sections/melato-main-search.liquid')), {
    search: { performed: true, results_count: 0, terms: 'zzz', results: [] }
  });
  assert.match(frSearchHtml, /Rechercher chez Melato/);
  assert.match(frSearchHtml, /Aucun résultat pour/);
});
