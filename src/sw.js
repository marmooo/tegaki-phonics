var CACHE_NAME = "2022-10-15 12:58";
var urlsToCache = [
  "/tegaki-phonics/",
  "/tegaki-phonics/index.js",
  "/tegaki-phonics/index.yomi",
  "/tegaki-phonics/worker.js",
  "/tegaki-phonics/model/model.json",
  "/tegaki-phonics/model/group1-shard1of1.bin",
  "/tegaki-phonics/mp3/end.mp3",
  "/tegaki-phonics/mp3/correct3.mp3",
  "/tegaki-phonics/eraser.svg",
  "/tegaki-phonics/favicon/favicon.svg",
  "https://marmooo.github.io/yomico/yomico.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.0.10/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
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
