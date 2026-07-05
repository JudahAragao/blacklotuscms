import React from 'react';
import { MenuService } from '@/core/services/MenuService';
import { HookService } from '@/core/services/HookService';
import HeaderSearch from './HeaderSearch';

import { SettingService } from '@/core/services/SettingService';

export default async function Header() {
  // Busca o menu 'header' dinamicamente
  const menuItems = await MenuService.getMenuBySlug('header');
  const settings = await SettingService.getAll();
  const siteName = settings.seo?.site_name || 'BlackLotusCMS';

  return (
    <>
      {/* Hook: Injeção antes do header (útil para banners de plugins) */}
      {await HookService.applyFilters('theme_before_header', null)}

      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="theme-container h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:bg-primary  shadow-lg">
              {siteName.charAt(0)}
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 uppercase">{siteName}</span>
          </a>

          {/* Navegação Dinâmica */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.id} className="relative group/item">
                  <a 
                    href={item.url} 
                    className="text-sm font-bold text-slate-500 hover:text-primary label-caps tracking-widest transition-colors py-2"
                  >
                    {item.label}
                  </a>
                  {/* Dropdown se houver filhos */}
                  {item.children.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-lg py-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible ">
                      {item.children.map(child => (
                        <a 
                          key={child.id} 
                          href={child.url}
                          className="block px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-primary"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Fallback se não houver menu cadastrado
              <a href="/" className="text-sm font-bold text-slate-500 hover:text-primary label-caps tracking-widest">Home</a>
            )}
            
            <HeaderSearch />
          </nav>

          {/* Botão de Ação (Exemplo) */}
          <div className="flex items-center gap-4">
             <a href="/admin" className="theme-btn theme-btn-primary !py-2 !px-4 !text-[10px]">
                Admin Panel
             </a>
          </div>
        </div>
      </header>

      {/* Hook: Injeção após o header */}
      {await HookService.applyFilters('theme_after_header', null)}
    </>
  );
}
