import { logger } from './utils/logger.js';
import { initRouter } from './router.js';
import { initUpdateBanner } from './services/update.service.js';
import { initInstallBanner } from './services/install.service.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then((registration) => {
        logger.info('sw', 'Service worker registrado.', { scope: registration.scope });
        initUpdateBanner(registration);
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
  initInstallBanner();
});
