# BlackLotusCMS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)

BlackLotusCMS is a modern, high-performance, and extensible Content Management System built with **Next.js 16**, **Prisma**, and **Pothos GraphQL**.

## Features

- **Next.js 16 (App Router):** React Server Components for zero-bloat frontend.
- **Environment Variables:** Configuration via `.env` file.
- **Custom Post Types:** Flexible content modeling with taxonomies and custom fields.
- **Type-Safe GraphQL:** Pothos + Prisma for end-to-end type safety.
- **Plugin System:** Secure execution via isolated-vm sandbox.
- **RBAC Security:** Role-based access control with capability-based permissions.
- **Multi-Storage:** Local, S3, and R2 storage drivers.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20 |
| bun | >= 1.0 |
| PostgreSQL | >= 15 |

---

## Installation

```bash
git clone https://github.com/JudahAragao/blacklotuscms.git
cd blacklotuscms
bash setup_dev.sh
bun run dev
```

Done. The `setup_dev.sh` does everything automatically:

- Checks prerequisites (bun, docker, node, python3, make, g++)
- Creates `.env` with auto-generated secrets
- Starts PostgreSQL via Docker and waits for it to be ready
- Installs dependencies and compiles `isolated-vm`
- Generates Prisma client and applies schema to the database
- Generates theme and plugin records
- Creates `uploads/` directory
- Creates `.env` and `.installed`

The script is idempotent — you can run it as many times as you want. On the first run it does everything; on subsequent runs it skips already completed steps.

