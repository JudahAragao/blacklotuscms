import React from 'react';
import { MenuService } from '@/core/services/MenuService';
import { SettingService } from '@/core/services/SettingService';
import { HookService } from '@/core/services/HookService';
import HeaderSearch from './HeaderSearch';

export default async function Header() {
  const menuItems = await MenuService.getMenuBySlug('header');
  const settings = await SettingService.getAll();
  const siteName = settings.seo?.site_name || 'Judah de Aragão';

  return (
    <>
      {await HookService.applyFilters('theme_before_header', null)}

      {/* Google Fonts — loaded here because nested @import in ThemeRenderer CSS is ignored by browsers */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#0F1110]/70 backdrop-blur-xl transition-all duration-300">
        <div className="vj-container flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="group flex items-center gap-2">
            {/* LogoMark — montanhas Velaris */}
            <svg viewBox="0 0 64 48" className="h-7 w-9 text-[var(--vj-gold)]" fill="none" aria-hidden>
              <path d="M20 6 l1 2 l2 .3 l-1.5 1.3 l.4 2 l-1.9-1 l-1.9 1 l.4-2 l-1.5-1.3 l2-.3z" fill="currentColor" opacity=".7" />
              <path d="M32 2 l1.1 2.2 l2.4.35 l-1.75 1.5 l.45 2.35 l-2.2-1.15 l-2.2 1.15 l.45-2.35 l-1.75-1.5 l2.4-.35z" fill="currentColor" />
              <path d="M44 6 l1 2 l2 .3 l-1.5 1.3 l.4 2 l-1.9-1 l-1.9 1 l.4-2 l-1.5-1.3 l2-.3z" fill="currentColor" opacity=".7" />
              <path d="M4 44 L24 14 L44 44 Z" stroke="#4B5A3A" strokeWidth="2" strokeLinejoin="round" />
              <path d="M22 44 L40 18 L60 44 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span className="font-[var(--font-display)] text-sm font-semibold tracking-tight text-[var(--vj-bone)]">
              judah<span className="text-[var(--vj-gold)]">.</span>aragao
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.id} className="relative group/item">
                  <a
                    href={item.url}
                    className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--vj-bone)]"
                  >
                    {item.label}
                  </a>
                  {item.children.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-white/[0.06] bg-[#151716] py-2 shadow-2xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible">
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={child.url}
                          className="block px-4 py-2 text-xs font-medium text-[var(--color-muted-foreground)] hover:bg-white/[0.04] hover:text-[var(--vj-gold)]"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <a href="/#sobre" className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--vj-bone)]">Sobre</a>
                <a href="/#projetos" className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--vj-bone)]">Projetos</a>
                <a href="/#habilidades" className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--vj-bone)]">Habilidades</a>
                <a href="/#blog" className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--vj-bone)]">Blog</a>
              </>
            )}

            <HeaderSearch />

            <a
              href="/admin"
              className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-white/[0.06] text-[var(--vj-gold)] transition-colors hover:border-[var(--vj-gold)]/60 hover:bg-[var(--vj-gold)]/10"
              aria-label="Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md border border-white/[0.06] px-3 py-1.5 text-sm text-[var(--vj-bone)]"
            aria-label="Menu"
          >
            Menu
          </button>
        </div>
      </header>

      {await HookService.applyFilters('theme_after_header', null)}
    </>
  );
}
