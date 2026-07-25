---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "user-management"
---

# User Management Specification

## Description
User CRUD with role management, capabilities, and self-deletion protection.

## Requirements
- **REQ-01:** Create users with role assignment
- **REQ-02:** Edit users (admin or self)
- **REQ-03:** Delete users (admin, cannot delete self)
- **REQ-04:** Manage role capabilities
- **REQ-05:** user.before_update hook for plugins

## Constraints
- **C01:** Only user.manage can create/edit others
- **C02:** Self-edit allowed without user.manage
- **C03:** Self-delete blocked

## Dependencies
- **Depends on:** Authentication
- **Blocks:** NONE
- **Related to:** Authentication, API Keys
