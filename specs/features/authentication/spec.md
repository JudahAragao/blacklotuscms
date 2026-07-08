---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Specification

## Description
Sistema de authentication JWT via NextAuth com RBAC capability-based, suporte a API Keys e proxy middleware.

## Requirements
- **REQ-01:** Login via email/password com JWT
- **REQ-02:** RBAC com capabilities JSON por role
- **REQ-03:** API Key authentication com Bearer token
- **REQ-04:** Rate limiting dinamico por API Key
- **REQ-05:** Middleware proxy que valida authentication em todas as rotas protegidas
- **REQ-06:** Roles default: Administrador, Editor, Autor, Contributor, Assinante

## User Roles
- **Administrador:** Acesso full, bypass de todas as checks
- **Editor:** CRUD completo de conteudo e midia
- **Autor:** CRUD proprio com publicacao
- **Contributor:** Criacao limited (draft only)
- **Assinante:** Leitura e perfil

## Constraints
- **C01:** Administrador bypass automatic em todas as checks
- **C02:** API Keys usam prefixo "bl_" e SHA-256 hash
- **C03:** Rate limit window de 1 minuto por API Key
- **C04:** JWT strategy com PrismaAdapter

## Dependencies
- **Depends on:** NONE (fundacao do sistema)
- **Blocks:** Todas as features que requerem authentication
- **Related to:** API Keys, Proxy
