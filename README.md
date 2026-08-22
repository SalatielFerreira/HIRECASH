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
- **4 abas** na barra inferior, nesta ordem: **Candidato** → **Dashboard** (inicial) → **Comissão** → **Configuração**.
- **Tema claro/escuro**: alternável manualmente em Configuração (ícones sol/lua), com persistência em `localStorage` e sem flash ao recarregar. A cor de marca (roxo) é a mesma nos dois temas — só fundo, superfícies e texto mudam.
- **Instalável**: manifesto PWA + service worker com cache do app shell (funciona offline após o primeiro carregamento). Ao abrir o app sem ele estar instalado, aparece um banner "Instalar aplicativo" — prompt nativo no Android/desktop, instruções de "Adicionar à Tela de Início" no iPhone/iPad (o Safari não permite instalar por código).
- **Atualização com aviso**: uma nova versão publicada não troca o app sozinha — um banner "Atualização disponível" avisa o usuário, e só recarrega quando ele confirma.
- **Alertas centralizados**: caixas de alerta (toast) posicionadas entre o topo e o meio da tela, com variações de sucesso, erro, aviso e informação.
- **Cadastro de candidatos**: botão + na página Candidato abre um modal (só fecha pelo X) com o formulário completo; ao salvar, o candidato aparece como uma linha em uma tabela estilo planilha, persistida em `localStorage`.
- **Layout de tela cheia e responsivo**: o app ocupa a tela inteira em qualquer aparelho (celular, tablet, computador), sem molduras — importante para telas com bastante dado, como a tabela de candidatos.
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
│       ├── components/            # alert.js (showAlert), banner.js (showBanner)
│       ├── pages/                 # dashboard.js, candidato.js, comissao.js, configuracao.js
│       ├── services/              # storage, candidatos, update (atualização), install (instalar)
│       ├── utils/                 # logger.js, theme.js (tema claro/escuro)
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
