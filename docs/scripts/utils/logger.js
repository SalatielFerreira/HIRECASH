/**
 * Logger central da aplicação.
 * - Imprime no console com nível e timestamp.
 * - Mantém um histórico rotativo em localStorage para apoiar auditoria/depuração
 *   (inspecionável via HireCash.logger.getLogs() no console do navegador).
 */

const STORAGE_KEY = 'hirecash_logs';
const MAX_ENTRIES = 200;

const LEVELS = {
  debug: { rank: 0, style: 'color:#6b7280' },
  info: { rank: 1, style: 'color:#3b82f6' },
  warn: { rank: 2, style: 'color:#f59e0b' },
  error: { rank: 3, style: 'color:#ef4444' },
};

const isDebugEnabled = () => {
  try {
    return localStorage.getItem('hirecash_debug') === 'true';
  } catch (_error) {
    return false;
  }
};

const readEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};

const persistEntry = (entry) => {
  try {
    const entries = readEntries();
    entries.push(entry);
    if (entries.length > MAX_ENTRIES) {
      entries.splice(0, entries.length - MAX_ENTRIES);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_error) {
    // localStorage indisponível (modo privado, quota excedida etc.) — ignora silenciosamente.
  }
};

function log(level, tag, message, data) {
  if (level === 'debug' && !isDebugEnabled()) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    tag,
    message,
    data: data ?? null,
  };

  const consoleMethod = level === 'debug' ? 'log' : level;
  // eslint-disable-next-line no-console
  console[consoleMethod](
    `%c[${entry.timestamp}] [${tag}]`,
    LEVELS[level].style,
    message,
    data ?? ''
  );

  persistEntry(entry);
}

export const logger = {
  debug: (tag, message, data) => log('debug', tag, message, data),
  info: (tag, message, data) => log('info', tag, message, data),
  warn: (tag, message, data) => log('warn', tag, message, data),
  error: (tag, message, data) => log('error', tag, message, data),
  getLogs: () => readEntries(),
  clearLogs: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
      // ignora
    }
  },
};
