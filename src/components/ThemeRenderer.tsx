import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { sanitizePath, maskSensitiveData } from '@/lib/security-utils';
import { themeStorage } from '@/lib/theme-context';

import * as DefaultLayouts from '../../themes/default/layouts';

interface ThemeRendererProps {
  context: 'single' | 'search' | 'archive' | '404' | string;
  data: any;
  previewTheme?: string;
}

const THEME_REGISTRY: Record<string, Record<string, React.ComponentType<any>>> = {
  default: DefaultLayouts as any,
};

const LAYOUT_MAP: Record<string, string> = {
  single: 'post',
  search: 'search',
  archive: 'archive',
  '404': 'notFound',
  blog: 'blog',
};

export default async function ThemeRenderer({ context, data, previewTheme }: ThemeRendererProps) {
  const rawThemeName = previewTheme || await ThemeService.getActiveTheme();
  const themeName = sanitizePath(rawThemeName);

  let layoutKey = LAYOUT_MAP[context] || sanitizePath(context);

  if (context === 'single') {
    layoutKey = sanitizePath(data.postType.slug);
  }

  let safeData = maskSensitiveData(data);

  const themeLayouts = THEME_REGISTRY[themeName] || THEME_REGISTRY.default;
  const Layout = themeLayouts[layoutKey] || themeLayouts.post || (DefaultLayouts as any).post;

  const themeData = await ThemeDataService.listAll(themeName);
  const cssVariables = themeData
    .map(item => `--${item.key}: ${item.value};`)
    .join('\n');

  return (
    <div className="blacklotuscms-theme min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('/api/themes/${themeName}/style');
        
        .blacklotuscms-theme {
          ${cssVariables}
        }
      `}} />
      
      {themeStorage.run({ themeName, currentPost: safeData }, () => (
        <Layout data={safeData} context={context} />
      ))}
    </div>
  );
}
