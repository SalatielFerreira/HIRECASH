import { showAlert } from '../components/alert.js';
import { addCandidato, listCandidatos, updateCandidato } from '../services/candidatos.service.js';

const ICON_CANDIDATO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';

const ICON_PLUS =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

const STATUS_VAGA_OPTIONS = ['Não publicada', 'Publicada', 'Congelada', 'Cancelada'];
const MODALIDADE_OPTIONS = ['Presencial', 'Remoto', 'Híbrido'];
const FONTE_OPTIONS = ['Gupy', 'Indicação', 'LinkedIn'];
const ETAPA_OPTIONS = ['Em abordagem', 'Entrevista RH', 'Entrevista técnica', 'Contratação'];
const STATUS_CANDIDATO_OPTIONS = [
  'Standby',
  'Sem retorno',
  'Sem interesse',
  'Agendado',
  'Reprovado',
  'Aprovado',
];

const STATUS_VAGA_BADGE = {
  'Não publicada': 'neutral',
  Publicada: 'success',
  Congelada: 'info',
  Cancelada: 'error',
};

const STATUS_CANDIDATO_BADGE = {
  Standby: 'warning',
  'Sem retorno': 'neutral',
  'Sem interesse': 'neutral',
  Agendado: 'info',
  Reprovado: 'error',
  Aprovado: 'success',
};

/**
 * Fonte única dos campos do candidato: o formulário do modal, as colunas da
 * tabela e o editor inline são todos derivados daqui, para que as opções
 * disponíveis na edição sejam sempre as mesmas do cadastro.
 *
 * - `label`  rótulo no formulário
 * - `header` cabeçalho na tabela (quando difere do rótulo)
 * - `type`   text | select | textarea | currency | link
 * - `badges` mapa valor → variante de badge (colore a célula na tabela)
 */
const FIELDS = [
  { key: 'vaga', label: 'Vaga', type: 'text', required: true },
  {
    key: 'statusVaga',
    label: 'Status da vaga',
    type: 'select',
    options: STATUS_VAGA_OPTIONS,
    badges: STATUS_VAGA_BADGE,
  },
  { key: 'nome', label: 'Nome do candidato', header: 'Candidato', type: 'text', required: true },
  { key: 'linkedin', label: 'LinkedIn', type: 'link', placeholder: 'linkedin.com/in/...' },
  { key: 'pretensao', label: 'Pretensão salarial', type: 'currency', placeholder: 'R$ 0,00' },
  { key: 'localizacao', label: 'Localização', type: 'text', placeholder: 'Cidade/UF' },
  { key: 'modalidade', label: 'Modalidade', type: 'select', options: MODALIDADE_OPTIONS },
  { key: 'fonte', label: 'Fonte', type: 'select', options: FONTE_OPTIONS },
  { key: 'etapa', label: 'Etapa', type: 'select', options: ETAPA_OPTIONS },
  {
    key: 'statusCandidato',
    label: 'Status do candidato',
    type: 'select',
    options: STATUS_CANDIDATO_OPTIONS,
    badges: STATUS_CANDIDATO_BADGE,
  },
  { key: 'observacao', label: 'Observação', type: 'textarea', full: true },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCurrency(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function badge(text, variant) {
  return `<span class="badge badge--${variant}">${escapeHtml(text)}</span>`;
}

function attachCurrencyMask(input) {
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? formatCurrency(parseInt(digits, 10)) : '';
  });
}

