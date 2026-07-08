---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
module: "themes"
---

# API - Themes

## Endpoints

### EP-01: Serve Theme Assets
- **Method:** `GET`
- **Path:** `/api/themes/:name/assets/*`
- **Auth:** Public
- **RBAC:** N/A

### EP-02: Serve Theme CSS
- **Method:** `GET`
- **Path:** `/api/themes/:name/style`
- **Auth:** Public
- **RBAC:** N/A

**Response:** CSS content-type text/css

### EP-03: Theme Editor Save
- **Method:** `POST`
- **Path:** `/api/admin/themes/editor`
- **Auth:** Required
- **RBAC:** `theme.edit`

### EP-04: List Themes
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `theme.manage`

### EP-05: Activate Theme
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `theme.manage`

### EP-06: Install Theme (ZIP Upload)
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `theme.manage`

### EP-07: Theme Permissions Management
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `theme.manage`
