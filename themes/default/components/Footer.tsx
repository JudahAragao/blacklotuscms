import React from 'react';
import { HookService } from '@/core/services/HookService';

export default async function Footer() {
  return (
    <>
      <footer className="bg-slate-900 text-white pt-20 pb-10 mt-20">
        <div className="theme-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-slate-900 font-black">B</div>
                <span className="font-bold text-lg tracking-tight uppercase">BlackLotusCMS</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
                A modern CMS built for prestige and meticulous craftsmanship. 
                Experience total freedom in content management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="label-caps text-xs text-white mb-6">Explore</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="/" className="hover:text-primary">Início</a></li>
                <li><a href="/admin" className="hover:text-primary">Painel Admin</a></li>
                <li><a href="/sitemap.xml" className="hover:text-primary">Mapa do Site</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="label-caps text-xs text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-primary">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              &copy; {new Date().getFullYear()} BLACKLOTUS CMS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6 text-slate-500">
               {/* Hook para redes sociais de plugins */}
               {await HookService.applyFilters('theme_footer_social', null)}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Hook: Injeção final (Scripts de tracking, etc) */}
      {await HookService.applyFilters('theme_after_footer', null)}
    </>
  );
}
