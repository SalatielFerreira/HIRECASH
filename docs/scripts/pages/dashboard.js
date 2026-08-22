import { showAlert } from '../components/alert.js';

const ICON_DASHBOARD =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>';

export const dashboardPage = {
  title: 'Dashboard',

  render() {
    return `
      <div class="page-dashboard page-enter">
        <header class="page-header">
          <h1>Dashboard</h1>
          <p class="text-muted">Visão geral do HireCash.</p>
        </header>

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_DASHBOARD}</span>
            <h2>Em construção</h2>
          </div>
          <p>
            Os indicadores e resumos do painel serão definidos nos próximos passos.
          </p>
        </section>

        <section class="card">
          <h2>Componente de alerta</h2>
          <p>Pré-visualize os estilos de alerta que serão usados no restante do app.</p>
          <div class="btn-row">
            <button type="button" class="btn btn--outline" data-demo-alert="success">Sucesso</button>
            <button type="button" class="btn btn--outline" data-demo-alert="error">Erro</button>
            <button type="button" class="btn btn--outline" data-demo-alert="warning">Aviso</button>
            <button type="button" class="btn btn--outline" data-demo-alert="info">Informação</button>
          </div>
        </section>
      </div>
    `;
  },

  init(container) {
    const DEMO_MESSAGES = {
      success: { title: 'Tudo certo!', message: 'Ação concluída com sucesso.' },
      error: { title: 'Algo deu errado', message: 'Não foi possível concluir a ação.' },
      warning: { title: 'Atenção', message: 'Confira os dados antes de continuar.' },
      info: { title: 'Você sabia?', message: 'Este é um alerta informativo.' },
    };

    container.querySelectorAll('[data-demo-alert]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.demoAlert;
        showAlert({ type, ...DEMO_MESSAGES[type] });
      });
    });
  },
};
