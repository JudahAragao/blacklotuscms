---
spec_version: "1.4"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Full Backlog - BlackLotusCMS

## P0: Foundation & Security
- [x] **TASK-001:** Database schema with Prisma | est: 8h | depends: [] | feature: installation
- [x] **TASK-002:** Authentication system NextAuth + JWT | est: 6h | depends: [] | feature: authentication
- [x] **TASK-003:** Proxy with installation gate, auth and rate limit | est: 4h | depends: [] | feature: installation
- [x] **TASK-004:** SecretsService and Zero .env | est: 4h | depends: [] | feature: installation
- [x] **TASK-005:** Web-based installation system | est: 8h | depends: [TASK-001, TASK-004] | feature: installation
- [x] **TASK-006:** RBAC with capabilities JSON | est: 6h | depends: [TASK-002] | feature: authentication
- [x] **TASK-007:** Docker multi-stage build | est: 3h | depends: [] | feature: deployment
- [x] **TASK-024:** Security headers via `next.config.ts` | est: 2h | depends: [] | feature: security
- [x] **TASK-025:** HTML sanitization with DOMPurify | est: 2h | depends: [] | feature: security
- [x] **TASK-026:** Sensitive data masking for themes/APIs | est: 2h | depends: [] | feature: security

## P1: Core Features
- [x] **TASK-008:** PostType CRUD (admin) | est: 6h | depends: [TASK-001] | feature: post-management
- [x] **TASK-009:** Post CRUD with MetaFields and Taxonomies | est: 10h | depends: [TASK-008] | feature: post-management
- [x] **TASK-010:** FieldGroup and Field management | est: 6h | depends: [TASK-008] | feature: post-management
- [x] **TASK-011:** Media upload with Sharp (WebP + thumbnails) | est: 6h | depends: [TASK-001] | feature: media-management
- [x] **TASK-012:** Storage drivers local, S3 and R2 | est: 5h | depends: [TASK-011] | feature: media-management
- [x] **TASK-013:** HookService (Actions + Filters) | est: 6h | depends: [] | feature: plugin-system
- [x] **TASK-014:** PluginSandbox with isolated-vm | est: 8h | depends: [TASK-013] | feature: plugin-system
- [x] **TASK-015:** Plugin install/activate/deactivate | est: 6h | depends: [TASK-014] | feature: plugin-system
- [x] **TASK-016:** Theme engine with static imports | est: 8h | depends: [TASK-009] | feature: theme-engine
- [x] **TASK-017:** ThemeDataService with permission validation | est: 5h | depends: [TASK-016] | feature: theme-engine
- [x] **TASK-018:** GraphQL API with Pothos | est: 6h | depends: [TASK-009] | feature: api
- [x] **TASK-019:** REST API endpoints (v1) | est: 8h | depends: [TASK-009] | feature: api
- [x] **TASK-027:** API Key management (generate/list/revoke + rate limit) | est: 4h | depends: [TASK-002] | feature: api-keys
- [x] **TASK-028:** Zod validation schemas | est: 3h | depends: [] | feature: validation

## P2: Secondary Features
- [x] **TASK-020:** Hierarchical menu system | est: 4h | depends: [] | feature: menu-system
- [x] **TASK-021:** Comment system with anti-spam | est: 5h | depends: [TASK-009] | feature: comments
- [x] **TASK-022:** Global search service | est: 3h | depends: [TASK-009, TASK-010] | feature: search
- [x] **TASK-023:** Sitemap generation | est: 2h | depends: [TASK-009] | feature: sitemap

## P3: Documentation and Operations
- [x] **TASK-032:** Complete SDD documentation v1.3 | est: 10h | depends: [] | feature: docs
- [x] **TASK-033:** API documentation aligned with code | est: 4h | depends: [TASK-019] | feature: docs
- [x] **TASK-039:** Remove `ignoreBuildErrors` from Next build | est: 3h | depends: [TASK-018, TASK-019] | feature: quality
- [x] **TASK-040:** Create `test` script in `package.json` for Vitest | est: 1h | depends: [TASK-029] | feature: testing
- [x] **TASK-041:** Implement real deletion of S3/R2 objects in StorageDriver | est: 2h | depends: [TASK-012] | feature: media-management

