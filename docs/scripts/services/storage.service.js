/**
 * Camada de acesso ao localStorage, com prefixo de namespace e
 * fallback silencioso quando o armazenamento não está disponível.
 */

const PREFIX = 'hirecash_';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (_error) {
      // ignora
    }
  },
};
