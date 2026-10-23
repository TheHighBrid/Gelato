const assert = require('node:assert/strict');
const test = require('node:test');

test('color audit distinguishes dark ink, inverse labels and white-alpha boundaries without rewriting them', async () => {
  const { auditText } = await import('../scripts/audit-luxury-colors.mjs');
  const css = '.title{color:#111111}.button{background:#111111;color:#ffffff}.panel{border:1px solid rgba(255, 255, 255, .1)}';
  const result = auditText('assets/example.css', css);
  assert.equal(result.length, 4);
  assert.equal(result[0].kind, 'ink-review');
  assert.equal(result[1].kind, 'surface-review');
  assert.equal(result[2].kind, 'ink-review');
  assert.equal(result[3].kind, 'white-alpha-review');
});

test('audit ignores comments, keeps line evidence and fingerprints stable across unrelated line additions', async () => {
  const { auditText } = await import('../scripts/audit-luxury-colors.mjs');
  const css = '/* background:#000; */\n.card { background: var(--surface, #080808); }';
  const first = auditText('sections/card.liquid', css);
  const shifted = auditText('sections/card.liquid', '\n'+css);
  assert.equal(first.length, 1);
  assert.equal(first[0].line, 2);
  assert.equal(shifted[0].line, 3);
  assert.equal(first[0].fingerprint, shifted[0].fingerprint);
});

test('audit reports literal embedded SVG colors for separate icon review', async () => {
  const { auditText } = await import('../scripts/audit-luxury-colors.mjs');
  const result = auditText('assets/icons.css', '.icon{background-image:url("data:image/svg+xml,%3Csvg fill=%23F4EAD8%3E")}');
  assert.ok(result.some(x => x.kind === 'svg-review' && x.color === '#F4EAD8'));
});

test('audit includes legacy hardcoded custom-property colors without treating them as safe by default', async () => {
  const { auditText } = await import('../scripts/audit-luxury-colors.mjs');
  const result = auditText('assets/legacy.css', ':root{--house-pdp-canvas:#080808;--house-pdp-ink:#ffffff}');
  assert.equal(result.length, 2);
  assert.ok(result.every(x => x.kind === 'token-review'));
});

test('audit catches modern white-alpha syntax and inline SVG attributes', async () => {
  const { auditText } = await import('../scripts/audit-luxury-colors.mjs');
  const result = auditText('snippets/icon.liquid', '.card{border:1px solid rgba(255 255 255 / .1)}\n<svg><path fill="#F4EAD8" stroke="#111"/></svg>');
  assert.equal(result[0].kind, 'white-alpha-review');
  assert.deepEqual(result.filter(x => x.kind === 'svg-review').map(x => x.color), ['#F4EAD8', '#111']);
});
