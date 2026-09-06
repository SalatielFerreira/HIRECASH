# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.30.0] - 2026-09-06

### Alterado

- **Roxo da marca trocado por #1E093C** em toda a aplicação — barra superior, botões, badges de destaque, ícone do app, cor do navegador (barra de status/splash). Texto, borda e ícone em roxo sobre fundo escuro (ex.: item ativo do rodapé, botão contornado, link da tabela, campo em foco) usam automaticamente um roxo mais claro no tema escuro — o tom pedido é escuro demais pra servir de primeiro plano legível ali; fundo sólido (botão, topo, badge) continua sempre #1E093C nos dois temas.

## [0.29.1] - 2026-09-06

### Alterado

- **Régua "Talentos · Comissões · Resultados" de volta na logo da barra superior** — fazia parte da imagem original e tinha ficado de fora na entrega anterior. Para ela ficar legível (não só decorativa), a barra superior cresceu de 60px para 88px de altura.

## [0.29.0] - 2026-09-06

### Alterado

- **Logo da barra superior trocado pela arte de marca oficial** (fornecida pelo usuário): o "S" com os dois pontos de acento e o "HireCash" (Hire branco, Cash roxo em degradê), recortados sem a régua "Talentos • Comissões • Resultados" — não cabia com texto legível na altura da barra. Substitui o emblema + texto HTML que existiam antes.

## [0.28.0] - 2026-09-06

### Alterado

- **Novo ícone da marca**: o emblema da barra superior e o ícone do app trocaram a maleta pelo "S" da marca — uma fita curva com dois pontos de acento nas pontas —, mantendo o roxo e o "HireCash" (Hire em branco, Cash em verde-menta) como já eram.

## [0.27.0] - 2026-09-06

### Alterado

