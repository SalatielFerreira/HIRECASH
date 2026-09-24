/**
 * Menu de contexto (botão direito do mouse): mostra uma lista de opções
 * perto do cursor. Fecha ao clicar fora, rolar, redimensionar ou apertar
 * Esc. Só um por vez — abrir um novo fecha o anterior.
 */
let menuAberto = null;

function fecharMenuAberto() {
  if (!menuAberto) {
    return;
  }
  menuAberto.elemento.remove();
  document.removeEventListener('click', menuAberto.aoClicarFora, true);
  document.removeEventListener('keydown', menuAberto.aoTeclar);
  window.removeEventListener('scroll', menuAberto.fechar, true);
  window.removeEventListener('resize', menuAberto.fechar);
  menuAberto = null;
}

/**
 * @param {Object} options
 * @param {number} options.x
 * @param {number} options.y
 * @param {{ rotulo: string, perigo?: boolean, aoClicar: () => void }[]} options.itens
 */
export function abrirMenuContexto({ x, y, itens }) {
  fecharMenuAberto();

  const menu = document.createElement('div');
  menu.className = 'menu-contexto';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = itens
    .map(
      (item, index) =>
        `<button type="button" class="menu-contexto__item${item.perigo ? ' menu-contexto__item--perigo' : ''}" role="menuitem" data-index="${index}">${item.rotulo}</button>`
    )
    .join('');

  document.body.appendChild(menu);

  // Só dá pra medir depois de estar no documento — reposiciona pra não
  // vazar da tela (ex.: clique perto da borda direita/inferior).
  const rect = menu.getBoundingClientRect();
  const left = Math.min(x, window.innerWidth - rect.width - 8);
  const top = Math.min(y, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;

  menu.addEventListener('click', (event) => {
    const botao = event.target.closest('[data-index]');
    if (!botao) {
      return;
    }
    const item = itens[Number(botao.dataset.index)];
    fecharMenuAberto();
    item?.aoClicar?.();
  });

  function aoClicarFora(event) {
    if (!menu.contains(event.target)) {
      fecharMenuAberto();
    }
  }

  function aoTeclar(event) {
    if (event.key === 'Escape') {
      fecharMenuAberto();
    }
  }

  function fechar() {
    fecharMenuAberto();
  }

  // Só passa a fechar no próximo clique — senão o mesmo clique com o
  // botão direito que abriu o menu (o "click" sintético que o navegador
  // dispara depois do "contextmenu") já fecharia na hora.
  setTimeout(() => document.addEventListener('click', aoClicarFora, true), 0);
  document.addEventListener('keydown', aoTeclar);
  window.addEventListener('scroll', fechar, true);
  window.addEventListener('resize', fechar);

  menuAberto = { elemento: menu, aoClicarFora, aoTeclar, fechar };

  menu.querySelector('.menu-contexto__item')?.focus();
}
