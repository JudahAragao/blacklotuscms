---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "media-management"
---

# Media Management Error States

## ERR-01: File Not Sent
- **Condition:** FormData does not contain "file" field
- **HTTP Code:** 400
- **Message:** "File not sent"

## ERR-02: Processing Error
- **Condition:** Sharp fails to process image
- **HTTP Code:** 500
- **Message:** "Error processing media file: [detail]"
- **System action:** BlackLotusCMSError with INTERNAL_SERVER_ERROR

## ERR-03: Media Not Found
- **Condition:** Media ID does not exist
- **HTTP Code:** 404
- **Message:** "Media not found"

## ERR-04: Storage Failure
- **Condition:** S3/R2 or filesystem unavailable
- **HTTP Code:** 500
- **Message:** Upload error
- **System action:** Error logged, upload fails
