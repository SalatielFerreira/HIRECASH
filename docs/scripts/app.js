import { logger } from './utils/logger.js';
import { initRouter } from './router.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((registration) => {
        logger.info('sw', 'Service worker registrado.', { scope: registration.scope });
      })
      .catch((error) => {
        logger.error('sw', 'Falha ao registrar o service worker.', String(error));
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  logger.info('app', 'HireCash iniciado.');
  initRouter();
  registerServiceWorker();
});
