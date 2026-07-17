---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Miscellaneous Services & Utilities

## 1. FileService (`src/core/services/FileService.ts`)

Low-level filesystem operations for file management.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `ensureDir` | `(dirPath: string) → Promise<void>` | Create directory recursively if it doesn't exist |
| `saveFile` | `(buffer: Buffer, filename: string, subDir?: string) → Promise<string>` | Write buffer to `UPLOAD_DIR/subDir/filename`. Returns absolute file path. |
| `readJson` | `<T>(filePath: string) → Promise<T \| null>` | Read and parse JSON file. Returns null if file doesn't exist or parse fails. |
| `deleteFile` | `(filePath: string) → Promise<void>` | Remove file. Silently ignores if file doesn't exist. |
| `listDir` | `(dirPath: string) → Promise<string[]>` | List directory contents. Returns empty array if dir doesn't exist. |

### Business Rules
- `saveFile` creates target directory automatically via `ensureDir`
- Errors in `saveFile` throw `BlackLotusCMSError` with status 500
- Errors in `deleteFile` and `listDir` are logged but not thrown (best-effort)

### Dependencies
- `UPLOAD_DIR` from `@/lib/config`
- `fs/promises` for async file operations

---

## 2. ShortcodeService (`src/core/services/ShortcodeService.ts`)

WordPress-style `[shortcode]` parser for content processing.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `register` | `(tag: string, handler: ShortcodeHandler) → void` | Register a shortcode handler |
| `parse` | `(content: string) → Promise<string>` | Process all shortcodes in content |

### Shortcode Syntax
```
[tag attr="value"]content[/tag]
[tag attr="value"]
```

### Built-in Shortcodes

#### `[button]`
```html
[button url="https://example.com"]Click me[/button]
```
Renders: `<a href="https://example.com" class="btn-shortcode">Click me</a>`

#### `[youtube]`
```html
[youtube id="dQw4w9WgXcQ"]
```
Renders: `<div class="video-container"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>`

### Business Rules
- All shortcode output is **sanitized** via `sanitizeHTML()` (DOMPurify)
- Errors in individual shortcodes are caught and logged without breaking the page
- Regex: `/\[(\w+)\s*([^\]]*?)\](?:(.*?)\[\/\1\])?/g`
- Attributes parsed from `key="value"` pairs

### Extension
Plugins can register custom shortcodes via:
```javascript
bridge.hooks.registerComponent('shortcode.my_tag', handler);
```

---

## 3. SettingService (`src/core/services/SettingService.ts`)

Global key/value settings store backed by Prisma.

### Methods

| Method | Signature | RBAC | Description |
|--------|-----------|------|-------------|
| `get` | `(key: string) → Promise<any>` | None | Read a setting value |
| `set` | `(key: string, value: any, user: any) → Promise<Setting>` | `setting.manage` | Write a setting (upsert) |
| `getAll` | `() → Promise<Record<string, any>>` | None | Get all settings as flat key/value object |

### Business Rules
- `set()` requires `setting.manage` capability
- Uses Prisma `upsert` for idempotent writes (create or update)
- `getAll()` returns settings as `{ key: value }` flat object

### Common Settings Keys

| Key | Type | Description |
|-----|------|-------------|
| `site_name` | string | Site display name |
| `site_title_separator` | string | Title separator (e.g., " - ") |
| `seo_description` | string | Default meta description |
| `seo_og_image` | string | Default OG image URL |
| `google_site_verification` | string | Google Search Console verification code |
| `sitemap_post_types` | string[] | Post types included in sitemap |
| `sitemap_taxonomies` | string[] | Taxonomies included in sitemap |
| `google_site_verification` | string | Google Search Console verification ID |
| `bing_site_verification` | string | Bing Webmaster Tools verification ID |
| `yandex_site_verification` | string | Yandex Webmaster verification ID |
| `baidu_site_verification` | string | Baidu Webmaster verification ID |
| `naver_site_verification` | string | Naver Webmaster verification ID |
| `pinterest_site_verification` | string | Pinterest verification ID |
| `apple_domain_verification` | string | Apple Business Connect verification ID |
| `majestic_site_verification` | string | Majestic verification ID |
| `ahrefs_site_verification` | string | Ahrefs verification ID |
| `semrush_site_verification` | string | SEMrush verification ID |
| `storage_driver` | string | "local" or "s3" or "r2" |
| `s3_config` | object | S3/R2 credentials (endpoint, bucket, keys) |
| `captcha_enabled` | boolean | Enable captcha on comments |
| `auto_approve_comments` | boolean | Auto-approve comments without moderation |
| `show_on_front` | string | "posts" or "page" |
| `front_page_id` | string | Post ID for static front page |
| `posts_page_id` | string | Post ID for posts listing page |

---

## 4. Rate Limiter (`src/lib/rate-limiter.ts`)

Configurable rate limiter with in-memory and Redis drivers.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `createRateLimiter(config)` | Function | Factory for custom rate limiters |
| `rateLimiter` | Instance | Default rate limiter (memory driver, 60s window) |

### Configuration

```typescript
interface RateLimiterConfig {
  driver: 'memory' | 'redis';
  windowMs: number;           // Time window in milliseconds
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}
```

### API

```typescript
const { check } = createRateLimiter(config);
const isAllowed: boolean = await check(key, limit);
```

- `key` — Unique identifier (e.g., IP address, API key ID)
- `limit` — Max requests per window
- Returns `true` if within limit, `false` if exceeded

### Drivers

#### Memory Driver
- In-memory `Map<string, { count, resetAt }>` bucket counter
- Sliding window: resets after `windowMs` milliseconds
- Default instance: 60-second window

#### Redis Driver
- Uses `INCR` + `PEXPIRE` for atomic rate limiting
- Key format: `ratelimit:{key}`
- Falls back to memory on Redis connection failure
- Lazy-loaded Redis client (imported on first use)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_DRIVER` | `memory` | "memory" or "redis" |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis password (optional) |

### Business Rules
- Redis fallback is automatic and silent (logs warning)
- Memory driver is suitable for single-instance deployments
- Redis driver recommended for multi-instance/production deployments
- Default window: 60 seconds
