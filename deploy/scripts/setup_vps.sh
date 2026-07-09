#!/bin/bash
set -e

# ============================================================
# BlackLotusCMS - VPS Setup Script (Blue-Green Deployment)
# ============================================================
# Run as: sudo bash setup_vps.sh
# ============================================================

APP_USER="deploy"
APP_DIR="/opt/apps"

echo "🚀 Setting up BlackLotusCMS Blue-Green Deployment..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p ${APP_DIR}/{blue,green,shared,scripts,nginx,cloudflared}

# Create shared docker network
echo "🌐 Creating shared Docker network..."
docker network create blacklotus-network 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
apt-get update -qq
apt-get install -y -qq nginx curl

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
    echo "🐳 Installing Docker Compose plugin..."
    apt-get install -y -qq docker-compose-plugin
fi

# Install cloudflared if not present
if ! command -v cloudflared &> /dev/null; then
    echo "☁️ Installing cloudflared..."
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

# Setup nginx configuration
echo "🔧 Configuring Nginx..."
cp /opt/apps/nginx/nginx.conf /etc/nginx/nginx.conf 2>/dev/null || true
cp /opt/apps/nginx/app.conf /etc/nginx/conf.d/app.conf 2>/dev/null || true

# Test nginx configuration
nginx -t && systemctl reload nginx

# Setup cloudflared service
echo "☁️ Configuring Cloudflared service..."
cat > /etc/systemd/system/cloudflared.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared --no-autoupdate --config /opt/apps/cloudflared/config.yml tunnel run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cloudflared
systemctl restart cloudflared

# Create persistent directories for the app
echo "📁 Creating persistent app directories..."
mkdir -p /opt/apps/shared/uploads /opt/apps/shared/themes /opt/apps/shared/plugins
chown -R ${APP_USER}:${APP_USER} /opt/apps/shared

# Set permissions
echo "🔒 Setting permissions..."
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# Initialize current environment
echo "blue" > ${APP_DIR}/current

# Start shared services (database)
echo "🗄️ Starting shared services..."
cd ${APP_DIR}/shared
docker compose up -d

echo ""
echo "✅ VPS setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /home/deploy/portfolio"
echo "2. Run: cd /opt/apps/scripts && bash switch.sh blue"
echo "3. Access your site at https://judahdearagao.pro"
echo ""
echo "Note: /opt/apps/shared/uploads, /opt/apps/shared/themes and /opt/apps/shared/plugins"
echo "are already created and ready for persistent data."
echo ""
