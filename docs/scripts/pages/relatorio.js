import { showAlert } from '../components/alert.js';
import {
  campo,
  filtroCampoHtml,
  valoresDisponiveisDoCampo,
} from '../components/candidatos-table.js';
import { listCandidatos } from '../services/candidatos.service.js';
import { calcularParcelas } from '../services/comissao.service.js';
import { salvarArquivo } from '../utils/arquivo.js';

const CAMINHO_VENDOR_EXCELJS = './vendor/exceljs.min.js';
const CAMINHO_MODELO = './templates/relatorio-modelo.xlsx';
const NOME_ABA_MODELO = 'Candidatos';

// Linhas fixas do modelo (ver scripts/generate-relatorio-template.js) —
// mudou lá, muda aqui também.
const LINHA_GERADO_EM = 2;
const LINHA_TOTAL = 3;
const LINHA_PRIMEIRO_DADO = 6;

const BORDA_CINZA = { argb: 'FFE5E7EB' };
const FUNDO_ZEBRADO = { argb: 'FFF5F6FA' };

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

function nomeDoArquivo() {
  return `hirecash-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx`;
}

function plural(quantidade, singular, pluralForma) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`;
}

/** "dd/mm/aaaa às hh:mm" no fuso local — igual ao resto do app, na mão,
 *  pra não cair na armadilha de fuso do `toLocaleString`/ISO em UTC. */
function agoraPorExtenso() {
  const data = new Date();
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()} às ${hora}:${minuto}`;
}

let exceljsPromise = null;

/** Carrega o gerador de .xlsx só quando alguém realmente for gerar um
 *  relatório — evita baixar ~1 MB à toa pra quem nunca usa a página. */
function carregarExcelJS() {
  if (window.ExcelJS) {
    return Promise.resolve(window.ExcelJS);
  }
  if (!exceljsPromise) {
    exceljsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CAMINHO_VENDOR_EXCELJS;
      script.onload = () => resolve(window.ExcelJS);
      script.onerror = () => {
        exceljsPromise = null;
        reject(new Error('Não foi possível carregar o gerador de planilhas.'));
      };
      document.head.appendChild(script);
    });
  }
  return exceljsPromise;
}

/** Grava o valor certo na célula (número/data de verdade, não texto —
 *  assim dá pra somar e ordenar direto no Excel) e o formato de exibição. */
function preencherCelula(celula, field, candidato) {
  const valor = candidato[field.key];

  if (field.type === 'currency') {
    celula.value = valor ? valor / 100 : 0;
    celula.numFmt = '"R$" #,##0.00';
    return;
  }

  if (field.type === 'date') {
    if (valor) {
      const [ano, mes, dia] = valor.split('-').map(Number);
      celula.value = new Date(ano, mes - 1, dia);
      celula.numFmt = 'dd/mm/yyyy';
    }
    return;
  }

  celula.value = valor ?? '';
}

// Índice (1-based) da coluna Observação dentro de CAMPOS_EXPORTACAO —
// é a única com texto livre longo o bastante pra valer a pena quebrar linha.
const COLUNA_OBSERVACAO = CAMPOS_EXPORTACAO.indexOf('observacao') + 1;

function estilizarCelulaDeDado(celula, colIndice, zebrada) {
  celula.border = {
    top: { style: 'thin', color: BORDA_CINZA },
    bottom: { style: 'thin', color: BORDA_CINZA },
    left: { style: 'thin', color: BORDA_CINZA },
    right: { style: 'thin', color: BORDA_CINZA },
  };
  celula.alignment = { vertical: 'top', wrapText: colIndice === COLUNA_OBSERVACAO };
  if (zebrada) {
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: FUNDO_ZEBRADO };
  }
}

/** Abre o modelo (título e cabeçalho já prontos) e escreve por baixo só
 *  as linhas de dado — devolve o .xlsx pronto como ArrayBuffer. */
async function gerarXlsx(candidatos) {
  const ExcelJS = await carregarExcelJS();

  const resposta = await fetch(CAMINHO_MODELO);
  if (!resposta.ok) {
    throw new Error('Modelo do relatório não encontrado.');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await resposta.arrayBuffer());
  const sheet = workbook.getWorksheet(NOME_ABA_MODELO);

  sheet.getCell(LINHA_GERADO_EM, 1).value = `Gerado em: ${agoraPorExtenso()}`;
  sheet.getCell(LINHA_TOTAL, 1).value =
    `Total: ${plural(candidatos.length, 'candidato', 'candidatos')}`;

  const campos = CAMPOS_EXPORTACAO.map(campo);

  candidatos.forEach((candidato, indice) => {
    const linha = sheet.getRow(LINHA_PRIMEIRO_DADO + indice);
    const zebrada = indice % 2 === 1;

    campos.forEach((field, indiceColuna) => {
      const celula = linha.getCell(indiceColuna + 1);
      preencherCelula(celula, field, candidato);
      estilizarCelulaDeDado(celula, indiceColuna + 1, zebrada);
    });

    const celulaComissao = linha.getCell(campos.length + 1);
    celulaComissao.value = comissaoTotal(candidato) / 100;
    celulaComissao.numFmt = '"R$" #,##0.00';
    estilizarCelulaDeDado(celulaComissao, campos.length + 1, zebrada);
  });

  return workbook.xlsx.writeBuffer();
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
      botaoGerar.disabled = true;

      try {
        const arquivo = await gerarXlsx(candidatos);
        await salvarArquivo(arquivo, nome, {
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      } finally {
        botaoGerar.disabled = candidatosFiltrados(selecoes).length === 0;
      }
    });

    redesenhar();
  },
};
