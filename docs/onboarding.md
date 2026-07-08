---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Onboarding Guide - BlackLotusCMS

## Introduction
Bem-vindo ao BlackLotusCMS. Um CMS moderno e extensivel construido com Next.js 16, Prisma e Pothos GraphQL.

## Stack Overview
- **Next.js 16:** App Router, Server Components, standalone output
- **Prisma 7:** ORM com PrismaPg adapter (PostgreSQL)
- **Pothos:** Type-safe GraphQL schema builder
- **NextAuth 4:** JWT authentication
- **TypeScript 6:** Strict mode
- **Tailwind CSS 4:** Styling

## Core Concepts
- **Zero .env:** Configuracao via .secrets.json, nao variaveis de ambiente
- **Prisma Proxy:** Lazy initialization permite instalacao web-based
- **Hook System:** Actions + Filters para extensibilidade (WordPress-style)
- **Plugin Sandbox:** isolated-vm com Bridge API
- **Theme Sistema:** React Server Components com CSS scoping
- **RBAC:** Capability-based permissions em JSON

## Development Workflow
1. `pnpm install`
2. `touch .secrets.json .installed`
3. `pnpm prisma generate`
4. `pnpm dev`
5. Acessar `/install` para configuracao inicial

## Key Files & Directories
- `src/proxy.ts` — Middleware/reverse proxy (auth, installation gate)
- `src/lib/secrets.ts` — Zero .env secrets management
- `src/lib/auth.ts` — NextAuth configuration
- `src/lib/builder.ts` — Pothos GraphQL builder
- `src/lib/schema.ts` — GraphQL schema definitions
- `src/lib/prisma.ts` — Prisma proxy client
- `src/lib/config.ts` — Zod-validated configuration
- `src/core/services/` — 20 business logic services
- `src/core/sandbox/PluginSandbox.ts` — Plugin isolation
- `src/schemas/` — Zod validation schemas
- `src/types/dto.ts` — TypeScript DTOs
- `prisma/schema.prisma` — Database schema
- `themes/default/` — Default theme
- `src/app/` — Next.js App Router routes
