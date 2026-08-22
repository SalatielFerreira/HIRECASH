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
- [Changelog](#changelog)

## Visão geral

- **Sem autenticação**: o app abre direto no Dashboard.
- **3 abas** na barra inferior, nesta ordem: **Candidato** → **Dashboard** (inicial) → **Comissão**.
- **Instalável**: manifesto PWA + service worker com cache do app shell (funciona offline após o primeiro carregamento).
- **Alertas centralizados**: caixas de alerta (toast) posicionadas entre o topo e o meio da tela, com variações de sucesso, erro, aviso e informação.

## Stack

Vanilla **HTML / CSS / JavaScript** (sem framework, sem etapa de build), hospedado em **GitHub Pages**.
O `npm` é usado apenas como ferramentas de apoio ao desenvolvimento (lint, formatação, servidor local e geração de ícones) — o site final é servido estaticamente a partir de `public/`.

## Estrutura de pastas

```
HIRECASH/
├── .github/workflows/deploy.yml   # CI: lint + publicação no GitHub Pages
├── public/                        # Tudo que é servido em produção
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── icons/                     # Ícones do PWA (icon.svg é a fonte)
│   ├── styles/
│   │   ├── base/                  # reset, variáveis de design, tipografia
│   │   ├── components/            # topbar, bottomnav, alert, card
│   │   ├── pages/                 # estilos específicos de cada página
│   │   └── main.css
│   └── scripts/
│       ├── app.js                 # ponto de entrada
│       ├── router.js              # roteamento por hash (#/dashboard...)
│       ├── components/alert.js    # showAlert()
│       ├── pages/                 # dashboard.js, candidato.js, comissao.js
│       ├── services/              # storage.service.js (wrapper de localStorage)
│       └── utils/logger.js        # logs da aplicação
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

Isso abre `public/` em um servidor local com recarregamento automático (`http://localhost:5500`).

Como é um site estático, também é possível simplesmente abrir `public/index.html` em um servidor HTTP qualquer — só evite abrir via `file://`, pois o service worker e os módulos ES exigem `http(s)://`.

## Qualidade de código

```bash
npm run lint        # ESLint (JavaScript)
npm run lint:css    # Stylelint (CSS)
npm run lint:all     # os dois acima
npm run format       # Prettier — formata o projeto
npm run format:check # Prettier — só verifica, não altera
```

O workflow de deploy roda `lint` e `lint:css` automaticamente a cada push em `main`; se falhar, a publicação é bloqueada.

## Ícones do PWA

O ícone-fonte é `public/icons/icon.svg`. Para gerar os PNGs (192px, 512px, versões _maskable_ e `apple-touch-icon`):

```bash
npm run generate:icons
```

Rode este comando sempre que `icon.svg` for alterado, e commite os PNGs gerados.

## Deploy (GitHub Pages)

O deploy é automático via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na branch `main`:

1. Roda lint (JS + CSS).
2. Publica o conteúdo de `public/` no GitHub Pages.

No GitHub, em **Settings → Pages**, a _Source_ deve estar definida como **GitHub Actions**.

## Logs

- **Em tempo de execução (navegador)**: `public/scripts/utils/logger.js` registra eventos da aplicação (rotas, service worker, alertas) no console e mantém um histórico rotativo em `localStorage`, acessível via `logger.getLogs()` no console do navegador. Para ativar logs de depuração (`debug`), execute `localStorage.setItem('hirecash_debug', 'true')`.
- **Em desenvolvimento**: a pasta `logs/` é reservada para logs locais (build, scripts) e é ignorada pelo Git.

## Changelog

Alterações relevantes são registradas em [CHANGELOG.md](./CHANGELOG.md), seguindo [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [Versionamento Semântico](https://semver.org/lang/pt-BR/).
