---
spec_version: "1.0"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
feature: "shortcodes"
---

# Shortcodes Specification

## Description
Sistema de macros registráveis por plugins e nativas, processadas no conteúdo. Inspirado nos shortcodes do WordPress.

## Requirements
- **REQ-01:** Registro de shortcodes via `shortcodeService.register(tag, handler)`
- **REQ-02:** Processamento de conteúdo via `shortcodeService.parse(content)`
- **REQ-03:** Suporte a atributos: `[tag attr="value"]`
- **REQ-04:** Suporte a conteúdo encerrado: `[tag]content[/tag]`
- **REQ-05:** Sanitização automática do output via `sanitizeHTML()`
- **REQ-06:** Shortcodes nativos: `[button]` e `[youtube]`

## Syntax
```
[tag attr="value"]content[/tag]
[tag attr="value"]
[tag]
```

## Native Shortcodes

### [button]
```html
[button url="/contact"]Fale Conosco[/button]
<!-- Output: <a href="/contact" class="btn-shortcode">Fale Conosco</a> -->
```

### [youtube]
```html
[youtube id="dQw4w9WgXcQ"]
<!-- Output: <div class="video-container"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" ...></iframe></div> -->
```

## Constraints
- **C01:** Output é sempre sanitizado com DOMPurify
- **C02:** Shortcodes não registrados são ignorados (mantidos no conteúdo)
- **C03:** Handler pode ser síncrono ou async

## Dependencies
- **Depends on:** DOMPurify (sanitization)
- **Blocks:** NONE
- **Related to:** Plugin System (plugins podem registrar shortcodes)
