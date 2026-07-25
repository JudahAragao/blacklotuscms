---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Integrations - BlackLotusCMS

## 1. PostgreSQL (Database)

- **Method:** TCP via PrismaPg adapter (connection pooling)
- **Usage:** Main data database, all entities
- **Auth Flow:** Connection string via .secrets.json (DATABASE_URL)
- **Fallback:** Clear error if DATABASE_URL not configured; PrismaProxy allows lazy init

## 2. AWS S3 / Cloudflare R2 (Object Storage)

- **Method:** AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/lib-storage)
- **Usage:** Media upload storage (processed images)
- **Auth Flow:** Access Key + Secret Key configured via admin or .secrets.json
- **Fallback:** If S3/R2 fails, error is logged and upload fails with 500; Configurable storage driver (local/s3/r2)

## 3. Sharp (Image Processing)

- **Method:** Native Node.js library
- **Usage:** Conversion to WebP, 300x300 thumbnail generation, metadata extraction
- **Auth Flow:** N/A (local library)
- **Fallback:** Processing error throws BlackLotusCMSError 500

## 4. DOMPurify (HTML Sanitization)

- **Method:** isomorphic-dompurify (SSR + client compatible)
- **Usage:** HTML sanitization in hooks, theme content, search queries
- **Auth Flow:** N/A (local library)
- **Fallback:** N/A (synchronous local operation)

## 5. NextAuth (Authentication)

- **Method:** next-auth v4 with @next-auth/prisma-adapter
- **Usage:** JWT authentication, sessions, callbacks
- **Auth Flow:** CredentialsProvider -> JWT token -> session callback
- **Fallback:** N/A (core dependency)

## 6. Apollo Server (GraphQL)

- **Method:** @apollo/server v5 + @as-integrations/next
- **Usage:** Type-safe GraphQL API with Pothos schema builder
- **Auth Flow:** Session via getServerSession or headers injected by proxy (API Key)
- **Fallback:** Introspection disabled in production

## 7. Pothos (Schema Builder)

- **Method:** @pothos/core + @pothos/plugin-prisma + @pothos/plugin-scope-auth
- **Usage:** Type-safe GraphQL schema construction with Prisma types
- **Auth Flow:** Scope auth via authScopes (public, authenticated, hasCapability)
- **Fallback:** N/A (build-time tool)

## 8. Zod (Validation)

- **Method:** zod v4
- **Usage:** Validation of all API inputs (post, comment, install form)
- **Auth Flow:** N/A
- **Fallback:** Validation errors return 400 with details

## 9. bcryptjs (Password Hashing)

- **Method:** bcryptjs v3
- **Usage:** User password hashing (cost factor 12)
- **Auth Flow:** N/A
- **Fallback:** N/A

## 10. isolated-vm (Plugin Sandbox)

- **Method:** Node.js library for isolated code execution
- **Usage:** Sandbox for imported plugins (ZIP upload)
- **Auth Flow:** Bridge API with per-method permissions
- **Fallback:** Compiled plugins (without sandbox, but with Bridge API proxy)

## 11. Redis (Optional)

- **Method:** redis v6 client
- **Usage:** Distributed cache for multi-container rate limiting (recommended for production)
- **Auth Flow:** Connection string via .secrets.json
- **Fallback:** In-memory cache (functional for single-container)

## 12. Sharp (Image Processing)

- **Method:** Native Node.js library
- **Usage:** WebP conversion, 300x300 thumbnails, metadata extraction
- **Auth Flow:** N/A (local library)
- **Fallback:** Upload without processing if Sharp fails
