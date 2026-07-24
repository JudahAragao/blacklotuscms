---
spec_version: "1.2"
last_updated: "2026-07-23"
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
1. `bash setup_dev.sh` — configura tudo automaticamente (idempotente)
2. `bun run dev` — inicia o servidor de desenvolvimento

O setup_dev.sh faz:
- Verifica pré-requisitos (bun, docker, node, python3, make, g++)
- Cria `.env` com secrets gerados automaticamente
- Sobe PostgreSQL via Docker
- Instala dependencias e compila isolated-vm
- Gera Prisma client e aplica schema no banco
- Gera registros de themes e plugins
- Cria diretorio uploads/

### Manual Setup (Fallback)
1. `bun install`
2. `npm rebuild isolated-vm`
3. `cp .env.example .env` (editar configuracoes)
4. `docker run -d --name blacklotus-postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=blacklotuscms -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine`
5. `bunx prisma generate && bunx prisma db push`
6. `npm run generate`
7. `mkdir -p uploads`
8. `bun run dev`

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
