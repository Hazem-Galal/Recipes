// client/public/sw.js
/**
 * Service Worker for Recipes PWA
 * Handles:
 * - Precaching app shell and static assets
 * - Runtime caching with different strategies
 * - Offline fallback page
 * - Background sync (optional)
 */

const CACHE_PREFIX = "recipes";
const CACHE_VERSION = "v1";
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const IMAGES_CACHE = `${CACHE_PREFIX}-images-${CACHE_VERSION}`;

// Assets to precache (app shell)
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
];

// Install event: precache essential assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => {
      console.log("[SW] Precaching assets:", PRECACHE_URLS);
      return cache.addAll(PRECACHE_URLS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX))
          .filter(
            (name) =>
              name !== PRECACHE_NAME && name !== RUNTIME_CACHE && name !== IMAGES_CACHE
          )
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Fetch event: implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Strategy 1: Network-First for API calls with cache fallback
  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Strategy 2: Stale-While-Revalidate for images
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Strategy 3: Cache-First for static assets
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Strategy 4: Network-First for documents
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Network-First: Try network, fallback to cache
 * Best for: API calls, documents
 */
async function networkFirstStrategy(request) {
  try {
    // Try to fetch from network
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      console.log("[SW] Cache hit (network-first):", request.url);
      return cached;
    }

    // No cache, return offline fallback for HTML
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }

    // Return error response
    return new Response("Offline - No cache available", { status: 503 });
  }
}

/**
 * Stale-While-Revalidate: Return cache immediately, update in background
 * Best for: Images, non-critical assets
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cached = await cache.match(request);

  // Return cached version immediately
  if (cached) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {
        // Network error, that's ok
      });

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
    // Network error, return a placeholder
    return new Response("Image unavailable", { status: 503 });
  }
}

/**
 * Cache-First: Return cache if available, fallback to network
 * Best for: Static assets (CSS, JS, fonts)
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(PRECACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok && request.method === "GET") {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Offline", { status: 503 });
  }
}

// Message handler for cache clearing from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.startsWith(CACHE_PREFIX)) {
          caches.delete(name);
        }
      });
    });
  }
});