## P4: Scale and QA
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 files | est: 8h | depends: [TASK-024, TASK-025] | feature: testing
- [x] **TASK-030:** Integration tests — 32 tests, 3 files (hook-service, lib, schemas) | est: 6h | depends: [TASK-029] | feature: testing
- [x] **TASK-031:** E2E tests (Playwright) — 4 files: health, public-site, admin, api | est: 8h | depends: [TASK-030] | feature: testing

## P5: Compliance and Audit
- [x] **TASK-034:** Basic audit logging for hooks and sensitive operations | est: 4h | depends: [] | feature: security
- [x] **TASK-035:** LGPD compliance (data export via GET + account delete via DELETE /api/v1/users/:id) | est: 6h | depends: [TASK-009] | feature: compliance

## P6: Gap Fixes and Polish
- [x] **TASK-036:** Admin error boundary | est: 2h | depends: [] | feature: ux
- [x] **TASK-037:** Standardized loading states and skeletons | est: 2h | depends: [] | feature: ux
- [x] **TASK-038:** Responsive design admin panel (sidebar toggle mobile, table scroll, adaptive top bar) | est: 4h | depends: [] | feature: ux
- [x] **TASK-042:** ~~Fix theme upload Docker volumes + error handling~~ (deprecated — themes are source-controlled) | est: 2h | depends: [TASK-007] | feature: theme-engine | status: deprecated
- [x] **TASK-043:** Fix plugin upload Docker volumes + error handling | est: 2h | depends: [TASK-007] | feature: plugin-system
- [x] **TASK-044:** ~~Theme compilation at upload time + Module._compile for runtime loading~~ (deprecated — replaced by `themes:generate`) | est: 4h | depends: [TASK-042] | feature: theme-engine | status: deprecated
- [x] **TASK-045:** Plugin admin sidebar extensibility (registerAdminNav) | est: 3h | depends: [TASK-015] | feature: plugin-system
- [x] **TASK-046:** ~~Theme delete functionality with deactivation check~~ (deprecated — themes are source-controlled) | est: 2h | depends: [TASK-042] | feature: theme-engine | status: deprecated
- [x] **TASK-047:** ~~Docker named volumes for themes persistence~~ (deprecated — themes are in source control) | est: 1h | depends: [TASK-042] | feature: deployment | status: deprecated
- [x] **TASK-048:** Docker named volumes for uploads and plugins persistence | est: 1h | depends: [TASK-047] | feature: deployment

