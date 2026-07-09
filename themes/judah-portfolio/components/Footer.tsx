import React from 'react';
import { HookService } from '@/core/services/HookService';

export default async function Footer() {
  return (
    <>
      <footer className="mt-24 border-t border-white/[0.05]">
        <div className="vj-container flex flex-col items-center justify-between gap-4 py-8 text-sm text-[var(--color-muted-foreground)] md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 64 48" className="h-6 w-8 text-[var(--vj-gold)]" fill="none" aria-hidden>
              <path d="M20 6 l1 2 l2 .3 l-1.5 1.3 l.4 2 l-1.9-1 l-1.9 1 l.4-2 l-1.5-1.3 l2-.3z" fill="currentColor" opacity=".7" />
              <path d="M32 2 l1.1 2.2 l2.4.35 l-1.75 1.5 l.45 2.35 l-2.2-1.15 l-2.2 1.15 l.45-2.35 l-1.75-1.5 l2.4-.35z" fill="currentColor" />
              <path d="M44 6 l1 2 l2 .3 l-1.5 1.3 l.4 2 l-1.9-1 l-1.9 1 l.4-2 l-1.5-1.3 l2-.3z" fill="currentColor" opacity=".7" />
              <path d="M4 44 L24 14 L44 44 Z" stroke="#4B5A3A" strokeWidth="2" strokeLinejoin="round" />
              <path d="M22 44 L40 18 L60 44 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span className="font-[var(--font-display)] text-sm font-semibold tracking-tight text-[var(--vj-bone)]">
              judah<span className="text-[var(--vj-gold)]">.</span>aragao
            </span>
          </div>

          <p>&copy; {new Date().getFullYear()} Judah de Aragão. Construído com atenção.</p>
        </div>
      </footer>

      {await HookService.applyFilters('theme_after_footer', null)}
    </>
  );
}
