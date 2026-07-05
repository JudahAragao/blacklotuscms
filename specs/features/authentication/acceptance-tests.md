---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "authentication"
---

# Authentication Acceptance Tests

## AT-01: Login com Credenciais Validas
- **DADO** usuario existente com email e senha corretos
- **QUANDO** envia POST /api/auth/[...nextauth] com credenciais
- **ENTAO** JWT e retornado e sessao e criada
- **Referencia:** FR01

## AT-02: Login com Credenciais Invalidas
- **DADO** email inexistente ou senha incorreta
- **QUANDO** tenta autenticar
- **ENTAO** retorna null (falha silenciosa)
- **Referencia:** FR01

## AT-03: Acesso com API Key Valida
- **DADO** API Key ativa e nao expirada
- **QUANDO** requisicao com Bearer token valida
- **ENTAO** headers x-api-user-id e x-api-user-role injetados
- **Referencia:** FR03

## AT-04: Acesso com API Key Expirada
- **DADO** API Key com expiresAt no passado
- **QUANDO** tenta autenticar
- **ENTAO** chave e rejeitada, proximo auth check (session) e tentado
- **Referencia:** FR03

## AT-05: Rate Limit Excedido
- **DADO** API Key com rateLimit=60
- **QUANDO** mais de 60 requisicoes em 1 minuto
- **ENTAO** retorna 429 com RATE_LIMIT_EXCEEDED
- **Referencia:** FR24

## AT-06: Administrador Bypass
- **DADO** usuario com role "Administrador"
- **QUANDO** qualquer verificacao de capability e executada
- **ENTAO** retorna true independente da capability
- **Referencia:** FR02, BR03
