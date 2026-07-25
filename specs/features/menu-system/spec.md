---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "menu-system"
---

# Menu System Specification

## Description
Hierarchical menu system with cache via unstable_cache and manual invalidation.

## Requirements
- **REQ-01:** Hierarchical menus with parent-child
- **REQ-02:** Cache with revalidation tags
- **REQ-03:** Manual invalidation by slug
- **REQ-04:** RBAC for invalidation (setting.manage)
- **REQ-05:** Full CRUD via admin panel (create, edit, delete menus and items)
- **REQ-06:** Drag-and-drop item ordering
- **REQ-07:** Menu items with label, url and order
- **REQ-08:** RBAC for management (menu.manage)

## Constraints
- **C01:** Order by "order" field (ascending)
- **C02:** Cache TTL of 3600s

## Dependencies
- **Depends on:** Settings
- **Blocks:** NONE
- **Related to:** Themes, Posts
