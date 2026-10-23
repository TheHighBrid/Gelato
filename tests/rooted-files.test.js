const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { rootedFiles } = require('../scripts/rooted-files.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'melato-path-boundary-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = rootedFiles(root);
  files.mkdir('safe');
  files.writeNew('safe/document.css', '.card{color:#fff}');
  return files;
}

test('root boundary rejects traversal, absolute paths, NUL, drive and backslash paths', t => {
  const files = fixture(t);
  for (const entry of ['../secret', 'safe/../../secret', '/etc/passwd', 'C:/secret', 'safe\\secret', 'safe/./document.css', 'safe//document.css', 'safe/\0']) {
    assert.throws(() => files.read(entry), /relative path|traversal|escapes/);
  }
  assert.equal(files.read('safe/document.css', 'utf8'), '.card{color:#fff}');
});

test('root boundary rejects symlinked directories, leaves and dangling symlinks', t => {
  const files = fixture(t);
  fs.symlinkSync(files.checked('safe'), files.checked('directory-link', true));
  fs.symlinkSync(files.checked('safe/document.css'), files.checked('leaf.css', true));
  fs.symlinkSync(files.checked('missing', true), files.checked('dangling.css', true));
  for (const entry of ['directory-link/document.css', 'leaf.css', 'dangling.css']) {
    assert.throws(() => files.read(entry), /symlink rejected/);
    assert.throws(() => files.exists(entry), /symlink rejected/);
  }
});

test('exclusive output never overwrites existing content and uses private permissions', t => {
  const files = fixture(t);
  assert.throws(() => files.writeNew('safe/document.css', 'replaced'), /EEXIST/);
  assert.equal(files.read('safe/document.css', 'utf8'), '.card{color:#fff}');
  if (process.platform !== 'win32') assert.equal(fs.statSync(files.checked('safe/document.css')).mode & 0o777, 0o600);
});

test('audit refuses symlinked theme files and directories instead of reading outside root', async t => {
  const files = fixture(t);
  const { auditTree } = await import('../scripts/audit-luxury-colors.mjs');
  files.mkdir('assets');
  fs.symlinkSync(files.checked('safe/document.css'), files.checked('assets/leak.css', true));
  assert.throws(() => auditTree(files.root), /symlink rejected/);
});

test('assembler rejects a symlinked snapshot settings file before creating output', async t => {
  const files = fixture(t);
  files.mkdir('source/config');
  files.mkdir('snapshot/config');
  fs.symlinkSync(files.checked('safe/document.css'), files.checked('snapshot/config/settings_data.json', true));
  const { prepareTheme } = await import('../scripts/prepare-reconciled-theme.mjs');
  assert.throws(() => prepareTheme({ source: files.checked('source'), snapshot: files.checked('snapshot'), output: files.checked('candidate', true), manifest: { decisions: [] } }), /symlink rejected/);
  assert.equal(files.exists('candidate'), false);
});