> For a step-by-step manual setup, see the [Manual Setup](#manual-setup) section at the end of this README.

### Default Credentials

After setup, the auto-install creates the admin user with the credentials defined in `.env`:

| Field | Default Value |
|-------|---------------|
| Email | `admin@blacklotuscms.com` |
| Password | value of `ADMIN_PASSWORD` in `.env` |

> **Important:** The auto-install creates roles, post types (post/page), taxonomies (categories/tags), and the admin user automatically on the first run.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bash setup_dev.sh` | Setup local dev environment (idempotent) |
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `bun run test:e2e` | Run E2E tests (Playwright) |
| `bun run test:e2e:ui` | Run E2E tests with UI |
| `bunx prisma generate` | Generate Prisma client |
| `bunx prisma db push` | Push schema to database |
| `bunx prisma studio` | Open Prisma Studio |

---

## Project Structure

```
blacklotuscms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin panel routes
│   │   ├── (public)/          # Public routes
│   │   ├── api/               # API routes (REST + GraphQL)
│   │   └── auth/              # Authentication routes
│   ├── components/            # React components
│   │   └── admin/             # Admin UI components
│   ├── core/
│   │   ├── sandbox/           # Plugin sandbox (isolated-vm + compiled)
│   │   └── services/          # Business logic (23+ services)
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── builder.ts         # Pothos GraphQL builder
│   │   ├── config.ts          # Zod-validated configuration
│   │   ├── errors.ts          # Error handling
│   │   ├── logger.ts          # Structured logging
│   │   ├── prisma.ts          # Prisma client proxy
│   │   └── storage.ts         # Multi-driver storage
│   ├── schemas/               # Zod validation schemas
│   └── types/                 # TypeScript types and DTOs
├── prisma/
│   └── schema.prisma          # Database schema
├── themes/
│   └── default/               # Default theme
├── specs/                     # SDD documentation
├── docs/                      # Developer documentation
└── tasks/                     # Task management
```

---

## Architecture

```mermaid
flowchart TD
    A[Client Request] --> B[Proxy]
    B -->|auth/rate-limit| C[Route Handler]
    C --> D[Service]
    D --> E[Prisma]
    E --> F[(PostgreSQL)]
    
    D --> G[HookService]
    G --> H[Plugins]
    
    C --> I[ThemeRenderer]
    I --> J[Public Page]
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style H fill:#fff3e0
    style J fill:#e8f5e9
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Proxy | `src/proxy.ts` | Auth, rate limiting, installation gate |
| Config | `src/lib/config.ts` | Environment configuration |
| Auth | `src/lib/auth.ts` | NextAuth JWT setup |
| GraphQL | `src/lib/builder.ts` | Pothos schema builder |
| Prisma | `src/lib/prisma.ts` | Lazy database client |
| Services | `src/core/services/` | Business logic with RBAC |
| Sandbox | `src/core/sandbox/` | Plugin isolation (isolated-vm) |
| Hooks | `src/core/services/HookService.ts` | Actions + Filters system |
| Theme Renderer | `src/components/ThemeRenderer.tsx` | Dynamic theme loading |

---

## Core Systems

### Plugin System

Plugins execute in an isolated sandbox (`isolated-vm`) with a secure Bridge API:

```mermaid
flowchart LR
    A[Plugin ZIP] --> B[PluginService]
    B --> C[PluginSandbox]
    C --> D[Bridge API]
    D --> E[db.read/write]
    D --> F[hooks.addAction/addFilter]
    D --> G[storage.set/get]
    D --> H[auth.getUser]
    
    style C fill:#fff3e0
    style D fill:#e8f5e9
```

- **Sandbox:** Memory limit (512MB default), timeout (30s default)
- **Rate Limit:** 50 DB queries/second per plugin
- **Permissions:** Plugins must request access to data/hooks
- **Docs:** [Plugin Development Guide](./docs/PLUGINS.md)

### Hook System (Actions + Filters)

WordPress-style extensibility ported to TypeScript:

```typescript
// Register an action (event handler)
hookService.addAction('post.created', (post) => {
  console.log('New post:', post.title);
});

// Register a filter (data transformation)
hookService.addFilter('post.before_validate', (data) => {
  data.title = data.title.trim();
  return data;
});
```

- **Actions:** Execute code at specific points (post.created, user.updated)
- **Filters:** Transform data in pipeline (content.title, route_access)
- **Audit Log:** All hook calls are logged with source and timestamp

### Theme System

Themes are React Server Components with CSS scoping:

```mermaid
flowchart TD
    A[ThemeRenderer] --> B{Context}
    B -->|single| C[layouts/post.tsx]
    B -->|archive| D[layouts/archive.tsx]
    B -->|search| E[layouts/search.tsx]
    B -->|404| F[layouts/404.tsx]
    
    A --> G[ThemeDataService]
    G --> H[CSS Variables]
    
    A --> I[Theme Context]
    I --> J[AsyncLocalStorage]
    
    style A fill:#e1f5fe
    style J fill:#f3e5f5
```

- **Dynamic Import:** Layouts loaded based on route context
- **CSS Scoping:** All styles wrapped in `.blacklotuscms-theme`
- **Permission Gate:** Themes request access to system data
- **SDK:** `getPost()`, `getField()`, `getPostsByType()` helpers
- **Docs:** [Theme Development Guide](./docs/THEMES.md)

### RBAC (Role-Based Access Control)

```typescript
// Capability check
if (!canPerformAction(user, 'post.create')) {
  throw new BlackLotusCMSError('No permission', 403, 'AUTH_FORBIDDEN');
}

// Own resource check
if (!canPerformAction(user, 'post.update', post.authorId)) {
  // User can only edit their own posts
}
```

| Role | Capabilities |
|------|--------------|
| Administrator | Full access (bypass all checks) |
| Editor | CRUD all posts, media, comments |
| Author | CRUD own posts, upload media |
| Contributor | Create drafts only |
| Subscriber | Read content, edit profile |

---

## Documentation

- **[Onboarding Guide](./docs/onboarding.md)** - Getting started
- **[Coding Standards](./docs/coding-standards.md)** - Code conventions
- **[REST API](./docs/API_REST.md)** - Endpoint reference
- **[GraphQL API](./docs/API_GRAPHQL.md)** - Schema and queries
- **[Theme Development](./docs/THEMES.md)** - Create themes
- **[Plugin Development](./docs/PLUGINS.md)** - Build plugins
- **[Compliance](./docs/COMPLIANCE.md)** - LGPD & GDPR

---

## Testing

```bash
# Unit tests
bun run test

# E2E tests (requires Playwright)
bunx playwright test
```

---

## Troubleshooting

**Prisma Client not generated**
```bash
bunx prisma generate
```

**Database connection failed**
Check `.env` for correct `DATABASE_URL`. Ensure PostgreSQL is running:
```bash
docker ps | grep blacklotus-postgres
```

**isolated-vm compilation error**
The `isolated-vm` module requires native compilation tools:
```bash
# Ubuntu/Debian
sudo apt-get install -y python3 make g++

# macOS
xcode-select --install

# Then rebuild
npm rebuild isolated-vm
```

**Port 3000 in use**
```bash
lsof -ti:3000 | xargs kill -9
```

**Schema drift (tables exist but schema changed)**
```bash
bunx prisma db push
```

**Reset database completely**
```bash
docker exec blacklotus-postgres dropdb -U postgres blacklotuscms
docker exec blacklotus-postgres createdb -U postgres blacklotuscms
bunx prisma db push
bun run dev  # auto-install will seed defaults
```

---

## Deployment (VPS with GitHub Actions)

Deployment is automated via GitHub Actions with a **Blue/Green** strategy for zero-downtime. On each push to the `main` branch, a Docker image is built, pushed to GHCR, and the VPS is updated automatically.

### VPS Prerequisites

| Item | Minimum Version |
|------|-----------------|
| Docker | >= 24 |
| Docker Compose | >= 2.x |
| Nginx | >= 1.18 |
| Git | >= 2.0 |
| SSH access | Public key in `authorized_keys` |

### VPS Directory Structure

```
/opt/apps/
├── blue/
│   ├── docker-compose.yml    # App container (port 3001)
│   └── .env                  # App environment variables
├── green/
│   ├── docker-compose.yml    # App container (port 3002)
│   └── .env                  # App environment variables
├── shared/
│   └── docker-compose.yml    # Shared PostgreSQL
└── current                   # File containing "blue" or "green"

/home/deploy/portfolio/
└── uploads/                  # Shared uploads (bind mount)
                              # UID 1001 (nextjs) owns it
                              # blue and green mount at /app/uploads

/etc/nginx/
└── conf.d/
    └── app.conf              # Upstream + location /uploads/
```

### Required GitHub Secrets

Configure these secrets in your GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | VPS IP or hostname | `203.0.113.50` |
| `VPS_USER` | SSH user with sudo | `deploy` |
| `VPS_SSH_KEY` | SSH private key (ed25519/RSA) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

> `GITHUB_TOKEN` is automatic and does not need configuration.

### Environment Variables (.env on VPS)

Each environment (blue/green) needs a `.env` file at `/opt/apps/<environment>/.env`:

```bash
# Required
GITHUB_USER=your-github-username          # Used to access the image on GHCR
DATABASE_URL=postgresql://postgres:PASSWORD@blacklotus-postgres:5432/blacklotuscms
NEXTAUTH_SECRET=your_secret_hex_here
NEXTAUTH_URL=https://blacklotuscms.com

# Optional (sensible defaults)
STORAGE_DRIVER=local
UPLOAD_DIR=uploads
# SANDBOX_MEMORY_LIMIT=512
# SANDBOX_TIMEOUT=30
```

> **Important:** The `DATABASE_URL` must point to the `blacklotus-postgres` container on the `blacklotus-network`, not to `localhost`.

> **Warning:** `GITHUB_USER` is required. Without it, `docker compose up` fails with `invalid reference format` because the image `ghcr.io/${GITHUB_USER}/blacklotuscms:latest` becomes malformed.

### Initial VPS Setup

**Quick option** — Run the automated script on the VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/JudahAragao/blacklotuscms/main/scripts/setup_vps.sh | sudo bash
```

The script will:
1. Install Docker and Docker Compose
2. Install and configure Nginx (with `location /uploads/`)
3. Create the directory structure in `/opt/apps/`
4. Create the shared directory `/home/deploy/portfolio/uploads/` with correct permissions
5. Create `docker-compose.yml` with bind mount (not named volume)
6. Create `.env` with `GITHUB_USER`, generated passwords, etc.
7. Start PostgreSQL

**Manual option** — If you prefer step-by-step configuration:

```bash
# 1. Create directory structure
sudo mkdir -p /opt/apps/{blue,green,shared}

# 2. Create shared uploads directory (IMPORTANT)
sudo mkdir -p /home/deploy/portfolio/uploads
sudo chown -R 1001:1001 /home/deploy/portfolio/uploads
sudo chmod 755 /home/deploy/portfolio/uploads
sudo chmod o+x /home/deploy /home/deploy/portfolio

# 3. Create shared Docker network
docker network create blacklotus-network

# 4. Create current file
echo "blue" | sudo tee /opt/apps/current

# 5. Copy docker-compose.yml from the repository to each environment
# IMPORTANT: Use bind mount, NOT named volume
cp deploy/blue/docker-compose.yml /opt/apps/blue/
cp deploy/green/docker-compose.yml /opt/apps/green/
cp deploy/shared/docker-compose.yml /opt/apps/shared/

# 6. Create .env in BOTH environments (blue and green)
# Include GITHUB_USER or docker compose will fail
nano /opt/apps/blue/.env
nano /opt/apps/green/.env

# 7. Configure Nginx (with location /uploads/)
cat > /etc/nginx/conf.d/app.conf << 'EOF'
upstream backend {
    server 127.0.0.1:3001;  # blue = 3001, green = 3002
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    client_max_body_size 64M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    location /uploads/ {
        alias /home/deploy/portfolio/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx

# 8. Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 9. Login to GHCR (required for manual pull)
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USER --password-stdin
```

> ⚠️ **Common errors and how to avoid them:**
> - `EACCES: permission denied, mkdir '/app/uploads'` → run `sudo chown -R 1001:1001 /home/deploy/portfolio/uploads`
> - `invalid reference format` → add `GITHUB_USER=your-username` to `.env`
> - `403 Forbidden` on `/uploads/` → run `sudo chmod o+x /home/deploy /home/deploy/portfolio`
> - `404 Not Found` on `/uploads/` → check if nginx has the `location /uploads/` block
> - Image not loading → force refresh (`Ctrl+Shift+R`) or clear browser cache

### Deploy Flow

```
Push to main → Build Docker → Push GHCR → SSH VPS →
  1. Detect inactive environment (green if blue is active)
  2. Login to GHCR
  3. Create /home/deploy/portfolio/uploads/ directory (if it doesn't exist)
  4. Fix permissions (chmod o+x, chown 1001:1001)
  5. Pull new image
  6. Push schema (prisma db push) on first run
  7. Clean up old named volumes
  8. docker compose up -d
  9. Health check (up to 60s)
  10. Update Nginx upstream + /uploads/ location → new port
  11. Previous environment stays as rollback
```

### Rollback

```bash
# On the VPS: switch to the previous environment
echo "blue" | sudo tee /opt/apps/current  # or "green"
sudo systemctl reload nginx
```

### Logs and Debug

```bash
# View active app logs
ACTIVE=$(cat /opt/apps/current)
cd /opt/apps/$ACTIVE
docker compose logs -f app

# View PostgreSQL logs
cd /opt/apps/shared
docker compose logs -f postgres

# Container status
docker ps --filter "name=blacklotus"

# Check uploads
ls -la /home/deploy/portfolio/uploads/

# Test if nginx serves uploads (via localhost won't work, use the domain)
curl -I https://your-domain.com/uploads/thumb-xxx.webp

# Check permissions
ls -la /home/deploy/portfolio/uploads/
# Should show: -rw-r--r-- 1001 1001 (files) and drwxr-xr-x 1001 1001 (directory)
stat /home/deploy/portfolio/uploads/
# Should show: Access: (0755/drwxr-xr-x) and UID 1001
```

---

## Manual Setup

If for some reason `setup_dev.sh` does not work, configure manually:

```bash
# 1. Install dependencies
bun install

# 2. Compile native module
npm rebuild isolated-vm

# 3. Create .env
cp .env.example .env
# Edit NEXTAUTH_SECRET, DATABASE_URL, ADMIN_PASSWORD

# 4. PostgreSQL
docker run -d --name blacklotus-postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=blacklotuscms \
  -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# 5. Database
bunx prisma generate
bunx prisma db push

# 6. Registries
npm run generate

# 7. Uploads directory
mkdir -p uploads

# 8. Start
bun run dev
```

---

## License

MIT License - Copyright (c) 2026 BlackLotusCMS. See [LICENSE](./LICENSE) for details.
