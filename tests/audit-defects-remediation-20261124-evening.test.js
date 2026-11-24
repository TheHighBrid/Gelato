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
    return `<img ${attrs.join(' ')}>`;
  });
  return engine;
}

test('A11Y-CTS-EMPTY-ALT: Complete the Set thumbnails render non-empty alt attributes directly in canonical PDP section', async () => {
  const jacket = {
    id: 101,
    title: 'Shell Company Technical Track Jacket',
    handle: 'shell-company-technical-track-jacket',
    type: 'Track Jacket',
    url: '/products/shell-company-technical-track-jacket',
    price: 13999,
    available: true,
    featured_image: { src: 'https://melato.ca/jacket.jpg', alt: '' },
    featured_media: { id: 1, src: 'https://melato.ca/jacket.jpg', alt: '' },
    media: [{ id: 1, media_type: 'image', src: 'https://melato.ca/jacket.jpg', alt: '' }],
    has_only_default_variant: true,
    options: ['Title'],
    options_with_values: [],
    selected_or_first_available_variant: { id: 1001, title: 'Default Title', price: 13999, available: true, options: ['Default Title'] },
    variants: [{ id: 1001, title: 'Default Title', price: 13999, available: true, options: ['Default Title'] }],
    description: '<p>Technical track jacket.</p>',
    tags: [],
    metafields: { custom: {} }
  };
  const pant = {
    id: 102,
    title: 'Shell Company Technical Track Pant',
    handle: 'shell-company-technical-track-pant',
    type: 'Track Pant',
    url: '/products/shell-company-technical-track-pant',
    price: 11999,
    featured_image: { src: 'https://melato.ca/pant.jpg', alt: '' },
    variants: [{ id: 1002, title: 'Default Title', price: 11999, available: true }],
    selected_or_first_available_variant: { id: 1002, title: 'Default Title', price: 11999, available: true },
    metafields: { custom: {} }
  };
  jacket.metafields.custom.companion_product = { value: pant };

  const engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: jacket.url },
    shop: { name: 'Melato', url: 'https://melato.ca', currency: 'CAD', money_format: '${{amount}}' },
    cart: { currency: { iso_code: 'CAD' } },
    canonical_url: `https://melato.ca${jacket.url}`,
    routes: { root_url: '/', all_products_collection_url: '/collections/all' },
    template: { name: 'product' },
    product: jacket,
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } }
  });

  const html = await engine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  const doc = new JSDOM(html).window.document;
  const setImgs = [...doc.querySelectorAll('.pdp-set-image')];
  assert.equal(setImgs.length, 2);
  for (const img of setImgs) {
    assert.ok(img.getAttribute('alt') && img.getAttribute('alt').trim().length > 0, 'Complete the Set thumbnail alt must be non-empty');
  }
  assert.equal(setImgs[0].getAttribute('alt'), 'Shell Company Technical Track Jacket - Front view');
  assert.equal(setImgs[1].getAttribute('alt'), 'Shell Company Technical Track Pant - Front view');
});

test('PDP-COPY-PLACEHOLDERS-GAPS: Atlas Dopp Kit and travel pouches use Dimensions & Capacity without Fit Guide', async () => {
  const doppKit = {
    id: 201,
    title: 'Atlas Dopp Kit',
    handle: 'atlas-dopp-kit',
    type: 'Travel',
    url: '/products/atlas-dopp-kit',
    price: 6999,
    available: true,
    featured_image: { src: 'https://melato.ca/dopp.jpg', alt: 'Atlas Dopp Kit' },
    featured_media: { id: 1, src: 'https://melato.ca/dopp.jpg', alt: 'Atlas Dopp Kit' },
    media: [{ id: 1, media_type: 'image', src: 'https://melato.ca/dopp.jpg', alt: 'Atlas Dopp Kit' }],
    has_only_default_variant: true,
    options: ['Title'],
    options_with_values: [],
    selected_or_first_available_variant: { id: 2001, title: 'OS', price: 6999, available: true, options: ['OS'] },
    variants: [{ id: 2001, title: 'OS', price: 6999, available: true, options: ['OS'] }],
    description: '<p>A structured toiletry and essentials pouch.</p><h3>Fit</h3><p>One-size compact kit.</p>',
    tags: [],
    metafields: { custom: { material_composition: { value: 'Coated monogram canvas face.' } } }
  };

  const baseGlobals = {
    shop: { name: 'Melato', url: 'https://melato.ca', currency: 'CAD', money_format: '${{amount}}' },
    cart: { currency: { iso_code: 'CAD' } },
    canonical_url: 'https://melato.ca/products/atlas-dopp-kit',
    routes: { root_url: '/', all_products_collection_url: '/collections/all' },
    template: { name: 'product' },
    product: doppKit,
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } }
  };

  const enEngine = createEngine({ ...baseGlobals, request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: doppKit.url } });
  const enHtml = await enEngine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.match(enHtml, /data-pdp-family="bags"/);
  assert.match(enHtml, /<span>Dimensions &amp; Capacity<\/span>/);
  assert.doesNotMatch(enHtml, /<span>Fit<\/span>/);
  assert.doesNotMatch(enHtml, /Melato Fit Guide/);
  assert.doesNotMatch(enHtml, /<p>One-size compact kit\.<\/p>/);

  const frEngine = createEngine({ ...baseGlobals, request: { locale: { iso_code: 'fr', primary: false, root_url: '/fr' }, path: `/fr${doppKit.url}` } });
  const frHtml = await frEngine.parseAndRender(stripSchema(read('sections/melato-product-page-rebuild.liquid')), {});
  assert.match(frHtml, /<span>Dimensions et capacité<\/span>/);
  assert.doesNotMatch(frHtml, /Guide des tailles Melato/);
});

