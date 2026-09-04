/**
 * Regra de comissão por candidato contratado.
 */

/** Valor total da comissão por nível, em centavos. */
export const VALOR_POR_NIVEL = {
  N1: 10000,
  N2: 30000,
  N3: 50000,
  N4: 70000,
};

export const NIVEL_OPTIONS = Object.keys(VALOR_POR_NIVEL);

/** Adiantamento fixo da primeira parcela, em centavos (R$ 100,00). */
const PRIMEIRA_PARCELA = 10000;

/** Dia 15 de (ano, mês) em ISO. Mês é 1-based e a virada de ano é automática. */
function diaQuinze(ano, mes) {
  const data = new Date(ano, mes - 1, 15);
  const mesFinal = String(data.getMonth() + 1).padStart(2, '0');
  return `${data.getFullYear()}-${mesFinal}-15`;
}

/**
 * Parcelas da comissão a partir da data de contratação e do nível:
 *
 * - dia 15 do mês seguinte à contratação → R$ 100,00;
 * - dia 15 do mês seguinte a esse → o restante do valor do nível.
 *
 * No N1 o total é exatamente R$ 100,00, então a segunda parcela seria de
 * zero e é omitida — o candidato recebe tudo de uma vez.
 *
 * Retorna `[]` quando ainda falta a contratação ou o nível.
 */
export function calcularParcelas(contratacao, nivel) {
  const total = VALOR_POR_NIVEL[nivel];
  if (!contratacao || !total) {
    return [];
  }

  const [ano, mes] = String(contratacao).split('-').map(Number);
  if (!ano || !mes) {
    return [];
  }

  const parcelas = [{ data: diaQuinze(ano, mes + 1), valor: PRIMEIRA_PARCELA }];

  const restante = total - PRIMEIRA_PARCELA;
  if (restante > 0) {
    parcelas.push({ data: diaQuinze(ano, mes + 2), valor: restante });
  }

  return parcelas;
}
