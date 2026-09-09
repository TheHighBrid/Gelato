import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => {
  console.error(`PRODUCT PAGE BIBLE VIOLATION: ${message}`);
  process.exitCode = 1;
};
const requireText = (content, needle, location) => {
  if (!content.includes(needle)) fail(`${location} must contain ${JSON.stringify(needle)}`);
};
const forbidText = (content, needle, location) => {
  if (content.includes(needle)) fail(`${location} must not contain ${JSON.stringify(needle)}`);
};

const biblePath = 'docs/MELATO_PRODUCT_PAGE_BIBLE.md';
const contractPath = 'config/melato-product-page-bible.json';
const agentsPath = 'AGENTS.md';
const templatePath = 'templates/product.json';
const pdpPath = 'sections/melato-product-page-rebuild.liquid';
const merchPath = 'sections/melato-pdp-contextual-merchandising.liquid';
const announcementPath = 'sections/melato-announcement-bar.liquid';
const codeownersPath = '.github/CODEOWNERS';

for (const requiredPath of [biblePath, contractPath, agentsPath, templatePath, pdpPath, merchPath, announcementPath, codeownersPath]) {
  if (!fs.existsSync(path.join(root, requiredPath))) fail(`required file is missing: ${requiredPath}`);
}

let contract;
try {
  contract = JSON.parse(read(contractPath));
} catch (error) {
  fail(`${contractPath} is not valid JSON: ${error.message}`);
}

if (contract) {
  if (contract.schemaVersion !== '1.0.0') fail('schemaVersion must be 1.0.0');
  if (contract.status !== 'MANDATORY') fail('contract status must be MANDATORY');
  if (contract.vendor !== 'Melato') fail('vendor must be exactly Melato');
  if (contract.defaults?.inventoryPerSellableVariantWhenUnspecified !== 7) fail('unspecified inventory default must be 7');
  if (contract.defaults?.minimumDistinctPhotoStyles !== 2) fail('minimum distinct photo styles must be 2');
  if (contract.defaults?.maxContextualMerchandisingModules !== 2) fail('contextual merchandising maximum must be 2');
  if (contract.soldOutVariantPolicy !== 'VISIBLE_DISABLED') fail('sold-out variants must remain visible and disabled');
  if (contract.mediaPolicy?.collages !== 'FORBIDDEN') fail('collages must remain forbidden');
  if (contract.mediaPolicy?.ghostMannequinDefault !== 'FORBIDDEN') fail('ghost mannequin default must remain forbidden');

  const canonical = contract.canonicalProductMetafields || {};
  const requiredKeys = [
    'background_hex_color_code', 'foreground_hex_color_code', 'palette_1', 'palette_2', 'palette_3',
    'fit_notes', 'material_composition', 'care_instructions', 'construction', 'ingredients', 'use',
    'made_in', 'size_guide', 'companion_product', 'related_products', 'material_profile',
    'product_specification', 'pdp_bible_version'
  ];
  for (const key of requiredKeys) {
    if (!canonical[key]) fail(`canonical product metafield missing from contract: ${key}`);
  }

  const aliases = new Set(contract.legacyAliasesReadOnly || []);
  for (const key of ['fit', 'care', 'composition', 'matching_product', 'matching_piece', 'set_partner', 'bar_bg', 'bar_fg']) {
    if (!aliases.has(key)) fail(`legacy read-only alias must remain declared: ${key}`);
  }
  if (contract.legacyWritePolicy !== 'FORBIDDEN') fail('legacy write policy must remain FORBIDDEN');
}

const agents = read(agentsPath);
requireText(agents, biblePath, agentsPath);
requireText(agents, contractPath, agentsPath);
requireText(agents, 'Legacy fields are migration inputs only', agentsPath);

const template = JSON.parse(read(templatePath));
const order = template.order || [];
const expectedSequence = ['main_product', 'related', 'recently_viewed', 'contextual_merchandising'];
let cursor = -1;
for (const id of expectedSequence) {
  const index = order.indexOf(id);
  if (index < 0) fail(`${templatePath} missing section id ${id}`);
  if (index <= cursor) fail(`${templatePath} section ${id} is out of canonical order`);
  cursor = index;
}
if (template.sections?.main_product?.type !== 'melato-product-page-rebuild') fail('default product template must use melato-product-page-rebuild');
if (template.sections?.contextual_merchandising?.type !== 'melato-pdp-contextual-merchandising') fail('default product template must use melato-pdp-contextual-merchandising');
if (template.sections?.related?.settings?.heading !== 'You might also like') fail('related-products heading must remain You might also like');
if (template.sections?.recently_viewed?.settings?.heading !== 'Recently viewed') fail('recently-viewed heading must remain Recently viewed');

const pdp = read(pdpPath);
for (const field of ['fit_notes', 'material_composition', 'care_instructions', 'construction', 'ingredients', 'use', 'companion_product', 'related_products', 'pdp_bible_version']) {
  requireText(pdp, field, pdpPath);
}
requireText(pdp, 'melato-pdp-bible-section-title', pdpPath);
requireText(pdp, 'Ships in 1 to 3 business days.', pdpPath);
requireText(pdp, 'Complimentary delivery on all orders.', pdpPath);

const merch = read(merchPath);
for (const handle of ['new-arrivals', 'accessories', 'fragrance', 'bags', 'denim', 'tracksuits']) {
  requireText(merch, handle, merchPath);
}
requireText(merch, 'data-melato-pdp-merchandising', merchPath);

const announcement = read(announcementPath);
requireText(announcement, 'background_hex_color_code', announcementPath);
requireText(announcement, 'foreground_hex_color_code', announcementPath);
requireText(announcement, 'palette_1', announcementPath);
requireText(announcement, 'palette_2', announcementPath);
requireText(announcement, 'palette_3', announcementPath);

const codeowners = read(codeownersPath);
for (const protectedPath of [
  '/AGENTS.md',
  '/docs/MELATO_PRODUCT_PAGE_BIBLE.md',
  '/config/melato-product-page-bible.json',
  '/sections/melato-product-page-rebuild.liquid',
  '/sections/melato-pdp-contextual-merchandising.liquid',
  '/scripts/validate-melato-product-page-bible.mjs',
  '/.github/workflows/melato-product-page-bible-guard.yml'
]) {
  requireText(codeowners, protectedPath, codeownersPath);
}

const bible = read(biblePath);
requireText(bible, '**Status:** MANDATORY', biblePath);
requireText(bible, 'custom.pdp_bible_version = 1.0.0', biblePath);
forbidText(bible, 'FREE SHIPPING OVER $60', biblePath);
forbidText(bible, '$60 away from free shipping', biblePath);

if (!process.exitCode) console.log('Melato Product Page Bible validation passed.');
