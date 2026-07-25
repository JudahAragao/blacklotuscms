---
spec_version: "1.3"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Testing Strategy

## 1. Unit Testing
- **Framework:** Vitest (configured in the project)
- **Scope:** Services (PostService, UserService, etc.), Utils, Zod Schemas
- **Setup:** Prisma mock for database tests
- **Status:** Complete (84 tests, 7 files)
- **Run:** `bun run test`

## 2. Integration Testing
- **Framework:** Vitest
- **Scope:** HookService, lib utilities, Zod schemas
- **Setup:** Real database (test) or mock
- **Status:** Complete (32 tests, 3 files)
- **Run:** `bun run test`

## 3. E2E Testing
- **Framework:** Playwright
- **Scope:** Health check, public site, admin panel, API endpoints
- **Config:** `playwright.config.ts`
- **Status:** Complete (4 files: health, public-site, admin, api)
- **Run:** `bun run test:e2e`

## 4. Manual Testing
- Admin panel UI verification
- Public themes testing
- Responsiveness verification
- Docker installation testing

## Test Files
- `src/lib/*.test.ts` — Unit tests for utilities
- `src/core/services/*.test.ts` — Unit tests for services
- `src/schemas/*.test.ts` — Unit tests for Zod schemas
- `e2e/*.spec.ts` — E2E tests with Playwright
