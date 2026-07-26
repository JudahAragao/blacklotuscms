# Plugin Development Guide

## Overview

BlackLotusCMS supports two types of plugins:

1. **Compiled Plugins** — live in `plugins/`, compiled alongside Next.js, can use npm packages
2. **Sandboxed Plugins** — uploaded via ZIP or placed manually, run in isolated-vm sandbox, pure JS (no npm)

Both types use the same `plugin.json` manifest format. The `sandbox` field controls execution mode.

## Compiled Plugins (Recommended)

Compiled plugins are part of the codebase and compiled at build time. They can use any npm package already in the project.

### Security Model

Compiled plugins execute in the **same V8 context** as the Next.js application. This is intentional — it allows plugins to use npm packages and have full Node.js API access.

**Trade-offs:**
- Full access to npm packages (resend, stripe, etc.)
- Native Node.js API access (fs, crypto, etc.)
- No memory/timeout limits (bounded only by host resources)
- No V8 sandbox isolation (code runs in main process)
- Cannot contain malicious code (trust boundary = codebase)

**Protection chain (same as imported plugins):**
1. `checkRateLimit()` — 50 DB queries/second max
2. `applyJitter()` — 1-5ms random delay
3. `hasPermission()` — permission gate per capability
4. `sanitizeData()` — forbidden fields removed from responses

**If you need V8 sandbox isolation**, use imported plugins (ZIP upload) instead.

### Plugin Structure
```
plugins/
└── my-plugin/
    ├── plugin.json         # Manifest (required)
    └── index.ts            # Entry point (TypeScript)
```

### plugin.json Manifest
```json
{
  "name": "email-manager",
  "version": "1.0.0",
  "description": "Email management with Resend",
  "sandbox": false,
  "permissions": ["db.read.post", "db.write.post", "http.outbound.request"],
  "npmDependencies": [
    { "name": "resend", "version": "^4.0.0" },
    { "name": "lodash", "version": "^4.17.21" }
  ]
}
```

**Fields:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Unique kebab-case identifier |
| `version` | string | Yes | - | Semver (x.y.z) |
| `description` | string | No | - | Short description |
| `sandbox` | boolean | No | `true` | `false` = compiled (direct Node.js), `true` = sandboxed (isolated-vm) |
| `permissions` | string[] | No | - | Required Bridge API permissions |
| `npmDependencies` | `{ name, version }[]` | No | - | npm packages used with semver ranges (informational) |

### Entry Point (index.ts)

The default export is a function that receives the `bridge` object:

```typescript
import { Resend } from 'resend';

export default async function init(bridge: any) {
  // Use bridge.db, bridge.http, bridge.storage, bridge.hooks, etc.

  bridge.hooks.addAction('post.created', async (post: any) => {
    const user = await bridge.db.findOne('User', { id: post.authorId });
    const apiKey = await bridge.storage.get('api_key');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'noreply@site.com',
      to: user.email,
      subject: `New post: ${post.title}`,
      html: `<h1>${post.title}</h1>`
    });
  });

  return { name: 'email-manager', version: '1.0.0' };
}
```

### Build & Activation

1. Add plugin to `plugins/my-plugin/` with `plugin.json` + `index.ts`
2. Run `npm run build` (or `npm run dev`) — plugin is compiled automatically
3. Go to Admin > Plugins
4. Click "Activate" on the compiled plugin
5. Approve required permissions in "Access Requests"

### Creating a Plugin (Scaffold)

Use the interactive script to generate a plugin scaffold:

```bash
bun run create-plugin
```

The script asks for name, version, description, permissions, and whether to use isolated-vm sandbox. It generates `plugin.json` + `index.ts` in `plugins/<name>/`.

### Filesystem Auto-Registration

Plugins placed manually in `plugins/` are auto-registered on next boot:

- `PluginService.boot()` scans the `plugins/` directory
- If a plugin has `plugin.json` + `index.ts` but no database record, it's auto-registered
- The `sandbox` field in `plugin.json` determines loading mode:
  - `sandbox: true` (default) → loaded via `PluginSandbox` (isolated-vm)
  - `sandbox: false` → loaded via `CompiledPluginLoader` (direct Node.js)

