/**
 * Banner persistente (diferente do alert): fica na tela até o usuário agir
 * ou fechar — usado para "atualização disponível" e "instalar aplicativo".
 */
import { logger } from '../utils/logger.js';

const CLOSE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

function getRegion() {
  return document.getElementById('banner-region');
}

function removeBanner(node) {
  if (!node || node.classList.contains('is-leaving')) {
    return;
  }
  node.classList.add('is-leaving');
  node.addEventListener('animationend', () => node.remove(), { once: true });
}

/**
 * @param {Object} options
 * @param {string} options.id identificador único (evita duplicar o mesmo banner)
 * @param {string} options.icon SVG do ícone
 * @param {string} options.title texto principal
 * @param {string} options.actionLabel texto do botão de ação
 * @param {() => void} [options.onAction] clique no botão de ação
 * @param {() => void} [options.onDismiss] clique no X
 */
export function showBanner({ id, icon, title, actionLabel, onAction, onDismiss }) {
  const region = getRegion();
  if (!region) {
    logger.warn('banner', 'Região de banners não encontrada no DOM.');
    return;
  }

  if (region.querySelector(`[data-banner-id="${id}"]`)) {
    return;
  }

  const node = document.createElement('div');
  node.className = 'banner';
  node.dataset.bannerId = id;
  node.setAttribute('role', 'status');

  node.innerHTML = `
    <span class="banner__icon">${icon}</span>
    <span class="banner__text">${title}</span>
    <button type="button" class="banner__action">${actionLabel}</button>
    <button type="button" class="banner__close" aria-label="Fechar">${CLOSE_ICON}</button>
  `;

  node.querySelector('.banner__action').addEventListener('click', () => {
    onAction?.();
    removeBanner(node);
  });

  node.querySelector('.banner__close').addEventListener('click', () => {
    removeBanner(node);
    onDismiss?.();
  });

  region.appendChild(node);
  logger.debug('banner', `Banner exibido: ${id}`, { title });
}

export function dismissBanner(id) {
  const node = getRegion()?.querySelector(`[data-banner-id="${id}"]`);
  removeBanner(node);
}
