/**
 * Registro de vagas: código + nome. O código é a chave que se digita no
 * cadastro de candidato (`resolverVagaPorCodigo`); o nome é só para
 * leitura — é ele que aparece na tabela de candidatos.
 *
 * Separado de `candidatos.service.js` porque tem seu próprio ciclo de
 * vida (cadastrar, editar, excluir) independente de qualquer candidato.
 */
import { storage } from './storage.service.js';
import { sincronizarVagaEmCandidatos } from './candidatos.service.js';

const KEY = 'vagas';

function limpar(texto) {
  return (texto || '').trim();
}

function codigosIguais(a, b) {
  return limpar(a).toLowerCase() === limpar(b).toLowerCase();
}

export function listVagas() {
  return storage.get(KEY, []);
}

/** Vaga com esse código (sem diferenciar maiúsculas), ou `null`. */
export function findVagaPorCodigo(codigo) {
  const codigoLimpo = limpar(codigo);
  if (!codigoLimpo) {
    return null;
  }
  return listVagas().find((vaga) => codigosIguais(vaga.codigo, codigoLimpo)) || null;
}

/** `{ ok: true, vaga }` se o código existir, `{ ok: false }` se não. */
export function resolverVagaPorCodigo(codigo) {
  const vaga = findVagaPorCodigo(codigo);
  return vaga ? { ok: true, vaga } : { ok: false };
}

/** Retorna a vaga criada, ou `null` se faltar código/nome ou o código já existir. */
export function addVaga({ codigo, nome }) {
  const codigoLimpo = limpar(codigo);
  const nomeLimpo = limpar(nome);
  if (!codigoLimpo || !nomeLimpo) {
    return null;
  }

  const vagas = listVagas();
  if (vagas.some((vaga) => codigosIguais(vaga.codigo, codigoLimpo))) {
    return null;
  }

  const nova = {
    id: crypto.randomUUID(),
    codigo: codigoLimpo,
    nome: nomeLimpo,
    criadoEm: new Date().toISOString(),
  };
  vagas.push(nova);
  storage.set(KEY, vagas);
  return nova;
}

/**
 * Atualiza código e nome de uma vaga já cadastrada. Retorna a vaga
 * atualizada, ou `null` se o id não existir, faltar código/nome, ou o
 * novo código colidir com o de outra vaga.
 *
 * Propaga a mudança para todos os candidatos que já usam essa vaga —
 * sem isso, o campo Vaga desses candidatos continuaria mostrando o nome
 * antigo, e um código renomeado deixaria de resolver para eles.
 */
export function updateVaga(id, { codigo, nome }) {
  const codigoLimpo = limpar(codigo);
  const nomeLimpo = limpar(nome);
  if (!codigoLimpo || !nomeLimpo) {
    return null;
  }

  const vagas = listVagas();
  const index = vagas.findIndex((vaga) => vaga.id === id);
  if (index === -1) {
    return null;
  }

  if (vagas.some((vaga) => vaga.id !== id && codigosIguais(vaga.codigo, codigoLimpo))) {
    return null;
  }

  const codigoAntigo = vagas[index].codigo;
  const mudou = codigoAntigo !== codigoLimpo || vagas[index].nome !== nomeLimpo;
  vagas[index] = { ...vagas[index], codigo: codigoLimpo, nome: nomeLimpo };
  storage.set(KEY, vagas);

  if (mudou) {
    sincronizarVagaEmCandidatos(codigoAntigo, { codigo: codigoLimpo, nome: nomeLimpo });
  }

  return vagas[index];
}

/**
 * Remove uma vaga do registro. Candidatos já cadastrados com essa vaga
 * não são alterados — o campo deles preserva o código e o nome (mesmo
 * não estando mais no registro), do mesmo jeito que já acontece com
 * etapas atribuídas automaticamente.
 */
export function deleteVaga(id) {
  storage.set(
    KEY,
    listVagas().filter((vaga) => vaga.id !== id)
  );
}

function parseVagas(lista) {
  if (!Array.isArray(lista)) {
    return null;
  }
  const todosObjetos = lista.every(
    (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
  );
  return todosObjetos ? lista : null;
}

/**
 * Importa vagas de um backup, casando por `id` (ou, na falta dele, pelo
 * `código`) — igual a `importCandidatos`, nunca apaga o que já existe, só
 * acrescenta ou atualiza. Retorna `{ novas, atualizadas }`, ou `null` se
 * a lista não for reconhecida.
 */
export function importVagas(lista) {
  const itens = parseVagas(lista);
  if (!itens) {
    return null;
  }

  const vagas = listVagas();
  const indicePorId = new Map(vagas.map((vaga, index) => [vaga.id, index]));
  const indicePorCodigo = new Map(vagas.map((vaga, index) => [vaga.codigo.toLowerCase(), index]));

  let novas = 0;
  let atualizadas = 0;

  itens.forEach((item) => {
    const codigo = limpar(item.codigo);
    const nome = limpar(item.nome);
    if (!codigo || !nome) {
      return;
    }

    const id = typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID();
    const index = indicePorId.get(id) ?? indicePorCodigo.get(codigo.toLowerCase());

    if (index === undefined) {
      const nova = { id, codigo, nome, criadoEm: item.criadoEm || new Date().toISOString() };
      vagas.push(nova);
      indicePorId.set(id, vagas.length - 1);
      indicePorCodigo.set(codigo.toLowerCase(), vagas.length - 1);
      novas += 1;
    } else {
      vagas[index] = { ...vagas[index], codigo, nome };
      atualizadas += 1;
    }
  });

  storage.set(KEY, vagas);
  return { novas, atualizadas };
}
