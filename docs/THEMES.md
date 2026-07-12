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
