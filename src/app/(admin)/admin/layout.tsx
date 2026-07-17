import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserControl from '@/components/admin/UserControl';
import BlackLotusCMSSlot from '@/components/admin/BlackLotusCMSSlot';
import PluginSidebarNav from '@/components/admin/PluginSidebarNav';
import SidebarDropdownItem from '@/components/admin/SidebarDropdownItem';
import { renderPostTypeIcon } from '@/lib/icon-utils';
import { hasCapability } from '@/lib/auth-utils';
import {
  LayoutDashboard, FileText, Image, Menu, MessageSquare,
  Palette, Puzzle, Search, Settings, ExternalLink
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  media: <Image size={16} />,
  menus: <Menu size={16} />,
  comments: <MessageSquare size={16} />,
  themes: <Palette size={16} />,
  plugins: <Puzzle size={16} />,
  seo: <Search size={16} />,
  settings: <Settings size={16} />,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const postTypes = await prisma.postType.findMany({
    orderBy: { label: 'asc' },
    include: {
      taxonomies: {
        select: { id: true, label: true, slug: true }
      }
    }
  });

  const dbUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { role: true }
  });

  const userRole = dbUser?.role || { id: '', name: 'Guest', capabilities: {} };
  const user = {
    id: dbUser?.id || '',
    email: dbUser?.email || '',
    roleName: dbUser?.role?.name || 'User',
    image: dbUser?.image || null,
  };

  const canSeeMedia = hasCapability(userRole, 'media.read') || hasCapability(userRole, 'media.manage');
  const canSeeMenus = hasCapability(userRole, 'theme.manage') || hasCapability(userRole, 'setting.manage');
  const canSeeComments = hasCapability(userRole, 'comment.read') || hasCapability(userRole, 'comment.manage');
  const canSeeThemes = hasCapability(userRole, 'theme.manage');
  const canSeePlugins = hasCapability(userRole, 'plugin.manage');
  const canSeeSettings = hasCapability(userRole, 'setting.manage');

  const systemItems = [
    { href: '/admin/media', label: 'Media', icon: 'media', visible: canSeeMedia },
    { href: '/admin/menus', label: 'Menus', icon: 'menus', visible: canSeeMenus },
    { href: '/admin/comments', label: 'Comentarios', icon: 'comments', visible: canSeeComments },
    { href: '/admin/themes', label: 'Aparencia', icon: 'themes', visible: canSeeThemes },
    { href: '/admin/plugins', label: 'Plugins', icon: 'plugins', visible: canSeePlugins },
    { href: '/admin/seo', label: 'SEO', icon: 'seo', visible: canSeeSettings },
  ].filter(item => item.visible);

  const settingsItems = [
    { label: 'Chave API', href: '/admin/settings/keys' },
    { label: 'Tipos de Posts', href: '/admin/settings/post-types' },
    { label: 'Campos Customizados', href: '/admin/settings/field-groups' },
    { label: 'Usuarios e Roles', href: '/admin/settings/users' },
    { label: 'Taxonomias', href: '/admin/settings/taxonomy-types' },
    { label: 'Leitura', href: '/admin/settings/reading' },
  ];

  return (
    <div className="bl-admin h-screen flex flex-col overflow-hidden">
      {/* Top Admin Bar */}
      <header className="h-10 bg-[#1d2327] border-b border-[#2c3338] flex items-center justify-between px-4 flex-shrink-0 z-50">
        <div className="flex items-center gap-4">
          <label htmlFor="sidebar-toggle" className="md:hidden text-[#a7aaad] hover:text-white cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </label>
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/assets/brand/logo.png" alt="BlackLotusCMS" className="w-5 h-5 object-contain" />
            <span className="text-white text-sm font-semibold tracking-tight">BlackLotusCMS</span>
          </Link>
          <span className="text-[#a7aaad] text-xs hidden sm:inline">|</span>
          <Link href="/" target="_blank" className="text-[#a7aaad] hover:text-white text-xs items-center gap-1 transition-colors hidden sm:flex">
            Ver Site <ExternalLink size={10} />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#a7aaad] text-xs hidden sm:inline">{user.email}</span>
          <div className="w-6 h-6 rounded-full bg-[#2c3338] flex items-center justify-center overflow-hidden border border-[#3c434a]">
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-[#a7aaad] font-bold">{user.email.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
        <aside className="w-60 bg-[#1d2327] border-r border-[#2c3338] flex flex-col h-full flex-shrink-0
          max-md:fixed max-md:top-10 max-md:left-0 max-md:bottom-0 max-md:z-40 max-md:-translate-x-full max-md:peer-checked:translate-x-0 max-md:transition-transform max-md:duration-200">
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-0.5">
            <BlackLotusCMSSlot name="admin.sidebar.top" />

            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#d0cfc8] hover:bg-[#2c3338] hover:text-white transition-colors"
            >
              {iconMap.dashboard}
              <span>Dashboard</span>
            </Link>

            <div className="pt-4 pb-1.5 px-3">
              <span className="text-[11px] font-semibold text-[#8c8f94] uppercase tracking-wider">Conteudo</span>
            </div>

            {postTypes.filter(pt => hasCapability(userRole, `${pt.slug}.read`) || hasCapability(userRole, `${pt.slug}.manage`)).map((pt) => (
              <SidebarDropdownItem
                key={pt.id}
                href={`/admin/posts?type=${pt.slug}`}
                label={pt.label}
                icon={renderPostTypeIcon(pt.settings)}
                items={pt.taxonomies.map((t: any) => ({
                  label: t.label,
                  href: `/admin/posts?type=${pt.slug}&taxonomy=${t.slug}`,
                }))}
              />
            ))}

            {systemItems.length > 0 && (
              <>
                <div className="pt-4 pb-1.5 px-3">
                  <span className="text-[11px] font-semibold text-[#8c8f94] uppercase tracking-wider">Sistema</span>
                </div>

                {systemItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#d0cfc8] hover:bg-[#2c3338] hover:text-white transition-colors"
                  >
                    {iconMap[item.icon]}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}

            {canSeeSettings && (
              <SidebarDropdownItem
                href="/admin/settings"
                label="Configuracoes"
                icon={<Settings size={16} />}
                items={settingsItems}
              />
            )}

            <BlackLotusCMSSlot name="admin.sidebar.menu_after" />

            <PluginSidebarNav />
          </nav>

          <BlackLotusCMSSlot name="admin.sidebar.bottom" />
          <UserControl user={user} />
        </aside>
        {/* Overlay for mobile sidebar */}
        <label htmlFor="sidebar-toggle" className="max-md:fixed max-md:inset-0 max-md:bg-black/50 max-md:z-30 max-md:peer-checked:block max-md:hidden" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto admin-content custom-scrollbar h-full">
          <div className="w-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
