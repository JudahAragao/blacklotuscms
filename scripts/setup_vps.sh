#!/usr/bin/env bash
# =============================================================================
# BlackLotusCMS — VPS Setup Script
# Automatiza toda a infraestrutura para deploy Blue/Green via GitHub Actions.
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/JudahAragao/porftolio/main/scripts/setup_vps.sh | bash
#   ou
#   chmod +x scripts/setup_vps.sh && sudo ./scripts/setup_vps.sh
#
# Prerequisitos:
#   - Ubuntu 22.04+ (ou Debian 12+)
#   - Acesso root ou sudo
#   - Porta 80 e 5432 disponíveis
# =============================================================================

set -euo pipefail

# --- Cores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Verificar root ---
if [ "$EUID" -ne 0 ]; then
  error "Execute como root: sudo ./scripts/setup_vps.sh"
fi

# =============================================================================
# 1. Coletar informações do usuário
# =============================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   BlackLotusCMS — Setup VPS (Blue/Green)        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

read -rp "GitHub username (para GHCR image): " GITHUB_USER
[ -z "$GITHUB_USER" ] && error "GitHub username é obrigatório."

read -rp "Domínio do site (ex: judahdearagao.pro): " DOMAIN
[ -z "$DOMAIN" ] && error "Domínio é obrigatório."

read -rp "Senha do PostgreSQL (deixe vazio para gerar automaticamente): " PG_PASSWORD
if [ -z "$PG_PASSWORD" ]; then
  PG_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
  info "Senha do PostgreSQL gerada: $PG_PASSWORD"
fi

read -rp "NEXTAUTH_SECRET (deixe vazio para gerar automaticamente): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
  NEXTAUTH_SECRET=$(openssl rand -hex 32)
  info "NEXTAUTH_SECRET gerado."
fi

read -rp "NEXTAUTH_URL (deixe vazio para usar https://$DOMAIN): " NEXTAUTH_URL
NEXTAUTH_URL="${NEXTAUTH_URL:-https://$DOMAIN}"

echo ""
info "Resumo da configuração:"
echo "  GitHub User:    $GITHUB_USER"
echo "  Domínio:        $DOMAIN"
echo "  NEXTAUTH_URL:   $NEXTAUTH_URL"
echo "  PG Password:    ${PG_PASSWORD:0:4}****"
echo ""
read -rp "Confirmar? (y/N): " CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || error "Setup cancelado."

# =============================================================================
# 2. Instalar dependências do sistema
# =============================================================================
info "Atualizando pacotes do sistema..."
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg lsb-release nginx > /dev/null 2>&1
ok "Nginx e dependências instalados."

# =============================================================================
# 3. Instalar Docker
# =============================================================================
if command -v docker &> /dev/null; then
  warn "Docker já instalado: $(docker --version)"
else
  info "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
  ok "Docker instalado: $(docker --version)"
fi

# Instalar Docker Compose plugin se não existir
if ! docker compose version &> /dev/null; then
  info "Instalando Docker Compose plugin..."
  apt-get install -y -qq docker-compose-plugin > /dev/null 2>&1
  ok "Docker Compose plugin instalado."
else
  warn "Docker Compose já instalado: $(docker compose version --short)"
fi

# =============================================================================
# 4. Criar estrutura de diretórios
# =============================================================================
info "Criando estrutura de diretórios em /opt/apps/..."
mkdir -p /opt/apps/{blue,green,shared}
ok "Diretórios criados."

# =============================================================================
# 5. Criar diretório compartilhado de uploads (bind mount)
# =============================================================================
info "Criando diretório compartilhado de uploads..."
mkdir -p /home/deploy/portfolio/uploads

# O container Next.js roda como UID 1001 (nextjs)
chown -R 1001:1001 /home/deploy/portfolio/uploads
chmod 755 /home/deploy/portfolio/uploads

# Garantir que o nginx (e qualquer outro processo) consiga acessar
chmod o+x /home/deploy /home/deploy/portfolio
ok "Diretório de uploads pronto: /home/deploy/portfolio/uploads"

# =============================================================================
# 6. Criar rede Docker compartilhada
# =============================================================================
info "Criando rede Docker blacklotus-network..."
docker network create blacklotus-network 2>/dev/null || warn "Rede já existe."
ok "Rede Docker pronta."

# =============================================================================
# 7. Criar arquivo /opt/apps/current
# =============================================================================
echo "blue" | tee /opt/apps/current > /dev/null
ok "Ambiente inicial definido como: blue"

# =============================================================================
# 8. Criar docker-compose.yml para cada ambiente (com bind mount)
# =============================================================================
info "Criando docker-compose.yml para blue (porta 3001)..."
cat > /opt/apps/blue/docker-compose.yml << 'BLUEEOF'
services:
  app:
    image: ghcr.io/${GITHUB_USER}/blacklotuscms:latest
    container_name: blacklotus-blue-app
    ports:
      - "3001:3000"
    volumes:
      - /home/deploy/portfolio/uploads:/app/uploads
      - ./.env:/app/.env
    env_file:
      - .env
    networks:
      - blacklotus-network
    restart: unless-stopped

networks:
  blacklotus-network:
    external: true
BLUEEOF

