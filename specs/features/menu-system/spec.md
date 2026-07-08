---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "menu-system"
---

# Menu System Specification

## Description
Sistema de menus hierarquicos com cache via unstable_cache e invalidacao manual.

## Requirements
- **REQ-01:** Menus hierarquicos com parent-child
- **REQ-02:** Cache com revalidation tags
- **REQ-03:** Invalidation manual por slug
- **REQ-04:** RBAC para invalidacao (setting.manage)

## Constraints
- **C01:** Ordem por campo "order" (asc)
- **C02:** Cache TTL de 3600s

## Dependencies
- **Depends on:** Settings
- **Blocks:** NONE
- **Related to:** Themes, Posts
