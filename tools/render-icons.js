// Renders the logo lockups and app icons to PNG.
// Dev-only helper: needs Playwright (`npm i -D playwright`), run with `node tools/render-icons.js`.
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const fs = require('fs');
const markSvg = fs.readFileSync(path.join(root, 'icons/logo-mark.svg'), 'utf8');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  // Logo lockups (dark + light)
  await page.goto('file://' + path.join(root, 'tools/logo.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await (await page.$('#dark')).screenshot({ path: path.join(root, 'icons/logo-dark.png'), omitBackground: true });
  await (await page.$('#light')).screenshot({ path: path.join(root, 'icons/logo-light.png'), omitBackground: true });

  // Square icons
  const icon = async (size, file, { pad = 0, bg = null } = {}) => {
    const p = await browser.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><head><style>svg{width:100%;height:100%;display:block}</style></head><body style="margin:0;background:${bg || 'transparent'};display:grid;place-items:center;width:${size}px;height:${size}px">
      <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${markSvg}</div></body></html>`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(root, 'icons', file), omitBackground: !bg });
    await p.close();
  };
  await icon(512, 'icon-512.png');
  await icon(192, 'icon-192.png');
  await icon(512, 'icon-maskable-512.png', { pad: 52, bg: '#151C3B' });
  await icon(180, 'apple-touch-icon.png', { pad: 10, bg: '#151C3B' });
  await icon(48, 'favicon-48.png');
  await browser.close();
  console.log('icons rendered');
})();
