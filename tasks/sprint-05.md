---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
sprint: "05"
---

# Sprint 05: Security, Docs & Quality

## Goal
Alinhar seguranca, documentacao e qualidade ao estado real do codigo apos as mudancas de Next 16, Prisma 7, Zod 4 e TypeScript 6.

## Duration
2026-07-06 - 2026-07-15

## Tasks
- [x] **TASK-024:** Security headers via `next.config.ts` | priority: P0 | est: 2h | feature: security
- [x] **TASK-025:** HTML sanitization com DOMPurify | priority: P0 | est: 2h | feature: security
- [x] **TASK-026:** Sensitive data masking | priority: P0 | est: 2h | feature: security
- [x] **TASK-027:** API Key management e dynamic rate limit | priority: P1 | est: 4h | feature: api-keys
- [x] **TASK-028:** Zod validation schemas | priority: P1 | est: 3h | feature: validation
- [x] **TASK-032:** SDD documentation v1.2 | priority: P3 | est: 10h | feature: docs
- [x] **TASK-033:** API documentation v1.2 | priority: P3 | est: 4h | feature: docs
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 arquivos | priority: P4 | est: 8h | feature: testing
- [x] **TASK-039:** Remover `ignoreBuildErrors` do build | priority: P3 | est: 3h | feature: quality
- [x] **TASK-040:** Adicionar script `test` para Vitest | priority: P4 | est: 1h | feature: testing
- [x] **TASK-041:** Implementar delete real no S3/R2 driver | priority: P2 | est: 2h | feature: media-management
- [x] **TASK-035:** LGPD compliance (export + delete endpoints) | priority: P5 | est: 6h | feature: compliance
- [x] **TASK-038:** Responsive design admin panel | priority: P6 | est: 4h | feature: ux
- [x] **TASK-030:** Integration tests — 32 tests, 3 arquivos | priority: P4 | est: 6h | feature: testing
- [x] **TASK-031:** E2E tests (Playwright) — 4 arquivos | priority: P4 | est: 8h | feature: testing
- [x] **TASK-042:** Fix theme upload Docker volumes + error handling | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-043:** Fix plugin upload Docker volumes + error handling | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-044:** Theme compilation at upload time + Module._compile for runtime loading | priority: P1 | est: 4h | feature: theme-engine
- [x] **TASK-045:** Plugin admin sidebar extensibility (registerAdminNav) | priority: P1 | est: 3h | feature: plugin-system
- [x] **TASK-046:** Theme delete functionality with deactivation check | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-047:** Docker named volumes for themes persistence | priority: P1 | est: 1h | feature: deployment

## Review Notes
- `bunx tsc --noEmit` passa sem erros.
- `src/proxy.ts` agora esta incluido no tsconfig.json.
- `ignoreBuildErrors` removido do next.config.ts.
- 116 unit tests passando em 10 arquivos via `bun run test`.
- 4 arquivos E2E criados com Playwright (health, public-site, admin, api).
- LGPD: endpoints GET/DELETE /api/v1/users/:id implementados.
- Admin sidebar responsiva com toggle em mobile via CSS peer.
- S3Driver.delete implementado com DeleteObjectCommand.
- Playwright instalado via bun, config com webServer bun run dev.
- **TASK-042:** Fix theme upload: Dockerfile cria `themes/` e copia default; docker-compose monta `/opt/apps/shared/themes`; actions.ts remove try-catch para propagar erros; ThemeUpload.tsx verifica retorno antes de toast sucesso.
- **TASK-043:** Fix plugin upload: Dockerfile cria `plugins/`; docker-compose monta `/opt/apps/shared/plugins`; actions.ts remove try-catch do importPluginAction para propagar erros.
- **TASK-044:** Theme compilation: ThemeCompiler compila .tsx para .js em compiled/; ThemeRenderer usa Module._compile para bypass do Turbopack.
- **TASK-045:** Plugin sidebar: PluginSidebarNav component + registerAdminNav bridge API + admin.sidebar.plugins slot.
- **TASK-046:** Theme delete: deleteTheme() com verificação de tema ativo e default; botão de delete na UI com confirmação.
- **TASK-047:** Named volumes: themes migrou de bind mount para Docker named volume (themes_data) para persistência entre redeployments.
