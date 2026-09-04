/**
 * Tabela de candidatos estilo planilha, com busca e edição inline.
 *
 * As páginas Candidato e Comissão mostram o mesmo cadastro com colunas
 * diferentes e regras de edição diferentes, então a tabela vive aqui e
 * cada página só declara quais colunas quer e quais delas são editáveis.
 */
import { showAlert } from './alert.js';
import { listCandidatos, updateCandidato } from '../services/candidatos.service.js';
import { calcularParcelas, NIVEL_OPTIONS } from '../services/comissao.service.js';
import {
  ETAPA_OPTIONS,
  FONTE_OPTIONS,
  MODALIDADE_OPTIONS,
  STATUS_CANDIDATO_OPTIONS,
  STATUS_VAGA_OPTIONS,
} from '../services/candidato-opcoes.js';
import { escapeHtml, formatCurrency, formatDate, normalizar } from '../utils/format.js';

const ICON_SEARCH =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

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
  Contratado: 'success',
};

const VAZIO = '<span class="cell-empty">—</span>';

function badge(text, variant) {
  return `<span class="badge badge--${variant}">${escapeHtml(text)}</span>`;
}

/**
 * Parcelas da comissão, uma por linha dentro da célula, rotuladas P1 e
 * P2. Os três pedaços de cada linha (rótulo, data e valor) são filhos
 * diretos de uma grade de três colunas, então ficam alinhados entre as
 * linhas sem depender de largura fixa.
 */
function renderComissao(candidato) {
  const parcelas = calcularParcelas(candidato.contratacao, candidato.nivel);
  if (parcelas.length === 0) {
    return VAZIO;
  }

  const celulas = parcelas
    .map(
      (parcela, indice) =>
        `<span class="parcela__rotulo">P${indice + 1}</span>` +
        `<span class="parcela__data">${formatDate(parcela.data)}</span>` +
        `<span class="parcela__valor">${formatCurrency(parcela.valor)}</span>`
    )
    .join('');

  return `<span class="parcelas">${celulas}</span>`;
}

/**
 * Catálogo de todos os campos do candidato — fonte única para o
 * formulário de cadastro, os cabeçalhos da tabela e o editor inline.
 *
 * - `label`  rótulo no formulário
 * - `header` cabeçalho na tabela (quando difere do rótulo)
 * - `type`   text | select | textarea | currency | link | date | computed
 * - `badges` mapa valor → variante de badge (colore a célula)
 */
export const CAMPOS = {
  vaga: { label: 'Vaga', type: 'text', required: true },
  statusVaga: {
    label: 'Status da vaga',
    type: 'select',
    options: STATUS_VAGA_OPTIONS,
    badges: STATUS_VAGA_BADGE,
  },
  nome: { label: 'Nome do candidato', header: 'Candidato', type: 'text', required: true },
  linkedin: { label: 'LinkedIn', type: 'link', placeholder: 'linkedin.com/in/...' },
  pretensao: { label: 'Pretensão salarial', type: 'currency', placeholder: 'R$ 0,00' },
  localizacao: { label: 'Localização', type: 'text', placeholder: 'Cidade/UF' },
  modalidade: { label: 'Modalidade', type: 'select', options: MODALIDADE_OPTIONS },
  fonte: { label: 'Fonte', type: 'select', options: FONTE_OPTIONS },
  etapa: { label: 'Etapa', type: 'select', options: ETAPA_OPTIONS },
  statusCandidato: {
    label: 'Status do candidato',
    type: 'select',
    options: STATUS_CANDIDATO_OPTIONS,
    badges: STATUS_CANDIDATO_BADGE,
  },
  observacao: { label: 'Observação', type: 'textarea', full: true },
  contratacao: { label: 'Contratação', type: 'date' },
  nivel: { label: 'Nível', type: 'select', options: NIVEL_OPTIONS },
  comissao: { label: 'Comissão', type: 'computed', render: renderComissao },
};

/** Campo com a chave embutida, para não precisar carregar as duas coisas. */
export function campo(key) {
  return { key, ...CAMPOS[key] };
}

/**
 * Ordenação em português, ignorando maiúsculas e acentos, e com números
 * lidos como números — "Vaga 2" vem antes de "Vaga 10", não depois.
 */
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

/** Lista ordenada pelo nome da vaga; empate desempata pelo nome do candidato. */
export function ordenarPorVaga(candidatos) {
  return [...candidatos].sort(
    (a, b) =>
      collator.compare(a.vaga || '', b.vaga || '') || collator.compare(a.nome || '', b.nome || '')
  );
}

/**
 * Lista ordenada pela data de contratação, da mais recente para a mais
 * antiga.
 *
 * As datas são comparadas como texto: em "AAAA-MM-DD" a ordem alfabética
 * já é a ordem cronológica, então não é preciso converter para `Date` —
 * e assim não há fuso horário envolvido.
 *
 * Quem ainda não tem data vai para o topo, e não para o fim: é um
 * contratado recém-marcado, à espera do preenchimento — deixá-lo no fim
 * da lista o esconderia justamente quando precisa de atenção. Empates
 * desempatam pelo nome da vaga.
 */
