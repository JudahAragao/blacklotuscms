---
spec_version: "1.2"
last_updated: "2026-07-13"
author: "BlackLotusCMS Team"
status: approved
feature: "post-management"
---

# Post Management Acceptance Tests

## AT-01: Criar Post como Administrador
- **GIVEN** an authenticated Administrator user
- **WHEN** envia POST /api/v1/posts/post com titulo, slug, content, status="published"
- **THEN** o post e criado com status "published" e publishedAt definido
- **TEST DATA:** `{ "title": "Meu Post", "slug": "meu-post", "content": "Conteudo", "status": "published" }`
- **Referencia:** FR05, BR04

## AT-02: Contributor Draft Lock
- **GIVEN** um usuario Contributor autenticado
- **WHEN** envia POST com status="published"
- **THEN** o post e criado com status "draft"
- **TEST DATA:** `{ "title": "Post Contributor", "slug": "post-colab", "status": "published" }`
- **Referencia:** FR05, BR02

## AT-03: Duplicate Slug
- **GIVEN** um post com slug "meu-post" ja existe
- **WHEN** tenta criar outro post com mesmo slug
- **THEN** retorna erro 409 ou erro de validacao
- **Referencia:** FR05

## AT-04: Post Nao Visivel Publicamente
- **GIVEN** um post com status "draft"
- **WHEN** theme consulta PostService.getLeanPostsByType
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-05: Post com Expiracao
- **GIVEN** um post com expiresAt no passado
- **WHEN** theme consulta publicamente
- **THEN** o post nao e retornado
- **Referencia:** FR05, BR01

## AT-06: Editar Post de Outro Autor
- **GIVEN** um Autor tentando editar post de outro usuario
- **WHEN** envia update sem capability "post.manage"
- **THEN** retorna erro 403
- **Referencia:** FR05, BR04

## AT-07: MetaFields Validation
- **GIVEN** um post com FieldGroup configurado
- **WHEN** envia metaFields com campo obrigatorio vazio
- **THEN** retorna erro 422
- **Referencia:** FR06

## AT-08: Cache Revalidation
- **GIVEN** posts listados com cache
- **WHEN** um post e criado ou atualizado
- **THEN** revalidateTag('posts') e chamado e cache e invalidado
- **Referencia:** FR05, NFR01

## AT-09: Tab and Section Field Types
- **GIVEN** um PostType com campos Tab e Section configurados
- **WHEN** usuario cria uma Aba "Dados Gerais" com campos abaixo, e uma Secao "Midia" com campos abaixo
- **THEN** o editor de posts exibe navegacao por abas, com secao visual dentro da aba ativa
- **AND** campos Tab/Section nao geram MetaValues nem validacao
- **Referencia:** FR06

## AT-10: Tab Field Groups Correctly
- **GIVEN** um PostType com 3 abas: "Geral", "SEO", "Avancado"
- **WHEN** usuario navega entre as abas no editor
- **THEN** cada aba exibe apenas seus campos (campos entre uma Tab e a proxima Tab)
- **Referencia:** FR06

## AT-11: Drag and Drop No Accidental Reorder
- **GIVEN** um FieldGroup com campos customizados
- **WHEN** usuario arrasta um campo e solta no mesmo lugar
- **THEN** a ordem dos campos nao e alterada
- **Referencia:** FR06

## AT-12: Auto-Deduplicate Field Anchors
- **GIVEN** um PostType com campo "Titulo" (anchor: titulo)
- **WHEN** usuario cria outro campo com rotulo "Titulo"
- **THEN** o anchor do segundo campo e "titulo_2"
- **AND** terceiro "Titulo" gera "titulo_3"
- **Referencia:** FR06

## AT-13: Tab/Section Visual Distinction
- **GIVEN** um FieldGroup com campos Tab, Section e campos de dados
- **WHEN** usuario visualiza a lista de campos
- **THEN** campos Tab e Section exibem fundo mais escuro e badge "aba"/"secao"
- **Referencia:** FR06

## AT-14: FieldGroup Location Rules
- **GIVEN** um FieldGroup com location "Post Type = Post"
- **WHEN** usuario cria um post no tipo "Post"
- **THEN** os campos do FieldGroup aparecem no editor
- **AND** posts em outros tipos NÃO mostram esses campos
- **Referencia:** FR06

## AT-15: Multiple Location Rules
- **GIVEN** um FieldGroup com locations "Post Type = Post" e "Post Type = Page"
- **WHEN** usuario cria um post ou uma página
- **THEN** os campos do FieldGroup aparecem em ambos
- **Referencia:** FR06

## AT-16: Taxonomy Field Groups
- **GIVEN** um FieldGroup com location "Taxonomy = category"
- **WHEN** usuario edita uma categoria
- **THEN** os campos do FieldGroup aparecem na edição da categoria
- **Referencia:** FR06

## AT-17: FieldGroups Admin Page
- **GIVEN** um administrador
- **WHEN** acessa /admin/settings/field-groups
- **THEN** pode listar, criar, editar e excluir FieldGroups com locations
- **Referencia:** FR06

## AT-18: Repeater Sub-Fields
- **GIVEN** um FieldGroup com campo Repeater contendo sub-campos (text, image)
- **WHEN** usuario adiciona itens no repeater
- **THEN** cada linha exibe os sub-campos configurados
- **AND** dados são salvos como array de objetos
- **Referencia:** FR06

