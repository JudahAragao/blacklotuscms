#!/bin/bash
# ============================================================
# BlackLotusCMS - Local Development Setup
# ============================================================
# Idempotent: safe to run multiple times.
# First run: full setup. Subsequent runs: skip completed steps.
# Usage: bash setup_dev.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()   { echo -e "${BLUE}[dev]${NC} $1"; }
ok()    { echo -e "${GREEN}[ok]${NC} $1"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $1"; }
err()   { echo -e "${RED}[error]${NC} $1"; }

# ============================================================
# 0. Pré-requisitos
# ============================================================
log "Verifying prerequisites..."

MISSING=()

if ! command -v bun &>/dev/null; then
  MISSING+=("bun (https://bun.sh)")
fi

if ! command -v docker &>/dev/null; then
  MISSING+=("docker (https://docs.docker.com/get-docker/)")
fi

if ! command -v node &>/dev/null; then
  MISSING+=("node (https://nodejs.org)")
fi

# Check build tools for isolated-vm (node-gyp)
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
  MISSING+=("python3 (needed for native module compilation)")
fi
if ! command -v make &>/dev/null; then
  MISSING+=("make (needed for native module compilation)")
fi
if ! command -v g++ &>/dev/null && ! command -v gcc &>/dev/null; then
  MISSING+=("g++ (needed for native module compilation)")
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  err "Missing prerequisites:"
  for dep in "${MISSING[@]}"; do
    echo "  - $dep"
  done
  echo ""
  echo "Install them and run this script again."
  exit 1
fi

ok "All prerequisites found."

# ============================================================
# 1. .env setup
# ============================================================
if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env

  # Generate NEXTAUTH_SECRET automatically
  if command -v openssl &>/dev/null; then
    SECRET=$(openssl rand -hex 32)
    sed -i "s/NEXTAUTH_SECRET=CHANGE_ME/NEXTAUTH_SECRET=$SECRET/" .env
    ok "Generated NEXTAUTH_SECRET."
  else
    warn "openssl not found. Set NEXTAUTH_SECRET manually in .env"
  fi

  warn "Review .env and update DATABASE_URL, ADMIN_PASSWORD, etc."
else
  ok ".env already exists, skipping."
fi

# ============================================================
# 2. PostgreSQL via Docker
# ============================================================
if docker ps --format '{{.Names}}' | grep -q 'blacklotus-postgres'; then
  ok "PostgreSQL container already running."
else
  log "Starting PostgreSQL container..."

  # Check if container exists but is stopped
  if docker ps -a --format '{{.Names}}' | grep -q 'blacklotus-postgres'; then
    docker start blacklotus-postgres
    ok "PostgreSQL container restarted."
  else
    # Extract password from .env
    DB_PASS=$(grep '^DATABASE_URL=' .env | sed 's|.*:\([^@]*\)@.*|\1|')
    if [ -z "$DB_PASS" ]; then
      DB_PASS="password"
      warn "Could not extract DB password from .env, using default: password"
    fi

    docker run -d \
      --name blacklotus-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_DB=blacklotuscms \
      -e POSTGRES_PASSWORD="$DB_PASS" \
      -p 5432:5432 \
      postgres:15-alpine

    ok "PostgreSQL container started."
  fi
fi

# Wait for PostgreSQL to be ready
log "Waiting for PostgreSQL to accept connections..."
for i in $(seq 1 30); do
  if docker exec blacklotus-postgres pg_isready -U postgres &>/dev/null; then
    ok "PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    err "PostgreSQL did not become ready in time."
    exit 1
  fi
  sleep 1
done

# ============================================================
# 3. Install dependencies
# ============================================================
if [ -d "node_modules" ]; then
  log "node_modules exists, installing new dependencies only..."
  bun install --frozen-lockfile 2>/dev/null || bun install
else
  log "Installing all dependencies..."
  bun install
fi

# Ensure isolated-vm is compiled (node-gyp may fail with bun alone)
if [ -d "node_modules/isolated-vm" ]; then
  # Check if the native addon exists
  if ! find node_modules/isolated-vm -name "*.node" | head -1 | grep -q ".node"; then
    log "Rebuilding isolated-vm with npm (native compilation)..."
    if ! npm rebuild isolated-vm 2>/dev/null; then
      warn "isolated-vm rebuild failed. Plugins sandbox may not work."
      echo ""
      echo "  To fix this, install build tools and retry:"
      echo "    Ubuntu/Debian: sudo apt-get install -y python3 make g++"
      echo "    macOS:         xcode-select --install"
      echo "    Then run:      npm rebuild isolated-vm"
      echo ""
    fi
  fi
fi

ok "Dependencies installed."

# ============================================================
# 4. Prisma generate + db push
# ============================================================
log "Generating Prisma client..."
bunx prisma generate
ok "Prisma client generated."

# Check if database has tables
TABLE_COUNT=$(docker exec blacklotus-postgres psql -U postgres -d blacklotuscms -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ')

if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
  log "Database is empty, pushing schema..."
  bunx prisma db push --accept-data-loss
  ok "Schema pushed to database."
else
  log "Database has $TABLE_COUNT tables, checking for schema drift..."
  bunx prisma db push 2>/dev/null || warn "Schema drift detected. Run 'bunx prisma db push' manually if needed."
  ok "Schema up to date."
fi

# ============================================================
# 5. Generate theme and plugin registries
# ============================================================
log "Generating theme and plugin registries..."
npm run generate 2>/dev/null || {
  log "Running generators individually..."
  node scripts/generate-theme-registry.mjs 2>/dev/null || warn "Theme registry generation failed."
  node scripts/generate-plugin-registry.mjs 2>/dev/null || warn "Plugin registry generation failed."
}
ok "Registries generated."

# ============================================================
# 6. Create uploads directory
# ============================================================
if [ ! -d "uploads" ]; then
  mkdir -p uploads
  ok "Created uploads/ directory."
fi

# ============================================================
# 7. Create .secrets.json and .installed (legacy compat)
# ============================================================
touch .secrets.json .installed 2>/dev/null || true

# ============================================================
# 8. Summary
# ============================================================
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  BlackLotusCMS Development Environment Ready!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Database:  PostgreSQL on localhost:5432"
echo "  App:       http://localhost:3000"
echo "  Admin:     http://localhost:3000/admin"
echo ""
echo "  Start the dev server with:"
echo -e "    ${BLUE}bun run dev${NC}"
echo ""
echo "  Credentials (from .env):"
ADMIN_EMAIL=$(grep '^ADMIN_EMAIL=' .env | cut -d'=' -f2-)
ADMIN_PASS=$(grep '^ADMIN_PASSWORD=' .env | cut -d'=' -f2-)
echo "    Email:    ${ADMIN_EMAIL:-admin@blacklotuscms.com}"
echo "    Password: ${ADMIN_PASS:-CHANGE_ME}"
echo ""
echo -e "${YELLOW}  Tip: Run 'bun run dev' to start the development server.${NC}"
echo -e "${YELLOW}  The auto-install will create default roles, post types,${NC}"
echo -e "${YELLOW}  and admin user on first boot.${NC}"
echo ""
