---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Full Backlog - BlackLotusCMS

## P0: Fundacao & Seguranca
- [x] **TASK-001:** Database schema com Prisma | est: 8h | depends: [] | feature: installation
- [x] **TASK-002:** Sistema de autenticacao NextAuth + JWT | est: 6h | depends: [] | feature: authentication
- [x] **TASK-003:** Proxy/middleware com installation gate | est: 4h | depends: [] | feature: installation
- [x] **TASK-004:** SecretsService e Zero .env | est: 4h | depends: [] | feature: installation
- [x] **TASK-005:** Sistema de instalacao web-based | est: 8h | depends: [TASK-001, TASK-004] | feature: installation
- [x] **TASK-006:** RBAC com capabilities JSON | est: 6h | depends: [TASK-002] | feature: authentication
- [x] **TASK-007:** Docker multi-stage build | est: 3h | depends: [] | feature: deployment
- [ ] **TASK-024:** Security headers (HSTS, X-Frame, etc.) | est: 2h | depends: [] | feature: security
- [ ] **TASK-025:** HTML sanitization (DOMPurify) | est: 2h | depends: [] | feature: security
- [ ] **TASK-026:** Sensitive data masking | est: 2h | depends: [] | feature: security

## P1: Funcionalidades Principais
- [x] **TASK-008:** PostType CRUD (admin) | est: 6h | depends: [TASK-001] | feature: post-management
- [x] **TASK-009:** Post CRUD com MetaFields e Taxonomies | est: 10h | depends: [TASK-008] | feature: post-management
- [x] **TASK-010:** FieldGroup e Field management | est: 6h | depends: [TASK-008] | feature: post-management
- [x] **TASK-011:** Media upload com Sharp (WebP + thumbnails) | est: 6h | depends: [TASK-001] | feature: media-management
- [x] **TASK-012:** Storage drivers (local, S3, R2) | est: 5h | depends: [TASK-011] | feature: media-management
- [x] **TASK-013:** HookService (Actions + Filters) | est: 6h | depends: [] | feature: plugin-system
- [x] **TASK-014:** PluginSandbox com isolated-vm | est: 8h | depends: [TASK-013] | feature: plugin-system
- [x] **TASK-015:** Plugin install/activate/deactivate | est: 6h | depends: [TASK-014] | feature: plugin-system
- [x] **TASK-016:** Theme system com dynamic layouts | est: 8h | depends: [TASK-009] | feature: theme-engine
- [x] **TASK-017:** ThemeDataService com permission validation | est: 5h | depends: [TASK-016] | feature: theme-engine
- [x] **TASK-018:** GraphQL API com Pothos | est: 6h | depends: [TASK-009] | feature: api
- [x] **TASK-019:** REST API endpoints (v1) | est: 8h | depends: [TASK-009] | feature: api
- [ ] **TASK-027:** API Key management (CRUD + rate limit) | est: 4h | depends: [TASK-002] | feature: api-keys
- [ ] **TASK-028:** Zod validation schemas | est: 3h | depends: [] | feature: validation

## P2: Features Secundarias
- [x] **TASK-020:** Menu system hierarchical | est: 4h | depends: [] | feature: menu-system
- [x] **TASK-021:** Comment system com anti-spam | est: 5h | depends: [TASK-009] | feature: comments
- [x] **TASK-022:** Search service (global search) | est: 3h | depends: [TASK-009, TASK-010] | feature: search
- [x] **TASK-023:** Sitemap generation | est: 2h | depends: [TASK-009] | feature: sitemap

## P3: Automacao e Integracoes
- [ ] **TASK-032:** SDD documentation completa | est: 10h | depends: [] | feature: docs
- [ ] **TASK-033:** API documentation | est: 4h | depends: [TASK-019] | feature: docs

## P4: Escala e QA
- [ ] **TASK-029:** Unit tests (Vitest) | est: 8h | depends: [TASK-024, TASK-025] | feature: testing
- [ ] **TASK-030:** Integration tests | est: 6h | depends: [TASK-029] | feature: testing
- [ ] **TASK-031:** E2E tests | est: 8h | depends: [TASK-030] | feature: testing

## P5: Compliance e Auditoria
- [ ] **TASK-034:** Audit logging para operacoes criticas | est: 4h | depends: [] | feature: security
- [ ] **TASK-035:** LGPD compliance (data export/delete) | est: 6h | depends: [TASK-009] | feature: compliance

## P6: Gap Fixes e Polish
- [ ] **TASK-036:** Error boundary global | est: 2h | depends: [] | feature: ux
- [ ] **TASK-037:** Loading states padronizados | est: 2h | depends: [] | feature: ux
- [ ] **TASK-038:** Responsive design admin panel | est: 4h | depends: [] | feature: ux

## Metricas
- Total de tasks: 38
- Concluidas: 23 (61%)
- Em progresso: 0
- Bloqueadas: 0
- Estimativa total restante: 79h
