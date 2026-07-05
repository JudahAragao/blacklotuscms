---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Acceptance Tests

## AT-01: Login with Credentials Valid
- **GIVEN** usuario existente with email e senha corretos
- **WHEN** envia POST /api/auth/[...nextauth] with credenciais
- **THEN** JWT e retornado e sessao e criada
- **Referencia:** FR01

## AT-02: Login with Credentials Invalid
- **GIVEN** email inexistente ou senha incorreta
- **WHEN** tenta autenticar
- **THEN** retorna null (falha silenciosa)
- **Referencia:** FR01

## AT-03: Access with API Key Valid
- **GIVEN** API Key ativa e nao expirada
- **WHEN** requisicao with Bearer token valida
- **THEN** headers x-api-user-id e x-api-user-role injetados
- **Referencia:** FR03

## AT-04: Access with API Key Expirada
- **GIVEN** API Key with expiresAt no passado
- **WHEN** tenta autenticar
- **THEN** chave e rejeitada, proximo auth check (session) e tentado
- **Referencia:** FR03

## AT-05: Rate Limit Excedido
- **GIVEN** API Key with rateLimit=60
- **WHEN** mais de 60 requisicoes em 1 minuto
- **THEN** retorna 429 with RATE_LIMIT_EXCEEDED
- **Referencia:** FR24

## AT-06: Administrador Bypass
- **GIVEN** usuario with role "Administrador"
- **WHEN** qualquer verificacao de capability e executada
- **THEN** returns true independente da capability
- **Referencia:** FR02, BR03
