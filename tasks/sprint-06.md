---
spec_version: "1.1"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
sprint: "06"
---

# Sprint 06: File Upload & Validation + Documentation Overhaul

## Goal
Suporte a upload de arquivos não-imagem (PDF, DOCX, XLSX) com validação de tipos aceitos, MediaPicker dinâmico e URLs completas para temas. Plus: documentation overhaul completo.

## Duration
2026-07-15 - 2026-07-23

## Tasks
- [x] **TASK-075:** Upload de arquivos não-imagem + validação de tipos aceitos | priority: P1 | est: 6h | feature: media-management
- [x] **TASK-082:** Bridge API full CRUD: findOne, updateMany, deleteMany, upsert, transaction | priority: P1 | est: 4h | feature: plugin-system
- [x] **TASK-083:** Webhook payload limit 512KB → 2MB | priority: P2 | est: 0.5h | feature: plugin-system
- [x] **TASK-084:** HTTP outbound auto-request permissão de domínio na whitelist | priority: P2 | est: 1h | feature: plugin-system
- [x] **TASK-085:** RouteService: pattern matching, plugin routes, theme routes, params extraction | priority: P1 | est: 3h | feature: plugin-system
- [x] **TASK-086:** Bridge API routes.register() com handler server-side e template mapping | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-087:** Theme routes via routes.json + generate-theme-registry.mjs + theme-routes.ts | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-088:** Catch-all page.tsx: route matching step + ThemeRenderer routeParams prop | priority: P1 | est: 2h | feature: theme-engine
- [x] **TASK-089:** RouteContext ctx.role (name + capabilities) auto-populated from session | priority: P1 | est: 1h | feature: plugin-system
- [x] **TASK-090:** Customer auth pattern docs (Option B: plugin-based, Role creation, ctx.role usage) | priority: P2 | est: 1h | feature: docs
- [x] **TASK-091:** generate-plugin-registry.mjs: script de descoberta + geração de plugin-registry.ts | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-092:** CompiledPluginLoader: Proxy-based bridge com permissões por método | priority: P1 | est: 4h | feature: plugin-system
- [x] **TASK-093:** PluginService: activateCompiled/deactivateCompiled/bootCompiledPlugins | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-094:** Admin UI: seção compiled plugins + imported plugins + permissions modal | priority: P1 | est: 2h | feature: plugin-system
- [x] **TASK-095:** Plugin schema: type (isolated/compiled) + npmDependencies fields | priority: P2 | est: 0.5h | feature: plugin-system
- [x] **TASK-096:** Docs: compiled plugins guide no PLUGINS.md | priority: P2 | est: 1h | feature: docs
- [x] **TASK-097:** Create missing specs: NetworkService, RouteService, ShortcodeService, CompiledPlugins, ReadingSettings, Analytics | priority: P3 | est: 6h | feature: docs
- [x] **TASK-098:** Update outdated specs: database-design, system-design, plugin-system, comments, search, media, installation, auth, menu, integrations, security | priority: P3 | est: 4h | feature: docs
- [x] **TASK-099:** Fix docs: API_REST (endpoints faltando), API_GRAPHQL (incompleto), PLUGINS, THEMES, COMPLIANCE, onboarding, coding-standards, README | priority: P3 | est: 4h | feature: docs
- [x] **TASK-100:** Update glossary with missing terms (G23-G30) | priority: P3 | est: 1h | feature: docs
- [x] **TASK-101:** Update tasks/backlog.md and verify sprint alignment | priority: P3 | est: 1h | feature: docs
- [x] **TASK-102:** Sync all updated docs/specs/tasks to portfolio project | priority: P3 | est: 2h | feature: docs

## Review Notes
- MediaService agora detecta se o arquivo é imagem (mimeType) e faz branch: sharp→WebP→thumbnail para imagens, upload direto para arquivos genéricos
- MediaPicker aceita prop `accept` dinâmica baseada em field.config.validation?.accept
- FieldGroupEditor e SubFieldEditor mostram input "Tipos aceitos" na aba Validação para campos file/image/gallery
- validateField() valida extensão do arquivo contra acceptance config
- flattenMetadata() + resolveMetaUrls() convertem URLs relativas para absolutas no public page route
- Default theme page.tsx renderiza links de download para campos file
- Specs, docs e tasks atualizados
- Documentation overhaul completo: 6 novas specs, 12 specs atualizadas, 8 docs corrigidos, 8 novos termos no glossary
