const CACHE_NAME = 'arbitrpro-v1';
const urlsToCache = [
    './',
    './index.html',
    './dashboard.html',
    './blocked-hard.html',
    './blocked-soft.html',
    './topup.html',
    './closed.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
