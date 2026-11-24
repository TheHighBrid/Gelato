const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const paths=[
 'sections/melato-pdp-product-type-semantics.liquid',
 'sections/melato-product-proof-bar.liquid',
 'sections/main-collection.liquid',
 'sections/melato-complete-the-set.liquid',
 'sections/tag-recommendations.liquid',
 'sections/melato-pdp-unification.liquid',
 'sections/melato-product-trust-accordions.liquid',
 'sections/melato-luxury-product-page.liquid',
 'sections/melato-product-page-clean.liquid',
 'sections/melato-pdp-contextual-merchandising.liquid',
 'sections/melato-product-page-rebuild.liquid',
 'snippets/melato-rendered-output-filters-base.liquid',
 'snippets/melato-product-jsonld.liquid',
 'layout/theme.liquid'
];
test('Liquid product family and category references use the real Shopify Product.type property',()=>{
 for(const file of paths){
  const content=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(content,/\bproduct\.product_type\b/,file);
  assert.match(content,/\bproduct\.type\b/,file);
 }
});
test('fragrance type routing does not render an apparel-only size-guide drawer',()=>{
 const pdp=fs.readFileSync('sections/melato-product-page-rebuild.liquid','utf8');
 assert.match(pdp,/assign product_type_down = product\.type \| downcase/);
 assert.match(pdp,/unless family == 'fragrance'[\s\S]*?render 'size-guide-drawer', product: product[\s\S]*?endunless/);
 assert.match(pdp,/if family == 'fragrance'[\s\S]*?Eligible unopened fragrances/);
 assert.match(pdp,/metafields\.fragrance\.inci_ingredients\.value \| default: product\.metafields\.custom\.ingredients\.value/);
});
test('product structured data uses canonical product.type without nonexistent aliases',()=>{
 const source=fs.readFileSync('snippets/melato-product-jsonld.liquid','utf8');
 assert.match(source,/"category": \{\{ product\.type \| default: 'Apparel' \| json \}\}/);
});
