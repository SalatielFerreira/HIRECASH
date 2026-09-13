/**
 * Ativa "arrastar para rolar" (clicar e arrastar com o mouse) num elemento
 * com rolagem horizontal. Pensado para a tabela de candidatos: arrastar
 * para o lado rola a própria tabela, arrastar para cima/baixo rola a
 * página — sem depender só da barra de rolagem.
 *
 * Só entra em modo "arrasto" depois de um pequeno deslocamento (LIMIAR) —
 * abaixo disso é tratado como clique normal (ex.: abrir edição de célula).
 */
const LIMIAR_PX = 6;

export function ativarArrastarParaRolar(elementoHorizontal) {
  const elementoVertical = elementoHorizontal.closest('.app-content') || elementoHorizontal;

  let arrastando = false;
  let iniciouArrasto = false;
  let inicioX = 0;
  let inicioY = 0;
  let scrollLeftInicial = 0;
  let scrollTopInicial = 0;

  function aoMoverMouse(event) {
    const deltaX = event.clientX - inicioX;
    const deltaY = event.clientY - inicioY;

    if (!iniciouArrasto) {
      if (Math.abs(deltaX) < LIMIAR_PX && Math.abs(deltaY) < LIMIAR_PX) {
        return;
      }
      iniciouArrasto = true;
      elementoHorizontal.classList.add('is-arrastando');
    }

    event.preventDefault();
    elementoHorizontal.scrollLeft = scrollLeftInicial - deltaX;
    elementoVertical.scrollTop = scrollTopInicial - deltaY;
  }

  function aoSoltarMouse() {
    arrastando = false;
    document.removeEventListener('mousemove', aoMoverMouse);
    document.removeEventListener('mouseup', aoSoltarMouse);
    elementoHorizontal.classList.remove('is-arrastando');

    if (iniciouArrasto) {
      // Sem isto, o "soltar" do arrasto é lido como um clique e abre a
      // edição da célula que ficou embaixo do cursor.
      elementoHorizontal.addEventListener(
        'click',
        (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
        },
        { capture: true, once: true }
      );
    }
  }

  elementoHorizontal.addEventListener('mousedown', (event) => {
    if (
      arrastando ||
      event.button !== 0 ||
      event.target.closest('a, button, input, select, textarea')
    ) {
      return;
    }
    arrastando = true;
    iniciouArrasto = false;
    inicioX = event.clientX;
    inicioY = event.clientY;
    scrollLeftInicial = elementoHorizontal.scrollLeft;
    scrollTopInicial = elementoVertical.scrollTop;
    document.addEventListener('mousemove', aoMoverMouse);
    document.addEventListener('mouseup', aoSoltarMouse);
  });
}
