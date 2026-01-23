const CACHE_NAME = "fbs-cache-v3"; // Versionnée pour forcer la mise à jour
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/assets/logo/icon-192.png",
  "/assets/logo/icon-512.png"
];

self.addEventListener("install", (event) => {
  // Forcer l'installation immédiate
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  // Prendre le contrôle immédiat des clients (pages ouvertes)
  event.waitUntil(clients.claim());

  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
