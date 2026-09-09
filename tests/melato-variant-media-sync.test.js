'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = path => fs.readFileSync(path, 'utf8');

function parseJsonTemplate(path) {
  return JSON.parse(read(path).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
}

test('default product template loads the generic variant media sync after the canonical PDP layers', () => {
  const template = parseJsonTemplate('templates/product.json');
  assert.equal(template.sections.variant_media_sync.type, 'melato-variant-media-sync');
  assert.ok(template.order.indexOf('variant_media_sync') > template.order.indexOf('main_product'));
  assert.ok(template.order.indexOf('variant_media_sync') < template.order.indexOf('related'));
});

test('variant media sync scopes structured gallery media to the selected Color option', () => {
  const section = read('sections/melato-variant-media-sync.liquid');
  assert.match(section, /for media in product\.media/);
  assert.match(section, /alt_parts = media_alt \| split: ', '/);
  assert.match(section, /data-color-key/);
  assert.match(section, /label === 'color'/);
  assert.match(section, /document\.addEventListener\('variant:change'/);
  assert.match(section, /data-variant-media-scoped/);
});

test('variant media sync is generic and does not hard-code a product handle', () => {
  const section = read('sections/melato-variant-media-sync.liquid');
  assert.doesNotMatch(section, /sheer-evidence/i);
  assert.doesNotMatch(section, /product\.handle\s*==/);
});

test('variant media sync keeps Complete the Set language aligned with the selected color', () => {
  const section = read('sections/melato-variant-media-sync.liquid');
  assert.match(section, /multiple colorways/i);
  assert.match(section, /'Full ' \+ colorInput\.value \+ ' uniform'/);
});
