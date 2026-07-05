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
    │   ├── post.tsx        # Single post
    │   ├── archive.tsx     # Post listings
    │   ├── category.tsx    # Category/taxonomy listings
    │   ├── search.tsx      # Search results
    │   └── 404.tsx         # Not found
    └── components/
        ├── Header.tsx
        ├── Footer.tsx
        ├── Comments.tsx
        ├── CommentForm.tsx
        └── HeaderSearch.tsx
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
  data: ThemePostDTO;
  context: string;  // 'single' | 'archive' | 'search' | '404' | 'category'
}
```

### Single Post (post.tsx)
```tsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import Comments from '../components/Comments';
import ThemeContent from '@/components/ThemeContent';

export default async function PostLayout({ data, context }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <article className="max-w-3xl mx-auto">
          {/* Post Type Badge */}
          <div className="mb-8">
            <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full uppercase">
              {data.postType?.label || 'Post'}
            </span>
            <span className="ml-3 text-sm text-gray-400">
              {new Date(data.publishedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-8">{data.title}</h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <ThemeContent content={data.content} />
          </div>

          {/* SEO Meta */}
          {data.seo?.description && (
            <p className="mt-8 text-gray-500 italic">{data.seo.description}</p>
          )}

          {/* Terms/Tags */}
          {data.terms?.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {data.terms.map((pt: any) => (
                <a
                  key={pt.term.id}
                  href={`/archive/${pt.term.slug}`}
                  className="bg-gray-100 text-gray-600 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-sm"
                >
                  #{pt.term.name}
                </a>
              ))}
            </div>
          )}

          {/* Comments */}
          <Comments postId={data.id} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
```

### Archive (archive.tsx)
```tsx
export default async function ArchiveLayout({ data }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold">
            {data.term?.name || 'All Posts'}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.results?.map((post: any) => (
            <article key={post.id} className="bg-white border rounded-lg p-6 hover:shadow-lg">
              <h2 className="text-xl font-bold mb-2">
                <a href={`/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-500 text-sm">
                {post.content?.substring(0, 100)}...
              </p>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

### Category (category.tsx)
```tsx
export default async function CategoryLayout({ data }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">
          Browse {data.taxonomy?.label || 'Categories'}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {data.terms?.map((term: any) => (
            <a
              key={term.id}
              href={`/archive/${term.slug}`}
              className="bg-white border rounded-lg p-6 text-center hover:border-primary hover:shadow"
            >
              <h3 className="font-bold">{term.name}</h3>
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

## Lotus SDK

Import from `@/lib/lotus-sdk`:

```typescript
import { getPost, getField, getPostsByType, getThemeSetting, getSiteSetting } from '@/lib/lotus-sdk';
```

### Available Functions

#### getPost()
Returns the current post from context.
```tsx
const post = getPost();
console.log(post?.title);
```

#### getField(fieldName, postId?)
Gets a custom field value. Uses current post if postId not provided.
```tsx
const phone = await getField('phone', postId);
```

#### getPostsByType(slug, limit?)
Lists posts of a specific type.
```tsx
const posts = await getPostsByType('blog', 10);
```

#### getThemeSetting(key)
Gets a theme-specific setting.
```tsx
const color = await getThemeSetting('primary_color');
```

#### getSiteSetting(key)
Gets global CMS settings (supports nested keys).
```tsx
const siteName = await getSiteSetting('seo.site_name');
```

## CSS Variables
Theme settings are injected as CSS variables:
```css
.blacklotuscms-theme {
  --primary-color: #8b5cf6;
  --font-heading: 'Inter', sans-serif;
  --spacing-section: 4rem;
}
```

## Permissions
Themes must request permission to access system data:
- `db.read.post` - Read posts
- `db.read.media` - Read media library
- `system.auth.read` - Access user auth

Permissions are managed via Admin > Themes > Permissions.

## Installation
1. Create theme folder in `themes/my-theme/`
2. Add `theme.json` manifest
3. Create layouts (at least `post.tsx`)
4. Add components (Header, Footer)
5. Activate via Admin > Themes

## Security
- Theme names sanitized with `sanitizePath()`
- Data masked (no passwords, tokens exposed)
- CSS scoped via `.blacklotuscms-theme` class
- HTML sanitized with DOMPurify
- Dynamic imports use try/catch fallback
