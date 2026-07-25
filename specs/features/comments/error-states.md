---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Error States

## ERR-01: Zod Validation
- **Condition:** Invalid data
- **HTTP Code:** 400
- **Message:** Field details

## ERR-02: Mandatory Captcha
- **Condition:** captcha_enabled and captchaToken missing
- **HTTP Code:** 400
- **Message:** "Required captcha not sent."

## ERR-03: No Permission to Delete
- **Condition:** User without comment.manage
- **HTTP Code:** 403
- **Message:** "No permission to delete comments"
