import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import rooted from './rooted-files.cjs';

const colorPattern = /#[\da-f]{3,8}\b|rgba?\(\s*[\d.,%\s/]+\)|\b(?:white|black)\b/gi;
const propertyPattern = /(?:^|[;{\s])(--[\w-]+|(?:background|color|border|outline|box-shadow|fill|stroke|caret-color|text-shadow)[\w-]*)\s*:\s*([^;{}]+)/gm;

export function auditText(filename, text) {
  const findings = [];
  const source = text.replace(/\/\*[\s\S]*?\*\//g, x => x.replace(/[^\n]/g, ' '));
  for (const declaration of source.matchAll(propertyPattern)) {
    const property = declaration[1];
    const value = declaration[2];
    for (const match of value.matchAll(colorPattern)) {
      const color = match[0].toLowerCase();
      const kind = /^rgba?\(\s*(?:255\s*,\s*255\s*,\s*255\s*,|255\s+255\s+255\s*\/)/.test(color)
        ? 'white-alpha-review'
        : property.startsWith('--') ? 'token-review'
          : property.startsWith('background') ? 'surface-review'
          : /border|outline|shadow/.test(property) ? 'boundary-review' : 'ink-review';
      const index = declaration.index + declaration[0].indexOf(value) + match.index;
      const signature = `${filename}\0${property}\0${value.trim()}\0${color}`;
      findings.push({
        file: filename,
        line: source.slice(0, index).split('\n').length,
        property, value: value.trim(), color, kind,
        fingerprint: crypto.createHash('sha256').update(signature).digest('hex'),
      });
    }
  }
  for (const match of source.matchAll(/%23[\da-f]{3,8}\b/gi)) {
    findings.push({file: filename, line: source.slice(0, match.index).split('\n').length,
      property: 'embedded-svg', color: match[0].replace(/%23/i, '#'), kind: 'svg-review'});
  }
  for (const match of source.matchAll(/\b(?:fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*["'](#[\da-f]{3,8})["']/gi)) {
    findings.push({file: filename, line: source.slice(0, match.index).split('\n').length,
      property: 'embedded-svg', color: match[1], kind: 'svg-review'});
  }
  return findings;
}

export function auditTree(root) {
  const files = rooted.rootedFiles(root);
  const findings = [];
  for (const folder of ['assets', 'sections', 'snippets', 'layout']) {
    if (!files.exists(folder)) continue;
    for (const file of files.list(folder).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!/\.(css|liquid)$/.test(file.name)) continue;
      if (file.isSymbolicLink()) throw new Error('Source symlink rejected');
      if (!file.isFile()) continue;
      const relative = `${folder}/${file.name}`;
      findings.push(...auditText(relative, files.read(relative, 'utf8')));
    }
  }
  return { mode: 'review-only', note: 'Findings require declaration-context review; legitimate ink, action-label and deferred-hero colors must not be blindly replaced.', findings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditTree(process.cwd()), null, 2));
}
