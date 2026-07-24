---
spec_version: "1.4"
last_updated: "2026-07-23"
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
- **REQ-03b:** Bridge API db: read, findOne, create, update, updateMany, delete, deleteMany, upsert, transaction (full CRUD + atomic operations)
- **REQ-03c:** HTTP outbound auto-request de permissão de domínio quando bloqueado pela whitelist
- **REQ-03d:** Webhook inbound payload máximo de 2MB
- **REQ-03e:** Bridge API routes: register() para rotas dinâmicas com params (:slug, :id) e handler server-side
- **REQ-03f:** RouteContext inclui `role` (name + capabilities) do user autenticado para plugins de e-commerce
- **REQ-04:** Sistema de permissions (requesterPlugin, providerPlugin, capability)
- **REQ-05:** Rate limit de 50 queries/segundo por plugin (aplicado antes de hasPermission, como proteção contra abuso de recursos)
- **REQ-05b:** Jitter aleatório de 1-5ms entre chamadas da Bridge API para mitigar thundering herd
- **REQ-06:** Sanitization de data retornados ao plugin
- **REQ-07:** Boot automatico de plugins ativos na inicializacao
- **REQ-08:** Hooks (Actions + Filters) para extensibilidade
- **REQ-09:** HTTP outbound via bridge.http.request() com whitelist de domínios
- **REQ-10:** Compiled plugins: plugins TypeScript compilados junto com Next.js, com Proxy-based bridge
- **REQ-10b:** generate-plugin-registry.mjs: script que descobre plugins em plugins/, gera plugin-registry.ts com imports estáticos
- **REQ-10c:** CompiledPluginLoader: carrega plugins compilados com bridge Proxy, controla acesso a db/http/storage/hooks/webhook/routes
- **REQ-10d:** Compiled plugins permissions: permissões declaradas no plugin.json, solicitadas na ativação, admin aprova no painel
- **REQ-11:** Webhook inbound via bridge.webhook.on() com signature verification (HMAC-SHA256)
- **REQ-12:** Network audit log para todas as chamadas HTTP e webhooks
- **REQ-13:** Rate limit separado para HTTP outbound (20 req/s, configurável por plugin)
- **REQ-14:** Plugins instalados persistidos em volume compartilhado (`/opt/apps/shared/plugins`)
- **REQ-15:** RouteService para rotas dinâmicas de plugins com params (:slug, :id)
- **REQ-16:** Auto-request de permissão de domínio quando bloqueado pela whitelist

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
