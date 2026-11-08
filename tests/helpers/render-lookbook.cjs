const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const repo = path.resolve(__dirname, '../..');
async function renderLookbook({ products = {}, missingImage = false, language = 'en.default' } = {}) {
  const template = JSON.parse(fs.readFileSync(path.join(repo, 'templates/page.living-lookbook.json'), 'utf8'));
  const section = structuredClone(template.sections.main);
  section.id = 'audition';
  section.blocks = section.block_order.map(id => ({ ...section.blocks[id], id }));
  for (const block of section.blocks) {
    const settings = block.settings;
    settings.image = missingImage ? null : { src: settings.image.replace('shopify://shop_images/', 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/'), width: 1000, height: 1400 };
    for (const key of ['product_1', 'product_2']) settings[key] = products[settings[key]] || null;
  }
  const strings = JSON.parse(fs.readFileSync(path.join(repo, `locales/${language}.json`), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')).living_lookbook;
  const engine = new Liquid({ root: path.join(repo, 'snippets'), extname: '.liquid', globals: { routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', all_products_collection_url: '/collections/all' } } });
  engine.registerTag('doc', { parse(token, remain) { while (remain.length && remain.shift().name !== 'enddoc') {} }, render() { return ''; } });
  engine.registerFilter('t', key => strings[key.split('.').pop()] || key);
  engine.registerFilter('asset_url', file => '/assets/' + file);
  engine.registerFilter('stylesheet_tag', src => `<link rel="stylesheet" href="${src}">`);
  engine.registerFilter('money_with_currency', n => '$' + (n / 100).toFixed(2) + ' CAD');
  engine.registerFilter('image_url', (img, ...args) => {
    const width = args.find(a => Array.isArray(a) && a[0] === 'width')?.[1] || 1000;
    return (img.src || img) + '?width=' + width;
  });
  engine.registerFilter('image_tag', (src, ...args) => {
    const attributes = Object.fromEntries(args.filter(Array.isArray));
    return '<img src="' + src + '" width="1000" height="1400" ' + Object.entries(attributes).map(([k,v]) => `${k}="${String(v).replaceAll('"', '&quot;')}"`).join(' ') + '>';
  });
  const source = fs.readFileSync(path.join(repo, 'sections/melato-lookbook-shop.liquid'), 'utf8').replace(/{% schema %}[\s\S]*?{% endschema %}/, '');
  return engine.parseAndRender(source, { section, cart: { item_count: 0 }, routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', all_products_collection_url: '/collections/all' } });
}
module.exports = { renderLookbook };
