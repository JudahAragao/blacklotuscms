---
spec_version: "1.4"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# System Design - BlackLotusCMS

## Architecture Overview

BlackLotusCMS is a headless CMS built on Next.js 16 (App Router) with Prisma ORM and Pothos GraphQL. The architecture follows the "Zero .env" pattern where all configuration is loaded from `.secrets.json`. The system is fully containerized with Docker multi-stage build.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, standalone output)
- **Database:** PostgreSQL 15 via Prisma ORM with PrismaPg adapter (connection pooling)
- **GraphQL:** Apollo Server 5 + Pothos (type-safe schema builder with Prisma plugin)
- **Auth:** NextAuth v4 (JWT strategy, CredentialsProvider, PrismaAdapter)
- **Validation:** Zod v4 (schemas in src/schemas/)
- **Styling:** Tailwind CSS v4 (compiled once for all themes)
- **Rich Text:** TipTap (editor component)
- **Images:** Sharp (WebP conversion, thumbnails)
- **Storage:** Local filesystem or AWS S3/Cloudflare R2
- **Sandbox:** isolated-vm (plugin execution)
- **Security:** DOMPurify (HTML sanitization), bcryptjs (password hashing)
- **Language:** TypeScript 6 (strict mode)

## Prisma Proxy Pattern

The Prisma client is implemented as a Proxy that allows lazy initialization. This is essential because the DATABASE_URL is only available after the web-based installation.

1. `src/lib/prisma.ts` exports a Proxy that intercepts all properties
2. On first access, `createPrismaInstance()` is called with the config URL
3. `resetPrismaInstance()` allows reinitialization after installation
4. The connection pool is managed by the PrismaPg adapter

## Hook System (Actions + Filters)

Inspired by WordPress, the HookService provides extensibility points:

1. **Actions** (`doAction`): Execute code in response to events (post.created, post.updated, etc.)
2. **Filters** (`applyFilters`): Transform data in pipeline (post.before_validate, etc.)
3. **UI Components** (`registerComponent`): Register components in slots (admin.header, public.sidebar, etc.)
4. **Audit Log**: All hook calls are logged with source, type and timestamp
5. **Auto-sanitization**: Filters that process content (title, body, etc.) are automatically sanitized with DOMPurify

## Theme Engine (Build-Time + Dual-Store Context)

The theme system is 100% build-time. There is no upload, installation, or runtime editing.

### Static Generation
1. Script `scripts/generate-theme-registry.mjs` discovers folders in `themes/`
2. For each theme, reads `theme.json`, `theme.ts` and `style.css`
3. Validates manifest, `themeApiVersion`, CSS variables declared vs. used
4. Namespaces `@keyframes` with prefix `bl-<id>-`
5. Generates `src/generated/theme-registry.ts` (static imports of layouts)
6. Generates `src/generated/theme-styles.css` (isolated CSS)

### Dual-Store Context (React.cache + AsyncLocalStorage)
The theme context is maintained in two stores for resilience:
- **React.cache (primary):** Survives `unstable_cache` and other RSC async boundaries
- **AsyncLocalStorage (fallback):** Compatibility with tests and non-RSC contexts
- `getThemeStore()` prioritizes React.cache when `themeName` is set
- `page.tsx` and `ThemeRenderer` synchronize both stores after `themeStorage.run()`

### CSS Isolation
- **Layer 1 (fallback):** Selector replacement — `.blacklotuscms-theme` → `.blacklotuscms-theme[data-bl-theme="id"]`
- **Layer 2 (Chrome 118+):** `@scope ([data-bl-theme="id"])` for shadow-dom-like isolation
- CSS variables are applied directly to wrapper element (no CSS nesting)

### Automatic Hooks
- `predev` → `themes:generate` before `npm run dev`
- `prebuild` → `themes:generate` before `npm run build`
- `pretest` → `themes:generate` before `npm run test`

## Component Diagram

1. **Proxy Layer (src/proxy.ts):** Intercepts all requests, validates installation, authentication, API keys and rate limiting
2. **App Router (src/app/):** Routes organized in (admin), (public), api, auth, install
3. **Services (src/core/services/):** 23+ business services with integrated RBAC (PostService, UserService, PluginService, NetworkService, RouteService, ShortcodeService, etc.)
4. **GraphQL (src/app/api/graphql/):** Apollo Server with Pothos schema
5. **REST API (src/app/api/v1/):** REST endpoints with withApiAuth middleware
6. **Plugin System (src/core/sandbox/ + src/core/services/PluginService.ts):** Dual-mode loading — `sandbox: true` via `PluginSandbox` (isolated-vm), `sandbox: false` via `CompiledPluginLoader` (Node.js). Filesystem auto-registration for plugins not in database.
7. **Theme Renderer (src/components/ThemeRenderer.tsx):** Static import of layouts via generated registry + isolated CSS
8. **Route Service (src/core/services/RouteService.ts):** Pattern matching for dynamic plugin and theme routes
9. **Network Service (src/core/services/NetworkService.ts):** HTTP outbound, inbound webhooks, audit log

## Data Flow

1. **Request -> Proxy:** All requests pass through the proxy which validates installation and authentication
2. **Route Matching:** RouteService checks plugin routes → theme routes → default → standard CMS
3. **Route Handler:** Requests arrive at routes (admin, public, api, auth)
4. **Route -> Service:** Routes delegate business logic to services
5. **Service -> Prisma:** Services access the database via Prisma proxy
6. **Service -> HookService:** Services dispatch actions/filters to plugins
7. **Theme -> ThemeDataService:** Themes access data via validated permission
8. **Plugin -> CompiledPluginLoader/Sandbox:** Plugins execute with Bridge API proxy
9. **Plugin -> NetworkService:** HTTP outbound and inbound webhooks pass through the NetworkService
