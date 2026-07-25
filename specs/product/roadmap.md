---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Roadmap - BlackLotusCMS

## Phase 1: Foundation (Sprint 01) - COMPLETE
- [x] **TASK-001:** Database schema with Prisma (User, Post, PostType, Field, MetaValue, etc.) | priority: P0 | est: 8h
- [x] **TASK-002:** NextAuth + JWT authentication system | priority: P0 | est: 6h
- [x] **TASK-003:** Proxy/middleware with installation gate and auth | priority: P0 | est: 4h
- [x] **TASK-004:** SecretsService and Zero .env Architecture | priority: P0 | est: 4h
- [x] **TASK-005:** Web-based installation system | priority: P0 | est: 8h
- [x] **TASK-006:** RBAC with JSON capabilities | priority: P0 | est: 6h
- [x] **TASK-007:** Docker multi-stage build | priority: P0 | est: 3h

## Phase 2: Content Management (Sprint 02) - COMPLETE
- [x] **TASK-008:** PostType CRUD (admin) | priority: P1 | est: 6h
- [x] **TASK-009:** Post CRUD with MetaFields and Taxonomies | priority: P1 | est: 10h
- [x] **TASK-010:** FieldGroup and Field management | priority: P1 | est: 6h
- [x] **TASK-011:** Media upload with Sharp (WebP + thumbnails) | priority: P1 | est: 6h
- [x] **TASK-012:** Storage drivers (local, S3, R2) | priority: P1 | est: 5h

## Phase 3: Extensibility (Sprint 03) - COMPLETE
- [x] **TASK-013:** HookService (Actions + Filters) | priority: P1 | est: 6h
- [x] **TASK-014:** PluginSandbox with isolated-vm | priority: P1 | est: 8h
- [x] **TASK-015:** Plugin install/activate/deactivate | priority: P1 | est: 6h
- [x] **TASK-016:** Theme system with dynamic layouts | priority: P1 | est: 8h
- [x] **TASK-017:** ThemeDataService with permission validation | priority: P1 | est: 5h

## Phase 4: API & UX (Sprint 04) - COMPLETE
- [x] **TASK-018:** GraphQL API with Pothos | priority: P1 | est: 6h
- [x] **TASK-019:** REST API endpoints (v1) | priority: P1 | est: 8h
- [x] **TASK-020:** Hierarchical menu system | priority: P2 | est: 4h
- [x] **TASK-021:** Comment system with anti-spam | priority: P2 | est: 5h
- [x] **TASK-022:** Search service (global search) | priority: P2 | est: 3h
- [x] **TASK-023:** Sitemap generation | priority: P2 | est: 2h

## Phase 5: Security & Polish (Sprint 05) - COMPLETE
- [x] **TASK-024:** Security headers (HSTS, X-Frame, etc.) | priority: P0 | est: 2h
- [x] **TASK-025:** HTML sanitization (DOMPurify) | priority: P0 | est: 2h
- [x] **TASK-026:** Sensitive data masking | priority: P0 | est: 2h
- [x] **TASK-027:** API Key management (CRUD + rate limit) | priority: P1 | est: 4h
- [x] **TASK-028:** Zod validation schemas | priority: P1 | est: 3h
- [x] **TASK-032:** Complete SDD documentation v1.2 | priority: P3 | est: 10h
- [x] **TASK-033:** API documentation aligned with code | priority: P3 | est: 4h
- [x] **TASK-034:** Basic audit logging | priority: P3 | est: 4h
- [x] **TASK-039:** Remove ignoreBuildErrors from build | priority: P3 | est: 3h
- [x] **TASK-040:** Create test script in package.json for Vitest | priority: P4 | est: 1h
- [x] **TASK-041:** Implement real deletion of S3/R2 objects | priority: P2 | est: 2h
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 files | priority: P4 | est: 8h
- [x] **TASK-035:** LGPD compliance (export + delete endpoints) | priority: P5 | est: 6h
- [x] **TASK-038:** Responsive design admin panel | priority: P6 | est: 4h

## Phase 6: QA & Documentation (Sprint 06) - COMPLETE
- [x] **TASK-030:** Integration tests — 32 tests, 3 files | priority: P4 | est: 6h
- [x] **TASK-031:** E2E tests (Playwright) — 4 files | priority: P4 | est: 8h
