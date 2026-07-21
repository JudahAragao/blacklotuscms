---
spec_version: "1.0"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
sprint: "06"
---

# Sprint 06: File Upload & Validation

## Goal
Suporte a upload de arquivos não-imagem (PDF, DOCX, XLSX) com validação de tipos aceitos, MediaPicker dinâmico e URLs completas para temas.

## Duration
2026-07-15 - 2026-07-22

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

## Review Notes
- MediaService agora detecta se o arquivo é imagem (mimeType) e faz branch: sharp→WebP→thumbnail para imagens, upload direto para arquivos genéricos
- MediaPicker aceita prop `accept` dinâmica baseada em field.config.validation?.accept
- FieldGroupEditor e SubFieldEditor mostram input "Tipos aceitos" na aba Validação para campos file/image/gallery
- validateField() valida extensão do arquivo contra acceptance config
- flattenMetadata() + resolveMetaUrls() convertem URLs relativas para absolutas no public page route
- Default theme page.tsx renderiza links de download para campos file
- Specs, docs e tasks atualizados
