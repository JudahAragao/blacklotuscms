---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Integrations - BlackLotusCMS

## 1. PostgreSQL (Database)

- **Method:** TCP via PrismaPg adapter (connection pooling)
- **Usage:** Banco de dados principal, todas as entidades
- **Auth Flow:** Connection string via .secrets.json (DATABASE_URL)
- **Fallback:** Erro claro se DATABASE_URL não configurado; PrismaProxy permite lazy init

## 2. AWS S3 / Cloudflare R2 (Object Storage)

- **Method:** AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/lib-storage)
- **Usage:** Armazenamento de uploads de mídia (imagens processadas)
- **Auth Flow:** Access Key + Secret Key configurados via admin ou .secrets.json
- **Fallback:** Se S3/R2 falha, erro é logado e upload falha com 500; Storage driver configurável (local/s3/r2)

## 3. Sharp (Image Processing)

- **Method:** Lib nativa Node.js
- **Usage:** Conversão para WebP, geração de thumbnails 300x300, extração de metadados
- **Auth Flow:** N/A (lib local)
- **Fallback:** Erro de processamento lança BlackLotusCMSError 500

## 4. DOMPurify (HTML Sanitization)

- **Method:** isomorphic-dompurify (SSR + client compatible)
- **Usage:** Sanitização de HTML em hooks, conteúdo de temas, queries de busca
- **Auth Flow:** N/A (lib local)
- **Fallback:** N/A (operação síncrona local)

## 5. NextAuth (Authentication)

- **Method:** next-auth v4 com @next-auth/prisma-adapter
- **Usage:** Autenticação JWT, sessões, callbacks
- **Auth Flow:** CredentialsProvider -> JWT token -> session callback
- **Fallback:** N/A (core dependency)

## 6. Apollo Server (GraphQL)

- **Method:** @apollo/server v5 + @as-integrations/next
- **Usage:** API GraphQL type-safe com Pothos schema builder
- **Auth Flow:** Session via getServerSession ou headers injetados pelo proxy (API Key)
- **Fallback:** Introspection desativada em produção

## 7. Pothos (Schema Builder)

- **Method:** @pothos/core + @pothos/plugin-prisma + @pothos/plugin-scope-auth
- **Usage:** Construção type-safe do schema GraphQL com Prisma types
- **Auth Flow:** Scope auth via authScopes (public, authenticated, hasCapability)
- **Fallback:** N/A (build-time tool)

## 8. Zod (Validation)

- **Method:** zod v4
- **Usage:** Validação de todos os inputs de API (post, comment, install form)
- **Auth Flow:** N/A
- **Fallback:** Erros de validação retornam 400 com details

## 9. bcryptjs (Password Hashing)

- **Method:** bcryptjs v3
- **Usage:** Hash de senhas de usuários (cost factor 12)
- **Auth Flow:** N/A
- **Fallback:** N/A
