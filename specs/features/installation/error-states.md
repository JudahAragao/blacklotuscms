---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Error States

## ERR-01: Database Connection Failed
- **Condition:** Incorrect credentials or database unavailable
- **HTTP Code:** 500
- **Message:** "Failed to connect to the database: [detail]"

## ERR-02: Schema Application Failed
- **Condition:** prisma db push failed
- **HTTP Code:** 500
- **Message:** "Failed to create database tables. Check credentials and permissions."

## ERR-03: Validation Error
- **Condition:** Form with invalid fields
- **HTTP Code:** 400
- **Message:** List of validation errors
