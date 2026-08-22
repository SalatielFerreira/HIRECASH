/**
 * Componente de alerta (toast) centralizado entre o topo e o meio da tela.
 * Uso: showAlert({ type: 'success', title: 'Pronto', message: '...' })
 */
import { logger } from '../utils/logger.js';

const ICONS = {
  success:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  warning:
    '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16v-4m0-4h.01"/><circle cx="12" cy="12" r="10"/></svg>',
};

const CLOSE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

const DEFAULT_DURATION = 4000;

let region = null;

function getRegion() {
  if (!region) {
    region = document.getElementById('alert-region');
  }
  return region;
}

function removeAlert(node) {
  if (!node || node.classList.contains('is-leaving')) {
    return;
  }
  node.classList.add('is-leaving');
  node.addEventListener('animationend', () => node.remove(), { once: true });
}

/**
 * @param {Object} options
 * @param {'success'|'error'|'warning'|'info'} [options.type='info']
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {number} [options.duration=4000] em ms; 0 desativa o auto-fechamento
 */
export function showAlert({ type = 'info', title, message = '', duration = DEFAULT_DURATION }) {
  const container = getRegion();
  if (!container) {
    logger.warn('alert', 'Região de alertas não encontrada no DOM.');
    return;
  }

  const node = document.createElement('div');
  node.className = `alert alert--${type}`;
  node.setAttribute('role', 'alert');
  node.style.setProperty('--alert-duration', `${duration}ms`);

  node.innerHTML = `
    <span class="alert__icon">${ICONS[type] ?? ICONS.info}</span>
    <span class="alert__body">
      <span class="alert__title">${title}</span>
      ${message ? `<span class="alert__message">${message}</span>` : ''}
    </span>
    <button type="button" class="alert__close" aria-label="Fechar alerta">${CLOSE_ICON}</button>
    ${duration > 0 ? '<span class="alert__progress"></span>' : ''}
  `;

  node.querySelector('.alert__close').addEventListener('click', () => removeAlert(node));

  container.appendChild(node);
  logger.debug('alert', `Alerta exibido (${type})`, { title, message });

  if (duration > 0) {
    setTimeout(() => removeAlert(node), duration);
  }

  return node;
}
