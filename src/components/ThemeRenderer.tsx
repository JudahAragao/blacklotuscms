import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { sanitizePath, maskSensitiveData } from '@/lib/security-utils';
import { themeStorage, getThemeStore, getReactStore } from '@/lib/theme-context';

import { themeRegistry } from '@/generated/theme-registry';

interface ThemeRendererProps {
  context: 'single' | 'search' | 'archive' | '404' | string;
  data: any;
  previewTheme?: string;
}

const LAYOUT_MAP: Record<string, string> = {
  single: 'post',
  search: 'search',
  archive: 'archive',
  '404': 'notFound',
  blog: 'blog',
};

export default async function ThemeRenderer({ context, data, previewTheme }: ThemeRendererProps) {
  const rawThemeName = previewTheme || await ThemeService.getActiveTheme();
  const requestedThemeName = sanitizePath(rawThemeName);
  const themeName = themeRegistry[requestedThemeName] ? requestedThemeName : 'default';

  const themeLayouts = themeRegistry[themeName] || themeRegistry.default;

  let layoutKey = LAYOUT_MAP[context] || sanitizePath(context);

  // Single post resolution:
  // - PostType "page" → page.tsx (or page.{subtype} if exists)
  // - Any other PostType → post.{type} → post.tsx
  if (context === 'single') {
    const postTypeSlug = sanitizePath(data.postType.slug);
    if (postTypeSlug === 'page') {
      // Check for page.{slug} first (e.g. page.blog), fallback to page
      const pageSlug = sanitizePath(data.slug);
      layoutKey = themeLayouts[`page.${pageSlug}`] ? `page.${pageSlug}` : 'page';
    } else if (themeLayouts[`post.${postTypeSlug}`]) {
      layoutKey = `post.${postTypeSlug}`;
    } else {
      layoutKey = 'post';
    }
  }

  let safeData = maskSensitiveData(data);

  const Layout = themeLayouts[layoutKey] || themeLayouts.post || themeRegistry.default.post;

  const themeData = await ThemeDataService.listAll(themeName);
  const themeSettings = Object.fromEntries(
    themeData
      .filter((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.key) && ['string', 'number'].includes(typeof item.value))
      .map((item) => [`--theme-setting-${item.key}`, String(item.value)])
  ) as React.CSSProperties;

  const store = getThemeStore();
  store.themeName = themeName;
  store.currentPost = safeData;

  // Sync with React.cache as fallback for unstable_cache async boundaries
  const reactStore = getReactStore();
  reactStore.themeName = themeName;
  reactStore.currentPost = safeData;

  return (
    <div data-bl-theme={themeName} className="blacklotuscms-theme min-h-screen" style={themeSettings}>
      
      {themeStorage.run({ themeName, currentPost: safeData }, () => (
        <Layout data={safeData} context={context} />
      ))}
    </div>
  );
}
