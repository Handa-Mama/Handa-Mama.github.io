/*
 * හඳ මාමා කතන්දර — offline support
 * Everything the site needs is saved on the first visit, so books can be read
 * at bedtime with no signal. Site files are always fetched fresh when online
 * (the saved copy is only used offline), so phones never get stuck on an old version.
 */
const VERSION = 'handa-mama-v4';
// painted pictures come from the Cloudinary CDN; they are kept in their own cache so new site versions don't download them again
const IMAGES = 'handa-mama-images-v1';
const CDN_HOST = 'res.cloudinary.com';
const CORE = [
  './',
  'index.html',
  'css/app.css',
  'js/vendor/page-flip.browser.js',
  'data/stories.js',
  'js/art.js',
  'js/scenes.js',
  'js/sound.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/logo-mark.svg',
  'icons/icon-192.png',
  'icons/favicon-48.png',
  'fonts/noto-serif-sinhala-sinhala-400-normal.woff2',
  'fonts/noto-serif-sinhala-sinhala-600-normal.woff2',
  'fonts/noto-serif-sinhala-latin-400-normal.woff2',
  'fonts/gemunu-libre-sinhala-500-normal.woff2',
  'fonts/gemunu-libre-sinhala-700-normal.woff2',
  'fonts/gemunu-libre-sinhala-800-normal.woff2',
  'fonts/gemunu-libre-latin-500-normal.woff2',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's own HTTP cache, so the saved copy is the newest one
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== IMAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === CDN_HOST) {
    // pictures never change at a given address: cache first, keep every one we fetch
    e.respondWith(
      caches.open(IMAGES).then((c) => c.match(req, { ignoreVary: true }).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone()).catch(() => { /* storage full: still show it */ });
        return res;
      })))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  // site files: network first (always the newest version), saved copy when offline
  e.respondWith(
    fetch(req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : new Request(req, { cache: 'no-cache' })).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
