---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Specification

## Description
System de authentication JWT via NextAuth with RBAC capability-based, suporte a API Keys e proxy middleware.

## Requirements
- **REQ-01:** Login via email/password with JWT
- **REQ-02:** RBAC with capabilities JSON por role
- **REQ-03:** API Key authentication with Bearer token
- **REQ-04:** Rate limiting dinamico por API Key
- **REQ-05:** Middleware proxy que valida authentication em all as rotas protegidas
- **REQ-06:** Roles default: Administrador, Editor, Autor, Contributor, Assinante

## User Roles
- **Administrador:** Access full, bypass de all as checks
- **Editor:** CRUD withpleto de conteudo e midia
- **Autor:** CRUD proprio with publicacao
- **Contributor:** Creation limited (draft only)
- **Assinante:** Leitura e perfil

## Constraints
- **C01:** Administrador bypass automatic em all as checks
- **C02:** API Keys usam prefixo "bl_" e SHA-256 hash
- **C03:** Rate limit window de 1 minuto por API Key
- **C04:** JWT strategy with PrismaAdapter

## Dependencies
- **Depends on:** NONE (fundacao do system)
- **Blocks:** Todas as features que requerem authentication
- **Related to:** API Keys, Proxy
