/**
 * Service Worker do HireCash.
 * Estratégia: cache-first para o app shell, com atualização em segundo plano
 * (stale-while-revalidate) para os demais recursos do mesmo domínio.
 *
 * IMPORTANTE: incremente CACHE_VERSION a cada release para invalidar o cache antigo.
 */
const CACHE_VERSION = 'hirecash-v6';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',
  './scripts/app.js',
  './scripts/router.js',
  './scripts/version.js',
  './scripts/components/alert.js',
  './scripts/components/banner.js',
  './scripts/pages/dashboard.js',
  './scripts/pages/candidato.js',
  './scripts/pages/comissao.js',
  './scripts/pages/configuracao.js',
  './scripts/services/storage.service.js',
  './scripts/services/candidatos.service.js',
  './scripts/services/update.service.js',
  './scripts/services/install.service.js',
  './scripts/utils/logger.js',
  './scripts/utils/theme.js',
  './icons/icon.svg',
];

// IMPORTANTE: sem self.skipWaiting() aqui de propósito. Numa atualização
// (já existe um service worker ativo controlando as abas abertas), a nova
// versão fica "esperando" até o usuário clicar em "Atualizar" no banner —
// só então o app manda skipWaiting via postMessage (ver mensagem abaixo).
// Numa primeira instalação (sem worker anterior), a ativação acontece
// normalmente, sem atraso, porque não há nada "esperando".
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
