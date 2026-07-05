#!/bin/bash

# BlackLotusCMS Setup Script
# This script prepares the environment for the first Docker run.

set -e

echo "🚀 BlackLotusCMS: Preparing environment..."

# ------------------------------------------------------------------------------
# THE PERSISTENCE WORKAROUND
# ------------------------------------------------------------------------------
# Docker Compose needs these files to exist so they can be mounted as volumes.
# The web-based Installation Page will finalize their content.
# ------------------------------------------------------------------------------

echo "📁 Creating persistent configuration placeholders..."
touch .secrets.json
touch .installed

echo "✅ Environment ready!"
echo ""
echo "🐳 Starting Docker containers (this may take a few minutes)..."
docker compose up -d --build

echo ""
echo "✅ System started successfully!"
echo "Visit http://localhost:3000/install to complete your setup."
