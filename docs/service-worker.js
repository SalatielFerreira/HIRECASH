/**
 * Service Worker do HireCash.
 * Estratégia: cache-first para o app shell, com atualização em segundo plano
 * (stale-while-revalidate) para os demais recursos do mesmo domínio.
 *
 * IMPORTANTE: incremente CACHE_VERSION a cada release para invalidar o cache antigo.
 */
const CACHE_VERSION = 'hirecash-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',
  './scripts/app.js',
  './scripts/router.js',
  './scripts/components/alert.js',
  './scripts/pages/dashboard.js',
  './scripts/pages/candidato.js',
  './scripts/pages/comissao.js',
  './scripts/pages/configuracao.js',
  './scripts/services/storage.service.js',
  './scripts/services/candidatos.service.js',
  './scripts/utils/logger.js',
  './scripts/utils/theme.js',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
