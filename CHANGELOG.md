# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado

- Estrutura inicial do projeto (pastas, lint, formatação, CI/CD para GitHub Pages).
- Shell do PWA: barra superior, área de conteúdo e barra inferior com navegação por três abas (Candidato, Dashboard, Comissão).
- Sistema de rotas via hash (`#/dashboard`, `#/candidato`, `#/comissao`), com Dashboard como página inicial.
- Componente de alerta (toast) centralizado entre o topo e o meio da tela, com variações de sucesso, erro, aviso e informação.
- Suporte a instalação como aplicativo (manifesto PWA + service worker com cache offline do app shell).
- Utilitário de logs de aplicação (`logger.js`) com níveis e histórico persistido em `localStorage`.
- Camada de armazenamento local (`storage.service.js`).

## [0.1.0] - 2026-08-21

### Adicionado

- Início do repositório.
