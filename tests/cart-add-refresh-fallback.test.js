'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Guard the post-commit error path: retrying a successful add duplicates items.
test('committed add with failed cart refresh navigates to authoritative cart', () => {
  const source = fs.readFileSync(path.join(__dirname, '../assets/melato-cart-drawer.js'), 'utf8');
  const start = source.indexOf('async function addForm(');
  const end = source.indexOf('function trapTab(', start);
  assert.ok(start >= 0 && end > start, 'addForm handler exists');
  const handler = source.slice(start, end);
  assert.match(handler, /let addSucceeded = false;/);
  assert.match(handler, /if \(!response\.ok\) throw[\s\S]*?addSucceeded = true;[\s\S]*?await fetchCart\(\)/);
  assert.match(handler, /catch \(error\)[\s\S]*?if \(addSucceeded\) \{\s*window\.location\.assign\(route\('cart'\)\)/);
  assert.match(handler, /else \{\s*toast\(error\.message \|\| 'Unable to add to cart\.'\)/);
});
