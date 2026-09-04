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

export const ETAPA_OPTIONS = [
  'Em abordagem',
  'Entrevista RH',
  'Entrevista técnica',
  'Contratação',
  'Em atividade',
];

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

/** Etapa preenchida automaticamente quando o status vira "Contratado". */
export const ETAPA_EM_ATIVIDADE = 'Em atividade';
