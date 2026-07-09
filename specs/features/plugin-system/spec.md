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
- **REQ-05:** Rate limit de 50 queries/segundo por plugin (aplicado antes de hasPermission, como proteção contra abuso de recursos)
- **REQ-05b:** Jitter aleatório de 1-5ms entre chamadas da Bridge API para mitigar thundering herd
- **REQ-06:** Sanitization de data retornados ao plugin
- **REQ-07:** Boot automatico de plugins ativos na inicializacao
- **REQ-08:** Hooks (Actions + Filters) para extensibilidade
- **REQ-09:** HTTP outbound via bridge.http.request() com whitelist de domínios
- **REQ-10:** Webhook inbound via bridge.webhook.on() com signature verification
- **REQ-11:** Network audit log para todas as chamadas HTTP e webhooks
- **REQ-12:** Rate limit separado para HTTP outbound (20 req/s, configurável por plugin)
- **REQ-13:** Plugins instalados persistidos em volume compartilhado (`/opt/apps/shared/plugins`)

## User Roles
- **Administrador:** Install, activate, desactivate plugins, manage permissions
- **Demais roles:** Sem acesso ao gerenciamento de plugins

## Constraints
- **C01:** Plugins executam com SANDBOX_MEMORY_LIMIT (default 512MB)
- **C02:** Timeout configuravel via SANDBOX_TIMEOUT (default 30s)
- **C03:** Fields sensiveis (passwordHash, secret, etc.) sempre removidos
- **C04:** Plugin Permission Gate verifica antes de cada acesso
- **C05:** Cadeia de segurança: checkRateLimit() → applyJitter() → hasPermission() → query ao banco

## Dependencies
- **Depends on:** Authentication, HookService
- **Blocks:** NONE
- **Related to:** Themes, Security
