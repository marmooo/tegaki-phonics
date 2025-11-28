const cacheName = "2025-11-29 00:00";
const urlsToCache = [
  "/tegaki-phonics/index.js",
  "/tegaki-phonics/worker.js",
  "/tegaki-phonics/model/model.json",
  "/tegaki-phonics/model/group1-shard1of1.bin",
  "/tegaki-phonics/mp3/end.mp3",
  "/tegaki-phonics/mp3/correct3.mp3",
  "/tegaki-phonics/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
  "https://fonts.googleapis.com/css?family=Source+Code+Pro",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((e) => console.warn("Failed to cache", url, e))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
