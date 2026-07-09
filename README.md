# BlackLotusCMS

> **⚠️ WARNING: This project is for testing and exploration purposes only. It is not production-ready.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/)

BlackLotusCMS is a modern, high-performance, and extensible Content Management Sistema built com **Next.js 16**, **Prisma**, and **Pothos GraphQL**.

## Features

- **Next.js 16 (App Router):** React Server Components for zero-bloat frontend.
- **Zero .env Architecture:** Configuration via `.secrets.json`, no environment variables.
- **Custom Post Types:** Flexible content modeling com taxonomies and custom fields.
- **Type-Safe GraphQL:** Pothos + Prisma for end-to-end type safety.
- **Plugin System:** Secure execution via isolated-vm sandbox.
- **RBAC Security:** Role-based access control com capability-based permissions.
- **Multi-Storage:** Local, S3, and R2 storage drivers.

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20 |
| bun | >= 1.0 |
| PostgreSQL | >= 15 |

---

## Instalacao

### 1. Clone and install
```bash
git clone https://github.com/your-org/blacklotuscms.git
cd blacklotuscms
bun install
```

### 2. Start PostgreSQL
```bash
# Using Docker (optional)
docker run -d --name postgres -e POSTGRES_DB=blacklotuscms -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# Or use your existing PostgreSQL instance
```

### 3. Initialize configuration
```bash
touch .secrets.json .installed
```

### 4. Generate Prisma client
```bash
bunx prisma generate
```

### 5. Start development server
```bash
bun run dev
```

### 6. Complete installation
Open `http://localhost:3000/install` and follow the setup wizard.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run unit tests (Vitest) |
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
│   │   ├── sandbox/           # Plugin sandbox (isolated-vm)
│   │   └── services/          # Business logic (20+ services)
│   ├── lib/                   # Shared utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── builder.ts         # Pothos GraphQL builder
│   │   ├── config.ts          # Zod-validated configuration
│   │   ├── errors.ts          # Error handling
│   │   ├── logger.ts          # Structured logging
│   │   ├── prisma.ts          # Prisma client proxy
│   │   ├── secrets.ts         # Zero .env secrets management
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
| Secrets | `src/lib/secrets.ts` | Zero .env configuration |
| Auth | `src/lib/auth.ts` | NextAuth JWT setup |
| GraphQL | `src/lib/builder.ts` | Pothos schema builder |
| Prisma | `src/lib/prisma.ts` | Lazy database client |
| Services | `src/core/services/` | Business logic com RBAC |
| Sandbox | `src/core/sandbox/` | Plugin isolation (isolated-vm) |
| Hooks | `src/core/services/HookService.ts` | Actions + Filters sistema |
| Theme Renderer | `src/components/ThemeRenderer.tsx` | Dynamic theme loading |

---

## Core Systems

### Plugin System

Plugins execute in an isolated sandbox (`isolated-vm`) com a secure Bridge API:

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
- **Audit Log:** All hook calls are logged com source and timestamp

### Theme Sistema

Themes are React Server Components com CSS scoping:

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
- **Permission Gate:** Themes request access to sistema data
- **SDK:** `getPost()`, `getField()`, `getPostsByType()` helpers
- **Docs:** [Theme Development Guide](./docs/THEMES.md)

### RBAC (Role-Based Acesso Control)

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
| Administrador | Full access (bypass all checks) |
| Editor | CRUD all posts, media, comments |
| Autor | CRUD own posts, upload media |
| Colaborador | Create drafts only |
| Assinante | Read content, edit profile |

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
Check `.secrets.json` for correct `DATABASE_URL`.

**Port 3000 in use**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Deployment (VPS com GitHub Actions)

O deploy é automatizado via GitHub Actions com estratégia **Blue/Green** para zero-downtime. A cada push na branch `main`, uma imagem Docker é buildada, enviada ao GHCR e o VPS é atualizado automaticamente.

### Pré-requisitos na VPS

| Item | Versão mínima |
|------|---------------|
| Docker | >= 24 |
| Docker Compose | >= 2.x |
| Nginx | >= 1.18 |
| Git | >= 2.0 |
| SSH access | Chave pública no `authorized_keys` |

### Estrutura de Diretórios na VPS

```
/opt/apps/
├── blue/
│   ├── docker-compose.yml    # App container (porta 3001)
│   └── .env                  # Variáveis de ambiente do app
├── green/
│   ├── docker-compose.yml    # App container (porta 3002)
│   └── .env                  # Variáveis de ambiente do app
├── shared/
│   └── docker-compose.yml    # PostgreSQL compartilhado
└── current                   # Arquivo com "blue" ou "green"

/home/deploy/portfolio/
└── uploads/                  # Uploads compartilhados (bind mount)
                              # UID 1001 (nextjs) é dono
                              # blue e green montam em /app/uploads

/etc/nginx/
└── conf.d/
    └── app.conf              # Upstream + location /uploads/
```

### GitHub Secrets necessários

Configure estes secrets no repositório GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou hostname da VPS | `203.0.113.50` |
| `VPS_USER` | Usuário SSH com sudo | `deploy` |
| `VPS_SSH_KEY` | Chave SSH privada (ed25519/RSA) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

> `GITHUB_TOKEN` é automático e não precisa configurar.

### Variáveis de Ambiente (.env na VPS)

Cada ambiente (blue/green) precisa de um arquivo `.env` em `/opt/apps/<ambiente>/.env`:

