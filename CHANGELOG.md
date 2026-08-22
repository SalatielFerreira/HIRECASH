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

### Corrigido

- GitHub Pages estava servindo o `README.md` em vez do app (o modo "Deploy from a branch" não reconhece a pasta `public/`). Pasta renomeada para `docs/` e o Pages passa a publicar diretamente dela, sem depender do GitHub Actions para o deploy.

### Alterado

- Workflow do GitHub Actions (`ci.yml`) simplificado para rodar apenas lint (JS + CSS) como checagem de qualidade; o deploy fica a cargo do GitHub Pages diretamente.
- Layout responsivo: o app agora ocupa a tela inteira (sem molduras) em celulares e quando instalado como PWA; em telas médias/grandes exibidas no navegador (tablet, notebook, monitor), aparece como um cartão centralizado com proporção de celular, cantos arredondados e sombra, em vez de esticar a altura toda da janela.
- Compatibilidade entre sistemas operacionais (Windows, Android, iOS): tags específicas para instalação como app no iPhone/iPad (que não segue o manifest da mesma forma que Android/Windows), `id` e `display_override` no manifesto, remoção do destaque cinza de toque, resposta de toque mais rápida e sem zoom de duplo toque, e estados de hover no mouse restritos a dispositivos com ponteiro fino (não afetam toque).

## [0.1.0] - 2026-08-21

### Adicionado

- Início do repositório.
