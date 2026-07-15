/* FORJA — Service Worker
   Cachea la app para que funcione sin conexión.
   Cambia CACHE_VERSION cuando actualices la app para forzar la actualización. */

const CACHE_VERSION = "forja-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-512-maskable.png"
];

// Instalación: guarda los archivos en caché
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () { /* algún icono podría faltar, no es crítico */ });
    })
  );
  self.skipWaiting();
});

// Activación: borra cachés viejas de versiones anteriores
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: sirve desde caché y, si no está, va a la red (cache-first)
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        return resp;
      }).catch(function () {
        // sin conexión y sin caché: devuelve la portada si es una navegación
        if (event.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
