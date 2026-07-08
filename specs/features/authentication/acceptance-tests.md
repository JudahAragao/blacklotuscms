---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Acceptance Tests

## AT-01: Login com Credentials Valid
- **GIVEN** usuario existente com email e senha corretos
- **WHEN** envia POST /api/auth/[...nextauth] com credenciais
- **THEN** JWT e retornado e sessao e criada
- **Referencia:** FR01

## AT-02: Login com Credentials Invalid
- **GIVEN** email inexistente ou senha incorreta
- **WHEN** tenta autenticar
- **THEN** retorna null (falha silenciosa)
- **Referencia:** FR01

## AT-03: Acesso com API Key Valid
- **GIVEN** API Key ativa e nao expirada
- **WHEN** requisicao com Bearer token valida
- **THEN** headers x-api-user-id e x-api-user-role injetados
- **Referencia:** FR03

## AT-04: Acesso com API Key Expirada
- **GIVEN** API Key com expiresAt no passado
- **WHEN** tenta autenticar
- **THEN** chave e rejeitada, proximo auth check (session) e tentado
- **Referencia:** FR03

## AT-05: Rate Limit Excedido
- **GIVEN** API Key com rateLimit=60
- **WHEN** mais de 60 requisicoes em 1 minuto
- **THEN** retorna 429 com RATE_LIMIT_EXCEEDED
- **Referencia:** FR24

## AT-06: Administrador Bypass
- **GIVEN** usuario com role "Administrador"
- **WHEN** qualquer verificacao de capability e executada
- **THEN** returns true independente da capability
- **Referencia:** FR02, BR03
