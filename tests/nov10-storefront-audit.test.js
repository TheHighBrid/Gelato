const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {Liquid} = require('liquidjs');
const {JSDOM} = require('jsdom');
const read = p => fs.readFileSync(p,'utf8');
const parse = p => JSON.parse(read(p).replace(/^\s*\/\*[\s\S]*?\*\//,''));
function engine(globals = {}) {
  const e = new Liquid({root:'snippets',extname:'.liquid',globals});
  e.registerTag('doc', { parse(token,remain) { while(remain.length && remain.shift().name !== 'enddoc') {} }, render() { return ''; } });
  e.registerFilter('money_with_currency',n=>`${(Number(n)/100).toFixed(2)} CAD`);
  e.registerFilter('money',n=>`${(Number(n)/100).toFixed(2)}`);
  e.registerFilter('json',v=>JSON.stringify(v??null));
  return e;
}
function piece(title,id,available=true) {
 const v={id,available,title:'M',price:10000};
 return {title,type:title.includes('Pant')?'Track Pant':'Track Jacket',id,url:'/products/'+id,variants:[v],selected_or_first_available_variant:v,metafields:{custom:{}}};
}
async function bundle(a,b) {
 a.metafields.custom.companion_product={value:b};
 const html=await engine().parseAndRender(read('snippets/melato-rendered-output-filters.liquid'),{html:`<a class="pdp-set-cta" href="${b.url}">View matching piece</a>`,context:'main',template:{name:'product'},product:a,shop:{currency:'CAD'}});
 return new JSDOM(html).window.document;
}
test('bundle selectors describe the actual selected product',async()=>{
 const a=piece('Coordinated Shirt',1),b=piece('Coordinated Skirt',2);
 const d=await bundle(a,b);
 assert.equal(d.querySelector('[data-melato-set-current]').getAttribute('aria-label'),'Coordinated Shirt size');
 assert.equal(d.querySelector('[data-melato-set-matching]').getAttribute('aria-label'),'Coordinated Skirt size');
 assert.equal(d.querySelector('[data-melato-set-current]').value,'1');
 assert.equal(d.querySelector('[data-melato-set-matching]').value,'2');
});
test('sold-out companion disables the full-set purchase',async()=>{
 const d=await bundle(piece('Track Jacket',1),piece('Track Pant',2,false));
 assert.equal(d.querySelector('[data-melato-set-add]').disabled,true);
});
test('bundle recovers from a sold-out URL variant when another size is available',async()=>{
 const a=piece('Track Jacket',1,false);
 a.variants.push({id:3,available:true,title:'L',price:12000});
 const d=await bundle(a,piece('Track Pant',2));
 assert.equal(d.querySelector('[data-melato-set-add]').disabled,false);
 assert.equal(d.querySelector('[data-melato-set-current]').value,'3');
 assert.match(d.querySelector('[data-melato-set-total]').textContent,/220.00/);
});
test('identical subtitle is suppressed before the canonical Story renders',async()=>{
 const source=read('sections/melato-product-page-rebuild.liquid');
 const intro=source.slice(0,source.indexOf('<section\n'));
 const html=await engine().parseAndRender(intro+'{{ subtitle }}|{{ story_copy }}',{product:{title:'Bag',type:'Bag',description:'<p>One unique introduction.</p>',metafields:{custom:{pdp_hook:{value:'One unique introduction.'}}}},section:{settings:{}}});
 assert.equal((html.match(/One unique introduction\./g)||[]).length,1);
});
test('legacy technical HTML cannot reappear inside the canonical Story',async()=>{
 const source=read('sections/melato-product-page-rebuild.liquid');
 const intro=source.slice(0,source.indexOf('<section\n'));
 const html=await engine().parseAndRender(intro+'{{ story_copy }}',{product:{title:'Bag',type:'Bag',description:'<p>A concise narrative.</p><h3>Construction</h3><ul><li>Curved handle.</li></ul>',metafields:{custom:{}}},section:{settings:{}}});
 assert.match(html,/A concise narrative/);
 assert.doesNotMatch(html,/Construction|Curved handle/);
});
test('heading-first stories and unique fragrance disclosures are preserved',async()=>{
 const source=read('sections/melato-product-page-rebuild.liquid');
 const intro=source.slice(0,source.indexOf('<section\n'));
 const html=await engine().parseAndRender(intro+'{{ story_copy }}|{{ use_copy }}|{{ safety_copy }}|{{ legacy_details }}',{product:{title:'Fragrance',type:'Fragrance',description:'<h3>Story</h3><p>A floral narrative.</p><h3>How to wear</h3><p>Apply to pulse points.</p><h3>Fragrance profile</h3><p>Fresh floral.</p>',metafields:{custom:{},fragrance:{safety_warning:{value:'Flammable. Avoid eyes.'}}}},section:{settings:{}}});
 assert.match(html,/A floral narrative/);
 assert.match(html,/Apply to pulse points/);
 assert.match(html,/Flammable. Avoid eyes/);
 assert.match(html,/Fresh floral/);
});
test('appointment marquee has one accessible contact link',async()=>{
 const e=engine({routes:{root_url:'/fr'}});
 const source=read('sections/announcement-marquee.liquid').split('{% schema %}')[0];
 const html=await e.parseAndRender(source,{section:{id:'test',settings:{ticker_text:'Private previews by appointment.',contact_url:'/pages/contact'}}});
 const d=new JSDOM(html).window.document;
 assert.equal(d.querySelectorAll('a').length,1);
 assert.equal(d.querySelector('a').closest('[aria-hidden="true"]'),null);
 assert.equal(d.querySelector('a').getAttribute('href'),'/fr/pages/contact');
});
test('canonical Story and Construction survive the presentation layer',()=>{
 const layer=read('sections/melato-pdp-unification.liquid');
 assert.doesNotMatch(layer,/\.pdp-story\s*\{\s*display:\s*none/);
 assert.doesNotMatch(layer,/querySelectorAll\('\.pdp-story'\)/);
 assert.doesNotMatch(layer,/cleanText\(summary\) === 'construction'\) details\.remove/);
});
test('homepage Uniform destination and appointment contact are consistent',()=>{
 const index=parse('templates/index.json');
 assert.equal(index.sections.featured_collection.settings.collection,'tracksuits');
 const marquee=index.sections.announcement_marquee_VfV9At.settings;
 assert.equal(marquee.ticker_text,'Private previews by appointment. Tanger Outlets Ottawa.');
 assert.equal(marquee.contact_url,'/pages/contact');
});
test('French rack and SEO translations are complete for these interfaces',()=>{
 const en=parse('locales/en.default.json'),fr=parse('locales/fr.json');
 for(const k of Object.keys(en.melato_rack)) assert.ok(fr.melato_rack?.[k],k);
 assert.ok(fr.melato_seo?.home_title);
 assert.match(read('layout/theme.liquid'),/melato_seo.home_title/);
});
test('French navigation labels translate without changing branded product names',async()=>{
 const e=engine();
 const fr=parse('locales/fr.json');
 e.registerFilter('t',key=>key.split('.').reduce((v,k)=>v?.[k],fr)||key);
 const html=await e.parseAndRender("{% render 'melato-navigation-label', title: 'New Arrivals' %}|{% render 'melato-navigation-label', title: 'Pocket Change' %}",{request:{locale:{iso_code:'fr'}}});
 assert.equal(html.trim(),'Nouveautés|Pocket Change');
});
test('localized URLs preserve French routes and external destinations',async()=>{
 const e=engine({routes:{root_url:'/fr'}});
 for(const [url,want] of [['/collections/new-arrivals','/fr/collections/new-arrivals'],['/fr/pages/our-story','/fr/pages/our-story'],['https://example.com','https://example.com'],['//example.com','//example.com']]) {
  const result=await e.parseAndRender("{% render 'melato-localized-url', url: path %}",{path:url,routes:{root_url:'/fr'}});
  assert.equal(result.trim(),want);
 }
});
