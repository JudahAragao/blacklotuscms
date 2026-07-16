import React from 'react';
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import ThemeRenderer from '@/components/ThemeRenderer';
import { SearchService } from '@/core/services/SearchService';
import { PostService } from '@/core/services/PostService';
import { themeStorage } from '@/lib/theme-context';
import { ThemeService } from '@/core/services/ThemeService';
import { HookService } from '@/core/services/HookService';
import { resolveMetaUrls } from '@/lib/field-utils';
import { themeRegistry } from '@/generated/theme-registry';

interface PublicPageProps {
  params: { slug?: string[] };
  searchParams: { q?: string; preview_theme?: string };
}

import { SecretsService } from '@/lib/secrets';

import { SettingService } from '@/core/services/SettingService';

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export async function generateMetadata({ params, searchParams }: PublicPageProps) {
  try {
    const { slug } = await params;
    const { preview_theme } = await searchParams;
    
    const safeSlug = slug ?? [];
    const fullPath = safeSlug.join('/');

    // 0. Hook: route_access (Allows plugins to control SEO)
    const accessCheck = await HookService.applyFilters('route_access', {
      slug: safeSlug,
      fullPath,
      allowed: true,
      redirectUrl: null,
      override: null,
      seo: null // Plugins can inject { title, description } here
    });

    if (accessCheck.seo) {
      return {
        title: accessCheck.seo.title,
        description: accessCheck.seo.description,
      };
    }

    // 1. Fetch Global SEO and Reading Settings
    const settings = await SettingService.getAll();
    const seoSettings = settings.seo || {};
    const readingSettings = settings.reading || { show_on_front: 'posts' };
    
    let safePreviewTheme = preview_theme;
    if (preview_theme === 'Lotus Default') {
      safePreviewTheme = 'default';
    }
    const themeName = safePreviewTheme || await ThemeService.getActiveTheme();
    const manifest = await ThemeService.getThemeManifest(themeName);

    // 2. Identify target post or context based on Reading Settings
    let post = null;
    const isHome = safeSlug.length === 0;

    if (isHome && readingSettings.show_on_front === 'page' && readingSettings.page_on_front) {
      post = await PostService.getLeanPostById(readingSettings.page_on_front);
    } else if (!isHome) {
      const lastSlug = safeSlug[safeSlug.length - 1];
      post = await PostService.getLeanPostBySlug(lastSlug);
    }

    // 3. Title Logic
    const siteName = seoSettings.site_name || 'BlackLotusCMS';
    const separator = seoSettings.title_separator || '|';
    const pageTitle = post?.seoTitle || post?.title || (isHome ? 'Home' : safeSlug[safeSlug.length - 1]);
    const finalTitle = `${pageTitle} ${separator} ${siteName}`;

    const description = post?.seoDescription || seoSettings.meta_description || '';
    const ogImage = post?.ogImage || seoSettings.og_image || '';

    return {
      title: finalTitle,
      description: description,
      metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
      alternates: {
        canonical: '/',
      },
      openGraph: {
        title: finalTitle,
        description: description,
        images: ogImage ? [ogImage] : [],
        type: 'website',
      },
      verification: {
        google: seoSettings.google_site_verification,
      },
      icons: {
        icon: manifest?.favicon 
          ? `/api/themes/${themeName}/assets/${manifest.favicon}`
          : '/favicon.ico',
      },
    };
  } catch (error) {
    // If it's a security error, we return minimal metadata to allow the Page component 
    // to render and show the actual Security Lock UI.
    return {
      title: 'Security Lock | BlackLotusCMS',
    };
  }
}

