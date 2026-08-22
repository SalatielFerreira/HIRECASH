import { showAlert } from '../components/alert.js';
import { addCandidato, listCandidatos } from '../services/candidatos.service.js';

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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function selectOptions(options) {
  return options.map((option) => `<option value="${option}">${option}</option>`).join('');
}

function formatCurrency(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function badge(text, variant) {
  return `<span class="badge badge--${variant}">${escapeHtml(text)}</span>`;
}

function candidatoRow(candidato) {
  const linkedinCell = candidato.linkedin
    ? `<a href="${escapeHtml(candidato.linkedin)}" target="_blank" rel="noopener noreferrer">Perfil</a>`
    : '—';

  return `
    <tr>
      <td>${escapeHtml(candidato.vaga)}</td>
      <td>${badge(candidato.statusVaga, STATUS_VAGA_BADGE[candidato.statusVaga] || 'neutral')}</td>
      <td>${escapeHtml(candidato.nome)}</td>
      <td>${linkedinCell}</td>
      <td>${candidato.pretensao ? formatCurrency(candidato.pretensao) : '—'}</td>
      <td>${escapeHtml(candidato.localizacao) || '—'}</td>
      <td>${escapeHtml(candidato.modalidade)}</td>
      <td>${escapeHtml(candidato.fonte)}</td>
      <td>${escapeHtml(candidato.etapa)}</td>
      <td>${badge(candidato.statusCandidato, STATUS_CANDIDATO_BADGE[candidato.statusCandidato] || 'neutral')}</td>
      <td>${escapeHtml(candidato.observacao) || '—'}</td>
    </tr>
  `;
}

function renderTable(candidatos) {
  return `
    <div class="data-table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Vaga</th>
            <th>Status da vaga</th>
            <th>Candidato</th>
            <th>LinkedIn</th>
            <th>Pretensão salarial</th>
            <th>Localização</th>
            <th>Modalidade</th>
            <th>Fonte</th>
            <th>Etapa</th>
            <th>Status do candidato</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
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
              <div class="field">
                <label for="f-vaga">Vaga</label>
                <input type="text" id="f-vaga" name="vaga" required />
              </div>

              <div class="field">
                <label for="f-status-vaga">Status da vaga</label>
                <select id="f-status-vaga" name="statusVaga">${selectOptions(STATUS_VAGA_OPTIONS)}</select>
              </div>

              <div class="field">
                <label for="f-nome">Nome do candidato</label>
                <input type="text" id="f-nome" name="nome" required />
              </div>

              <div class="field">
                <label for="f-linkedin">LinkedIn</label>
                <input
                  type="text"
                  id="f-linkedin"
                  name="linkedin"
                  placeholder="linkedin.com/in/..."
                />
              </div>

              <div class="field">
                <label for="f-pretensao">Pretensão salarial</label>
                <input
                  type="text"
                  id="f-pretensao"
                  name="pretensao"
                  inputmode="numeric"
                  placeholder="R$ 0,00"
                />
              </div>

              <div class="field">
                <label for="f-localizacao">Localização</label>
                <input type="text" id="f-localizacao" name="localizacao" placeholder="Cidade/UF" />
              </div>

              <div class="field">
                <label for="f-modalidade">Modalidade</label>
                <select id="f-modalidade" name="modalidade">${selectOptions(MODALIDADE_OPTIONS)}</select>
              </div>

              <div class="field">
                <label for="f-fonte">Fonte</label>
                <select id="f-fonte" name="fonte">${selectOptions(FONTE_OPTIONS)}</select>
              </div>

              <div class="field">
                <label for="f-etapa">Etapa</label>
                <select id="f-etapa" name="etapa">${selectOptions(ETAPA_OPTIONS)}</select>
              </div>

              <div class="field">
                <label for="f-status-candidato">Status do candidato</label>
                <select id="f-status-candidato" name="statusCandidato">${selectOptions(STATUS_CANDIDATO_OPTIONS)}</select>
              </div>

              <div class="field field--full">
                <label for="f-observacao">Observação</label>
                <textarea id="f-observacao" name="observacao" rows="3"></textarea>
              </div>
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
            <p class="text-muted">Cadastro e acompanhamento de candidatos.</p>
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
    const pretensaoInput = container.querySelector('#f-pretensao');

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

    pretensaoInput.addEventListener('input', () => {
      const digits = pretensaoInput.value.replace(/\D/g, '');
      pretensaoInput.value = digits ? formatCurrency(parseInt(digits, 10)) : '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        return;
      }

      const data = new FormData(form);
      let linkedin = (data.get('linkedin') || '').toString().trim();
      if (linkedin && !/^https?:\/\//i.test(linkedin)) {
        linkedin = `https://${linkedin}`;
      }

      const pretensaoDigits = pretensaoInput.value.replace(/\D/g, '');

      const candidato = {
        vaga: (data.get('vaga') || '').toString().trim(),
        statusVaga: data.get('statusVaga'),
        nome: (data.get('nome') || '').toString().trim(),
        linkedin,
        pretensao: pretensaoDigits ? parseInt(pretensaoDigits, 10) : 0,
        localizacao: (data.get('localizacao') || '').toString().trim(),
        modalidade: data.get('modalidade'),
        fonte: data.get('fonte'),
        etapa: data.get('etapa'),
        statusCandidato: data.get('statusCandidato'),
        observacao: (data.get('observacao') || '').toString().trim(),
      };

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
  },
};
