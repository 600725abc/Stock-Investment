self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Service worker is active but doesn't cache everything to keep it simple
    // You can add caching logic here later if needed
});
