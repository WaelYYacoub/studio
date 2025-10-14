// Service Worker for Guardian Gate Guard PWA
// Enhanced version with proper Next.js asset caching

const CACHE_NAME = 'gate-guard-v2';
const OFFLINE_URL = '/gate-guard';

// Core files to cache immediately during installation
const CORE_ASSETS = [
  OFFLINE_URL,
  '/Opening Gate.gif',
  '/Closing Gate.gif',
  '/success.mp3',
  '/denied.mp3',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Core assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        return self.clients.claim(); // Take control of all pages immediately
      })
  );
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip Firebase/Firestore API calls - these must always go to network
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase.com')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', url.pathname);
          
          // Still fetch from network in background to update cache
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {
              // Network fetch failed, but we already have cached version
            });
          
          return cachedResponse;
        }

        // No cached response, try network
        return fetch(request)
          .then((networkResponse) => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache successful responses for future offline use
            cache.put(request, responseToCache);
            console.log('[Service Worker] Cached new resource:', url.pathname);

            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed, offline mode:', error);
            
            // If requesting a page (not an asset), return offline page
            if (request.headers.get('accept').includes('text/html')) {
              return cache.match(OFFLINE_URL);
            }

            // For other resources, let it fail naturally
            throw error;
          });
      });
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
