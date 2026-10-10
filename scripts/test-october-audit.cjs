const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Liquid } = require('liquidjs');

async function main() {
  const engine = new Liquid({ root: 'snippets', extname: '.liquid' });
  const calendar = fs.readFileSync('sections/melato-popup-calendar.liquid', 'utf8').split('{% schema %}')[0];
  const cases = [
    ['2026-08-19', 3, 0, 'NEXT OPERATION'],
    ['2026-08-20', 3, 0, 'TODAY'],
    ['2026-08-21', 2, 1, 'NEXT OPERATION'],
    ['2026-09-21', 2, 1, 'TODAY'],
    ['2026-10-10', 1, 2, 'NEXT OPERATION'],
    ['2026-10-21', 1, 2, 'TODAY'],
    ['2026-10-22', 0, 3, null],
    ['2027-01-01', 0, 3, null]
  ];
  for (const [today, upcomingCount, archiveCount, firstStatus] of cases) {
    const source = calendar.replace("'now' | date: '%Y-%m-%d'", `'${today}'`);
    const html = await engine.parseAndRender(source, { section: { id: 'test' } });
    const active = html.split('aria-label="Upcoming Melato popup shows">')[1].split('melato-popup__mechanics')[0];
    const archived = html.split('aria-label="Past Melato popup shows">')[1].split('Reports, photographs')[0];
    assert.equal((active.match(/<article/g) || []).length, upcomingCount, today);
    assert.equal((archived.match(/<article/g) || []).length, archiveCount, today);
    assert.equal((active.match(/event--next/g) || []).length, upcomingCount ? 1 : 0, today);
    if (firstStatus) assert.match(active, new RegExp(`melato-popup__status">${firstStatus}`));
    else assert.match(active, /Future show dates will be announced here/);
    assert.ok(!active.includes('ARCHIVED DATE'));
    assert.ok(!archived.includes('NEXT OPERATION'));
  }
  const fit = 'Wide-leg track pant with elasticated waist and drawcord.';
  const shipping = 'Ships in 1 to 3 business days. Complimentary delivery on all orders. Returns accepted on eligible unworn items under the posted return policy.';
  const source = fs.readFileSync('snippets/melato-rendered-output-filters-base.liquid', 'utf8');
  const html = await engine.parseAndRender(source, {
    html: `<form data-bis-root></form><p class="pdp-shipping-returns">${shipping}</p><details><summary>Fit</summary>${fit}</details>`,
    context: 'main', template: { name: 'product' },
    product: { title: 'Shell Company Technical Track Pant', product_type: 'Track Pants', options: ['Size'], metafields: { custom: { fit_notes: { value: fit } } } },
    shop: { enabled_payment_types: [] }
  });
  assert.equal(html.split(fit).length - 1, 1, 'Fit must render once');
  assert.equal(html.split('Ships in 1 to 3 business days.').length - 1, 1, 'Dispatch must render once');
  assert.equal(html.split('Complimentary delivery on all orders.').length - 1, 1, 'Delivery must render once');
  assert.ok(!html.includes('<strong>Returns</strong>'), 'No duplicate return fact');
  assert.ok(!html.includes('<ul class="pdp-conversion-assurances__trust"'), 'No duplicate trust list');
  console.log('October audit regression checks passed: 8 date boundaries and single-owner PDP copy.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
