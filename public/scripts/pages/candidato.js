const ICON_CANDIDATO =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';

export const candidatoPage = {
  title: 'Candidato',

  render() {
    return `
      <div class="page-candidato page-enter">
        <header class="page-header">
          <h1>Candidato</h1>
          <p class="text-muted">Cadastro e acompanhamento de candidatos.</p>
        </header>

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_CANDIDATO}</span>
            <h2>Em construção</h2>
          </div>
          <p>O conteúdo desta página será definido nos próximos passos.</p>
        </section>
      </div>
    `;
  },
};
