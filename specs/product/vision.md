---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
---

# Vision - BlackLotusCMS

## Overview

BlackLotusCMS is a modern, high-performance, extensible Content Management System built with Next.js 16, Prisma, and Pothos GraphQL. It combines the proven Hook-based extensibility model (inspired by WordPress) with React Server Components for zero-bloat frontend delivery.

## Core Value Proposition

- **Zero .env Architecture:** Unified JSON configuration for both Docker and local environments, eliminating environment variable sprawl
- **Type-Safe GraphQL API:** Pothos + Prisma integration provides end-to-end type safety from database to API
- **Secure Plugin Sandbox:** Plugins execute in isolated-vm sandboxes com permission-gated Bridge APIs
- **Theme-as-Code:** Themes are React Server Components com CSS scoping and permission validation

## Target Audience

Developers and technical teams who need a CMS with WordPress-like extensibility but modern performance characteristics. Ideal for projects requiring custom post types, granular RBAC, and plugin/theme ecosystems without frontend bloat.

## Key Differentiators

- **Application-Layer Sandboxing:** Unlike VM-based sandboxes, themes operate com CSS scoping and server-side permission validation for native performance com industrial security
- **Hook System (Actions + Filters):** WordPress-proven extensibility model ported to Type-Safe TypeScript
- **Prisma Proxy Pattern:** Lazy database initialization allows the sistema to install and configure itself at runtime
- **Multi-Storage Drivers:** Local, S3, and R2 storage com unified interface
- **Automatic Image Processing:** Sharp-based WebP conversion and thumbnail generation on upload