- **Relatório agora exporta `.xlsx` de verdade, com um modelo visual próprio** — em vez do `.csv` da entrega anterior. Título, cabeçalho colorido, linhas zebradas e quebra de linha na Observação vêm de um modelo em branco (`docs/templates/relatorio-modelo.xlsx`, gerado por `npm run generate:relatorio-modelo`); o app só abre esse arquivo e escreve os dados por baixo. Moeda e data são gravadas como número/data de verdade (com o formato do Excel aplicado), não texto — dá pra somar e ordenar direto na planilha. Usa [ExcelJS](https://github.com/exceljs/exceljs) vendorizado localmente (`docs/vendor/`, sem CDN), carregado só quando alguém gera um relatório.

## [0.26.0] - 2026-09-06

### Adicionado

- **Nova página Relatório**, quinta aba da barra inferior (entre Comissão e Configuração): escolhe os filtros (mesmo campo + valores da coluna de filtro do Candidato) e clica em "Gerar Excel" para baixar um `.csv` com os candidatos encontrados — abre direto no Excel, com acentuação correta e já formatado como no app (moeda, data). Traz também Observação, Contratação, Nível e uma coluna de Comissão total (soma das duas parcelas), que não aparecem no filtro mas fazem parte da exportação. Uma contagem ao lado do botão mostra quantos candidatos serão exportados antes de gerar o arquivo.

### Alterado

- `salvarArquivo` (usado para baixar o backup) virou uma função compartilhada em `utils/arquivo.js`, reaproveitada agora também pelo Relatório.

## [0.25.0] - 2026-09-05

### Alterado

- **Filtro da página Candidato virou uma coluna lateral**, que desliza da esquerda ao clicar no botão de funil (antes era um painel pequeno com um campo e um valor por vez). Agora traz todos os campos (menos Observação) de uma vez, um abaixo do outro, cada um com todos os valores em uso — pode escolher mais de um por campo, e cada escolha vira uma "flag" removível logo abaixo do campo. As alterações só valem depois de clicar em "Filtrar"; "Cancelar" (ou fechar/Esc/clicar fora) descarta sem aplicar.

## [0.24.0] - 2026-09-05

### Alterado

- **Barra de rolagem discreta e de acordo com o tema**: tanto a que rola a página (cima/baixo) quanto a da tabela de candidatos (lados) trocaram a barra grossa e sempre cinza do sistema por uma versão mais fina, com cantos arredondados e a cor combinando com o tema claro/escuro. Vale só para navegadores de computador — no celular, principalmente iPhone, o sistema já usa uma barra flutuante que não dá pra personalizar.

## [0.23.1] - 2026-09-05

### Removido

- **Card de demonstração "Componente de alerta" saiu da Dashboard** — era só uma pré-visualização dos estilos de alerta usada durante o desenvolvimento inicial, sem função para o usuário final.

## [0.23.0] - 2026-09-05

### Adicionado

- **Navegação entre campos editáveis com as setas do teclado**, como no Excel — nas páginas Candidato e Comissão: clique em uma célula para editar e use ←/→ para mover para o campo editável ao lado (pulando os que não são editáveis) e ↑/↓ para o mesmo campo do candidato de cima/baixo, pulando linhas escondidas pelo filtro. Em campo de texto, ←/→ só navegam quando o cursor já está na ponta do texto — no meio, continuam só movendo o cursor. Na Observação (texto com várias linhas), as setas nunca navegam, para não atrapalhar quem está escrevendo.

## [0.22.0] - 2026-09-05

### Adicionado

- **Comissão prevista na Dashboard**: novo card que soma, mês a mês, as parcelas (P1/P2) de todos os candidatos contratados que ainda não venceram — o que já passou não aparece, só o que falta receber a partir de hoje.

## [0.21.1] - 2026-09-05

### Removido

- **"Contratação" saiu das opções de Etapa** (cadastro e edição). Candidatos que já tinham esse valor continuam mostrando normalmente até serem reeditados.

## [0.21.0] - 2026-09-05

### Alterado

- **Campo Localização virou estado + cidade** (cadastro e edição direto na tabela), em vez de texto livre: escolhe o estado, depois a cidade, e o que fica gravado/exibido é sempre "Cidade - UF" (ex.: "São José dos Campos - SP"). Lista completa dos municípios do Brasil (fonte: IBGE). Localização já preenchida antes desta mudança continua aparecendo normalmente até ser reeditada.

## [0.20.0] - 2026-09-05

### Alterado

- **Cores fixas para Status da vaga, Etapa e Status do candidato**: cada badge passou a usar uma cor sólida e exclusiva por valor (com texto branco), em vez das cinco variantes genéricas de antes. Etapa, que antes aparecia como texto simples, agora também ganhou badge colorido. "Contratação" (etapa) ganhou um tom ciano próprio, e "Baixa" (etapa) e "Encerrada" (vaga) usam o mesmo cinza escuro por serem estados encerrados/automáticos.

## [0.19.0] - 2026-09-05

### Alterado

- **Lista de vagas em ordem crescente pelo código**: os dígitos do começo do código (até 10) definem a ordem — "9" fica antes de "10", por exemplo, em vez da ordem de texto colocar "10" antes de "9". Código sem nenhum número no começo vai para o fim da lista.

## [0.18.1] - 2026-09-05

### Corrigido

- **Barra superior e rodapé encolhendo em páginas mais altas que a janela** (principalmente a Configuração, em janelas mais baixas): como nenhum dos dois tinha `flex-shrink: 0`, o navegador os encolhia junto com a área de conteúdo sempre que a página passava da altura da tela — os ícones chegavam a ficar achatados. Agora só a área de conteúdo cede espaço e rola por dentro; a barra superior e o rodapé mantêm sempre o tamanho certo.

## [0.18.0] - 2026-09-05

### Adicionado

- **Campo Contratação (página Comissão) agora aceita digitar a data toda**, além de escolher no calendário: um campo de texto com máscara automática (dd/mm/aaaa) fica lado a lado com o ícone de calendário, que abre o seletor nativo quando preferir clicar em vez de digitar. Uma data incompleta ou inexistente (ex.: 31/02) é recusada com um aviso, mantendo a data anterior.

## [0.17.0] - 2026-09-05

### Alterado

- **Barra de navegação inferior flutuante**, no estilo de apps como o do Boticário: descolada da borda da tela (com margem própria) e com cantos bem arredondados, em vez de uma barra reta grudada no rodapé. O banner que fica acima dela (atualização disponível / instalar app) ajustou a posição para continuar logo acima do novo rodapé flutuante.

## [0.16.0] - 2026-09-05

### Alterado

- **Editar o Status da vaga direto na tabela agora vale para todos os candidatos da mesma vaga (mesmo código)**, não só a linha editada — Status da vaga é uma característica da vaga, não do candidato específico. A regra automática de "Encerrada" continua tendo prioridade: se algum candidato do grupo estiver contratado, o valor força "Encerrada" mesmo por cima de uma escolha manual recente.
- **Barra superior e ícone do app voltaram ao roxo liso**, sem o padrão facetado/de faixas do fundo — removido o SVG decorativo da barra e o padrão do `icon.svg`, mantendo só o gradiente roxo e a maleta com a moeda.

## [0.15.2] - 2026-09-05

### Alterado

- **Painel de filtro mais caprichado**: rótulos "Campo" e "Valor" acima de cada select, seta customizada com espaço da borda (a seta nativa do navegador ficava colada na ponta) e "Limpar filtro" no estilo dos outros botões do app (contornado), alinhado com os selects.

### Corrigido

- **A seta nativa do select ficava colada na borda** — trocada por uma seta customizada com espaçamento, igual à usada nos outros campos do formulário.
- **Select desabilitado ("Valor", antes de escolher um Campo) quase invisível**: o navegador esmaece campos desabilitados por padrão (opacidade ~70%), o que quase sumia com o fundo claro do painel. Agora mantém a caixa cheia à vista, usando o texto acinzentado para indicar que está desabilitado.
- **Correção definitiva de um bug de raiz**: qualquer elemento com uma classe que define `display` (como `.btn`) ignorava o atributo `hidden` do HTML — foi isso que causava o painel sempre visível na 0.15.0 e o botão "Limpar filtro" aparecendo antes da hora nesta versão. Adicionada uma regra global (`[hidden] { display: none !important; }`) para o `hidden` sempre valer, em qualquer elemento do app, resolvendo os dois casos de uma vez.

## [0.15.1] - 2026-09-05

### Corrigido

- **Painel do filtro (0.15.0) ficava sempre visível**, mesmo com o atributo `hidden`: a regra `.filter-panel { display: flex }` tem mais especificidade que o estilo padrão do navegador para `[hidden]`, então vencia e mostrava o painel de qualquer jeito. Agora o `display: flex` só se aplica com `.filter-panel:not([hidden])`, e o botão de filtro volta a abrir/fechar o painel a cada clique.

## [0.15.0] - 2026-09-05

### Adicionado

- **Filtro por campo na página Candidato**: botão (ícone de funil) na frente da barra de busca abre um painel com dois selects — primeiro escolhe o **campo** (entre os que têm uma lista fixa de opções: Status da vaga, Modalidade, Fonte, Etapa, Status do candidato), depois o **valor** daquele campo. A tabela filtra na hora, combinando com o texto da busca quando os dois estão em uso. O botão fica destacado (roxo) enquanto um filtro está ativo, e "Limpar filtro" reseta os dois selects.

### Corrigido

- **Dar baixa não muda mais o Status da vaga.** Antes, como a baixa tira o candidato de "Contratado", a mesma regra que reabre a vaga quando ninguém mais está contratado entrava em ação e voltava o status para "Publicada" sozinha. Agora a baixa é reconhecida como uma exceção (pela etapa "Baixa"): a vaga fica exatamente como estava até alguém mexer nela de propósito — um novo contratado a fecha de novo, ou o Status da vaga é reaberto à mão.

### Alterado

- Ícone do botão "Adicionar vaga" trocado para a mesma maleta do emblema na barra superior (sem o "+" no meio, que só existia nesse botão antes).

## [0.14.0] - 2026-09-05

### Alterado

- **Vaga passou a ter código além do nome.** No cadastro de vaga, dois campos: **Código** e **Nome da vaga**, lado a lado. A lista de vagas mostra os dois (o código como uma etiqueta, o nome ao lado); editar uma vaga agora edita os dois juntos.
- **No cadastro de candidato, o campo Vaga voltou a ser digitado — mas agora é o CÓDIGO, não mais uma lista para escolher.** Ao digitar, aparece uma dica logo abaixo mostrando o nome para o qual aquele código resolve (ou avisando que o código não existe). Ao salvar, é o **nome** que fica gravado e aparece na tabela — o código nunca aparece na lista de candidatos, só serve para digitar mais rápido no cadastro. Um código que não exista bloqueia o salvamento, com aviso para cadastrar a vaga primeiro.
- **A edição inline da coluna Vaga, na tabela, segue a mesma lógica**: clicar na célula abre um campo de texto com o código atual (não o nome) para digitar um novo; salvar resolve e grava o nome novamente.
- Renomear o código ou o nome de uma vaga já cadastrada continua propagando para todos os candidatos que a usam — e a regra de encerrar/reabrir a vaga (ver 0.13.0) passou a agrupar pelo **código**, não mais pelo nome, para não se confundir caso duas vagas tenham nomes parecidos. Candidatos cadastrados antes de existir código (só com o nome digitado à mão) continuam funcionando: a regra cai de volta para o nome nesses casos.

## [0.13.0] - 2026-09-05

### Adicionado

- **Registro de vagas**, com um botão próprio ao lado do de adicionar candidato (ícone de maleta com "+", para diferenciar do "+" do candidato). Abre uma telinha no mesmo formato do cadastro de candidato — só fecha pelo X — com um campo para nome da vaga e a lista das já cadastradas logo abaixo, cada uma com **editar** (clique no lápis, mesmo controle da edição inline da tabela: Enter salva, Esc cancela) e **excluir** (pede confirmação; candidatos já cadastrados com essa vaga mantêm o nome salvo, só sai da lista de opções).
- **O campo Vaga do cadastro de candidato passou de texto livre para uma lista das vagas cadastradas** — tanto no modal de adicionar quanto na edição inline da tabela. Sem nenhuma vaga cadastrada, o botão de adicionar candidato avisa para cadastrar uma vaga primeiro, em vez de abrir um formulário sem opção para escolher.
- **Nova regra: a vaga se encerra sozinha quando um candidato é contratado.** Quando o status de um candidato passa a "Contratado", o Status da vaga de **todos** os candidatos que concorrem à mesma vaga passa a **"Encerrada"** — inclusive o próprio contratado. "Encerrada" fica de fora das opções de Status da vaga de propósito: é consequência do status do candidato, nunca uma escolha manual (mesmo caso de "Em atividade"/"Baixa" na Etapa). Se deixar de haver algum contratado (editar o status de volta, ou dar baixa), a vaga reabre sozinha, voltando a "Publicada" — para todos. A atualização aparece na hora nas outras linhas da tabela, sem precisar recarregar.
  - Renomear uma vaga atualiza o nome em todos os candidatos que já a usavam. O recálculo também roda por inteiro a cada vez que o app abre (`recalcularTodasAsVagas`), para corrigir dados gravados antes desta regra existir — um candidato já contratado antes desta versão passa a refletir "Encerrada" nos colegas de vaga assim que o app é aberto, sem precisar editar nada primeiro.

### Corrigido

- Alertas (toasts) agora aparecem por cima de modais abertos — antes ficavam escondidos atrás. Não dava para perceber antes porque nenhum modal permanecia aberto enquanto uma ação gerava um alerta; o modal de Vagas é o primeiro caso (fica aberto para cadastrar várias vagas seguidas).

## [0.12.0] - 2026-09-04

### Alterado

- **Candidatos com fonte "Indicação" não entram na página de Comissão**, mesmo contratados — indicação não gera comissão. A regra é avaliada na hora de montar a lista, então mudar a fonte de um candidato já contratado tira ou traz ele de volta na mesma hora.
- A exceção ficou visível na tela: o subtítulo da página passou a ser "Candidatos contratados, exceto indicações", e o texto de lista vazia explica o motivo. Sem isso, um contratado por indicação que não aparecesse na lista pareceria defeito — ainda mais porque a coluna Fonte não é exibida nesta página.
- `CACHE_VERSION` do service worker: `hirecash-v17` → `hirecash-v18`.

## [0.11.0] - 2026-09-04

### Alterado

- **A lista da página de Comissão passou a ser ordenada pela data de contratação**, das mais recentes no topo para as mais antigas no fim (antes era por nome da vaga, como a página Candidato). Empates na mesma data desempatam pelo nome da vaga.
- **Contratados sem data ainda preenchida ficam no topo**, e não no fim. São candidatos recém-marcados como "Contratado", à espera do lançamento da contratação e do nível — deixá-los no fim da lista os esconderia justamente quando precisam de atenção.
- A ordem é aplicada a cada renderização da página: alterar a data de uma linha não a move de lugar na hora, mesma escolha já usada na página Candidato para não puxar a linha embaixo do dedo do usuário no meio da edição.
- `CACHE_VERSION` do service worker: `hirecash-v16` → `hirecash-v17`.

## [0.10.1] - 2026-09-04

### Alterado

- **Botão de baixa no mesmo estilo do botão de adicionar candidato**: redondo, 40px, roxo. Passou a usar a própria classe `.icon-button` do botão `+`, em vez de valores repetidos — então os dois continuam iguais se o estilo mudar. O ícone de saída foi mantido, e o botão ficou só com o ícone: o nome da ação está no cabeçalho da coluna ("Baixa"), com `title` e `aria-label` no botão.
- O botão de confirmar na telinha de baixa voltou ao roxo padrão, para acompanhar o botão que a abre.
- **A etapa atribuída na baixa passou de "Inativo" para "Baixa"**, para casar com o nome do botão e da coluna. Segue fora das opções escolhíveis. Candidatos que receberam baixa antes desta versão continuam com "Inativo" gravado — o editor de lista preserva valor fora das opções, então o valor antigo continua aparecendo certo; para atualizar, basta dar baixa de novo.
- Removidos `.btn-acao`, `.btn-acao--info` e `.btn--info`, que ficaram sem uso.
- `CACHE_VERSION` do service worker: `hirecash-v15` → `hirecash-v16`.

## [0.10.0] - 2026-09-04

### Adicionado

- **Botão "Baixa" na página de Comissão**, no fim de cada linha (depois da coluna Comissão) — para o caso do candidato contratado sair antes de fechar os meses da comissão. Abre uma telinha de confirmação; ao confirmar, o candidato sai da lista de Comissão e, na página Candidato, o status passa a **"Sem interesse"** e a etapa a **"Baixa"**. Contratação, nível e o resto do cadastro continuam salvos.
  - Ele sai da lista por consequência do status deixar de ser "Contratado", sem precisar de um campo separado de "baixa" — então recontratar o candidato depois traz ele de volta, com a etapa voltando a "Em atividade".
- Componente de confirmação reutilizável (`components/confirm.js`): `await showConfirm({...})` devolve `true`/`false`. Diferente do modal de cadastro, fecha ao cancelar, ao clicar fora e com `Esc` — não há nada digitado para se perder, e uma pergunta de confirmação precisa ser fácil de recusar. O foco começa no botão de cancelar, para o caminho seguro ser o que fica sob o `Enter`.
- Suporte a uma coluna de ação no fim da linha, no componente de tabela. (Na 0.10.1 o botão passou a usar a classe `.icon-button`, a mesma do botão de adicionar candidato.)

### Alterado

- **"Em atividade" saiu da lista de opções do campo Etapa**, junto com o novo "Baixa". As duas são etapas que o app atribui sozinho — "Em atividade" ao virar "Contratado", "Baixa" ao dar baixa — e não opções para escolher à mão.
- **O editor de lista passou a preservar um valor que não está entre as opções.** Era necessário por causa da mudança acima: um candidato com etapa "Em atividade" abriria o select sem esse valor, o campo cairia em outra opção e salvar trocaria o dado sem o usuário pedir. Agora o valor atual entra no select mesmo fora da lista, então ele aparece corretamente e nada muda sem uma escolha explícita.
- `CACHE_VERSION` do service worker: `hirecash-v14` → `hirecash-v15`.

## [0.9.0] - 2026-09-04

### Adicionado

- Status **"Contratado"** na lista de Status do candidato, e etapa **"Em atividade"** na lista de Etapa.
- **Escolher "Contratado" preenche a etapa como "Em atividade" automaticamente.** A regra fica em `candidatos.service.js`, ou seja, vale em qualquer caminho de gravação — cadastrar pelo modal ou editar direto na tabela. No modal, o campo Etapa também muda na tela no momento da escolha, para o usuário ver acontecer em vez de descobrir depois na tabela.
- A regra só age quando a gravação mexe no status. Alterar a etapa à mão depois de contratado continua valendo, em vez de ser sobrescrita a cada gravação seguinte.

### Alterado

- **A página de Comissão passou a listar quem está com status "Contratado"**, e não mais "Aprovado". Candidatos apenas aprovados deixam de aparecer ali até serem efetivamente contratados. Se algum candidato já estava como "Aprovado" com contratação e nível preenchidos, ele sai da lista até o status virar "Contratado" — os dados continuam salvos.
- Ao salvar uma edição inline, a linha inteira é redesenhada, não só a célula editada e a comissão. Era necessário porque uma alteração agora pode preencher outro campo por regra: sem isso, mudar o status para "Contratado" gravava a etapa certa mas a coluna Etapa continuaria mostrando o valor antigo até recarregar a página.
- Opções das listas do cadastro extraídas para `services/candidato-opcoes.js`. A regra da etapa derivada mora no serviço de candidatos, e o componente de tabela já importa esse serviço — deixar as opções no componente fecharia um ciclo de imports.
- Badge de "Contratado" usa a mesma variante verde de "Aprovado". As cores de badge do projeto são translúcidas de propósito, para se adaptarem sozinhas ao tema claro/escuro; o roxo da marca não tem contraste suficiente sobre o fundo escuro para virar uma variante nova sem criar cor específica por tema.
- `CACHE_VERSION` do service worker: `hirecash-v13` → `hirecash-v14`.

## [0.8.1] - 2026-09-04

### Alterado

- **A coluna Comissão passou a mostrar sempre as duas parcelas, rotuladas P1 e P2**, com data e valor de cada uma. Antes, no N1 a segunda parcela era omitida por sair zerada (o total do N1 já é R$ 100,00), o que dava a impressão de que a segunda parcela não estava sendo calculada. Agora as duas linhas aparecem em todos os níveis — no N1, a P2 fica em R$ 0,00 — para a leitura da coluna ser sempre igual.
- Rótulo, data e valor de cada parcela viraram filhos diretos de uma grade de três colunas, então ficam alinhados entre as linhas sem depender de largura fixa.
- `CACHE_VERSION` do service worker: `hirecash-v12` → `hirecash-v13`.

## [0.8.0] - 2026-09-04

### Adicionado

- **Página de Comissão** com a mesma estrutura da de Candidato — busca por vaga ou candidato, tabela estilo planilha, ordenada por vaga — porém **sem** o botão de adicionar, e listando **somente candidatos com status "Aprovado"**. Enquanto não houver nenhum aprovado, a página explica que o candidato aparece ali assim que o status mudar na página Candidato.
  - Colunas do cadastro: Vaga, Candidato, LinkedIn, Pretensão salarial, Modalidade e Status do candidato. Ficaram de fora Status da vaga, Localização, Fonte, Etapa e Observação.
  - **Contratação** (data) e **Nível** (N1 a N4) são os únicos campos editáveis nesta página — os dados do cadastro se alteram na página Candidato.
  - **Comissão** é calculada, não digitada: no dia 15 do mês seguinte à contratação entram R$ 100,00 e, no dia 15 do mês seguinte a esse, o restante do valor do nível (N1 R$ 100,00 · N2 R$ 300,00 · N3 R$ 500,00 · N4 R$ 700,00). A célula mostra as duas parcelas com data e valor, e se atualiza na hora ao mudar a contratação ou o nível. (Na 0.8.1 as parcelas passaram a ser rotuladas P1/P2 e a segunda deixou de ser omitida no N1.)
- Tipos de campo `date` (com data exibida como DD/MM/AAAA) e `computed` (só leitura, calculado a partir de outros campos) na tabela.

### Alterado

- **Ícone do app com faixas curvas em vez de retas.** As faixas agora são a mesma curva arqueada deslocada na horizontal, então saem paralelas entre si, atravessando o quadrado na diagonal.
- **A tabela de candidatos virou um componente compartilhado** (`components/candidatos-table.js`). Candidato e Comissão mostram o mesmo cadastro com colunas e regras de edição diferentes; cada página agora só declara quais colunas quer e quais delas são editáveis, em vez de repetir a tabela, a busca e a edição inline. Evitou duplicar cerca de 250 linhas e mantém as duas páginas coerentes por construção.
- Formatação de moeda, data e texto de busca extraídas para `utils/format.js`. A formatação de data é feita na mão porque `new Date('2026-09-15')` é lido como meia-noite em UTC, o que no fuso do Brasil cairia no dia 14 e mostraria toda data um dia atrás.
- Página de Comissão passou para a largura de leitura de 1400px, como a de Candidato, por causa da tabela larga.
- Barra de busca migrada de `pages/candidato.css` para `components/table.css`, agora que as duas páginas a usam. Só a célula marcada como editável recebe cursor e foco de edição (`.data-table__cell--editable`) — na Comissão a maioria das colunas é apenas leitura.
- Novos módulos e ícones acrescentados ao `APP_SHELL`. `CACHE_VERSION`: `hirecash-v11` → `hirecash-v12`.

## [0.7.0] - 2026-09-04

### Alterado

- **Ícone do app com o mesmo fundo facetado da barra superior**: cacos diagonais em tons de roxo, de larguras irregulares, cruzados por facetas na diagonal oposta. Vale para os dois lugares pedidos — o ícone da aba do navegador e o do app instalado (Android, iOS e desktop) — porque todos saem do mesmo `docs/icons/icon.svg`. A maleta e a moeda continuam por cima, sem mudança. Como na barra superior, as facetas são só camadas de preto e branco translúcidos sobre o gradiente roxo, então acompanham a cor de marca do gradiente.
- **Ícones `maskable` e `apple-touch` agora em sangria total.** Eles são recortados pelo próprio sistema (Android em círculo/squircle, iOS em superelipse); como o arquivo vinha com o canto já arredondado e composto sobre um roxo chapado, sobrava um anel de fundo liso em volta do desenho depois do recorte — o que ficaria bem visível agora que o fundo é facetado. Passaram a usar o SVG com canto reto ocupando o quadrado inteiro, e quem arredonda é o sistema. A marca não precisou encolher: ela ocupa só os 40% centrais, e seu canto mais distante fica a 136px do centro contra um limite de 204px da zona segura do maskable.
- Ícones acrescentados ao `APP_SHELL` do service worker, pelo mesmo motivo dos CSS na 0.6.2 — favicon e apple-touch são referenciados pelo `index.html`, e os 192/512 pelo manifest, cada um como uma requisição própria.
- `CACHE_VERSION` do service worker: `hirecash-v10` → `hirecash-v11`.

## [0.6.2] - 2026-09-03

### Corrigido

- **Uma versão nova podia carregar com HTML novo e CSS antigo.** O `APP_SHELL` do service worker listava só `styles/main.css`, mas o navegador resolve cada `@import` dele como uma requisição própria — e os 15 arquivos importados não estavam no app shell. Como só o que está no app shell é rebaixado no `install`, os parciais continuavam vindo do cache antigo até a revalidação em segundo plano, ou seja, um carregamento inteiro depois. Na 0.6.1 isso apareceu de forma grave: o SVG novo da barra superior chegava sem as regras que o posicionam, entrava no fluxo do flex e empurrava o título para a direita, transbordando a barra. Todos os CSS entraram no `APP_SHELL`.
- `CACHE_VERSION` do service worker: `hirecash-v9` → `hirecash-v10`.

## [0.6.1] - 2026-09-03

### Alterado

- **Barra superior com fundo facetado**: leque de facetas angulares partindo de um ponto abaixo da barra, no estilo de fundo geométrico "low poly" pedido. As facetas são apenas camadas de preto e branco translúcidos sobre o gradiente roxo existente (`--color-primary` → `--color-primary-dark`), então o padrão continua na cor de marca atual e acompanha qualquer mudança dela sem precisar mexer no SVG. O canto superior esquerdo ficou mais escuro, o que também melhorou o contraste do título sobre o fundo.
- Emblema da barra superior com leve desfoque de fundo (`backdrop-filter`) e opacidade um pouco maior, para não se perder sobre as facetas.
- `CACHE_VERSION` do service worker: `hirecash-v8` → `hirecash-v9`.

## [0.6.0] - 2026-09-03

### Adicionado

- **Barra de busca** acima da tabela de candidatos, filtrando pelo nome da **vaga** ou pelo nome do **candidato** ao mesmo tempo. Ignora maiúsculas e acentos ("comissao" encontra "Comissão"). Quando nada casa, aparece "Nenhum candidato encontrado".
  - O filtro esconde e mostra linhas em vez de redesenhar a tabela, para não perder o foco nem o texto digitado a cada tecla.
  - Editar a vaga ou o nome direto na tabela atualiza o que a busca enxerga na hora.

### Alterado

- **Tabela de candidatos ordenada pelo nome da vaga**, em ordem alfabética de português (ignora acentos e maiúsculas), com o nome do candidato como desempate. Números são lidos como números, então "Vaga 2" vem antes de "Vaga 10". A ordem é aplicada a cada renderização da página — editar a vaga de uma linha não a move de lugar na hora, para não puxar a linha debaixo do dedo do usuário no meio da edição.
- Botão **Importar** (Configuração) agora é verde (`--color-accent`), a mesma cor do ícone da página de Comissão, em vez de contornado. Nova variante `.btn--accent`.
- Título da barra superior aumentado de 17px para 30px (quase o dobro), com entrelinha e espaçamento ajustados para continuar cabendo na altura de 60px da barra.
- `CACHE_VERSION` do service worker: `hirecash-v7` → `hirecash-v8`.

## [0.5.0] - 2026-09-03

### Adicionado

- **Backup dos candidatos** na página de Configuração, em um cartão logo abaixo de "Aparência", com dois botões lado a lado:
  - **Exportar** gera um arquivo `hirecash-candidatos-AAAA-MM-DD.json`. No celular/tablet abre a folha de compartilhamento do sistema (dá para mandar para o WhatsApp, e-mail, Google Drive...); no computador abre o diálogo "Salvar como" (Chrome/Edge). Em navegador sem esses recursos, cai no download direto.
  - **Importar** abre o explorador de arquivos para escolher um backup.
  - O cartão mostra quantos candidatos existem no aparelho e lembra que os dados ficam só neste navegador.
- `buildBackup()` e `importCandidatos(payload)` em `candidatos.service.js`. A importação casa pelo `id`: atualiza quem já existe e acrescenta o resto — **nunca apaga** um candidato que não esteja no arquivo, então importar um backup antigo não derruba cadastros novos. O alerta informa quantos entraram e quantos foram atualizados. Aceita também uma lista solta de candidatos (sem o envelope do backup), e gera `id` para registros que não tiverem.

### Corrigido

- `CACHE_VERSION` do service worker não foi incrementado na 0.4.0 (ficou em `hirecash-v6`), o que deixava o app shell em cache apontando para a versão anterior até a revalidação em segundo plano. Agora em `hirecash-v7`.

## [0.4.0] - 2026-09-03

### Adicionado

- **Edição inline na tabela de candidatos**: clicar em qualquer célula troca o texto pelo mesmo tipo de controle usado no cadastro — campo de texto onde o cadastro tem texto, lista de opções onde o cadastro tem lista (status da vaga, modalidade, fonte, etapa, status do candidato) e área de texto na observação. A pretensão salarial mantém a máscara R$ durante a edição. Não é mais preciso apagar e recadastrar um candidato para corrigir um dado.
  - **Salvar**: `Enter` ou sair do campo (clicar em outro lugar). Nas listas de opções, escolher a opção já salva.
  - **Cancelar**: `Esc` — o valor anterior volta.
  - **Observação**: `Shift+Enter` quebra linha; `Enter` sozinho salva.
  - **Obrigatórios**: Vaga e Nome do candidato não podem ficar em branco — tentar apagar mostra um alerta e restaura o valor anterior.
  - **Teclado**: as células entram na navegação por `Tab` e abrem para edição com `Enter` ou barra de espaço.
  - Na coluna LinkedIn, clicar no link "Perfil" continua abrindo o perfil; a edição sai pelo resto da célula.
- `updateCandidato(id, patch)` em `candidatos.service.js`, que grava a alteração no `localStorage` e registra `atualizadoEm`.

### Alterado

- Os campos do candidato passaram a ser declarados em uma lista única (`FIELDS`) em `candidato.js`. O formulário do modal, as colunas da tabela e o editor inline são todos derivados dela — assim as opções oferecidas na edição são sempre exatamente as mesmas do cadastro, e um campo novo entra nos três lugares de uma vez.
- O subtítulo da página Candidato passa a indicar "Clique em qualquer campo da tabela para editar" quando já existe candidato cadastrado.

## [0.3.1] - 2026-08-22

### Corrigido

- **Rolagem do modal**: o `<form>` dentro do modal não era um container flex, o que quebrava a cadeia entre `.modal` e `.modal__body`/`.modal__footer` — o corpo nunca encolhia para caber no espaço disponível, o scroll interno não ativava de verdade, e em telas menores o botão de ação (ex.: Salvar) podia sair da área visível/alcançável. Corrigido para todos os modais (não só o de candidato) com a nova classe `.modal__form`.
- **Zoom por duplo toque no iPhone**: tocar duas vezes em qualquer lugar da tela (não só em botões) não ativa mais o zoom do Safari — `touch-action: manipulation` aplicado no `<html>`. O zoom por pinça (dois dedos) continua funcionando normalmente, para não prejudicar acessibilidade.

### Alterado

- `.modal__body` ganhou `-webkit-overflow-scrolling: touch` para rolagem mais suave no iOS.

### Adicionado

- Banner "Atualização disponível" (botão Atualizar): quando uma nova versão do app é publicada, o service worker a baixa em segundo plano e este banner aparece centralizado logo acima da barra de navegação inferior. Ao confirmar, a nova versão assume e a página recarrega sozinha. Antes disso, também passa a checar por atualizações sempre que o usuário volta para a aba.
- Banner "Instalar aplicativo" (mesmo formato visual): aparece ao abrir o app se ele ainda não estiver instalado. No Android/desktop usa o prompt nativo do navegador (botão Instalar aciona a instalação de verdade); no iPhone/iPad, como o Safari não permite instalar via código, mostra instruções ("toque em Compartilhar e depois em Adicionar à Tela de Início"). Fica de fora se o app já estiver instalado, e não volta a incomodar depois que o usuário confirma ou fecha.
- Componente de banner reutilizável (`banner.js` / `banner.css`), diferente do alerta (toast) existente — fica na tela até o usuário agir, em vez de sumir sozinho.

### Alterado

- O service worker não ativa mais uma nova versão sozinho: agora ela fica "esperando" até o usuário confirmar no banner de atualização, evitando trocar o app debaixo do usuário sem aviso.

## [0.2.0] - 2026-08-22

### Adicionado

- Estrutura inicial do projeto (pastas, lint, formatação, CI/CD para GitHub Pages).
- Shell do PWA: barra superior, área de conteúdo e barra inferior com navegação por quatro abas (Candidato, Dashboard, Comissão, Configuração).
- Sistema de rotas via hash (`#/dashboard`, `#/candidato`, `#/comissao`, `#/configuracao`), com Dashboard como página inicial.
- Página de Configuração com alternância de tema claro/escuro (ícones sol/lua), persistida em `localStorage` e aplicada antes da primeira renderização (sem flash). A cor de marca (roxo) permanece a mesma nos dois temas — só fundo, superfícies e texto mudam.
- Componente de alerta (toast) centralizado entre o topo e o meio da tela, com variações de sucesso, erro, aviso e informação.
- Suporte a instalação como aplicativo (manifesto PWA + service worker com cache offline do app shell).
- Utilitário de logs de aplicação (`logger.js`) com níveis e histórico persistido em `localStorage`.
- Camada de armazenamento local (`storage.service.js`).
- Cadastro de candidatos na página Candidato: botão + no cabeçalho abre um modal (título + X, só fecha pelo X — não fecha clicando fora nem com Esc, para não perder dados digitados) com formulário completo (vaga, status da vaga, nome, LinkedIn, pretensão salarial com máscara R$, localização, modalidade, fonte, etapa, status do candidato, observação). Ao salvar, o candidato vira uma linha em uma tabela estilo planilha (com rolagem horizontal em telas estreitas), persistida em `localStorage` via `candidatos.service.js`.
- Componentes reutilizáveis de formulário (`form.css`), modal (`modal.css`) e tabela de dados com badges coloridos por status (`table.css`).
- Número da versão exibido centralizado no rodapé da página de Configuração (`version.js`), para o usuário sempre saber qual versão do app está usando. Atualizado a cada entrega.

### Corrigido

- GitHub Pages estava servindo o `README.md` em vez do app (o modo "Deploy from a branch" não reconhece a pasta `public/`). Pasta renomeada para `docs/` e o Pages passa a publicar diretamente dela, sem depender do GitHub Actions para o deploy.
- A animação de entrada das páginas (`.page-enter`) mantinha um `transform` residual depois de terminar (`animation-fill-mode: both`), o que criava um *containing block* indevido para elementos `position: fixed` aninhados dentro da página — o modal de candidato abria ancorado fora da tela em vez de cobrir a janela inteira. Removido o fill-mode residual.

### Alterado

- Workflow do GitHub Actions (`ci.yml`) simplificado para rodar apenas lint (JS + CSS) como checagem de qualidade; o deploy fica a cargo do GitHub Pages diretamente.
- Layout de tela cheia em qualquer aparelho: o app agora ocupa 100% da largura/altura sempre — celular, tablet, computador ou instalado como PWA — em vez de aparecer como um cartão centralizado em telas maiores (decisão revertida para dar espaço à tabela de candidatos, que tem 11 colunas). Cada página limita sua própria largura de leitura quando faz sentido (720px para páginas de cartões, 1400px para a página de Candidato).
- Compatibilidade entre sistemas operacionais (Windows, Android, iOS): tags específicas para instalação como app no iPhone/iPad (que não segue o manifest da mesma forma que Android/Windows), `id` e `display_override` no manifesto, remoção do destaque cinza de toque, resposta de toque mais rápida e sem zoom de duplo toque, e estados de hover no mouse restritos a dispositivos com ponteiro fino (não afetam toque).
- Fundos de alerta/badge (`--color-*-bg`) passaram a ser translúcidos, para se adaptarem automaticamente ao tema claro/escuro sem precisar de uma variante extra por tema.

## [0.1.0] - 2026-08-21

### Adicionado

- Início do repositório.
