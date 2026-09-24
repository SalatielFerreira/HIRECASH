import { normalizar } from './format.js';

/**
 * Autocompleta o restante da palavra sendo digitada: assim que o que já
 * foi digitado bate com o começo de uma opção, completa o campo com ela
 * e seleciona o pedaço que faltava — continuar digitando substitui a
 * seleção, e ↑/→/Tab/Enter aceitam o que já está lá. Mesmo padrão de
 * autocompletar clássico (Excel, barra de endereço de navegador antigos).
 *
 * @param {HTMLInputElement} input
 * @param {() => string[]} obterOpcoes lista de opções válidas no
 *   momento — uma função, não um array fixo, porque as opções de cidade
 *   mudam conforme o estado escolhido.
 */
export function ativarAutocompletarPalavra(input, obterOpcoes) {
  input.addEventListener('input', (event) => {
    // Apagando (Backspace/Delete/Corte): não força completar de novo,
    // senão nunca dá pra encolher o texto de verdade.
    if (event.inputType && event.inputType.startsWith('delete')) {
      return;
    }

    const digitado = input.value;
    if (!digitado) {
      return;
    }

    const alvo = normalizar(digitado);
    const opcao = obterOpcoes().find((item) => normalizar(item).startsWith(alvo));
    if (!opcao || opcao.length <= digitado.length) {
      return;
    }

    // Troca pelo texto certo da opção (não só o que foi digitado + resto)
    // — assim a grafia/acentos ficam certos mesmo se o usuário digitou
    // sem acento ou em minúsculas.
    input.value = opcao;
    input.setSelectionRange(digitado.length, opcao.length);
  });
}
