---
spec_version: "1.3"
last_updated: "2026-07-13"
author: "BlackLotusCMS Team"
status: approved
---

# Full Backlog - BlackLotusCMS

## P0: Fundação & Segurança
- [x] **TASK-001:** Database schema com Prisma | est: 8h | depends: [] | feature: installation
- [x] **TASK-002:** Sistema de autenticação NextAuth + JWT | est: 6h | depends: [] | feature: authentication
- [x] **TASK-003:** Proxy com installation gate, auth e rate limit | est: 4h | depends: [] | feature: installation
- [x] **TASK-004:** SecretsService e Zero .env | est: 4h | depends: [] | feature: installation
- [x] **TASK-005:** Sistema de instalação web-based | est: 8h | depends: [TASK-001, TASK-004] | feature: installation
- [x] **TASK-006:** RBAC com capabilities JSON | est: 6h | depends: [TASK-002] | feature: authentication
- [x] **TASK-007:** Docker multi-stage build | est: 3h | depends: [] | feature: deployment
- [x] **TASK-024:** Security headers via `next.config.ts` | est: 2h | depends: [] | feature: security
- [x] **TASK-025:** HTML sanitization com DOMPurify | est: 2h | depends: [] | feature: security
- [x] **TASK-026:** Sensitive data masking para temas/APIs | est: 2h | depends: [] | feature: security

## P1: Funcionalidades Principais
- [x] **TASK-008:** PostType CRUD (admin) | est: 6h | depends: [TASK-001] | feature: post-management
- [x] **TASK-009:** Post CRUD com MetaFields e Taxonomies | est: 10h | depends: [TASK-008] | feature: post-management
- [x] **TASK-010:** FieldGroup e Field management | est: 6h | depends: [TASK-008] | feature: post-management
- [x] **TASK-011:** Media upload com Sharp (WebP + thumbnails) | est: 6h | depends: [TASK-001] | feature: media-management
- [x] **TASK-012:** Storage drivers local, S3 e R2 | est: 5h | depends: [TASK-011] | feature: media-management
- [x] **TASK-013:** HookService (Actions + Filters) | est: 6h | depends: [] | feature: plugin-system
- [x] **TASK-014:** PluginSandbox com isolated-vm | est: 8h | depends: [TASK-013] | feature: plugin-system
- [x] **TASK-015:** Plugin install/activate/deactivate | est: 6h | depends: [TASK-014] | feature: plugin-system
- [x] **TASK-016:** Theme engine com static imports | est: 8h | depends: [TASK-009] | feature: theme-engine
- [x] **TASK-017:** ThemeDataService com permission validation | est: 5h | depends: [TASK-016] | feature: theme-engine
- [x] **TASK-018:** GraphQL API com Pothos | est: 6h | depends: [TASK-009] | feature: api
- [x] **TASK-019:** REST API endpoints (v1) | est: 8h | depends: [TASK-009] | feature: api
- [x] **TASK-027:** API Key management (generate/list/revoke + rate limit) | est: 4h | depends: [TASK-002] | feature: api-keys
- [x] **TASK-028:** Zod validation schemas | est: 3h | depends: [] | feature: validation

## P2: Features Secundárias
- [x] **TASK-020:** Menu system hierárquico | est: 4h | depends: [] | feature: menu-system
- [x] **TASK-021:** Comment system com anti-spam | est: 5h | depends: [TASK-009] | feature: comments
- [x] **TASK-022:** Search service global | est: 3h | depends: [TASK-009, TASK-010] | feature: search
- [x] **TASK-023:** Sitemap generation | est: 2h | depends: [TASK-009] | feature: sitemap

## P3: Documentação e Operação
- [x] **TASK-032:** SDD documentation completa v1.3 | est: 10h | depends: [] | feature: docs
- [x] **TASK-033:** API documentation alinhada ao código | est: 4h | depends: [TASK-019] | feature: docs
- [x] **TASK-039:** Remover `ignoreBuildErrors` do Next build | est: 3h | depends: [TASK-018, TASK-019] | feature: quality
- [x] **TASK-040:** Criar script `test` no `package.json` para Vitest | est: 1h | depends: [TASK-029] | feature: testing
- [x] **TASK-041:** Implementar deleção real de objetos S3/R2 no StorageDriver | est: 2h | depends: [TASK-012] | feature: media-management

## P4: Escala e QA
- [x] **TASK-029:** Unit tests (Vitest) — 84 tests, 7 arquivos | est: 8h | depends: [TASK-024, TASK-025] | feature: testing
- [x] **TASK-030:** Integration tests — 32 tests, 3 arquivos (hook-service, lib, schemas) | est: 6h | depends: [TASK-029] | feature: testing
- [x] **TASK-031:** E2E tests (Playwright) — 4 arquivos: health, public-site, admin, api | est: 8h | depends: [TASK-030] | feature: testing

## P5: Compliance e Auditoria
- [x] **TASK-034:** Audit logging básico para hooks e operações sensíveis | est: 4h | depends: [] | feature: security
- [x] **TASK-035:** LGPD compliance (data export via GET + account delete via DELETE /api/v1/users/:id) | est: 6h | depends: [TASK-009] | feature: compliance

## P6: Gap Fixes e Polish
- [x] **TASK-036:** Error boundary admin | est: 2h | depends: [] | feature: ux
- [x] **TASK-037:** Loading states e skeletons padronizados | est: 2h | depends: [] | feature: ux
- [x] **TASK-038:** Responsive design admin panel (sidebar toggle mobile, table scroll, top bar adaptativa) | est: 4h | depends: [] | feature: ux
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
- [x] **TASK-059:** Tab/Section visual distinction (separador styling + type badge) | est: 1h | depends: [TASK-056] | feature: post-management
- [x] **TASK-060:** Auto-deduplicate field anchors (titulo, titulo_2, titulo_3...) | est: 1h | depends: [TASK-057] | feature: post-management
- [x] **TASK-061:** Decouple FieldGroup from PostType (ACF-like location rules) | est: 8h | depends: [TASK-010] | feature: post-management
- [x] **TASK-062:** Implement evaluateLocations service (runtime field group matching) | est: 4h | depends: [TASK-061] | feature: post-management
- [x] **TASK-063:** Create FieldGroups admin page (independent from PostTypes) | est: 3h | depends: [TASK-061] | feature: post-management
- [x] **TASK-064:** Add taxonomy MetaValue support (termId nullable in MetaValue) | est: 2h | depends: [TASK-061] | feature: post-management
- [x] **TASK-065:** Rename "Tipos de Conteúdo" → "Tipos de Posts" + add "Campos Customizados" button | est: 1h | depends: [] | feature: ux
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
- [x] **TASK-075:** Upload de arquivos não-imagem + validação de tipos aceitos | est: 6h | depends: [TASK-011, TASK-010] | feature: media-management

## Métricas
- Total de tasks: 75
- Concluídas: 75
- Pendentes: 0
- Bloqueadas: 0
- Estimativa restante: 0h
