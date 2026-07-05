# Auditoria: Documento vs Implementacao

## ARQUIVOS COM CLASSES ANTIGAS (13 arquivos nao atualizados)

1. `src/app/(admin)/admin/settings/keys/page.tsx` - glass-card, headline-lg, animate-in
2. `src/app/(admin)/admin/settings/keys/ApiKeyManager.tsx` - glass-card, btn-primary, input-minimal, select-minimal
3. `src/app/(admin)/admin/settings/reading/page.tsx` - glass-card, headline-lg, animate-in
4. `src/app/(admin)/admin/settings/reading/ReadingSettingsForm.tsx` - glass-card, btn-primary
5. `src/app/(admin)/admin/settings/post-types/[id]/fields/page.tsx` - glass-card, headline-lg, animate-in
6. `src/app/(admin)/admin/settings/post-types/[id]/fields/FieldGroupManager.tsx` - glass-card, btn-primary, input-minimal, select-minimal, animate-in
7. `src/app/(admin)/admin/settings/taxonomy-types/[id]/terms/page.tsx` - glass-card, input-minimal, btn-primary, headline-lg, animate-in
8. `src/app/(admin)/admin/settings/users/[id]/page.tsx` - glass-card, input-minimal, select-minimal, btn-primary, headline-lg, animate-in
9. `src/app/(admin)/admin/themes/ThemeUpload.tsx` - glass-card
10. `src/app/(admin)/admin/themes/editor/page.tsx` - glass-card, btn-primary, input-minimal, select-minimal, headline-lg, gold-glow, animate-in
11. `src/app/(admin)/not-found.tsx` - headline-md, btn-primary
12. `src/app/auth/login/page.tsx` - btn-primary (dourado mantido de proposito)
13. `src/components/admin/MediaPicker.tsx` - glass-card, gold-glow, btn-primary

## FUNCIONALIDADES NAO IMPLEMENTADAS (Fase 5 do documento)

- Paginacao nas listagens: NAO FEITO
- Barra de busca/filtros: NAO FEITO
- Quick Edit inline: NAO FEITO
- Notificacoes padronizadas: NAO FEITO

## DIVERGENCIA DE NOMENCLATURA

O documento usa prefixo `bl-*`. A implementacao usa nomes descritivos:
- bl-card -> content-card
- bl-btn-primary -> btn-action
- bl-input -> field-input
- bl-table -> data-table
- bl-metabox -> meta-box
- bl-content-bg -> admin-content
- bl-badge -> status-badge / status-published / status-draft / status-trash
- bl-btn-secondary -> btn-action-secondary
