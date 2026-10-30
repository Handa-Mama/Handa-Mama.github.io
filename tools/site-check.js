// Opens the live site like a phone would and reports what each picture did.
// Run by .github/workflows/site-check.yml (GitHub's servers can reach the site and Cloudinary).
const { chromium, devices } = require('playwright');
const SITE = process.env.SITE || 'https://handa-mama.github.io/';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  const failed = [];
  page.on('console', (m) => console.log(`[console.${m.type()}]`, m.text()));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('requestfailed', (r) => failed.push(`${r.failure() && r.failure().errorText} ${r.url()}`));
  page.on('response', async (r) => {
    if (r.url().includes('res.cloudinary.com')) {
      const h = r.headers();
      console.log('[cdn]', r.status(), h['content-type'], 'acao=' + h['access-control-allow-origin'], 'corp=' + h['cross-origin-resource-policy'], r.url().split('/upload/')[1]);
    }
  });
  for (const round of ['first visit', 'reload']) {
    await page.goto(SITE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const shelf = await page.evaluate(() => ({
      sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      photos: [...document.querySelectorAll('.book-card img.scene-photo')].map((i) => ({ src: i.currentSrc.split('/upload/')[1], ok: i.complete && i.naturalWidth > 0 })),
      drawings: document.querySelectorAll('.book-card svg.scene').length,
      scenesJs: [...document.scripts].map((s) => s.src).filter(Boolean),
    }));
    console.log(`== ${round}:`, JSON.stringify(shelf, null, 1));
  }
  await page.click('.book-card');
  await page.waitForTimeout(4000);
  const book = await page.evaluate(() => ({
    photos: [...document.querySelectorAll('.page img.scene-photo')].map((i) => i.complete && i.naturalWidth > 0),
    drawings: document.querySelectorAll('.page svg.scene').length,
  }));
  console.log('== book:', JSON.stringify(book));
  await page.screenshot({ path: 'site-check.png' });
  console.log('== failed requests:', JSON.stringify(failed, null, 1));
  await browser.close();
})();
