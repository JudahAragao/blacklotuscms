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

## Local Development

```
[bun run dev] → [Next.js :3000] → [Docker: blacklotus-postgres (:5432)]
```

- Setup: `bash setup_dev.sh` (verifies prerequisites, starts postgres, installs deps, generates prisma + registries)
- uploads/ on local filesystem (symlink to public/uploads in Docker)
- .env in root with DATABASE_URL pointing to localhost:5432

## VPS Layout (Blue/Green)

```
/opt/apps/
├── blue/
│   ├── docker-compose.yml
│   └── containers: blacklotus-blue-app (:3001)
├── green/
│   ├── docker-compose.yml
│   └── containers: blacklotus-green-app (:3002)
├── shared/
│   └── postgres_data/ ← database (Docker volume)
├── current          ← "blue" or "green"
└── scripts/
    ├── setup_vps.sh
    └── switch.sh
```

## Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | postgres:15-alpine | 5432 | Database (shared) |
| App (blue) | blacklotus-blue-app | 3001 | Next.js — blue environment |
| App (green) | blacklotus-green-app | 3002 | Next.js — green environment |
| Nginx | nginx (host) | 80 | Reverse proxy + static files |

## Deployment
- **Strategy:** Blue/Green with GitHub Actions (deploy.yml)
- **Trigger:** Push to `main`
- **Registry:** ghcr.io
- **Output:** Next.js standalone (minimal image)
- **Server:** Custom server (`custom-server.js`) for theme loading via require()
- **User:** nextjs (non-root, uid 1001)
- **Restart:** unless-stopped
- **Zero-downtime:** Health check before Nginx switch

## Volumes
- `uploads_data` — Media files (Docker named volume, persists across redeployments)
- `themes_data` — Installed themes (Docker named volume, persists across redeployments)
- `plugins_data` — Installed plugins (Docker named volume, persists across redeployments)
- `postgres_data` — Database persistence (Docker volume)
- `.env` — Environment variables (bind mount per environment)

## Rollback
Toggle `/opt/apps/current` and reload Nginx.
