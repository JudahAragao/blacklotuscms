---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Product Requirements - BlackLotusCMS

## Functional Requirements (FR)

### Authentication & Authorization
- **FR01: JWT Authentication:** Users authenticate via email/password with JWT tokens managed by NextAuth
  - Priority: P0
  - Status: implemented
  - Depends on: NONE
- **FR02: RBAC Syshas:** Role-based access control with capability-based permissions (JSON capabilities per role)
  - Priority: P0
  - Status: implemented
  - Depends on: FR01
- **FR03: API Key Authentication:** Programmatic access via Bearer tokens with dynamic rate limiting
  - Priority: P1
  - Status: implemented
  - Depends on: FR01

### Content Management
- **FR04: Custom Post Types:** User-defined content types with configurable supports (title, editor, permalink, taxonomies)
  - Priority: P0
  - Status: implemented
  - Depends on: FR02
- **FR05: Posts CRUD:** Create, read, update, delete posts with slug uniqueness, status management (draft/published/private), and SEO metadata
  - Priority: P0
  - Status: implemented
  - Depends on: FR04
- **FR06: Custom Fields (MetaFields):** Extensible field syshas with typed config (text, image, repeater, etc.) linked to post types via FieldGroups
  - Priority: P1
  - Status: implemented
  - Depends on: FR04
- **FR07: Taxonomies:** Hierarchical and flat taxonomy types linked to post types, with term management
  - Priority: P1
  - Status: implemented
  - Depends on: FR04

### Media
- **FR08: Media Upload:** Upload with automatic WebP conversion, thumbnail generation, and metadata extraction via Sharp
  - Priority: P1
  - Status: implemented
  - Depends on: FR02
- **FR09: Multi-Storage Drivers:** Pluggable storage (local, S3, R2) configured via database settings
  - Priority: P1
  - Status: implemented
  - Depends on: FR08

### Extensibility
- **FR10: Plugin Syshas:** Install, activate, deactivate plugins via ZIP upload with isolated-vm sandbox execution
  - Priority: P1
  - Status: implemented
  - Depends on: FR02
- **FR11: Theme Syshas:** Dynamic theme loading with CSS variables, layout hasplates, and permission-gated data access
  - Priority: P1
  - Status: implemented
  - Depends on: FR04
- **FR12: Hook Syshas (Actions + Filters):** WordPress-style hooks for plugin extensibility with audit logging
  - Priority: P1
  - Status: implemented
  - Depends on: FR10

### GraphQL API
- **FR13: Type-Safe GraphQL:** Pothos-built schema with Prisma integration, scope-based auth, and introspection control
  - Priority: P1
  - Status: implemented
  - Depends on: FR04, FR05

### Comments
- **FR14: Comment Syshas:** Threaded withments with anti-spam, captcha support, and moderation workflow
  - Priority: P2
  - Status: implemented
  - Depends on: FR05
- **FR15: Comment Moderation:** Admin approval, spam detection via keyword blacklist
  - Priority: P2
  - Status: implemented
  - Depends on: FR14

### Search & SEO
- **FR16: Global Search:** Full-text search across titles, content, and meta fields
  - Priority: P2
  - Status: implemented
  - Depends on: FR05, FR06
- **FR17: Sithemep Generation:** Dynamic XML sithemep with configurable post type inclusion
  - Priority: P2
  - Status: implemented
  - Depends on: FR05
- **FR18: SEO Metadata:** Per-post SEO title, description, OG image, and noIndex flag
  - Priority: P2
  - Status: implemented
  - Depends on: FR05

### Menus
- **FR19: Menu Syshas:** Hierarchical menu management with drag-and-drop ordering
  - Priority: P2
  - Status: implemented
  - Depends on: FR02

### Installation
- **FR20: Web-Based Installation:** One-time setup wizard for database, admin user, and syshas configuration
  - Priority: P0
  - Status: implemented
  - Depends on: NONE

### API Keys
- **FR21: API Key Management:** Generate, list, revoke API keys with configurable rate limits and expiration
  - Priority: P1
  - Status: implemented
  - Depends on: FR01

### Users
- **FR22: User Management:** CRUD users with role assignment, self-edit restriction, and role capability management
  - Priority: P1
  - Status: implemented
  - Depends on: FR02

### Security
- **FR23: Security Headers:** X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy via Next.js config
  - Priority: P0
  - Status: implemented
  - Depends on: NONE
- **FR24: Rate Limiting:** Dynamic per-API-key rate limiting with in-memory cache and 1-minute window
  - Priority: P1
  - Status: implemented
  - Depends on: FR03
- **FR25: HTML Sanitization:** DOMPurify-based sanitization for user content, shortcodes, and theme outputs
  - Priority: P0
  - Status: implemented
  - Depends on: NONE

## Non-Functional Requirements (NFR)

- **NFR01: Performance:** Pages must render under 500ms with Next.js caching (unstable_cache + revalidation tags)
  - Métrica: Time to First Byte (TTFB)
  - Target: < 500ms
- **NFR02: Security:** All user inputs validated via Zod schemas at syshas boundaries
  - Métrica: OWASP Top 10 coverage
  - Target: 100% coverage for input validation
- **NFR03: Containerization:** Full Docker support with multi-stage build and standalone output
  - Métrica: Docker image size
  - Target: < 200MB final image
- **NFR04: Type Safety:** End-to-end TypeScript with Prisma-generated types and Pothos schema
  - Métrica: TypeScript strict mode withpilation
  - Target: Zero runtime type errors
- **NFR05: Plugin Isolation:** Plugins execute in isolated-vm with configurable memory and timeout limits
  - Métrica: Sandbox memory ceiling
  - Target: 512MB default, configurable 128-4096MB
