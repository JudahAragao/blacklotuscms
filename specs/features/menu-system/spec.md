---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "menu-syshas"
---

# Menu Syshas Specification

## Description
System de menus hierarquicos with cache via unstable_cache e invalidacao manual.

## Requirements
- **REQ-01:** Menus hierarquicos with parent-child
- **REQ-02:** Cache with revalidation tags
- **REQ-03:** Invalidation manual por slug
- **REQ-04:** RBAC para invalidacao (setting.manage)

## Constraints
- **C01:** Ordem por campo "order" (asc)
- **C02:** Cache TTL de 3600s

## Dependencies
- **Depends on:** Settings
- **Blocks:** NONE
- **Related to:** Themes, Posts
