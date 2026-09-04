import { criarTabelaCandidatos, ordenarPorVaga } from '../components/candidatos-table.js';
import { listCandidatos } from '../services/candidatos.service.js';

const ICON_COMISSAO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M6 18 18 6"/></svg>';

/**
 * Mesmas colunas do cadastro, sem status da vaga, localização, fonte,
 * etapa e observação — que não dizem respeito à comissão —, mais os três
 * campos desta página.
 */
const COLUNAS = [
  'vaga',
  'nome',
  'linkedin',
  'pretensao',
  'modalidade',
  'statusCandidato',
  'contratacao',
  'nivel',
  'comissao',
];

/**
 * Só Contratação e Nível são editáveis aqui: os dados do cadastro se
 * alteram na página Candidato, e a Comissão é calculada a partir destes
 * dois, então não se digita.
 */
const EDITAVEIS = ['contratacao', 'nivel'];

const tabela = criarTabelaCandidatos({
  colunas: COLUNAS,
  editaveis: EDITAVEIS,
});

/** A página lista apenas quem foi aprovado. */
function listarAprovados() {
  return ordenarPorVaga(
    listCandidatos().filter((candidato) => candidato.statusCandidato === 'Aprovado')
  );
}

function renderEmptyState() {
  return `
    <section class="card empty-state">
      <span class="card__icon">${ICON_COMISSAO}</span>
      <h2>Nenhum candidato aprovado</h2>
      <p class="text-muted">
        Assim que um candidato ficar com o status "Aprovado" na página
        Candidato, ele aparece aqui para lançar a contratação e o nível.
      </p>
    </section>
  `;
}

export const comissaoPage = {
  title: 'Comissão',

  render() {
    const aprovados = listarAprovados();

    return `
      <div class="page-comissao page-enter">
        <header class="page-header">
          <h1>Comissão</h1>
          <p class="text-muted">
            Candidatos aprovados.
            ${aprovados.length > 0 ? 'Preencha a contratação e o nível para calcular a comissão.' : ''}
          </p>
        </header>

        ${aprovados.length === 0 ? renderEmptyState() : tabela.render(aprovados)}
      </div>
    `;
  },

  init(container) {
    tabela.init(container);
  },
};
