/**
 * Opções das listas do cadastro de candidato.
 *
 * Ficam neste módulo, e não no componente de tabela, porque a regra que
 * deriva a etapa a partir do status mora em `candidatos.service.js` — e o
 * componente de tabela já importa esse serviço, então o caminho contrário
 * fecharia um ciclo de imports.
 */

export const STATUS_VAGA_OPTIONS = ['Não publicada', 'Publicada', 'Congelada', 'Cancelada'];

export const MODALIDADE_OPTIONS = ['Presencial', 'Remoto', 'Híbrido'];

export const FONTE_OPTIONS = ['Gupy', 'Indicação', 'LinkedIn'];

/**
 * Etapas que o usuário pode escolher na lista.
 *
 * "Em atividade" e "Inativo" ficam fora de propósito: são valores que o
 * app atribui sozinho (ver `ETAPA_EM_ATIVIDADE` e `ETAPA_INATIVO`), não
 * opções para escolher à mão.
 */
export const ETAPA_OPTIONS = ['Em abordagem', 'Entrevista RH', 'Entrevista técnica', 'Contratação'];

export const STATUS_CANDIDATO_OPTIONS = [
  'Standby',
  'Sem retorno',
  'Sem interesse',
  'Agendado',
  'Reprovado',
  'Aprovado',
  'Contratado',
];

/** Status que marca o candidato como contratado — é o que a página de Comissão lista. */
export const STATUS_CONTRATADO = 'Contratado';

/** Status atribuído ao candidato ao dar baixa. */
export const STATUS_SEM_INTERESSE = 'Sem interesse';

/**
 * Etapas atribuídas pelo app, nunca escolhidas na lista:
 * - "Em atividade" quando o status vira "Contratado";
 * - "Inativo" quando é dada baixa no candidato.
 */
export const ETAPA_EM_ATIVIDADE = 'Em atividade';
export const ETAPA_INATIVO = 'Inativo';
