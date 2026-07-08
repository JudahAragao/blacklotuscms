---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: draft
---

# Testing Strategy

## 1. Unit Testing
- **Framework:** Vitest (configurado no projeto)
- **Scope:** Services (PostService, UserService, etc.), Utils, Schemas Zod
- **Setup:** Prisma mock para testes de banco
- **Status:** Pending (TASK-029)

## 2. Integration Testing
- **Framework:** Vitest
- **Scope:** API routes, Proxy middleware, Hook sistema
- **Setup:** Database real (test) ou mock
- **Status:** Pending (TASK-030)

## 3. E2E Testing
- **Framework:** A definir (Playwright ou Cypress)
- **Scope:** Flows withpletos: installation, login, CRUD posts, upload media
- **Status:** Pending (TASK-031)

## 4. Manual Testing
- Verificacao de UI do admin panel
- Test de themes publicos
- Verificacao de responsividade
- Test de installation via Docker
