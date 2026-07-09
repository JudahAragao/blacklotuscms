import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { sanitizePath, maskSensitiveData } from '@/lib/security-utils';
import { themeStorage } from '@/lib/theme-context';

import DefaultPostLayout from '../../themes/default/layouts/post';
import DefaultPageLayout from '../../themes/default/layouts/page';
import DefaultArchiveLayout from '../../themes/default/layouts/archive';
import DefaultCategoryLayout from '../../themes/default/layouts/category';
import DefaultSearchLayout from '../../themes/default/layouts/search';
import Default404Layout from '../../themes/default/layouts/404';

interface ThemeRendererProps {
  context: 'single' | 'search' | 'archive' | '404' | string;
  data: any;
  previewTheme?: string;
}

const THEME_LAYOUTS: Record<string, Record<string, React.ComponentType<any>>> = {
  default: {
    post: DefaultPostLayout,
    page: DefaultPageLayout,
    archive: DefaultArchiveLayout,
    category: DefaultCategoryLayout,
    search: DefaultSearchLayout,
    '404': Default404Layout,
  },
};

export default async function ThemeRenderer({ context, data, previewTheme }: ThemeRendererProps) {
  const rawThemeName = previewTheme || await ThemeService.getActiveTheme();
  const themeName = sanitizePath(rawThemeName);

  let layoutKey = sanitizePath(context);

  let safeData = maskSensitiveData(data);

  if (context === 'single') {
    layoutKey = sanitizePath(data.postType.slug);
  } else if (context === 'search') {
    layoutKey = 'search';
  } else if (context === 'archive') {
    layoutKey = 'archive';
  } else if (context === '404') {
    layoutKey = '404';
  }

  const themeLayouts = THEME_LAYOUTS[themeName] || THEME_LAYOUTS.default;
  const Layout = themeLayouts[layoutKey] || themeLayouts.post || DefaultPostLayout;

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
