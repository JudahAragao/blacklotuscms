---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Roadmap - BlackLotusCMS

## Phase 1: Fundacao (Sprint 01) - COMPLETA
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
- [x] **TASK-020:** Menu system hierarchical | priority: P2 | est: 4h
- [x] **TASK-021:** Comment system com anti-spam | priority: P2 | est: 5h
- [x] **TASK-022:** Search service (global search) | priority: P2 | est: 3h
- [x] **TASK-023:** Sitemap generation | priority: P2 | est: 2h

## Phase 5: Security & Polish (Sprint 05) - EM PROGRESSO
- [ ] **TASK-024:** Security headers (HSTS, X-Frame, etc.) | priority: P0 | est: 2h | depends: [] | feature: security
- [ ] **TASK-025:** HTML sanitization (DOMPurify) | priority: P0 | est: 2h | depends: [] | feature: security
- [ ] **TASK-026:** Sensitive data masking | priority: P0 | est: 2h | depends: [] | feature: security
- [ ] **TASK-027:** API Key management (CRUD + rate limit) | priority: P1 | est: 4h | depends: [] | feature: api-keys
- [ ] **TASK-028:** Zod validation schemas | priority: P1 | est: 3h | depends: [] | feature: validation

## Phase 6: QA & Documentation (Sprint 06) - PENDENTE
- [ ] **TASK-029:** Unit tests (Vitest) | priority: P4 | est: 8h | depends: [TASK-024, TASK-025] | feature: testing
- [ ] **TASK-030:** Integration tests | priority: P4 | est: 6h | depends: [TASK-029] | feature: testing
- [ ] **TASK-031:** E2E tests | priority: P4 | est: 8h | depends: [TASK-030] | feature: testing
- [ ] **TASK-032:** SDD documentation completa | priority: P5 | est: 10h | depends: [] | feature: docs
- [ ] **TASK-033:** API documentation | priority: P3 | est: 4h | depends: [TASK-019] | feature: docs
