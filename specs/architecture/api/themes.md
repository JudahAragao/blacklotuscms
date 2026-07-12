---
spec_version: "1.3"
last_updated: "2026-07-12"
author: "BlackLotusCMS Team"
status: approved
module: "themes"
---

# API - Themes

## Overview

Themes are source-controlled folders compiled into the application build at
build time. There is no runtime upload, ZIP install, or hot-editing endpoint.
All theme CSS is bundled via selector replacement (`.blacklotuscms-theme[data-bl-theme="id"]`)
with `@scope` for Chrome 118+ isolation in the generated `theme-styles.css`.
Layouts are imported statically through the generated `theme-registry.ts`.

## Endpoints

### EP-01: Serve Theme Assets
- **Method:** `GET`
- **Path:** `/api/themes/:name/assets/*`
- **Auth:** Public
- **RBAC:** N/A

Serves static files (images, fonts, favicon) from `themes/:name/assets/`.

### EP-02: List Themes
- **Method:** Via admin panel (`/admin/themes`)
- **Auth:** Required
- **RBAC:** `theme.manage`

### EP-03: Activate Theme
- **Method:** Via admin panel (`/admin/themes`)
- **Auth:** Required
- **RBAC:** `theme.manage`

### EP-04: Theme Permissions Management
- **Method:** Via admin panel (`/admin/themes`)
- **Auth:** Required
- **RBAC:** `theme.manage`

## Removed Endpoints

The following endpoints existed in spec v1.2 but have been removed because
theme CSS is now bundled at build time and themes are no longer editable
at runtime:

- ~~`GET /api/themes/:name/style`~~ — CSS is bundled in `theme-styles.css`
- ~~`POST /api/admin/themes/editor`~~ — Theme files are source-controlled
- ~~ZIP Upload / Theme Install~~ — Themes are added by placing a folder in `themes/`

## Theme Contract

Themes must declare `"themeApiVersion": 1` in their `theme.json` manifest.
The build script validates this field and rejects themes with unsupported
versions.

### Official Semantic Tokens

Themes may override these CSS custom properties within their scoped CSS:

```
--color-background, --color-foreground
--color-primary, --color-primary-foreground
--color-secondary, --color-secondary-foreground
--color-muted, --color-muted-foreground
--color-card, --color-card-foreground
--color-accent, --color-accent-foreground
--color-border, --color-input, --color-ring
--color-destructive, --color-destructive-foreground
--font-sans, --font-display, --font-mono
--radius-sm, --radius-md, --radius-lg, --radius-xl
```

Themes may also define custom variables (e.g. `--vj-gold`) and use Tailwind
arbitrary values (`bg-[var(--vj-gold)]`).
