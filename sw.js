self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('notes').then(cache => {
            return cache.addAll([
            '/',
            '/index.html',
            '/style.css',
            '/interface.js',
            '/store.js'
        ])
        .then(() => self.skipWaiting());
    }))
});

self.addEventListener('activate',  event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
