/**
 * Transformações de texto usadas na exibição e na busca.
 */

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Centavos → "R$ 1.234,56". */
export function formatCurrency(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * "AAAA-MM-DD" → "DD/MM/AAAA".
 *
 * Feito na mão de propósito: `new Date('2026-09-15')` é interpretado como
 * meia-noite em UTC, o que no fuso do Brasil cai no dia 14 e faria toda
 * data aparecer um dia atrás.
 */
export function formatDate(iso) {
  const [ano, mes, dia] = String(iso ?? '').split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : '';
}

/** "AAAA-MM" → "Outubro de 2026". */
export function formatMesAno(anoMes) {
  const [ano, mes] = String(anoMes ?? '')
    .split('-')
    .map(Number);
  if (!ano || !mes) {
    return '';
  }
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Minúsculas e sem acento, para a busca casar "Analista" com "analista". */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
