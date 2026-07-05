---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: draft
---

# Testing Strategy

## 1. Unit Testing
- **Framework:** Vitest (configurado no projeto)
- **Scope:** Services (PostService, UserService, etc.), Utils, Schemas Zod
- **Setup:** Prisma mock para testes de banco
- **Status:** Pendente (TASK-029)

## 2. Integration Testing
- **Framework:** Vitest
- **Scope:** API routes, Proxy middleware, Hook system
- **Setup:** Database real (test) ou mock
- **Status:** Pendente (TASK-030)

## 3. E2E Testing
- **Framework:** A definir (Playwright ou Cypress)
- **Scope:** Fluxos completos: instalacao, login, CRUD posts, upload media
- **Status:** Pendente (TASK-031)

## 4. Manual Testing
- Verificacao de UI do admin panel
- Teste de themes publicos
- Verificacao de responsividade
- Teste de instalacao via Docker
