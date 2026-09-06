import { showAlert } from '../components/alert.js';
import {
  campo,
  filtroCampoHtml,
  valoresDisponiveisDoCampo,
} from '../components/candidatos-table.js';
import { listCandidatos } from '../services/candidatos.service.js';
import { calcularParcelas } from '../services/comissao.service.js';
import { salvarArquivo } from '../utils/arquivo.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const ICON_RELATORIO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6M9 9h1"/></svg>';

/**
 * Campos com que se filtra quem entra no relatório — os mesmos da
 * coluna de filtro da página Candidato (texto livre como Observação
 * fica de fora: não tem um conjunto de valores que faça sentido
 * escolher).
 */
const CAMPOS_FILTRO = [
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
];

/** Colunas do arquivo exportado: os campos de filtro, mais os que só
 *  fazem sentido no resultado (Observação, Contratação, Nível) — a
 *  Comissão total (calculada) é acrescentada à parte, no fim. */
const CAMPOS_EXPORTACAO = [...CAMPOS_FILTRO, 'observacao', 'contratacao', 'nivel'];

function comissaoTotal(candidato) {
  return calcularParcelas(candidato.contratacao, candidato.nivel).reduce(
    (soma, parcela) => soma + parcela.valor,
    0
  );
}

/** Texto de uma célula do relatório, no mesmo formato que aparece no app. */
function valorExportado(field, candidato) {
  const valor = candidato[field.key];
  if (field.type === 'currency') {
    return valor ? formatCurrency(valor) : '';
  }
  if (field.type === 'date') {
    return formatDate(valor) || '';
  }
  return valor ?? '';
}

/** Candidatos que atendem a todos os campos com filtro ativo (E entre
 *  campos diferentes, OU entre valores escolhidos dentro do mesmo campo). */
function candidatosFiltrados(selecoes) {
  return listCandidatos().filter((candidato) =>
    [...selecoes].every(([chave, valores]) => {
      if (valores.size === 0) {
        return true;
      }
      return valores.has(String(candidato[chave] ?? ''));
    })
  );
}

/** Uma linha de CSV, com aspas em todo campo (escapando aspas internas). */
function linhaCsv(valores) {
  return valores.map((valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`).join(';');
}

function gerarCsv(candidatos) {
  const campos = CAMPOS_EXPORTACAO.map(campo);
  const cabecalho = [...campos.map((field) => field.header || field.label), 'Comissão total'];
  const linhas = candidatos.map((candidato) =>
    linhaCsv([
      ...campos.map((field) => valorExportado(field, candidato)),
      formatCurrency(comissaoTotal(candidato)),
    ])
  );
  // BOM no início: sem ele, o Excel do Windows abre acentos trocados
  // (lê o arquivo como se fosse da codificação padrão do sistema).
  const BOM = '﻿';
  return BOM + [linhaCsv(cabecalho), ...linhas].join('\r\n');
}

function nomeDoArquivo() {
  return `hirecash-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
}

function plural(quantidade, singular, pluralForma) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`;
}

export const relatorioPage = {
  title: 'Relatório',

  render() {
    return `
      <div class="page-relatorio page-enter">
        <header class="page-header">
          <h1>Relatório</h1>
          <p class="text-muted">Escolha os filtros e gere um arquivo para abrir no Excel.</p>
        </header>

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_RELATORIO}</span>
            <h2>Filtros</h2>
          </div>
          <p class="text-muted">
            Sem nenhum filtro escolhido, o relatório sai com todos os candidatos.
          </p>
          <div id="relatorio-campos"></div>
        </section>

        <div class="relatorio-rodape">
          <p class="text-muted" id="relatorio-contagem"></p>
          <button type="button" class="btn btn--primary" id="btn-gerar-relatorio">
            Gerar Excel
          </button>
        </div>
      </div>
    `;
  },

  init(container) {
    const corpo = container.querySelector('#relatorio-campos');
    const contagem = container.querySelector('#relatorio-contagem');
    const botaoGerar = container.querySelector('#btn-gerar-relatorio');

    const selecoes = new Map();

    function atualizarContagem() {
      const total = candidatosFiltrados(selecoes).length;
      contagem.textContent = `${plural(total, 'candidato encontrado', 'candidatos encontrados')}.`;
      botaoGerar.disabled = total === 0;
    }

    function redesenhar() {
      corpo.innerHTML = CAMPOS_FILTRO.map((chave) =>
        filtroCampoHtml(campo(chave), selecoes.get(chave) || new Set())
      ).join('');
      atualizarContagem();
    }

    corpo.addEventListener('change', (event) => {
      const select = event.target.closest('.filtro-campo__select');
      if (!select || select.value === '') {
        return;
      }
      const chave = select.dataset.campo;
      const field = campo(chave);
      const jaEscolhidos = selecoes.get(chave) || new Set();
      const restantes = valoresDisponiveisDoCampo(field).filter(
        (item) => !jaEscolhidos.has(item.valor)
      );
      const escolhido = restantes[Number(select.value)];
      if (!escolhido) {
        return;
      }
      if (!selecoes.has(chave)) {
        selecoes.set(chave, new Set());
      }
      selecoes.get(chave).add(escolhido.valor);
      redesenhar();
    });

    corpo.addEventListener('click', (event) => {
      const botao = event.target.closest('.filtro-flag__remover');
      if (!botao) {
        return;
      }
      selecoes.get(botao.dataset.campo)?.delete(botao.dataset.valor);
      redesenhar();
    });

    botaoGerar.addEventListener('click', async () => {
      const candidatos = candidatosFiltrados(selecoes);
      if (candidatos.length === 0) {
        showAlert({
          type: 'warning',
          title: 'Nada para exportar',
          message: 'Nenhum candidato encontrado com os filtros escolhidos.',
        });
        return;
      }

      const nome = nomeDoArquivo();

      try {
        await salvarArquivo(gerarCsv(candidatos), nome, {
          mime: 'text/csv',
          descricao: 'Relatório HireCash',
        });
        showAlert({
          type: 'success',
          title: 'Relatório gerado',
          message: `${plural(candidatos.length, 'candidato', 'candidatos')} em ${nome}.`,
        });
      } catch (error) {
        // O usuário fechar o diálogo de salvar/compartilhar não é erro.
        if (error?.name === 'AbortError') {
          return;
        }
        showAlert({
          type: 'error',
          title: 'Não foi possível gerar o relatório',
          message: 'Tente novamente. Se persistir, use outro navegador.',
        });
      }
    });

    redesenhar();
  },
};
