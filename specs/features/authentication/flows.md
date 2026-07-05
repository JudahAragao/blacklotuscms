---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Flows

## Login

1. **Usuario acessa /auth/login**
   - Estado: Formulario exibido

2. **Envia credenciais (email + password)**
   - Estado: Dados recebidos

3. **NextAuth CredentialsProvider authorize()**
   - Busca User por email
   - Compara bcrypt hash
   - Estado: Credenciais validadas

4. **JWT callback: token.id = user.id, token.role = user.role**
   - Estado: Token JWT criado

5. **Session callback: session.user.id = token.id**
   - Estado: Sessao disponivel

## API Key Auth

1. **Requisicao com header Authorization: Bearer bl_xxx**
   - Estado: Header detectado no proxy

2. **ApiKeyService.validateKey()**
   - Busca por SHA-256 hash
   - Verifica expiracao
   - Estado: Chave validada

3. **Rate limit check (in-memory cache)**
   - Estado: Dentro do limite ou erro 429

4. **Headers injetados: x-api-user-id, x-api-user-role**
   - Estado: Requisicao prossegue com identidade

## RBAC Check

1. **withApiAuth middleware**
   - Tenta NextAuth session
   - Se nao, tenta API Key headers
   - Estado: Identidade obtida

2. **hasCapability(role, capability)**
   - Se Administrador: retorna true
   - Senao: verifica capability JSON (nested paths suportados)
   - Estado: Autorizado ou 403
