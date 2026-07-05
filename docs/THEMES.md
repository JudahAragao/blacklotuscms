# Theme Development Guide

## Overview
BlackLotusCMS themes are React Server Components with CSS scoping, dynamic imports, and permission-gated data access.

## Theme Structure
```
themes/
└── my-theme/
    ├── theme.json          # Manifest (required)
    ├── style.css           # Global styles
    ├── assets/
    │   └── favicon.ico
    ├── layouts/
    │   ├── page.tsx        # Static pages
    │   ├── post.tsx        # Single post (default)
    │   ├── archive.tsx     # Post listings
    │   ├── search.tsx      # Search results
    │   └── 404.tsx          # Not found
    └── components/
        ├── Header.tsx
        ├── Footer.tsx
        └── ...
```

## theme.json Manifest
```json
{
  "name": "My Theme",
  "version": "1.0.0",
  "author": "Developer Name",
  "description": "Theme description",
  "favicon": "assets/favicon.ico",
  "screenshot": "https://example.com/screenshot.png"
}
```

## Layout Components

### Props
All layouts receive:
```typescript
interface LayoutProps {
  data: ThemePostDTO;  // Post data (single) or list data
  context: string;     // 'single' | 'archive' | 'search' | '404'
}
```

### Example: post.tsx
```tsx
export default function PostLayout({ data, context }: LayoutProps) {
  return (
    <article>
      <h1>{data.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.content || '' }} />
      {data.seo?.description && <p>{data.seo.description}</p>}
    </article>
  );
}
```

## Lotus SDK

Import from `@/lib/lotus-sdk`:

```typescript
import { getPost, getField, getPostsByType, getThemeSetting, getSiteSetting } from '@/lib/lotus-sdk';
```

### getPost()
Returns the current post from context.

### getField(fieldName, postId?)
Gets a custom field value. Uses current post if postId not provided.

### getPostsByType(slug, limit?)
Lists posts of a specific type.

### getThemeSetting(key)
Gets a theme-specific setting.

### getSiteSetting(key)
Gets global CMS settings (supports nested keys like `seo.site_name`).

## CSS Variables
Theme settings are injected as CSS variables:
```css
.blacklotuscms-theme {
  --primary-color: #8b5cf6;
  --font-heading: 'Inter', sans-serif;
}
```

## Permissions
Themes must request permission to access system data:
- `db.read.post` - Read posts
- `db.read.media` - Read media library
- `system.auth.read` - Access user auth

Permissions are managed via the admin panel.

## Installation
1. Create theme folder in `themes/`
2. Add `theme.json` manifest
3. Activate via Admin > Themes

## Security
- Theme names are sanitized with `sanitizePath()`
- Data passed to themes is masked (no passwords, tokens)
- CSS is scoped via `.blacklotuscms-theme` class
- HTML content is sanitized with DOMPurify
