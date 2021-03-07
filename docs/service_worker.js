// キャッシュファイルの指定
var CACHE_NAME = 'rpn-calc-caches';
var urlsToCache = [
    '/icon.png',
    '/index.html',
    '/manifest.json',
    '/script.js',
    '/service_worker.js',
    '/style.css',
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});