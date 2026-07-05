---
spec_version: "1.0"
last_updated: "2026-07-05"
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

**Request:** multipart/form-data with campo "file" (ZIP)

**Response 200:**
```json
{ "success": true, "plugin": { "id": "uuid", "name": "string", "version": "string" } }
```

**Erros possíveis:**
- `400` — Plugin ZIP invalido ou corrompido
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

**Gerencia permissions pendentes/aprovadas/denegadas entre plugins e o system.**
