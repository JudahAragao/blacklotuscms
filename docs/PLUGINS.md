# Plugin Development Guide

## Overview
Plugins extend BlackLotusCMS via isolated sandbox execution (isolated-vm) with a secure Bridge API.

## Plugin Structure
```
plugins/
└── my-plugin/
    ├── plugin.json         # Manifest (required)
    └── index.js            # Entry point
```

## plugin.json Manifest
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Developer Name",
  "entry": "index.js",
  "permissions": ["db.read.post", "system.auth.read"]
}
```

## Entry Point (index.js)
```javascript
// Access Bridge API via global 'bridge' object
bridge.log('Plugin initialized!');

// Register hooks
bridge.hooks.addAction('post.created', (data) => {
  bridge.log('New post:', data.title);
});

bridge.hooks.addFilter('content.title', (title) => {
  return title.toUpperCase();
});

// Access storage
await bridge.storage.set('myKey', { setting: true });
const value = await bridge.storage.get('myKey');

// Access database (requires permission)
const posts = await bridge.db.read('Post', { where: { status: 'published' } });

// Access auth
const user = await bridge.auth.getUser();
const isAuth = await bridge.auth.isAuthenticated();
```

## Bridge API Reference

### bridge.log(...args)
Logs messages to the CMS logger.

### bridge.auth
| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `getUser()` | User object or null | `system.auth.read` |
| `isAuthenticated()` | boolean | `system.auth.read` |

### bridge.db
| Method | Returns | Permission Required |
|--------|---------|---------------------|
| `read(model, query)` | Array of records | `db.read.{model}` |
| `create(model, data)` | Created record | `db.write.{model}` |

**Models:** User, Post, PostType, Media, Comment, Setting, etc.

### bridge.storage
| Method | Returns |
|--------|---------|
| `set(key, value)` | void |
| `get(key)` | value or null |

### bridge.hooks
| Method | Description |
|--------|-------------|
| `addAction(name, callback)` | Register action handler |
| `addFilter(name, callback)` | Register filter handler |
| `registerComponent(slot, component, priority?)` | Register UI component |

### bridge.permissions
| Method | Description |
|--------|-------------|
| `request(capability)` | Request permission from admin |

## Hooks

### Actions (Events)
Triggered at specific points:
- `post.created` - After post creation
- `post.updated` - After post update
- `post.deleted` - After post deletion
- `user.updated` - After user update

### Filters (Data Transformation)
Modify data in pipeline:
- `post.before_validate` - Before post validation
- `content.title` - Transform post title
- `route_access` - Control route access

## Sandboxing
- **Memory Limit:** Configurable (default 512MB)
- **Timeout:** Configurable (default 30s)
- **Rate Limit:** 50 DB queries/second per plugin
- **Forbidden Fields:** passwordHash, secret, token always removed

## Permissions
Plugins must request permission for:
- Database access (`db.read.*`, `db.write.*`)
- Auth access (`system.auth.read`)
- Sensitive hooks (`route_access`)

Permissions are managed via Admin > Plugins > Permissions.

## Installation
1. Create ZIP with plugin.json and index.js
2. Admin > Plugins > Upload
3. Activate plugin
4. Approve requested permissions

## Security
- Code executes in isolated-vm sandbox
- No direct filesystem/network access
- All DB queries go through permission-gated Bridge
- Sensitive data is sanitized before returning to plugin
