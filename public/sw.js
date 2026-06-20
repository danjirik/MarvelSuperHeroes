const CACHE_NAME = 'msh-2hg-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching Initial Assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Only handle HTTP/HTTPS (ignore chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = event.request.url;
  const isImage = url.includes('/images/') || 
                  url.endsWith('.png') || 
                  url.endsWith('.jpg') || 
                  url.endsWith('.jpeg') || 
                  url.endsWith('.webp') || 
                  url.endsWith('.ico');

  if (isImage) {
    // Cache First for images (high speed offline loading of card illustrations)
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
  } else {
    // Network First for documents, JS scripts, CSS stylesheets, manifests (avoids stale code white page issues)
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        // If successful, cache it and return
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigation request and not in cache, fallback to index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
