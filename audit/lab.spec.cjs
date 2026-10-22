// Auditoría no invasiva de LAB. Ejecutar: LAB_URL=http://localhost:5173 npx playwright test audit/lab.spec.cjs
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const baseURL = process.env.LAB_URL || 'http://localhost:5173';
test('inspección de interfaz, controles y errores', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push({ type: 'javascript', message: e.message }));
  page.on('console', m => { if (m.type() === 'error') errors.push({ type: 'console', message: m.text() }); });
  page.on('requestfailed', r => errors.push({ type: 'network', message: r.url() + ' ' + (r.failure()?.errorText || '') }));
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  const controls = await page.locator('button,input,select,[role="button"],[role="slider"],canvas').evaluateAll(nodes =>
    nodes.map(n => ({ tag: n.tagName, label: n.getAttribute('aria-label') || n.textContent?.trim().slice(0,80) || '', disabled: !!n.disabled, visible: !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length) }))
  );
  const report = { url: baseURL, date: new Date().toISOString(), controls, errors };
  const dir = path.join(process.cwd(), 'audit-results');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'lab-audit.json'), JSON.stringify(report, null, 2));
  await page.screenshot({ path: path.join(dir, 'lab-audit.png'), fullPage: true });
  expect(errors.filter(e => e.type === 'javascript')).toEqual([]);
});
