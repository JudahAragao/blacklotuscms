---
spec_version: "1.2"
last_updated: "2026-07-13"
author: "BlackLotusCMS Team"
status: approved
---

# Glossary - BlackLotusCMS

## Terms

- **G01 PostType:** Tipo de conteúdo definido pelo user (ex: "post", "page"). Define quais fields e taxonomias estão disponíveis.
- **G02 Post:** Instância de um PostType. Contém título, slug, conteúdo, status, SEO metadata e fields customizeds.
- **G03 MetaField:** Field customized associado a um Post via FieldGroup. Armazenado na tabela MetaValue como JSON.
- **G04 FieldGroup:** Grouping de fields customizeds com locations que determinam onde aparecem (post types, taxonomias, posts específicos, etc).
- **G05 Taxonomy:** Classification vinculada a um PostType (ex: "categorias", "tags"). Contém Terms.
- **G06 Term:** Ihas dentro de uma Taxonomy (ex: "Tecnologia", "Design").
- **G07 Hook (Action/Filter):** Ponto de extensibilidade. Actions executam código; Filters transformam data. Plugins e themes os utilizam.
- **G08 Bridge API:** Interface secure que o PluginSandbox expõe para plugins: log, auth, db, storage, hooks, permissions.
- **G09 PluginSandbox:** Environment isolado (isolated-vm) onde plugins executam com limite de memória e timeout.
- **G10 Theme:** Collection de layouts React Server Components, assets e configuration (theme.json) que define a appearance public.
- **G11 ThemeData:** Configurações chave-valor específicas de um theme, armazenadas no banco de data.
- **G12 ThemePermission:** Registro de permissões solicitadas/aprovadas/denegadas para themes acessarem recursos do sistema.
- **G13 Capability:** String pontilhada (ex: "post.create", "theme.manage") que define o que um role pode fazer.
- **G14 Zero .env Architecture:** Sistema que utiliza .secrets.json em vez de variáveis de ambiente para configuration.
- **G15 Proxy (middleware):** Camada de rede (src/proxy.ts) que valida instalação, autenticação e rate limiting antes de rotear.
- **G16 Shortcode:** Macro que pode ser registrada por plugins e processada no conteúdo.
- **G17 Stable Proxy:** Padrão onde cada Service exporta tanto métodos de instância quanto métodos estáticos proxy.
- **G18 Tab (Field Type):** Campo organizador visual que cria abas navegáveis no editor de posts. Campos abaixo de uma Tab (até a próxima Tab) ficam agrupados nessa aba. Não armazena dados.
- **G19 Section (Field Type):** Campo organizador visual que cria divisores/títulos de seção dentro de uma aba no editor de posts. Não quebra o agrupamento da aba pai. Não armazena dados.
- **G20 Sub-field:** Campo filho armazenado dentro de um Repeater ou Flexible Content. Pode ser criado via drag-and-drop (movendo um campo-raiz para dentro do container) ou via clique na zona de drop. Mantém todas as configurações (tipo, validação, lógica condicional) ao mudar de nível.
- **G21 Unified Field System:** Sistema onde campos-raiz e sub-compartilham a mesma estrutura e podem se mover livremente entre níveis via drag-and-drop, similar ao ACF (Advanced Custom Fields).

## Relacionamentos

- FieldGroup contém FieldGroupLocations que determinam onde aparece
- PostType contains Taxonomies que contêm Terms
- Post está vinculado a Terms via PostTerm (N:N)
- Post contains MetaValues (fields customizeds preenchidos)
- Term contains MetaValues (fields customizeds de taxonomias)
- Plugin executed em PluginSandbox com Bridge API
- Theme acessa data via ThemeDataService com validação de ThemePermission
