---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Design Syshas - BlackLotusCMS

## Visual Identity: "Aura Noir"

### Colors
- **Surface:** Dark theme (admin panel)
- **Primary:** Purple/Violet accents
- **Secondary:** Muted grays
- **Background:** CSS variable `--background`
- **Foreground:** CSS variable `--foreground`

### Typography
- **Font:** Roboto (Google Fonts)
- **Weights:** 300, 400, 500, 700, 900
- **Variable:** `--font-roboto`

### Framework
- **CSS:** Tailwind CSS v4
- **Merge:** tailwind-merge for class deduplication
- **Utility:** clsx for conditional classes

### Components (Admin)
- **Rich Text Editor:** TipTap with extensions (highlight, image, link, placeholder, underline)
- **Media Picker:** Custom withponent with upload preview
- **Post Editor:** Full editor with meta fields, taxonomy selection
- **Skeleton:** Loading states
- **Toaster:** Sonner for notifications (dark theme, top-right)

### Icons
- **Library:** Lucide React

### Theme Default
- **Layouts:** page, post, archive, search, 404
- **Components:** Header, Footer, HeaderSearch, Comments, CommentForm
- **Assets:** favicon.ico
