/**
 * Roteador simples baseado em hash (#/rota).
 * Não requer configuração de servidor — funciona nativamente no GitHub Pages.
 */
import { candidatoPage } from './pages/candidato.js';
import { dashboardPage } from './pages/dashboard.js';
import { comissaoPage } from './pages/comissao.js';
import { logger } from './utils/logger.js';

const APP_NAME = 'HireCash';
const DEFAULT_ROUTE = 'dashboard';

const ROUTES = {
  candidato: candidatoPage,
  dashboard: dashboardPage,
  comissao: comissaoPage,
};

function getRouteFromHash() {
  const key = window.location.hash.replace(/^#\/?/, '');
  return ROUTES[key] ? key : DEFAULT_ROUTE;
}

export function initRouter() {
  const content = document.getElementById('app-content');
  const navItems = document.querySelectorAll('[data-route]');

  function render(routeKey) {
    const page = ROUTES[routeKey];
    content.innerHTML = page.render();
    document.title = `${APP_NAME} · ${page.title}`;

    navItems.forEach((item) => {
      const isActive = item.dataset.route === routeKey;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    if (typeof page.init === 'function') {
      page.init(content);
    }

    logger.info('router', `Rota ativa: ${routeKey}`);
  }

  function handleHashChange() {
    const routeKey = getRouteFromHash();
    const expectedHash = `#/${routeKey}`;

    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
      return;
    }

    render(routeKey);
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}
