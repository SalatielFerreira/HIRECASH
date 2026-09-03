import { storage } from './storage.service.js';

const KEY = 'candidatos';

export function listCandidatos() {
  return storage.get(KEY, []);
}

export function addCandidato(candidato) {
  const candidatos = listCandidatos();
  const novo = {
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    ...candidato,
  };
  candidatos.unshift(novo);
  storage.set(KEY, candidatos);
  return novo;
}

/**
 * Atualiza um candidato existente com os campos informados em `patch`.
 * Retorna o candidato já atualizado, ou `null` se o id não existir.
 */
export function updateCandidato(id, patch) {
  const candidatos = listCandidatos();
  const index = candidatos.findIndex((candidato) => candidato.id === id);
  if (index === -1) {
    return null;
  }

  const atualizado = {
    ...candidatos[index],
    ...patch,
    atualizadoEm: new Date().toISOString(),
  };
  candidatos[index] = atualizado;
  storage.set(KEY, candidatos);
  return atualizado;
}