For compiled plugins (`sandbox: false`), run `npm run generate` after adding the plugin to update the registry.

### How It Works

- `scripts/generate-plugin-registry.mjs` discovers plugins and generates `src/generated/plugin-registry.ts`
- Next.js compiles the plugin alongside the CMS at build time
- `CompiledPluginLoader` loads the plugin with a Proxy-based bridge
- The bridge controls all access (db, http, storage, hooks, etc.)

## Sandboxed Plugins (isolated-vm)

Sandboxed plugins run in an isolated V8 sandbox. They cannot use npm packages — only pure JavaScript + the Bridge API.

### Plugin Structure
```
plugins/
└── my-plugin/
    ├── plugin.json         # Manifest (required, sandbox: true)
    └── index.js            # Entry point
```

### plugin.json Manifest
```json
{
  "name": "seo-optimizer",
  "version": "1.0.0",
  "description": "Automatically optimize SEO metadata for posts",
  "sandbox": true,
  "author": "Developer Name",
  "entry": "index.js",
  "permissions": ["db.read.post", "db.write.post"]
}
```

### Installation Methods

**Via ZIP Upload:**
1. Admin > Plugins > IMPORT EXTENSION
2. Select `.zip` file
3. Plugin extracted to `plugins/<name>/`
4. Activate via Admin > Plugins

**Via Manual Placement:**
1. Create `plugins/my-plugin/` with `plugin.json` + `index.js`
2. On next boot, `PluginService.boot()` auto-registers it in the database
3. Activate via Admin > Plugins

## Real Examples

### Example 1: SEO Auto-Optimizer
```javascript
// plugins/seo-optimizer/index.js
bridge.log('SEO Optimizer plugin loaded!');

// Auto-generate SEO description from content
bridge.hooks.addFilter('post.before_validate', (data) => {
  if (!data.seoDescription && data.content) {
    // Strip HTML and take first 160 chars
    const plainText = data.content.replace(/<[^>]*>/g, '');
    data.seoDescription = plainText.substring(0, 160).trim() + '...';
  }
  
  // Auto-generate slug from title if not provided
  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  return data;
});

// Log when posts are published
bridge.hooks.addAction('post.created', (post) => {
  if (post.status === 'published') {
    bridge.log(`New published post: ${post.title}`);
  }
});
```

### Example 2: Content Analytics
```javascript
// plugins/content-analytics/index.js
bridge.log('Content Analytics loaded!');

const STORAGE_KEY = 'analytics_data';

// Track post views (would need client-side integration)
bridge.hooks.addAction('post.viewed', async (data) => {
  const analytics = await bridge.storage.get(STORAGE_KEY) || { views: {} };
  
  if (!analytics.views[data.postId]) {
    analytics.views[data.postId] = 0;
  }
  analytics.views[data.postId]++;
  
  await bridge.storage.set(STORAGE_KEY, analytics);
});

// Add view count to post data
bridge.hooks.addFilter('post.meta', async (meta, post) => {
  const analytics = await bridge.storage.get(STORAGE_KEY) || { views: {} };
  meta.viewCount = analytics.views[post.id] || 0;
  return meta;
});
```

### Example 3: Spam Filter
```javascript
// plugins/advanced-spam-filter/index.js
bridge.log('Advanced Spam Filter loaded!');

const BLACKLIST = ['buy now', 'click here', 'free money', 'act now'];
const MAX_LINKS = 3;

// Enhance comment spam detection
bridge.hooks.addFilter('comment.before_save', (comment) => {
  const content = comment.content.toLowerCase();
  
  // Check for blacklisted phrases
  for (const phrase of BLACKLIST) {
    if (content.includes(phrase)) {
      comment.status = 'spam';
      bridge.log(`Spam detected: "${phrase}" in comment by ${comment.author}`);
      return comment;
    }
  }
  
  // Check link count
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > MAX_LINKS) {
    comment.status = 'spam';
    bridge.log(`Too many links (${linkCount}) in comment by ${comment.author}`);
  }
  
  return comment;
});
```

