---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: draft
---

# E2E Testing Plan

## Tools
- A definir (Playwright recomendado)

## Scenarios
1. **Instalacao Completa:** Setup wizard com banco real
   - Feature vinculada: installation
   - Acceptance tests: AT-01 a AT-04

2. **Login e CRUD Posts:** Autenticacao + criacao + edicao + exclusao
   - Feature vinculada: authentication, post-management
   - Acceptance tests: AT-01 a AT-08

3. **Upload e Gestao de Midia:** Upload + visualizacao + exclusao
   - Feature vinculada: media-management
   - Acceptance tests: AT-01 a AT-03

4. **Plugin Lifecycle:** Instalacao + ativacao + desativacao
   - Feature vinculada: plugin-system
   - Acceptance tests: AT-01 a AT-05

5. **Theme Rendering:** Visualizacao publica completa
   - Feature vinculada: theme-engine
   - Acceptance tests: AT-01 a AT-03
