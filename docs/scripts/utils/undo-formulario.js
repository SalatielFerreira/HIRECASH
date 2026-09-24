/**
 * Ctrl+Z (Cmd+Z no Mac) desfaz o último campo alterado num formulário —
 * tanto texto quanto a escolha de uma opção (select), que o undo nativo
 * do navegador não cobre.
 *
 * Um passo de desfazer é uma edição completa de um campo (o valor de
 * antes até o de depois de um "change"), não cada tecla digitada — não
 * dá pra reaproveitar o undo nativo do navegador porque os campos com
 * máscara (moeda, data) reescrevem o valor a cada tecla, o que já
 * quebra o histórico dele.
 *
 * @param {HTMLFormElement} form
 * @param {() => boolean} [estaAtivo] só reage ao Ctrl+Z quando isto
 *   retornar `true` (ex.: o modal do formulário estar aberto). Sem isso,
 *   o atalho ficaria "vivo" mesmo com o formulário fechado — e, pior,
 *   como o overlay do modal é `position: fixed`, o foco no momento da
 *   tecla pode nem estar mais dentro do `form` (ex.: depois de um clique
 *   no fundo do modal), então ouvir o keydown só no `form` perderia o
 *   atalho nesses casos.
 */
export function ativarUndoFormulario(form, estaAtivo = () => true) {
  let pilha = [];
  let valorConhecido = new WeakMap();

  function ehCampo(elemento) {
    return elemento instanceof HTMLElement && elemento.matches('input, select, textarea');
  }

  // Snapshot do valor atual de cada campo — não depende de um "focusin"
  // ter disparado antes (um select trocado por script, sem foco real,
  // também deve entrar no histórico).
  function capturarEstadoAtual() {
    valorConhecido = new WeakMap();
    form.querySelectorAll('input, select, textarea').forEach((elemento) => {
      valorConhecido.set(elemento, elemento.value);
    });
  }

  form.addEventListener('change', (event) => {
    const elemento = event.target;
    if (!ehCampo(elemento)) {
      return;
    }
    const valorAnterior = valorConhecido.get(elemento) ?? '';
    if (valorAnterior !== elemento.value) {
      pilha.push({ elemento, valorAnterior });
    }
    valorConhecido.set(elemento, elemento.value);
  });

  function desfazer() {
    const ultimo = pilha.pop();
    if (!ultimo) {
      return;
    }
    // Atualiza antes de disparar o evento, senão o listener de 'change'
    // acima vê a restauração como uma edição nova e empilha de novo.
    valorConhecido.set(ultimo.elemento, ultimo.valorAnterior);
    ultimo.elemento.value = ultimo.valorAnterior;
    ultimo.elemento.dispatchEvent(new Event('change', { bubbles: true }));
    ultimo.elemento.focus();
  }

  // No documento (não no form): o overlay do modal é fixed, então o
  // elemento focado no momento do atalho pode já não estar mais dentro
  // do form (ex.: depois de clicar no fundo do modal).
  document.addEventListener('keydown', (event) => {
    if (!estaAtivo()) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      desfazer();
    }
  });

  capturarEstadoAtual();

  /** Zera o histórico — chamar sempre que o formulário reabrir do zero. */
  return function reiniciarUndo() {
    pilha = [];
    capturarEstadoAtual();
  };
}
