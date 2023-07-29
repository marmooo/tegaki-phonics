var CACHE_NAME = "2023-07-29 10:17";
var urlsToCache = [
  "/tegaki-phonics/",
  "/tegaki-phonics/index.js",
  "/tegaki-phonics/worker.js",
  "/tegaki-phonics/model/model.json",
  "/tegaki-phonics/model/group1-shard1of1.bin",
  "/tegaki-phonics/mp3/end.mp3",
  "/tegaki-phonics/mp3/correct3.mp3",
  "/tegaki-phonics/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.1.6/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.9.0/dist/tf.min.js",
  "https://fonts.googleapis.com/css?family=Source+Code+Pro",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
