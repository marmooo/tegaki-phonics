const CACHE_NAME="2024-05-11 16:18",urlsToCache=["/tegaki-phonics/","/tegaki-phonics/index.js","/tegaki-phonics/worker.js","/tegaki-phonics/model/model.json","/tegaki-phonics/model/group1-shard1of1.bin","/tegaki-phonics/mp3/end.mp3","/tegaki-phonics/mp3/correct3.mp3","/tegaki-phonics/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js","https://fonts.googleapis.com/css?family=Source+Code+Pro"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})