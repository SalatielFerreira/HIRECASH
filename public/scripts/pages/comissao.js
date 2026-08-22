const ICON_COMISSAO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M6 18 18 6"/></svg>';

export const comissaoPage = {
  title: 'Comissão',

  render() {
    return `
      <div class="page-comissao page-enter">
        <header class="page-header">
          <h1>Comissão</h1>
          <p class="text-muted">Cálculo e histórico de comissões.</p>
        </header>

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_COMISSAO}</span>
            <h2>Em construção</h2>
          </div>
          <p>O conteúdo desta página será definido nos próximos passos.</p>
        </section>
      </div>
    `;
  },
};
