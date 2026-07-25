---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Onboarding Guide - BlackLotusCMS

## Introduction
Welcome to BlackLotusCMS. A modern and extensible CMS built with Next.js 16, Prisma and Pothos GraphQL.

## Stack Overview
- **Next.js 16:** App Router, Server Components, standalone output
- **Prisma 7:** ORM with PrismaPg adapter (PostgreSQL)
- **Pothos:** Type-safe GraphQL schema builder
- **NextAuth 4:** JWT authentication
- **TypeScript 6:** Strict mode
- **Tailwind CSS 4:** Styling

## Core Concepts
- **Zero .env:** Configuration via .secrets.json, not environment variables
- **Prisma Proxy:** Lazy initialization allows web-based installation
- **Hook System:** Actions + Filters for extensibility (WordPress-style)
- **Plugin Sandbox:** isolated-vm with Bridge API
- **Theme System:** React Server Components with CSS scoping
- **RBAC:** Capability-based permissions in JSON

## Development Workflow
1. `bash setup_dev.sh` — configures everything automatically (idempotent)
2. `bun run dev` — starts the development server

The setup_dev.sh script does:
- Checks prerequisites (bun, docker, node, python3, make, g++)
- Creates `.env` with automatically generated secrets
- Starts PostgreSQL via Docker
- Installs dependencies and compiles isolated-vm
- Generates Prisma client and applies schema to database
- Generates theme and plugin registries
- Creates uploads/ directory

### Manual Setup (Fallback)
1. `bun install`
2. `npm rebuild isolated-vm`
3. `cp .env.example .env` (edit configuration)
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
