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
- **HTTP Code:** N/A (rendering continues)
- **System Action:** Fallback to `default` theme — `themeRegistry.default`
- **Note:** May occur if a theme was removed from code but is still active in database

## ERR-02: Theme Permission Denied
- **Condition:** Theme without approved permission for requested capability
- **HTTP Code:** 403
- **Message:** "Theme '[name]' does not have approved permission for '[capability]'"
- **Code:** AUTH_FORBIDDEN

## ERR-03: Layout Not Found
- **Condition:** Layout key does not exist in theme exports
- **HTTP Code:** N/A (automatic fallback)
- **System Action:** Tries `themeRegistry[theme].post`, then `themeRegistry.default.post`

## ERR-04: Invalid Theme Manifest
- **Condition:** `theme.json` missing, without `name`/`version`, or incompatible `themeApiVersion`
- **HTTP Code:** N/A (blocks build)
- **System Action:** `themes:generate` throws error and build fails

## ERR-05: Undeclared CSS Variables
- **Condition:** `style.css` uses `var(--xxx)` but does not declare `--xxx`
- **HTTP Code:** N/A (blocks build)
- **System Action:** `themes:generate` throws error with list of missing variables

## ERR-06: Invalid Theme ID
- **Condition:** Folder name contains invalid characters (uppercase, underscores, etc.)
- **HTTP Code:** N/A (blocks build)
- **System Action:** `themes:generate` throws error — IDs must be kebab-case

## ERR-07: Missing Default Theme
- **Condition:** `themes/default/` folder does not exist
- **HTTP Code:** N/A (blocks build)
- **System Action:** `themes:generate` throws error — `default` is mandatory

## ERR-08: Theme Context Lost During Cache Hit
- **Condition:** `unstable_cache` returns cached result and AsyncLocalStorage context is lost
- **HTTP Code:** N/A (content may become empty)
- **System Action:** getThemeStore() prioritizes React.cache (which survives async boundaries) as fallback. page.tsx and ThemeRenderer synchronize getReactStore() after themeStorage.run()
- **Status:** Resolved on 2026-07-19 via dual-store synchronization
