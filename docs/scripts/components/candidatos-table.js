/**
 * Tabela de candidatos estilo planilha, com busca e edição inline.
 *
 * As páginas Candidato e Comissão mostram o mesmo cadastro com colunas
 * diferentes e regras de edição diferentes, então a tabela vive aqui e
 * cada página só declara quais colunas quer e quais delas são editáveis.
 */
import { showAlert } from './alert.js';
import { chaveVaga, listCandidatos, updateCandidato } from '../services/candidatos.service.js';
import { calcularParcelas, NIVEL_OPTIONS } from '../services/comissao.service.js';
import { resolverVagaPorCodigo } from '../services/vagas.service.js';
import { CIDADES_POR_UF, ESTADOS } from '../data/localizacao.js';
import {
  ETAPA_BAIXA,
  ETAPA_EM_ATIVIDADE,
  ETAPA_OPTIONS,
  FONTE_OPTIONS,
  MODALIDADE_OPTIONS,
  STATUS_CANDIDATO_OPTIONS,
  STATUS_VAGA_ENCERRADA,
  STATUS_VAGA_OPTIONS,
} from '../services/candidato-opcoes.js';
import { escapeHtml, formatCurrency, formatDate, normalizar } from '../utils/format.js';

const ICON_SEARCH =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

const ICON_FILTER =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/></svg>';

const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';

const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

// Cor por valor exato (não por significado semântico) — pedido do
// usuário, com uma paleta fixa de tons reaproveitados entre os campos.
const STATUS_VAGA_BADGE = {
  'Não publicada': 'cinza-claro',
  Publicada: 'verde',
  Congelada: 'azul',
  Cancelada: 'vermelho',
  [STATUS_VAGA_ENCERRADA]: 'cinza-escuro',
};

const ETAPA_BADGE = {
  'Em abordagem': 'laranja',
  'Entrevista RH': 'azul',
  'Entrevista técnica': 'roxo',
  Contratação: 'ciano',
  [ETAPA_EM_ATIVIDADE]: 'verde',
  [ETAPA_BAIXA]: 'cinza-escuro',
};

