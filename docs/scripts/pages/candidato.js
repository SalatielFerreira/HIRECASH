import { showAlert } from '../components/alert.js';
import { showConfirm } from '../components/confirm.js';
import {
  CAMPOS,
  attachCurrencyMask,
  campo,
  criarTabelaCandidatos,
  ordenarPorVaga,
  parseValue,
  resolveOptions,
} from '../components/candidatos-table.js';
import { addCandidato, listCandidatos } from '../services/candidatos.service.js';
import { addVaga, deleteVaga, listVagas, updateVaga } from '../services/vagas.service.js';
import { ETAPA_EM_ATIVIDADE, STATUS_CONTRATADO } from '../services/candidato-opcoes.js';
import { escapeHtml } from '../utils/format.js';

const ICON_CANDIDATO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';

const ICON_PLUS =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

// Maleta com um "+" dentro, no lugar da alça — para diferenciar do "+"
// simples de adicionar candidato.
const ICON_VAGA =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 11v6M9 14h6"/></svg>';

const ICON_EDIT =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';

const ICON_TRASH =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>';

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

/** HTML das `<option>` de um campo select, com placeholder opcional. */
function selectOptionsHtml(field) {
  const placeholderHtml = field.placeholder
    ? `<option value="" disabled selected>${escapeHtml(field.placeholder)}</option>`
    : '';
  const optionsHtml = resolveOptions(field)
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join('');
  return placeholderHtml + optionsHtml;
}

