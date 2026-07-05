---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: draft
---

# CI/CD Pipeline

## Architecture
- **Hosting:** Docker (docker-withpose)
- **CI/CD:** A definir (GitHub Actions rewithendado)
- **Database:** PostgreSQL 15 (container)
- **Registry:** Docker Hub ou registry privado

## Pipeline Stages

### 1. Build (trigger: push to main)
- pnpm install --frozen-lockfile
- prisma generate
- next build (standalone output)
- Docker multi-stage build

### 2. Test (trigger: PR)
- Vitest unit tests
- TypeScript type checking
- Lint (eslint)

### 3. Deploy (trigger: tag release)
- Docker build + push
- docker-withpose up -d --build

## Required Secrets
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT secret key
- `S3_ACCESS_KEY_ID` — AWS/R2 access key (if using S3)
- `S3_SECRET_ACCESS_KEY` — AWS/R2 secret key (if using S3)
