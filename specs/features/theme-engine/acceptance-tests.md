---
spec_version: "1.3"
last_updated: "2026-07-12"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Acceptance Tests

## AT-01: Render Single Post
- **GIVEN** active theme with `post.tsx` layout registered in `theme-registry.ts`
- **WHEN** accessing `/my-post`
- **THEN** theme layout is rendered with post data via static import
- **Reference:** REQ-01

## AT-02: Theme Without Permission
- **GIVEN** theme without approved ThemePermission for `db.read.post`
- **WHEN** attempting to access posts
- **THEN** permission is requested and 403 error returned
- **Reference:** REQ-04, REQ-07

## AT-03: CSS Isolated Per Theme
- **GIVEN** theme with `style.css` defining CSS variables
- **WHEN** `themes:generate` is executed
- **THEN** `theme-styles.css` is generated with `.blacklotuscms-theme[data-bl-theme="id"]` selectors (no CSS nesting)
- **AND** CSS variables are applied directly to the wrapper element
- **Reference:** REQ-03

## AT-04: Keyframes Namespacing
- **GIVEN** theme with `@keyframes` in `style.css`
- **WHEN** `themes:generate` is executed
- **THEN** keyframes receive `bl-<id>-` prefix and CSS references are updated
- **Reference:** REQ-09

## AT-05: Manifest Validation
- **GIVEN** theme with invalid `theme.json` (missing `themeApiVersion`)
- **WHEN** `themes:generate` is executed
- **THEN** script throws error and generation is blocked
- **Reference:** REQ-08

## AT-06: Fallback to Default
- **GIVEN** active theme that does not exist in `themeRegistry`
- **WHEN** page is rendered
- **THEN** fallback to `default` theme layout is applied
- **Reference:** REQ-01

## AT-07: CSS Variables in Build
- **GIVEN** theme defining `--color-primary: #B08A3C` in `style.css`
- **WHEN** page is rendered with the active theme
- **THEN** `--color-primary` is available and Tailwind styles that depend on it work
- **Reference:** REQ-02

## AT-08: Namespaced Settings
- **GIVEN** theme settings configured in database (e.g., `primary-color: #ff0000`)
- **WHEN** theme is rendered
- **THEN** variable available as `--theme-setting-primary-color`
- **AND** theme can explicitly consume it: `var(--theme-setting-primary-color, #B08A3C)`
- **Reference:** REQ-02
