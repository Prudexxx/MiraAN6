// sw.js - Service Worker для установки PWA
const CACHE_NAME = 'mira-pwa-v1';
const urlsToCache = [
  '/MiraAN3/',
  '/MiraAN3/index.html',
  '/MiraAN3/manifest.json',
  '/MiraAN3/icon-192.png',
  '/MiraAN3/icon-512.png'
];

// Установка Service Worker и кеширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кеш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Работа с кешем при запросах
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});