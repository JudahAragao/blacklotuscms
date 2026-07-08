---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Environments

## Development
- **Database:** Local PostgreSQL ou Docker
- **Storage:** Local (./public/uploads)
- **Secrets:** .secrets.json na raiz
- **Command:** `pnpm dev`

## Production (Docker)
- **Database:** PostgreSQL container (postgres:15-alpine)
- **Storage:** Local (container volume) ou S3/R2
- **Secrets:** .secrets.json montado como volume
- **Command:** `docker compose up -d --build`

## Required Environment Variables
```bash
# Nao usa .env — configuration via .secrets.json
# Variaveis internas definidas pelo SecretsService:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=hex_string
NEXTAUTH_URL=http://localhost:3000
STORAGE_DRIVER=local|s3|r2
UPLOAD_DIR=./public/uploads
SANDBOX_MEMORY_LIMIT=512
SANDBOX_TIMEOUT=30
```

## Security Headers (next.config.ts)
- X-DNS-Prefetch-Control: on
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
