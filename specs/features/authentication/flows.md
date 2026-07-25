---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Flows

## Login

1. **User accesses /auth/login**
   - State: Form displayed

2. **Sends credentials (email + password)**
   - State: Data received

3. **NextAuth CredentialsProvider authorize()**
   - Searches User by email
   - Compares bcrypt hash
   - State: Credentials validated

4. **JWT callback: token.id = user.id, token.role = user.role**
   - State: JWT token created

5. **Session callback: session.user.id = token.id**
   - State: Session available

## API Key Auth

1. **Request with Authorization header: Bearer bl_xxx**
   - State: Header detected in proxy

2. **ApiKeyService.validateKey()**
   - Searches by SHA-256 hash
   - Verifies expiration
   - State: Key validated

3. **Rate limit check (in-memory cache)**
   - State: Within limit or error 429

4. **Injected headers: x-api-user-id, x-api-user-role**
   - State: Request proceeds with identity

## RBAC Check

1. **withApiAuth middleware**
   - Tries NextAuth session
   - If not, tries API Key headers
   - State: Identity obtained

2. **hasCapability(role, capability)**
   - If Administrator: returns true
   - Otherwise: verifies capability JSON (nested paths supported)
   - State: Authorized or 403