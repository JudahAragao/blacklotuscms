---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
sprint: "01"
---

# Sprint 01: Foundation

## Goal
Establish the system foundation: database, authentication, installation and containerization.

## Duration
2026-06-01 — 2026-06-15

## Tasks
- [x] **TASK-001:** Database schema with Prisma | priority: P0 | est: 8h | depends: [] | feature: installation
- [x] **TASK-002:** Authentication system NextAuth + JWT | priority: P0 | est: 6h | depends: [] | feature: authentication
- [x] **TASK-003:** Proxy/middleware with installation gate | priority: P0 | est: 4h | depends: [] | feature: installation
- [x] **TASK-004:** SecretsService and Zero .env | priority: P0 | est: 4h | depends: [] | feature: installation
- [x] **TASK-005:** Web-based installation system | priority: P0 | est: 8h | depends: [TASK-001, TASK-004] | feature: installation
- [x] **TASK-006:** RBAC with capabilities JSON | priority: P0 | est: 6h | depends: [TASK-002] | feature: authentication
- [x] **TASK-007:** Docker multi-stage build | priority: P0 | est: 3h | depends: [] | feature: deployment

## Capacity
- Available hours: 40h
- Estimated hours: 39h
- Buffer: 1h

## Sprint Review Checklist
- [x] All tasks with status [x]
- [x] Specs updated (frontmatter status = approved)
- [ ] Tests passing (pending)
- [x] Documentation updated
