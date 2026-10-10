const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { Liquid } = require('liquidjs');

async function main() {
  const engine = new Liquid({ root: 'snippets', extname: '.liquid' });
  engine.registerFilter('json', value => JSON.stringify(value ?? null));
  engine.registerFilter('image_url', value => value);
  const read = file => fs.readFileSync(file, 'utf8');
  const palette = read('snippets/melato-product-color-engine.liquid');
  for (const name of ['Ryū Track Jacket', 'A "quoted" name </script>']) {
    const html = await engine.parseAndRender(palette, {request: {page_type: 'product'}, template: {name: 'product'}, product: {handle: 'ryu-velour-track-jacket', title: name, metafields: {custom: {palette_1: {value: '#000000'}}}}});
    const script = html.match(/<script id="melato-product-color-engine-js">([\s\S]*)<\/script>/)[1];
    assert.doesNotThrow(() => new vm.Script(script), 'Rendered product color engine must parse');
  }
  const index = JSON.parse(read('templates/index.json').replace(/^\/\*[\s\S]*?\*\//, ''));
  const first = index.sections[index.order.find(id => !index.sections[id].disabled)];
  assert.equal(first.type, 'video');
  const video = await engine.parseAndRender(read('sections/video.liquid').split('{% schema %}')[0], {section: {id: 'test', settings: first.settings}});
  assert.match(video, /href="\/collections\/new-arrivals"[^>]*>Shop the drop/);
  assert.match(video, /href="\/pages\/living-lookbook"[^>]*>Living Lookbook/);
  assert.match(video, /<h1>THE CULTURE WEARS US<\/h1>/);
  assert.ok(!video.includes('<h2'), 'Campaign title must not precede the shopping hero');
  assert.match(video, /poster="[^\"]*FRAME_261/);
  assert.match(video, /<source media="\(max-width: 749px\)"[^>]*SD-480p/);
  assert.match(video, /<source src="[^\"]*HD-1080p/);
  assert.ok(!read('sections/melato-home-conversion.liquid').includes('<h1'));
  assert.ok(!read('sections/hero-video.liquid').includes('<h1'));
  const current = '<section><h2 id="RelatedHeading-existing">You might also like</h2></section><section><h2>New Arrivals</h2></section>';
  const recommendations = await engine.parseAndRender(read('snippets/melato-theme-audit-hotfix.liquid'), {html: current, context: 'main', template: {name: 'product'}, product: {metafields: {custom: {related_products: {value: [{title: 'Matching pant', url: '/products/pant', price: 100}]}}}}});
  assert.equal((recommendations.match(/You might also like/gi) || []).length, 1);
  assert.match(recommendations, />New Arrivals<\/h2>/);
  new vm.Script(read('assets/melato-audit-nav-collections.js'));
  console.log('Storefront audit checks passed: rendered palette syntax, first-film shopping links, responsive video and single recommendation heading.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
