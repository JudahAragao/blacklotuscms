---
spec_version: "1.3"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Testing Strategy

## 1. Unit Testing
- **Framework:** Vitest (configurado no projeto)
- **Scope:** Services (PostService, UserService, etc.), Utils, Schemas Zod
- **Setup:** Prisma mock para testes de banco
- **Status:** Complete (84 tests, 7 arquivos)
- **Run:** `bun run test`

## 2. Integration Testing
- **Framework:** Vitest
- **Scope:** HookService, lib utilities, Zod schemas
- **Setup:** Database real (test) ou mock
- **Status:** Complete (32 tests, 3 arquivos)
- **Run:** `bun run test`

## 3. E2E Testing
- **Framework:** Playwright
- **Scope:** Health check, public site, admin panel, API endpoints
- **Config:** `playwright.config.ts`
- **Status:** Complete (4 arquivos: health, public-site, admin, api)
- **Run:** `bun run test:e2e`

## 4. Manual Testing
- Verificacao de UI do admin panel
- Test de themes publicos
- Verificacao de responsividade
- Test de installation via Docker

## Test Files
- `src/lib/*.test.ts` — Unit tests para utilities
- `src/core/services/*.test.ts` — Unit tests para services
- `src/schemas/*.test.ts` — Unit tests para Zod schemas
- `e2e/*.spec.ts` — E2E tests com Playwright
