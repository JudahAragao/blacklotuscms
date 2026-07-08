---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Specification

## Description
Sistema de plugins com installation via ZIP, execution em sandbox isolado (isolated-vm), Bridge API secure e sistema de permissions.

## Requirements
- **REQ-01:** Instalacao de plugins via upload de ZIP
- **REQ-02:** Execucao em isolate-vm com limite de memória e timeout
- **REQ-03:** Bridge API: log, auth, db, storage, hooks, permissions
- **REQ-04:** Sistema de permissions (requesterPlugin, providerPlugin, capability)
- **REQ-05:** Rate limit de 50 queries/segundo por plugin
- **REQ-06:** Sanitization de data retornados ao plugin
- **REQ-07:** Boot automatico de plugins ativos na inicializacao
- **REQ-08:** Hooks (Actions + Filters) para extensibilidade

## User Roles
- **Administrador:** Install, activate, desactivate plugins, manage permissions
- **Demais roles:** Sem acesso ao gerenciamento de plugins

## Constraints
- **C01:** Plugins executam com SANDBOX_MEMORY_LIMIT (default 512MB)
- **C02:** Timeout configuravel via SANDBOX_TIMEOUT (default 30s)
- **C03:** Fields sensiveis (passwordHash, secret, etc.) sempre removidos
- **C04:** Plugin Permission Gate verifica antes de cada acesso

## Dependencies
- **Depends on:** Authentication, HookService
- **Blocks:** NONE
- **Related to:** Themes, Security
