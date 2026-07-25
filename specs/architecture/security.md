---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Security - BlackLotusCMS

## 1. Authentication

- **JWT via NextAuth v4:** JWT strategy with PrismaAdapter
- **CredentialsProvider:** Authentication via email + bcrypt password hash
- **Session Data:** Token contains user.id and user.role (with capabilities)
- **Custom Pages:** Login at /auth/login

## 2. Authorization (RBAC)

- **Capability System:** Each role has a JSON of capabilities (e.g., `{ "post": { "create": true } }`)
- **Administrator:** Automatic bypass - all capabilities return true
- **Nested Capabilities:** Support for dotted paths (e.g., "post.own.edit")
- **withApiAuth:** Consolidated middleware that checks NextAuth session or API Key headers
- **hasCapability:** Function that supports .own verification for personal resources

## 3. API Key Security

- **Generation:** Prefix `bl_` + 32 random bytes
- **Storage:** SHA-256 hash in database (plain text shown only once)
- **Rate Limiting:** In-memory cache with 1-minute window, configurable limit per key
- **Proxy Validation:** API keys are validated in the proxy before reaching routes

## 4. Input Validation

- **Zod Schemas:** All API inputs validated via Zod (src/schemas/)
- **Path Sanitization:** `sanitizePath()` removes `..`, `/`, `\` to prevent path traversal
- **HTML Sanitization:** DOMPurify with tag allowlist for user content
- **Slug Validation:** Regex `^[a-z0-9-]+$` for slugs

## 5. Data Protection

- **Sensitive Data Masking:** `maskSensitiveData()` removes passwordHash, secret, token, etc.
- **Theme Data Isolation:** Themes receive only sanitized data
- **Email Masking:** GraphQL hides email for users without "user.manage" capability
- **Plugin Data Sanitization:** Bridge API sanitizes data before returning to plugin

## 6. Infrastructure Security

- **Security Headers:** HSTS, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy
- **CSP Nonce:** Enabled via `CSP_NONCE_ENABLED=true` in production
- **Docker:** Container runs as user nextjs (non-root), multi-stage build
- **Standalone Output:** Next.js standalone minimizes attack surface
- **SSL:** Support for sslmode=verify-full for PostgreSQL
- **NEXTAUTH_SECRET mandatory:** App fails if not configured
- **ADMIN_PASSWORD validated:** Rejects weak defaults in production
- **API Key re-validated:** Injected headers are not trusted directly

## 7. Plugin Security

- **Sandboxed Plugins (isolated-vm):** Execute in isolated VM with memory limit and timeout
- **Compiled Plugins (Node.js):** Execute in the same process as Next.js, without V8 isolation
- **`sandbox` field:** plugin.json controls which loading method to use
- **Permission Gate:** Access to data and hooks requires approved permission
- **Rate Limit DB:** Limit of 50 queries/second per plugin (both modes)
- **Jitter:** Random delay between plugin requests
- **Forbidden Fields:** passwordHash, secret, apiKey, token always removed
- **Auto-registration:** Plugins in filesystem without database registration are auto-registered on boot

## 8. Theme Security

- **Permission Validation:** ThemeDataService validates permission before each access
- **CSS Scoping:** Themes operate within div.blacklotuscms-theme
- **AsyncLocalStorage:** Theme context is isolated by request
- **Content Sanitization:** Search queries are sanitized before passing to theme
