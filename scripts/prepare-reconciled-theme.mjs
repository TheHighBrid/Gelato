import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const themeDirectories = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const contains = (parent, child) => { const rel = relative(parent, child); return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel)); };

// Build a local candidate only. Never uploads or changes the source theme.
export function prepareTheme({ source, snapshot, output, manifest }) {
  source = realpathSync(source);
  snapshot = realpathSync(snapshot);
  output = resolve(output);
  if (existsSync(output)) throw new Error('Output must not already exist');
  const parent = realpathSync(dirname(output));
  output = join(parent, output.split(sep).at(-1));
  if (contains(source, output) || contains(output, source) || contains(snapshot, output) || contains(output, snapshot)) {
    throw new Error('Output must be outside source and snapshot');
  }
  const settings = readFileSync(join(snapshot, 'config/settings_data.json'));
  const overlay = manifest.decisions.find(row => row.path === 'config/settings_data.json');
  if (overlay?.decision !== 'private-overlay' || sha256(settings) !== overlay.liveBodySha256) {
    throw new Error('Live settings snapshot checksum mismatch; refresh evidence before assembly');
  }
  // Validate everything before creating output. Refuse symlinks in the source tree.
  const files = [];
  function collect(directory) {
    for (const entry of readdirSync(join(source, directory), { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Source symlink rejected: ${path}`);
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile() && path !== join('config', 'settings_data.json')) files.push([path, readFileSync(join(source, path))]);
    }
  }
  for (const directory of themeDirectories) if (existsSync(join(source, directory))) collect(directory);
  files.push(['config/settings_data.json', settings]);
  mkdirSync(output);
  for (const [path, content] of files) {
    mkdirSync(dirname(join(output, path)), { recursive: true });
    writeFileSync(join(output, path), content);
  }
  return { output, files: files.length, settingsSha256: sha256(settings) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [snapshot, output] = process.argv.slice(2);
  if (!snapshot || !output) throw new Error('Usage: node scripts/prepare-reconciled-theme.mjs <live-snapshot-directory> <new-output-directory>');
  const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(readFileSync(join(source, 'docs/MELATO_THEME_RECONCILIATION.json'), 'utf8'));
  console.log(JSON.stringify(prepareTheme({ source, snapshot, output, manifest })));
}
