/**
 * Banner "Instalar aplicativo". Android/Windows/desktop usam o prompt
 * nativo do navegador (evento beforeinstallprompt). O Safari do iPhone/iPad
 * não expõe essa API — a única forma de instalar lá é manual, então
 * mostramos instruções em vez de um botão que instala sozinho.
 */
import { showBanner } from '../components/banner.js';
import { storage } from './storage.service.js';
import { logger } from '../utils/logger.js';

const ICON_INSTALL =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';

const DISMISSED_KEY = 'install_banner_dismissed';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function initInstallBanner() {
  if (isStandalone() || storage.get(DISMISSED_KEY)) {
    return;
  }

  if (isIos()) {
    showBanner({
      id: 'install',
      icon: ICON_INSTALL,
      title: 'Instale o app: toque em Compartilhar e depois em "Adicionar à Tela de Início".',
      actionLabel: 'Entendi',
      onAction: () => storage.set(DISMISSED_KEY, true),
      onDismiss: () => storage.set(DISMISSED_KEY, true),
    });
    return;
  }

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;

    showBanner({
      id: 'install',
      icon: ICON_INSTALL,
      title: 'Instalar aplicativo',
      actionLabel: 'Instalar',
      onAction: async () => {
        if (!deferredPrompt) {
          return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logger.info('install', `Prompt de instalação: ${outcome}`);
        deferredPrompt = null;
        storage.set(DISMISSED_KEY, true);
      },
      onDismiss: () => storage.set(DISMISSED_KEY, true),
    });
  });

  window.addEventListener('appinstalled', () => {
    logger.info('install', 'App instalado com sucesso.');
    storage.set(DISMISSED_KEY, true);
  });
}
