---
spec_version: "1.4"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Specification

## Description
Plugin system with installation via ZIP, execution in isolated sandbox (isolated-vm), secure Bridge API, and permissions system.

## Requirements
- **REQ-01:** Plugin installation via ZIP upload
- **REQ-02:** Execution in isolate-vm with memory limit and timeout
- **REQ-03:** Bridge API: log, auth, db, storage, hooks, permissions
- **REQ-03b:** Bridge API db: read, findOne, create, update, updateMany, delete, deleteMany, upsert, transaction (full CRUD + atomic operations)
- **REQ-03c:** HTTP outbound auto-request of domain permission when blocked by whitelist
- **REQ-03d:** Webhook inbound maximum payload of 2MB
- **REQ-03e:** Bridge API routes: register() for dynamic routes with params (:slug, :id) and server-side handler
- **REQ-03f:** RouteContext includes `role` (name + capabilities) of authenticated user for e-commerce plugins
- **REQ-04:** Permissions system (requesterPlugin, providerPlugin, capability)
- **REQ-05:** Rate limit of 50 queries/second per plugin (applied before hasPermission, as protection against resource abuse)
- **REQ-05b:** Random jitter of 1-5ms between Bridge API calls to mitigate thundering herd
- **REQ-06:** Data sanitization returned to plugin
- **REQ-07:** Automatic boot of active plugins on startup
- **REQ-08:** Hooks (Actions + Filters) for extensibility
- **REQ-09:** HTTP outbound via bridge.http.request() with domain whitelist
- **REQ-10:** Compiled plugins: TypeScript plugins compiled together with Next.js, with Proxy-based bridge
- **REQ-10b:** generate-plugin-registry.mjs: script that discovers plugins in plugins/, generates plugin-registry.ts with static imports
- **REQ-10c:** CompiledPluginLoader: loads compiled plugins with bridge Proxy, controls access to db/http/storage/hooks/webhook/routes
- **REQ-10d:** Compiled plugins permissions: permissions declared in plugin.json, requested on activation, admin approves in panel
- **REQ-11:** Webhook inbound via bridge.webhook.on() with signature verification (HMAC-SHA256)
- **REQ-12:** Network audit log for all HTTP calls and webhooks
- **REQ-13:** Separate rate limit for HTTP outbound (20 req/s, configurable per plugin)
- **REQ-14:** Installed plugins persisted in shared volume (`/opt/apps/shared/plugins`)
- **REQ-15:** RouteService for dynamic plugin routes with params (:slug, :id)
- **REQ-16:** Auto-request of domain permission when blocked by whitelist
- **REQ-17:** `sandbox` field in plugin.json controls execution mode (`true` = isolated-vm, `false` = compiled)
- **REQ-18:** Filesystem auto-registration: plugins in `plugins/` without database record are auto-registered on boot
- **REQ-19:** `bun run create-plugin` — interactive script for plugin scaffolding with plugin.json + index.ts generation
- **REQ-20:** `setup_dev.sh` — idempotent local setup script (checks prerequisites, PostgreSQL, deps, prisma, registries)

## User Roles
- **Administrator:** Install, activate, deactivate plugins, manage permissions
- **Other roles:** No access to plugin management

## Constraints
- **C01:** Plugins run with SANDBOX_MEMORY_LIMIT (default 512MB)
- **C02:** Configurable timeout via SANDBOX_TIMEOUT (default 30s)
- **C03:** Sensitive fields (passwordHash, secret, etc.) always removed
- **C04:** Plugin Permission Gate checks before each access
- **C05:** Security chain: checkRateLimit() → applyJitter() → hasPermission() → database query

## Dependencies
- **Depends on:** Authentication, HookService
- **Blocks:** NONE
- **Related to:** Themes, Security