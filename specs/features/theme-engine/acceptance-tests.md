---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Acceptance Tests

## AT-01: Renderizar Post Unico
- **GIVEN** theme ativo com layout post.tsx
- **WHEN** acessa /meu-post
- **THEN** layout do theme e renderizado com data do post
- **Referencia:** FR11

## AT-02: Theme sem Permission
- **GIVEN** theme sem ThemePermission aprovada para db.read.post
- **WHEN** tenta acessar posts
- **THEN** permissao e solicitada e erro 403 retornado
- **Referencia:** FR11, BR07

## AT-03: CSS Variables Injetadas
- **GIVEN** theme com ThemeData configurado
- **WHEN** pagina e renderizada
- **THEN** CSS variables sao injetadas no escopo .blacklotuscms-theme
- **Referencia:** FR11
