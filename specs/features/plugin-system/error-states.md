---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "plugin-system"
---

# Plugin System Error States

## ERR-01: Plugin Not Found
- **Condition:** Plugin ID does not exist
- **HTTP Code:** 404
- **Message:** "Plugin not found"

## ERR-02: Invalid Plugin ZIP
- **Condition:** Corrupted ZIP or missing plugin.json
- **HTTP Code:** 400
- **Message:** "Invalid or corrupted plugin"
- **Action:** Plugin folder removed

## ERR-03: Sandbox Timeout
- **Condition:** Plugin code exceeded SANDBOX_TIMEOUT
- **HTTP Code:** 408
- **Message:** "Plugin exceeded resource limits (Time/Memory)"
- **Code:** RATE_LIMIT_EXCEEDED

## ERR-04: Plugin Permission Denied
- **Condition:** Plugin without approved permission
- **HTTP Code:** 403
- **Message:** "Access denied for '[capability]'"
- **Code:** AUTH_FORBIDDEN

## ERR-05: DB Rate Limit
- **Condition:** Plugin exceeded 50 queries/second
- **HTTP Code:** 429
- **Message:** "Database rate limit exceeded by plugin"
- **Code:** RATE_LIMIT_EXCEEDED