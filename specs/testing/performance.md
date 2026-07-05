---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: draft
---

# Performance Testing

## Metrics
- **TTFB:** < 500ms para paginas publicas (with cache)
- **Plugin Sandbox:** < 100ms overhead por execution
- **Media Upload:** < 5s para imagens ate 10MB
- **Database Queries:** < 50ms para queries simples

## Stress Tests
- 100 requests simultaneos na API publica
- Upload de 50 imagens consecutivas
- 50 plugins executando hooks simultaneamente
- Cache hit rate > 90% para posts populares

## Caching Strategy
- unstable_cache with TTL de 3600s para posts
- Revalidation tags para invalidacao granular
- Prisma connection pooling via PrismaPg
