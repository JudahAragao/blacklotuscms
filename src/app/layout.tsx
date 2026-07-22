import React from 'react';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { SettingService } from '@/core/services/SettingService';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
  try {
    const settings = await SettingService.getAll();
    gaId = settings.seo?.google_analytics_id || '';
  } catch {}

  return (
    <html lang="pt-BR" className={`${roboto.variable}`} suppressHydrationWarning>
      <body className="antialiased selection:bg-primary selection:text-on-primary font-sans" suppressHydrationWarning>
        {gaId && <GoogleAnalytics id={gaId} />}
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
