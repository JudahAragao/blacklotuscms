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

RUN mkdir -p uploads plugins && chown nextjs:nodejs uploads plugins

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

# Prisma + pg packages for database connectivity (not bundled by standalone)
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/pg ./node_modules/pg
COPY --from=deps /app/node_modules/pg-hstore ./node_modules/pg-hstore
COPY --from=deps /app/node_modules/pg-query-stream ./node_modules/pg-query-stream
COPY --from=deps /app/node_modules/protobufjs ./node_modules/protobufjs
COPY --from=deps /app/node_modules/lossless-json ./node_modules/lossless-json

# jsdom + isomorphic-dompurify runtime deps (serverExternalPackages)
COPY --from=deps /app/node_modules/jsdom ./node_modules/jsdom
COPY --from=deps /app/node_modules/isomorphic-dompurify ./node_modules/isomorphic-dompurify
COPY --from=deps /app/node_modules/dompurify ./node_modules/dompurify
COPY --from=deps /app/node_modules/css-tree ./node_modules/css-tree
COPY --from=deps /app/node_modules/mdn-data ./node_modules/mdn-data
COPY --from=deps /app/node_modules/source-map-js ./node_modules/source-map-js
COPY --from=deps /app/node_modules/@csstools ./node_modules/@csstools
COPY --from=deps /app/node_modules/@asamuzakjp ./node_modules/@asamuzakjp
COPY --from=deps /app/node_modules/@bramus ./node_modules/@bramus
COPY --from=deps /app/node_modules/@exodus ./node_modules/@exodus
COPY --from=deps /app/node_modules/bidi-js ./node_modules/bidi-js
COPY --from=deps /app/node_modules/data-urls ./node_modules/data-urls
COPY --from=deps /app/node_modules/decimal.js ./node_modules/decimal.js
COPY --from=deps /app/node_modules/entities ./node_modules/entities
COPY --from=deps /app/node_modules/html-encoding-sniffer ./node_modules/html-encoding-sniffer
COPY --from=deps /app/node_modules/is-potential-custom-element-name ./node_modules/is-potential-custom-element-name
COPY --from=deps /app/node_modules/lru-cache ./node_modules/lru-cache
COPY --from=deps /app/node_modules/parse5 ./node_modules/parse5
COPY --from=deps /app/node_modules/saxes ./node_modules/saxes
COPY --from=deps /app/node_modules/symbol-tree ./node_modules/symbol-tree
COPY --from=deps /app/node_modules/tough-cookie ./node_modules/tough-cookie
COPY --from=deps /app/node_modules/tldts ./node_modules/tldts
COPY --from=deps /app/node_modules/tldts-core ./node_modules/tldts-core
COPY --from=deps /app/node_modules/tr46 ./node_modules/tr46
COPY --from=deps /app/node_modules/undici ./node_modules/undici
COPY --from=deps /app/node_modules/w3c-xmlserializer ./node_modules/w3c-xmlserializer
COPY --from=deps /app/node_modules/webidl-conversions ./node_modules/webidl-conversions
COPY --from=deps /app/node_modules/whatwg-mimetype ./node_modules/whatwg-mimetype
COPY --from=deps /app/node_modules/whatwg-url ./node_modules/whatwg-url
COPY --from=deps /app/node_modules/xml-name-validator ./node_modules/xml-name-validator
COPY --from=deps /app/node_modules/xmlchars ./node_modules/xmlchars

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
