---
spec_version: "1.0"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Miscellaneous Flows

## 1. Public Catch-All Route Resolution (`[[...slug]]/page.tsx`)

The public-facing entry point handles ALL front-end URLs through a single dynamic route.

### Resolution Order

```
Request → /any/path/here
         │
         ├─ (0) Plugin hook: route_access (can block/redirect/override)
         │
         ├─ (1) Search: slug = ["search"] → search layout + query from ?q=
         │
         ├─ (2) Theme layout: slug matches registered layout name → render layout
         │
         ├─ (3) Reading settings: show_on_front = "page"?
         │     ├─ slug matches front_page_id → render as static page
         │     └─ slug matches posts_page_id → render as posts listing
         │
         ├─ (4) Home page: slug = [] (root)
         │     ├─ show_on_front = "page" → render front_page_id as page
         │     └─ show_on_front = "posts" → render latest posts archive
         │
         ├─ (5) Single post: slug = ["post-slug"] → fetch by slug → render single
         │
         ├─ (6) Taxonomy archive: slug = ["term-slug"] → fetch posts by term → render archive
         │
         └─ (7) 404: no match → not-found page
```

### Reading Settings Logic

| Setting | Value | Behavior |
|---------|-------|----------|
| `show_on_front` | `"posts"` | Root shows latest posts, no static front page |
| `show_on_front` | `"page"` | Root shows assigned `front_page_id` as page |
| `front_page_id` | Post ID | The post rendered at `/` |
| `posts_page_id` | Post ID | The post rendered at the posts listing URL |

### Theme Preview

- Query parameter: `?preview_theme=theme-name`
- Allows viewing the site with a different theme without activating it
- Uses `ThemeRenderer` with `previewTheme` prop
- Only works for authenticated users (admin panel)

### Security

- Checks `SecretsService.isInstalled()` first — returns maintenance page if not installed
- Theme permission errors render a styled "SECURITY LOCK" UI
- SEO metadata generated dynamically per-page (title, OG tags, Google verification)

---

## 2. Theme Preview Flow

```
Admin → /admin/themes → Click "Preview" on a theme
         │
         ├─ Navigates to: /[page]?preview_theme=theme-name
         │
         ├─ ThemeRenderer receives previewTheme prop
         │
         ├─ Overrides active theme with previewTheme
         │
         ├─ Renders the page using preview theme's layouts
         │
         └─ CSS scoped to data-bl-theme="preview-theme-name"
```

### Business Rules
- Preview is read-only (no data modification)
- Preview theme CSS is applied but not persisted
- Only the admin can preview themes

---

## 3. Plugin Boot Sequence

```
CMS Init (init.ts) → pluginService.boot()
         │
         ├─ (1) Query DB: SELECT * FROM Plugin WHERE isActive = true
         │
         ├─ (2) For each active plugin:
         │     ├─ Create new PluginSandbox (isolated-vm Isolate)
         │     ├─ Inject bridge API into sandbox global scope
         │     ├─ Read plugin's entry file (index.js) from filesystem
         │     ├─ Execute code in sandbox with 30s timeout
         │     └─ Log success/failure
         │
         └─ (3) CMS ready — plugins can now register hooks, components, etc.
```

### Sandbox Configuration
- Memory limit: 512MB (configurable 128-4096MB via `SANDBOX_MEMORY_LIMIT`)
- Timeout: 30s (configurable 1-300s via `SANDBOX_TIMEOUT`)
- Each plugin gets its own `Isolate` instance (full V8 isolation)

### Bridge API Available to Plugins
- `bridge.log` — Logging
- `bridge.auth` — `getUser()`, `isAuthenticated()`
- `bridge.db` — `read()`, `create()` (rate-limited: 50 req/s)
- `bridge.storage` — `get()`, `set()`
- `bridge.hooks` — `registerComponent()`, `addAction()`, `addFilter()`
- `bridge.http` — `request()` (rate-limited: 20 req/s, SSRF-protected)
- `bridge.webhook` — `on()`, `off()`
- `bridge.permissions` — `request()`

---

## 4. Theme Permission Request Cycle

```
ThemeLayout → ThemeDataService.validate("db.read.post")
         │
         ├─ (1) Check permission cache (10s TTL)
         │     └─ Cache HIT → return cached result
         │
         ├─ (2) Query DB: SELECT * FROM ThemePermission
         │     WHERE requesterTheme = activeTheme
         │     AND capability = "db.read.post"
         │
         ├─ (3a) Status = "approved" → cache result, return true
         │
         ├─ (3b) Status = "denied" → cache result, throw AUTH_FORBIDDEN
         │
         ├─ (3c) No record exists → auto-create "pending" request
         │     └─ Throw AUTH_FORBIDDEN (theme must be approved first)
         │
         └─ Admin → /admin/themes → Approve/Deny permission
               └─ Cache invalidated, next request succeeds
```

### Business Rules
- Permissions are per-theme, per-capability
- Self-permissions (theme requesting access to itself) are auto-approved
- Cache TTL: 10 seconds
- Cache invalidated on permission status change

---

## 5. Inter-Plugin Permission Flow

```
Plugin A → bridge.permissions.request("Plugin B", "read")
         │
         ├─ (1) Check if permission already exists
         │     └─ Status = "approved" → return true
         │
         ├─ (2) Create permission record:
         │     requesterPlugin: "Plugin A"
         │     providerPlugin: "Plugin B"
         │     capability: "read"
         │     status: "pending"
         │
         ├─ (3) Plugin A cannot access Plugin B's data yet
         │
         └─ Admin → /admin/plugins → Approve permission
               │
               └─ Plugin A can now call:
                    bridge.hooks.getFromOther("Plugin B", "key")
```

### Business Rules
- Each plugin has isolated storage (keyed by `pluginId`)
- Cross-plugin access requires explicit admin approval
- Self-permissions are auto-approved
- Capabilities: "read", "write", "manage"
- Unique constraint: `[requesterPlugin, providerPlugin, capability]`

---

## 6. SSRF Protection Flow (NetworkService)

```
Plugin → bridge.http.request({ url: "https://api.example.com/data" })
         │
         ├─ (1) URL Validation
         │     ├─ Block localhost/127.0.0.1/::1/0.0.0.0
         │     ├─ Block private IPs (10.x, 172.16-31.x, 192.168.x, 169.254.x)
         │     ├─ Block IPv6 private (fc00:, fd00:)
         │     └─ Check domain against PluginNetworkConfig.allowedDomains
         │
         ├─ (2) Rate Limiting
         │     └─ Per-plugin, configurable (default 20 req/s)
         │
         ├─ (3) Execute Request
         │     ├─ Timeout: configurable, max 30s
         │     ├─ Response size limit: 1MB
         │     └─ AbortController for timeout
         │
         └─ (4) Audit Log
               └─ Record to NetworkAuditLog (url, method, status, error, timestamp)
```

### Blocked IPs
- `127.0.0.1`, `localhost`, `::1`, `0.0.0.0`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `169.254.0.0/16`
- `fc00::/7`, `fd00::/8`

### Domain Whitelist
- Configured per-plugin in `PluginNetworkConfig.allowedDomains`
- Supports wildcards: `*.example.com`
- Empty list = all domains allowed (but SSRF protection still applies)
