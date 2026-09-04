import { storage } from './storage.service.js';
import { APP_VERSION } from '../version.js';
import { ETAPA_EM_ATIVIDADE, STATUS_CONTRATADO } from './candidato-opcoes.js';

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

export function addCandidato(candidato) {
  const candidatos = listCandidatos();
  const novo = aplicarDerivados({
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    ...candidato,
  });
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
    ...aplicarDerivados(patch),
    atualizadoEm: new Date().toISOString(),
  };
  candidatos[index] = atualizado;
  storage.set(KEY, candidatos);
  return atualizado;
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

  const candidatos = listCandidatos();
  const indicePorId = new Map(candidatos.map((candidato, index) => [candidato.id, index]));

  let novos = 0;
  let atualizados = 0;

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
  });

  storage.set(KEY, candidatos);
  return { novos, atualizados };
}
