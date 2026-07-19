---
spec_version: "1.4"
last_updated: "2026-07-19"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Flows

## Renderizar Página Pública

1. **Rota pública detecta contexto** (single, archive, search, 404)
   - State: Contexto determinado

2. **ThemeRenderer busca theme ativo**
   - `ThemeService.getActiveTheme()`
   - State: Nome do theme obtido

3. **Sanitização do nome do theme**
   - `sanitizePath(rawThemeName)`
   - State: Theme seguro

4. **Validação do registry**
   - Verifica se o theme existe em `themeRegistry` (gerado por `themes:generate`)
   - Se não existe: fallback para `default`
   - State: Theme validado

5. **Mascaramento de data**
   - `maskSensitiveData(data)`
   - State: Dados seguros

6. **Resolução do layout**
   - `themeRegistry[themeName][layoutKey]` → componente React Server
   - Fallback: `themeRegistry[themeName].post` ou `themeRegistry.default.post`
   - State: Componente carregado (import estático)

7. **Busca de ThemeData para CSS Variables**
   - `ThemeDataService.listAll(themeName)`
   - Settings namespaced como `--theme-setting-<key>`
   - State: Variáveis CSS prontas

8. **Sincronização do contexto dual-store**
   - `getThemeStore()` → seta themeName e currentPost no store retornado
   - `getReactStore()` → seta themeName e currentPost no React.cache (fallback seguro)
   - State: Contexto sincronizado em ambas stores

9. **Renderização com CSS isolado**
   - CSS do tema já embutido em `theme-styles.css` via `theme-styles.css` importado no `globals.css`
   - Isolamento por `.blacklotuscms-theme[data-bl-theme="id"]` (fallback) + `@scope` (Chrome 118+)
   - State: Página renderizada

## Desenvolver Novo Tema

1. **Criar pasta do tema**
   - `themes/meu-tema/` copiando de `themes/default/`
   - State: Estrutura criada

2. **Definir manifesto**
   - `theme.json` com `name`, `version`, `themeApiVersion: 1`
   - State: Manifesto válido

3. **Criar layouts**
   - `theme.ts` exportando layouts (page, post, archive, search, category, blog, notFound)
   - `layouts/` com componentes React Server
   - State: Layouts definidos

4. **Definir estilos**
   - `style.css` com CSS puro usando `.blacklotuscms-theme` como root
   - Variáveis CSS customizadas com prefixo próprio (`--meu-*`)
   - Tokens oficiais do Tailwind v4 sobrescritos em `.blacklotuscms-theme`
   - State: Estilos definidos

5. **Executar build**
   - `npm run themes:generate` (executado automaticamente por `predev`/`prebuild`)
   - Script valida manifesto, variáveis CSS, namespace keyframes
   - Gera `src/generated/theme-registry.ts` e `src/generated/theme-styles.css`
   - State: Tema pronto para uso

6. **Ativar no painel**
   - Admin seleciona o tema em `/admin/themes`
   - `ThemeService.setActiveTheme()`
   - State: Tema ativo

## Gerenciar Permissions de Theme

1. **Theme tenta acessar dado** (ex: db.read.post)
   - State: Call received

2. **ThemeDataService.validate(capability)**
   - Verifica cache em memória (Map<string, CacheEntry> com TTL de 10s)
   - Se cache hit e status = "approved": retorna true imediatamente
   - Se cache hit e status != "approved": lança erro + requestPermission()
   - Se cache miss: busca ThemePermission no banco
   - Armazena resultado no cache com TTL (expiresAt = now + 10s)
   - State: Permission verified (via cache ou banco)

3. **Se não aprovada: requestPermission()**
   - Cria/solicita ThemePermission com status "pending"
   - Limpa cache de permissões para o theme afetado
   - State: Request registrada

4. **Admin aprova/denega via painel**
   - Limpa cache de permissões para o theme afetado
   - State: Permission processada

## Modificar Tema Existente

1. **Editar arquivos no repositório**
   - `style.css`, layouts, `theme.json`
   - State: Alterações realizadas

2. **Reiniciar dev server ou rodar build**
   - `npm run dev` ou `npm run build`
   - `themes:generate` roda automaticamente via hooks
   - State: Tema regenerado

3. **Verificar resultado**
   - Testar no browser
   - State: Tema atualizado
