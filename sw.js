const CACHE_NAME = 'deposito-el-compa-v2';
const ASSETS = [
  './',
  './index.html',
  './pedidos.html',
  './admin.html',
  './integrador.html',
  './panel-solicitudes.html',
  './panel-tecnico.html',
  './panel-repartidor.html',
  './panel-corte.html',
  './panel-operativo.html',
  './panel-productos.html',
  './panel-repartidores.html',
  './panel-archivo.html',
  './js/deposito-api.js',
  './css/deposito-unified.css',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const isHtmlNav = request.mode === 'navigate' || request.destination === 'document';
  if (isHtmlNav) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match(request).then(hit => hit || Response.error()))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(hit => {
      if (hit) return hit;
      return fetch(request).then(response => {
        if (response && response.status === 200 && request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => hit || Response.error());
    })
  );
});
