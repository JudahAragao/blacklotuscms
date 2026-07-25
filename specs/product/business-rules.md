---
spec_version: "1.4"
last_updated: "2026-07-17"
author: "BlackLotusCMS Team"
status: approved
---

# Business Rules - BlackLotusCMS

## BR01: Post Visibility
- **IF** a post has status "draft" OR publishedAt in the future
- **THEN** it does not appear in public queries nor in the sitemap
- **OTHERWISE** if expiresAt is defined and less than now(), the post is also hidden
- **Reference:** FR05, FR17

## BR02: Contributor Draft Lock
- **IF** the user has role "Contributor"
- **THEN** every post created receives status "draft" regardless of input
- **OTHERWISE** the provided status is respected
- **Reference:** FR05, FR22

## BR03: Admin Full Access
- **IF** the user has role "Administrator"
- **THEN** all capability checks return true
- **OTHERWISE** the check follows the JSON capabilities hierarchy
- **Reference:** FR02

## BR04: Own Resource Protection
- **IF** a user tries to edit/delete a post by another author
- **THEN** they need the "post.manage" capability
- **OTHERWISE** with "post.own.update", they can edit their own posts
- **Reference:** FR05, FR22

## BR05: Plugin Sandboxing
- **IF** a plugin is activated
- **THEN** its code runs in isolate-vm with memory and timeout limits
- **OTHERWISE** if limits are exceeded, the plugin is deactivated and error is logged
- **Reference:** FR10

## BR06: Plugin Permission Gate
- **IF** a plugin tries to access sensitive data or hooks
- **THEN** the system checks for approved permission for that capability
- **OTHERWISE** permission is requested and access is blocked until approval
- **Reference:** FR10, FR12

## BR07: Theme Permission Validation
- **IF** a theme tries to access system data
- **THEN** the ThemeDataService validates approved permission
- **OTHERWISE** permission is requested and access is blocked
- **Reference:** FR11

## BR08: API Key Rate Limiting
- **IF** a request via API Key exceeds the configured rate limit
- **THEN** returns 429 with code RATE_LIMIT_EXCEEDED
- **OTHERWISE** the request counter is incremented in the 1-minute window
- **Reference:** FR03, FR24

## BR09: Comment Anti-Spam
- **IF** a comment contains more than 2 URLs or blacklist words
- **THEN** the status is set to "spam" automatically
- **OTHERWISE** if auto_approve_comments is active, the status is "approved"
- **Reference:** FR14, FR15

## BR10: Installation Gate
- **IF** the system is not installed (no .installed file)
- **THEN** all routes redirect to /install except /assets
- **OTHERWISE** the /install route redirects to /auth/login
- **Reference:** FR20

## BR11: HTML Sanitization
- **IF** a hook filter processes content (title, content, body, etc.)
- **THEN** the result is sanitized with DOMPurify automatically
- **OTHERWISE** the content is passed without sanitization
- **Reference:** FR25

## BR12: Sensitive Data Masking
- **IF** data are passed to themes or public APIs
- **THEN** sensitive fields (passwordHash, secret, token, etc.) are removed
- **OTHERWISE** the data are preserved as they are
- **Reference:** FR25

## BR13: Post Expiration
- **IF** a post has `expiresAt` defined AND `expiresAt < now()`
- **THEN** it does not appear in public queries, sitemap, or search
- **OTHERWISE** the post is visible normally (if status = "published" and publishedAt <= now())
- **Reference:** FR05, FR17
- **Implementation:** `PostService.ts` — queries filter by `expiresAt: null OR expiresAt >= now()`

## BR14: LGPD Data Export (Art. 15, 20)
- **IF** a user requests data export
- **THEN** the system returns: profile (email, role, image, dates), created posts, API key metadata (name, creation date, last use — never the key itself)
- **OTHERWISE** only admins can export other users' data
- **Reference:** FR22, COMPLIANCE.md
- **Implementation:** `UserService.exportData()` — via `GET /api/v1/users/:id`

## BR15: LGPD Account Deletion (Art. 17)
- **IF** a user requests account deletion
- **THEN** cascade delete: postTerms → metaValues → comments → posts → apiKeys → user
- **OTHERWISE** it is not possible to delete the last user with role "Administrator"
- **Reference:** FR22, COMPLIANCE.md
- **Implementation:** `UserService.deleteAccount()` — via `DELETE /api/v1/users/:id`

## BR16: API Key Security
- **IF** an API key is created
- **THEN** only the SHA-256 hash is stored in the database, with prefix `bl_` + 64 hex chars
- **OTHERWISE** the plain text key is returned once at creation — never again
- **Reference:** FR03, FR21
- **Implementation:** `ApiKeyService.ts` — `createKey()` returns plain key, `validateKey()` compares hash

## BR17: Plugin DB Rate Limit
- **IF** a plugin exceeds 50 database requests per second
- **THEN** the request is blocked with error RATE_LIMIT_EXCEEDED
- **OTHERWISE** each database access has random jitter of 1-5ms to avoid thundering herd
- **Reference:** FR10
- **Implementation:** `PluginService.ts` — Bridge API `db.read` and `db.create` are rate-limited

## BR18: Webhook Retry
- **IF** an inbound webhook fails processing
- **THEN** the system retries with exponential backoff: 1s → 2s → 4s (maximum 3 attempts)
- **OTHERWISE** after 3 failures, the webhook is logged as failed in `NetworkAuditLog`
- **Reference:** FR10
- **Implementation:** `NetworkService.receiveWebhook()` — retry loop with exponential backoff

## BR19: Theme Permission Cache
- **IF** a theme accesses system data via `ThemeDataService.get()`
- **THEN** permission validation uses cache with 10-second TTL
- **OTHERWISE** cache is invalidated when permission changes status (approved/denied)
- **Reference:** FR11
- **Implementation:** `ThemeDataService.ts` — `permissionCache` Map with 10s TTL

## BR20: Comment IP Capture
- **IF** a comment is created via public API
- **THEN** the author's IP address is captured and stored in the `ip` field
- **OTHERWISE** the IP is used for spam identification (same IP, multiple comments)
- **Reference:** FR14
- **Implementation:** `CommentService.create()` — receives `ip` param, stores in DB

## BR21: Default Taxonomies (WordPress Parity)
- **IF** auto-install is executed (empty database)
- **THEN** 2 taxonomies are automatically created for the `post` post type:
  - `category` (Categories) — hierarchical taxonomy
  - `post_tag` (Tags) — flat taxonomy
- **OTHERWISE** the `page` post type does not receive default taxonomies (same as WordPress)
- **Reference:** FR07
- **Implementation:** `init.ts` — `autoInstall()` creates taxonomies after creating post types