## P7: Theme System Overhaul (2026-07-12)
- [x] **TASK-049:** Static theme registry via `generate-theme-registry.mjs` | est: 4h | depends: [] | feature: theme-engine
- [x] **TASK-050:** Build-time CSS isolation via selector replacement + @scope | est: 3h | depends: [TASK-049] | feature: theme-engine
- [x] **TASK-051:** Remove runtime CSS injection (`/api/themes/:name/style`) | est: 2h | depends: [TASK-050] | feature: theme-engine
- [x] **TASK-052:** Remove theme editor and ZIP upload | est: 2h | depends: [TASK-050] | feature: theme-engine
- [x] **TASK-053:** Fix CSS nesting bug (variables not applying to wrapper) | est: 1h | depends: [TASK-050] | feature: theme-engine
- [x] **TASK-054:** Add `themeApiVersion` validation and accent tokens | est: 1h | depends: [TASK-049] | feature: theme-engine
- [x] **TASK-055:** Update all documentation to reflect build-time theme system | est: 2h | depends: [TASK-049] | feature: docs
- [x] **TASK-056:** Tab and Section custom field types for visual editor organization | est: 3h | depends: [TASK-010] | feature: post-management
- [x] **TASK-057:** Fix accent/special char handling in field name generation (NFD normalization) | est: 1h | depends: [TASK-010] | feature: post-management
- [x] **TASK-058:** Fix drag and drop accidental reorder (dragOverIndex tracking) | est: 1h | depends: [TASK-056] | feature: post-management
- [x] **TASK-059:** Tab/Section visual distinction (divider styling + type badge) | est: 1h | depends: [TASK-056] | feature: post-management
- [x] **TASK-060:** Auto-deduplicate field anchors (title, title_2, title_3...) | est: 1h | depends: [TASK-057] | feature: post-management
- [x] **TASK-061:** Decouple FieldGroup from PostType (ACF-like location rules) | est: 8h | depends: [TASK-010] | feature: post-management
- [x] **TASK-062:** Implement evaluateLocations service (runtime field group matching) | est: 4h | depends: [TASK-061] | feature: post-management
- [x] **TASK-063:** Create FieldGroups admin page (independent from PostTypes) | est: 3h | depends: [TASK-061] | feature: post-management
- [x] **TASK-064:** Add taxonomy MetaValue support (termId nullable in MetaValue) | est: 2h | depends: [TASK-061] | feature: post-management
- [x] **TASK-065:** Rename "Content Types" → "Post Types" + add "Custom Fields" button | est: 1h | depends: [] | feature: ux
- [x] **TASK-066:** Searchable post select for location rules (debounced search by title/slug) | est: 2h | depends: [TASK-061] | feature: post-management
- [x] **TASK-067:** Flexible Content field type with layout selection and sub-fields | est: 4h | depends: [TASK-061] | feature: post-management
- [x] **TASK-068:** Repeater sub-fields management UI in FieldGroupEditor | est: 3h | depends: [TASK-061] | feature: post-management
- [x] **TASK-069:** Field order column for drag-drop persistence | est: 1h | depends: [TASK-061] | feature: post-management
- [x] **TASK-070:** Visual field type selector with icons and categories (ACF-style) | est: 2h | depends: [] | feature: ux
- [x] **TASK-071:** Redesign SubFieldEditor with table layout + full config inputs | est: 3h | depends: [TASK-068] | feature: post-management
- [x] **TASK-072:** Repeater layout modes (table/block/row) with PostEditor rendering | est: 2h | depends: [TASK-071] | feature: post-management
- [x] **TASK-073:** Unified drag-and-drop: fields can become sub-fields and vice-versa (ACF-style) | est: 6h | depends: [TASK-072] | feature: post-management
- [x] **TASK-074:** Icon field type with lucide-react library + custom SVG with sanitization | est: 8h | depends: [TASK-070] | feature: post-management

## P8: File Upload & Validation (2026-07-15)
- [x] **TASK-075:** Non-image file upload + accepted types validation | est: 6h | depends: [TASK-011, TASK-010] | feature: media-management

## P9: Theme Helpers & Dynamic Layouts (2026-07-15)
- [x] **TASK-076:** Fix: add metaValues in PostService lean queries | est: 1h | depends: [] | feature: theme-engine
- [x] **TASK-077:** Theme helpers (get_field, have_rows, get_rows, etc.) | est: 4h | depends: [TASK-076] | feature: theme-engine
- [x] **TASK-078:** Dynamic layout resolution by slug | est: 1h | depends: [] | feature: theme-engine

## P10: WordPress-style Template Hierarchy (2026-07-15)
- [x] **TASK-079:** Template hierarchy: post.{type} fallback chain in ThemeRenderer | est: 2h | depends: [] | feature: theme-engine

## P11: SEO Fix & Theme Context Resilience (2026-07-19)
- [x] **TASK-080:** Fix: property paths seoTitle→post.seo.title, add twitter cards, dynamic root layout metadata | est: 2h | depends: [] | feature: seo
- [x] **TASK-081:** Fix: theme context lost during unstable_cache — dual-store sync (React.cache + ALS) | est: 2h | depends: [] | feature: theme-engine

## P12: Bridge API CRUD Expansion (2026-07-20)
- [x] **TASK-082:** Bridge API full CRUD: findOne, updateMany, deleteMany, upsert, transaction | est: 4h | depends: [TASK-015] | feature: plugin-system
- [x] **TASK-083:** Webhook payload limit 512KB → 2MB | est: 0.5h | depends: [] | feature: plugin-system
- [x] **TASK-084:** HTTP outbound auto-request domain permission on allowlist | est: 1h | depends: [TASK-015] | feature: plugin-system

