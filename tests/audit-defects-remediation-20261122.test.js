'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const { Liquid } = require('liquidjs');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function createLiquidEngine(globals = {}) {
  const engine = new Liquid({
    root: path.join(root, 'snippets'),
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
      this.templates = [];
      this.args = token.args;
      const stream = this.liquid.parser.parseStream(remain);
      stream
        .on('tag:endform', () => stream.stop())
        .on('template', (tpl) => this.templates.push(tpl))
        .start();
    },
    *render(ctx, emitter) {
      emitter.write('<form method="post" action="/cart">');
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      emitter.write('</form>');
    }
  });
  engine.registerFilter('money', (n) => `$${(Number(n) / 100).toFixed(2)}`);
  engine.registerFilter('money_with_currency', (n) => `$${(Number(n) / 100).toFixed(2)} CAD`);
  engine.registerFilter('money_without_currency', (n) => (Number(n) / 100).toFixed(2));
  engine.registerFilter('json', (v) => JSON.stringify(v ?? null));
  engine.registerFilter('image_url', () => 'https://melato.ca/cdn/shop/test.jpg');
  engine.registerFilter('image_tag', (_url, args = {}) => `<img class="${args.class || ''}" alt="${args.alt || ''}">`);
  engine.registerFilter('payment_type_svg_tag', (t) => `<svg data-pay="${t}"></svg>`);
  engine.registerFilter('pluralize', (n, singular, plural) => (Number(n) === 1 ? singular : plural));
  engine.registerFilter('t', (key) => {
    const map = {
      'cart.title': 'Panier',
      'cart.subtotal': 'Sous-total',
      'cart.checkout': 'Commander',
      'cart.empty': 'Votre panier est vide',
      'search.submit': 'Search',
      'melato_ui.account': 'Account',
      'melato_ui.bag': 'Bag',
      'melato_nav.new_arrivals': 'Nouveautés',
      'melato_nav.tracksuits': 'Survêtements',
      'melato_nav.fragrance': 'Parfums'
    };
    return map[key] || key;
  });
  return engine;
}

