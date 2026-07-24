/**
 * Service Worker Engine - Siraman Digital PWA
 * Caching Strategy: Network First with Cache Fallback for App Shell & Dynamic Assets
 */

const CACHE_NAME = "siraman-digital-v1";

// Asset utama (App Shell) yang langsung disimpan ke cache saat install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/assets/css/variables.css",
  "/assets/css/main.css",
  "/assets/css/components.css",
  "/assets/js/app.js",
  "/assets/js/utils/theme.js",
  "/assets/js/utils/helpers.js",
  "/assets/js/config/firebase-config.js",
  "/assets/js/services/firestore-service.js",
  "/assets/js/services/storage-service.js",
  "/assets/js/services/image-compressor.js",
  "/assets/images/logo.svg",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png"
];

// Event Install: Cache aset statis dasar
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching App Shell...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Event Activate: Hapus cache versi lama jika ada pembaruan
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] Menghapus Cache Lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Event Fetch: Network First, Fallback to Cache, then Offline Page
self.addEventListener("fetch", (event) => {
  // Abaikan request bukan GET / extension internal
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika response valid, simpan salinan ke cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Jika jaringan terputus/offline:
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Jika mengakses halaman HTML tetapi offline dan tak ada cache -> buka offline.html
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/offline.html");
        }
      })
  );
});