### Example 4: External API Integration (HTTP Outbound)
```javascript
// plugins/slack-notifier/index.js
bridge.log('Slack Notifier loaded!');

// Notify Slack when new post is published
bridge.hooks.addAction('post.created', async (post) => {
  if (post.status === 'published') {
    const webhookUrl = await bridge.storage.get('slack_webhook');
    if (!webhookUrl) return;

    const response = await bridge.http.request({
      url: webhookUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `New post published: ${post.title}`,
        slug: post.slug,
      }),
      timeout: 10000,
    });

    if (response.status === 200) {
      bridge.log('Slack notification sent successfully');
    } else {
      bridge.log('Slack notification failed:', response.status);
    }
  }
});
```

### Example 5: Webhook Receiver (Inbound)
```javascript
// plugins/payment-processor/index.js
bridge.log('Payment Processor loaded!');

// Register webhook handler for payment events
bridge.webhook.on('payment.completed', async (payload) => {
  bridge.log('Payment received:', payload.data);
  
  // Process the payment data
  const { orderId, amount, status } = payload.data;
  
  // Store payment record
  await bridge.db.create('Setting', {
    key: `payment_${orderId}`,
    value: { amount, status, processedAt: new Date().toISOString() }
  });
  
  // Notify admin via hook
  await bridge.hooks.addAction('payment.processed', payload.data);
  
  return { success: true };
});

// Register another webhook for refunds
bridge.webhook.on('payment.refunded', async (payload) => {
  bridge.log('Refund processed:', payload.data);
  // Handle refund logic...
  return { success: true };
});
```

## Bridge API Reference

### bridge.log(...args)
Logs messages to the CMS logger.
```javascript
bridge.log('Info message');
bridge.log('Error:', error);
```

### bridge.auth
| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `getUser()` | User object or null | `system.auth.read` |
| `isAuthenticated()` | boolean | `system.auth.read` |

```javascript
const user = await bridge.auth.getUser();
if (user) {
  bridge.log(`Logged in as: ${user.email}`);
}
```

### bridge.db
| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `read(model, query)` | Array of records | `db.read.{model}` |
| `findOne(model, where)` | Single record or null | `db.read.{model}` |
| `create(model, data)` | Created record | `db.write.{model}` |
| `update(model, where, data)` | Updated record | `db.write.{model}` |
| `updateMany(model, where, data)` | `{ count }` | `db.write.{model}` |
| `delete(model, where)` | Deleted record | `db.write.{model}` |
| `deleteMany(model, where)` | `{ count }` | `db.write.{model}` |
| `upsert(model, where, create, update)` | Created or updated record | `db.write.{model}` |
| `transaction(callback)` | Callback return value | `db.write.*` |

**Available Models:** User, Post, PostType, Media, Comment, Setting, etc.

```javascript
// Read posts
const posts = await bridge.db.read('Post', {
  where: { status: 'published' },
  take: 10
});

// Find one post by slug
const post = await bridge.db.findOne('Post', { slug: 'my-post' });

// Create a setting
await bridge.db.create('Setting', {
  key: 'my_plugin_setting',
  value: { enabled: true }
});

// Update a post
const updated = await bridge.db.update('Post',
  { id: 'post-uuid-here' },
  { status: 'published', publishedAt: new Date().toISOString() }
);

// Update multiple records
const { count } = await bridge.db.updateMany('Post',
  { postTypeId: 'product-type-uuid' },
  { status: 'archived' }
);

// Delete a comment
await bridge.db.delete('Comment', { id: 'comment-uuid-here' });

// Delete multiple comments
const { count: deleted } = await bridge.db.deleteMany('Comment',
  { postId: 'post-uuid-here', status: 'spam' }
);

// Upsert (create or update)
const cart = await bridge.db.upsert('Setting',
  { key: 'cart_user123' },
  { key: 'cart_user123', value: { items: [] } },
  { value: { items: [...existingItems, newItem] } }
);

// Transaction (atomic operations)
await bridge.db.transaction(async (tx) => {
  const post = await tx.findOne('Post', { id: postId });
  await tx.update('Post', { id: postId }, { status: 'sold' });
  await tx.updateMany('Post',
    { id: { in: relatedIds } },
    { status: 'archived' }
  );
  await tx.create('Setting', {
    key: `order_${orderId}`,
    value: { postId, timestamp: Date.now() }
  });
});
```

