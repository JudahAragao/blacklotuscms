#!/bin/bash

# Script to create Docker secrets for BlackLotusCMS
# Run this before docker-compose up if using Docker Swarm

set -e

# Generate random NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Ask for database credentials
read -p "PostgreSQL Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "PostgreSQL Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "PostgreSQL Database (default: blacklotuscms): " DB_NAME
DB_NAME=${DB_NAME:-blacklotuscms}

read -p "PostgreSQL User (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "PostgreSQL Password: " DB_PASSWORD
echo ""

read -p "NextAuth URL (default: http://localhost:3000): " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

# Create database URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo "Creating Docker secrets..."

# Create secrets
echo "$NEXTAUTH_SECRET" | docker secret create nextauth-secret -
echo "$DATABASE_URL" | docker secret create database-url -

echo ""
echo "Secrets created successfully:"
echo "- nextauth-secret"
echo "- database-url"

echo ""
echo "To deploy with Docker Swarm:"
echo "docker stack deploy -c docker-compose.yml blacklotuscms"

# Note: For production, you might want to use a more secure way to handle secrets
# Consider using environment variables or a secret management system