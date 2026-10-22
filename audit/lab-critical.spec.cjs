const { test, expect } = require('@playwright/test');
const baseURL = process.env.LAB_URL || 'https://ddepazos.github.io/lab/';
test('LAB: inventario de conexiones críticas 2D/3D', async ({ page }) => {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  const ids = ['photo','photoOpacity','toggle3d','meshType','depth3d','rot3d','tilt3d','anim3d','speed3d','transformMode3d','layerList','canvas','png','svg'];
  const report = {};
  for (const id of ids) {
    report[id] = await page.locator('#'+id).evaluateAll(nodes => ({ count:nodes.length, tag:nodes[0]?.tagName || null, disabled:!!nodes[0]?.disabled }));
  }
  console.log('LAB_CRITICAL_CONTROLS', JSON.stringify(report));
  for (const id of ids) expect(report[id].count, 'Falta #'+id).toBe(1);
  const three = await page.evaluate(() => ({ ready:!!window.LAB3D?.ready, canvas:!!window.LAB3D?.canvas }));
  console.log('LAB_THREE', JSON.stringify(three));
});