### bridge.storage
| Method | Returns | Description |
|--------|---------|-------------|
| `set(key, value)` | void | Store plugin data |
| `get(key)` | value or null | Retrieve plugin data |

```javascript
// Store settings
await bridge.storage.set('config', {
  apiKey: 'xxx',
  enabled: true
});

// Retrieve settings
const config = await bridge.storage.get('config');
```

### bridge.hooks
| Method | Description | Permission Required |
|--------|-------------|---------------------|
| `addAction(name, callback)` | Register event handler | - |
| `addFilter(name, callback)` | Register data transformer | - |
| `registerComponent(slot, component, priority?)` | Register UI component in slot | - (public.route slots require permission) |
| `registerAdminNav(navItem)` | Register admin sidebar navigation | `system.ui.register.admin_nav` |

#### bridge.hooks.registerAdminNav

Registers a navigation item in the admin sidebar. Requires `system.ui.register.admin_nav` permission.

```javascript
// Register a sidebar navigation item
bridge.hooks.registerAdminNav({
  href: '/admin/plugins/my-plugin/settings',
  label: 'My Plugin Settings',
  icon: 'settings',  // optional
  priority: 10        // optional, lower = higher in sidebar
});

// Register with custom component
bridge.hooks.registerAdminNav({
  href: '/admin/plugins/my-plugin',
  label: 'My Plugin',
  component: MyPluginNavComponent  // custom React component
});
```

**Admin Sidebar Slots:**
| Slot | Description |
|------|-------------|
| `admin.sidebar.top` | Top of sidebar (before Dashboard) |
| `admin.sidebar.plugins` | Plugin navigation section (after System items) |
| `admin.sidebar.menu_after` | After system menu items |
| `admin.sidebar.bottom` | Bottom of sidebar (before user control) |

### bridge.http (Outbound HTTP)

Executes external HTTP requests on behalf of the plugin. Requires `http.outbound.request` permission.

| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `request(config)` | `{ status, headers, body }` | `http.outbound.request` |

```javascript
// GET request
const response = await bridge.http.request({
  url: 'https://api.example.com/data',
  method: 'GET',
});

// POST request with body
const response = await bridge.http.request({
  url: 'https://api.stripe.com/charges',
  method: 'POST',
  headers: { 'Authorization': 'Bearer sk_test_xxx' },
  body: { amount: 2000, currency: 'usd' },
  timeout: 15000,
});

bridge.log('Status:', response.status);
bridge.log('Body:', response.body);
```

**Security:**
- Domains must be on the allowlist configured by the admin; if not, the system automatically creates a pending `http.domain.{hostname}` permission that the admin can approve
- Blocking of internal IPs (127.0.0.1, 10.*, 192.168.*, etc.)
- Separate rate limit: 20 req/s (configurable)
- Timeout: 10s default, max 30s
- Maximum response size: 1MB

### bridge.webhook (Inbound Webhooks)

Registers handlers to receive external webhooks. Requires `webhook.inbound.register` permission.

| Method | Description | Permission Required |
|--------|-------------|---------------------|
| `on(eventId, callback)` | Register webhook handler | `webhook.inbound.register` |
| `off(eventId)` | Remove webhook handler | - |

```javascript
// Register handler for payment events
bridge.webhook.on('payment.completed', async (payload) => {
  bridge.log('Payment received:', payload.data);
  
  const { orderId, amount } = payload.data;
  await bridge.db.create('Setting', {
    key: `payment_${orderId}`,
    value: { amount, processedAt: new Date().toISOString() }
  });
  
  return { success: true };
});

// Register handler for user registration
bridge.webhook.on('user.registered', async (payload) => {
  bridge.log('New user:', payload.data.email);
  // Send welcome email, create profile, etc.
});
```

