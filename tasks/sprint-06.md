---
spec_version: "1.1"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
sprint: "06"
---

# Sprint 06: File Upload & Validation + Documentation Overhaul

## Goal
Non-image file upload support (PDF, DOCX, XLSX) with accepted types validation, dynamic MediaPicker and full URLs for themes. Plus: complete documentation overhaul.

## Duration
2026-07-15 - 2026-07-23

## Tasks
- [x] **TASK-075:** Non-image file upload + accepted types validation | priority: P1 | est: 6h | feature: media-management
- [x] **TASK-082:** Bridge API full CRUD: findOne, updateMany, deleteMany, upsert, transaction | priority: P1 | est: 4h | feature: plugin-system
- [x] **TASK-083:** Webhook payload limit 512KB → 2MB | priority: P2 | est: 0.5h | feature: plugin-system
- [x] **TASK-084:** HTTP outbound auto-request domain permission on allowlist | priority: P2 | est: 1h | feature: plugin-system
- [x] **TASK-085:** RouteService: pattern matching, plugin routes, theme routes, params extraction | priority: P1 | est: 3h | feature: plugin-system
- [x] **TASK-086:** Bridge API routes.register() with server-side handler and template mapping | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-087:** Theme routes via routes.json + generate-theme-registry.mjs + theme-routes.ts | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-088:** Catch-all page.tsx: route matching step + ThemeRenderer routeParams prop | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-089:** RouteContext ctx.role (name + capabilities) auto-populated from session | priority: P1 | est: 1h | feature: plugin-system
- [x] **TASK-090:** Customer auth pattern docs (Option B: plugin-based, Role creation, ctx.role usage) | priority: P2 | est: 1h | feature: docs
- [x] **TASK-091:** generate-plugin-registry.mjs: discovery script + plugin-registry.ts generation | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-092:** CompiledPluginLoader: Proxy-based bridge with per-method permissions | priority: P1 | est: 4h | feature: plugin-system
- [x] **TASK-093:** PluginService: activateCompiled/deactivateCompiled/bootCompiledPlugins | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-094:** Admin UI: compiled plugins section + imported plugins + permissions modal | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-095:** Plugin schema: type (isolated/compiled) + npmDependencies fields | priority: P2 | est: 0.5h | feature: plugin-system
- [x] **TASK-096:** Docs: compiled plugins guide in PLUGINS.md | priority: P2 | est: 1h | feature: docs
- [x] **TASK-097:** Create missing specs: NetworkService, RouteService, ShortcodeService, CompiledPlugins, ReadingSettings, Analytics | priority: P3 | est: 6h | feature: docs
- [x] **TASK-098:** Update outdated specs: database-design, system-design, plugin-system, comments, search, media, installation, auth, menu, integrations, security | priority: P3 | est: 4h | feature: docs
- [x] **TASK-099:** Fix docs: API_REST (missing endpoints), API_GRAPHQL (incomplete), PLUGINS, THEMES, COMPLIANCE, onboarding, coding-standards, README | priority: P3 | est: 4h | feature: docs
- [x] **TASK-100:** Update glossary with missing terms (G23-G30) | priority: P3 | est: 1h | feature: docs
- [x] **TASK-101:** Update tasks/backlog.md and verify sprint alignment | priority: P3 | est: 1h | feature: docs
- [x] **TASK-102:** Sync all updated docs/specs/tasks to portfolio project | priority: P3 | est: 2h | feature: docs

## Review Notes
- MediaService now detects whether the file is an image (mimeType) and branches: sharp→WebP→thumbnail for images, direct upload for generic files
- MediaPicker accepts dynamic `accept` prop based on field.config.validation?.accept
- FieldGroupEditor and SubFieldEditor show "Accepted types" input in the Validation tab for file/image/gallery fields
- validateField() validates file extension against acceptance config
- flattenMetadata() + resolveMetaUrls() convert relative URLs to absolute in the public page route
- Default theme page.tsx renders download links for file fields
- Specs, docs and tasks updated
- Documentation overhaul complete: 6 new specs, 12 updated specs, 8 fixed docs, 8 new glossary terms
