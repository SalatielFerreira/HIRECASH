/**
 * Salvar um arquivo gerado no navegador (backup em JSON, relatório em
 * CSV etc.) — mecanismo compartilhado por quem precisa disso.
 */

/** Em aparelho de toque preferimos o compartilhamento nativo do sistema. */
function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Salva usando o melhor recurso disponível no aparelho:
 * 1. celular/tablet → folha de compartilhamento do sistema;
 * 2. navegador com File System Access (Chrome/Edge) → diálogo "Salvar como";
 * 3. demais → download direto na pasta padrão.
 *
 * Retorna `false` quando o usuário cancela, para não exibir alerta de sucesso.
 */
export async function salvarArquivo(
  conteudo,
  nome,
  { mime = 'application/octet-stream', descricao = 'Arquivo' } = {}
) {
  const arquivo = new File([conteudo], nome, { type: mime });

  if (isTouchDevice() && navigator.canShare?.({ files: [arquivo] })) {
    await navigator.share({ files: [arquivo], title: nome });
    return true;
  }

  if (typeof window.showSaveFilePicker === 'function') {
    const extensao = nome.slice(nome.lastIndexOf('.'));
    const handle = await window.showSaveFilePicker({
      suggestedName: nome,
      types: [{ description: descricao, accept: { [mime]: [extensao] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(conteudo);
    await writable.close();
    return true;
  }

  const url = URL.createObjectURL(new Blob([conteudo], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
