---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "installation"
---

# Installation Error States

## ERR-01: Database Connection Failed
- **Condition:** Credentials incorretas ou banco indisponivel
- **Código HTTP:** 500
- **Mensagem:** "Failed to connect to the database: [detail]"

## ERR-02: Schema Application Failed
- **Condition:** prisma db push falhou
- **Código HTTP:** 500
- **Mensagem:** "Falha ao criar tabelas no banco de data. Verifique as credenciais e permissões."

## ERR-03: Validtion Error
- **Condition:** Form with fields invalidos
- **Código HTTP:** 400
- **Mensagem:** Lista de erros de validacao
