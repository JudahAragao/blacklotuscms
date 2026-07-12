---
spec_version: "1.3"
last_updated: "2026-07-12"
author: "BlackLotusCMS Team"
status: approved
---

# Design System - BlackLotusCMS

## Visual Identity: "Aura Noir"

### Colors
- **Surface:** Dark theme (admin panel)
- **Primary:** Gold (#B08A3C) for admin, theme-specific for public
- **Secondary:** Muted grays
- **Background:** CSS variable `--color-background`
- **Foreground:** CSS variable `--color-foreground`

### Typography
- **Admin Font:** Roboto (Google Fonts)
- **Display Font:** Configurable per theme via `--font-display`
- **Body Font:** Configurable per theme via `--font-sans`

### Framework
- **CSS:** Tailwind CSS v4 (compiled once for all themes)
- **Merge:** tailwind-merge for class deduplication
- **Utility:** clsx for conditional classes

### Components (Admin)
- **Rich Text Editor:** TipTap com extensions (highlight, image, link, placeholder, underline)
- **Media Picker:** Custom component com upload preview
- **Post Editor:** Full editor com meta fields, taxonomy selection
- **Skeleton:** Loading states
- **Toaster:** Sonner for notifications (dark theme, top-right)

### Icons
- **Library:** Lucide React

## Theme System

### Build-Time Architecture
- Themes are source-controlled folders in `themes/`
- `scripts/generate-theme-registry.mjs` generates:
  - `src/generated/theme-registry.ts` — static imports of layouts
  - `src/generated/theme-styles.css` — isolated CSS via selector replacement + @scope
- Hooks `predev`, `prebuild`, `pretest` run `themes:generate` automatically
- No runtime upload, compilation, or editing

### CSS Isolation
- **Layer 1 (all browsers):** `.blacklotuscms-theme[data-bl-theme="id"]` — selector replacement
- **Layer 2 (Chrome 118+):** `@scope ([data-bl-theme="id"])` — native CSS scope
- CSS variables are applied directly to wrapper element (no nesting)
- `@keyframes` receive `bl-<id>-` namespace automatically

### Official Semantic Tokens
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

### Bundled Themes
- **default:** Lotus Default — clean admin-focused theme
- **judah-portfolio:** Velaris Design System — dark portfolio with gold/olive palette, constellation canvas, glass-morphism cards