info "Criando docker-compose.yml para green (porta 3002)..."
cat > /opt/apps/green/docker-compose.yml << 'GREENEOF'
services:
  app:
    image: ghcr.io/${GITHUB_USER}/blacklotuscms:latest
    container_name: blacklotus-green-app
    ports:
      - "3002:3000"
    volumes:
      - /home/deploy/portfolio/uploads:/app/uploads
      - ./.env:/app/.env
    env_file:
      - .env
    networks:
      - blacklotus-network
    restart: unless-stopped

networks:
  blacklotus-network:
    external: true
GREENEOF

info "Criando docker-compose.yml para shared (PostgreSQL)..."
cat > /opt/apps/shared/docker-compose.yml << 'SHAREDEOF'
services:
  postgres:
    image: postgres:15-alpine
    container_name: blacklotus-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_DB: blacklotuscms
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - blacklotus-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  blacklotus-network:
    external: true
SHAREDEOF

ok "Arquivos docker-compose.yml criados."

# =============================================================================
# 9. Criar .env para cada ambiente
# =============================================================================
ENV_CONTENT="# BlackLotusCMS Environment Variables
GITHUB_USER=${GITHUB_USER}
DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@blacklotus-postgres:5432/blacklotuscms
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}
STORAGE_DRIVER=local
UPLOAD_DIR=uploads
"

info "Criando .env para blue..."
echo "$ENV_CONTENT" > /opt/apps/blue/.env

info "Criando .env para green..."
echo "$ENV_CONTENT" > /opt/apps/green/.env

info "Criando .env para shared (PostgreSQL)..."
echo "POSTGRES_PASSWORD=${PG_PASSWORD}" > /opt/apps/shared/.env

ok "Arquivos .env criados."

# =============================================================================
# 10. Login no GitHub Container Registry (GHCR)
# =============================================================================
info "Configurando acesso ao GHCR..."
info "IMPORTANTE: O deploy via GitHub Actions faz login automaticamente."
info "Se precisar pull manualmente, execute:"
info "  echo <TOKEN> | docker login ghcr.io -u $GITHUB_USER --password-stdin"

# =============================================================================
# 11. Configurar Nginx (com /uploads/ location)
# =============================================================================
info "Configurando Nginx..."

# Descobrir porta do ambiente ativo
ACTIVE=$(cat /opt/apps/current)
if [ "$ACTIVE" = "blue" ]; then
  APP_PORT=3001
else
  APP_PORT=3002
fi

# Remover config padrão
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/conf.d/app.conf << NGINXEOF
upstream backend {
    server 127.0.0.1:${APP_PORT};
}

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    client_max_body_size 64M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /uploads/ {
        alias /home/deploy/portfolio/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Testar e recarregar Nginx
if nginx -t 2>&1; then
  systemctl reload nginx
  ok "Nginx configurado e recarregado (com /uploads/ location)."
else
  error "Falha na configuração do Nginx!"
fi

# =============================================================================
# 12. Iniciar PostgreSQL
# =============================================================================
info "Iniciando PostgreSQL..."
cd /opt/apps/shared
docker compose up -d
sleep 3

# Verificar se PostgreSQL está healthy
for i in $(seq 1 10); do
  if docker exec blacklotus-postgres pg_isready -U postgres > /dev/null 2>&1; then
    ok "PostgreSQL está healthy!"
    break
  fi
  if [ $i -eq 10 ]; then
    warn "PostgreSQL pode não estar pronto ainda. Verifique com: docker logs blacklotus-postgres"
  fi
  sleep 2
done

# =============================================================================
# 13. Habilitar Docker no boot
# =============================================================================
systemctl enable docker > /dev/null 2>&1
ok "Docker habilitado no boot."

# =============================================================================
# Resumo Final
# =============================================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup VPS Concluído com Sucesso!              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Estrutura criada:"
echo "    /opt/apps/blue/                    → App blue (porta 3001)"
echo "    /opt/apps/green/                   → App green (porta 3002)"
echo "    /opt/apps/shared/                  → PostgreSQL"
echo "    /opt/apps/current                  → \"blue\" (ambiente ativo)"
echo "    /home/deploy/portfolio/uploads/    → Uploads compartilhados (bind mount)"
echo ""
echo "  Ambiente ativo: $ACTIVE (porta $APP_PORT)"
echo "  Nginx: $DOMAIN → http://127.0.0.1:$APP_PORT"
echo ""
echo "  ⚠️  O diretório /home/deploy/portfolio/uploads/ é compartilhado"
echo "     entre blue, green e nginx via bind mount."
echo "     Permissões: UID 1001 (nextjs) é dono, nginx tem acesso."
echo ""
echo "  Próximos passos:"
echo "    1. Configure os GitHub Secrets no repositório:"
echo "       - VPS_HOST=$(curl -s ifconfig.me 2>/dev/null || echo '<seu-ip>')"
echo "       - VPS_USER=deploy (ou o usuário SSH que você usar)"
echo "       - VPS_SSH_KEY=<sua-chave-ssh-privada>"
echo ""
echo "    2. Faça push para a branch main para iniciar o deploy:"
echo "       git push origin main"
echo ""
echo "    3. Para acessar o admin pela primeira vez:"
echo "       http://$DOMAIN/install"
echo ""
echo "  📋 Senha do PostgreSQL salva em: /opt/apps/blue/.env"
echo "  ⚠️  Guarde a senha do PostgreSQL em local seguro!"
echo ""
