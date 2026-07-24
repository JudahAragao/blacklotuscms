---
spec_version: "1.2"
last_updated: "2026-07-23"
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
- **REQ-05:** CRUD completo via admin panel (criar, editar, excluir menus e itens)
- **REQ-06:** Drag-and-drop ordering de itens
- **REQ-07:** Itens de menu com label, url e order
- **REQ-08:** RBAC para gerenciamento (menu.manage)

## Constraints
- **C01:** Ordem por campo "order" (asc)
- **C02:** Cache TTL de 3600s

## Dependencies
- **Depends on:** Settings
- **Blocks:** NONE
- **Related to:** Themes, Posts
