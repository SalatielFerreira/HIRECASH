/**
 * Detecta quando uma nova versão do service worker foi instalada e está
 * esperando para assumir, e mostra o banner "Atualização disponível".
 */
import { showBanner } from '../components/banner.js';
import { logger } from '../utils/logger.js';

const ICON_UPDATE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>';

function promptUpdate(registration) {
  showBanner({
    id: 'update',
    icon: ICON_UPDATE,
    title: 'Atualização disponível',
    actionLabel: 'Atualizar',
    onAction: () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      logger.info('update', 'Usuário confirmou a atualização.');
    },
  });
}

export function initUpdateBanner(registration) {
  if (!registration) {
    return;
  }

  // Já existe uma versão nova esperando quando a página carregou.
  if (registration.waiting && navigator.serviceWorker.controller) {
    promptUpdate(registration);
  }

  // Uma versão nova terminou de instalar enquanto o app estava aberto.
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) {
      return;
    }
    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        logger.info('update', 'Nova versão baixada, aguardando confirmação do usuário.');
        promptUpdate(registration);
      }
    });
  });

  // Depois que o usuário confirma, a nova versão assume e a página recarrega.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) {
      return;
    }
    reloading = true;
    window.location.reload();
  });

  // Verifica se há atualização sempre que o usuário volta para a aba.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      registration.update().catch(() => {
        // offline ou sem rede — ignora, tenta de novo na próxima vez.
      });
    }
  });
}
