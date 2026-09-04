import { showAlert } from '../components/alert.js';
import { criarTabelaCandidatos, ordenarPorVaga } from '../components/candidatos-table.js';
import { showConfirm } from '../components/confirm.js';
import { darBaixa, listCandidatos } from '../services/candidatos.service.js';
import { STATUS_CONTRATADO } from '../services/candidato-opcoes.js';

const ICON_COMISSAO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M6 18 18 6"/></svg>';

// Ícone de saída: o candidato deixou a empresa antes de fechar os meses.
const ICON_BAIXA =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>';

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
  acao: {
    header: 'Baixa',
    rotulo: 'Baixa',
    icone: ICON_BAIXA,
    classe: 'btn-acao--info',
  },
});

/** A página lista apenas quem já está com o status "Contratado". */
function listarContratados() {
  return ordenarPorVaga(
    listCandidatos().filter((candidato) => candidato.statusCandidato === STATUS_CONTRATADO)
  );
}

function renderEmptyState() {
  return `
    <section class="card empty-state">
      <span class="card__icon">${ICON_COMISSAO}</span>
      <h2>Nenhum candidato contratado</h2>
      <p class="text-muted">
        Assim que um candidato ficar com o status "Contratado" na página
        Candidato, ele aparece aqui para lançar a contratação e o nível.
      </p>
    </section>
  `;
}

export const comissaoPage = {
  title: 'Comissão',

  render() {
    const contratados = listarContratados();

    return `
      <div class="page-comissao page-enter">
        <header class="page-header">
          <h1>Comissão</h1>
          <p class="text-muted">
            Candidatos contratados.
            ${contratados.length > 0 ? 'Preencha a contratação e o nível para calcular a comissão.' : ''}
          </p>
        </header>

        ${contratados.length === 0 ? renderEmptyState() : tabela.render(contratados)}
      </div>
    `;
  },

  init(container) {
    tabela.init(container, {
      async onAcao(candidato) {
        const confirmado = await showConfirm({
          title: 'Confirmar baixa',
          message:
            `Dar baixa em ${candidato.nome} tira o candidato desta lista e, ` +
            'na página Candidato, passa o status para "Sem interesse" e a ' +
            'etapa para "Inativo". A contratação, o nível e o restante do ' +
            'cadastro continuam salvos.',
          confirmLabel: 'Dar baixa',
          confirmClass: 'btn--info',
        });

        if (!confirmado) {
          return;
        }

        darBaixa(candidato.id);
        showAlert({
          type: 'success',
          title: 'Baixa registrada',
          message: `${candidato.nome} saiu da lista de comissão.`,
        });

        // Re-renderiza para a linha sair da tabela.
        container.innerHTML = comissaoPage.render();
        comissaoPage.init(container);
      },
    });
  },
};