test('MOBILE-PDP-CHAT-ATC-OCCLUSION: concierge suppresses when external chat exists and hides on drawers/sticky ATC', () => {
  const widgetCode = read('assets/melato-ai-concierge-widget.js');
  const css = read('assets/melato-visibility-fixes-202611.css');

  assert.match(css, /body\.melato-drawer-open #bv-chat-frame/);
  assert.match(css, /body\.melato-drawer-open inbox-online-store-chat/);
  assert.match(css, /body\.template-product:has\(\.pdp-sticky-atc\.is-visible\) #bv-chat-frame/);
  assert.match(css, /body\.template-product:has\(\.pdp-sticky-atc\.is-visible\) #ShopifyChat/);
  assert.match(css, /body\.template-product\.melato-chat-clear-left #bv-chat-frame/);

  const dom = new JSDOM('<!doctype html><html lang="en"><body class="template-product"><div id="bv-chat-frame"></div><div class="pdp-sticky-atc is-visible"></div><div class="cart-drawer is-open"></div></body></html>', {
    runScripts: 'outside-only'
  });
  Object.defineProperty(dom.window, 'innerWidth', { value: 390, configurable: true });
  vm.runInContext(widgetCode, dom.getInternalVMContext());
  dom.window.MelatoAI.createWidget();
  dom.window.MelatoAI.syncConciergeVisibility();

  assert.equal(dom.window.document.getElementById('melato-ai-concierge'), null);
  assert.equal(dom.window.document.body.classList.contains('melato-drawer-open'), true);
  assert.equal(dom.window.document.body.classList.contains('melato-sticky-atc-visible'), true);
});

test('FILTER-APPLY-COLLISION-NEW-ARRIVALS: theme.js does not hijack [data-filter-apply] and melato-collection-filters.js preserves selected filters', async () => {
  const themeJs = read('assets/theme.js');
  const filtersJs = read('assets/melato-collection-filters.js');

  assert.match(themeJs, /if \(document\.getElementById\('melato-filter-drawer'\) \|\| document\.getElementById\('melato-product-grid'\)\) return;/);

  const dom = new JSDOM(`<!doctype html><html><body class="template-collection">
    <div data-collection-toolbar>
      <button type="button" data-filter-open><span>Filter</span></button>
      <span data-product-count>74 pieces</span>
    </div>
    <div data-active-filters-bar hidden></div>
    <div id="melato-filter-drawer" aria-hidden="true">
      <input type="checkbox" name="filter.p.t.category" value="aa-1-10-2-18" checked data-filter-input>
      <button type="button" data-filter-apply>Show results</button>
    </div>
    <div id="melato-product-grid"><div class="melato-product-grid__inner"></div></div>
  </body></html>`, { url: 'https://melato.ca/collections/new-arrivals', runScripts: 'outside-only' });

  let requestedUrl = '';
  dom.window.fetch = async (url) => {
    requestedUrl = String(url);
    return {
      ok: true,
      text: async () => `<!doctype html><html><body>
        <div data-collection-toolbar>
          <button type="button" data-filter-open><span>Filter</span><span data-active-filter-count>1</span></button>
          <span data-product-count>3 pieces</span>
          <a href="/collections/new-arrivals" data-clear-all-filters>Clear</a>
        </div>
        <div data-active-filters-bar><a href="/collections/new-arrivals" data-filter-pill>Category: Blazers <span>×</span></a></div>
        <div id="melato-filter-drawer"><input type="checkbox" name="filter.p.t.category" value="aa-1-10-2-18" checked data-filter-input></div>
        <div id="melato-product-grid"><div class="melato-product-grid__inner"><article class="melato-product-grid__item">Blazer</article></div></div>
      </body></html>`
    };
  };
  dom.window.Element.prototype.scrollIntoView = () => {};

  vm.runInContext(filtersJs, dom.getInternalVMContext());
  dom.window.document.querySelector('[data-filter-apply]').click();
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(requestedUrl, '/collections/new-arrivals?filter.p.t.category=aa-1-10-2-18');
  assert.equal(dom.window.location.search, '?filter.p.t.category=aa-1-10-2-18');
  assert.equal(dom.window.document.querySelector('[data-product-count]').textContent, '3 pieces');
  assert.equal(dom.window.document.querySelectorAll('[data-filter-pill]').length, 1);
});

test('CART-REMOVE-STALE-DOM & 1 ITEM singularization & balanced empty-cart trust grid', async () => {
  const mainCart = read('sections/main-cart.liquid');
  const drawerLiquid = read('snippets/cart-drawer.liquid');
  const drawerJs = read('assets/melato-cart-drawer.js');
  const coreJs = read('assets/melato-core.js');

  assert.match(mainCart, /data-main-cart-section/);
  assert.match(mainCart, /class="cart-item__remove"[\s\S]*data-remove-line="/);
  assert.match(mainCart, /\.melato-empty-cart__trust\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(mainCart, /\.melato-empty-cart__trust\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(drawerLiquid, /data-cart-count-label/);

  for (const source of [drawerJs, coreJs]) {
    assert.match(source, /syncMainCartPage/);
    assert.match(source, /removeButton\?\.closest\('\.cart-drawer, \[data-main-cart-section\]'\)/);
    assert.match(source, /count === 1 \? 'item' : 'items'/);
  }

  const dom = new JSDOM(`<!doctype html><html lang="en"><body>
    <span class="mxh__bag-count">1</span>
    <a class="mxh__bag"></a>
    <div id="cart-drawer" class="cart-drawer">
      <p class="cart-drawer__count" data-cart-count-label><span data-cart-item-count>0</span> items</p>
      <div class="cart-drawer__items"></div>
      <span class="cart-subtotal__amount"></span>
      <button name="checkout"></button>
    </div>
    <section data-main-cart-section>
      <div class="cart-page-grid">
        <button type="button" class="cart-item__remove" data-remove-line="line-1">×</button>
      </div>
    </section>
  </body></html>`, { url: 'https://melato.ca/cart', runScripts: 'outside-only' });

  dom.window.fetch = async (url) => {
    if (String(url).includes('cart/change.js')) {
      return {
        ok: true,
        json: async () => ({ item_count: 0, total_price: 0, currency: 'CAD', items: [] })
      };
    }
    return {
      ok: true,
      text: async () => '<html><body><section data-main-cart-section><div class="melato-empty-cart"><h2>Your cart is empty</h2></div></section></body></html>'
    };
  };

  vm.runInContext(drawerJs, dom.getInternalVMContext());
  dom.window.document.querySelector('[data-remove-line="line-1"]').click();
  await new Promise((r) => setTimeout(r, 20));

  assert.equal(dom.window.document.querySelector('.mxh__bag-count').textContent, '0');
  assert.match(dom.window.document.querySelector('[data-main-cart-section]').textContent, /Your cart is empty/);
});

test('HEADER-DESKTOP-BAG-OVERLAP, COLLECTION-UI-EYEBROW-CLIP & MOBILE-ANNOUNCEMENT-CLIPPING', () => {
  const coreCss = read('assets/melato-core.css');
  const tailCss = read('assets/melato-storefront-tail.css');
  const visCss = read('assets/melato-visibility-fixes-202611.css');
  const collectionLiquid = read('sections/main-collection.liquid');

  assert.match(coreCss, /a\[href\*="\/cart"\]:not\(\.mxh__bag\):not\(\.cart-drawer__view-cart\):not\(\.melato-cart-cta\)/);
  assert.match(tailCss, /a\[href\*="\/cart"\]:not\(\.mxh__bag\):not\(\.cart-drawer__view-cart\):not\(\.melato-cart-cta\)/);
  assert.match(visCss, /html body \.mxh \.mxh__bag\s*\{[^}]*width:\s*auto\s*!important/);
  assert.match(visCss, /html body #melato-announcement-bar\.melato-ann\s*\{[^}]*height:\s*auto\s*!important/);
  assert.match(collectionLiquid, /\.melato-collection-hero\{[^}]*min-height:320px;height:auto/);
  assert.match(collectionLiquid, /\.melato-collection-hero__content\{[^}]*position:relative;z-index:1/);
});

test('COLLECTION DUPLICATE FILTERS: T-Shirts maps to Tops without T-Tops and duplicates collapse', () => {
  for (const file of ['assets/melato-core.js', 'assets/melato-optimization-2026.js']) {
    const code = read(file);
    assert.match(code, /getRowRawLabel/);
    assert.match(code, /seenLabels/);
    assert.match(code, /entries\.sort\(\(a, b\) => b\.raw\.length - a\.raw\.length\)/);
  }

  const optCode = read('assets/melato-optimization-2026.js');
  const dom = new JSDOM(`<!doctype html><html><body class="template-collection">
    <div id="melato-filter-drawer">
      <div class="melato-filter-group">
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-4" data-filter-input><span>Bodysuits</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-5" data-filter-input><span>Dresses</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-6" data-filter-input><span>Shirts</span></label>
        <label class="melato-filter-option"><input type="checkbox" name="filter.p.t.category" value="aa-1-13-8" data-filter-input><span>T-Shirts</span></label>
      </div>
    </div>
  </body></html>`, { url: 'https://melato.ca/collections/new-arrivals', runScripts: 'outside-only' });

  vm.runInContext(optCode, dom.getInternalVMContext());
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const visibleLabels = Array.from(dom.window.document.querySelectorAll('.melato-filter-option'))
    .filter((row) => !row.hidden)
    .map((row) => row.querySelector('span').textContent.trim());

  assert.deepEqual(visibleLabels, ['Eve’s Wardrobe', 'Tops']);
});

test('FR-STOREFRONT-INCOMPLETE-LOCALIZATION: FR desktop nav keeps Parfums, header guards Account/Bag, and Complete the Set currency is consistent', async () => {
  const navCode = read('assets/melato-audit-nav-collections.js');
  assert.match(navCode, /!\/\\\/collections\\\/sunglasses/);

  const navDom = new JSDOM(`<!doctype html><html lang="fr"><body>
    <header data-mxh>
      <div class="mxh__bar"><div class="mxh__left"><button data-mxh-menu>Index</button></div></div>
      <div class="mxh__drawer"><nav class="mxh__nav">
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/new-arrivals"><span>01</span>Nouveautés</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/tracksuits"><span>02</span>Survêtements</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/denim"><span>03</span>Denim</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/eves-wardrobe"><span>04</span>Le vestiaire d’Eve</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/accessories"><span>05</span>Accessoires</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/sunglasses"><span>06</span>Lunettes de soleil</a></div>
        <div class="mxh__nav-item"><a class="mxh__nav-link" href="/fr/collections/fragrance"><span>07</span>Parfums</a></div>
      </nav></div>
    </header>
  </body></html>`, { url: 'https://melato.ca/fr', runScripts: 'outside-only' });

  navDom.window.requestAnimationFrame = (cb) => cb();
  vm.runInContext(navCode, navDom.getInternalVMContext());
  navDom.window.document.dispatchEvent(new navDom.window.Event('DOMContentLoaded'));
  const topNavLabels = Array.from(navDom.window.document.querySelectorAll('.mxh__desktop-nav a')).map((a) => a.textContent.trim());
  assert.equal(topNavLabels.includes('Lunettes de soleil'), false);
  assert.equal(topNavLabels.includes('Parfums'), true);

  const engine = createLiquidEngine({
    request: { locale: { iso_code: 'fr' } },
    routes: { root_url: '/fr/', account_url: '/fr/account', account_login_url: '/fr/account/login', cart_url: '/fr/cart', search_url: '/fr/search', all_products_collection_url: '/fr/collections/all' },
    shop: { name: 'Melato', customer_accounts_enabled: true },
    cart: { item_count: 1 }
  });
  const headerHtml = await engine.parseAndRender(read('sections/melato-header.liquid').split('{% schema %}')[0], {
    section: { id: 'hdr', settings: { show_account: true, menu_label: 'Index' } }
  });
  assert.match(headerHtml, />Compte</);
  assert.match(headerHtml, />Panier</);
  assert.match(headerHtml, />Rechercher</);

  const currencyEnforcer = read('sections/melato-pdp-currency-enforcer.liquid');
  const hotfix = read('snippets/melato-theme-audit-hotfix.liquid');
  assert.match(currencyEnforcer, /formatted \+ ' \$ ' \+ code/);
  assert.match(hotfix, /fmt\+" \$ "\+c/);
});

test('PDP-EMPTY-RECS-AND-DUPLICATE-FIELDS & PDP-APPAREL-MISSING-MEASUREMENTS & SEO-TITLE-DOUBLE-ESCAPE', async () => {
  const layout = read('layout/theme.liquid');
  const globalJsonLd = read('snippets/melato-global-jsonld.liquid');
  assert.match(layout, /melato_meta_title \| replace: '&amp;', '&' \| escape/);
  assert.match(globalJsonLd, /page_title \| replace: '&amp;', '&' \| json/);

  const engine = createLiquidEngine({
    request: { locale: { iso_code: 'en' } },
    routes: { product_recommendations_url: '/recommendations/products' },
    collections: {
      'new-arrivals': { products: [] },
      'best-sellers': { products: [] }
    }
  });

  const relatedHtml = await engine.parseAndRender(read('sections/related-products.liquid').split('{% schema %}')[0], {
    section: { id: 'rel', settings: { eyebrow: 'Continue shopping', heading: 'You might also like', products_to_show: 4 } },
    recommendations: { performed: true, products: [] },
    product: { id: 100, type: 'Shoulder Bag', metafields: { custom: {} } }
  });
  assert.doesNotMatch(relatedHtml, /You might also like/);

  const rebuildHtml = await engine.parseAndRender(read('sections/melato-product-page-rebuild.liquid').split('{% schema %}')[0], {
    section: { id: 'pdp', settings: { eyebrow: 'Product focus', bg: '#080808', surface: '#111214', text: '#f5f1e8', accent: '#9e1824', accent_2: '#d3a74a' } },
    product: {
      id: 200,
      title: 'Chain Letter Shoulder Bag',
      type: 'Shoulder Bag',
      tags: [],
      price: 32500,
      description: '<h3>Verified Materials</h3><p>Exterior: full-grain French calfskin.</p><h3>Origin</h3><p>Made in Italy.</p>',
      has_only_default_variant: true,
      variants: [{ id: 1, title: 'Default Title', price: 32500, available: true }],
      selected_or_first_available_variant: { id: 1, title: 'Default Title', price: 32500, available: true },
      options_with_values: [],
      media: [],
      metafields: {
        custom: {
          material_composition: { value: 'Exterior: Full-grain French Calfskin. Lining: Lambskin Nappa. Hardware: Solid Brass, 18k Gold Finish.' },
          made_in: { value: 'Italy' },
          pdp_technical_paragraph: { value: 'Exterior: Full-grain French Calfskin. Lining: Lambskin Nappa. Hardware: Solid Brass, 18k Gold Finish. Dimensions: 24 × 16 × 7 cm. Closure: Magnetic Snap. Made in Italy' }
        },
        melato: {},
        fragrance: {}
      }
    }
  });
  assert.doesNotMatch(rebuildHtml, /<summary>Verified Materials<\/summary>/i);
  assert.doesNotMatch(rebuildHtml, /<summary>Origin<\/summary>/i);
  assert.match(rebuildHtml, /Dimensions: 24 × 16 × 7 cm\. Closure: Magnetic Snap/);
  assert.doesNotMatch(rebuildHtml, /<summary>Construction<\/summary>[\s\S]*Exterior: Full-grain French Calfskin/);
});