export function ordenarPorContratacao(candidatos) {
  return [...candidatos].sort((a, b) => {
    const dataA = a.contratacao || '';
    const dataB = b.contratacao || '';

    if (dataA === dataB) {
      return collator.compare(a.vaga || '', b.vaga || '');
    }
    if (!dataA) {
      return -1;
    }
    if (!dataB) {
      return 1;
    }
    return dataB.localeCompare(dataA);
  });
}

/** Texto que a barra de busca compara: vaga + nome do candidato. */
function textoBusca(candidato) {
  return normalizar(`${candidato.vaga || ''} ${candidato.nome || ''}`);
}

export function attachCurrencyMask(input) {
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? formatCurrency(parseInt(digits, 10)) : '';
  });
}

/** Converte o valor cru de um controle no valor armazenado do candidato. */
export function parseValue(field, raw) {
  if (field.type === 'currency') {
    const digits = String(raw ?? '').replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  if (field.type === 'select' || field.type === 'date') {
    return raw ?? '';
  }

  const value = String(raw ?? '').trim();
  if (field.type === 'link' && value && !/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

/** Conteúdo de leitura de uma célula. */
function cellContent(field, candidato) {
  if (field.type === 'computed') {
    return field.render(candidato);
  }

  const value = candidato[field.key];

  if (field.badges) {
    return value ? badge(value, field.badges[value] || 'neutral') : VAZIO;
  }

  if (field.type === 'link') {
    return value
      ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">Perfil</a>`
      : VAZIO;
  }

  if (field.type === 'currency') {
    return value ? formatCurrency(value) : VAZIO;
  }

  if (field.type === 'date') {
    return formatDate(value) || VAZIO;
  }

  return escapeHtml(value) || VAZIO;
}

/** Controle de edição inline, no mesmo formato do cadastro. */
function editorHtml(field, candidato) {
  const value = candidato[field.key] ?? '';
  const rotulo = escapeHtml(field.label);

  if (field.type === 'select') {
    const vazia = `<option value=""${value ? '' : ' selected'}>—</option>`;

    // Valores atribuídos pelo app ("Em atividade", "Baixa") não estão
    // na lista de opções. Sem incluir o valor atual, o select abriria em
    // outra opção e salvar trocaria o dado sem o usuário pedir.
    const foraDaLista = value && !field.options.includes(value);
    const atual = foraDaLista
      ? `<option value="${escapeHtml(value)}" selected>${escapeHtml(value)}</option>`
      : '';

    const options = field.options.map(
      (option) =>
        `<option value="${escapeHtml(option)}"${option === value ? ' selected' : ''}>` +
        `${escapeHtml(option)}</option>`
    );

    return (
      `<select class="cell-editor" aria-label="${rotulo}">` +
      `${vazia}${atual}${options.join('')}</select>`
    );
  }

  if (field.type === 'textarea') {
    return `<textarea class="cell-editor" rows="2" aria-label="${rotulo}">${escapeHtml(value)}</textarea>`;
  }

  if (field.type === 'date') {
    return `<input type="date" class="cell-editor" aria-label="${rotulo}" value="${escapeHtml(value)}" />`;
  }

  const mostrado = field.type === 'currency' && value ? formatCurrency(value) : value;
  const attrs = [
    'type="text"',
    'class="cell-editor"',
    `aria-label="${rotulo}"`,
    `value="${escapeHtml(mostrado)}"`,
    field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : '',
    field.type === 'currency' ? 'inputmode="numeric"' : '',
  ].filter(Boolean);

  return `<input ${attrs.join(' ')} />`;
}

/**
 * Cria a tabela de uma página.
 *
 * @param {Object} config
 * @param {string[]} config.colunas      chaves de CAMPOS, na ordem das colunas
 * @param {string[]} [config.editaveis]  chaves que podem ser editadas na célula
 * @param {string} [config.placeholderBusca]
 * @param {Object} [config.acao]         coluna de botão no fim da linha:
 *   `{ header, rotulo, icone, classe }`. O que o botão faz é passado em
 *   `init(container, { onAcao })`, porque depende da página.
 */
export function criarTabelaCandidatos({ colunas, editaveis = [], placeholderBusca, acao }) {
  const campos = colunas.map(campo);
  const podeEditar = new Set(editaveis);
  const busca = placeholderBusca || 'Buscar por vaga ou candidato';

  function cellHtml(field, candidato) {
    const editavel = podeEditar.has(field.key);
    const classes = editavel ? 'data-table__cell data-table__cell--editable' : 'data-table__cell';

    return (
      `<td class="${classes}" data-id="${escapeHtml(candidato.id)}" data-field="${field.key}"` +
      `${editavel ? ' tabindex="0"' : ''}>${cellContent(field, candidato)}</td>`
    );
  }

  function acaoHtml(candidato) {
    if (!acao) {
      return '';
    }

    // Só o ícone: o nome da ação fica no cabeçalho da coluna, e o botão
    // se identifica por `title`/`aria-label`.
    const rotulo = escapeHtml(acao.rotulo);
    return (
      `<td class="data-table__acao">` +
      `<button type="button" class="${escapeHtml(acao.classe || 'icon-button')}" data-acao` +
      ` data-id="${escapeHtml(candidato.id)}" title="${rotulo}" aria-label="${rotulo}">` +
      `${acao.icone}</button></td>`
    );
  }

  return {
    render(candidatos) {
      const linhas = candidatos
        .map(
          (candidato) =>
            `<tr data-busca="${escapeHtml(textoBusca(candidato))}">` +
            `${campos.map((field) => cellHtml(field, candidato)).join('')}` +
            `${acaoHtml(candidato)}</tr>`
        )
        .join('');

      return `
        <div class="search-bar">
          <span class="search-bar__icon">${ICON_SEARCH}</span>
          <input
            type="search"
            id="busca-candidato"
            class="search-bar__input"
            placeholder="${escapeHtml(busca)}"
            aria-label="${escapeHtml(busca)}"
            autocomplete="off"
          />
        </div>

        <div class="data-table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                ${campos.map((field) => `<th>${escapeHtml(field.header || field.label)}</th>`).join('')}
                ${acao ? `<th class="data-table__acao">${escapeHtml(acao.header || '')}</th>` : ''}
              </tr>
            </thead>
            <tbody id="candidatos-tbody">${linhas}</tbody>
          </table>
        </div>

        <p class="search-empty" id="busca-vazia" hidden>Nenhum candidato encontrado.</p>
      `;
    },

    init(container, { onAcao } = {}) {
      const tbody = container.querySelector('#candidatos-tbody');
      if (!tbody) {
        return;
      }

      if (acao && onAcao) {
        tbody.addEventListener('click', (event) => {
          const botao = event.target.closest('[data-acao]');
          if (!botao) {
            return;
          }
          const candidato = listCandidatos().find((item) => item.id === botao.dataset.id);
          if (candidato) {
            onAcao(candidato);
          }
        });
      }

      // --- Busca -----------------------------------------------------
      // Filtra escondendo linhas, em vez de redesenhar a tabela, para não
      // perder o foco (nem o texto) do campo a cada tecla digitada.
      const searchInput = container.querySelector('#busca-candidato');
      const searchEmpty = container.querySelector('#busca-vazia');

      function aplicarFiltro() {
        const termo = normalizar(searchInput.value.trim());
        let visiveis = 0;

        tbody.querySelectorAll('tr').forEach((row) => {
          const casa = !termo || row.dataset.busca.includes(termo);
          row.hidden = !casa;
          if (casa) {
            visiveis += 1;
          }
        });

        searchEmpty.hidden = visiveis > 0;
      }

      searchInput.addEventListener('input', aplicarFiltro);

      // --- Edição inline ---------------------------------------------
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

        const row = cell.closest('tr');
        if (row) {
          // Editar vaga ou nome muda o que a busca deve encontrar. A
          // ordenação por vaga fica como está até a próxima renderização
          // — mover a linha embaixo do dedo do usuário seria pior.
          row.dataset.busca = textoBusca(atualizado);

          // Redesenha as outras células da linha. Além da comissão, que é
          // calculada, uma alteração pode preencher outro campo por regra:
          // pôr o status em "Contratado" põe a etapa em "Em atividade".
          campos.forEach((outro) => {
            if (outro.key === field.key) {
              return;
            }
            const alvo = row.querySelector(`[data-field="${outro.key}"]`);
            if (alvo) {
              alvo.innerHTML = cellContent(outro, atualizado);
            }
          });
        }

        aplicarFiltro();
      }

      function startEdit(cell) {
        if (editing) {
          if (editing.cell === cell) {
            return;
          }
          finishEdit(true);
        }

        const field = campos.find((item) => item.key === cell.dataset.field);
        if (!field || !podeEditar.has(field.key)) {
          return;
        }

        // Lido do storage, e não de uma cópia guardada na renderização,
        // para a edição sempre partir do valor mais recente.
        const candidato = listCandidatos().find((item) => item.id === cell.dataset.id);
        if (!candidato) {
          return;
        }

        editing = { cell, field, candidato };
        cell.classList.add('is-editing');
        cell.innerHTML = editorHtml(field, candidato);

        const editor = cell.querySelector('.cell-editor');
        editor.focus();

        // select() só faz sentido em campo de texto — num input de data o
        // Chrome lança InvalidStateError.
        if (field.type === 'text' || field.type === 'link' || field.type === 'currency') {
          editor.select();
        }

        if (field.type === 'currency') {
          attachCurrencyMask(editor);
        }

        if (field.type === 'select' || field.type === 'date') {
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
        const cell = event.target.closest('.data-table__cell--editable');
        if (cell && !cell.classList.contains('is-editing')) {
          startEdit(cell);
        }
      });

      tbody.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        const cell = event.target.closest?.('.data-table__cell--editable');
        if (cell && event.target === cell) {
          event.preventDefault();
          startEdit(cell);
        }
      });
    },
  };
}
