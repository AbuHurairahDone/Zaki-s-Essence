// Service Worker for advanced caching and network optimization
const CACHE_NAME = 'zakis-essence-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/src/main.jsx',
    '/src/index.css',
    '/logo.png',
    '/manifest.json'
];

// Cache durations (in seconds)
const CACHE_DURATIONS = {
    STATIC: 365 * 24 * 60 * 60, // 1 year
    IMAGES: 30 * 24 * 60 * 60,  // 30 days
    DYNAMIC: 7 * 24 * 60 * 60,  // 7 days
    API: 60 * 60                // 1 hour
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => !isCurrentCache(cacheName))
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Handle different types of requests
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isImage(url)) {
        event.respondWith(handleImage(request));
    } else if (isAPI(url)) {
        event.respondWith(handleAPI(request));
    } else if (isCloudinary(url)) {
        event.respondWith(handleCloudinary(request));
    } else {
        event.respondWith(handleDynamic(request));
    }
});

// Check if cache is current
function isCurrentCache(cacheName) {
    return cacheName === STATIC_CACHE ||
        cacheName === DYNAMIC_CACHE ||
        cacheName === IMAGE_CACHE;
}

// Asset type checkers
function isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|ico|png|jpg|jpeg|svg|woff2?)$/);
}

function isImage(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);
}

function isAPI(url) {
    return url.pathname.startsWith('/api/') ||
        url.hostname.includes('firestore') ||
        url.hostname.includes('firebase');
}

function isCloudinary(url) {
    return url.hostname.includes('cloudinary.com');
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        return response;
    } catch (error) {
        console.error('Failed to fetch static asset:', error);
        return new Response('Network error', { status: 503 });
    }
}

// Cache-first with optimization for images
async function handleImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const responseClone = response.clone();
            cache.put(request, responseClone);
        }
        return response;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        // Return placeholder image
        return new Response(await getPlaceholderImage(), {
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

// Network-first for API calls with short cache
async function handleAPI(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    try {
        const response = await fetch(request);
        if (response.ok) {
            const responseClone = response.clone();
            // Add expiration header
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-expires', Date.now() + (CACHE_DURATIONS.API * 1000));

            const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });

            cache.put(request, modifiedResponse);
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached && !isCacheExpired(cached)) {
            return cached;
        }
        throw error;
    }
}

// Optimized handling for Cloudinary images
async function handleCloudinary(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const url = new URL(request.url);

    // Add auto-optimization parameters if not present
    if (!url.searchParams.has('f_auto')) {
        url.searchParams.set('f_auto', 'auto');
    }
    if (!url.searchParams.has('q_auto')) {
        url.searchParams.set('q_auto', 'auto');
    }

    const optimizedRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        mode: request.mode,
        credentials: request.credentials
    });

    const cached = await cache.match(optimizedRequest);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(optimizedRequest);
        if (response.ok) {
            cache.put(optimizedRequest, response.clone());
        }
        return response;
    } catch (error) {
        console.error('Failed to fetch Cloudinary image:', error);
        return new Response(await getPlaceholderImage(), {
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}

// Stale-while-revalidate for dynamic content
async function handleDynamic(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);

    // Return cached version immediately if available
    if (cached) {
        // Revalidate in background
        fetch(request)
            .then(response => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            })
            .catch(error => console.error('Background revalidation failed:', error));

        return cached;
    }

    // No cache, fetch from network
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('Failed to fetch dynamic content:', error);
        return new Response('Network error', { status: 503 });
    }
}

// Check if cached response is expired
function isCacheExpired(response) {
    const expires = response.headers.get('sw-cache-expires');
    if (!expires) return false;
    return Date.now() > parseInt(expires);
}

// Generate placeholder SVG image
async function getPlaceholderImage() {
    const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
        Image not available
      </text>
    </svg>
  `;
    return svg;
}

// Background sync for failed requests
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Retry failed requests when back online
    const cache = await caches.open('failed-requests');
    const requests = await cache.keys();

    for (const request of requests) {
        try {
            await fetch(request);
            await cache.delete(request);
        } catch (error) {
            console.error('Background sync failed for:', request.url);
        }
    }
}

// Push notification handling
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/logo.png',
            badge: '/logo.png',
            data: data.data,
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/logo.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            self.clients.openWindow(event.notification.data.url || '/')
        );
    }
});
