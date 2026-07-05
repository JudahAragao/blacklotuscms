# BlackLotusCMS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)

BlackLotusCMS is a modern, high-performance, and extensible Content Management System built with **Next.js 16**, **Prisma**, and **Pothos GraphQL**.

## Features

- **Next.js 16 (App Router):** React Server Components for zero-bloat frontend.
- **Zero .env Architecture:** Configuration via `.secrets.json`, no environment variables.
- **Custom Post Types:** Flexible content modeling with taxonomies and custom fields.
- **Type-Safe GraphQL:** Pothos + Prisma for end-to-end type safety.
- **Plugin System:** Secure execution via isolated-vm sandbox.
- **RBAC Security:** Role-based access control with capability-based permissions.
- **Multi-Storage:** Local, S3, and R2 storage drivers.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20 |
| pnpm | >= 8 |
| PostgreSQL | >= 15 |

---

## Installation

### 1. Clone and install
```bash
git clone https://github.com/your-org/blacklotuscms.git
cd blacklotuscms
pnpm install
```

### 2. Start PostgreSQL
```bash
# Using Docker (optional)
docker run -d --name postgres -e POSTGRES_DB=blacklotuscms -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# Or use your existing PostgreSQL instance
```

### 3. Initialize configuration
```bash
touch .secrets.json .installed
```

### 4. Generate Prisma client
```bash
pnpm prisma generate
```

### 5. Start development server
```bash
pnpm dev
```

### 6. Complete installation
Open `http://localhost:3000/install` and follow the setup wizard.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm prisma generate` | Generate Prisma client |
| `pnpm prisma db push` | Push schema to database |
| `pnpm prisma studio` | Open Prisma Studio |

---

## Project Structure

```
blacklotuscms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin panel routes
│   │   ├── (public)/          # Public routes
│   │   ├── api/               # API routes (REST + GraphQL)
│   │   └── auth/              # Authentication routes
│   ├── components/            # React components
│   │   └── admin/             # Admin UI components
│   ├── core/
│   │   ├── sandbox/           # Plugin sandbox (isolated-vm)
│   │   └── services/          # Business logic (20+ services)
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── builder.ts         # Pothos GraphQL builder
│   │   ├── config.ts          # Zod-validated configuration
│   │   ├── errors.ts          # Error handling
│   │   ├── logger.ts          # Structured logging
│   │   ├── prisma.ts          # Prisma client proxy
│   │   ├── secrets.ts         # Zero .env secrets management
│   │   └── storage.ts         # Multi-driver storage
│   ├── schemas/               # Zod validation schemas
│   └── types/                 # TypeScript types and DTOs
├── prisma/
│   └── schema.prisma          # Database schema
├── themes/
│   └── default/               # Default theme
├── specs/                     # SDD documentation
├── docs/                      # Developer documentation
└── tasks/                     # Task management
```

---

## Architecture

```
Request → Proxy (auth/rate-limit) → Route Handler → Service → Prisma → PostgreSQL
                                    ↓
                              HookService → Plugins
                                    ↓
                              ThemeRenderer → Public Page
```

### Key Files

| File | Purpose |
|------|---------|
| `src/proxy.ts` | Network boundary, auth, rate limiting |
| `src/lib/secrets.ts` | Zero .env configuration |
| `src/lib/auth.ts` | NextAuth JWT setup |
| `src/lib/builder.ts` | Pothos GraphQL schema |
| `src/lib/prisma.ts` | Lazy Prisma client |
| `src/core/services/` | Business logic with RBAC |

---

## Documentation

- **[Onboarding Guide](./docs/onboarding.md)** - Getting started
- **[Coding Standards](./docs/coding-standards.md)** - Code conventions
- **[REST API](./docs/API_REST.md)** - Endpoint reference
- **[GraphQL API](./docs/API_GRAPHQL.md)** - Schema and queries
- **[Theme Development](./docs/THEMES.md)** - Create themes
- **[Plugin Development](./docs/PLUGINS.md)** - Build plugins
- **[Compliance](./docs/COMPLIANCE.md)** - LGPD & GDPR

---

## Testing

```bash
# Unit tests
pnpm test

# E2E tests (requires Playwright)
pnpm exec playwright test
```

---

## Troubleshooting

**Prisma Client not generated**
```bash
pnpm prisma generate
```

**Database connection failed**
Check `.secrets.json` for correct `DATABASE_URL`.

**Port 3000 in use**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## License

MIT License - Copyright (c) 2026 BlackLotusCMS. See [LICENSE](./LICENSE) for details.
