---
spec_version: "1.0"
last_updated: "2026-07-05"
author: "BlackLotusCMS Team"
status: approved
---

# Glossary - BlackLotusCMS

## Terms

- **G01 PostType:** Tipo de conteúdo definido pelo user (ex: "post", "page"). Define quais fields e taxonomias estão disponíveis.
- **G02 Post:** Instância de um PostType. Contém título, slug, conteúdo, status, SEO metadata e fields customizeds.
- **G03 MetaField:** Field customized associado a um Post via FieldGroup. Armazenado na tabela MetaValue witho JSON.
- **G04 FieldGroup:** Grouping de fields customizeds with rules de location. Linked a um PostType.
- **G05 Taxonomy:** Classification vinculada a um PostType (ex: "categorias", "tags"). Contém Terms.
- **G06 Term:** Ihas dentro de uma Taxonomy (ex: "Tecnologia", "Design").
- **G07 Hook (Action/Filter):** Ponto de extensibilidade. Actions executam código; Filters transformam data. Plugins e themes os utilizam.
- **G08 Bridge API:** Interface secure que o PluginSandbox expõe para plugins: log, auth, db, storage, hooks, permissions.
- **G09 PluginSandbox:** Environment isolado (isolated-vm) onde plugins executam with limite de memória e timeout.
- **G10 Theme:** Collection de layouts React Server Components, assets e configuration (theme.json) que define a appearance public.
- **G11 ThemeData:** Configurações chave-valor específicas de um theme, armazenadas no banco de data.
- **G12 ThemePermission:** Registro de permissões solicitadas/aprovadas/denegadas para themes acessarem recursos do system.
- **G13 Capability:** String pontilhada (ex: "post.create", "theme.manage") que define o que um role pode fazer.
- **G14 Zero .env Architecture:** System que utiliza .secrets.json em vez de variáveis de ambiente para configuration.
- **G15 Proxy (middleware):** Camada de rede (src/proxy.ts) que valida instalação, autenticação e rate limiting antes de rotear.
- **G16 Shortcode:** Macro que pode ser registrada por plugins e processada no conteúdo.
- **G17 Stable Proxy:** Padrão onde cada Service exporta tanto métodos de instância quanto métodos estáticos proxy.

## Relacionamentos

- PostType contains FieldGroups que contêm Fields
- PostType contains Taxonomies que contêm Terms
- Post está vinculado a Terms via PostTerm (N:N)
- Post contains MetaValues (fields customizeds preenchidos)
- Plugin executed em PluginSandbox with Bridge API
- Theme acessa data via ThemeDataService with validação de ThemePermission
