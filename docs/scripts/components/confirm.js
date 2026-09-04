/**
 * Telinha de confirmação (sim/não) sobre a tela atual.
 *
 * Uso: `if (await showConfirm({ title: '...', message: '...' })) { ... }`
 *
 * Diferente do modal de cadastro, este fecha ao cancelar, ao clicar fora
 * e com Esc — não há nada digitado para se perder, e uma pergunta de
 * confirmação precisa ser fácil de recusar.
 */
import { escapeHtml } from '../utils/format.js';

const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

/**
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {string} [options.confirmLabel='Confirmar']
 * @param {string} [options.cancelLabel='Cancelar']
 * @param {string} [options.confirmClass='btn--primary'] variante do botão de confirmar
 * @returns {Promise<boolean>} `true` se confirmou
 */
export function showConfirm({
  title,
  message = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmClass = 'btn--primary',
}) {
  return new Promise((resolve) => {
    const lastFocused = document.activeElement;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay is-open';
    overlay.innerHTML = `
      <div class="modal modal--confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="modal__header">
          <h2 id="confirm-title" class="modal__title">${escapeHtml(title)}</h2>
          <button type="button" class="modal__close" data-confirm-cancel aria-label="Fechar">
            ${ICON_CLOSE}
          </button>
        </div>

        ${message ? `<div class="modal__body"><p>${escapeHtml(message)}</p></div>` : ''}

        <div class="modal__footer modal__footer--split">
          <button type="button" class="btn btn--outline" data-confirm-cancel>
            ${escapeHtml(cancelLabel)}
          </button>
          <button type="button" class="btn ${confirmClass}" data-confirm-ok>
            ${escapeHtml(confirmLabel)}
          </button>
        </div>
      </div>
    `;

    function fechar(resposta) {
      document.removeEventListener('keydown', aoTeclar);
      overlay.remove();
      lastFocused?.focus?.();
      resolve(resposta);
    }

    function aoTeclar(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        fechar(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focaveis = Array.from(overlay.querySelectorAll('button'));
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-confirm-cancel]')) {
        fechar(false);
      } else if (event.target.closest('[data-confirm-ok]')) {
        fechar(true);
      }
    });

    document.addEventListener('keydown', aoTeclar);
    document.body.appendChild(overlay);

    // Foco começa no cancelar: numa ação que desfaz algo, o caminho
    // seguro é o que fica sob a tecla Enter.
    overlay.querySelector('[data-confirm-cancel]')?.focus();
  });
}
