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
├── shared/
│   ├── uploads/      ← media files (bind mount)
│   ├── plugins/      ← plugins instalados (bind mount)
│   └── postgres_data/ ← database (volume Docker)
├── current          ← "blue" ou "green"
└── scripts/
    ├── setup_vps.sh
    └── switch.sh
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
- `themes_data` — Temas instalados (Docker named volume, persiste entre redeployments)
- `/opt/apps/shared/uploads` — Media files (bind mount)
- `/opt/apps/shared/plugins` — Plugins instalados (bind mount)
- `postgres_data` — Database persistence (volume Docker)
- `.env` — Environment variables (bind mount por ambiente)

## Rollback
Alternar `/opt/apps/current` e reload do Nginx.