function modalField(key) {
  const field = campo(key);
  const id = `f-${key}`;
  let control;

  if (field.type === 'select') {
    control = `<select id="${id}" name="${key}"${field.required ? ' required' : ''}>${selectOptionsHtml(field)}</select>`;
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

function vagaItemHtml(vaga) {
  return `
    <li class="vaga-item" data-id="${escapeHtml(vaga.id)}">
      <span class="vaga-item__nome">${escapeHtml(vaga.nome)}</span>
      <span class="vaga-item__acoes">
        <button type="button" class="vaga-item__botao" data-editar-vaga aria-label="Editar vaga" title="Editar">
          ${ICON_EDIT}
        </button>
        <button type="button" class="vaga-item__botao" data-excluir-vaga aria-label="Excluir vaga" title="Excluir">
          ${ICON_TRASH}
        </button>
      </span>
    </li>
  `;
}

function vagasListaHtml() {
  const vagas = listVagas();
  if (vagas.length === 0) {
    return '<p class="text-muted vagas-vazio">Nenhuma vaga cadastrada ainda.</p>';
  }
  return `<ul class="vagas-list">${vagas.map(vagaItemHtml).join('')}</ul>`;
}

function renderVagasModal() {
  return `
    <div class="modal-overlay" id="vagas-modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="vagas-modal-title">
        <div class="modal__header">
          <h2 id="vagas-modal-title" class="modal__title">Vagas</h2>
          <button type="button" class="modal__close" id="vagas-modal-close" aria-label="Fechar">
            ${ICON_CLOSE}
          </button>
        </div>

        <div class="modal__body">
          <form id="vaga-form" class="vaga-form">
            <input type="text" id="f-nome-vaga" name="nome" placeholder="Nome da vaga" required />
            <button type="submit" class="btn btn--primary">Adicionar</button>
          </form>

          <div id="vagas-lista">${vagasListaHtml()}</div>
        </div>
      </div>
    </div>
  `;
}

/** Alterna Tab entre os elementos focáveis de um modal aberto. */
function setupFocusTrap(overlay) {
  return function trap(event) {
    if (event.key !== 'Tab') {
      return;
    }
    const focusable = Array.from(
      overlay.querySelectorAll('button, input, select, textarea, a[href]')
    ).filter((el) => !el.disabled && el.offsetParent !== null);
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
  };
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
          <div class="page-header__actions">
            <button
              type="button"
              class="icon-button icon-button--outline"
              id="btn-add-vaga"
              aria-label="Adicionar vaga"
              title="Adicionar vaga"
            >
              ${ICON_VAGA}
            </button>
            <button
              type="button"
              class="icon-button"
              id="btn-add-candidato"
              aria-label="Adicionar candidato"
              title="Adicionar candidato"
            >
              ${ICON_PLUS}
            </button>
          </div>
        </header>

        ${candidatos.length === 0 ? renderEmptyState() : tabela.render(candidatos)}
        ${renderModal()}
        ${renderVagasModal()}
      </div>
    `;
  },

  init(container) {
    // --- Modal de candidato ---------------------------------------------

    const overlay = container.querySelector('#candidato-modal-overlay');
    const openButton = container.querySelector('#btn-add-candidato');
    const closeButton = container.querySelector('#candidato-modal-close');
    const form = container.querySelector('#candidato-form');
    const candidatoTrap = setupFocusTrap(overlay);

    let lastFocused = null;

    function openModal() {
      if (listVagas().length === 0) {
        showAlert({
          type: 'warning',
          title: 'Cadastre uma vaga primeiro',
          message:
            'Antes de adicionar um candidato, cadastre pelo menos uma vaga no botão ao lado.',
        });
        return;
      }

      lastFocused = document.activeElement;
      overlay.classList.add('is-open');
      container.classList.add('no-scroll');
      document.addEventListener('keydown', candidatoTrap);
      container.querySelector('#f-vaga')?.focus();
    }

    // Única forma de fechar o modal é pelo botão "X" — não fecha ao
    // clicar fora nem com a tecla Esc, para não perder dados digitados.
    function closeModal() {
      overlay.classList.remove('is-open');
      container.classList.remove('no-scroll');
      document.removeEventListener('keydown', candidatoTrap);
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

    // --- Modal de vagas --------------------------------------------------

    const vagasOverlay = container.querySelector('#vagas-modal-overlay');
    const openVagasButton = container.querySelector('#btn-add-vaga');
    const closeVagasButton = container.querySelector('#vagas-modal-close');
    const vagaForm = container.querySelector('#vaga-form');
    const vagaInput = container.querySelector('#f-nome-vaga');
    const vagasLista = container.querySelector('#vagas-lista');
    const vagasTrap = setupFocusTrap(vagasOverlay);

    let vagasLastFocused = null;

    function openVagasModal() {
      vagasLastFocused = document.activeElement;
      vagasOverlay.classList.add('is-open');
      container.classList.add('no-scroll');
      document.addEventListener('keydown', vagasTrap);
      vagaInput.focus();
    }

    // Mesmo funcionamento do modal de candidato: só fecha pelo "X". Ao
    // fechar, a página é re-renderizada — uma vaga renomeada ou excluída
    // aqui pode ter mudado nomes e status exibidos na tabela por trás.
    function closeVagasModal() {
      vagasOverlay.classList.remove('is-open');
      container.classList.remove('no-scroll');
      document.removeEventListener('keydown', vagasTrap);
      vagaForm.reset();
      vagasLastFocused?.focus();

      container.innerHTML = candidatoPage.render();
      candidatoPage.init(container);
    }

    openVagasButton.addEventListener('click', openVagasModal);
    closeVagasButton.addEventListener('click', closeVagasModal);

    function renderVagasLista() {
      vagasLista.innerHTML = vagasListaHtml();
    }

    vagaForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nome = vagaInput.value.trim();
      if (!nome) {
        return;
      }

      const nova = addVaga(nome);
      if (!nova) {
        showAlert({
          type: 'warning',
          title: 'Vaga já existe',
          message: `Já existe uma vaga chamada "${nome}".`,
        });
        return;
      }

      vagaForm.reset();
      renderVagasLista();
      vagaInput.focus();
      showAlert({
        type: 'success',
        title: 'Vaga adicionada',
        message: `"${nova.nome}" já pode ser escolhida no cadastro de candidato.`,
      });
    });

    function startEditVaga(item) {
      const nomeSpan = item.querySelector('.vaga-item__nome');
      const nomeAtual = nomeSpan.textContent;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'cell-editor';
      input.value = nomeAtual;
      nomeSpan.replaceWith(input);
      input.focus();
      input.select();

      // Zera antes de mexer no DOM, mesmo padrão da edição inline da
      // tabela: o blur disparado pela troca de conteúdo cai neste guarda
      // e não reentra.
      let done = false;

      function finish(save) {
        if (done) {
          return;
        }
        done = true;

        if (save) {
          const novoNome = input.value.trim();
          if (novoNome && novoNome !== nomeAtual) {
            const atualizado = updateVaga(item.dataset.id, novoNome);
            if (!atualizado) {
              showAlert({
                type: 'error',
                title: 'Não foi possível renomear',
                message: `Já existe uma vaga chamada "${novoNome}".`,
              });
              renderVagasLista();
              return;
            }
            showAlert({
              type: 'success',
              title: 'Vaga renomeada',
              message: `"${nomeAtual}" agora é "${novoNome}".`,
            });
          }
        }

        renderVagasLista();
      }

      input.addEventListener('blur', () => finish(true));
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          finish(true);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          finish(false);
        }
      });
    }

    async function excluirVaga(id, nome) {
      const confirmado = await showConfirm({
        title: 'Excluir vaga',
        message:
          `Excluir "${nome}"? Candidatos já cadastrados com essa vaga continuam com o ` +
          'nome salvo — ela só sai da lista de opções.',
        confirmLabel: 'Excluir',
      });

      if (!confirmado) {
        return;
      }

      deleteVaga(id);
      renderVagasLista();
      showAlert({
        type: 'success',
        title: 'Vaga excluída',
        message: `"${nome}" foi removida da lista de vagas.`,
      });
    }

    vagasLista.addEventListener('click', (event) => {
      const editarBotao = event.target.closest('[data-editar-vaga]');
      if (editarBotao) {
        startEditVaga(editarBotao.closest('.vaga-item'));
        return;
      }

      const excluirBotao = event.target.closest('[data-excluir-vaga]');
      if (excluirBotao) {
        const item = excluirBotao.closest('.vaga-item');
        excluirVaga(item.dataset.id, item.querySelector('.vaga-item__nome')?.textContent || '');
      }
    });
  },
};
