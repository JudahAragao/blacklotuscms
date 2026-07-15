# Desenvolvimento de temas

Temas são parte do código-fonte e entram na build única do BlackLotusCMS. Não há upload de ZIP, instalação pelo painel ou compilação de layouts em runtime.

## Fluxo

1. Crie ou copie uma pasta em `themes/meu-tema/`.
2. Inclua `theme.json`, `theme.ts`, `style.css`, layouts e assets.
3. Execute `npm run dev` ou `npm run build`.
4. Ative no painel um dos temas incluídos na build.

Os hooks `predev`, `prebuild` e `pretest` executam `themes:generate`. Ele valida as pastas e gera o registry estático e o CSS isolado em `src/generated/`; esses arquivos não devem ser editados manualmente.

## Estrutura

```text
themes/meu-tema/
├── theme.json
├── theme.ts
├── style.css
├── assets/
├── components/
└── layouts/
    ├── index.ts
    ├── page.tsx
    ├── post.tsx
    ├── archive.tsx
    ├── search.tsx
    └── 404.tsx
```

`theme.ts` exporta os layouts do tema. Os nomes reconhecidos são `page`, `post`, `archive`, `search`, `category`, `blog` e `notFound`. O nome da pasta é o ID: use apenas minúsculas, números e hífens. O tema `default` é obrigatório.

## Manifesto

```json
{
  "name": "Meu tema",
  "version": "1.0.0",
  "themeApiVersion": 1,
  "author": "Nome",
  "description": "Descrição",
  "favicon": "assets/favicon.ico"
}
```

`themeApiVersion` indica a versão do contrato de temas. Atualmente apenas `1` é suportado.

## CSS puro, isolamento e assets

Todo `style.css` entra na build e é isolado no root ativo:

```html
<div data-bl-theme="meu-tema" class="blacklotuscms-theme">…</div>
```

CSS puro é suportado. `:root` é convertido para o root do tema; não use `html` ou `body`. Animações recebem o namespace `bl-<id-do-tema>-`; referências inline no JSX usam esse nome gerado. Prefira classes e variáveis próprias, por exemplo `--meu-accent` e `.meu-hero`. Para assets, use `/api/themes/meu-tema/assets/...`.

## Tailwind CSS v4

Tailwind é compilado uma vez para todos os temas. Use os tokens semânticos oficiais:

```text
background, foreground, primary, primary-foreground,
secondary, secondary-foreground, muted, muted-foreground,
card, card-foreground, accent, accent-foreground,
border, input, ring,
destructive, destructive-foreground
```

```tsx
<section className="bg-card text-foreground border border-border">
  <h1 className="font-display text-primary">Título</h1>
</section>
```

O `style.css` do tema sobrescreve os valores em `.blacklotuscms-theme`. Para valores exclusivos use CSS normal ou utilities arbitrárias, como `bg-[var(--meu-surface)]`. Não crie nomes Tailwind novos somente no `style.css`: eles não existem para o compilador.

## Configurações visuais

Settings fornecidos por integrações são expostos como `--theme-setting-<chave>` (chave em kebab-case; valor string ou número). Eles nunca substituem diretamente tokens internos. O tema pode consumi-los explicitamente:

```css
.blacklotuscms-theme {
  --color-primary: var(--theme-setting-primary-color, #b08a3c);
}
```

A build falha para manifesto/ID inválido, `themeApiVersion` incompatível, ausência de `default`, uso de `html` ou `body`, e referências a variáveis CSS não declaradas. Essas falhas devem bloquear o deploy.

O painel não edita arquivos de tema: layouts, manifestos e CSS são alterados no repositório e entram na próxima build.

## Acessando dados de campos customizados

Campos customizados (MetaFields) ficam disponíveis em `data.meta` como um objeto key-value:

```tsx
// Ex: campo "hero_image" do tipo image
<img src={data.meta.hero_image} alt="Hero" />

// Ex: campo "documentos" do tipo file
<a href={data.meta.documentos} target="_blank">Download</a>

// Ex: campo "galeria" do tipo gallery
{data.meta.galeria?.map((url: string) => (
  <img key={url} src={url} />
))}
```

**URLs completas:** Valores de campos `file`, `image` e `gallery` são retornados como URLs absolutas (ex: `https://domain.com/uploads/12345-file.pdf`). Isso garante funcionamento correto em `<img src>`, `<a href>` e contextos externos (RSS, APIs).

## Theme Helpers (Estilo ACF)

O módulo `@/lib/theme-helpers` fornece funções helper para acessar campos customizados em layouts de tema, similar ao ACF do WordPress.

```tsx
import { get_field, have_rows, get_rows } from '@/lib/theme-helpers';
```

### Funções Disponíveis

| Função | Descrição |
|--------|-----------|
| `get_field(name)` | Retorna o valor de um campo |
| `the_field(name)` | Alias de `get_field` (para JSX) |
| `have_rows(name)` | Retorna `true` se repeater tem linhas |
| `get_rows(name)` | Retorna array de linhas do repeater |
| `get_sub_field(name)` | Retorna valor de subcampo (dentro de rowContext) |
| `the_sub_field(name)` | Alias de `get_sub_field` |
| `get_row_index()` | Retorna índice da row atual |
| `get_field_object(name)` | Retorna `{ name, type, config, value }` |
| `get_field_name(name)` | Retorna nome do campo |
| `get_field_type(name)` | Retorna tipo do campo |

### Exemplo: Campos Simples

```tsx
import { get_field, the_field } from '@/lib/theme-helpers';

export default async function PostLayout({ data }) {
  return (
    <div>
      <h1>{get_field('titulo')}</h1>
      <p>{the_field('subtitulo')}</p>
      <img src={get_field('hero_image')} alt="" />
    </div>
  );
}
```

### Exemplo: Repeater

```tsx
import { get_rows, get_field } from '@/lib/theme-helpers';

export default async function ProjetosLayout({ data }) {
  const projetos = get_rows('projetos');

  return (
    <div>
      <h1>{get_field('page_title')}</h1>
      {projetos.map((projeto, i) => (
        <div key={i}>
          <h2>{projeto.titulo}</h2>
          <p>{projeto.descricao}</p>
          <img src={projeto.foto} alt="" />
        </div>
      ))}
    </div>
  );
}
```

### Exemplo: Flexible Content

```tsx
import { get_rows, get_field } from '@/lib/theme-helpers';

export default async function PageLayout({ data }) {
  const sections = get_rows('page_sections');

  return (
    <div>
      {sections.map((section, i) => {
        switch (section._layout) {
          case 'hero':
            return <Hero key={i} title={section.title} bg={section.background_image} />;
          case 'text_block':
            return <TextBlock key={i} content={section.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
```

### Nota sobre `the_row()`

No ACF (PHP), `the_row()` avança o iterador interno. Em React Server Components, o equivalente é usar `get_rows().map()`. A função `the_row()` existe para compatibilidade de sintaxe mas é um no-op.
