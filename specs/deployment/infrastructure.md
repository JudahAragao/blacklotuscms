---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Infrastructure & Deployment

## Architecture

```
[Client] -> [Docker: app (Next.js 16 :3000)] -> [Docker: postgres (:5432)]
                         |
                    [S3/R2 (optional)]
```

## Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | postgres:15-alpine | 5432 | Database |
| App | blacklotuscms | 3000 | Next.js application |

## Volumes
- `postgres_data` — Database persistence
- `uploads` — Media files persistence
- `.secrets.json` — Configuration (bind mount)
- `.installed` — Installation flag (bind mount)

## Deployment
- **Strategy:** Docker Compose with multi-stage build
- **Output:** Next.js standalone (minimal image)
- **User:** nextjs (non-root, uid 1001)
- **Restart:** unless-stopped
