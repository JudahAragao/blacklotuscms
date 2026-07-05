---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Specification

## Description
Sistema de plugins com instalacao via ZIP, execucao em sandbox isolado (isolated-vm), Bridge API segura e sistema de permissoes.

## Requirements
- **REQ-01:** Instalacao de plugins via upload de ZIP
- **REQ-02:** Execucao em isolate-vm com limite de memória e timeout
- **REQ-03:** Bridge API: log, auth, db, storage, hooks, permissions
- **REQ-04:** Sistema de permissoes (requesterPlugin, providerPlugin, capability)
- **REQ-05:** Rate limit de 50 queries/segundo por plugin
- **REQ-06:** Sanitizacao de dados retornados ao plugin
- **REQ-07:** Boot automatico de plugins ativos na inicializacao
- **REQ-08:** Hooks (Actions + Filters) para extensibilidade

## User Roles
- **Administrador:** Instalar, ativar, desativar plugins, gerenciar permissoes
- **Demais roles:** Sem acesso ao gerenciamento de plugins

## Constraints
- **C01:** Plugins executam com SANDBOX_MEMORY_LIMIT (default 512MB)
- **C02:** Timeout configuravel via SANDBOX_TIMEOUT (default 30s)
- **C03:** Campos sensiveis (passwordHash, secret, etc.) sempre removidos
- **C04:** Plugin Permission Gate verifica antes de cada acesso

## Dependencies
- **Depende de:** Authentication, HookService
- **Bloqueia:** NENHUMA
- **Relacionado com:** Themes, Security
