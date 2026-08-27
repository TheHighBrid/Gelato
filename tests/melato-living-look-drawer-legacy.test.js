const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

test('legacy Living Lookbook enhancer only upgrades exact product-linked frames', () => {
  const source = read('assets/melato-living-look-drawer-legacy.js');
  assert.match(source, /#MelatoLivingLookbook/);
  assert.match(source, /a\[href\*="\/products\/"\]/);
  assert.match(source, /legacy-editorial-spread/);
  assert.match(source, /stopPropagation\(\)/);
  assert.match(source, /MutationObserver/);
  assert.doesNotThrow(() => new vm.Script(source));
});

test('lookbook loader loads the core drawer before the legacy compatibility enhancer', () => {
  const loader = read('snippets/melato-living-lookbook-loader.liquid');
  const core = loader.indexOf('melato-living-look-drawer.js');
  const legacy = loader.indexOf('melato-living-look-drawer-legacy.js');
  assert.ok(core >= 0, 'core drawer asset missing');
  assert.ok(legacy > core, 'legacy enhancer must load after core custom element');
});
