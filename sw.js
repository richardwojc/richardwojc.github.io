const CACHE_NAME = 'tahoe-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'finder.html',
  'safari.html',
  'terminal.html',
  'calculator.html',
  'notes.html',
  'settings.html',
  'appstore.html',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
