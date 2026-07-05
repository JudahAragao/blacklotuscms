---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Specification

## Description
Sistema de autenticacao JWT via NextAuth com RBAC capability-based, suporte a API Keys e proxy middleware.

## Requirements
- **REQ-01:** Login via email/password com JWT
- **REQ-02:** RBAC com capabilities JSON por role
- **REQ-03:** API Key authentication com Bearer token
- **REQ-04:** Rate limiting dinamico por API Key
- **REQ-05:** Middleware proxy que valida autenticacao em todas as rotas protegidas
- **REQ-06:** Roles padrao: Administrador, Editor, Autor, Colaborador, Assinante

## User Roles
- **Administrador:** Acesso total, bypass de todas as verificacoes
- **Editor:** CRUD completo de conteudo e midia
- **Autor:** CRUD proprio com publicacao
- **Colaborador:** Criacao limitada (draft only)
- **Assinante:** Leitura e perfil

## Constraints
- **C01:** Administrador bypass automático em todas as verificacoes
- **C02:** API Keys usam prefixo "bl_" e SHA-256 hash
- **C03:** Rate limit window de 1 minuto por API Key
- **C04:** JWT strategy com PrismaAdapter

## Dependencies
- **Depende de:** NENHUMA (fundacao do sistema)
- **Bloqueia:** Todas as features que requerem autenticacao
- **Relacionado com:** API Keys, Proxy