**Generated endpoint:** `POST /api/v1/webhooks/:pluginName/:eventId`
**Security:**
- HMAC-SHA256 verification (if webhookSecret is configured)
- Maximum payload size: 2MB
- Automatic retry with exponential backoff (up to 3 attempts)

### bridge.routes (Dynamic Routes)

Registers custom routes that the CMS resolves before the default logic. Requires `system.route.register` permission.

| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `register(config)` | void | `system.route.register` |

```javascript
// Register a static route
bridge.routes.register({
  path: '/checkout',
  template: 'page.checkout',
  handler: async (ctx) => {
    // ctx.params = {} (no params for static routes)
    // ctx.userId = current user ID (if logged in)
    const cart = await bridge.storage.get(`cart_${ctx.userId}`);
    const user = ctx.userId
      ? await bridge.db.findOne('User', { id: ctx.userId })
      : null;
    return { cart, user };
  }
});

// Register a dynamic route with params
bridge.routes.register({
  path: '/product/:slug',
  template: 'post.product',
  handler: async (ctx) => {
    // ctx.params = { slug: "blue-shirt" }
    const product = await bridge.db.findOne('Post', { slug: ctx.params.slug });
    return { product };
  }
});

// Register a route with multiple params
bridge.routes.register({
  path: '/user/:id/orders',
  template: 'page.user-orders',
  handler: async (ctx) => {
    // ctx.params = { id: "user-uuid" }
    const orders = await bridge.db.read('Post', {
      where: { authorId: ctx.params.id, postTypeId: 'order' }
    });
    return { orders };
  }
});
```

**Route resolution order:**
1. Plugin routes (registered via `bridge.routes.register`)
2. Theme routes (declared in `routes.json`)
3. Default theme routes (fallback)
4. Existing CMS logic (single post, archive, etc.)

**Handler context (`ctx`):**
| Property | Type | Description |
|----------|------|-------------|
| `params` | `Record<string, string>` | Extracted route params (e.g., `{ slug: "blue-shirt" }`) |
| `userId` | `string \| undefined` | Current user ID (if authenticated) |
| `role` | `{ name: string; capabilities: any } \| null` | User's role with capabilities (if authenticated) |

**Template naming convention:**
- `page.checkout` → `layouts/page.checkout.tsx` (page-style route)
- `post.product` → `layouts/post.product.tsx` (post-style route)
- Follows existing theme engine hierarchy: `page.{name}` or `post.{name}`

### Customer Auth Pattern (Option B)

E-commerce plugins can create separate customer authentication using the Bridge API:

```javascript
// 1. Create Customer role on plugin activation
bridge.hooks.addAction('plugin.activated', async () => {
  const existing = await bridge.db.findOne('Role', { name: 'Customer' });
  if (!existing) {
    await bridge.db.create('Role', {
      name: 'Customer',
      capabilities: {
        order: { read: true, create: true },
        address: { manage: true },
        profile: { update: true }
      }
    });
  }
});

// 2. Register login/register routes
bridge.routes.register({
  path: '/login',
  template: 'page.login',
  handler: async (ctx) => {
    if (ctx.userId) return { redirect: '/account' };
    return {};
  }
});

// 3. Use ctx.role to check permissions in any route
bridge.routes.register({
  path: '/account',
  template: 'page.account',
  handler: async (ctx) => {
    if (!ctx.userId) return { redirect: '/login' };

    // Check if user is a Customer
    if (ctx.role?.name !== 'Customer') {
      return { error: 'Access denied' };
    }

    const user = await bridge.db.findOne('User', { id: ctx.userId });
    const orders = await bridge.db.read('Post', {
      where: { authorId: ctx.userId, postTypeId: 'order' }
    });
    return { user, orders };
  }
});

// 4. Full user data with role include
bridge.routes.register({
  path: '/profile',
  template: 'page.profile',
  handler: async (ctx) => {
    if (!ctx.userId) return { redirect: '/login' };

    // ctx.role already has role info, but for full user data:
    const user = await bridge.db.findOne('User', { id: ctx.userId });
    // user includes all fields except passwordHash (sanitized)
    return { user, role: ctx.role };
  }
});
```

