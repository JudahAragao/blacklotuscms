---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Error States

## ERR-01: Unauthorized
- **Condition:** No authentication provided
- **HTTP Code:** 401
- **Message:** "Unauthorized. Provide a valid API Key or log in."
- **Action:** Blocks access

## ERR-02: Forbidden
- **Condition:** Authenticated user but missing required capability
- **HTTP Code:** 403
- **Message:** "No permission to perform this action"
- **Action:** Attempt logged with userId

## ERR-03: Rate Limit Exceeded
- **Condition:** API Key exceeded rate limit
- **HTTP Code:** 429
- **Message:** "Request limit exceeded (Rate Limit)"
- **Code:** RATE_LIMIT_EXCEEDED

## ERR-04: Internal Auth Error
- **Condition:** Internal error during authentication
- **HTTP Code:** 500
- **Message:** "Internal authentication error"
- **Action:** Error logged