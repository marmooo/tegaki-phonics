var CACHE_NAME="2022-07-18 10:30",urlsToCache=["/tegaki-phonics/","/tegaki-phonics/index.js","/tegaki-phonics/index.yomi","/tegaki-phonics/worker.js","/tegaki-phonics/model/model.json","/tegaki-phonics/model/group1-shard1of1.bin","/tegaki-phonics/mp3/end.mp3","/tegaki-phonics/mp3/correct3.mp3","/tegaki-phonics/eraser.svg","/tegaki-phonics/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/signature_pad@4.0.5/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.17.0/dist/tf.min.js","https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css","https://fonts.googleapis.com/css?family=Source+Code+Pro"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})