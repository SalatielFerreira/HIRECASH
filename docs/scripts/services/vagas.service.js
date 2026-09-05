/**
 * Registro de vagas: alimenta as opções do campo Vaga no cadastro de
 * candidato. Separado de `candidatos.service.js` porque tem seu próprio
 * ciclo de vida (cadastrar, renomear, excluir) independente de qualquer
 * candidato.
 */
import { storage } from './storage.service.js';
import { renomearVagaEmCandidatos } from './candidatos.service.js';

const KEY = 'vagas';

function normalizarNome(nome) {
  return (nome || '').trim();
}

function nomesIguais(a, b) {
  return normalizarNome(a).toLowerCase() === normalizarNome(b).toLowerCase();
}

export function listVagas() {
  return storage.get(KEY, []);
}

/** Retorna a vaga criada, ou `null` se o nome for vazio ou já existir. */
export function addVaga(nome) {
  const nomeLimpo = normalizarNome(nome);
  if (!nomeLimpo) {
    return null;
  }

  const vagas = listVagas();
  if (vagas.some((vaga) => nomesIguais(vaga.nome, nomeLimpo))) {
    return null;
  }

  const nova = { id: crypto.randomUUID(), nome: nomeLimpo, criadoEm: new Date().toISOString() };
  vagas.push(nova);
  storage.set(KEY, vagas);
  return nova;
}

/**
 * Renomeia uma vaga já cadastrada. Retorna a vaga atualizada, `null` se o
 * id não existir, o nome for vazio, ou colidir com outra vaga já
 * cadastrada.
 *
 * Propaga o novo nome para todos os candidatos que já usam o nome antigo
 * — sem isso, o campo Vaga desses candidatos ficaria com um valor "fora
 * da lista" (o nome antigo, que não existe mais no registro).
 */
export function updateVaga(id, nome) {
  const nomeLimpo = normalizarNome(nome);
  if (!nomeLimpo) {
    return null;
  }

  const vagas = listVagas();
  const index = vagas.findIndex((vaga) => vaga.id === id);
  if (index === -1) {
    return null;
  }

  if (vagas.some((vaga) => vaga.id !== id && nomesIguais(vaga.nome, nomeLimpo))) {
    return null;
  }

  const nomeAntigo = vagas[index].nome;
  vagas[index] = { ...vagas[index], nome: nomeLimpo };
  storage.set(KEY, vagas);

  if (nomeAntigo !== nomeLimpo) {
    renomearVagaEmCandidatos(nomeAntigo, nomeLimpo);
  }

  return vagas[index];
}

/**
 * Remove uma vaga do registro. Candidatos já cadastrados com essa vaga
 * não são alterados — o campo deles preserva o nome (mesmo não estando
 * mais entre as opções), do mesmo jeito que já acontece com etapas
 * atribuídas automaticamente.
 */
export function deleteVaga(id) {
  storage.set(
    KEY,
    listVagas().filter((vaga) => vaga.id !== id)
  );
}
