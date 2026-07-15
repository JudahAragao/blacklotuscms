---
spec_version: "1.5"
last_updated: "2026-07-15"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Specification

## Description
Motor de themes baseado em React Server Components com CSS scoping via build-time bundling, static imports gerados, variáveis CSS, sistema de permissions para acesso a data e helpers estilo ACF para campos customizados.

## Requirements
- **REQ-01:** Static import de layouts via `theme-registry.ts` gerado pelo `themes:generate`
- **REQ-02:** CSS Variables customizáveis via `style.css` do tema
- **REQ-03:** CSS scoping via selector replacement (`.blacklotuscms-theme` → `.blacklotuscms-theme[data-bl-theme="id"]`) + `@scope` nativo para Chrome 118+
- **REQ-04:** ThemeDataService com validação de permissions
- **REQ-05:** AsyncLocalStorage para contexto do theme por request
- **REQ-06:** Sanitização de data antes de passar ao theme
- **REQ-07:** Theme permission requests (pending/approved/denied)
- **REQ-08:** `theme.json` como manifest do theme com `themeApiVersion: 1`
- **REQ-09:** Namespace automático de `@keyframes` com prefixo `bl-<id>-`
- **REQ-10:** Validação de tokens CSS declarados vs. usados no build
- **REQ-11:** Theme helpers (get_field, the_field, have_rows, get_rows, get_sub_field, the_sub_field, get_row_index, get_field_object, get_field_name, get_field_type, acf_add_local_field_group)
- **REQ-12:** Resolução dinâmica de layout por slug (slug bate com layout exportado pelo tema = context automático)
- **REQ-13:** WordPress-style template hierarchy: post.{type} → post → default.post fallback chain

## User Roles
- **Administrador:** Gerenciar themes (ativar/desativar via painel)
- **Temas:** Acessam data via ThemeDataService com permissions validadas

## Constraints
- **C01:** Themes só acessam data com permissão aprovada
- **C02:** Nome do theme é sanitizado com `sanitizePath`
- **C03:** Dados passados ao theme são mascarados (`maskSensitiveData`)
- **C04:** Fallback para layout "post" se import falhar
- **C05:** Temas são source-controlled — não há upload, instalação ou edição runtime
- **C06:** `:root` é convertido para `:scope` no CSS; uso de `html`/`body` é proibido
- **C07:** `predev`, `prebuild` e `pretest` executam `themes:generate` automaticamente

## Build Pipeline

1. Script `scripts/generate-theme-registry.mjs` descobre pastas em `themes/`
2. Para cada tema, lê `theme.json`, `theme.ts` e `style.css`
3. Valida manifesto, `themeApiVersion`, variáveis CSS declaradas vs. usadas
4. Namespace `@keyframes` com prefixo `bl-<id>-`
5. Gera `src/generated/theme-registry.ts` (imports estáticos dos layouts)
6. Gera `src/generated/theme-styles.css` (CSS isolado com selector replacement + `@scope`)

## Dependencies
- **Depends on:** Post Management, ThemeDataService
- **Blocks:** NONE (feature pública principal)
- **Related to:** Plugins, Security