const STATUS_CANDIDATO_BADGE = {
  Standby: 'ambar',
  'Sem retorno': 'cinza-claro',
  'Sem interesse': 'marrom',
  Agendado: 'azul',
  Reprovado: 'vermelho',
  Aprovado: 'verde',
  Contratado: 'verde',
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
 * - `options` array de opções (select)
 * - `badges` mapa valor → variante de badge (colore a célula)
 *
 * `vaga` é um caso especial, tratado à parte (ver `editorHtml` e o
 * `finishEdit` de cada página): o que se digita é o CÓDIGO da vaga, e o
 * que fica gravado/exibido em `candidato.vaga` é o NOME resolvido a
 * partir dele (`candidato.vagaCodigo` guarda o código). Por isso o tipo
 * aqui é só 'text' — a resolução não é genérica o bastante para entrar
 * no catálogo.
 */
export const CAMPOS = {
  vaga: { label: 'Vaga', type: 'text', placeholder: 'Código da vaga', required: true },
  statusVaga: {
    label: 'Status da vaga',
    type: 'select',
    options: STATUS_VAGA_OPTIONS,
    badges: STATUS_VAGA_BADGE,
  },
  nome: { label: 'Nome do candidato', header: 'Candidato', type: 'text', required: true },
  linkedin: { label: 'LinkedIn', type: 'link', placeholder: 'linkedin.com/in/...' },
  pretensao: { label: 'Pretensão salarial', type: 'currency', placeholder: 'R$ 0,00' },
  localizacao: { label: 'Localização', type: 'localizacao' },
  modalidade: { label: 'Modalidade', type: 'select', options: MODALIDADE_OPTIONS },
  fonte: { label: 'Fonte', type: 'select', options: FONTE_OPTIONS },
  etapa: { label: 'Etapa', type: 'select', options: ETAPA_OPTIONS, badges: ETAPA_BADGE },
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

/** Observação (texto livre) e Comissão (calculada) não têm um conjunto
 *  de valores que faça sentido escolher num filtro. */
function ehFiltravel(field) {
  return field.type !== 'textarea' && field.type !== 'computed';
}

/** Texto exibido para o valor de um campo dentro do filtro. */
function rotuloParaValor(field, valor) {
  if (field.type === 'currency') {
    return formatCurrency(valor);
  }
  if (field.type === 'date') {
    return formatDate(valor) || String(valor);
  }
  return String(valor);
}

/**
 * Todos os valores possíveis de um campo para o filtro: as opções
 * cadastradas (campo select) na ordem em que aparecem lá, mais qualquer
 * valor extra realmente usado por algum candidato (ex.: "Encerrada",
 * atribuída sozinha pelo app, fora da lista de opções escolhíveis) —
 * sem isso não daria pra filtrar por um valor que existe mas não é mais
 * uma opção. Campo de texto livre usa só os valores realmente em uso,
 * em ordem alfabética (ou numérica, em Pretensão salarial).
 */
export function valoresDisponiveisDoCampo(field) {
  const rotulos = new Map();

  function registrar(valor) {
    if (valor === undefined || valor === null || valor === '') {
      return;
    }
    const chave = String(valor);
    if (!rotulos.has(chave)) {
      rotulos.set(chave, rotuloParaValor(field, valor));
    }
  }

  if (field.type === 'select') {
    (field.options || []).forEach(registrar);
  }
  listCandidatos().forEach((candidato) => registrar(candidato[field.key]));

  const chaves = [...rotulos.keys()];

  if (field.type === 'select') {
    const ordemCanonica = field.options || [];
    chaves.sort((a, b) => {
      const indiceA = ordemCanonica.indexOf(a);
      const indiceB = ordemCanonica.indexOf(b);
      if (indiceA !== -1 && indiceB !== -1) {
        return indiceA - indiceB;
      }
      if (indiceA !== -1) {
        return -1;
      }
      if (indiceB !== -1) {
        return 1;
      }
      return collator.compare(rotulos.get(a), rotulos.get(b));
    });
  } else if (field.type === 'currency') {
    chaves.sort((a, b) => Number(a) - Number(b));
  } else if (field.type === 'date') {
    chaves.sort();
  } else {
    chaves.sort((a, b) => collator.compare(rotulos.get(a), rotulos.get(b)));
  }

  return chaves.map((valor) => ({ valor, rotulo: rotulos.get(valor) }));
}

/**
 * Bloco de um campo dentro da coluna de filtro: um select pra
 * acrescentar um valor (os já escolhidos somem da lista) e as flags dos
 * valores escolhidos, cada uma com um X pra remover. Reaproveitado pela
 * página de Relatório, que usa a mesma escolha de campo + valores para
 * decidir quem entra na exportação.
 */
export function filtroCampoHtml(field, selecionados) {
  const chave = escapeHtml(field.key);
  const todos = valoresDisponiveisDoCampo(field);
  const restantes = todos.filter((item) => !selecionados.has(item.valor));
  const escolhidos = todos.filter((item) => selecionados.has(item.valor));
  const semOpcoes = restantes.length === 0;

  const opcoesHtml = restantes
    .map((item, indice) => `<option value="${indice}">${escapeHtml(item.rotulo)}</option>`)
    .join('');

  const flagsHtml = escolhidos
    .map(
      (item) =>
        `<span class="filtro-flag">${escapeHtml(item.rotulo)}` +
        `<button type="button" class="filtro-flag__remover" data-campo="${chave}" ` +
        `data-valor="${escapeHtml(item.valor)}" aria-label="Remover ${escapeHtml(item.rotulo)}">` +
        `${ICON_CLOSE}</button></span>`
    )
    .join('');

  return `
    <div class="filtro-campo">
      <label for="filtro-campo-${chave}">${escapeHtml(field.header || field.label)}</label>
      <select
        id="filtro-campo-${chave}"
        class="filtro-campo__select"
        data-campo="${chave}"
        ${semOpcoes ? 'disabled' : ''}
      >
        <option value="">${semOpcoes && escolhidos.length === 0 ? 'Nenhum valor cadastrado' : 'Adicionar filtro...'}</option>
        ${opcoesHtml}
      </select>
      ${flagsHtml ? `<div class="filtro-campo__flags">${flagsHtml}</div>` : ''}
    </div>
  `;
}

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

/** Vai inserindo as barras (dd/mm/aaaa) enquanto o usuário digita números. */
export function attachDateMask(input) {
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const partes = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    input.value = partes.join('/');
  });
}

