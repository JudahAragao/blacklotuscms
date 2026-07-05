---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Specification

## Description
Motor de temas baseado em React Server Components com CSS scoping, dynamic imports, variaveis CSS e sistema de permissoes para acesso a dados.

## Requirements
- **REQ-01:** Dynamic import de layouts baseado no contexto (single, archive, search, 404)
- **REQ-02:** CSS Variables customizaveis via ThemeData
- **REQ-03:** CSS scoping via div.blacklotuscms-theme
- **REQ-04:** ThemeDataService com validacao de permissoes
- **REQ-05:** AsyncLocalStorage para contexto do tema por request
- **REQ-06:** Sanitizacao de dados antes de passar ao tema
- **REQ-07:** Theme permission requests (pending/approved/denied)
- **REQ-08:** theme.json como manifest do tema

## User Roles
- **Administrador:** Gerenciar temas, ativar, instalar, aprovar permissoes
- **Temos:** Acessam dados via ThemeDataService com permissoes validadas

## Constraints
- **C01:** Temas so acessam dados com permissao aprovada
- **C02:** Nome do tema e sanitizado com sanitizePath
- **C03:** Dados passados ao tema sao mascarados (maskSensitiveData)
- **C04:** Fallback para layout "post" se import falhar

## Dependencies
- **Depende de:** Post Management, ThemeDataService
- **Bloqueia:** NENHUMA (feature publica principal)
- **Relacionado com:** Plugins, Security
