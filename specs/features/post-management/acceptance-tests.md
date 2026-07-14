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

## AT-20: Sub-Fields Table Layout
- **GIVEN** um Repeater com layout "Tabela" configurado
- **WHEN** usuario visualiza os sub-campos no editor de field groups
- **THEN** sub-campos aparecem em formato de tabela com colunas #, Label, Name, Type
- **AND** cada sub-campo pode ser expandido para configuração completa
- **Referencia:** FR06

## AT-21: Repeater Layout Modes
- **GIVEN** um campo Repeater com layout "Table" selecionado
- **WHEN** usuario visualiza o repeater na página de edição do post
- **THEN** os itens são exibidos em formato de tabela com colunas
- **AND** layout "Block" exibe como cards e "Row" exibe em linha
- **Referencia:** FR06
