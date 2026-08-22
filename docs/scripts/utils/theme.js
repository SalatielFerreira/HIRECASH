/**
 * Controla o tema claro/escuro. As cores de marca (roxo) não mudam entre
 * os temas — apenas fundo, superfícies e texto (ver variables.css).
 *
 * Usa uma chave própria no localStorage (fora do storage.service) porque
 * o valor também precisa ser lido de forma síncrona pelo script inline no
 * <head> de index.html, antes do resto da aplicação carregar, para evitar
 * flash do tema errado.
 */
import { logger } from './logger.js';

const THEME_KEY = 'hirecash_theme';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return systemPrefersDark() ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_error) {
    // localStorage indisponível — o tema ainda funciona, só não persiste.
  }
  logger.info('theme', `Tema aplicado: ${theme}`);
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
