---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Flows

## Login

1. **User acessa /auth/login**
   - State: Form displayed

2. **Envia credenciais (email + password)**
   - State: Data received

3. **NextAuth CredentialsProvider authorize()**
   - Busca User por email
   - Compara bcrypt hash
   - State: Credentials validadas

4. **JWT callback: token.id = user.id, token.role = user.role**
   - State: JWT token created

5. **Session callback: session.user.id = token.id**
   - State: Session available

## API Key Auth

1. **Requisicao com header Authorization: Bearer bl_xxx**
   - State: Header detected in proxy

2. **ApiKeyService.validateKey()**
   - Busca por SHA-256 hash
   - Verifica expiracao
   - State: Key validated

3. **Rate limit check (in-memory cache)**
   - State: Within limit ou erro 429

4. **Headers injetados: x-api-user-id, x-api-user-role**
   - State: Requisicao prossegue com identidade

## RBAC Check

1. **withApiAuth middleware**
   - Tenta NextAuth session
   - Se nao, tenta API Key headers
   - State: Identity obtained

2. **hasCapability(role, capability)**
   - Se Administrador: returns true
   - Otherwise: verifica capability JSON (nested paths supported)
   - State: Authorized or 403
