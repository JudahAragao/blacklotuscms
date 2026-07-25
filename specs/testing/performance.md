---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: draft
---

# Performance Testing

## Metrics
- **TTFB:** < 500ms for public pages (with cache)
- **Plugin Sandbox:** < 100ms overhead per execution
- **Media Upload:** < 5s for images up to 10MB
- **Database Queries:** < 50ms for simple queries

## Stress Tests
- 100 simultaneous requests on the public API
- Upload of 50 consecutive images
- 50 plugins executing hooks simultaneously
- Cache hit rate > 90% for popular posts

## Caching Strategy
- unstable_cache with 3600s TTL for posts
- Revalidation tags for granular invalidation
- Prisma connection pooling via PrismaPg
