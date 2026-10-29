/*
 * හඳ මාමා කතන්දර — offline support
 * Everything the site needs is cached on the first visit, so books can be read
 * at bedtime with no signal. Change VERSION whenever you publish new stories.
 */
const VERSION = 'handa-mama-v1';
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
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache first, then network; new files are saved for next time
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