/**
 * "dd/mm/aaaa" digitado (com ou sem barras) → "aaaa-mm-dd" para gravar.
 * Campo vazio apaga a data. Qualquer texto que não feche em uma data real
 * de 8 dígitos volta como veio, para quem chamou barrar com uma mensagem
 * em vez de gravar um valor errado (ver uso em finishEdit).
 */
function parseDateDigitada(raw) {
  const texto = String(raw ?? '').trim();
  const digits = texto.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.length === 8) {
    const dia = Number(digits.slice(0, 2));
    const mes = Number(digits.slice(2, 4));
    const ano = Number(digits.slice(4, 8));
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia) {
      return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
    }
  }

  return texto;
}

/**
 * Localização é sempre "Cidade - UF" (ver `cidadeOptionsHtml`, que já
 * grava esse texto como o `value` de cada opção — não precisa recompor
 * aqui). Estas três funções são compartilhadas entre o editor inline da
 * tabela e o formulário de cadastro (candidato.js), para o estado/cidade
 * nunca divergirem entre os dois lugares.
 */
export function ufOptionsHtml(ufSelecionada) {
  return (
    `<option value="">Estado</option>` +
    ESTADOS.map(
      (estado) =>
        `<option value="${estado.sigla}"${estado.sigla === ufSelecionada ? ' selected' : ''}>` +
        `${escapeHtml(estado.nome)}</option>`
    ).join('')
  );
}

export function cidadeOptionsHtml(uf, cidadeSelecionada) {
  if (!uf) {
    return `<option value="">Escolha o estado</option>`;
  }
  const cidades = CIDADES_POR_UF[uf] || [];
  return (
    `<option value="">Cidade</option>` +
    cidades
      .map((nomeCidade) => {
        const valorOpcao = `${nomeCidade} - ${uf}`;
        return (
          `<option value="${escapeHtml(valorOpcao)}"${nomeCidade === cidadeSelecionada ? ' selected' : ''}>` +
          `${escapeHtml(nomeCidade)}</option>`
        );
      })
      .join('')
  );
}

/** Separa "Cidade - UF" de volta em `{ cidade, uf }`, para pré-selecionar
 *  os dois campos ao reabrir um valor já gravado. UF desconhecida (dado
 *  legado digitado livre antes desta função existir) devolve os dois
 *  vazios — quem chamou decide o que fazer com o texto original. */
export function parseLocalizacao(valor) {
  const texto = String(valor || '').trim();
  const partes = texto.split(' - ');
  if (partes.length < 2) {
    return { cidade: '', uf: '' };
  }
  const uf = partes[partes.length - 1].trim();
  const cidade = partes.slice(0, -1).join(' - ').trim();
  return ESTADOS.some((estado) => estado.sigla === uf) ? { cidade, uf } : { cidade: '', uf: '' };
}

