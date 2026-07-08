---
spec_version: "1.2"
last_updated: "2026-07-06"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Flows

## Renderizar Page Publica

1. **Rota publica detecta contexto** (single, archive, search, 404)
   - State: Contexto determinado

2. **ThemeRenderer busca theme ativo**
   - ThemeService.getActiveTheme()
   - State: Nome do theme obtido

3. **Sanitization do nome do theme**
   - sanitizePath(rawThemeName)
   - State: Theme seguro

4. **Mascaramento de data**
   - maskSensitiveData(data)
   - State: Dados seguros

5. **Dynamic import do layout**
   - import(`../../themes/${themeName}/layouts/${layoutFile}`)
   - State: Componente carregado

6. **Busca de ThemeData para CSS Variables**
   - ThemeDataService.listAll(themeName)
   - State: Variaveis CSS prontas

7. **Inject de CSS + Theme Layout**
   - @import url('/api/themes/${themeName}/style')
   - CSS Variables injetadas
   - State: Page renderizada

## Gerenciar Permissions de Theme

1. **Theme tenta acessar dado** (ex: db.read.post)
   - State: Call received

2. **ThemeDataService.validate(capability)**
   - Verifica cache em memória (Map<string, CacheEntry> com TTL de 10s)
   - Se cache hit e status = "approved": retorna true imediatamente
   - Se cache hit e status != "approved": lanca erro + requestPermission()
   - Se cache miss: busca ThemePermission no banco
   - Armazena resultado no cache com TTL (expiresAt = now + 10s)
   - State: Permission verified (via cache ou banco)

3. **Se nao aprovada: requestPermission()**
   - Cria/solicita ThemePermission com status "pending"
   - Limpa cache de permissões para o theme afetado
   - State: Request registrada

4. **Admin aprova/denega via painel**
   - Limpa cache de permissões para o theme afetado
   - State: Permission processada
