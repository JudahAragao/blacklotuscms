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
import { getField, haveRows, getRows } from '@/lib/theme-helpers';
```

### Funções Disponíveis

| Função | Descrição |
|--------|-----------|
| `getField(name)` | Retorna o valor de um campo |
| `theField(name)` | Alias de `getField` (para JSX) |
| `haveRows(name)` | Retorna `true` se repeater tem linhas |
| `getRows(name)` | Retorna array de linhas do repeater |
| `getSubField(name)` | Retorna valor de subcampo (dentro de rowContext) |
| `theSubField(name)` | Alias de `getSubField` |
| `getRowIndex()` | Retorna índice da row atual |
| `getFieldObject(name)` | Retorna `{ name, type, config, value }` |
| `getFieldName(name)` | Retorna nome do campo |
| `getFieldType(name)` | Retorna tipo do campo |

### Exemplo: Campos Simples

```tsx
import { getField, theField } from '@/lib/theme-helpers';

export default async function PostLayout({ data }) {
  return (
    <div>
      <h1>{getField('titulo')}</h1>
      <p>{theField('subtitulo')}</p>
      <img src={getField('hero_image')} alt="" />
    </div>
  );
}
```

### Exemplo: Repeater

```tsx
import { getRows, getField } from '@/lib/theme-helpers';

export default async function ProjetosLayout({ data }) {
  const projetos = getRows('projetos');

  return (
    <div>
      <h1>{getField('page_title')}</h1>
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
import { getRows, getField } from '@/lib/theme-helpers';

export default async function PageLayout({ data }) {
  const sections = getRows('page_sections');

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

## Template Hierarchy (Estilo WordPress)

O sistema de temas suporta uma hierarchy de templates similar ao WordPress. Arquivos de layout usam **pontos** no nome para indicar templates especializados por PostType.

### Convenção de Nomenclatura

| Arquivo | Uso |
|---------|-----|
| `post.tsx` | Post individual genérico (fallback para qualquer PostType) |
| `post.blog.tsx` | Post individual do PostType "blog" |
| `post.projetos.tsx` | Post individual do PostType "projetos" |
| `page.tsx` | Página genérica (fallback) |
| `page.blog.tsx` | Listagem/archive do PostType "blog" |
| `page.projetos.tsx` | Listagem/archive do PostType "projetos" |

### Como Exportar

No `layouts/index.ts`, usar **string export names**:

```ts
export { default as post } from './post';
export { default as page } from './page';
export { default as "post.blog" } from './post.blog';
export { default as "page.blog" } from './page.blog';
```

### Fallback Chain

Quando um post individual é acessado, o ThemeRenderer tenta na ordem:

1. `post.{postType.slug}` (ex: `post.blog`)
2. `post` (genérico)
3. `default.post` (tema default)

Exemplo: PostType "blog" → tenta `post.blog.tsx` → se não existir, usa `post.tsx`.

### Exemplo Completo

```
/blog              → page.blog.tsx (listagem)
/blog/meu-artigo   → post.blog.tsx (individual)
/projetos          → page.projetos.tsx (listagem)
/projetos/x        → post.projetos.tsx (individual)
/sobre             → page.tsx (genérico, PostType "page")
```
