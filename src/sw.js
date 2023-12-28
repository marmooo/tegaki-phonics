const CACHE_NAME = "2023-12-29 01:00";
const urlsToCache = [
  "/tegaki-phonics/",
  "/tegaki-phonics/index.js",
  "/tegaki-phonics/worker.js",
  "/tegaki-phonics/model/model.json",
  "/tegaki-phonics/model/group1-shard1of1.bin",
  "/tegaki-phonics/mp3/end.mp3",
  "/tegaki-phonics/mp3/correct3.mp3",
  "/tegaki-phonics/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.13.0/dist/tf.min.js",
  "https://fonts.googleapis.com/css?family=Source+Code+Pro",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
