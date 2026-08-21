'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const manifestPaths = [
  'snippets/melato-living-lookbook-evidence-data.liquid',
  'snippets/melato-living-lookbook-evidence-case02-additions.liquid',
  'snippets/melato-living-lookbook-evidence-case03-data.liquid',
];
const manifests = Object.fromEntries(manifestPaths.map((path) => [path, fs.readFileSync(path, 'utf8')]));
const curationFixes = fs.readFileSync('sections/melato-living-lookbook-curation-fixes.liquid', 'utf8');

const redundantCase02References = [
  'rn-image_picker_lib_temp_6036bacb-b565-4de4-9706-7b325c4e2ef5.png',
  'rn-image_picker_lib_temp_bba8642e-4c0e-4a07-a521-4d4946d62501.png',
  'rn-image_picker_lib_temp_b5dfb750-7ac3-48da-9d28-a87c53158098.png',
  'rn-image_picker_lib_temp_59ca1dbb-bac5-49dc-acd6-8505ea947acc.png',
];
const redundantCase03Reference = 'rn-image_picker_lib_temp_71311bd2-5302-434c-bbee-5270e866a3f1.png';

test('removes visually confirmed duplicate image references while retaining their canonical frames', () => {
  const case02 = manifests['snippets/melato-living-lookbook-evidence-case02-additions.liquid'];
  const case03 = manifests['snippets/melato-living-lookbook-evidence-case03-data.liquid'];

  redundantCase02References.forEach((filename) => {
    assert.doesNotMatch(case02, new RegExp(filename));
  });
  assert.doesNotMatch(case03, new RegExp(redundantCase03Reference));
  assert.match(case02, new RegExp(redundantCase03Reference));
});

test('keeps Case 02 curation replacements aligned after duplicate removal', () => {
  ['08', '10', '15', '16', '23', '46', '47', '55', '56', '59', '62', '63', '68', '73', '85', '87'].forEach((frame) => {
    assert.match(curationFixes, new RegExp(`'${frame}': \\{ url:`));
  });
  assert.doesNotMatch(curationFixes, /'69': \{ url:/);
  assert.doesNotMatch(curationFixes, /'71': \{ url:/);
  assert.doesNotMatch(curationFixes, /'77': \{ url:/);
  assert.doesNotMatch(curationFixes, /'89': \{ url:/);
  assert.doesNotMatch(curationFixes, /'91': \{ url:/);
});

test('does not repeat an exact CDN image URL across active Living Lookbook manifests', () => {
  const urls = Object.values(manifests)
    .flatMap((manifest) => manifest.match(/https:\/\/cdn\.shopify\.com\/[^|~\s]+/g) || []);
  const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);

  assert.deepEqual(duplicateUrls, []);
});
