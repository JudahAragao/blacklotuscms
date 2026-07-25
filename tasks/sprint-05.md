---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
sprint: "05"
---

# Sprint 05: Security, Docs & Quality

## Goal
Align security, documentation and quality to the actual code state after changes to Next 16, Prisma 7, Zod 4 and TypeScript 6.

## Duration
2026-07-06 - 2026-07-15

## Tasks
- [x] **TASK-024:** Security headers via `next.config.ts` | priority: P0 | est: 2h | feature: security
- [x] **TASK-025:** HTML sanitization with DOMPurify | priority: P0 | est: 2h | feature: security
- [x] **TASK-026:** Sensitive data masking | priority: P0 | est: 2h | feature: security
- [x] **TASK-027:** API Key management and dynamic rate limit | priority: P1 | est: 4h | feature: api-keys
- [x] **TASK-028:** Zod validation schemas | priority: P1 | est: 3h | feature: validation
- [x] **TASK-032:** SDD documentation v1.2 | priority: P3 | est: 10h | feature: docs
- [x] **TASK-033:** API documentation v1.2 | priority: P3 | est: 4h | feature: docs
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 files | priority: P4 | est: 8h | feature: testing
- [x] **TASK-039:** Remove `ignoreBuildErrors` from build | priority: P3 | est: 3h | feature: quality
- [x] **TASK-040:** Add `test` script for Vitest | priority: P4 | est: 1h | feature: testing
- [x] **TASK-041:** Implement real delete in S3/R2 driver | priority: P2 | est: 2h | feature: media-management
- [x] **TASK-035:** LGPD compliance (export + delete endpoints) | priority: P5 | est: 6h | feature: compliance
- [x] **TASK-038:** Responsive design admin panel | priority: P6 | est: 4h | feature: ux
- [x] **TASK-030:** Integration tests — 32 tests, 3 files | priority: P4 | est: 6h | feature: testing
- [x] **TASK-031:** E2E tests (Playwright) — 4 files | priority: P4 | est: 8h | feature: testing
- [x] **TASK-042:** Fix theme upload Docker volumes + error handling | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-043:** Fix plugin upload Docker volumes + error handling | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-044:** Theme compilation at upload time + Module._compile for runtime loading | priority: P1 | est: 4h | feature: theme-engine
- [x] **TASK-045:** Plugin admin sidebar extensibility (registerAdminNav) | priority: P1 | est: 3h | feature: plugin-system
- [x] **TASK-046:** Theme delete functionality with deactivation check | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-047:** Docker named volumes for themes persistence | priority: P1 | est: 1h | feature: deployment
- [x] **TASK-048:** Docker named volumes for uploads and plugins persistence | priority: P1 | est: 1h | feature: deployment

## Review Notes
- `bunx tsc --noEmit` passes without errors.
- `src/proxy.ts` is now included in tsconfig.json.
- `ignoreBuildErrors` removed from next.config.ts.
- 116 unit tests passing in 10 files via `bun run test`.
- 4 E2E files created with Playwright (health, public-site, admin, api).
- LGPD: GET/DELETE /api/v1/users/:id endpoints implemented.
- Responsive admin sidebar with mobile toggle via CSS peer.
- S3Driver.delete implemented with DeleteObjectCommand.
- Playwright installed via bun, config with webServer bun run dev.
- **TASK-042:** Fix theme upload: Dockerfile creates `themes/` and copies default; docker-compose mounts `/opt/apps/shared/themes`; actions.ts removes try-catch to propagate errors; ThemeUpload.tsx checks return value before toast success.
- **TASK-043:** Fix plugin upload: Dockerfile creates `plugins/`; docker-compose mounts `/opt/apps/shared/plugins`; actions.ts removes try-catch from importPluginAction to propagate errors.
- **TASK-044:** Theme compilation: ThemeCompiler compiles .tsx to .js in compiled/; ThemeRenderer uses Module._compile to bypass Turbopack.
- **TASK-045:** Plugin sidebar: PluginSidebarNav component + registerAdminNav bridge API + admin.sidebar.plugins slot.
- **TASK-046:** Theme delete: deleteTheme() with active and default theme check; delete button in UI with confirmation.
- **TASK-047:** Named volumes: themes migrated from bind mount to Docker named volume (themes_data) for persistence between redeployments.
- **TASK-048:** Named volumes: uploads and plugins migrated from bind mount to Docker named volumes (uploads_data, plugins_data). Removed manual directory creation in setup_vps.sh.