**Key points:**
- `ctx.role` is automatically populated — no extra query needed for role checks
- `ctx.role.capabilities` contains the JSON capabilities object for fine-grained permission checks
- Plugins can create their own Roles via `bridge.db.create('Role', ...)`
- `bridge.db.findOne('User', { id })` returns user data with role info (passwordHash is sanitized)

### bridge.permissions
| Method | Description |
|--------|-------------|
| `request(capability)` | Request permission from admin |

```javascript
// Request permission before using protected features
await bridge.permissions.request('db.write.user');
```

## Available Hooks

### Actions (Events)
| Hook | Trigger | Data |
|------|---------|------|
| `post.created` | After post creation | Post object |
| `post.updated` | After post update | Post object |
| `post.deleted` | After post deletion | Post object |
| `user.updated` | After user update | User object |

### Filters (Data Transformation)
| Hook | Trigger | Modifies |
|------|---------|----------|
| `post.before_validate` | Before post validation | Post data |
| `comment.before_save` | Before comment save | Comment data |
| `content.title` | Title rendering | Title string |
| `route_access` | Route access check | Access boolean |

## Sandboxing

| Setting | Default | Description |
|---------|---------|-------------|
| Memory Limit | 512MB | Max memory per plugin |
| Timeout | 30s | Max execution time |
| Rate Limit | 50 req/s | DB queries per second |

### Security: Rate Limit as Protection Mechanism

All database access via Bridge API goes through a security chain:

```
Bridge API call → checkRateLimit() → applyJitter() → hasPermission() → database query
```

- **`checkRateLimit()`** is called **before** any permission check. If the plugin exceeds 50 queries/s, the request is blocked with `429 RATE_LIMIT_EXCEEDED` — without reaching the database.
- **`applyJitter()`** adds a random 1-5ms delay between calls to mitigate thundering herd.
- **`hasPermission()`** is only consulted after passing the rate limit, avoiding unnecessary database queries.

This means a malicious plugin generates at most 50 queries/s to the database (including permission checks and data operations), and the rate limit is the primary protection mechanism against resource abuse.

**Forbidden Fields:** `passwordHash`, `secret`, `token`, `apiKey` - always removed from data.

## Permissions

Plugins must request permission for:
- Database access (`db.read.*`, `db.write.*`)
- Auth access (`system.auth.read`)
- Sensitive hooks (`route_access`)

Permissions are managed via Admin > Plugins > Permissions.

## Installation

### Via ZIP Upload (Recommended)
1. Access Admin > Plugins
2. Click "IMPORT EXTENSION"
3. Select a `.zip` file containing the plugin
4. The plugin will be automatically extracted to `/opt/apps/shared/plugins/<plugin-name>/`
5. Activate the plugin via Admin > Plugins
6. Approve the requested permissions in the Permissions tab

### Via Manual Upload
1. Create a folder in `plugins/my-plugin/` on the server
2. Add the `plugin.json` manifest
3. Add the entry file (`index.js` or as defined in `manifest.entry`)
4. Restart the application
5. Activate the plugin via Admin > Plugins

### ZIP Requirements
- The file must be a valid `.zip`
- Must contain a `plugin.json` at root or in a subfolder
- Must contain the entry file (`index.js` by default)
- The plugin folder name is derived from the file name (sanitized: lowercase, spaces → hyphens)

### Persistence
Plugins are installed in `/opt/apps/shared/plugins/` (shared volume between blue/green). Data persists across restarts and redeployments.

## Security

- Code executes in isolated-vm sandbox
- No direct filesystem/network access
- All DB queries go through permission-gated Bridge
- Sensitive data sanitized before returning
- Rate limited to prevent abuse
- Memory and timeout limits enforced
