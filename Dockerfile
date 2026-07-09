# Multi-stage build for production com Bun
FROM oven/bun:1 AS base

# Estágio de Dependências
FROM base AS deps
WORKDIR /app

# Build tools + Node.js para compilar isolated-vm (bun não tem process.config)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* ./

# Ignora scripts nativos no bun install (bun não consegue compilar isolated-vm)
RUN bun install --frozen-lockfile --ignore-scripts

# Rebuild isolated-vm com Node.js (bun não tem process.config pra node-gyp)
RUN npm rebuild isolated-vm

# Estágio de Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma - gerar tipos
RUN DATABASE_URL="postgresql://placeholder:5432/db" bunx prisma generate

# Cria .env placeholder para que o config.ts valide durante o build
RUN echo 'DATABASE_URL=postgresql://placeholder:5432/db\nNEXTAUTH_SECRET=build-placeholder\nNEXTAUTH_URL=http://localhost:3000\nSTORAGE_DRIVER=local\nUPLOAD_DIR=uploads' > .env

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SKIP_LOCKFILE_PATCHING=1
RUN bun run build

# Estágio de Runner (Produção)
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

RUN mkdir -p uploads themes plugins && chown nextjs:nodejs uploads themes plugins

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/themes ./themes

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