export default async function PublicPage({ params, searchParams }: PublicPageProps) {
  // Security check: Do not attempt to render if not installed
  const isInstalled = await SecretsService.isInstalled();
  if (!isInstalled) return null;

  const { slug } = await params
  const { preview_theme, q } = await searchParams

  const safeSlug = slug ?? []
  const fullPath = safeSlug.join('/')

  // 0. Hook: route_access (Allows plugins to control access or provide custom content)
  const accessCheck = await HookService.applyFilters('route_access', {
    slug: safeSlug,
    fullPath,
    allowed: true,
    redirectUrl: null,
    override: null
  });

  if (!accessCheck.allowed) {
    if (accessCheck.redirectUrl) {
      redirect(accessCheck.redirectUrl);
    }
    return notFound();
  }

  // If the plugin provided an override, we render its context directly
  if (accessCheck.override) {
    const themeName = preview_theme === 'Lotus Default' ? 'default' : (preview_theme || await ThemeService.getActiveTheme());
    return (
      <ThemeRenderer 
        context={accessCheck.override.context} 
        data={accessCheck.override.data} 
        previewTheme={preview_theme} 
      />
    );
  }

  // If preview_theme is the display name of the default theme, force it to 'default'
  let safePreviewTheme = preview_theme;
  if (preview_theme === 'Lotus Default') {
    safePreviewTheme = 'default';
  }

  // If there is no preview, we use the active theme
  const themeName = safePreviewTheme || await ThemeService.getActiveTheme();

  // Executes all search and rendering logic within the theme context
  // This ensures that ThemeDataService.validate knows who is requesting the data
  return await themeStorage.run({ themeName }, async () => {
    try {
      const settings = await SettingService.getAll();
      const readingSettings = settings.reading || { show_on_front: 'posts' };
      
      const safeSlug = slug ?? []
      const fullPath = safeSlug.join('/')
      const isHome = safeSlug.length === 0
      const lastSlug = isHome ? '' : safeSlug[safeSlug.length - 1]

      // 1. Special Case: Global Search
      if (fullPath === 'search') {
        const results = q ? await SearchService.globalSearch(q) : [];
        return <ThemeRenderer context="search" data={{ results, query: q || '' }} previewTheme={safePreviewTheme} />;
      }

      // 2. Dynamic layout resolution: if slug matches a theme layout, use it directly
      const SYSTEM_LAYOUTS = new Set(['post', 'page', 'archive', 'category', 'search', 'notFound']);
      const activeThemeLayouts = themeRegistry[themeName] || themeRegistry.default;
      if (fullPath && !SYSTEM_LAYOUTS.has(fullPath) && activeThemeLayouts[fullPath]) {
        return <ThemeRenderer context={fullPath} data={{}} previewTheme={safePreviewTheme} />;
      }

      // 2. Identify if this is the designated "Posts Page"
      if (readingSettings.show_on_front === 'page' && readingSettings.page_for_posts) {
        const postsPage = await PostService.getLeanPostById(readingSettings.page_for_posts);
        if (postsPage && postsPage.slug === fullPath) {
          const results = await PostService.getLeanPostsByType('post', 10);
          return <ThemeRenderer context="archive" data={{ term: { name: postsPage.title, slug: postsPage.slug, taxonomy: { label: 'Page' } }, results }} previewTheme={safePreviewTheme} />;
        }
      }

      // 3. Front Page Logic
      if (isHome) {
        if (readingSettings.show_on_front === 'page' && readingSettings.page_on_front) {
          const homePost = await PostService.getLeanPostById(readingSettings.page_on_front);
          if (homePost) {
            const resolvedHome = homePost.meta ? { ...homePost, meta: resolveMetaUrls(homePost.meta, await getBaseUrl()) } : homePost;
            return <ThemeRenderer context="single" data={resolvedHome} previewTheme={safePreviewTheme} />;
          }
        }
        
        // Default Home: Show latest posts
        const results = await PostService.getLeanPostsByType('post', 10);
        return <ThemeRenderer context="archive" data={{ term: { name: 'Home', slug: 'home', taxonomy: { label: 'Page' } }, results }} previewTheme={safePreviewTheme} />;
      }

      // 4. Try to fetch as a Single Post (Using Lean Service)
      const post = await PostService.getLeanPostBySlug(lastSlug);

      if (post && post.status === 'published') {
        const resolvedPost = post.meta ? { ...post, meta: resolveMetaUrls(post.meta, await getBaseUrl()) } : post;
        return <ThemeRenderer context="single" data={resolvedPost} previewTheme={safePreviewTheme} />;
      }

      // 5. Try to fetch as a Taxonomy Archive (Using Lean Service)
      const archiveData = await PostService.getLeanPostsByTerm(lastSlug);

      if (archiveData) {
        return <ThemeRenderer context="archive" data={archiveData} previewTheme={safePreviewTheme} />;
      }

      notFound();
    } catch (error: any) {
      if (error.message && error.message.includes('[Segurança de Tema]')) {
        return (
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-mono text-on-surface-variant">
            <div className="max-w-2xl w-full border border-error/20 bg-error/5 p-12 rounded-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error/80 to-error/20"></div>
              <h1 className="text-3xl text-error mb-4">SECURITY LOCK</h1>
              <p className="text-lg text-on-surface-variant/80 mb-8 leading-relaxed">
                The current theme <span className="text-primary">{themeName}</span> is attempting to perform an action it does not have permission for.
                <br /><br />
                <span className="text-error/80 text-sm">{error.message}</span>
              </p>
              <div className="border-t border-outline-variant/10 pt-8 mt-4">
                <p className="text-sm text-on-surface-variant/60 mb-6">
                  To restore functionality, please return to the administrative panel and grant the necessary permissions.
                </p>
                <a href="/admin/themes" className="inline-block bg-primary text-on-primary px-8 py-3 text-sm tracking-widest font-bold uppercase hover:bg-primary/90 transition-colors shadow-lg">
                  Access Theme Panel
                </a>
              </div>
            </div>
          </div>
        );
      }
      // Re-throw if it's not a security error
      throw error;
    }
  });
}
