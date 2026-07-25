---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# CI/CD Pipeline — Deploy Workflow

## Overview
Automated deploy via GitHub Actions with **Blue/Green** strategy for zero-downtime.

- **Trigger:** Push to `main`
- **Registry:** GitHub Container Registry (ghcr.io)
- **Target:** VPS with Docker Compose + Nginx

## Pipeline Stages

### 1. Build & Push (job: `build-and-push`)
- Code checkout
- Docker Buildx with GHA cache
- Multi-stage image build (Dockerfile)
- Push to `ghcr.io/<owner>/blacklotuscms:latest` and `:<sha>`

### 2. Deploy (job: `deploy`, depends: build-and-push)
- Sync docker-compose.yml (blue/green) via SCP to VPS
- Determine target environment (blue ↔ green toggle)
- Pull new image in target environment
- `docker compose up -d app`
- `prisma db push --accept-data-loss` to synchronize schema
- Health check with retry (up to 60s, 12 attempts)
- Reconfigure Nginx to point to new environment
- `nginx -t && systemctl reload nginx`
- Update `/opt/apps/current` flag

## Blue/Green Architecture

```
[VPS]
├── /opt/apps/
│   ├── blue/
│   │   ├── docker-compose.yml
│   │   └── (app container: blacklotus-blue-app, port 3001)
│   ├── green/
│   │   ├── docker-compose.yml
│   │   └── (app container: blacklotus-green-app, port 3002)
│   └── current  ← "blue" or "green"
├── nginx
│   └── conf.d/app.conf  ← upstream points to active environment port
└── postgres (shared container)
```

**Deploy flow:**
1. Active environment = blue (port 3001)
2. Deploy brings up green (port 3002)
3. Health check OK → Nginx redirects to green
4. blue stays as rollback

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP/hostname |
| `VPS_USER` | VPS SSH user |
| `VPS_SSH_KEY` | Private SSH key |
| `GITHUB_TOKEN` | Automatic token (GHCR push) |

## Required VPS Structure

```
/opt/apps/blue/docker-compose.yml
/opt/apps/green/docker-compose.yml
/opt/apps/current          ← contains "blue" or "green"
/etc/nginx/conf.d/app.conf ← upstream backend
```

## Rollback
If health check fails, the deploy stops and the previous environment remains active. For manual rollback:
```bash
echo "blue" | sudo tee /opt/apps/current
sudo systemctl reload nginx
```
