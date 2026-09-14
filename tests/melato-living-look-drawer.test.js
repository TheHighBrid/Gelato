const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

function parseJsonTemplate(file) {
  const source = read(file).replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  return JSON.parse(source);
}

test('Living Lookbook production template only orders defined sections and blocks', () => {
  const template = parseJsonTemplate('templates/page.living-lookbook.json');
  const sectionIds = new Set(Object.keys(template.sections));
  for (const sectionId of template.order) assert.ok(sectionIds.has(sectionId), `Missing ordered section: ${sectionId}`);

  assert.equal(template.sections.main?.type, 'melato-living-book-vol01');
  assert.equal(template.order.length, 1);
  assert.equal(template.sections.main?.settings?.hide_store_chrome, true);
});

test('Living Look drawer is route-scoped and progressively enhanced', () => {
  const loader = read('snippets/melato-living-lookbook-loader.liquid');
  assert.match(loader, /page\.handle|request\.path|template\.suffix/);
  assert.match(loader, /melato-living-look-drawer\.css/);
  assert.match(loader, /melato-living-look-drawer\.js/);

  const controller = read('assets/melato-living-look-drawer.js');
  assert.match(controller, /AbortController/);
  assert.match(controller, /cart\/add\.js/);
  assert.match(controller, /cart:updated/);
  assert.match(controller, /role="dialog"/);
  assert.match(controller, /aria-modal="true"/);
  assert.match(controller, /\.mlb-product\[href\*="\/products\/"\]/);
  assert.doesNotThrow(() => new vm.Script(controller));
});

test('Living Look drawer includes responsive and reduced-motion contracts', () => {
  const css = read('assets/melato-living-look-drawer.css');
  assert.match(css, /--motion-panel-in:320ms/);
  assert.match(css, /--motion-sheet-in:380ms/);
  assert.match(css, /@media\(max-width:1023px\)/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /100dvh|86dvh|88dvh/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
