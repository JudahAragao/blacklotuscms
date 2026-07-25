---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Specification

## Description
Web-based installation system with configuration wizard, schema creation in database, default roles and admin user.

## Requirements
- **REQ-01:** Web-based wizard at /install
- **REQ-02:** Database configuration (host/port/name/user/password or connection string)
- **REQ-03:** Storage configuration (local/s3/r2)
- **REQ-04:** Automatic generation of NEXTAUTH_SECRET
- **REQ-05:** Schema application via prisma db push
- **REQ-06:** Creation of default roles (Administrator, Editor, Author, Contributor, Subscriber)
- **REQ-07:** Creation of default PostTypes (post, page)
- **REQ-08:** Creation of admin user
- **REQ-09:** .installed flag to block re-installation
- **REQ-10:** Installation gate in proxy (redirects to /install)
- **REQ-11:** Auto-install of default taxonomies (hierarchical category, flat post_tag) for post type "post"
- **REQ-12:** Auto-install via init.ts when database is empty (no existing roles)

## Constraints
- **C01:** Installation is one-time (blocked after completion)
- **C02:** Schema applied with --accept-data-loss
- **C03:** Prisma proxy allows lazy initialization

## Dependencies
- **Depends on:** NONE (first feature executed)
- **Blocks:** All other features (until installation complete)
- **Related to:** Secrets, Database
