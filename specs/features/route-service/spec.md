---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "route-service"
---

# Route Service Specification

## Description
Serviço de pattern matching que resolve URLs para templates + params, com cadeia de resolução: plugin routes → theme routes → default theme routes → CMS padrão.

## Requirements
- **REQ-01:** Pattern matching com params dinâmicos (`:slug`, `:id`, etc.)
- **REQ-02:** Plugin routes registradas via `bridge.routes.register()` têm prioridade máxima
- **REQ-03:** Theme routes declaradas em `routes.json` têm prioridade secundária
- **REQ-04:** Default theme routes funcionam como fallback
- **REQ-05:** RouteContext inclui `params`, `userId` e `role` (name + capabilities)
- **REQ-06:** Paths são normalizados (slashes extras removidos)
- **REQ-07:** Suporte a múltiplos params: `/user/:id/orders/:orderId`

## Resolution Chain
1. **Plugin routes** (registradas via `bridge.routes.register`)
2. **Theme routes** (declaradas em `routes.json` do tema ativo)
3. **Default theme routes** (fallback do tema default)
4. **CMS padrão** (single post, archive, etc.)

## RouteContext
```typescript
interface RouteContext {
  params: Record<string, string>;  // Params extraídos da URL
  userId?: string;                 // ID do user autenticado (se houver)
  role?: { name: string; capabilities: any } | null;  // Role do user
}
```

## Constraints
- **C01:** Número de segmentos do pattern deve ser igual ao da URL
- **C02:** Segmentos estáticos devem corresponder exatamente
- **C03:** Segmentos dinâmicos (`:param`) capturam o valor correspondente

## Dependencies
- **Depends on:** Plugin System, Theme Engine
- **Blocks:** NONE
- **Related to:** Theme Engine, Plugin System
