---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Acceptance Tests

## AT-01: Complete Installation
- **GIVEN** system not installed
- **WHEN** form filled with valid data
- **THEN** schema applied, roles created, admin created, .installed created
- **Reference:** FR20

## AT-02: Form Invalid
- **GIVEN** mandatory fields empty
- **WHEN** submit form
- **THEN** validation errors returned
- **Reference:** FR20

## AT-03: Database Connection Fail
- **GIVEN** incorrect database credentials
- **WHEN** attempt to connect
- **THEN** error 500 with connection failure message
- **Reference:** FR20

## AT-04: Re-installation Blocked
- **GIVEN** system already installed (.installed exists)
- **WHEN** access /install
- **THEN** redirects to /auth/login
- **Reference:** FR20, BR10
