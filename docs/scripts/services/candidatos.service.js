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
