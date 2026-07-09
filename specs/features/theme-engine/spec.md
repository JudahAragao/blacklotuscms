---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Specification

## Description
Motor de themes baseado em React Server Components com CSS scoping, dynamic imports, variaveis CSS e sistema de permissions para acesso a data.

## Requirements
- **REQ-01:** Dynamic import de layouts baseado no contexto (single, archive, search, 404)
- **REQ-02:** CSS Variables customizaveis via ThemeData
- **REQ-03:** CSS scoping via div.blacklotuscms-theme
- **REQ-04:** ThemeDataService com validacao de permissions
- **REQ-05:** AsyncLocalStorage para contexto do theme por request
- **REQ-06:** Sanitization de data antes de passar ao theme
- **REQ-07:** Theme permission requests (pending/approved/denied)
- **REQ-08:** theme.json como manifest do theme
- **REQ-09:** Theme upload via ZIP (extract + validate + install)
- **REQ-10:** Temas instalados persistidos em volume compartilhado (`/opt/apps/shared/themes`)

## User Roles
- **Administrador:** Gerenciar themes, activate, install, approve permissions
- **Temos:** Acessam data via ThemeDataService com permissions validadas

## Constraints
- **C01:** Themes so acessam data com permissao aprovada
- **C02:** Nome do theme e sanitizado com sanitizePath
- **C03:** Dados passados ao theme sao mascarados (maskSensitiveData)
- **C04:** Fallback para layout "post" se import falhar

## Dependencies
- **Depends on:** Post Management, ThemeDataService
- **Blocks:** NONE (feature publica principal)
- **Related to:** Plugins, Security
