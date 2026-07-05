# Multi-stage build for production com pnpm
FROM node:22-alpine AS base

# Corepack para pnpm nativo
RUN corepack enable pnpm

# Estágio de Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia arquivos de definição de dependências
COPY package.json pnpm-lock.yaml* ./

# Instala dependências usando pnpm
RUN pnpm i --frozen-lockfile

# Estágio de Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma - gerar tipos (usa o binário do prisma instalado via pnpm)
RUN DATABASE_URL="postgresql://placeholder:5432/db" pnpm exec prisma generate

# Build da aplicação Next.js com standalone output
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

# Estágio de Runner (Produção)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cria diretório de uploads padrão (usado no local storage)
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# Next.js standalone output
# Quando output: 'standalone' está ativo no next.config.ts, 
# o build gera uma pasta em .next/standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# O Next.js standalone gera um server.js na raiz
CMD ["node", "server.js"]
