---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Full Backlog - BlackLotusCMS

## P0: Fundacao & Seguranca
- [x] **TASK-001:** Database schema com Prisma | est: 8h | depends: [] | feature: installation
- [x] **TASK-002:** Sistema de autenticacao NextAuth + JWT | est: 6h | depends: [] | feature: authentication
- [x] **TASK-003:** Proxy com installation gate, auth e rate limit | est: 4h | depends: [] | feature: installation
- [x] **TASK-004:** SecretsService e Zero .env | est: 4h | depends: [] | feature: installation
- [x] **TASK-005:** Sistema de instalacao web-based | est: 8h | depends: [TASK-001, TASK-004] | feature: installation
- [x] **TASK-006:** RBAC com capabilities JSON | est: 6h | depends: [TASK-002] | feature: authentication
- [x] **TASK-007:** Docker multi-stage build | est: 3h | depends: [] | feature: deployment
- [x] **TASK-024:** Security headers via `next.config.ts` | est: 2h | depends: [] | feature: security
- [x] **TASK-025:** HTML sanitization com DOMPurify | est: 2h | depends: [] | feature: security
- [x] **TASK-026:** Sensitive data masking para temas/APIs | est: 2h | depends: [] | feature: security

## P1: Funcionalidades Principais
- [x] **TASK-008:** PostType CRUD (admin) | est: 6h | depends: [TASK-001] | feature: post-management
- [x] **TASK-009:** Post CRUD com MetaFields e Taxonomies | est: 10h | depends: [TASK-008] | feature: post-management
- [x] **TASK-010:** FieldGroup e Field management | est: 6h | depends: [TASK-008] | feature: post-management
- [x] **TASK-011:** Media upload com Sharp (WebP + thumbnails) | est: 6h | depends: [TASK-001] | feature: media-management
- [x] **TASK-012:** Storage drivers local, S3 e R2 | est: 5h | depends: [TASK-011] | feature: media-management
- [x] **TASK-013:** HookService (Actions + Filters) | est: 6h | depends: [] | feature: plugin-system
- [x] **TASK-014:** PluginSandbox com isolated-vm | est: 8h | depends: [TASK-013] | feature: plugin-system
- [x] **TASK-015:** Plugin install/activate/deactivate | est: 6h | depends: [TASK-014] | feature: plugin-system
- [x] **TASK-016:** Theme engine com dynamic layouts | est: 8h | depends: [TASK-009] | feature: theme-engine
- [x] **TASK-017:** ThemeDataService com permission validation | est: 5h | depends: [TASK-016] | feature: theme-engine
- [x] **TASK-018:** GraphQL API com Pothos | est: 6h | depends: [TASK-009] | feature: api
- [x] **TASK-019:** REST API endpoints (v1) | est: 8h | depends: [TASK-009] | feature: api
- [x] **TASK-027:** API Key management (generate/list/revoke + rate limit) | est: 4h | depends: [TASK-002] | feature: api-keys
- [x] **TASK-028:** Zod validation schemas | est: 3h | depends: [] | feature: validation

## P2: Features Secundarias
- [x] **TASK-020:** Menu system hierarquico | est: 4h | depends: [] | feature: menu-system
- [x] **TASK-021:** Comment system com anti-spam | est: 5h | depends: [TASK-009] | feature: comments
- [x] **TASK-022:** Search service global | est: 3h | depends: [TASK-009, TASK-010] | feature: search
- [x] **TASK-023:** Sitemap generation | est: 2h | depends: [TASK-009] | feature: sitemap

## P3: Documentacao e Operacao
- [x] **TASK-032:** SDD documentation completa v1.2 | est: 10h | depends: [] | feature: docs
- [x] **TASK-033:** API documentation alinhada ao codigo | est: 4h | depends: [TASK-019] | feature: docs
- [x] **TASK-039:** Remover `ignoreBuildErrors` do Next build | est: 3h | depends: [TASK-018, TASK-019] | feature: quality
- [x] **TASK-040:** Criar script `test` no `package.json` para Vitest | est: 1h | depends: [TASK-029] | feature: testing
- [x] **TASK-041:** Implementar delecao real de objetos S3/R2 no StorageDriver | est: 2h | depends: [TASK-012] | feature: media-management

## P4: Escala e QA
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 arquivos | est: 8h | depends: [TASK-024, TASK-025] | feature: testing
- [x] **TASK-030:** Integration tests — 32 tests, 3 arquivos (hook-service, lib, schemas) | est: 6h | depends: [TASK-029] | feature: testing
- [x] **TASK-031:** E2E tests (Playwright) — 4 arquivos: health, public-site, admin, api | est: 8h | depends: [TASK-030] | feature: testing

## P5: Compliance e Auditoria
- [x] **TASK-034:** Audit logging basico para hooks e operacoes sensiveis | est: 4h | depends: [] | feature: security
- [x] **TASK-035:** LGPD compliance (data export via GET + account delete via DELETE /api/v1/users/:id) | est: 6h | depends: [TASK-009] | feature: compliance

## P6: Gap Fixes e Polish
- [x] **TASK-036:** Error boundary admin | est: 2h | depends: [] | feature: ux
- [x] **TASK-037:** Loading states e skeletons padronizados | est: 2h | depends: [] | feature: ux
- [x] **TASK-038:** Responsive design admin panel (sidebar toggle mobile, table scroll, top bar adaptativa) | est: 4h | depends: [] | feature: ux
- [x] **TASK-042:** Fix theme upload Docker volumes + error handling | est: 2h | depends: [TASK-007] | feature: theme-engine
- [x] **TASK-043:** Fix plugin upload Docker volumes + error handling | est: 2h | depends: [TASK-007] | feature: plugin-system

## Metricas
- Total de tasks: 43
- Concluidas: 43
- Pendentes: 0
- Bloqueadas: 0
- Estimativa restante: 0h
