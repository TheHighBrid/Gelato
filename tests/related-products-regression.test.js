const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('sections/related-products.liquid', 'utf8');
const contract = JSON.parse(fs.readFileSync('config/melato-product-page-bible.json', 'utf8'));
const bible = fs.readFileSync('docs/MELATO_PRODUCT_PAGE_BIBLE.md', 'utf8');

test('related products have balanced core Liquid control flow', () => {
  const withoutSchema = source.replace(/{% schema %}[\s\S]*?{% endschema %}/, '');
  const control = [...withoutSchema.matchAll(/{%-?\s*(if|unless|for|capture|endif|endunless|endfor|endcapture)\b[^%]*-?%}/g)];
  const starts = {if:'endif',unless:'endunless',for:'endfor',capture:'endcapture'};
  const stack = [];
  for (const m of control) {
    const tag=m[1];
    if (starts[tag]) stack.push(starts[tag]);
    else assert.equal(tag,stack.pop(),'unbalanced Liquid tag '+tag);
  }
  assert.equal(stack.length,0,'unclosed Liquid control tags');
});

test('curated overrides are cross-category while automatic candidates use real Shopify Liquid type', () => {
  assert.match(source, /for recommendation in curated_products[\s\S]*?recommendation\.available and recommendation\.id != product\.id/);
  assert.doesNotMatch(source, /\.product_type/);
  assert.match(source, /recommendation\.type == product\.type/);
  assert.equal((source.match(/fallback_product\.type == product\.type/g)||[]).length,2);
  assert.match(source, /if curated_shown > 0/);
  assert.match(source, /if recommendation_shown > 0/);
  assert.match(source, /unless shown_ids contains fallback_key/);
  assert.doesNotMatch(source, /for fallback_product in new_arrivals\.products[\s\S]*?for fallback_product in new_arrivals\.products/);
});

test('Bible 1.1.0 records governed recommendation priority and fallbacks', () => {
  assert.equal(contract.schemaVersion,'1.1.0');
  assert.equal(contract.defaults.pdpBibleVersionMetafieldValue,'1.1.0');
  assert.equal(contract.recommendations.automaticSameTypeField,'product.type');
  assert.equal(contract.recommendations.curatedCrossTypeOverride,true);
  assert.equal(contract.recommendations.fallbackWhenNoEligibleCandidates,true);
  assert.match(bible,/\*\*Version:\*\* 1\.1\.0/);
  assert.match(source,/MELATO PRODUCT PAGE BIBLE 1\.1\.0/);
});
