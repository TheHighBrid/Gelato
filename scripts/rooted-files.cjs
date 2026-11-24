// Local CLI filesystem boundary. Callers choose a root; entries must stay below it.
const fs = require('node:fs');
const path = require('node:path');

function contains(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

function rootedFiles(directory) {
  const root = fs.realpathSync(directory);
  if (!fs.statSync(root).isDirectory()) throw new Error('Root must be a directory');

  function checked(entry, allowMissing = false) {
    if (typeof entry !== 'string' || !entry || entry.includes('\0') || entry.includes('\\') || /^[A-Za-z]:/.test(entry) || path.isAbsolute(entry)) {
      throw new Error('Expected a relative path below the selected root');
    }
    const parts = entry.split('/');
    if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Path traversal rejected');
    const target = path.resolve(root, ...parts);
    if (!contains(root, target)) throw new Error('Path escapes selected root');
    let current = root;
    for (const part of parts) {
      current = path.join(current, part);
      try {
        if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Source symlink rejected');
        if (!contains(root, fs.realpathSync(current))) throw new Error('Path escapes selected root');
      } catch (error) {
        if (!allowMissing || error.code !== 'ENOENT') throw error;
      }
    }
    return target;
  }

  function read(entry, encoding) {
    const target = checked(entry);
    const descriptor = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
    try {
      if (!fs.fstatSync(descriptor).isFile()) throw new Error('Expected a regular file');
      return fs.readFileSync(descriptor, encoding);
    } finally {
      fs.closeSync(descriptor);
    }
  }

  return {
    root, read,
    exists(entry) {
      try { checked(entry); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
    },
    list(entry) { return fs.readdirSync(checked(entry), { withFileTypes: true }); },
    mkdir(entry) { fs.mkdirSync(checked(entry, true), { recursive: true, mode: 0o700 }); },
    writeNew(entry, bytes) { fs.writeFileSync(checked(entry, true), bytes, { flag: 'wx', mode: 0o600 }); },
    checked,
  };
}

module.exports = { contains, rootedFiles };
