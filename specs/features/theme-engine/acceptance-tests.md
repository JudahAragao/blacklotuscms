---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Acceptance Tests

## AT-01: Renderizar Post Unico
- **DADO** tema ativo com layout post.tsx
- **QUANDO** acessa /meu-post
- **ENTAO** layout do tema e renderizado com dados do post
- **Referencia:** FR11

## AT-02: Theme sem Permissao
- **DADO** tema sem ThemePermission aprovada para db.read.post
- **QUANDO** tenta acessar posts
- **ENTAO** permissao e solicitada e erro 403 retornado
- **Referencia:** FR11, BR07

## AT-03: CSS Variables Injetadas
- **DADO** tema com ThemeData configurado
- **QUANDO** pagina e renderizada
- **ENTAO** CSS variables sao injetadas no escopo .blacklotuscms-theme
- **Referencia:** FR11