/** Converte o valor cru de um controle no valor armazenado do candidato. */
function parseValue(field, raw) {
  if (field.type === 'currency') {
    const digits = String(raw ?? '').replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  if (field.type === 'select') {
    return raw;
  }

  const value = String(raw ?? '').trim();
  if (field.type === 'link' && value && !/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

/** Valor exibido dentro do controle de edição (input/select/textarea). */
function inputValue(field, candidato) {
  const value = candidato[field.key];
  if (field.type === 'currency') {
    return value ? formatCurrency(value) : '';
  }
  return value ?? '';
}

const EMPTY_CELL = '<span class="cell-empty">—</span>';

/** Conteúdo de leitura de uma célula da tabela. */
function cellContent(field, candidato) {
  const value = candidato[field.key];

  if (field.badges) {
    return badge(value, field.badges[value] || 'neutral');
  }

  if (field.type === 'link') {
    return value
      ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">Perfil</a>`
      : EMPTY_CELL;
  }

  if (field.type === 'currency') {
    return value ? formatCurrency(value) : EMPTY_CELL;
  }

  return escapeHtml(value) || EMPTY_CELL;
}

/** Controle de edição inline de uma célula, no mesmo formato do cadastro. */
function editorHtml(field, candidato) {
  const value = candidato[field.key];

  if (field.type === 'select') {
    const options = field.options
      .map(
        (option) =>
          `<option value="${escapeHtml(option)}"${option === value ? ' selected' : ''}>${escapeHtml(option)}</option>`
      )
      .join('');
    return `<select class="cell-editor" aria-label="${escapeHtml(field.label)}">${options}</select>`;
  }

  if (field.type === 'textarea') {
    return `<textarea class="cell-editor" rows="2" aria-label="${escapeHtml(field.label)}">${escapeHtml(value)}</textarea>`;
  }

  const attrs = [
    'type="text"',
    'class="cell-editor"',
    `aria-label="${escapeHtml(field.label)}"`,
    `value="${escapeHtml(inputValue(field, candidato))}"`,
    field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
    field.type === 'currency' ? 'inputmode="numeric"' : '',
  ].filter(Boolean);

  return `<input ${attrs.join(' ')} />`;
}

function candidatoRow(candidato) {
  const cells = FIELDS.map(
    (field) =>
      `<td class="data-table__cell" data-id="${escapeHtml(candidato.id)}" data-field="${field.key}" tabindex="0">${cellContent(field, candidato)}</td>`
  ).join('');

  return `<tr>${cells}</tr>`;
}

function renderTable(candidatos) {
  return `
    <div class="data-table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            ${FIELDS.map((field) => `<th>${escapeHtml(field.header || field.label)}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="candidatos-tbody">
          ${candidatos.map(candidatoRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <section class="card empty-state">
      <span class="card__icon">${ICON_CANDIDATO}</span>
      <h2>Nenhum candidato cadastrado</h2>
      <p class="text-muted">Clique no botão + para adicionar o primeiro candidato.</p>
    </section>
  `;
}

function modalField(field) {
  const id = `f-${field.key}`;
  let control;

  if (field.type === 'select') {
    const options = field.options
      .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
      .join('');
    control = `<select id="${id}" name="${field.key}">${options}</select>`;
  } else if (field.type === 'textarea') {
    control = `<textarea id="${id}" name="${field.key}" rows="3"></textarea>`;
  } else {
    const attrs = [
      'type="text"',
      `id="${id}"`,
      `name="${field.key}"`,
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
              ${FIELDS.map(modalField).join('')}
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
    const candidatos = listCandidatos();

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

        ${candidatos.length === 0 ? renderEmptyState() : renderTable(candidatos)}
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

    FIELDS.filter((field) => field.type === 'currency').forEach((field) => {
      const input = container.querySelector(`#f-${field.key}`);
      if (input) {
        attachCurrencyMask(input);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        return;
      }

      const data = new FormData(form);
      const candidato = {};
      FIELDS.forEach((field) => {
        candidato[field.key] = parseValue(field, data.get(field.key));
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

    // ---------------------------------------------------------------
    // Edição inline: clicar em uma célula troca o texto pelo mesmo tipo
    // de controle usado no cadastro (input, select ou textarea).
    // Enter ou sair do campo salva; Esc cancela.
    // ---------------------------------------------------------------

    const tbody = container.querySelector('#candidatos-tbody');
    if (!tbody) {
      return;
    }

    let editing = null;

    function finishEdit(save) {
      if (!editing) {
        return;
      }

      const { cell, field, candidato } = editing;
      const editor = cell.querySelector('.cell-editor');

      // Zera antes de mexer no DOM: o blur disparado pela troca de
      // conteúdo abaixo cai neste guarda e não reentra.
      editing = null;

      let atualizado = candidato;

      if (save && editor) {
        const novo = parseValue(field, editor.value);

        if (field.required && !novo) {
          showAlert({
            type: 'error',
            title: 'Campo obrigatório',
            message: `${field.label} não pode ficar em branco.`,
          });
        } else if (novo !== candidato[field.key]) {
          atualizado = updateCandidato(candidato.id, { [field.key]: novo }) || candidato;
        }
      }

      cell.classList.remove('is-editing');
      cell.innerHTML = cellContent(field, atualizado);
    }

    function startEdit(cell) {
      if (editing) {
        if (editing.cell === cell) {
          return;
        }
        finishEdit(true);
      }

      const field = FIELDS.find((item) => item.key === cell.dataset.field);
      const candidato = listCandidatos().find((item) => item.id === cell.dataset.id);
      if (!field || !candidato) {
        return;
      }

      editing = { cell, field, candidato };
      cell.classList.add('is-editing');
      cell.innerHTML = editorHtml(field, candidato);

      const editor = cell.querySelector('.cell-editor');
      editor.focus();
      editor.select?.();

      if (field.type === 'currency') {
        attachCurrencyMask(editor);
      }

      if (field.type === 'select') {
        editor.addEventListener('change', () => finishEdit(true));
      }

      editor.addEventListener('blur', () => finishEdit(true));

      editor.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          finishEdit(false);
          cell.focus();
        } else if (event.key === 'Enter' && !(field.type === 'textarea' && event.shiftKey)) {
          // No textarea, Shift+Enter continua quebrando linha.
          event.preventDefault();
          finishEdit(true);
          cell.focus();
        }
      });
    }

    tbody.addEventListener('click', (event) => {
      // O link do LinkedIn abre o perfil; a edição sai pelo resto da célula.
      if (event.target.closest('a')) {
        return;
      }
      const cell = event.target.closest('.data-table__cell');
      if (cell && !cell.classList.contains('is-editing')) {
        startEdit(cell);
      }
    });

    tbody.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const cell = event.target.closest?.('.data-table__cell');
      if (cell && event.target === cell) {
        event.preventDefault();
        startEdit(cell);
      }
    });
  },
};
