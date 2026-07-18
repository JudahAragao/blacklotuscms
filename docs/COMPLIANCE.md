# Compliance - LGPD & GDPR

## Overview
BlackLotusCMS includes features to support compliance com:
- **LGPD** (Lei Geral de Protecao de Dados) - Brazil
- **GDPR** (General Data Protection Regulation) - European Union

## Data Processing

### Personal Data Collected
| Data Type | Source | Purpose | Retention |
|-----------|--------|---------|-----------|
| Email | User registration | Authentication | Until account deletion |
| Password Hash | User registration | Authentication | Until account deletion |
| IP Address | Comments | Spam prevention | 90 days |
| Name | Comments | Display | Until comment deletion |
| Session Token | Login | Authentication | Until logout/expiry |

### Legal Basis (GDPR Art. 6)
- **Consent:** User registration, comments
- **Contract:** Account management
- **Legitimate Interest:** Spam prevention, security logging

## Data Subject Rights

### Right to Acesso (Art. 15)
Users can request a copy of their personal data.

**Implementation:**
```typescript
// GET /api/v1/users/:id/data
// Returns all personal data for the user
```

### Right to Rectification (Art. 16)
Users can update their personal data via profile page.

### Right to Erasure (Art. 17)
Users can request account deletion.

**Implementation:**
```typescript
// DELETE /api/v1/users/:id
// Removes user and associated data
// Posts are anonymized or deleted based on config
```

### Right to Data Portability (Art. 20)
Users can export their data in JSON format.

**Implementation:**
```typescript
// GET /api/v1/users/:id/export
// Returns user data + posts in JSON
```

### Right to Object (Art. 21)
Users can opt-out of non-essential processing.

## Data Processing Records

### Records of Processing Activities (Art. 30)
Documented in this file and `specs/architecture/security.md`.

## Security Measures

### Technical Measures
- Passwords hashed com bcrypt (cost 12)
- API keys hashed com SHA-256
- JWT tokens for session management
- Rate limiting on API endpoints (Redis recommended for multi-container)
- Input validation com Zod schemas
- HTML sanitization com DOMPurify + iframe domain allowlist
- Path traversal protection
- CORS configuration
- CSP nonces em producao (via `CSP_NONCE_ENABLED=true`)
- NEXTAUTH_SECRET obrigatorio (app falha se ausente)
- ADMIN_PASSWORD validado (rejeita defaults fracos em producao)
- API Key re-validada em route handlers (headers injetados nao sao confiados)

### Organizational Measures
- Role-based access control (RBAC)
- Audit logging for sensitive operations
- Plugin sandboxing (isolated-vm)
- Theme permission validation

## Data Protection Impact Assessment (DPIA)

### High-Risk Processing
- Large-scale comment processing
- Automated spam detection

### Mitigations
- IP anonymization after 90 days
- Captcha for comment submission
- Manual moderation option

## International Data Transfers

### Storage Locations
- **Default:** Local filesystem (same server)
- **Optional:** AWS S3 / Cloudflare R2

### Safeguards
- Data processing agreements com cloud providers
- Encryption in transit (TLS)
- Encryption at rest (S3 server-side encryption)

## Cookie Policy

### Essential Cookies
| Cookie | Purpose | Duration |
|--------|---------|----------|
| next-auth.session-token | Authentication | Session |
| next-auth.callback-url | Login redirect | Session |
| next-auth.csrf-token | CSRF protection | Session |

### No Tracking Cookies
BlackLotusCMS does not set tracking cookies by default.

## Data Breach Response

### Notification Timeline
- **72 hours** to notify supervisory authority (GDPR Art. 33)
- **Without undue delay** to affected users (GDPR Art. 34)

### Response Steps
1. Identify and contain the breach
2. Assess risk to individuals
3. Notify authority if high risk
4. Notify affected users if high risk
5. Document the breach and response

## Implementation Checklist

### User Management
- [x] Password hashing (bcrypt)
- [x] Account deletion endpoint
- [ ] Data export endpoint
- [ ] Profile data access page

### Comments
- [x] IP collection for spam prevention
- [x] IP anonymization after retention period
- [ ] Comment deletion on user request

### Data Storage
- [x] Local storage option
- [x] S3/R2 com encryption
- [ ] Data retention policies

### Logging
- [x] Audit log for sensitive operations
- [ ] Log retention policy (90 days)
- [ ] IP anonymization in logs

## Configuration

### Secrets Management (.secrets.json)
All configuration is stored in `.secrets.json` via the Zero .env Architecture:

```json
{
  "DATABASE_URL": "postgresql://user:pass@host:5432/db",
  "NEXTAUTH_SECRET": "auto-generated",
  "NEXTAUTH_URL": "http://localhost:3000",
  "STORAGE_DRIVER": "local",
  "UPLOAD_DIR": "./uploads",
  "SANDBOX_MEMORY_LIMIT": "512",
  "SANDBOX_TIMEOUT": "30"
}
```

### Data Retention Settings
Data retention policies are configured via database settings (Settings table), not environment variables:

- **IP retention for comments:** 90 days (configurable via admin panel)
- **Session retention:** Until logout/expiry
- **Export format:** JSON (configurable)

## References
- [LGPD Full Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR Full Text](https://gdpr-info.eu/)
- [ANPD Guidelines](https://www.gov.br/anpd/)
