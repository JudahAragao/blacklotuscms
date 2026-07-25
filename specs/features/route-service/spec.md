---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "route-service"
---

# Route Service Specification

## Description
Pattern matching service that resolves URLs to templates + params, with resolution chain: plugin routes → theme routes → default theme routes → CMS default.

## Requirements
- **REQ-01:** Pattern matching with dynamic params (`:slug`, `:id`, etc.)
- **REQ-02:** Plugin routes registered via `bridge.routes.register()` have highest priority
- **REQ-03:** Theme routes declared in `routes.json` have secondary priority
- **REQ-04:** Default theme routes work as fallback
- **REQ-05:** RouteContext includes `params`, `userId` and `role` (name + capabilities)
- **REQ-06:** Paths are normalized (extra slashes removed)
- **REQ-07:** Multiple params support: `/user/:id/orders/:orderId`

## Resolution Chain
1. **Plugin routes** (registered via `bridge.routes.register`)
2. **Theme routes** (declared in active theme's `routes.json`)
3. **Default theme routes** (default theme fallback)
4. **CMS default** (single post, archive, etc.)

## RouteContext
```typescript
interface RouteContext {
  params: Record<string, string>;  // Params extracted from URL
  userId?: string;                 // Authenticated user ID (if any)
  role?: { name: string; capabilities: any } | null;  // User role
}
```

## Constraints
- **C01:** Pattern segment count must match URL
- **C02:** Static segments must match exactly
- **C03:** Dynamic segments (`:param`) capture corresponding value

## Dependencies
- **Depends on:** Plugin System, Theme Engine
- **Blocks:** NONE
- **Related to:** Theme Engine, Plugin System
