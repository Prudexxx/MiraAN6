// sw.js - Service Worker для установки PWA с автоматическим обновлением
const CACHE_NAME = 'mira-pwa-v2'; // Обновлена версия кеша
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
      .then(() => self.skipWaiting()) // Активирует новый SW сразу после установки
  );
});

// Активация и очистка старого кеша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кеш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker активирован и готов к работе');
      return self.clients.claim(); // Принимает контроль над всеми клиентами
    })
  );
});

// Работа с кешем при запросах с проверкой обновлений
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Пробуем получить свежую версию из сети
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Обновляем кеш новой версией
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(() => {
            // Если сеть недоступна, возвращаем кешированную версию
            return cachedResponse;
          });

        // Возвращаем кешированную версию, если есть, иначе ждем сеть
        return cachedResponse || fetchPromise;
      })
  );
});

// Обработка обновлений страницы при активации нового SW
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
