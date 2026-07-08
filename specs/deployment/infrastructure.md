---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Infrastructure & Deployment

## Architecture

```
[Client] → [Nginx :80] → [Docker: app (Next.js 16)] → [Docker: postgres (:5432)]
                                |
                           [S3/R2 (optional)]
```

## VPS Layout (Blue/Green)

```
/opt/apps/
├── blue/
│   ├── docker-compose.yml
│   └── containers: blacklotus-blue-app (:3001)
├── green/
│   ├── docker-compose.yml
│   └── containers: blacklotus-green-app (:3002)
├── current          ← "blue" ou "green"
└── postgres_data/   ← volume compartilado
```

## Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | postgres:15-alpine | 5432 | Database (compartilhado) |
| App (blue) | blacklotus-blue-app | 3001 | Next.js — ambiente blue |
| App (green) | blacklotus-green-app | 3002 | Next.js — ambiente green |
| Nginx | nginx (host) | 80 | Reverse proxy + static files |

## Deployment
- **Strategy:** Blue/Green com GitHub Actions (deploy.yml)
- **Trigger:** Push para `main`
- **Registry:** ghcr.io
- **Output:** Next.js standalone (minimal image)
- **User:** nextjs (non-root, uid 1001)
- **Restart:** unless-stopped
- **Zero-downtime:** Health check antes de switch de Nginx

## Volumes
- `postgres_data` — Database persistence
- `uploads` — Media files persistence
- `.secrets.json` — Configuration (bind mount)
- `.installed` — Instalacao flag (bind mount)

## Rollback
Alternar `/opt/apps/current` e reload do Nginx.
