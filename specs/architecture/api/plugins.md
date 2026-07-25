---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
module: "plugins"
---

# API - Plugins

## Endpoints

### EP-01: Install Plugin (ZIP Upload)
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `plugin.manage`

**Request:** multipart/form-data with "file" field (ZIP)

**Response 200:**
```json
{ "success": true, "plugin": { "id": "uuid", "name": "string", "version": "string" } }
```

**Possible errors:**
- `400` — Invalid or corrupted plugin ZIP
- `403` — AUTH_FORBIDDEN

### EP-02: Activate Plugin
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `plugin.manage`

### EP-03: Deactivate Plugin
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `plugin.manage`

### EP-04: Plugin Permissions
- **Method:** Via admin panel
- **Auth:** Required
- **RBAC:** `plugin.manage`

**Manages pending/approved/denied permissions between plugins and the system.**
