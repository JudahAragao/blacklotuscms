---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
module: "settings"
---

# API - Settings

## Endpoints

### EP-01: Get Setting
- **Method:** `GET`
- **Auth:** Required
- **RBAC:** `setting.manage`

### EP-02: Set Setting
- **Method:** `POST`
- **Auth:** Required
- **RBAC:** `setting.manage`

### EP-03: Get All Settings
- **Method:** `GET`
- **Auth:** Required
- **RBAC:** `setting.manage`

### EP-04: User Management
- **Method:** CRUD via admin
- **Auth:** Required
- **RBAC:** `user.manage`

### EP-05: Role Capability Management
- **Method:** Via admin
- **Auth:** Required
- **RBAC:** `user.manage`

### EP-06: Post Type Management
- **Method:** CRUD via admin
- **Auth:** Required
- **RBAC:** `setting.manage`

### EP-07: Taxonomy Management
- **Method:** CRUD via admin
- **Auth:** Required
- **RBAC:** `setting.manage`

### EP-08: Menu Management
- **Method:** CRUD via admin
- **Auth:** Required
- **RBAC:** `setting.manage`
