import { storage } from './storage.service.js';
import { APP_VERSION } from '../version.js';
import {
  ETAPA_BAIXA,
  ETAPA_EM_ATIVIDADE,
  STATUS_CONTRATADO,
  STATUS_SEM_INTERESSE,
  STATUS_VAGA_ENCERRADA,
  STATUS_VAGA_PUBLICADA,
} from './candidato-opcoes.js';

const KEY = 'candidatos';

/** Marca de formato gravada no arquivo, para reconhecer o backup na importação. */
const BACKUP_FORMAT = 'hirecash-candidatos';

export function listCandidatos() {
  return storage.get(KEY, []);
}

/**
 * Campos preenchidos automaticamente a partir de outros.
 *
 * Hoje há uma regra: pôr o status em "Contratado" coloca a etapa em
 * "Em atividade". Fica aqui, no serviço, para valer tanto no cadastro
 * pelo modal quanto na edição direto na tabela.
 *
 * A regra só age quando os dados recebidos mexem no status — assim, mudar
 * a etapa à mão depois continua valendo, em vez de ser sobrescrito a cada
 * gravação seguinte.
 */
function aplicarDerivados(dados) {
  if (dados.statusCandidato === STATUS_CONTRATADO) {
    return { ...dados, etapa: ETAPA_EM_ATIVIDADE };
  }
  return dados;
}

/**
 * Quando um candidato de uma vaga é contratado, a vaga se encerra para
 * TODOS os candidatos que concorrem a ela — inclusive o próprio
 * contratado —, mesmo que o status da vaga de cada um tivesse sido
 * escolhido diferente antes. E se deixar de haver algum contratado
 * (editar o status de volta, ou dar baixa), a vaga reabre sozinha,
 * voltando a "Publicada".
 *
 * "Encerrada" nunca é escolhida à mão — fica fora de
 * `STATUS_VAGA_OPTIONS` — e por isso só este recálculo grava esse valor.
 * Roda a cada gravação (aqui, não em cada tela), então vale tanto para o
 * cadastro pelo modal quanto para a edição direto na tabela.
 */
function recalcularStatusVaga(candidatos, vagaNome) {
  const nome = (vagaNome || '').trim();
  if (!nome) {
    return candidatos;
  }

  const algumContratado = candidatos.some(
    (item) => (item.vaga || '').trim() === nome && item.statusCandidato === STATUS_CONTRATADO
  );

  return candidatos.map((item) => {
    if ((item.vaga || '').trim() !== nome) {
      return item;
    }
    if (algumContratado) {
      return item.statusVaga === STATUS_VAGA_ENCERRADA
        ? item
        : { ...item, statusVaga: STATUS_VAGA_ENCERRADA };
    }
    return item.statusVaga === STATUS_VAGA_ENCERRADA
      ? { ...item, statusVaga: STATUS_VAGA_PUBLICADA }
      : item;
  });
}

export function addCandidato(candidato) {
  let candidatos = listCandidatos();
  const novo = aplicarDerivados({
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    ...candidato,
  });
  candidatos.unshift(novo);
  candidatos = recalcularStatusVaga(candidatos, novo.vaga);
  storage.set(KEY, candidatos);
  return candidatos.find((item) => item.id === novo.id);
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

  const vagaAntiga = candidatos[index].vaga;
  const atualizado = {
    ...candidatos[index],
    ...aplicarDerivados(patch),
    atualizadoEm: new Date().toISOString(),
  };
  candidatos[index] = atualizado;

  // Recalcula a vaga antiga (por exemplo: o candidato que a encerrava
  // mudou de vaga, e ela pode precisar reabrir) e, se mudou de vaga, a
  // nova também (pode encerrar na hora, se já houver um contratado nela).
  let resultado = recalcularStatusVaga(candidatos, vagaAntiga);
  if ((atualizado.vaga || '').trim() !== (vagaAntiga || '').trim()) {
    resultado = recalcularStatusVaga(resultado, atualizado.vaga);
  }

  storage.set(KEY, resultado);
  return resultado.find((item) => item.id === id);
}

/**
 * Propaga o novo nome de uma vaga renomeada para todos os candidatos que
 * usavam o nome antigo, e recalcula o status dela (chamado por
 * `vagas.service.js`).
 */
