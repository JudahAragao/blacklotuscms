# Plugin Development Guide

## Overview
Plugins extend BlackLotusCMS via isolated sandbox execution (isolated-vm) com a secure Bridge API.

## Plugin Structure
```
plugins/
└── my-plugin/
    ├── plugin.json         # Manifest (required)
    ├── index.js            # Entry point
    └── package.json        # Optional dependencies info
```

## plugin.json Manifest
```json
{
  "name": "seo-optimizer",
  "version": "1.0.0",
  "description": "Automatically optimize SEO metadata for posts",
  "author": "Developer Name",
  "entry": "index.js",
  "permissions": ["db.read.post", "db.write.post"]
}
```

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

### Example 4: External API Integration
```javascript
// plugins/slack-notifier/index.js
bridge.log('Slack Notifier loaded!');

const WEBHOOK_URL = await bridge.storage.get('slack_webhook');

// Notify Slack when new post is published
bridge.hooks.addAction('post.created', async (post) => {
  if (post.status === 'published' && WEBHOOK_URL) {
    try {
      // Note: Direct fetch not available in sandbox
      // Would need Bridge API extension for HTTP requests
      bridge.log(`Would notify Slack about: ${post.title}`);
    } catch (error) {
      bridge.log('Failed to notify Slack:', error);
    }
  }
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
| `getUser()` | User object or null | `sistema.auth.read` |
| `isAuthenticated()` | boolean | `sistema.auth.read` |

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
| `create(model, data)` | Created record | `db.write.{model}` |

**Available Models:** User, Post, PostType, Media, Comment, Setting, etc.

```javascript
// Read posts
const posts = await bridge.db.read('Post', {
  where: { status: 'published' },
  take: 10
});

// Create a setting
await bridge.db.create('Setting', {
  key: 'my_plugin_setting',
  value: { enabled: true }
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
| Method | Description |
|--------|-------------|
| `addAction(name, callback)` | Register event handler |
| `addFilter(name, callback)` | Register data transformer |
| `registerComponent(slot, component, priority?)` | Register UI component |

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
| `route_access` | Route access check | Acesso boolean |

## Sandboxing

| Setting | Default | Description |
|---------|---------|-------------|
| Memory Limit | 512MB | Max memory per plugin |
| Timeout | 30s | Max execution time |
| Rate Limit | 50 req/s | DB queries per second |

### Security: Rate Limit como Firewall

Todo acesso ao banco via Bridge API passa por uma cadeia de segurança:

```
Bridge API call → checkRateLimit() → applyJitter() → hasPermission() → query ao banco
```

- **`checkRateLimit()`** é chamado **antes** de qualquer verificação de permissão. Se o plugin exceder 50 queries/s, a requisição é bloqueada com `429 RATE_LIMIT_EXCEEDED` — sem chegar ao banco.
- **`applyJitter()`** adiciona um delay aleatório de 1-5ms entre chamadas para mitigar thundering herd.
- **`hasPermission()`** só é consultado após passar pelo rate limit, evitando queries desnecessárias ao banco.

Isso significa que um plugin malicioso gera no máximo 50 queries/s ao banco (incluindo permission checks e operações de dados), e o rate limit é o firewall real contra DoS.

**Forbidden Fields:** `passwordHash`, `secret`, `token`, `apiKey` - always removed from data.

## Permissions

Plugins must request permission for:
- Database access (`db.read.*`, `db.write.*`)
- Auth access (`sistema.auth.read`)
- Sensitive hooks (`route_access`)

Permissions are managed via Admin > Plugins > Permissions.

## Instalacao

### Via Admin Panel
1. Create ZIP com `plugin.json` and `index.js`
2. Admin > Plugins > Upload ZIP
3. Click Activate
4. Approve requested permissions in Permissions tab

### Manual Instalacao
1. Create folder in `plugins/my-plugin/`
2. Add `plugin.json` and `index.js`
3. Restart the application
4. Activate via Admin panel

## Security

- Code executes in isolated-vm sandbox
- No direct filesystem/network access
- All DB queries go through permission-gated Bridge
- Sensitive data sanitized before returning
- Rate limited to prevent abuse
- Memory and timeout limits enforced
