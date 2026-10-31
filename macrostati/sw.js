const CACHE = 'macrostati-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/scenarios.js',
  './js/content.js',
  './js/engine.js',
  './js/ui.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(ev.request).then(res => {
        if (res && res.ok && new URL(ev.request.url).origin === location.origin) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copia));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
