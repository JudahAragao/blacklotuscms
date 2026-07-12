---
spec_version: "1.3"
last_updated: "2026-07-12"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Acceptance Tests

## AT-01: Renderizar Post Único
- **GIVEN** theme ativo com layout `post.tsx` registrado no `theme-registry.ts`
- **WHEN** acessa `/meu-post`
- **THEN** layout do theme é renderizado com data do post via import estático
- **Referência:** REQ-01

## AT-02: Theme sem Permission
- **GIVEN** theme sem ThemePermission aprovada para `db.read.post`
- **WHEN** tenta acessar posts
- **THEN** permissão é solicitada e erro 403 retornado
- **Referência:** REQ-04, REQ-07

## AT-03: CSS Isolado por Tema
- **GIVEN** theme com `style.css` definindo variáveis CSS
- **WHEN** `themes:generate` é executado
- **THEN** `theme-styles.css` é gerado com selectors `.blacklotuscms-theme[data-bl-theme="id"]` (sem CSS nesting)
- **AND** variáveis CSS são aplicadas diretamente ao wrapper element
- **Referência:** REQ-03

## AT-04: Namespace de Keyframes
- **GIVEN** theme com `@keyframes` no `style.css`
- **WHEN** `themes:generate` é executado
- **THEN** keyframes recebem prefixo `bl-<id>-` e referências no CSS são atualizadas
- **Referência:** REQ-09

## AT-05: Validação de Manifesto
- **GIVEN** theme com `theme.json` inválido (sem `themeApiVersion`)
- **WHEN** `themes:generate` é executado
- **THEN** script lança erro e geração é bloqueada
- **Referência:** REQ-08

## AT-06: Fallback para Default
- **GIVEN** theme ativo que não existe no `themeRegistry`
- **WHEN** página é renderizada
- **THEN** fallback para layout do theme `default` é aplicado
- **Referência:** REQ-01

## AT-07: CSS Variables no Build
- **GIVEN** theme definindo `--color-primary: #B08A3C` em `style.css`
- **WHEN** página é renderizada com o tema ativo
- **THEN** `--color-primary` está disponível e estilos Tailwind que dependem dela funcionam
- **Referência:** REQ-02

## AT-08: Settings Namespaced
- **GIVEN** theme settings configurados no banco (ex: `primary-color: #ff0000`)
- **WHEN** tema é renderizado
- **THEN** variável disponível como `--theme-setting-primary-color`
- **AND** tema pode consumi-la explicitamente: `var(--theme-setting-primary-color, #B08A3C)`
- **Referência:** REQ-02