export function renomearVagaEmCandidatos(nomeAntigo, nomeNovo) {
  const antigo = (nomeAntigo || '').trim();
  const novo = (nomeNovo || '').trim();
  if (!antigo || !novo || antigo === novo) {
    return;
  }

  let candidatos = listCandidatos().map((item) =>
    (item.vaga || '').trim() === antigo ? { ...item, vaga: novo } : item
  );
  candidatos = recalcularStatusVaga(candidatos, novo);
  storage.set(KEY, candidatos);
}

/**
 * Recalcula o status de TODAS as vagas de uma vez. Roda a cada
 * inicialização do app (ver `app.js`) — é idempotente e rápida (poucos
 * candidatos, operações simples de array), então não tem problema
 * rodar sempre.
 *
 * Existe para candidatos gravados antes desta regra existir: sem isso,
 * um candidato já contratado antes desta versão só refletiria
 * "Encerrada" nos colegas de vaga na próxima vez que algum deles fosse
 * editado — em vez de aparecer certo assim que o app abre.
 */
export function recalcularTodasAsVagas() {
  let candidatos = listCandidatos();
  if (candidatos.length === 0) {
    return;
  }

  const nomes = new Set(candidatos.map((item) => (item.vaga || '').trim()).filter(Boolean));
  nomes.forEach((nome) => {
    candidatos = recalcularStatusVaga(candidatos, nome);
  });

  storage.set(KEY, candidatos);
}

/**
 * Dá baixa em um candidato contratado que saiu antes de fechar os meses
 * da comissão: o status volta para "Sem interesse" e a etapa passa a
 * "Baixa". Como a página de Comissão lista somente quem está
 * "Contratado", ele sai da lista por consequência disso — sem precisar de
 * um campo separado de "baixa".
 *
 * Retorna o candidato atualizado, ou `null` se o id não existir.
 */
export function darBaixa(id) {
  return updateCandidato(id, {
    statusCandidato: STATUS_SEM_INTERESSE,
    etapa: ETAPA_BAIXA,
  });
}

/** Conteúdo do arquivo de backup (exportação). */
export function buildBackup() {
  return {
    formato: BACKUP_FORMAT,
    versao: APP_VERSION,
    exportadoEm: new Date().toISOString(),
    candidatos: listCandidatos(),
  };
}

/**
 * Aceita tanto o arquivo completo de backup quanto uma lista solta de
 * candidatos. Retorna a lista de candidatos, ou `null` se não reconhecer
 * o conteúdo como um backup válido.
 */
function parseBackup(payload) {
  const lista = Array.isArray(payload) ? payload : payload?.candidatos;

  if (!Array.isArray(lista)) {
    return null;
  }

  const todosObjetos = lista.every(
    (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
  );

  return todosObjetos ? lista : null;
}

/**
 * Importa candidatos de um backup, casando pelo `id`: registros já existentes
 * são atualizados e os demais são acrescentados. Nunca apaga um candidato que
 * não esteja no arquivo — importar é sempre uma operação aditiva.
 *
 * Retorna `{ novos, atualizados }`, ou `null` se o arquivo não for um backup.
 */
export function importCandidatos(payload) {
  const lista = parseBackup(payload);
  if (!lista) {
    return null;
  }

  let candidatos = listCandidatos();
  const indicePorId = new Map(candidatos.map((candidato, index) => [candidato.id, index]));

  let novos = 0;
  let atualizados = 0;
  const vagasAfetadas = new Set();

  lista.forEach((item) => {
    // Candidatos vindos de fora (ou de um backup antigo, sem id) entram como novos.
    const id = typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID();
    const registro = { ...item, id, criadoEm: item.criadoEm || new Date().toISOString() };
    const index = indicePorId.get(id);

    if (index === undefined) {
      candidatos.push(registro);
      indicePorId.set(id, candidatos.length - 1);
      novos += 1;
    } else {
      candidatos[index] = { ...candidatos[index], ...registro };
      atualizados += 1;
    }

    if (registro.vaga) {
      vagasAfetadas.add(registro.vaga.trim());
    }
  });

  // Garante que o status de cada vaga afetada reflita os dados importados,
  // mesmo que o arquivo trouxesse um valor de "Status da vaga" desatualizado.
  vagasAfetadas.forEach((nome) => {
    candidatos = recalcularStatusVaga(candidatos, nome);
  });

  storage.set(KEY, candidatos);
  return { novos, atualizados };
}
