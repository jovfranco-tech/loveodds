const CACHE_NAME = 'loveodds-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Let the browser handle standard non-GET requests or Firestore dynamic updates
  if (event.request.method !== 'GET' || event.request.url.includes('/firestore') || event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback or log offline
        console.log('Fetch failed, user might be offline.');
      });
    })
  );
});
