const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { Liquid } = require('liquidjs');
const { JSDOM } = require('jsdom');
const { rootedFiles } = require('../scripts/rooted-files.cjs');

const repoFiles = rootedFiles(path.resolve(__dirname, '..'));

function read(file) {
  return repoFiles.read(file, 'utf8');
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
  engine.registerTag('form', {
    parse(tagToken, remain) {
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain);
      stream
        .on('tag:endform', () => stream.stop())
        .on('template', tpl => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      emitter.write('<form action="/cart/add" method="post" class="pdp-form">');
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      emitter.write('</form>');
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
  engine.registerFilter('money', n => `$${(Number(n) / 100).toFixed(2)}`);
  engine.registerFilter('money_with_currency', n => `$${(Number(n) / 100).toFixed(2)} CAD`);
  engine.registerFilter('json', v => JSON.stringify(v ?? null));
  engine.registerFilter('image_url', () => 'https://melato.ca/cdn/shop/test.jpg');
  engine.registerFilter('image_tag', (_url, args) => `<img class="${args.class || ''}" alt="${args.alt ?? ''}">`);
  engine.registerFilter('pluralize', (count, singular, plural) => (Number(count) === 1 ? singular : plural));
  engine.registerFilter('t', key => {
    const parseLocale = file => JSON.parse(read(file).replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    const fr = parseLocale('locales/fr.json');
    const en = parseLocale('locales/en.default.json');
    const parts = String(key).split('.');
    let cur = en;
    for (const p of parts) cur = cur?.[p];
    let frCur = fr;
    for (const p of parts) frCur = frCur?.[p];
    return frCur || cur || key;
  });
  return engine;
}

test('CONVERSION-MOBILE-STICKY-ATC-OCCLUSION & UX-HEADER-BAG-ACCOUNT-OVERLAP-DESKTOP: CSS excludes pill buttons from 42px width and clears sticky ATC / drawers', () => {
  const coreCss = read('assets/melato-core.css');
  const tailCss = read('assets/melato-storefront-tail.css');
  const visibilityCss = read('assets/melato-visibility-fixes-202611.css');

  for (const css of [coreCss, tailCss]) {
    assert.match(css, /a\[href="\/cart"\]:not\(\.mxh__bag\):not\(\.cart-drawer__view-cart\):not\(\.melato-cart-cta\)/);
  }

  assert.match(visibilityCss, /body:has\(#bv-chat-frame,\s*\[id\^="bv-chat"\]\)\s*#melato-ai-concierge/);
  assert.match(visibilityCss, /body:has\(\.cart-drawer\.is-open[^)]*\)\s*#bv-chat-frame/);
  assert.match(visibilityCss, /body\.template-product:has\(\.pdp-sticky-atc\.is-visible\)\s*#bv-chat-frame/);
  assert.match(visibilityCss, /\.mxh\s+\.mxh__bag\s*\{[^}]*width:\s*auto\s*!important;[^}]*white-space:\s*nowrap\s*!important/s);
  assert.match(visibilityCss, /\.cart-drawer__view-cart\s*\{[^}]*width:\s*100%\s*!important;[^}]*white-space:\s*nowrap\s*!important/s);
});

test('CONVERSION-MOBILE-STICKY-ATC-OCCLUSION: concierge widget suppresses itself when external #bv-chat-frame is present', () => {
  const dom = new JSDOM('<!doctype html><html><body><iframe id="bv-chat-frame"></iframe></body></html>', { url: 'https://melato.ca/' });
  const context = {
    window: dom.window,
    document: dom.window.document,
    MutationObserver: dom.window.MutationObserver,
    setTimeout,
    clearTimeout,
    console
  };
  vm.runInNewContext(read('assets/melato-ai-concierge-widget.js'), context);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  assert.equal(dom.window.document.getElementById('melato-ai-concierge'), null);
});

test('LUXURY-DYNAMIC-ANNOUNCEMENT-CONTRAST-CLIP: contrast guard repairs illegible Ojos and Coat of Silence palettes and unclips mobile height', () => {
  const visibilityCss = read('assets/melato-visibility-fixes-202611.css');
  assert.match(visibilityCss, /@media\s*\(max-width:\s*989px\)[^}]*#melato-announcement-bar\.melato-ann\s*\{[^}]*height:\s*auto\s*!important;/s);
  assert.match(visibilityCss, /#melato-announcement-bar\.melato-ann\s+\.melato-ann__viewport\s*\{[^}]*overflow:\s*visible\s*!important/s);

  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="melato-announcement-bar" class="melato-ann" style="--ab-bg:#000000;--ab-fg:#7C091B;--ab-btn-bg:#7C091B;--ab-btn-fg:#000000">
      <div class="melato-ann__viewport"><div class="melato-ann__track"><div class="melato-ann__group">
        <span class="melato-ann__item"><span>Complimentary standard delivery</span></span>
      </div></div></div>
    </div>
  </body></html>`, { url: 'https://melato.ca/products/ojos-velour-track-jacket' });

  const context = {
    window: dom.window,
    document: dom.window.document,
    MutationObserver: dom.window.MutationObserver,
    URL: dom.window.URL,
    console
  };
  context.window.requestAnimationFrame = fn => fn();
  vm.runInNewContext(read('assets/melato-audit-nav-collections.js'), context);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

  const bar = dom.window.document.getElementById('melato-announcement-bar');
  assert.equal(bar.style.getPropertyValue('--ab-fg'), '#fff7ea');

  bar.style.setProperty('--ab-bg', '#CDD3DA');
  bar.style.setProperty('--ab-fg', '#535E6B');
  context.window.MelatoNavNormalize(dom.window.document);
  assert.equal(bar.style.getPropertyValue('--ab-fg'), '#111111');
});

test('SEO-TITLE-DOUBLE-ESCAPE-AND-HREFLANG-EN-FR: theme.liquid avoids double-escaping &amp; in title tags', () => {
  const themeLiquid = read('layout/theme.liquid');
  assert.match(themeLiquid, /<title>\{\{\s*melato_meta_title\s*\|\s*replace:\s*'&amp;',\s*'&'\s*\|\s*escape\s*\}\}/);
  assert.match(themeLiquid, /property="og:title"\s+content="\{\{\s*melato_meta_title\s*\|\s*replace:\s*'&amp;',\s*'&'\s*\|\s*escape\s*\}\}"/);
  assert.match(themeLiquid, /name="twitter:title"\s+content="\{\{\s*melato_meta_title\s*\|\s*replace:\s*'&amp;',\s*'&'\s*\|\s*escape\s*\}\}"/);
});

test('LOCALIZATION-FR-UNTRANSLATED-CORE-SURFACES: collection tabs, main collection, and search render French copy on /fr', async () => {
  const engine = createEngine({
    routes: {
      root_url: '/fr',
      search_url: '/fr/search',
      all_products_collection_url: '/fr/collections/all'
    },
    request: { locale: { iso_code: 'fr' } },
    linklists: {
      'main-menu': {
        links: [
          { title: '01 New Arrivals', url: '/fr/collections/new-arrivals', links: [] },
          { title: '02 Tracksuits', url: '/fr/collections/tracksuits', links: [] },
          { title: '03 Eve’s Wardrobe', url: '/fr/collections/eves-wardrobe', links: [] }
        ]
      }
    }
  });

  const tabsHtml = await engine.parseAndRender(read('snippets/melato-collection-tabs.liquid'), {
    collection: { handle: 'all', url: '/fr/collections/all' }
  });
  assert.match(tabsHtml, />Tout voir</);
  assert.match(tabsHtml, />01 Nouveautés</);
  assert.match(tabsHtml, />02 Survêtements</);
  assert.match(tabsHtml, />03 Le vestiaire d’Eve</);

  const collectionSource = read('sections/main-collection.liquid').split('{% schema %}')[0];
  const collectionHtml = await engine.parseAndRender(collectionSource, {
    section: { settings: { columns_desktop: 3, columns_mobile: 2, products_per_page: 24, enable_filtering: true, enable_sorting: true } },
    collection: {
      handle: 'all',
      title: 'All products',
      url: '/fr/collections/all',
      products_count: 114,
      default_sort_by: 'manual',
      filters: [],
      products: []
    }
  });
  assert.match(collectionHtml, /L’INDEX MELATO/);
  assert.match(collectionHtml, /<span>Filtrer<\/span>/);
  assert.match(collectionHtml, /114 articles/);
  assert.match(collectionHtml, />Meilleures ventes</);
  assert.match(collectionHtml, />Afficher les résultats</);

  const searchSource = read('sections/melato-main-search.liquid').split('{% schema %}')[0];
  const searchHtml = await engine.parseAndRender(searchSource, {
    section: { id: 'search-fr' },
    search: { performed: true, results_count: 0, terms: 'xyz', results: [] }
  });
  assert.match(searchHtml, /Rechercher chez Melato/);
  assert.match(searchHtml, /Aucun résultat pour « xyz »/);
  assert.match(searchHtml, /href="\/fr\/collections\/new-arrivals"/);
});

test('PDP-BIBLE-SPEC-GAPS-AND-DUPLICATION: Red Handed deduplicates specs, Purljury surfaces Materials, Babidi strips draft leak', async () => {
  const engine = createEngine({
    routes: { root_url: '/' },
    request: { locale: { iso_code: 'en' } },
    shop: { currency: 'CAD', money_format: '${{amount}}' }
  });
  const rebuildSource = read('sections/melato-product-page-rebuild.liquid').split('{% schema %}')[0];

  const bagHtml = await engine.parseAndRender(rebuildSource, {
    section: { id: 'pdp-bag', settings: { eyebrow: 'Product focus', surface: '#111214', accent: '#9e1824', accent_2: '#d3a74a', text: '#f5f1e8' } },
    product: {
      title: 'Red Handed Top Handle Bag',
      handle: 'red-handed-top-handle-bag',
      type: 'Handbag',
      tags: [],
      price: 36500,
      has_only_default_variant: true,
      options_with_values: [],
      variants: [{ id: 1, title: 'Default Title', price: 36500, available: true, options: ['Default Title'] }],
      selected_or_first_available_variant: { id: 1, title: 'Default Title', price: 36500, available: true, options: ['Default Title'] },
      description: '<p>A structured top-handle bag.</p><h3>Verified materials</h3><p>Exterior: Saffiano calfskin. Lining: suede microfibre.</p><h3>Dimensions</h3><p>28 × 20 × 11 cm. Finished product weight: 520 g.</p><h3>Origin</h3><p>Made in Italy. Production location: Florence, Italy.</p>',
      metafields: {
        custom: {
          material_composition: { value: 'Exterior: Saffiano Calfskin.\nLining: Suede Microfibre.\nHardware: Solid Brass, Palladium Finish.' },
          fit_notes: { value: 'One size. Designed for hand carry.' },
          care_instructions: { value: 'Use a leather specialist.' },
          made_in: { value: 'Italy' },
          construction: {
            value: [
              'Exterior: Saffiano Calfskin.',
              'Lining: Suede Microfibre.',
              'Hardware: Solid Brass, Palladium Finish.',
              'Dimensions: 28 × 20 × 11 cm.',
              'Closure: Turn-Lock.',
              'Finished product weight: 520 g.',
              'Made in Italy; production location Florence, Italy.'
            ]
          }
        }
      }
    }
  });
  assert.doesNotMatch(bagHtml, /<summary>Verified materials<\/summary>/);
  assert.match(bagHtml, /<summary>Dimensions<\/summary>/);
  assert.match(bagHtml, /<summary>Origin<\/summary>/);
  assert.match(bagHtml, /<li>Closure: Turn-Lock\.<\/li>/);
  assert.doesNotMatch(bagHtml, /<li>Dimensions: 28 × 20 × 11 cm\.<\/li>/);

  const dressHtml = await engine.parseAndRender(rebuildSource, {
    section: { id: 'pdp-dress', settings: { eyebrow: 'Product focus', surface: '#111214', accent: '#9e1824', accent_2: '#d3a74a', text: '#f5f1e8' } },
    product: {
      title: 'Purljury Knit Dress',
      handle: 'purljury-knit-dress',
      type: 'Dress',
      tags: [],
      price: 24500,
      has_only_default_variant: true,
      options_with_values: [],
      variants: [{ id: 2, title: 'Default Title', price: 24500, available: true, options: ['Default Title'] }],
      selected_or_first_available_variant: { id: 2, title: 'Default Title', price: 24500, available: true, options: ['Default Title'] },
      description: '<p>Ribbed knit midi dress.</p><h3>Details</h3><ul><li>Fine 1×1 rib knit, 280 gsm</li><li>Mock neck and long sleeves</li><li>95% cotton, 5% elastane</li></ul>',
      metafields: {
        custom: {
          fit_notes: { value: 'Form-fitting.' },
          care_instructions: { value: 'Machine wash inside out at 30°C.' }
        }
      }
    }
  });
  assert.match(dressHtml, /<span>Materials<\/span>/);
  assert.match(dressHtml, /95% cotton, 5% elastane/);
  assert.match(dressHtml, /Mock neck and long sleeves/);

  const babidiHtml = await engine.parseAndRender(rebuildSource, {
    section: { id: 'pdp-eyewear', settings: { eyebrow: 'Product focus', surface: '#111214', accent: '#9e1824', accent_2: '#d3a74a', text: '#f5f1e8' } },
    product: {
      title: 'Babidi Sunglasses',
      handle: 'babidi-sunglasses',
      type: 'Sunglasses',
      tags: [],
      price: 19500,
      has_only_default_variant: true,
      options_with_values: [],
      variants: [{ id: 3, title: 'Default Title', price: 19500, available: true, options: ['Default Title'] }],
      selected_or_first_available_variant: { id: 3, title: 'Default Title', price: 19500, available: true, options: ['Default Title'] },
      description: '<p>Acetate sunglasses.</p>',
      metafields: {
        custom: {
          pdp_material_details: { value: ['Hand-polished Italian acetate frame; CR-39 OR polycarbonate UV400 lenses, final lens material not specified'] }
        }
      }
    }
  });
  assert.doesNotMatch(babidiHtml, /final lens material not specified/);
});

test('NAV-DUPLICATE-COLLECTION-FILTER-LABELS: taxonomy category filter rows deduplicate Eve’s Wardrobe and Tops cleanly', () => {
  const dom = new JSDOM(`<!doctype html><html><body class="template-collection">
    <div id="melato-filter-drawer">
      <section class="melato-filter-group" data-filter-group="filter.p.t.category">
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-2__aa-1-25-9-2" data-filter-input><span>Bodysuits</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-4" data-filter-input><span>Dresses</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-15" data-filter-input><span>Skirts</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-6" data-filter-input><span>Polos</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-7" data-filter-input><span>Shirts</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-8__aa-1-25-9-7" data-filter-input><span>T-Shirts</span></label>
      </section>
    </div>
  </body></html>`, { url: 'https://melato.ca/collections/all' });

  const context = {
    window: dom.window,
    document: dom.window.document,
    NodeFilter: dom.window.NodeFilter,
    MutationObserver: dom.window.MutationObserver,
    URLSearchParams: dom.window.URLSearchParams,
    setTimeout,
    clearTimeout,
    console
  };
  vm.runInNewContext(read('assets/melato-optimization-2026.js'), context);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

  const visibleLabels = Array.from(dom.window.document.querySelectorAll('.melato-filter-option'))
    .filter(row => !row.hidden && row.style.display !== 'none')
    .map(row => row.querySelector('span').textContent.trim());

  assert.deepEqual(visibleLabels, ['Eve’s Wardrobe', 'Tops']);

  const eveCheckbox = dom.window.document.querySelector('input[value="aa-1-13-2__aa-1-25-9-2"]');
  eveCheckbox.checked = true;
  eveCheckbox.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(dom.window.document.querySelector('input[value="aa-1-4"]').checked, true);
  assert.equal(dom.window.document.querySelector('input[value="aa-1-15"]').checked, true);
});
