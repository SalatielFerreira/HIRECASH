import { getTheme, toggleTheme } from '../utils/theme.js';
import { showAlert } from '../components/alert.js';
import { buildBackup, importCandidatos, listCandidatos } from '../services/candidatos.service.js';
import { logger } from '../utils/logger.js';
import { salvarArquivo } from '../utils/arquivo.js';
import { APP_NAME, APP_VERSION } from '../version.js';

const ICON_CONFIG =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';

const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';

const ICON_SHIELD =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>';

const ICON_EXPORT =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>';

const ICON_IMPORT =
  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>';

function backupFileName() {
  return `hirecash-candidatos-${new Date().toISOString().slice(0, 10)}.json`;
}

function plural(quantidade, singular, pluralForma) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`;
}

export const configuracaoPage = {
  title: 'Configuração',

  render() {
    const total = listCandidatos().length;

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

        <section class="card">
          <div class="card__header">
            <span class="card__icon">${ICON_SHIELD}</span>
            <h2>Backup dos candidatos</h2>
          </div>

          <div class="settings-row">
            <div class="settings-row__text">
              <h3>Cópia de segurança</h3>
              <p class="text-muted" id="backup-status">
                ${plural(total, 'candidato salvo', 'candidatos salvos')} neste aparelho
              </p>
            </div>
          </div>

          <p class="text-muted backup-hint">
            Os candidatos ficam guardados só neste navegador. Exporte um arquivo de vez em
            quando para não perder nada ao limpar os dados do navegador ou trocar de aparelho.
          </p>

          <div class="backup-actions">
            <button type="button" class="btn btn--primary" id="btn-exportar">
              ${ICON_EXPORT}
              Exportar
            </button>
            <button type="button" class="btn btn--accent" id="btn-importar">
              ${ICON_IMPORT}
              Importar
            </button>
          </div>

          <input
            type="file"
            id="backup-file"
            accept="application/json,.json"
            hidden
          />
        </section>

        <footer class="app-version">
          <p class="app-version__name">${APP_NAME}</p>
          <p class="app-version__number">Versão ${APP_VERSION}</p>
        </footer>
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

    // --- Backup: exportar e importar ---------------------------------

    const exportButton = container.querySelector('#btn-exportar');
    const importButton = container.querySelector('#btn-importar');
    const fileInput = container.querySelector('#backup-file');
    const backupStatus = container.querySelector('#backup-status');

    function atualizarContagem() {
      const total = listCandidatos().length;
      backupStatus.textContent = `${plural(total, 'candidato salvo', 'candidatos salvos')} neste aparelho`;
    }

    exportButton.addEventListener('click', async () => {
      const backup = buildBackup();

      if (backup.candidatos.length === 0) {
        showAlert({
          type: 'warning',
          title: 'Nada para exportar',
          message: 'Nenhum candidato cadastrado ainda.',
        });
        return;
      }

      const nome = backupFileName();

      try {
        await salvarArquivo(JSON.stringify(backup, null, 2), nome, {
          mime: 'application/json',
          descricao: 'Backup HireCash',
        });
        logger.info('backup', `Backup exportado (${backup.candidatos.length} candidatos)`);
        showAlert({
          type: 'success',
          title: 'Backup exportado',
          message: `${plural(backup.candidatos.length, 'candidato salvo', 'candidatos salvos')} em ${nome}.`,
        });
      } catch (error) {
        // O usuário fechar o diálogo de salvar/compartilhar não é erro.
        if (error?.name === 'AbortError') {
          return;
        }
        logger.error('backup', 'Falha ao exportar candidatos', error);
        showAlert({
          type: 'error',
          title: 'Não foi possível exportar',
          message: 'Tente novamente. Se persistir, use outro navegador.',
        });
      }
    });

    importButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const arquivo = fileInput.files?.[0];
      if (!arquivo) {
        return;
      }

      try {
        const resultado = importCandidatos(JSON.parse(await arquivo.text()));

        if (!resultado) {
          showAlert({
            type: 'error',
            title: 'Arquivo não reconhecido',
            message: 'Selecione um arquivo de backup exportado pelo HireCash.',
          });
          return;
        }

        atualizarContagem();
        logger.info('backup', 'Backup importado', resultado);
        showAlert({
          type: 'success',
          title: 'Backup importado',
          message: `${plural(resultado.novos, 'candidato novo', 'candidatos novos')} e ${plural(resultado.atualizados, 'atualizado', 'atualizados')}.`,
        });
      } catch (error) {
        logger.error('backup', 'Falha ao importar candidatos', error);
        showAlert({
          type: 'error',
          title: 'Arquivo inválido',
          message: 'Não foi possível ler este arquivo. Verifique se é o backup correto.',
        });
      } finally {
        // Zera para permitir importar o mesmo arquivo de novo em seguida.
        fileInput.value = '';
      }
    });
  },
};
