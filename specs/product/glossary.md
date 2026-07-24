---
spec_version: "1.2"
last_updated: "2026-07-23"
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
- **G22 Icon (Field Type):** Campo que permite selecionar ícones de duas fontes: lib lucide-react (1000+ ícones SVG vetoriais) ou SVG customizado com sanitização de segurança. Armazenado como objeto { iconSource, iconName, iconSvg, iconColor, iconSize }.
- **G23 Compiled Plugin:** Plugin TypeScript compilado junto com Next.js, com bridge Proxy-based e suporte a npm packages. Diferente de Imported Plugins (ZIP upload, isolated-vm).
- **G24 NetworkService:** Serviço que gerencia HTTP outbound (whitelist de domínios, rate limit), webhooks inbound (HMAC-SHA256 verification, retry) e audit log para plugins.
- **G25 RouteService:** Serviço de pattern matching que resolve URLs para templates + params, com cadeia de resolução: plugin routes → theme routes → default theme routes → CMS padrão.
- **G26 ShortcodeService:** Serviço de processamento de macros registráveis por plugins no conteúdo. Suporta atributos e conteúdo encerrado. Output é sanitizado com DOMPurify.
- **G27 Reading Settings:** Configurações de leitura: page_on_front (home page), page_for_posts (posts page), posts_per_page. Afeta sitemap e renderização de temas.
- **G28 IconPicker:** Componente de seleção de ícones com duas fontes: lib lucide-react (1000+ ícones) ou SVG customizado com sanitização.
- **G29 NetworkAuditLog:** Registro de todas as chamadas HTTP outbound e webhooks inbound de plugins, com timestamp, URL, method, status e error.
- **G30 PluginNetworkConfig:** Configuração de rede por plugin: allowedDomains (whitelist), httpRateLimit, webhookSecret (HMAC), isActive.

## Relacionamentos

- FieldGroup contém FieldGroupLocations que determinam onde aparece
- PostType contains Taxonomies que contêm Terms
- Post está vinculado a Terms via PostTerm (N:N)
- Post contains MetaValues (fields customizeds preenchidos)
- Term contains MetaValues (fields customizeds de taxonomias)
- Plugin executed em PluginSandbox com Bridge API
- Plugin Compiled Plugin executado via CompiledPluginLoader com Bridge Proxy
- Theme acessa data via ThemeDataService com validação de ThemePermission
- Plugin acessa rede via NetworkService (HTTP outbound, webhooks)
- RouteService resolve URLs para templates de plugins e themes
- ShortcodeService processa macros no conteúdo
- Reading Settings afeta sitemap e renderização de temas
