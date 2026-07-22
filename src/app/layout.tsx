import React from 'react';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { SettingService } from '@/core/services/SettingService';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import GoogleTagManager from '@/components/GoogleTagManager';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['300', '400', '500', '700', '900'],
});

export async function generateMetadata() {
  try {
    const settings = await SettingService.getAll();
    const seo = settings.seo || {};
    const siteName = seo.site_name || 'BlackLotusCMS';
    const description = seo.meta_description || '';

    return {
      title: {
        default: siteName,
        template: `%s ${seo.title_separator || '|'} ${siteName}`,
      },
      description,
    };
  } catch {
    return {
      title: {
        default: 'BlackLotusCMS',
        template: '%s | BlackLotusCMS',
      },
      description: '',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let gaId = '';
  let gtmId = '';
  let analyticsProvider = 'none';
  try {
    const settings = await SettingService.getAll();
    analyticsProvider = settings.seo?.analytics_provider || 'ga4';
    gaId = settings.seo?.google_analytics_id || '';
    gtmId = settings.seo?.google_tag_manager_id || '';
    if (!gaId && !gtmId) analyticsProvider = 'none';
  } catch {}

  return (
    <html lang="pt-BR" className={`${roboto.variable}`} suppressHydrationWarning>
      <body className="antialiased selection:bg-primary selection:text-on-primary font-sans" suppressHydrationWarning>
        {analyticsProvider === 'ga4' && gaId && <GoogleAnalytics id={gaId} />}
        {analyticsProvider === 'gtm' && gtmId && <GoogleTagManager id={gtmId} />}
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
