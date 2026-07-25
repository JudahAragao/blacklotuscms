---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Acceptance Tests

## AT-01: Valid Comment
- **GIVEN** valid data (postId, author, email, content)
- **WHEN** sends POST /api/v1/public/comments
- **THEN** comment created with status pending or approved
- **Reference:** FR14

## AT-02: Spam Detected
- **GIVEN** comment with 3 URLs
- **WHEN** processed by anti-spam
- **THEN** status = "spam"
- **Reference:** FR15

## AT-03: Mandatory Captcha
- **GIVEN** captcha_enabled = true
- **WHEN** sends without captchaToken
- **THEN** 400 error returned
- **Reference:** FR14
