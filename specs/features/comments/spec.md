---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "comments"
---

# Comments Specification

## Description
Sistema de comentarios com threading, anti-spam, captcha opcional e workflow de moderacao.

## Requirements
- **REQ-01:** Criacao de comentarios publicos com validacao Zod
- **REQ-02:** Comentarios aninhados (replies via parentId)
- **REQ-03:** Anti-spam com blacklist de palavras e contagem de links
- **REQ-04:** Captcha opcional via setting
- **REQ-05:** Moderacao: pending, approved, spam
- **REQ-06:** Auto-approve opcional via setting
- **REQ-07:** Exclusao com permissao comment.manage

## Constraints
- **C01:** Conteudo maximo 5000 caracteres
- **C02:** Autor minimo 2 caracteres
- **C03:** Links > 2 = spam automatico

## Dependencies
- **Depende de:** Post Management, Settings
- **Bloqueia:** NENHUMA
- **Relacionado com:** Posts, Themes