/** Converte o valor cru de um controle no valor armazenado do candidato. */
export function parseValue(field, raw) {
  if (field.type === 'currency') {
    const digits = String(raw ?? '').replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }

  if (field.type === 'date') {
    return parseDateDigitada(raw);
  }

  if (field.type === 'select') {
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
    return value ? badge(value, field.badges[value] || 'cinza-claro') : VAZIO;
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
  // Vaga é o único campo em que o valor editado (o código) é diferente
  // do valor exibido/gravado em `candidato[field.key]` (o nome).
  const value = field.key === 'vaga' ? (candidato.vagaCodigo ?? '') : (candidato[field.key] ?? '');
  const rotulo = escapeHtml(field.label);

  if (field.type === 'select') {
    const opcoes = field.options;
    const vazia = `<option value=""${value ? '' : ' selected'}>—</option>`;

    // Valores atribuídos pelo app ("Em atividade", "Baixa", "Encerrada")
    // ou uma vaga já excluída do registro não estão na lista de opções.
    // Sem incluir o valor atual, o select abriria em outra opção e salvar
    // trocaria o dado sem o usuário pedir.
    const foraDaLista = value && !opcoes.includes(value);
    const atual = foraDaLista
      ? `<option value="${escapeHtml(value)}" selected>${escapeHtml(value)}</option>`
      : '';

    const options = opcoes.map(
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
    // Além do calendário, o usuário pode digitar a data toda direto: o
    // controle visível é texto (dd/mm/aaaa, com máscara automática) e o
    // input nativo de data fica escondido, só para abrir o seletor.
    return (
      `<span class="date-editor">` +
      `<input type="text" class="cell-editor date-editor__input" inputmode="numeric" ` +
      `maxlength="10" placeholder="dd/mm/aaaa" aria-label="${rotulo}" value="${escapeHtml(formatDate(value))}" />` +
      `<button type="button" class="date-editor__picker" tabindex="-1" aria-label="Abrir calendário">${ICON_CALENDAR}</button>` +
      `<input type="date" class="date-editor__native" tabindex="-1" aria-hidden="true" value="${escapeHtml(value)}" />` +
      `</span>`
    );
  }

  if (field.type === 'localizacao') {
    // Escolher estado e depois cidade, em vez de digitar livre — cada
    // opção de cidade já carrega "Cidade - UF" como valor (ver
    // `cidadeOptionsHtml`), então o select de cidade É o `.cell-editor`:
    // seu `value` já é o texto certo para gravar, sem recompor nada.
    const bruto = String(value || '').trim();
    const { cidade, uf } = parseLocalizacao(bruto);
    // Dado gravado antes desta função existir, digitado livre — sem UF
    // pra casar. Mantém como uma opção própria até o usuário escolher um
    // estado de verdade, em vez de simplesmente apagar o que já tinha.
    const foraDaLista = bruto && !uf;

    return (
      `<span class="localizacao-editor">` +
      `<select class="localizacao-editor__uf" aria-label="Estado">${ufOptionsHtml(uf)}</select>` +
      `<select class="cell-editor localizacao-editor__cidade" aria-label="${rotulo}"${!uf && !foraDaLista ? ' disabled' : ''}>` +
      (foraDaLista
        ? `<option value="${escapeHtml(bruto)}" selected>${escapeHtml(bruto)}</option>`
        : cidadeOptionsHtml(uf, cidade)) +
      `</select></span>`
    );
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
 * @param {boolean} [config.filtro]      mostra o botão de filtro, que abre
 *   uma coluna lateral com todos os campos (menos Observação e Comissão)
 *   — cada um com as opções em uso escolhíveis (mais de uma por campo),
 *   aplicadas só ao clicar em "Filtrar".
 */
export function criarTabelaCandidatos({
  colunas,
  editaveis = [],
  placeholderBusca,
  acao,
  filtro = false,
}) {
  const campos = colunas.map(campo);
  const podeEditar = new Set(editaveis);
  const busca = placeholderBusca || 'Buscar por vaga ou candidato';
  const camposFiltraveis = filtro ? campos.filter(ehFiltravel) : [];

  function cellHtml(field, candidato) {
    const editavel = podeEditar.has(field.key);
    const classes = editavel ? 'data-table__cell data-table__cell--editable' : 'data-table__cell';
    // Guarda o valor cru (não o HTML da badge) para o filtro por campo comparar.
    const valorFiltro =
      filtro && ehFiltravel(field) ? ` data-valor="${escapeHtml(candidato[field.key] ?? '')}"` : '';

    return (
      `<td class="${classes}" data-id="${escapeHtml(candidato.id)}" data-field="${field.key}"${valorFiltro}` +
      `${editavel ? ' tabindex="0"' : ''}>${cellContent(field, candidato)}</td>`
    );
  }

  /** Redesenha uma célula e mantém `data-valor` (usado pelo filtro) em dia. */
  function refreshCell(cell, field, candidato) {
    cell.innerHTML = cellContent(field, candidato);
    if (filtro && ehFiltravel(field)) {
      cell.dataset.valor = candidato[field.key] ?? '';
    }
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

  /** Corpo da coluna de filtro inteiro, a partir do rascunho atual. */
  function filtroDrawerBodyHtml(filtroDraft) {
    return camposFiltraveis
      .map((field) => filtroCampoHtml(field, filtroDraft.get(field.key) || new Set()))
      .join('');
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

      const filtroBotaoHtml =
        camposFiltraveis.length > 0
          ? `
        <button type="button" class="icon-button icon-button--outline" id="btn-filtro" aria-label="Filtrar" title="Filtrar">
          ${ICON_FILTER}
        </button>`
          : '';

      const filtroDrawerHtml =
        camposFiltraveis.length > 0
          ? `
        <div class="filtro-drawer-overlay" id="filtro-drawer-overlay">
          <aside class="filtro-drawer" role="dialog" aria-modal="true" aria-labelledby="filtro-drawer-titulo">
            <div class="modal__header">
              <h2 id="filtro-drawer-titulo" class="modal__title">Filtrar</h2>
              <button type="button" class="modal__close" id="filtro-drawer-fechar" aria-label="Fechar">
                ${ICON_CLOSE}
              </button>
            </div>
            <div class="modal__body" id="filtro-drawer-corpo"></div>
            <div class="modal__footer">
              <button type="button" class="btn btn--outline" id="filtro-drawer-cancelar">Cancelar</button>
              <button type="button" class="btn btn--primary" id="filtro-drawer-filtrar">Filtrar</button>
            </div>
          </aside>
        </div>`
          : '';

      return `
        <div class="search-row">
          ${filtroBotaoHtml}
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
        </div>
        ${filtroDrawerHtml}

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

      // --- Busca e filtro por campo -----------------------------------
      // Escondem linhas, em vez de redesenhar a tabela, para não perder o
      // foco (nem o texto digitado) a cada tecla ou troca de filtro.
      const searchInput = container.querySelector('#busca-candidato');
      const searchEmpty = container.querySelector('#busca-vazia');
      const filtroBotao = container.querySelector('#btn-filtro');
      const filtroOverlay = container.querySelector('#filtro-drawer-overlay');

      // Mapa campo → conjunto de valores escolhidos. Só o que está aqui
      // filtra de verdade; a coluna lateral edita um rascunho à parte
      // (ver abrirFiltroDrawer) até o usuário confirmar em "Filtrar".
      let filtroAplicado = new Map();

      function aplicarFiltro() {
        const termo = normalizar(searchInput.value.trim());
        let visiveis = 0;

        tbody.querySelectorAll('tr').forEach((row) => {
          const casaBusca = !termo || row.dataset.busca.includes(termo);
          let casaFiltro = true;
          for (const [chave, valores] of filtroAplicado) {
            if (valores.size === 0) {
              continue;
            }
            const valorCelula = row.querySelector(`[data-field="${chave}"]`)?.dataset.valor ?? '';
            if (!valores.has(valorCelula)) {
              casaFiltro = false;
              break;
            }
          }
          const casa = casaBusca && casaFiltro;
          row.hidden = !casa;
          if (casa) {
            visiveis += 1;
          }
        });

        searchEmpty.hidden = visiveis > 0;
      }

      searchInput.addEventListener('input', aplicarFiltro);

      if (filtroBotao && filtroOverlay) {
        const drawer = filtroOverlay.querySelector('.filtro-drawer');
        const corpo = filtroOverlay.querySelector('#filtro-drawer-corpo');
        const botaoFechar = filtroOverlay.querySelector('#filtro-drawer-fechar');
        const botaoCancelar = filtroOverlay.querySelector('#filtro-drawer-cancelar');
        const botaoFiltrar = filtroOverlay.querySelector('#filtro-drawer-filtrar');

        // Rascunho editado na coluna lateral — só vira filtroAplicado (e
        // só então afeta a tabela) quando o usuário clica em "Filtrar".
        let filtroDraft = new Map();
        let ultimoFoco = null;

        const redesenharCorpo = () => {
          corpo.innerHTML = filtroDrawerBodyHtml(filtroDraft);
        };

        const fecharFiltroDrawer = () => {
          filtroOverlay.classList.remove('is-open');
          container.classList.remove('no-scroll');
          document.removeEventListener('keydown', trapDoDrawer);
          ultimoFoco?.focus();
        };

        const trapDoDrawer = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            fecharFiltroDrawer();
            return;
          }
          if (event.key !== 'Tab') {
            return;
          }
          const focaveis = Array.from(
            drawer.querySelectorAll('button, input, select, textarea, a[href]')
          ).filter((el) => !el.disabled && el.offsetParent !== null);
          if (focaveis.length === 0) {
            return;
          }
          const primeiro = focaveis[0];
          const ultimo = focaveis[focaveis.length - 1];
          if (event.shiftKey && document.activeElement === primeiro) {
            event.preventDefault();
            ultimo.focus();
          } else if (!event.shiftKey && document.activeElement === ultimo) {
            event.preventDefault();
            primeiro.focus();
          }
        };

        const abrirFiltroDrawer = () => {
          ultimoFoco = document.activeElement;
          filtroDraft = new Map();
          filtroAplicado.forEach((valores, chave) => filtroDraft.set(chave, new Set(valores)));
          redesenharCorpo();
          filtroOverlay.classList.add('is-open');
          container.classList.add('no-scroll');
          document.addEventListener('keydown', trapDoDrawer);
          botaoFechar.focus();
        };

        filtroBotao.addEventListener('click', abrirFiltroDrawer);
        botaoFechar.addEventListener('click', fecharFiltroDrawer);
        botaoCancelar.addEventListener('click', fecharFiltroDrawer);

        // Só fora do próprio drawer (clicar dentro nunca deve fechar).
        filtroOverlay.addEventListener('click', (event) => {
          if (event.target === filtroOverlay) {
            fecharFiltroDrawer();
          }
        });

        corpo.addEventListener('change', (event) => {
          const select = event.target.closest('.filtro-campo__select');
          if (!select || select.value === '') {
            return;
          }
          const chave = select.dataset.campo;
          const field = camposFiltraveis.find((item) => item.key === chave);
          const jaEscolhidos = filtroDraft.get(chave) || new Set();
          const restantes = valoresDisponiveisDoCampo(field).filter(
            (item) => !jaEscolhidos.has(item.valor)
          );
          const escolhido = restantes[Number(select.value)];
          if (!escolhido) {
            return;
          }
          if (!filtroDraft.has(chave)) {
            filtroDraft.set(chave, new Set());
          }
          filtroDraft.get(chave).add(escolhido.valor);
          redesenharCorpo();
        });

        corpo.addEventListener('click', (event) => {
          const botao = event.target.closest('.filtro-flag__remover');
          if (!botao) {
            return;
          }
          filtroDraft.get(botao.dataset.campo)?.delete(botao.dataset.valor);
          redesenharCorpo();
        });

        botaoFiltrar.addEventListener('click', () => {
          filtroAplicado = new Map(
            [...filtroDraft].filter(([, valores]) => valores.size > 0).map(([k, v]) => [k, v])
          );
          filtroBotao.classList.toggle('is-active', filtroAplicado.size > 0);
          aplicarFiltro();
          fecharFiltroDrawer();
        });
      }

      // --- Edição inline ---------------------------------------------
      let editing = null;

      /** Linha visível anterior/seguinte, pulando as escondidas pelo filtro. */
      function linhaVisivel(row, direcao) {
        let atual = direcao === 'up' ? row.previousElementSibling : row.nextElementSibling;
        while (atual && atual.hidden) {
          atual = direcao === 'up' ? atual.previousElementSibling : atual.nextElementSibling;
        }
        return atual;
      }

      /**
       * Célula vizinha na direção pedida, para navegar entre campos
       * editáveis com as setas do teclado (como no Excel). Cima/baixo
       * ficam na mesma coluna, na linha visível anterior/seguinte;
       * esquerda/direita pulam colunas não editáveis até achar a próxima
       * que seja. Devolve `null` quando não há vizinha (borda da tabela).
       */
      function celulaVizinha(cell, field, direcao) {
        const row = cell.closest('tr');
        if (!row) {
          return null;
        }

        if (direcao === 'up' || direcao === 'down') {
          const alvo = linhaVisivel(row, direcao);
          return alvo ? alvo.querySelector(`[data-field="${field.key}"]`) : null;
        }

        const indiceAtual = campos.findIndex((item) => item.key === field.key);
        const passo = direcao === 'left' ? -1 : 1;
        for (let i = indiceAtual + passo; i >= 0 && i < campos.length; i += passo) {
          if (podeEditar.has(campos[i].key)) {
            return row.querySelector(`[data-field="${campos[i].key}"]`);
          }
        }
        return null;
      }

      const SETA_PARA_DIRECAO = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      /**
       * Navegação por seta entre campos editáveis, como no Excel: clica
       * pra editar um campo e as setas movem pro campo do lado (pulando
       * os não editáveis) ou pro mesmo campo do candidato de cima/baixo.
       *
       * Em campo de texto de uma linha só, esquerda/direita só navegam
       * quando o cursor já está na ponta do texto (início/fim) — no meio
       * do texto, a seta continua só movendo o cursor, como sempre. Em
       * textarea (Observação) as setas nunca navegam, pra não atrapalhar
       * quem está escrevendo um texto com várias linhas.
       *
       * @param {string|null} campoTexto valor atual do controle de texto,
       *   para saber se o cursor está na ponta — `null` num select, onde
       *   a posição do cursor não existe e as setas sempre navegam.
       */
      function navegarComSeta(event, field, cell, inputTexto) {
        const direcao = SETA_PARA_DIRECAO[event.key];
        if (!direcao || field.type === 'textarea') {
          return;
        }

        if (inputTexto && (direcao === 'left' || direcao === 'right')) {
          // Olha só a ponta relevante pra cada lado, não o intervalo
          // inteiro: ao abrir a célula o texto vem todo selecionado (pra
          // digitar por cima), o que conta como "na ponta" dos dois
          // lados — senão a primeira seta ficaria presa sem navegar.
          const noInicio = inputTexto.selectionStart === 0;
          const noFim = inputTexto.selectionEnd === inputTexto.value.length;
          if ((direcao === 'left' && !noInicio) || (direcao === 'right' && !noFim)) {
            return;
          }
        }

        event.preventDefault();
        const alvo = celulaVizinha(cell, field, direcao);
        if (alvo) {
          finishEdit(true);
          startEdit(alvo);
        }
      }

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
          } else if (field.key === 'vaga') {
            // O que se edita é o código; o que se grava/exibe é o nome
            // resolvido a partir dele (ver CAMPOS.vaga).
            if (novo !== (candidato.vagaCodigo || '')) {
              const resolvido = resolverVagaPorCodigo(novo);
              if (!resolvido.ok) {
                showAlert({
                  type: 'error',
                  title: 'Código não encontrado',
                  message: `Não existe vaga cadastrada com o código "${novo}".`,
                });
              } else {
                atualizado =
                  updateCandidato(candidato.id, {
                    vaga: resolvido.vaga.nome,
                    vagaCodigo: resolvido.vaga.codigo,
                  }) || candidato;
              }
            }
          } else if (field.type === 'date' && novo && !/^\d{4}-\d{2}-\d{2}$/.test(novo)) {
            showAlert({
              type: 'error',
              title: 'Data inválida',
              message: 'Digite a data no formato dd/mm/aaaa.',
            });
          } else if (novo !== candidato[field.key]) {
            atualizado = updateCandidato(candidato.id, { [field.key]: novo }) || candidato;
          }
        }

        cell.classList.remove('is-editing');
        refreshCell(cell, field, atualizado);

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
              refreshCell(alvo, outro, atualizado);
            }
          });
        }

        // Editar a vaga, o status do candidato ou o próprio status da
        // vaga afeta OUTROS candidatos que concorrem a ela — atualiza a
        // célula de status da vaga dessas outras linhas também, se
        // estiverem nesta tabela.
        if (
          atualizado !== candidato &&
          (field.key === 'vaga' || field.key === 'statusCandidato' || field.key === 'statusVaga') &&
          campos.some((item) => item.key === 'statusVaga')
        ) {
          const vagasAfetadas = new Set(
            [chaveVaga(candidato), chaveVaga(atualizado)].filter(Boolean)
          );
          if (vagasAfetadas.size > 0) {
            const todos = listCandidatos();
            tbody.querySelectorAll('tr').forEach((outraLinha) => {
              if (outraLinha === row) {
                return;
              }
              const celula = outraLinha.querySelector('[data-field="statusVaga"]');
              if (!celula) {
                return;
              }
              const dadosOutro = todos.find((item) => item.id === celula.dataset.id);
              if (dadosOutro && vagasAfetadas.has(chaveVaga(dadosOutro))) {
                refreshCell(celula, campo('statusVaga'), dadosOutro);
              }
            });
          }
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

        // select() só faz sentido em campo de texto — num input de data o
        // Chrome lança InvalidStateError.
        if (
          field.type === 'text' ||
          field.type === 'link' ||
          field.type === 'currency' ||
          field.type === 'date'
        ) {
          editor.select();
        }

        if (field.type === 'currency') {
          attachCurrencyMask(editor);
        }

        if (field.type === 'select') {
          editor.addEventListener('change', () => finishEdit(true));
        }

        if (field.type === 'date') {
          attachDateMask(editor);

          const nativeInput = cell.querySelector('.date-editor__native');
          const pickerButton = cell.querySelector('.date-editor__picker');

          // Sem foco no botão: preserva o foco no campo de texto, senão o
          // blur dispararia finishEdit antes de abrir o calendário.
          pickerButton.addEventListener('mousedown', (event) => event.preventDefault());
          pickerButton.addEventListener('click', () => {
            if (typeof nativeInput.showPicker === 'function') {
              nativeInput.showPicker();
            } else {
              nativeInput.click();
            }
          });

          nativeInput.addEventListener('change', () => {
            editor.value = formatDate(nativeInput.value);
            finishEdit(true);
          });
        }

        if (field.type === 'localizacao') {
          const ufSelect = cell.querySelector('.localizacao-editor__uf');

          // Os dois selects trocam foco entre si (escolher UF foca a
          // cidade em seguida) — só sai da edição quando o foco realmente
          // deixa os dois, não a cada troca de um pro outro.
          const saiuDoEditor = (event) =>
            event.relatedTarget !== ufSelect && event.relatedTarget !== editor;

          ufSelect.addEventListener('change', () => {
            const uf = ufSelect.value;
            editor.disabled = !uf;
            editor.innerHTML = cidadeOptionsHtml(uf, '');
            if (uf) {
              editor.focus();
            }
          });
          ufSelect.addEventListener('blur', (event) => {
            if (saiuDoEditor(event)) {
              finishEdit(true);
            }
          });
          ufSelect.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              finishEdit(false);
              cell.focus();
            } else {
              navegarComSeta(event, field, cell, null);
            }
          });

          editor.addEventListener('change', () => finishEdit(true));
          editor.addEventListener('blur', (event) => {
            if (saiuDoEditor(event)) {
              finishEdit(true);
            }
          });

          ufSelect.focus();
        } else {
          editor.focus();
          editor.addEventListener('blur', () => finishEdit(true));
        }

        const ehCampoDeTexto =
          field.type === 'text' ||
          field.type === 'link' ||
          field.type === 'currency' ||
          field.type === 'date';

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
          } else {
            navegarComSeta(event, field, cell, ehCampoDeTexto ? editor : null);
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
