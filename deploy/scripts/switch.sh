#!/bin/bash
set -e

# ============================================================
# BlackLotusCMS - Blue-Green Switch Script
# ============================================================
# Usage: bash switch.sh [blue|green]
# ============================================================

TARGET=$1
CURRENT=$(cat /opt/apps/current 2>/dev/null || echo "none")

if [ -z "$TARGET" ]; then
    echo "Usage: bash switch.sh [blue|green]"
    echo "Current active: $CURRENT"
    exit 1
fi

if [ "$TARGET" != "blue" ] && [ "$TARGET" != "green" ]; then
    echo "❌ Invalid target: $TARGET (must be 'blue' or 'green')"
    exit 1
fi

if [ "$TARGET" = "$CURRENT" ]; then
    echo "⚠️  $TARGET is already active. Nothing to do."
    exit 0
fi

echo "🔄 Switching from $CURRENT to $TARGET..."

# Determine the port
if [ "$TARGET" = "blue" ]; then
    PORT=3001
else
    PORT=3002
fi

# Stop old environment containers
echo "⏹️  Stopping $CURRENT environment..."
cd /opt/apps/$CURRENT
docker compose down 2>/dev/null || true

# Update nginx configuration
echo "🔧 Updating Nginx upstream to port $PORT..."
cat > /etc/nginx/conf.d/app.conf << NGINXEOF
upstream backend {
    server 127.0.0.1:${PORT};
}

server {
    listen 80;
    server_name judahdearagao.pro www.judahdearagao.pro;

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
        alias /opt/apps/shared/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Test and reload nginx
nginx -t && systemctl reload nginx
echo "✅ Nginx reloaded"

# Start new environment
echo "🚀 Starting $TARGET environment..."
cd /opt/apps/$TARGET
docker compose up -d --build

# Update current marker
echo "$TARGET" > /opt/apps/current

echo ""
echo "✅ Switched to $TARGET (port $PORT)"
echo "🌐 https://judahdearagao.pro"
echo ""
