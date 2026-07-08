---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# CI/CD Pipeline — Deploy Workflow

## Overview
Deploy automatizado via GitHub Actions com estratégia **Blue/Green** para zero-downtime.

- **Trigger:** Push para `main`
- **Registry:** GitHub Container Registry (ghcr.io)
- **Target:** VPS com Docker Compose + Nginx

## Pipeline Stages

### 1. Build & Push (job: `build-and-push`)
- Checkout do código
- Docker Buildx com cache GHA
- Build da imagem multi-stage (Dockerfile)
- Push para `ghcr.io/<owner>/blacklotuscms:latest` e `:<sha>`

### 2. Deploy (job: `deploy`, depends: build-and-push)
- Sync dos docker-compose.yml (blue/green) via SCP para VPS
- Determina ambiente alvo (alternância blue ↔ green)
- Pull da nova imagem no ambiente alvo
- `docker compose up -d app`
- `prisma db push --accept-data-loss` para sincronizar schema
- Health check com retry (até 60s, 12 tentativas)
- Reconfigura Nginx para apontar para o novo ambiente
- `nginx -t && systemctl reload nginx`
- Atualiza flag `/opt/apps/current`

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
│   └── current  ← "blue" ou "green"
├── nginx
│   └── conf.d/app.conf  ← upstream aponta para porta do ambiente ativo
└── postgres (container compartilhado)
```

**Fluxo de deploy:**
1. Ambiente ativo = blue (porta 3001)
2. Deploy sobe green (porta 3002)
3. Health check OK → Nginx redireciona para green
4. blue fica como rollback

## Required GitHub Secrets

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP/hostname da VPS |
| `VPS_USER` | Usuário SSH da VPS |
| `VPS_SSH_KEY` | Chave SSH privada |
| `GITHUB_TOKEN` | Token automático (GHCR push) |

## Required VPS Structure

```
/opt/apps/blue/docker-compose.yml
/opt/apps/green/docker-compose.yml
/opt/apps/current          ← contém "blue" ou "green"
/etc/nginx/conf.d/app.conf ← upstream backend
```

## Rollback
Em caso de falha no health check, o deploy para e o ambiente anterior continua ativo. Para rollback manual:
```bash
echo "blue" | sudo tee /opt/apps/current
sudo systemctl reload nginx
```
