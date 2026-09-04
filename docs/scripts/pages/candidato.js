import { showAlert } from '../components/alert.js';
import {
  CAMPOS,
  attachCurrencyMask,
  campo,
  criarTabelaCandidatos,
  ordenarPorVaga,
  parseValue,
} from '../components/candidatos-table.js';
import { addCandidato, listCandidatos } from '../services/candidatos.service.js';
import { ETAPA_EM_ATIVIDADE, STATUS_CONTRATADO } from '../services/candidato-opcoes.js';
import { escapeHtml } from '../utils/format.js';

const ICON_CANDIDATO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';

const ICON_PLUS =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

/**
 * Colunas do cadastro. Contratação, Nível e Comissão são da página de
 * Comissão e por isso ficam de fora daqui.
 */
const COLUNAS = [
  'vaga',
  'statusVaga',
  'nome',
  'linkedin',
  'pretensao',
  'localizacao',
  'modalidade',
  'fonte',
  'etapa',
  'statusCandidato',
  'observacao',
];

const tabela = criarTabelaCandidatos({ colunas: COLUNAS, editaveis: COLUNAS });

function renderEmptyState() {
  return `
    <section class="card empty-state">
      <span class="card__icon">${ICON_CANDIDATO}</span>
      <h2>Nenhum candidato cadastrado</h2>
      <p class="text-muted">Clique no botão + para adicionar o primeiro candidato.</p>
    </section>
  `;
}

function modalField(key) {
  const field = campo(key);
  const id = `f-${key}`;
  let control;

  if (field.type === 'select') {
    const options = field.options
      .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
      .join('');
    control = `<select id="${id}" name="${key}">${options}</select>`;
  } else if (field.type === 'textarea') {
    control = `<textarea id="${id}" name="${key}" rows="3"></textarea>`;
  } else {
    const attrs = [
      'type="text"',
      `id="${id}"`,
      `name="${key}"`,
      field.required ? 'required' : '',
      field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
      field.type === 'currency' ? 'inputmode="numeric"' : '',
    ].filter(Boolean);
    control = `<input ${attrs.join(' ')} />`;
  }

  return `
    <div class="field${field.full ? ' field--full' : ''}">
      <label for="${id}">${escapeHtml(field.label)}</label>
      ${control}
    </div>
  `;
}

function renderModal() {
  return `
    <div class="modal-overlay" id="candidato-modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="candidato-modal-title">
        <div class="modal__header">
          <h2 id="candidato-modal-title" class="modal__title">Adicionar candidato</h2>
          <button type="button" class="modal__close" id="candidato-modal-close" aria-label="Fechar">
            ${ICON_CLOSE}
          </button>
        </div>

        <form id="candidato-form" class="modal__form" novalidate>
          <div class="modal__body">
            <div class="form-grid">
              ${COLUNAS.map(modalField).join('')}
            </div>
          </div>

          <div class="modal__footer">
            <button type="submit" class="btn btn--primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export const candidatoPage = {
  title: 'Candidato',

  render() {
    const candidatos = ordenarPorVaga(listCandidatos());

    return `
      <div class="page-candidato page-enter">
        <header class="page-header page-header--with-action">
          <div>
            <h1>Candidato</h1>
            <p class="text-muted">
              Cadastro e acompanhamento de candidatos.
              ${candidatos.length > 0 ? 'Clique em qualquer campo da tabela para editar.' : ''}
            </p>
          </div>
          <button type="button" class="icon-button" id="btn-add-candidato" aria-label="Adicionar candidato">
            ${ICON_PLUS}
          </button>
        </header>

        ${candidatos.length === 0 ? renderEmptyState() : tabela.render(candidatos)}
        ${renderModal()}
      </div>
    `;
  },

  init(container) {
    const overlay = container.querySelector('#candidato-modal-overlay');
    const openButton = container.querySelector('#btn-add-candidato');
    const closeButton = container.querySelector('#candidato-modal-close');
    const form = container.querySelector('#candidato-form');

    let lastFocused = null;

    function getFocusable() {
      return Array.from(
        overlay.querySelectorAll('button, input, select, textarea, a[href]')
      ).filter((el) => !el.disabled && el.offsetParent !== null);
    }

    function trapFocus(event) {
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = getFocusable();
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function openModal() {
      lastFocused = document.activeElement;
      overlay.classList.add('is-open');
      container.classList.add('no-scroll');
      document.addEventListener('keydown', trapFocus);
      container.querySelector('#f-vaga')?.focus();
    }

    // Única forma de fechar o modal é pelo botão "X" — não fecha ao
    // clicar fora nem com a tecla Esc, para não perder dados digitados.
    function closeModal() {
      overlay.classList.remove('is-open');
      container.classList.remove('no-scroll');
      document.removeEventListener('keydown', trapFocus);
      form.reset();
      lastFocused?.focus();
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    COLUNAS.filter((key) => CAMPOS[key].type === 'currency').forEach((key) => {
      const input = container.querySelector(`#f-${key}`);
      if (input) {
        attachCurrencyMask(input);
      }
    });

    // A regra que deriva a etapa do status vive no serviço, então salvar
    // já grava certo. Espelhar aqui é para o usuário ver o campo mudar
    // enquanto preenche, em vez de descobrir só depois na tabela.
    const statusSelect = container.querySelector('#f-statusCandidato');
    const etapaSelect = container.querySelector('#f-etapa');
    if (statusSelect && etapaSelect) {
      statusSelect.addEventListener('change', () => {
        if (statusSelect.value === STATUS_CONTRATADO) {
          etapaSelect.value = ETAPA_EM_ATIVIDADE;
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        return;
      }

      const data = new FormData(form);
      const candidato = {};
      COLUNAS.forEach((key) => {
        candidato[key] = parseValue(campo(key), data.get(key));
      });

      addCandidato(candidato);
      closeModal();
      showAlert({
        type: 'success',
        title: 'Candidato adicionado',
        message: `${candidato.nome} foi salvo com sucesso.`,
      });

      // Re-renderiza a página para exibir a nova linha na tabela.
      container.innerHTML = candidatoPage.render();
      candidatoPage.init(container);
    });

    tabela.init(container);
  },
};
