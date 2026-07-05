---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "withments"
---

# Comments Specification

## Description
System de withentarios with threading, anti-spam, captcha opcional e workflow de moderacao.

## Requirements
- **REQ-01:** Creation de withentarios publicos with validacao Zod
- **REQ-02:** Comments aninhados (replies via parentId)
- **REQ-03:** Anti-spam with blacklist de palavras e contagem de links
- **REQ-04:** Captcha opcional via setting
- **REQ-05:** Moderacao: pending, approved, spam
- **REQ-06:** Auto-approve opcional via setting
- **REQ-07:** Deletion with permissao withment.manage

## Constraints
- **C01:** Conteudo maximo 5000 caracteres
- **C02:** Autor minimo 2 caracteres
- **C03:** Links > 2 = spam automatico

## Dependencies
- **Depends on:** Post Management, Settings
- **Blocks:** NONE
- **Related to:** Posts, Themes
