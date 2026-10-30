import { lstatSync, mkdirSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import rooted from './rooted-files.cjs';

const themeDirectories = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
const { contains, rootedFiles } = rooted;

// Build a local candidate only. Never uploads or changes the source theme.
export function prepareTheme({ source, snapshot, output, manifest }) {
  const sourceFiles = rootedFiles(source);
  const snapshotFiles = rootedFiles(snapshot);
  source = sourceFiles.root;
  snapshot = snapshotFiles.root;
  output = resolve(output);
  try { lstatSync(output); throw new Error('Output must not already exist'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const parent = realpathSync(dirname(output));
  output = join(parent, basename(output));
  if (contains(source, output) || contains(output, source) || contains(snapshot, output) || contains(output, snapshot)) {
    throw new Error('Output must be outside source and snapshot');
  }
  const settings = snapshotFiles.read('config/settings_data.json');
  const overlay = manifest.decisions.find(row => row.path === 'config/settings_data.json');
  if (overlay?.decision !== 'private-overlay' || sha256(settings) !== overlay.liveBodySha256) {
    throw new Error('Live settings snapshot checksum mismatch; refresh evidence before assembly');
  }
  // Validate everything before creating output. Refuse symlinks in the source tree.
  const files = [];
  function collect(directory) {
    for (const entry of sourceFiles.list(directory)) {
      const path = `${directory}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Source symlink rejected: ${path}`);
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile() && path !== 'config/settings_data.json') files.push([path, sourceFiles.read(path)]);
    }
  }
  for (const directory of themeDirectories) if (sourceFiles.exists(directory)) collect(directory);
  files.push(['config/settings_data.json', settings]);
  mkdirSync(output, { mode: 0o700 });
  const targetFiles = rootedFiles(output);
  for (const [path, content] of files) {
    targetFiles.mkdir(dirname(path));
    targetFiles.writeNew(path, content);
  }
  return { output, files: files.length, settingsSha256: sha256(settings) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [snapshot, output] = process.argv.slice(2);
  if (!snapshot || !output) throw new Error('Usage: node scripts/prepare-reconciled-theme.mjs <live-snapshot-directory> <new-output-directory>');
  const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(rootedFiles(source).read('docs/MELATO_THEME_RECONCILIATION.json', 'utf8'));
  console.log(JSON.stringify(prepareTheme({ source, snapshot, output, manifest })));
}
