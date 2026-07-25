---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Acceptance Tests

## AT-01: Login with Valid Credentials
- **GIVEN** existing user with correct email and password
- **WHEN** sends POST /api/auth/[...nextauth] with credentials
- **THEN** JWT is returned and session is created
- **Reference:** FR01

## AT-02: Login with Invalid Credentials
- **GIVEN** non-existent email or incorrect password
- **WHEN** attempts to authenticate
- **THEN** returns null (silent failure)
- **Reference:** FR01

## AT-03: Access with Valid API Key
- **GIVEN** active and non-expired API Key
- **WHEN** request with valid Bearer token
- **THEN** headers x-api-user-id and x-api-user-role injected
- **Reference:** FR03

## AT-04: Access with Expired API Key
- **GIVEN** API Key with expiresAt in the past
- **WHEN** attempts to authenticate
- **THEN** key is rejected, next auth check (session) is attempted
- **Reference:** FR03

## AT-05: Rate Limit Exceeded
- **GIVEN** API Key with rateLimit=60
- **WHEN** more than 60 requests in 1 minute
- **THEN** returns 429 with RATE_LIMIT_EXCEEDED
- **Reference:** FR24

## AT-06: Administrator Bypass
- **GIVEN** user with "Administrator" role
- **WHEN** any capability check is executed
- **THEN** returns true regardless of capability
- **Reference:** FR02, BR03