# HireCash

PWA (Progressive Web App) para gestão de **Candidatos**, **Dashboard** e **Comissões**.
Sem login — o app abre direto no Dashboard e pode ser instalado como aplicativo (Android, iOS e desktop).

> Status: em desenvolvimento inicial. O conteúdo de cada página ainda será definido nos próximos passos; esta etapa entrega a base do projeto (estrutura, PWA, navegação, alertas, logs e pipeline de deploy).

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar localmente](#como-rodar-localmente)
- [Qualidade de código](#qualidade-de-código)
- [Ícones do PWA](#ícones-do-pwa)
- [Deploy (GitHub Pages)](#deploy-github-pages)
- [Logs](#logs)
- [Versionamento](#versionamento)
- [Changelog](#changelog)

## Visão geral

- **Sem autenticação**: o app abre direto no Dashboard.
- **4 abas** na barra inferior, nesta ordem: **Candidato** → **Dashboard** (inicial) → **Comissão** → **Configuração**. A barra flutua descolada da borda da tela, com cantos arredondados.
- **Tema claro/escuro**: alternável manualmente em Configuração (ícones sol/lua), com persistência em `localStorage` e sem flash ao recarregar. A cor de marca (roxo) é a mesma nos dois temas — só fundo, superfícies e texto mudam.
- **Instalável**: manifesto PWA + service worker com cache do app shell (funciona offline após o primeiro carregamento). Ao abrir o app sem ele estar instalado, aparece um banner "Instalar aplicativo" — prompt nativo no Android/desktop, instruções de "Adicionar à Tela de Início" no iPhone/iPad (o Safari não permite instalar por código).
- **Atualização com aviso**: uma nova versão publicada não troca o app sozinha — um banner "Atualização disponível" avisa o usuário, e só recarrega quando ele confirma.
- **Alertas centralizados**: caixas de alerta (toast) posicionadas entre o topo e o meio da tela, com variações de sucesso, erro, aviso e informação.
- **Cadastro de candidatos**: botão + na página Candidato abre um modal (só fecha pelo X) com o formulário completo; ao salvar, o candidato aparece como uma linha em uma tabela estilo planilha, persistida em `localStorage`.
- **Localização é estado + cidade** (não texto livre): escolhe o estado e depois a cidade, entre todos os municípios do Brasil (fonte: IBGE), e o que fica gravado/exibido é sempre "Cidade - UF".
- **Registro de vagas**: botão próprio (ícone de maleta com "+") ao lado do de adicionar candidato, no mesmo formato — uma telinha para cadastrar **código** e **nome**, com a lista das já cadastradas logo abaixo (código + nome), em ordem crescente pelos dígitos do começo do código (até 10 deles — "9" antes de "10", por exemplo), cada uma com editar e excluir. Sem nenhuma vaga cadastrada, o botão de adicionar candidato avisa para cadastrar uma primeiro.
- **No cadastro de candidato, o campo Vaga é o CÓDIGO** (digitado, não escolhido de uma lista) — uma dica ao vivo mostra o nome para o qual o código resolve enquanto se digita. Ao salvar (ou editar direto na tabela), é o **nome** que fica gravado e aparece na lista de candidatos; o código nunca aparece lá, só agiliza a digitação. Um código inexistente bloqueia o salvamento.
- **A vaga se encerra sozinha quando um candidato dela é contratado**: o Status da vaga de todos os candidatos que concorrem a ela (agrupados pelo código) passa a **Encerrada** (fora das opções escolhíveis, mesmo caso de "Em atividade"/"Baixa" na Etapa), e reabre sozinha (volta a "Publicada") se deixar de haver algum contratado — a atualização aparece na hora nas outras linhas da tabela. Candidatos gravados antes de existir código continuam funcionando, agrupados pelo nome.
- **Editar o Status da vaga direto na tabela vale para todos os candidatos daquela vaga**, não só a linha editada — é uma característica da vaga, não do candidato. A regra de "Encerrada" acima continua tendo prioridade sobre uma escolha manual.
- **Lista ordenada e com busca**: a tabela vem em ordem alfabética pelo nome da **vaga** (desempate pelo nome do candidato), e a barra de busca acima dela filtra por vaga **ou** candidato, ignorando maiúsculas e acentos.
- **Filtro por campo**: botão de funil na frente da busca abre um painel para escolher um **campo** (Status da vaga, Modalidade, Fonte, Etapa ou Status do candidato) e o **valor** dele — a tabela filtra na hora, combinando com a busca por texto quando os dois estão ativos.
- **Edição direto na tabela**: clicar em qualquer célula abre o mesmo tipo de controle do cadastro — texto onde é texto, lista de opções onde é lista, área de texto na observação. `Enter` (ou sair do campo) salva, `Esc` cancela. Os campos do candidato são declarados uma única vez em `CAMPOS` (`docs/scripts/components/candidatos-table.js`), de onde saem o formulário de cadastro, os cabeçalhos das colunas e o editor inline das duas páginas — então as opções nunca divergem entre cadastro e edição.
- **Layout de tela cheia e responsivo**: o app ocupa a tela inteira em qualquer aparelho (celular, tablet, computador), sem molduras — importante para telas com bastante dado, como a tabela de candidatos.
- **Comissão**: a página lista somente os candidatos com status **Contratado** e fonte diferente de **Indicação** (indicação não gera comissão), na mesma estrutura da de Candidato (busca + tabela), sem botão de adicionar, ordenada pela **data de contratação** — mais recentes no topo, e quem ainda não teve a data lançada fica acima de todos. Marcar um candidato como "Contratado" preenche a etapa dele como "Em atividade" automaticamente — a regra fica em `candidatos.service.js`, então vale tanto no cadastro pelo modal quanto na edição direto na tabela. O botão **Baixa** (redondo, no fim da linha, no mesmo estilo do botão de adicionar) atende o caso do contratado sair antes de fechar os meses: com confirmação, ele sai da lista e passa a status "Sem interesse" e etapa "Baixa" — o Status da vaga não muda: fica como estava até um novo contratado fechá-la de novo, ou até ser reaberto à mão. "Em atividade" e "Baixa" não são opções escolhíveis na lista de Etapa — o app as atribui sozinho. Ali se lança a **Contratação** (data, digitada por extenso no formato dd/mm/aaaa ou escolhida no ícone de calendário ao lado) e o **Nível** (N1–N4); a **Comissão** é calculada e mostrada em duas parcelas rotuladas **P1** e **P2** — R$ 100,00 no dia 15 do mês seguinte à contratação e o restante do valor do nível no dia 15 do mês seguinte a esse (N1 R$ 100 · N2 R$ 300 · N3 R$ 500 · N4 R$ 700; no N1 a P2 fica em R$ 0,00).
- **Comissão prevista (Dashboard)**: soma, mês a mês, as parcelas (P1/P2) de todos os contratados que ainda não venceram — a partir de hoje, sem contar o que já passou —, para saber quanto vem pela frente e em quais meses.
- **Backup dos candidatos**: em Configuração, botões de **Exportar** (folha de compartilhamento no celular, "Salvar como" no computador) e **Importar** (explorador de arquivos), gerando um `.json`. Como os dados moram no `localStorage` do navegador, esse arquivo é a rede de segurança contra limpar os dados do navegador ou trocar de aparelho. A importação nunca apaga: casa pelo `id`, atualizando quem já existe e acrescentando o resto.
- **Versão visível**: nome do app e número da versão aparecem centralizados no rodapé da página de Configuração, atualizados a cada entrega (veja [Versionamento](#versionamento)).

## Stack

Vanilla **HTML / CSS / JavaScript** (sem framework, sem etapa de build), hospedado gratuitamente em **GitHub Pages** (Deploy from a branch, pasta `/docs`).
O `npm` é usado apenas como ferramentas de apoio ao desenvolvimento (lint, formatação, servidor local e geração de ícones) — o site final é servido estaticamente a partir de `docs/`.

## Estrutura de pastas

```
HIRECASH/
├── .github/workflows/ci.yml       # CI: lint de JS e CSS a cada push/PR
├── docs/                          # Tudo que é servido em produção (GitHub Pages)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── icons/                     # Ícones do PWA (icon.svg é a fonte)
│   ├── styles/
│   │   ├── base/                  # reset, variáveis de design, tipografia
│   │   ├── components/            # topbar, bottomnav, alert, banner, card...
│   │   ├── pages/                 # estilos específicos de cada página
│   │   └── main.css
│   └── scripts/
│       ├── app.js                 # ponto de entrada
│       ├── router.js              # roteamento por hash (#/dashboard...)
│       ├── components/            # alert.js, banner.js, confirm.js, candidatos-table.js
│       ├── pages/                 # dashboard.js, candidato.js, comissao.js, configuracao.js
│       ├── services/              # storage, candidatos, candidato-opcoes, vagas, comissao, update, install
│       ├── data/                  # localizacao.js (estados e municípios do Brasil, fonte IBGE)
│       ├── utils/                 # logger.js, theme.js (tema), format.js (moeda/data/busca)
│       └── version.js             # nome + versão exibidos em Configuração
├── scripts/                       # scripts Node de apoio (não vão para produção)
│   └── generate-icons.js
├── logs/                          # logs locais de desenvolvimento (git-ignorado)
├── CHANGELOG.md
└── README.md
```

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 20+ (veja `.nvmrc`).

```bash
npm install
npm run dev
```

Isso abre `docs/` em um servidor local com recarregamento automático (`http://localhost:5500`).

Como é um site estático, também é possível simplesmente abrir `docs/index.html` em um servidor HTTP qualquer — só evite abrir via `file://`, pois o service worker e os módulos ES exigem `http(s)://`.

## Qualidade de código

```bash
npm run lint        # ESLint (JavaScript)
npm run lint:css    # Stylelint (CSS)
npm run lint:all     # os dois acima
npm run format       # Prettier — formata o projeto
npm run format:check # Prettier — só verifica, não altera
```

O workflow de CI (`.github/workflows/ci.yml`) roda `lint` e `lint:css` automaticamente a cada push/PR em `main`, como checagem de qualidade — ele não faz deploy (isso fica a cargo do GitHub Pages, veja abaixo).

## Ícones do PWA

O ícone-fonte é `docs/icons/icon.svg`. Para gerar os PNGs (192px, 512px, versões _maskable_ e `apple-touch-icon`):

```bash
npm run generate:icons
```

Rode este comando sempre que `icon.svg` for alterado, e commite os PNGs gerados.

## Deploy (GitHub Pages)

100% gratuito, sem depender de minutos de GitHub Actions: o próprio GitHub Pages publica o conteúdo da pasta `docs/` a cada push na branch `main`.

No GitHub, em **Settings → Pages → Build and deployment**:

- **Source**: `Deploy from a branch`
- **Branch**: `main` / `/docs`

A cada push em `main`, o GitHub republica automaticamente em `https://salatielferreira.github.io/HIRECASH/` (o CI de lint roda em paralelo, mas não bloqueia essa publicação).

## Logs

- **Em tempo de execução (navegador)**: `docs/scripts/utils/logger.js` registra eventos da aplicação (rotas, service worker, alertas) no console e mantém um histórico rotativo em `localStorage`, acessível via `logger.getLogs()` no console do navegador. Para ativar logs de depuração (`debug`), execute `localStorage.setItem('hirecash_debug', 'true')`.
- **Em desenvolvimento**: a pasta `logs/` é reservada para logs locais (build, scripts) e é ignorada pelo Git.

## Versionamento

O número da versão aparece para o usuário no rodapé da página de Configuração, para ele sempre saber qual versão do app está usando. A cada entrega, três arquivos são atualizados juntos:

1. `docs/scripts/version.js` — `APP_VERSION`, o que o usuário vê no app.
2. `package.json` — campo `version` (mesma versão, convenção do npm).
3. `CHANGELOG.md` — nova entrada com a data e o que mudou.

Segue [Versionamento Semântico](https://semver.org/lang/pt-BR/): `MAJOR.MINOR.PATCH` — `PATCH` para correções, `MINOR` para funcionalidades novas compatíveis, `MAJOR` para mudanças que quebram compatibilidade.

## Changelog

Alterações relevantes são registradas em [CHANGELOG.md](./CHANGELOG.md), seguindo [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
