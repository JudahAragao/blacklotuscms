import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { ShortcodeService } from '@/core/services/ShortcodeService';
import { sanitizePath, maskSensitiveData, sanitizeHtml } from '@/lib/security-utils';
import { themeStorage } from '@/lib/theme-context';
import path from 'path';

interface ThemeRendererProps {
  context: 'single' | 'search' | 'archive' | '404' | string;
  data: any;
  previewTheme?: string;
}

/**
 * Loads a theme module at runtime using native require().
 * This works in custom server mode where require() is available natively.
 */
function loadThemeModule(filePath: string): any {
  const req = (globalThis as any).__themeRequire;
  if (!req) {
    throw new Error('Theme require not available. Make sure custom server is running.');
  }
  return req(filePath);
}

export default async function ThemeRenderer({ context, data, previewTheme }: ThemeRendererProps) {
  // 1. Sanitize the theme name coming from the database or preview
  const rawThemeName = previewTheme || await ThemeService.getActiveTheme();
  const themeName = sanitizePath(rawThemeName);
  
  let layoutFile = sanitizePath(context); 

  // 2. Clean and mask sensitive data before sending it to the theme
  let safeData = maskSensitiveData(data);

  if (context === 'single') {
    // Sanitize the post type slug before using it in the dynamic import
    layoutFile = sanitizePath(data.postType.slug);
    
    // The content will be processed by the <ThemeContent /> component in the theme
  } else if (context === 'search') {
    layoutFile = 'search';
    // Sanitize the search query to avoid XSS in case the theme renders it directly
    if (safeData.query) {
      safeData.query = sanitizeHtml(safeData.query);
    }
  } else if (context === 'archive') {
    layoutFile = 'archive';
  } else if (context === '404') {
    layoutFile = '404';
  }

  // 3. Load compiled layout using native require (custom server mode)
  const themesPath = path.join(process.cwd(), 'themes');
  let Layout;

  try {
    // First try compiled directory (themes compiled at upload time)
    const compiledPath = path.join(themesPath, themeName, 'compiled', 'layouts', layoutFile + '.js');
    Layout = loadThemeModule(compiledPath).default;
  } catch {
    try {
      // Fallback to compiled post layout
      const fallbackPath = path.join(themesPath, themeName, 'compiled', 'layouts', 'post.js');
      Layout = loadThemeModule(fallbackPath).default;
    } catch {
      // Last resort: try raw layouts directory (for development/default theme)
      const rawPath = path.join(themesPath, themeName, 'layouts', layoutFile + '.tsx');
      Layout = loadThemeModule(rawPath).default;
    }
  }

  // 4. Fetch custom variables to inject as CSS Variables
  const themeData = await ThemeDataService.listAll(themeName);
  const cssVariables = themeData
    .map(item => `--${item.key}: ${item.value};`)
    .join('\n');

  return (
    <div className="blacklotuscms-theme min-h-screen">
      {/* 
        Dynamic Injection of Theme CSS and Custom Variables.
      */}
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
