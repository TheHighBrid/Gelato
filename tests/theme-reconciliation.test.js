const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('docs/MELATO_THEME_RECONCILIATION.json'));
const parse = text => JSON.parse(text.replace(/^\/\*[\s\S]*?\*\//, ''));

test('complete live inventory has one explicit disposition per file and imported bytes are intact', () => {
  assert.equal(manifest.completeInventory, true);
  assert.equal(manifest.decisions.length, 283);
  assert.equal(new Set(manifest.decisions.map(row => row.path)).size, 283);
  for (const row of manifest.decisions) {
    assert.ok(row.reason);
    if (row.decision === 'import-live') {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, row.path))).digest('hex');
      assert.equal(hash, row.liveBodySha256, row.path);
    }
  }
});

test('reconciled homepage keeps current editor artwork, disabled slots and existing shopping links', () => {
  const home = parse(read('templates/index.json'));
  const video = home.sections.video_Hm6knQ.settings;
  assert.equal(video.cover_image, 'shopify://shop_images/Melato.ca__EL_TLL_FRAME_100_AP.png');
  assert.equal(video.primary_link, '/collections/new-arrivals');
  assert.equal(video.secondary_link, '/pages/living-lookbook');
  assert.equal(home.sections.melato_service_hero_CdQdE4.disabled, true);
  assert.equal(home.sections.video_LXiWPt.disabled, true);
  assert.equal(home.sections.melato_world_orb_kPPgtR.block_order.length, 7);
  for (const id of home.order) assert.ok(home.sections[id], id);
});

test('existing live dependencies load in order and new luxury tokens remain inactive', () => {
  const layout = read('layout/theme.liquid');
  assert.ok(layout.indexOf("'theme.css'") < layout.indexOf("'melato-collection-navigation.css'"));
  assert.ok(layout.indexOf("'theme.js'") < layout.indexOf("'melato-dynamic-announcement.js'"));
  assert.ok(!layout.includes('melato-luxury-tokens.css'));
  assert.match(read('sections/main-collection.liquid'), /render "melato-collection-tabs"/);
  assert.ok(!read('assets/melato-pdp-cleanup-20260818.js').includes('new MutationObserver'));
});

async function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'melato-reconciliation-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const source = path.join(temporary, 'source');
  const snapshot = path.join(temporary, 'snapshot');
  for (const directory of [source, snapshot]) fs.mkdirSync(path.join(directory, 'config'), { recursive: true });
  fs.writeFileSync(path.join(source, 'config/settings_data.json'), '{"current":"repository"}');
  const live = Buffer.from('{"current":{"blocks":{"app":{"settings":{"merchant":"preserve"}}}}}\n');
  fs.writeFileSync(path.join(snapshot, 'config/settings_data.json'), live);
  const manifest = { decisions: [{ path: 'config/settings_data.json', decision: 'private-overlay', liveBodySha256: crypto.createHash('sha256').update(live).digest('hex') }] };
  const { prepareTheme } = await import('../scripts/prepare-reconciled-theme.mjs');
  return { source, snapshot, output: path.join(temporary, 'candidate'), manifest, prepareTheme, live };
}

test('candidate assembly preserves live app/settings bytes without changing repository settings', async t => {
  const f = await fixture(t);
  f.prepareTheme(f);
  assert.deepEqual(fs.readFileSync(path.join(f.output, 'config/settings_data.json')), f.live);
  assert.equal(fs.readFileSync(path.join(f.source, 'config/settings_data.json'), 'utf8'), '{"current":"repository"}');
  assert.throws(() => f.prepareTheme(f), /already exist/);
});

test('assembly rejects changed settings before creating any candidate', async t => {
  const f = await fixture(t);
  fs.appendFileSync(path.join(f.snapshot, 'config/settings_data.json'), ' ');
  assert.throws(() => f.prepareTheme(f), /checksum mismatch/);
  assert.equal(fs.existsSync(f.output), false);
});

test('assembly refuses output inside repository and source symlinks', async t => {
  const f = await fixture(t);
  assert.throws(() => f.prepareTheme({ ...f, output: path.join(f.source, 'candidate') }), /outside/);
  fs.symlinkSync(path.join(f.snapshot, 'config/settings_data.json'), path.join(f.source, 'config/link.json'));
  assert.throws(() => f.prepareTheme(f), /symlink rejected/);
  assert.equal(fs.existsSync(f.output), false);
});
