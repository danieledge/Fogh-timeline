// Service Worker for Gipsy Hill Timeline
// Version-based cache management

const CACHE_VERSION = 'v2.09.1';
const CACHE_NAME = `timeline-cache-${CACHE_VERSION}`;
const urlsToCache = [
    '/',
    '/timeline.html',
    '/timeline.css',
    '/timeline-main.js',
    '/timeline-data.js',
    '/staticman-integration.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Force the new service worker to activate immediately
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old version caches
                    if (cacheName.startsWith('timeline-cache-') && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        // Try network first
        fetch(event.request)
            .then(response => {
                // If successful, cache the new response
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            console.log('Serving from cache:', event.request.url);
                            return response;
                        }
                        // If not in cache and network failed, return offline page if available
                        if (event.request.mode === 'navigate') {
                            return caches.match('/timeline.html');
                        }
                    });
            })
    );
});

// Message event - handle cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
});