// NODE_PATH must expose Playwright. Pass a Chromium executable as argv[2] if needed.
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const inputs = ['chat-input', 'email-name', 'email-inquiry', 'email-subject', 'email-body', 'plan-item', 'plan-size', 'plan-preference', 'plan-order', 'plan-email', 'plan-need'];
const buttons = ['voice-button', 'draft-email', 'copy-email'];
const containers = ['demo-log', 'quick-replies', 'email-status', 'plan-result', 'active-service-label', 'service-prompt'];
const intents = ['fit', 'order', 'returns', 'delivery', 'care', 'products'];
const markup = '<!doctype html>' + inputs.map(id => `<input id="${id}">`).join('')
  + buttons.map(id => `<button id="${id}">${id}</button>`).join('')
  + containers.map(id => `<div id="${id}"></div>`).join('')
  + '<form id="chat-form"></form><form id="service-plan-form"><button>Build</button></form>'
  + intents.concat('__proto__', 'constructor').map(id => `<button class="service-tab" data-service="${id}">${id}</button>`).join('')
  + '<div class="field-item fit-field"></div><div class="order-field"></div><div class="need-field"></div>';

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.argv[2] ? { executablePath: process.argv[2], args: ['--no-sandbox', '--disable-gpu'] } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => { errors.push(error.message); });
    await page.route('https://melato.test/**', route => route.fulfill({ contentType: 'text/html', body: markup }));
    await page.goto('https://melato.test/');
    await page.addScriptTag({ content: fs.readFileSync('assets/melato-ai-concierge-widget.js', 'utf8').replace("const auto = !current || current.dataset.auto !== 'false';", 'const auto = false;') });
    await page.evaluate(() => { window.copied = ''; navigator.clipboard.writeText = async text => { window.copied = text; }; });
    await page.addScriptTag({ content: fs.readFileSync('assets/app.js', 'utf8') });
    for (const intent of intents) {
      await page.locator(`[data-service="${intent}"]`).click();
      await page.locator('#service-plan-form button').click();
      assert.equal(await page.locator('.plan-output').count(), 1);
      assert.ok(await page.locator('.plan-checklist li').count() > 0);
      const href = await page.locator('.result-link').getAttribute('href');
      assert.match(href, /^(https:|mailto:)/);
      await page.locator('#copy-plan').click();
      assert.equal(await page.evaluate(() => window.copied), await page.locator('.plan-draft').textContent());
    }
    for (const value of ['__proto__', 'constructor']) {
      await page.locator(`[data-service="${value}"]`).click();
      assert.equal(await page.locator('#active-service-label').textContent(), 'FIT DIRECTION');
    }
    for (const href of ['javascript:window.xss=1', 'data:text/html,<script>window.xss=1</script>']) {
      await page.evaluate(href => {
        const payload = '<img src=x onerror="window.xss=1">';
        window.MelatoAI.createServicePlan = () => ({ title: payload, intent: payload, summary: payload, draft: payload, checklist: [payload], cta: { href, label: payload } });
      }, href);
      await page.locator('#service-plan-form button').click();
      assert.equal(await page.locator('#plan-result img, #plan-result script').count(), 0);
      assert.equal(await page.locator('.plan-output h3').textContent(), '<img src=x onerror="window.xss=1">');
      assert.equal(await page.locator('.result-link').getAttribute('href'), '/pages/contact');
      assert.equal(await page.evaluate(() => window.xss), undefined);
    }
    assert.deepEqual(errors, []);
    for (const mode of ['false', 'throw', 'true']) {
      await page.evaluate(mode => {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
        document.execCommand = () => { if (mode === 'throw') throw new Error('Clipboard denied'); return mode === 'true'; };
      }, mode);
      await page.locator('#copy-plan').click();
      assert.equal(await page.locator('#copy-plan').textContent(), mode === 'true' ? 'Copied' : 'Copy unavailable');
      assert.equal(await page.locator('textarea[style*="position: fixed"]').count(), 0, 'Temporary clipboard node must always be removed');
    }
    console.log('MDP browser checks passed: six service routes, copy handoff, prototype-key fallback, literal malicious text and blocked javascript/data URLs.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
