---
spec_version: "1.2"
last_updated: "2026-07-23"
author: "BlackLotusCMS Team"
status: approved
---

# Glossary - BlackLotusCMS

## Terms

- **G01 PostType:** Content type defined by the user (e.g., "post", "page"). Defines which fields and taxonomies are available.
- **G02 Post:** Instance of a PostType. Contains title, slug, content, status, SEO metadata, and customized fields.
- **G03 MetaField:** Customized field associated with a Post via FieldGroup. Stored in the MetaValue table as JSON.
- **G04 FieldGroup:** Grouping of customized fields with locations that determine where they appear (post types, taxonomies, specific posts, etc.).
- **G05 Taxonomy:** Classification linked to a PostType (e.g., "categories", "tags"). Contains Terms.
- **G06 Term:** Items within a Taxonomy (e.g., "Technology", "Design").
- **G07 Hook (Action/Filter):** Extensibility point. Actions execute code; Filters transform data. Plugins and themes use them.
- **G08 Bridge API:** Secure interface that the PluginSandbox exposes to plugins: log, auth, db, storage, hooks, permissions.
- **G09 PluginSandbox:** Isolated environment (isolated-vm) where plugins execute with memory and timeout limits.
- **G10 Theme:** Collection of React Server Components layouts, assets, and configuration (theme.json) that defines the public appearance.
- **G11 ThemeData:** Key-value configuration specific to a theme, stored in the data database.
- **G12 ThemePermission:** Record of requested/approved/denied permissions for themes to access system resources.
- **G13 Capability:** Dot-separated string (e.g., "post.create", "theme.manage") that defines what a role can do.
- **G14 Zero .env Architecture:** System that uses .secrets.json instead of environment variables for configuration.
- **G15 Proxy (middleware):** Network layer (src/proxy.ts) that validates installation, authentication, and rate limiting before routing.
- **G16 Shortcode:** Macro that can be registered by plugins and processed in content.
- **G17 Stable Proxy:** Pattern where each Service exports both instance methods and static proxy methods.
- **G18 Tab (Field Type):** Visual organizer field that creates navigable tabs in the post editor. Fields below a Tab (until the next Tab) are grouped in that tab. Does not store data.
- **G19 Section (Field Type):** Visual organizer field that creates dividers/section titles within a tab in the post editor. Does not break the parent tab grouping. Does not store data.
- **G20 Sub-field:** Child field stored within a Repeater or Flexible Content. Can be created via drag-and-drop (moving a root field into the container) or via click in the drop zone. Maintains all configurations (type, validation, conditional logic) when changing levels.
- **G21 Unified Field System:** System where root fields and sub-fields share the same structure and can move freely between levels via drag-and-drop, similar to ACF (Advanced Custom Fields).
- **G22 Icon (Field Type):** Field that allows selecting icons from two sources: lucide-react library (1000+ vectorial SVG icons) or customized SVG with security sanitization. Stored as object { iconSource, iconName, iconSvg, iconColor, iconSize }.
- **G23 Compiled Plugin:** TypeScript plugin compiled together with Next.js, with Proxy-based bridge and npm package support. Different from Imported Plugins (ZIP upload, isolated-vm).
- **G24 NetworkService:** Service that manages HTTP outbound (domain whitelist, rate limit), inbound webhooks (HMAC-SHA256 verification, retry), and audit log for plugins.
- **G25 RouteService:** Pattern matching service that resolves URLs to templates + params, with resolution chain: plugin routes → theme routes → default theme routes → default CMS.
- **G26 ShortcodeService:** Macro processing service registerable by plugins in content. Supports attributes and closed content. Output is sanitized with DOMPurify.
- **G27 Reading Settings:** Reading configuration: page_on_front (home page), page_for_posts (posts page), posts_per_page. Affects sitemap and theme rendering.
- **G28 IconPicker:** Icon selection component with two sources: lucide-react library (1000+ icons) or customized SVG with sanitization.
- **G29 NetworkAuditLog:** Record of all outbound HTTP calls and inbound webhooks from plugins, with timestamp, URL, method, status, and error.
- **G30 PluginNetworkConfig:** Network configuration per plugin: allowedDomains (whitelist), httpRateLimit, webhookSecret (HMAC), isActive.

## Relationships

- FieldGroup contains FieldGroupLocations that determine where it appears
- PostType contains Taxonomies that contain Terms
- Post is linked to Terms via PostTerm (N:N)
- Post contains MetaValues (filled customized fields)
- Term contains MetaValues (taxonomies customized fields)
- Plugin executed in PluginSandbox with Bridge API
- Plugin Compiled Plugin executed via CompiledPluginLoader with Bridge Proxy
- Theme accesses data via ThemeDataService with ThemePermission validation
- Plugin accesses network via NetworkService (HTTP outbound, webhooks)
- RouteService resolves URLs for plugins and themes templates
- ShortcodeService processes macros in content
- Reading Settings affects sitemap and theme rendering
