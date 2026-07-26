# Theme Development

Themes are part of the source code and are included in the single build of BlackLotusCMS. There is no ZIP upload, panel installation, or runtime layout compilation.

## Workflow

1. Create or copy a folder in `themes/my-theme/`.
2. Include `theme.json`, `theme.ts`, `style.css`, layouts and assets.
3. Run `npm run dev` or `npm run build`.
4. Activate one of the themes included in the build via the panel.

The `predev`, `prebuild` and `pretest` hooks run `themes:generate`. It validates the folders and generates the static registry and isolated CSS in `src/generated/`; these files should not be edited manually.

## Structure

```text
themes/my-theme/
├── theme.json
├── theme.ts
├── style.css
├── assets/
├── components/
└── layouts/
    ├── index.ts
    ├── page.tsx
    ├── post.tsx
    ├── archive.tsx
    ├── search.tsx
    └── 404.tsx
```

`theme.ts` exports the theme layouts. The recognized names are `page`, `post`, `archive`, `search`, `category`, `blog` and `notFound`. The folder name is the ID: use only lowercase, numbers and hyphens. The `default` theme is required.

## Manifest

```json
{
  "name": "My theme",
  "version": "1.0.0",
  "themeApiVersion": 1,
  "author": "Name",
  "description": "Description",
  "favicon": "assets/favicon.ico"
}
```

`themeApiVersion` indicates the theme contract version. Currently only `1` is supported.

## Custom Routes (routes.json)

Themes can declare custom routes that resolve dynamic parameters (e.g., `/product/:slug`).

```json
{
  "routes": {
    "/checkout": "page.checkout",
    "/cart": "page.cart",
    "/account": "page.account",
    "/product/:slug": "post.product",
    "/user/:id/orders": "page.user-orders"
  }
}
```

**Naming convention:**
- `page.{name}` → `layouts/page.{name}.tsx` (page-style)
- `post.{name}` → `layouts/post.{name}.tsx` (post-style)

**Dynamic params:**
- `:slug` → extracts the URL value as `ctx.params.slug`
- `:id` → extracts the value as `ctx.params.id`
- Multiple params supported: `/user/:id/orders/:orderId`

**Required templates:**
Each declared route needs a corresponding template in `layouts/`:
- `/checkout` → needs `layouts/page.checkout.tsx`
- `/product/:slug` → needs `layouts/post.product.tsx`

**Resolution:**
1. Plugin routes (via `bridge.routes.register`)
2. Theme routes (`routes.json`)
3. Default theme routes (fallback)
4. Default CMS logic

## Pure CSS, Isolation and Assets

Every `style.css` is included in the build and isolated in the active root:

```html
<div data-bl-theme="my-theme" class="blacklotuscms-theme">…</div>
```

Pure CSS is supported. `:root` is converted to the theme root; do not use `html` or `body`. Animations receive the namespace `bl-<theme-id>-`; inline references in JSX use this generated name. Prefer custom classes and variables, such as `--my-accent` and `.my-hero`. For assets, use `/api/themes/my-theme/assets/...`.

## Tailwind CSS v4

Tailwind is compiled once for all themes. Use the official semantic tokens:

```text
background, foreground, primary, primary-foreground,
secondary, secondary-foreground, muted, muted-foreground,
card, card-foreground, accent, accent-foreground,
border, input, ring,
destructive, destructive-foreground
```

```tsx
<section className="bg-card text-foreground border border-border">
  <h1 className="font-display text-primary">Title</h1>
</section>
```

The theme's `style.css` overrides values in `.blacklotuscms-theme`. For exclusive values use normal CSS or arbitrary utilities, such as `bg-[var(--my-surface)]`. Do not create new Tailwind names only in `style.css`: they do not exist for the compiler.

## Visual Settings

Settings provided by integrations are exposed as `--theme-setting-<key>` (key in kebab-case; string or number value). They never directly replace internal tokens. The theme can consume them explicitly:

```css
.blacklotuscms-theme {
  --color-primary: var(--theme-setting-primary-color, #b08a3c);
}
```

The build fails for invalid manifest/ID, incompatible `themeApiVersion`, missing `default`, use of `html` or `body`, and references to undeclared CSS variables. These failures must block the deploy.

