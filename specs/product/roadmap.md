---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Roadmap - BlackLotusCMS

## Phase 1: Foundation (Sprint 01) - COMPLETA
- [x] **TASK-001:** Database schema com Prisma (User, Post, PostType, Field, MetaValue, etc.) | priority: P0 | est: 8h
- [x] **TASK-002:** Sistema de autenticação NextAuth + JWT | priority: P0 | est: 6h
- [x] **TASK-003:** Proxy/middleware com installation gate e auth | priority: P0 | est: 4h
- [x] **TASK-004:** SecretsService e Zero .env Architecture | priority: P0 | est: 4h
- [x] **TASK-005:** Sistema de instalação web-based | priority: P0 | est: 8h
- [x] **TASK-006:** RBAC com capabilities JSON | priority: P0 | est: 6h
- [x] **TASK-007:** Docker multi-stage build | priority: P0 | est: 3h

## Phase 2: Content Management (Sprint 02) - COMPLETA
- [x] **TASK-008:** PostType CRUD (admin) | priority: P1 | est: 6h
- [x] **TASK-009:** Post CRUD com MetaFields e Taxonomies | priority: P1 | est: 10h
- [x] **TASK-010:** FieldGroup e Field management | priority: P1 | est: 6h
- [x] **TASK-011:** Media upload com Sharp (WebP + thumbnails) | priority: P1 | est: 6h
- [x] **TASK-012:** Storage drivers (local, S3, R2) | priority: P1 | est: 5h

## Phase 3: Extensibility (Sprint 03) - COMPLETA
- [x] **TASK-013:** HookService (Actions + Filters) | priority: P1 | est: 6h
- [x] **TASK-014:** PluginSandbox com isolated-vm | priority: P1 | est: 8h
- [x] **TASK-015:** Plugin install/activate/deactivate | priority: P1 | est: 6h
- [x] **TASK-016:** Theme system com dynamic layouts | priority: P1 | est: 8h
- [x] **TASK-017:** ThemeDataService com permission validation | priority: P1 | est: 5h

## Phase 4: API & UX (Sprint 04) - COMPLETA
- [x] **TASK-018:** GraphQL API com Pothos | priority: P1 | est: 6h
- [x] **TASK-019:** REST API endpoints (v1) | priority: P1 | est: 8h
- [x] **TASK-020:** Menu sistema hierarchical | priority: P2 | est: 4h
- [x] **TASK-021:** Comment sistema com anti-spam | priority: P2 | est: 5h
- [x] **TASK-022:** Search service (global search) | priority: P2 | est: 3h
- [x] **TASK-023:** Sitemap generation | priority: P2 | est: 2h

## Phase 5: Security & Polish (Sprint 05) - COMPLETA
- [x] **TASK-024:** Security headers (HSTS, X-Frame, etc.) | priority: P0 | est: 2h
- [x] **TASK-025:** HTML sanitization (DOMPurify) | priority: P0 | est: 2h
- [x] **TASK-026:** Sensitive data masking | priority: P0 | est: 2h
- [x] **TASK-027:** API Key management (CRUD + rate limit) | priority: P1 | est: 4h
- [x] **TASK-028:** Zod validation schemas | priority: P1 | est: 3h
- [x] **TASK-032:** SDD documentation completa v1.2 | priority: P3 | est: 10h
- [x] **TASK-033:** API documentation alinhada ao codigo | priority: P3 | est: 4h
- [x] **TASK-034:** Audit logging basico | priority: P3 | est: 4h
- [x] **TASK-039:** Remover ignoreBuildErrors do build | priority: P3 | est: 3h
- [x] **TASK-040:** Criar script test no package.json para Vitest | priority: P4 | est: 1h
- [x] **TASK-041:** Implementar delecao real de objetos S3/R2 | priority: P2 | est: 2h
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 arquivos | priority: P4 | est: 8h
- [x] **TASK-035:** LGPD compliance (export + delete endpoints) | priority: P5 | est: 6h
- [x] **TASK-038:** Responsive design admin panel | priority: P6 | est: 4h

## Phase 6: QA & Documentation (Sprint 06) - COMPLETA
- [x] **TASK-030:** Integration tests — 32 tests, 3 arquivos | priority: P4 | est: 6h
- [x] **TASK-031:** E2E tests (Playwright) — 4 arquivos | priority: P4 | est: 8h
