---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Specification

## Description
JWT authentication system via NextAuth with capability-based RBAC, API Keys support, and proxy middleware.

## Requirements
- **REQ-01:** Login via email/password with JWT
- **REQ-02:** RBAC with JSON capabilities per role
- **REQ-03:** API Key authentication with Bearer token
- **REQ-04:** Dynamic rate limiting per API Key
- **REQ-05:** Proxy middleware that validates authentication on all protected routes
- **REQ-06:** Default roles: Administrator, Editor, Author, Contributor, Subscriber
- **REQ-07:** Proxy with installation gate (redirects to /install if .installed does not exist)
- **REQ-08:** Consolidated withApiAuth middleware (checks NextAuth session or API Key header)
- **REQ-09:** hasCapability with support for `.own` verification for personal resources

## User Roles
- **Administrator:** Full access, bypasses all checks
- **Editor:** Complete CRUD for content and media
- **Author:** Own CRUD with publishing
- **Contributor:** Limited creation (draft only)
- **Subscriber:** Reading and profile

## Constraints
- **C01:** Administrator automatic bypass on all checks
- **C02:** API Keys use "bl_" prefix and SHA-256 hash
- **C03:** Rate limit window of 1 minute per API Key
- **C04:** JWT strategy with PrismaAdapter

## Dependencies
- **Depends on:** NONE (system foundation)
- **Blocks:** All features requiring authentication
- **Related to:** API Keys, Proxy