---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
feature: "theme-engine"
---

# Theme Engine Flows

## Renderizar Pagina Publica

1. **Rota publica detecta contexto** (single, archive, search, 404)
   - Estado: Contexto determinado

2. **ThemeRenderer busca tema ativo**
   - ThemeService.getActiveTheme()
   - Estado: Nome do tema obtido

3. **Sanitizacao do nome do tema**
   - sanitizePath(rawThemeName)
   - Estado: Tema seguro

4. **Mascaramento de dados**
   - maskSensitiveData(data)
   - Estado: Dados seguros

5. **Dynamic import do layout**
   - import(`../../themes/${themeName}/layouts/${layoutFile}`)
   - Estado: Componente carregado

6. **Busca de ThemeData para CSS Variables**
   - ThemeDataService.listAll(themeName)
   - Estado: Variaveis CSS prontas

7. **Inject de CSS + Theme Layout**
   - @import url('/api/themes/${themeName}/style')
   - CSS Variables injetadas
   - Estado: Pagina renderizada

## Gerenciar Permissoes de Tema

1. **Tema tenta acessar dado** (ex: db.read.post)
   - Estado: Chamada recebida

2. **ThemeDataService.validate(capability)**
   - Busca ThemePermission no banco
   - Estado: Permissao verificada

3. **Se nao aprovada: requestPermission()**
   - Cria/solicita ThemePermission com status "pending"
   - Estado: Solicitacao registrada

4. **Admin aprova/denega via painel**
   - Estado: Permissao processada
