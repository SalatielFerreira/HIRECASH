/**
 * Service Worker do HireCash.
 * Estratégia: cache-first para o app shell, com atualização em segundo plano
 * (stale-while-revalidate) para os demais recursos do mesmo domínio.
 *
 * IMPORTANTE: incremente CACHE_VERSION a cada release para invalidar o cache antigo.
 */
const CACHE_VERSION = 'hirecash-v19';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',

  // Todos os CSS precisam estar aqui, não só o main.css: o navegador
  // resolve os @import dele como requisições próprias, e o que não está
  // no app shell não é rebaixado no install de uma versão nova — fica
  // saindo do cache antigo até a revalidação em segundo plano. Era isso
  // que fazia uma release aparecer com HTML novo e CSS velho no primeiro
  // carregamento. Ao acrescentar um CSS em main.css, acrescente aqui também.
  './styles/main.css',
  './styles/base/reset.css',
  './styles/base/variables.css',
  './styles/base/typography.css',
  './styles/components/topbar.css',
  './styles/components/bottomnav.css',
  './styles/components/alert.css',
  './styles/components/banner.css',
  './styles/components/card.css',
  './styles/components/form.css',
  './styles/components/modal.css',
  './styles/components/table.css',
  './styles/pages/dashboard.css',
  './styles/pages/candidato.css',
  './styles/pages/comissao.css',
  './styles/pages/configuracao.css',

  './scripts/app.js',
  './scripts/router.js',
  './scripts/version.js',
  './scripts/components/alert.js',
  './scripts/components/banner.js',
  './scripts/components/candidatos-table.js',
  './scripts/components/confirm.js',
  './scripts/pages/dashboard.js',
  './scripts/pages/candidato.js',
  './scripts/pages/comissao.js',
  './scripts/pages/configuracao.js',
  './scripts/services/storage.service.js',
  './scripts/services/candidato-opcoes.js',
  './scripts/services/candidatos.service.js',
  './scripts/services/comissao.service.js',
  './scripts/services/vagas.service.js',
  './scripts/services/update.service.js',
  './scripts/services/install.service.js',
  './scripts/utils/format.js',
  './scripts/utils/logger.js',
  './scripts/utils/theme.js',
  // Idem para os ícones: favicon e apple-touch saem do index.html, e os
  // 192/512 do manifest — todos referenciados por caminho próprio.
  './icons/icon.svg',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
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