## AT-19: Flexible Content Layouts
- **GIVEN** um FieldGroup com campo Flexible Content com 2 layouts (Hero, Texto)
- **WHEN** usuario clica em "+ Hero" ou "+ Texto"
- **THEN** um novo bloco é adicionado com os sub-campos daquele layout
- **AND** usuario pode adicionar múltiplos blocos em qualquer ordem
- **Referencia:** FR06

## AT-20: Sub-Fields Inline Layout
- **GIVEN** um Repeater com sub-campos configurados
- **WHEN** usuario visualiza os sub-campos no editor de field groups
- **THEN** sub-campos aparecem em formato inline com #, Rótulo, Nome (âncora), Tipo
- **AND** cada sub-campo tem botões de configuração (engrenagem) e remoção (lixeira)
- **AND** ao clicar na engrenagem, painel com abas (Geral, Validação, Lógica Condicional) é expandido
- **Referencia:** FR06

## AT-21: Repeater Layout Modes
- **GIVEN** um campo Repeater com layout "Table" selecionado
- **WHEN** usuario visualiza o repeater na página de edição do post
- **THEN** os itens são exibidos em formato de tabela com colunas
- **AND** layout "Block" exibe como cards e "Row" exibe em linha
- **Referencia:** FR06

## AT-22: Drag Field to Repeater (Root → Sub-field)
- **GIVEN** um FieldGroup com campo-raiz "Text" e campo Repeater com sub-campos
- **WHEN** usuario arrasta o campo "Text" para a zona de drop dentro do Repeater
- **THEN** o campo "Text" é removido da lista de campos-raiz
- **AND** o campo "Text" é adicionado como sub-campo do Repeater
- **AND** toda configuração do campo (tipo, validação, etc.) é preservada
- **Referencia:** REQ-03a

## AT-23: Drag Sub-field to Root (Sub-field → Root)
- **GIVEN** um Repeater com sub-campo "Email"
- **WHEN** usuario arrasta o sub-campo "Email" para a lista de campos-raiz
- **THEN** o sub-campo "Email" é removido do Repeater
- **AND** o campo "Email" é adicionado como campo-raiz
- **AND** toda configuração do campo é preservada
- **Referencia:** REQ-03a

## AT-24: Drag Between Repeaters
- **GIVEN** dois Repeaters: "Repeater A" com sub-campo "Name" e "Repeater B"
- **WHEN** usuario arrasta "Name" de "Repeater A" para "Repeater B"
- **THEN** o sub-campo "Name" é removido de "Repeater A"
- **AND** o sub-campo "Name" é adicionado em "Repeater B"
- **Referencia:** REQ-03a

## AT-25: Drag to Flexible Content Layout
- **GIVEN** um campo Flexible Content com layout "Hero" e campo-raiz "Image"
- **WHEN** usuario arrasta "Image" para a zona de drop dentro do layout "Hero"
- **THEN** o campo "Image" é removido da lista de campos-raiz
- **AND** o campo "Image" é adicionado como sub-campo do layout "Hero"
- **Referencia:** REQ-03a

## AT-26: Drop Zone Visual Feedback
- **GIVEN** um Repeater ou Flexible Content Layout
- **WHEN** usuario arrasta um campo sobre a zona de drop
- **THEN** a zona de drop exibe feedback visual (borda tracejada azul, texto "Soltar aqui")
- **AND** ao soltar, o campo é movido para o destino correto
- **Referencia:** REQ-03a

## AT-27: Sub-Field Config Tabs
- **GIVEN** um sub-campo expandido no editor de field groups
- **WHEN** usuario clica na engrenagem do sub-campo
- **THEN** painel de configuração é expandido com abas: Geral, Validação, Lógica Condicional
- **AND** aba Geral mostra: Tipo (FieldTypeSelector), Largura, Instruções, Obrigatório
- **AND** aba Validação mostra: Min, Max
- **AND** aba Lógica Condicional mostra: Status (Ativo/Inativo) e regras
- **Referencia:** REQ-03

## AT-28: FieldTypeSelector for Sub-Fields
- **GIVEN** um sub-campo com aba Geral expandida
- **WHEN** usuario clica no seletor de tipo
- **THEN** dropdown aberto com ícones, categorias e busca
- **AND** mesmo comportamento do seletor de campos-raiz
- **Referencia:** REQ-03

## AT-29: Click to Add Sub-Field
- **GIVEN** um Repeater ou Flexible Content Layout
- **WHEN** usuario clica na zona de drop "Arraste ou clique para adicionar sub-campo"
- **THEN** um novo sub-campo é adicionado ao repeater/layout
- **AND** sub-campo é criado com tipo "text" e configurações padrão
- **Referencia:** REQ-03

## AT-30: Save Button Stays on Page
- **GIVEN** um FieldGroup sendo editado
- **WHEN** usuario clica em "Salvar Configuração"
- **THEN** mensagem de sucesso é exibida
- **AND** usuario permanece na mesma página de edição (não redireciona para lista)
- **Referencia:** REQ-03

## AT-31: Sub-Field Name Auto-Generation
- **GIVEN** um sub-campo com rótulo "Telefone Comercial"
- **WHEN** usuario digita o rótulo
- **THEN** nome âncora é gerado automaticamente como "telefone_comercial"
- **AND** nome âncora é atualizado sempre que o rótulo muda
- **AND** campo de nome âncora é editável para personalização manual
- **Referencia:** REQ-03
