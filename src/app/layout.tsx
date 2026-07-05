import React from 'react';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['300', '400', '500', '700', '900'],
});

export const metadata = {
  title: 'BlackLotusCMS | Aura Noir',
  description: 'Exclusivity, prestige, and meticulous craftsmanship.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${roboto.variable}`} suppressHydrationWarning>
      <body className="antialiased selection:bg-primary selection:text-on-primary font-sans" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
