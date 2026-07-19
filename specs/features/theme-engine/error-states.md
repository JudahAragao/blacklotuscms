---
spec_version: "1.4"
last_updated: "2026-07-19"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Error States

## ERR-01: Theme Not Found in Registry
- **Condition:** Theme name exists in database but not in generated `themeRegistry`
- **Código HTTP:** N/A (renderização continua)
- **Ação do sistema:** Fallback para theme `default` — `themeRegistry.default`
- **Nota:** Pode ocorrer se um tema foi removido do código mas ainda está ativo no banco

## ERR-02: Theme Permission Denied
- **Condition:** Theme sem permissão aprovada para capability solicitada
- **Código HTTP:** 403
- **Mensagem:** "Theme '[name]' does not have approved permission for '[capability]'"
- **Código:** AUTH_FORBIDDEN

## ERR-03: Layout Not Found
- **Condition:** Layout key não existe no exports do tema
- **Código HTTP:** N/A (fallback automático)
- **Ação do sistema:** Tenta `themeRegistry[theme].post`, depois `themeRegistry.default.post`

## ERR-04: Invalid Theme Manifest
- **Condition:** `theme.json` ausente, sem `name`/`version`, ou `themeApiVersion` incompatível
- **Código HTTP:** N/A (bloqueia build)
- **Ação do sistema:** `themes:generate` lança erro e build falha

## ERR-05: Undeclared CSS Variables
- **Condition:** `style.css` usa `var(--xxx)` mas não declara `--xxx`
- **Código HTTP:** N/A (bloqueia build)
- **Ação do sistema:** `themes:generate` lança erro com lista de variáveis faltantes

## ERR-06: Invalid Theme ID
- **Condition:** Nome da pasta contém caracteres inválidos (maiúsculas, underscores, etc.)
- **Código HTTP:** N/A (bloqueia build)
- **Ação do sistema:** `themes:generate` lança erro — IDs devem ser kebab-case

## ERR-07: Missing Default Theme
- **Condition:** Pasta `themes/default/` não existe
- **Código HTTP:** N/A (bloqueia build)
- **Ação do sistema:** `themes:generate` lança erro — `default` é obrigatório

## ERR-08: Theme Context Lost During Cache Hit
- **Condition:** `unstable_cache` retorna resultado cacheado e o AsyncLocalStorage context é perdido
- **Código HTTP:** N/A (conteúdo pode ficar vazio)
- **Ação do sistema:** getThemeStore() prioriza React.cache (que sobrevive async boundaries) como fallback. page.tsx e ThemeRenderer sincronizam getReactStore() apos themeStorage.run()
- **Status:** Resolvido em 2026-07-19 via dual-store synchronization
