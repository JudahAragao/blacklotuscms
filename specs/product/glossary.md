---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Glossary - BlackLotusCMS

## Termos

- **G01 PostType:** Tipo de conteúdo definido pelo usuário (ex: "post", "page"). Define quais campos e taxonomias estão disponíveis.
- **G02 Post:** Instância de um PostType. Contém título, slug, conteúdo, status, SEO metadata e campos customizados.
- **G03 MetaField:** Campo customizado associado a um Post via FieldGroup. Armazenado na tabela MetaValue como JSON.
- **G04 FieldGroup:** Agrupamento de campos customizados com regras de localização. Vinculado a um PostType.
- **G05 Taxonomy:** Classificação vinculada a um PostType (ex: "categorias", "tags"). Contém Terms.
- **G06 Term:** Item dentro de uma Taxonomy (ex: "Tecnologia", "Design").
- **G07 Hook (Action/Filter):** Ponto de extensibilidade. Actions executam código; Filters transformam dados. Plugins e temas os utilizam.
- **G08 Bridge API:** Interface segura que o PluginSandbox expõe para plugins: log, auth, db, storage, hooks, permissions.
- **G09 PluginSandbox:** Ambiente isolado (isolated-vm) onde plugins executam com limite de memória e timeout.
- **G10 Theme:** Coleção de layouts React Server Components, assets e configuração (theme.json) que define a aparência pública.
- **G11 ThemeData:** Configurações chave-valor específicas de um tema, armazenadas no banco de dados.
- **G12 ThemePermission:** Registro de permissões solicitadas/aprovadas/denegadas para temas acessarem recursos do sistema.
- **G13 Capability:** String pontilhada (ex: "post.create", "theme.manage") que define o que um role pode fazer.
- **G14 Zero .env Architecture:** Sistema que utiliza .secrets.json em vez de variáveis de ambiente para configuração.
- **G15 Proxy (middleware):** Camada de rede (src/proxy.ts) que valida instalação, autenticação e rate limiting antes de rotear.
- **G16 Shortcode:** Macro que pode ser registrada por plugins e processada no conteúdo.
- **G17 Stable Proxy:** Padrão onde cada Service exporta tanto métodos de instância quanto métodos estáticos proxy.

## Relacionamentos

- PostType contém FieldGroups que contêm Fields
- PostType contém Taxonomies que contêm Terms
- Post está vinculado a Terms via PostTerm (N:N)
- Post contém MetaValues (campos customizados preenchidos)
- Plugin executado em PluginSandbox com Bridge API
- Theme acessa dados via ThemeDataService com validação de ThemePermission