## P13: Dynamic Routes System (2026-07-20)
- [x] **TASK-085:** RouteService: pattern matching, plugin routes, theme routes, params extraction | est: 3h | depends: [] | feature: plugin-system
- [x] **TASK-086:** Bridge API routes.register() with server-side handler and template mapping | est: 2h | depends: [TASK-085] | feature: plugin-system
- [x] **TASK-087:** Theme routes via routes.json + generate-theme-registry.mjs + theme-routes.ts | est: 2h | depends: [TASK-085] | feature: theme-engine
- [x] **TASK-088:** Catch-all page.tsx: route matching step + ThemeRenderer routeParams prop | est: 2h | depends: [TASK-085, TASK-086] | feature: theme-engine

## P14: Customer Auth Context (2026-07-20)
- [x] **TASK-089:** RouteContext ctx.role (name + capabilities) auto-populated from session | est: 1h | depends: [TASK-085] | feature: plugin-system
- [x] **TASK-090:** Customer auth pattern docs (Option B: plugin-based, Role creation, ctx.role usage) | est: 1h | depends: [TASK-089] | feature: docs

## P15: Compiled Plugins System (2026-07-20)
- [x] **TASK-091:** generate-plugin-registry.mjs: discovery script + plugin-registry.ts generation | est: 2h | depends: [] | feature: plugin-system
- [x] **TASK-092:** CompiledPluginLoader: Proxy-based bridge with per-method permissions | est: 4h | depends: [TASK-091] | feature: plugin-system
- [x] **TASK-093:** PluginService: activateCompiled/deactivateCompiled/bootCompiledPlugins | est: 2h | depends: [TASK-092] | feature: plugin-system
- [x] **TASK-094:** Admin UI: compiled plugins section + imported plugins + permissions modal | est: 2h | depends: [TASK-093] | feature: plugin-system
- [x] **TASK-095:** Plugin schema: type (isolated/compiled) + npmDependencies fields | est: 0.5h | depends: [] | feature: plugin-system
- [x] **TASK-096:** Docs: compiled plugins guide in PLUGINS.md | est: 1h | depends: [TASK-092] | feature: docs

## P16: Documentation Overhaul (2026-07-23)
- [x] **TASK-097:** Create missing specs: NetworkService, RouteService, ShortcodeService, CompiledPlugins, ReadingSettings, Analytics | est: 6h | depends: [] | feature: docs
- [x] **TASK-098:** Update outdated specs: database-design, system-design, plugin-system, comments, search, media, installation, auth, menu, integrations, security | est: 4h | depends: [] | feature: docs
- [x] **TASK-099:** Fix docs: API_REST (missing endpoints), API_GRAPHQL (incomplete), PLUGINS, THEMES, COMPLIANCE, onboarding, coding-standards, README | est: 4h | depends: [] | feature: docs
- [x] **TASK-100:** Update glossary with missing terms (G23-G30) | est: 1h | depends: [] | feature: docs
- [x] **TASK-101:** Update tasks/backlog.md and verify sprint alignment | est: 1h | depends: [] | feature: docs
- [x] **TASK-102:** Sync all updated docs/specs/tasks to portfolio project | est: 2h | depends: [TASK-097, TASK-098, TASK-099, TASK-100, TASK-101] | feature: docs

## P17: Dev Setup & Plugin Sandbox Control (2026-07-24)
- [x] **TASK-103:** setup_dev.sh: idempotent local setup script (prerequisites, PostgreSQL, deps, prisma, registries) | est: 3h | depends: [] | feature: deployment
- [x] **TASK-104:** `sandbox` field in plugin.json: controls isolated-vm vs compiled | est: 2h | depends: [] | feature: plugin-system
- [x] **TASK-105:** Filesystem auto-registration: plugins in plugins/ without database are auto-registered on boot | est: 2h | depends: [TASK-104] | feature: plugin-system
- [x] **TASK-106:** create-plugin.mjs: interactive script for plugin scaffolding | est: 1.5h | depends: [] | feature: plugin-system
- [x] **TASK-107:** Update docs: PLUGINS.md, onboarding.md, specs (plugin-system, environments, infrastructure, security) | est: 2h | depends: [TASK-103, TASK-104, TASK-105, TASK-106] | feature: docs
- [x] **TASK-108:** Sync changes to portfolio project | est: 1h | depends: [TASK-107] | feature: docs

## Metrics
- Total tasks: 108
- Completed: 108
- Pending: 0
- Blocked: 0
- Remaining estimate: 0h
