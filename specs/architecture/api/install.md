---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
module: "install"
---

# API - Installation

## Endpoints

### EP-01: Check Installation Status
- **Method:** `GET`
- **Path:** `/api/install`
- **Auth:** Public

**Response 200:**
```json
{ "installed": true }
```

### EP-02: Complete Installation
- **Method:** `POST`
- **Path:** `/api/install`
- **Auth:** Public (apenas antes da instalacao)

**Request:**
```json
{
  "useConnectionString": false,
  "dbHost": "postgres",
  "dbPort": "5432",
  "dbName": "blacklotuscms",
  "dbUser": "postgres",
  "dbPassword": "password",
  "useSSL": false,
  "nextAuthUrl": "http://localhost:3000",
  "storageDriver": "local",
  "uploadDir": "./public/uploads",
  "sandboxMemoryLimit": "512",
  "sandboxTimeout": "30",
  "adminEmail": "admin@example.com",
  "adminPassword": "password",
  "adminConfirmPassword": "password"
}
```

**Response 200:**
```json
{ "success": true }
```

**Erros possíveis:**
- `400` — Validacao do formulario falhou
- `500` — Falha ao conectar ao banco ou criar tabelas

### EP-03: Health Check
- **Method:** `GET`
- **Path:** `/api/health`
- **Auth:** Public

**Response 200:**
```json
{ "status": "ok" }
```
