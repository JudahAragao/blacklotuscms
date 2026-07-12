import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { sanitizePath, maskSensitiveData } from '@/lib/security-utils';
import { themeStorage } from '@/lib/theme-context';

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
  // A database setting can outlive a removed source folder. Render a complete
  // default theme instead of an unstyled default layout under an unknown id.
  const themeName = themeRegistry[requestedThemeName] ? requestedThemeName : 'default';

  let layoutKey = LAYOUT_MAP[context] || sanitizePath(context);

  if (context === 'single') {
    layoutKey = sanitizePath(data.postType.slug);
  }

  let safeData = maskSensitiveData(data);

  const themeLayouts = themeRegistry[themeName] || themeRegistry.default;
  const Layout = themeLayouts[layoutKey] || themeLayouts.post || themeRegistry.default.post;

  const themeData = await ThemeDataService.listAll(themeName);
  const themeSettings = Object.fromEntries(
    themeData
      .filter((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.key) && ['string', 'number'].includes(typeof item.value))
      .map((item) => [`--theme-setting-${item.key}`, String(item.value)])
  ) as React.CSSProperties;

  return (
    <div data-bl-theme={themeName} className="blacklotuscms-theme min-h-screen" style={themeSettings}>
      
      {themeStorage.run({ themeName, currentPost: safeData }, () => (
        <Layout data={safeData} context={context} />
      ))}
    </div>
  );
}
