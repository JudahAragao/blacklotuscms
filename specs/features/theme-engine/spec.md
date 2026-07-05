---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Specification

## Description
Motor de themes baseado em React Server Components with CSS scoping, dynamic imports, variaveis CSS e system de permissions para acesso a data.

## Requirements
- **REQ-01:** Dynamic import de layouts baseado no contexto (single, archive, search, 404)
- **REQ-02:** CSS Variables customizaveis via ThemeData
- **REQ-03:** CSS scoping via div.blacklotuscms-theme
- **REQ-04:** ThemeDataService with validacao de permissions
- **REQ-05:** AsyncLocalStorage para contexto do theme por request
- **REQ-06:** Sanitization de data antes de passar ao theme
- **REQ-07:** Theme permission requests (pending/approved/denied)
- **REQ-08:** theme.json witho manifest do theme

## User Roles
- **Administrador:** Gerenciar themes, activate, install, approve permissions
- **Temos:** Acessam data via ThemeDataService with permissions validadas

## Constraints
- **C01:** Themes so acessam data with permissao aprovada
- **C02:** Nome do theme e sanitizado with sanitizePath
- **C03:** Dados passados ao theme sao mascarados (maskSensitiveData)
- **C04:** Fallback para layout "post" se import falhar

## Dependencies
- **Depends on:** Post Management, ThemeDataService
- **Blocks:** NONE (feature publica principal)
- **Related to:** Plugins, Security