test('SEO-EMPTY-RACK-COLLECTION: rack-1 emits noindex,follow while rack remains indexable, and empty rack copy is shopper-safe', async () => {
  const jsonldSource = read('snippets/melato-global-jsonld.liquid');
  const rack1Engine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/collections/rack-1', origin: 'https://melato.ca' },
    shop: { name: 'Melato', url: 'https://melato.ca' },
    routes: { search_url: '/search' },
    template: { name: 'collection' },
    collection: { handle: 'rack-1', title: 'rack', description: '', products_count: 0, products: [] },
    canonical_url: 'https://melato.ca/collections/rack-1',
    page_title: 'rack'
  });
  const rack1Head = await rack1Engine.parseAndRender(jsonldSource, {});
  assert.match(rack1Head, /<meta name="robots" content="noindex,follow">/);

  const rackEngine = createEngine({
    request: { locale: { iso_code: 'en', primary: true, root_url: '/' }, path: '/collections/rack', origin: 'https://melato.ca' },
    shop: { name: 'Melato', url: 'https://melato.ca' },
    routes: { search_url: '/search' },
    template: { name: 'collection' },
    collection: { handle: 'rack', title: 'Rack', description: '', products_count: 10, products: [] },
    canonical_url: 'https://melato.ca/collections/rack',
    page_title: 'Rack'
  });
  const rackHead = await rackEngine.parseAndRender(jsonldSource, {});
  assert.doesNotMatch(rackHead, /<meta name="robots" content="noindex,follow">/);

  const en = parseJson('locales/en.default.json');
  const fr = parseJson('locales/fr.json');
  assert.doesNotMatch(en.melato_rack.empty, /Choose a collection with garment views to fill this rack/i);
  assert.doesNotMatch(fr.melato_rack.empty, /Choisissez une collection avec des vues/i);
});

test('LOC-FR-UNTRANSLATED-POLICIES-PAGES: French service templates and FAQPage JSON-LD localize headings and fallbacks', async () => {
  const frGlobals = {
    request: { locale: { iso_code: 'fr', primary: false, root_url: '/fr' }, path: '/fr/pages/shipping-returns', origin: 'https://melato.ca' },
    shop: { name: 'Melato', url: 'https://melato.ca' },
    routes: { search_url: '/fr/search' },
    template: { name: 'page' },
    canonical_url: 'https://melato.ca/fr/pages/shipping-returns',
    page_title: 'Livraison et retours',
    page: { handle: 'shipping-returns', title: 'Livraison et retours', content: '<h1>Shipping & Returns</h1><p>Body</p>' }
  };

  const frEngine = createEngine(frGlobals);
  const shippingHtml = await frEngine.parseAndRender(read('templates/page.shipping-returns.liquid'), {});
  assert.match(shippingHtml, /<h1[^>]*>Livraison et retours<\/h1>/);
  assert.doesNotMatch(shippingHtml, />Shipping &amp; Returns<\/h1>/);

  const sizeGuideHtml = await frEngine.parseAndRender(read('templates/page.size-guide.liquid'), {
    page: { handle: 'size-guide', title: 'Guide des tailles', content: '' }
  });
  assert.match(sizeGuideHtml, /<h1[^>]*>Guide des tailles<\/h1>/);
  assert.match(sizeGuideHtml, /support@melato\.ca/);

  const faqJsonLd = await frEngine.parseAndRender(read('snippets/melato-global-jsonld.liquid'), {
    page: { handle: 'faq', title: 'FAQ', content: '' }
  });
  assert.match(faqJsonLd, /Combien de temps prend la préparation d’une commande/);
  assert.doesNotMatch(faqJsonLd, /How long does order processing take\?/);
});
