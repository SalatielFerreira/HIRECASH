import { getTheme, toggleTheme } from '../utils/theme.js';

const ICON_CONFIG =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';

const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';

export const configuracaoPage = {
  title: 'Configuração',

  render() {
    return `
      <div class="page-configuracao page-enter">
        <header class="page-header">
          <h1>Configuração</h1>
          <p class="text-muted">Preferências do aplicativo.</p>
        </header>

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_CONFIG}</span>
            <h2>Aparência</h2>
          </div>

          <div class="settings-row">
            <div class="settings-row__text">
              <h3>Tema da página</h3>
              <p class="text-muted" id="theme-status">Claro</p>
            </div>
            <button
              type="button"
              class="theme-switch"
              id="theme-switch"
              aria-label="Alternar entre tema claro e escuro"
              aria-pressed="false"
            >
              <span class="theme-switch__thumb">
                <span class="theme-switch__icon theme-switch__icon--sun">${ICON_SUN}</span>
                <span class="theme-switch__icon theme-switch__icon--moon">${ICON_MOON}</span>
              </span>
            </button>
          </div>
        </section>
      </div>
    `;
  },

  init(container) {
    const button = container.querySelector('#theme-switch');
    const status = container.querySelector('#theme-status');

    function sync(theme) {
      const isDark = theme === 'dark';
      button.classList.toggle('is-dark', isDark);
      button.setAttribute('aria-pressed', String(isDark));
      status.textContent = isDark ? 'Escuro' : 'Claro';
    }

    sync(getTheme());

    button.addEventListener('click', () => {
      sync(toggleTheme());
    });
  },
};
