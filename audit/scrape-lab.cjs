// Scraping controlado de la interfaz pública de LAB: inventario, sin datos privados.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const url = process.env.LAB_URL || 'https://ddepazos.github.io/lab/';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const data = await page.evaluate(() => ({
      title: document.title,
      headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim()),
      controls: [...document.querySelectorAll('button,input,select,canvas')].map(e => ({
        tag: e.tagName.toLowerCase(), id: e.id || null,
        type: e.getAttribute('type'), label: e.getAttribute('aria-label') || e.textContent?.trim().slice(0, 100) || ''
      })),
      links: [...document.querySelectorAll('a[href]')].filter(e => /^https?:/.test(e.href)).map(e => ({ text: e.textContent.trim().slice(0, 80), url: e.href })),
      threeReady: Boolean(window.LAB3D?.ready)
    }));
    const dir = path.join(process.cwd(), 'audit-results');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'lab-scrape.json'), JSON.stringify({ url, capturedAt: new Date().toISOString(), ...data }, null, 2));
    console.log('Scraping LAB:', data.controls.length, 'controles;', data.links.length, 'enlaces.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
