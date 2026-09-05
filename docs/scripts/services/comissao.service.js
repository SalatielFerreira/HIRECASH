/**
 * Regra de comissão por candidato contratado.
 */
import { listCandidatos } from './candidatos.service.js';
import { FONTE_INDICACAO, STATUS_CONTRATADO } from './candidato-opcoes.js';

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
 * As duas parcelas da comissão, a partir da data de contratação e do nível:
 *
 * - P1: dia 15 do mês seguinte à contratação → R$ 100,00;
 * - P2: dia 15 do mês seguinte a esse → o restante do valor do nível.
 *
 * Sempre devolve as duas, mesmo no N1, em que o total já é R$ 100,00 e a
 * segunda sai zerada — as duas linhas aparecem na tabela de propósito,
 * para a leitura da coluna ser sempre igual.
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

  return [
    { data: diaQuinze(ano, mes + 1), valor: PRIMEIRA_PARCELA },
    { data: diaQuinze(ano, mes + 2), valor: total - PRIMEIRA_PARCELA },
  ];
}

/** Data local em "AAAA-MM-DD" — evita o mesmo problema de fuso do `diaQuinze`. */
function paraIso(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Soma, mês a mês, as parcelas de comissão de todos os candidatos
 * contratados (fora indicação, que não gera comissão) que ainda não
 * venceram — o que já passou não ajuda a planejar o que vem pela frente,
 * então fica de fora. É o que a Dashboard mostra como previsão.
 *
 * Devolve do mês mais próximo pro mais distante, pulando meses sem
 * nenhuma parcela futura: `[{ mes: "AAAA-MM", total: <centavos> }, ...]`.
 */
export function previsaoMensal(hoje = new Date()) {
  const hojeIso = paraIso(hoje);
  const porMes = new Map();

  listCandidatos()
    .filter(
      (candidato) =>
        candidato.statusCandidato === STATUS_CONTRATADO && candidato.fonte !== FONTE_INDICACAO
    )
    .forEach((candidato) => {
      calcularParcelas(candidato.contratacao, candidato.nivel).forEach((parcela) => {
        // Parcela zerada (P2 do N1) não é dinheiro esperado — não faz
        // sentido aparecer como se fosse mês de recebimento.
        if (parcela.data < hojeIso || parcela.valor <= 0) {
          return;
        }
        const mes = parcela.data.slice(0, 7);
        porMes.set(mes, (porMes.get(mes) || 0) + parcela.valor);
      });
    });

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}
