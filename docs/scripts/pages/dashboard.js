import { previsaoMensal } from '../services/comissao.service.js';
import { formatCurrency, formatMesAno } from '../utils/format.js';

const ICON_PREVISAO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/></svg>';

/** Linha "Mês de ano · R$ valor" da lista de previsão. */
function previsaoItemHtml({ mes, total }) {
  return (
    `<li class="previsao-item">` +
    `<span class="previsao-item__mes">${formatMesAno(mes)}</span>` +
    `<span class="previsao-item__valor">${formatCurrency(total)}</span>` +
    `</li>`
  );
}

function previsaoComissaoHtml() {
  const meses = previsaoMensal();

  const corpo =
    meses.length === 0
      ? '<p class="text-muted previsao-vazia">Nenhuma comissão prevista pelos próximos meses.</p>'
      : `<ul class="previsao-lista">${meses.map(previsaoItemHtml).join('')}</ul>`;

  return `
    <section class="card">
      <div class="card__header">
        <span class="card__icon">${ICON_PREVISAO}</span>
        <h2>Comissão prevista</h2>
      </div>
      <p class="text-muted">Quanto ainda vai entrar, mês a mês, a partir de hoje.</p>
      ${corpo}
    </section>
  `;
}

export const dashboardPage = {
  title: 'Dashboard',

  render() {
    return `
      <div class="page-dashboard page-enter">
        <header class="page-header">
          <h1>Dashboard</h1>
          <p class="text-muted">Visão geral do HireCash.</p>
        </header>

        ${previsaoComissaoHtml()}
      </div>
    `;
  },
};
