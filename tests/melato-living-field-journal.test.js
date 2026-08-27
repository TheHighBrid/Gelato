/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const sectionPath = path.join(root, 'sections', 'melato-living-field-journal.liquid');
const templatePath = path.join(root, 'templates', 'page.melato-living.json');
const scriptPath = path.join(root, 'assets', 'melato-living-field-journal.js');

test('Field Journal ships as an isolated Shopify template with its interaction layer', () => {
  assert.equal(fs.existsSync(sectionPath), true, 'the Field Journal section has not been created');
  assert.equal(fs.existsSync(templatePath), true, 'the Field Journal template has not been created');
  assert.equal(fs.existsSync(scriptPath), true, 'the Field Journal interaction script has not been created');

  const section = fs.readFileSync(sectionPath, 'utf8');
  const template = fs.readFileSync(templatePath, 'utf8');
  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(template, /"type":\s*"melato-living-field-journal"/);
  assert.match(section, /data-field-journal/);
  assert.match(section, /data-field-journal-drawer/);
  assert.match(section, /data-field-journal-archive/);
  assert.match(section, /prefers-reduced-motion/);
  assert.match(section, /loading="lazy"/);
  assert.match(section, /routes\.cart_add_url/);
  assert.match(section, /aria-modal="true"/);
  assert.match(section, /data-look-open/);
  assert.match(section, /data-archive-open/);
  assert.match(script, /trapFocus/);
  assert.match(script, /shopify:section:unload/);
  assert.match(script, /fieldJournal:look-open/);
});

test('Field Journal scripting returns focus and confines the visible archive to an intentional initial edit', () => {
  assert.equal(fs.existsSync(scriptPath), true, 'the Field Journal interaction script has not been created');
  const script = fs.readFileSync(scriptPath, 'utf8');
  const section = fs.readFileSync(sectionPath, 'utf8');

  assert.match(script, /previousFocus/);
  assert.match(script, /\.focus\(\)/);
  assert.match(section, /archive_initial_count/);
  assert.match(section, /data-archive-load-more/);
  assert.match(section, /hidden/);
});