The panel does not edit theme files: layouts, manifests and CSS are changed in the repository and included in the next build.

## Accessing Custom Field Data

Custom fields (MetaFields) are available in `data.meta` as a key-value object:

```tsx
// Example: "hero_image" field of type image
<img src={data.meta.hero_image} alt="Hero" />

// Example: "documents" field of type file
<a href={data.meta.documents} target="_blank">Download</a>

// Example: "gallery" field of type gallery
{data.meta.gallery?.map((url: string) => (
  <img key={url} src={url} />
))}
```

**Full URLs:** Values of `file`, `image` and `gallery` fields are returned as absolute URLs (e.g., `https://domain.com/uploads/12345-file.pdf`). This ensures correct behavior in `<img src>`, `<a href>` and external contexts (RSS, APIs).

## Theme Helpers (ACF-style)

The `@/lib/theme-helpers` module provides helper functions to access custom fields in theme layouts, similar to WordPress ACF.

```tsx
import { getField, haveRows, getRows } from '@/lib/theme-helpers';
```

### Available Functions

| Function | Description |
|----------|-------------|
| `getField(name)` | Returns the value of a field |
| `theField(name)` | Alias for `getField` (for JSX) |
| `haveRows(name)` | Returns `true` if repeater has rows |
| `getRows(name)` | Returns array of rows from repeater |
| `getSubField(name)` | Returns subfield value (within rowContext) |
| `theSubField(name)` | Alias for `getSubField` |
| `getRowIndex()` | Returns index of current row |
| `getFieldObject(name)` | Returns `{ name, type, config, value }` |
| `getFieldName(name)` | Returns field name |
| `getFieldType(name)` | Returns field type |

### Example: Simple Fields

```tsx
import { getField, theField } from '@/lib/theme-helpers';

export default async function PostLayout({ data }) {
  return (
    <div>
      <h1>{getField('title')}</h1>
      <p>{theField('subtitle')}</p>
      <img src={getField('hero_image')} alt="" />
    </div>
  );
}
```

### Example: Repeater

```tsx
import { getRows, getField } from '@/lib/theme-helpers';

export default async function ProjectsLayout({ data }) {
  const projects = getRows('projects');

  return (
    <div>
      <h1>{getField('page_title')}</h1>
      {projects.map((project, i) => (
        <div key={i}>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <img src={project.photo} alt="" />
        </div>
      ))}
    </div>
  );
}
```

### Example: Flexible Content

```tsx
import { getRows, getField } from '@/lib/theme-helpers';

export default async function PageLayout({ data }) {
  const sections = getRows('page_sections');

  return (
    <div>
      {sections.map((section, i) => {
        switch (section._layout) {
          case 'hero':
            return <Hero key={i} title={section.title} bg={section.background_image} />;
          case 'text_block':
            return <TextBlock key={i} content={section.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
```

## Template Hierarchy (WordPress-style)

The theme system supports a template hierarchy similar to WordPress. Layout files use **dots** in the name to indicate specialized templates by PostType.

### Naming Convention

| File | Use |
|------|-----|
| `post.tsx` | Generic individual post (fallback for any PostType) |
| `post.blog.tsx` | Individual post for PostType "blog" |
| `post.projects.tsx` | Individual post for PostType "projects" |
| `page.tsx` | Generic page (fallback) |
| `page.blog.tsx` | Listing/archive for PostType "blog" |
| `page.projects.tsx` | Listing/archive for PostType "projects" |

### How to Export

In `layouts/index.ts`, use **string export names**:

```ts
export { default as post } from './post';
export { default as page } from './page';
export { default as "post.blog" } from './post.blog';
export { default as "page.blog" } from './page.blog';
```

### Fallback Chain

When an individual post is accessed, the ThemeRenderer tries in order:

1. `post.{postType.slug}` (e.g., `post.blog`)
2. `post` (generic)
3. `default.post` (default theme)

Example: PostType "blog" → tries `post.blog.tsx` → if it doesn't exist, uses `post.tsx`.

### Complete Example

```
/blog              → page.blog.tsx (listing)
/blog/my-article   → post.blog.tsx (individual)
/projects          → page.projects.tsx (listing)
/projects/x        → post.projects.tsx (individual)
/about             → page.tsx (generic, PostType "page")
```