```bash
# Obrigatório
GITHUB_USER=seu-usuario-github          # Usado para acessar a imagem no GHCR
DATABASE_URL=postgresql://postgres:SENHA@blacklotus-postgres:5432/blacklotuscms
NEXTAUTH_SECRET=seu_secret_hex_aqui
NEXTAUTH_URL=https://judahdearagao.pro

# Opcional (defaults sensatos)
STORAGE_DRIVER=local
UPLOAD_DIR=uploads
# SANDBOX_MEMORY_LIMIT=512
# SANDBOX_TIMEOUT=30
```

> **Importante:** A `DATABASE_URL` deve apontar para o container `blacklotus-postgres` na rede `blacklotus-network`, não para `localhost`.

> **Atenção:** O `GITHUB_USER` é obrigatório. Sem ele, o `docker compose up` falha com `invalid reference format` porque a imagem `ghcr.io/${GITHUB_USER}/blacklotuscms:latest` fica malformada.

### Setup Inicial da VPS

**Opção rápida** — Execute o script automatizado na VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/JudahAragao/blacklotuscms/main/scripts/setup_vps.sh | sudo bash
```

O script vai:
1. Instalar Docker e Docker Compose
2. Instalar e configurar Nginx (com `location /uploads/`)
3. Criar a estrutura de diretórios em `/opt/apps/`
4. Criar o diretório compartilhado `/home/deploy/portfolio/uploads/` com permissões corretas
5. Criar `docker-compose.yml` com bind mount (não volume nomeado)
6. Criar `.env` com `GITHUB_USER`, senhas geradas, etc.
7. Iniciar o PostgreSQL

**Opção manual** — Se preferir configurar passo a passo:

```bash
# 1. Criar estrutura de diretórios
sudo mkdir -p /opt/apps/{blue,green,shared}

# 2. Criar diretório compartilhado de uploads (IMPORTANTE)
sudo mkdir -p /home/deploy/portfolio/uploads
sudo chown -R 1001:1001 /home/deploy/portfolio/uploads
sudo chmod 755 /home/deploy/portfolio/uploads
sudo chmod o+x /home/deploy /home/deploy/portfolio

# 3. Criar rede Docker compartilhada
docker network create blacklotus-network

# 4. Criar arquivo current
echo "blue" | sudo tee /opt/apps/current

# 5. Copiar docker-compose.yml do repositório para cada ambiente
# IMPORTANTE: Use bind mount, NÃO volume nomeado
cp deploy/blue/docker-compose.yml /opt/apps/blue/
cp deploy/green/docker-compose.yml /opt/apps/green/
cp deploy/shared/docker-compose.yml /opt/apps/shared/

# 6. Criar .env em AMBOS os ambientes (blue e green)
# Inclua GITHUB_USER senão o docker compose falha
nano /opt/apps/blue/.env
nano /opt/apps/green/.env

# 7. Configurar Nginx (com location /uploads/)
cat > /etc/nginx/conf.d/app.conf << 'EOF'
upstream backend {
    server 127.0.0.1:3001;  # blue = 3001, green = 3002
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
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

# 8. Instalar Docker (se não tiver)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 9. Login no GHCR (necessário para pull manual)
echo "SEU_TOKEN_GITHUB" | docker login ghcr.io -u SEU_USER --password-stdin
```

> ⚠️ **Erros comuns e como evitar:**
> - `EACCES: permission denied, mkdir '/app/uploads'` → rode `sudo chown -R 1001:1001 /home/deploy/portfolio/uploads`
> - `invalid reference format` → adicione `GITHUB_USER=seu-usuario` no `.env`
> - `403 Forbidden` em `/uploads/` → rode `sudo chmod o+x /home/deploy /home/deploy/portfolio`
> - `404 Not Found` em `/uploads/` → verifique se o nginx tem o bloco `location /uploads/`
> - Imagem não aparece → force refresh (`Ctrl+Shift+R`) ou limpe cache do browser

### Fluxo de Deploy

```
Push para main → Build Docker → Push GHCR → SSH VPS →
  1. Detecta ambiente inativo (green se blue está ativo)
  2. Login no GHCR
  3. Cria diretório /home/deploy/portfolio/uploads/ (se não existir)
  4. Ajusta permissões (chmod o+x, chown 1001:1001)
  5. Pull nova imagem
  6. Push schema (prisma db push) na primeira vez
  7. Limpa volumes nomeados antigos
  8. docker compose up -d
  9. Health check (até 60s)
  10. Atualiza Nginx upstream + /uploads/ location → nova porta
  11. Ambiente anterior fica como rollback
```

### Rollback

```bash
# Na VPS: alternar para o ambiente anterior
echo "blue" | sudo tee /opt/apps/current  # ou "green"
sudo systemctl reload nginx
```

### Logs e Debug

```bash
# Ver logs do app ativo
ACTIVE=$(cat /opt/apps/current)
cd /opt/apps/$ACTIVE
docker compose logs -f app

# Ver logs do PostgreSQL
cd /opt/apps/shared
docker compose logs -f postgres

# Status dos containers
docker ps --filter "name=blacklotus"

# Verificar uploads
ls -la /home/deploy/portfolio/uploads/

# Testar se nginx serve uploads (via localhost não funciona, use o domínio)
curl -I https://seu-dominio.com/uploads/thumb-xxx.webp

# Verificar permissões
ls -la /home/deploy/portfolio/uploads/
# Deve mostrar: -rw-r--r-- 1001 1001 (arquivos) e drwxr-xr-x 1001 1001 (pasta)
stat /home/deploy/portfolio/uploads/
# Deve mostrar: Access: (0755/drwxr-xr-x) e UID 1001
```

---

## License

MIT License - Copyright (c) 2026 BlackLotusCMS. See [LICENSE](./LICENSE) for details.
