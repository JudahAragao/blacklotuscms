# Compliance - LGPD & GDPR

## Overview
BlackLotusCMS includes features to support compliance with:
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

### Right to Access (Art. 15)
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
- Passwords hashed with bcrypt (cost 12)
- API keys hashed with SHA-256
- JWT tokens for session management
- Rate limiting on API endpoints
- Input validation with Zod schemas
- HTML sanitization with DOMPurify
- Path traversal protection
- CORS configuration

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
- Data processing agreements with cloud providers
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
- [x] S3/R2 with encryption
- [ ] Data retention policies

### Logging
- [x] Audit log for sensitive operations
- [ ] Log retention policy (90 days)
- [ ] IP anonymization in logs

## Configuration

### Environment Variables
```bash
# Data retention (days)
DATA_RETENTION_IP=90
DATA_RETENTION_SESSION=30

# Export settings
EXPORT_FORMAT=json
EXPORT_INCLUDE_POSTS=true
```

## References
- [LGPD Full Text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR Full Text](https://gdpr-info.eu/)
- [ANPD Guidelines](https://www.gov.br/anpd/)
