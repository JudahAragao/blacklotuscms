import React from 'react';
import { ThemeService } from '@/core/services/ThemeService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { approveThemePermissionAction, denyThemePermissionAction, setActiveThemeAction, deleteThemeAction } from './actions';
import { Palette, Shield, Check, X, Layout, Code, History, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default async function ThemesPage() {
  const themes = await ThemeService.listThemes();
  const activeThemeName = await ThemeService.getActiveTheme();
  const pendingPermissions = await ThemeDataService.getPendingPermissions();
  const processedPermissions = await ThemeDataService.getProcessedPermissions();

  async function approveThemePermissionForm(permissionId: string) {
    'use server';
    await approveThemePermissionAction(permissionId);
  }

  async function denyThemePermissionForm(permissionId: string) {
    'use server';
    await denyThemePermissionAction(permissionId);
  }

  async function setActiveThemeForm(themeName: string) {
    'use server';
    await setActiveThemeAction(themeName);
  }

  async function deleteThemeForm(themeName: string) {
    'use server';
    await deleteThemeAction(themeName);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Aparencia</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar temas do site</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/themes/editor" className="btn-action-secondary flex items-center gap-2">
            <Code size={16} /> Lotus Studio
          </Link>
        </div>
      </div>

      {pendingPermissions.length > 0 && (
        <div className="content-card border-l-4 border-status-draft overflow-hidden">
          <div className="p-4 flex items-center gap-3 bg-status-draft/5 border-b border-border-default">
            <Shield size={18} className="text-status-draft" />
            <h3 className="font-semibold text-sm text-text-heading">Solicitacoes de Seguranca</h3>
          </div>
          <div className="divide-y divide-border-default">
            {pendingPermissions.map((perm) => (
              <div key={perm.id} className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-text-body">
                  O tema <span className="font-semibold text-text-heading">"{perm.requesterTheme}"</span> solicita acesso a <span className="font-mono text-text-heading bg-surface-muted px-1.5 py-0.5 rounded">{perm.capability}</span>
                </p>
                <div className="flex gap-2">
                  <form action={approveThemePermissionForm.bind(null, perm.id)}>
                    <button className="w-8 h-8 rounded bg-status-published/10 text-status-published hover:bg-status-published hover:text-white transition-all flex items-center justify-center" title="Aprovar"><Check size={16} /></button>
                  </form>
                  <form action={denyThemePermissionForm.bind(null, perm.id)}>
                    <button className="w-8 h-8 rounded bg-status-trash/10 text-status-trash hover:bg-status-trash hover:text-white transition-all flex items-center justify-center" title="Negar"><X size={16} /></button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {processedPermissions.length > 0 && (
        <div className="content-card overflow-hidden">
          <div className="p-4 border-b border-border-default flex items-center gap-2">
            <History size={16} className="text-text-muted" />
            <h3 className="font-semibold text-sm text-text-heading">Gerenciamento de Acessos</h3>
          </div>
          <div className="divide-y divide-border-default">
            {processedPermissions.map((perm) => (
              <div key={perm.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${perm.status === 'approved' ? 'bg-status-published' : 'bg-status-trash'}`}></div>
                  <p className="text-sm text-text-body">
                    <span className="font-semibold text-text-heading">{perm.requesterTheme}</span>
                    {' '}acesso a <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded">{perm.capability}</span>
                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-semibold ${perm.status === 'approved' ? 'bg-status-published/10 text-status-published' : 'bg-status-trash/10 text-status-trash'}`}>
                      {perm.status === 'approved' ? 'Aprovado' : 'Negado'}
                    </span>
                  </p>
                </div>
                {perm.status === 'approved' ? (
                  <form action={denyThemePermissionForm.bind(null, perm.id)}>
                    <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors" title="Revogar"><X size={16} /></button>
                  </form>
                ) : (
                  <form action={approveThemePermissionForm.bind(null, perm.id)}>
                    <button className="p-1.5 text-text-muted hover:text-action transition-colors" title="Aprovar"><Check size={16} /></button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const isActive = theme.name === activeThemeName;
          return (
            <div key={theme.name} className={`content-card flex flex-col overflow-hidden ${isActive ? 'ring-2 ring-status-published' : ''}`}>
              <div className="aspect-[16/10] bg-surface-muted flex items-center justify-center text-text-muted relative overflow-hidden">
                {theme.screenshot ? (
                  <img src={theme.screenshot} alt={theme.displayName} className="w-full h-full object-cover" />
                ) : (
                  <Palette size={48} strokeWidth={1} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {isActive && (
                  <div className="absolute top-3 right-3 bg-status-published text-white text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 shadow">
                    <Check size={12} /> Ativo
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <span className="text-xs text-text-muted">v{theme.version}</span>
                  <h3 className="font-semibold text-base text-text-heading mt-0.5">{theme.displayName}</h3>
                </div>

                <p className="text-sm text-text-body mb-4 line-clamp-2 flex-1">
                  {theme.description || "Um tema para o seu site."}
                </p>

                <div className="flex gap-2 mt-auto">
                  {!isActive && (
                    <form action={setActiveThemeForm.bind(null, theme.name)} className="flex-1">
                      <button className="w-full btn-action flex items-center justify-center gap-2">
                        <Layout size={16} /> Ativar
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/admin/themes/editor?theme=${theme.name}`}
                    className={`flex items-center justify-center gap-2 py-2 px-4 border rounded transition-all text-sm ${
                      isActive
                        ? 'flex-1 border-border-default text-text-body hover:bg-surface-muted'
                        : 'border-border-default text-text-muted hover:border-action hover:text-action'
                    }`}
                  >
                    <Code size={16} /> {isActive ? 'Customizar' : ''}
                  </Link>
                  {!isActive && theme.name !== 'default' && (
                    <form action={deleteThemeForm.bind(null, theme.name)}>
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 py-2 px-3 border border-border-default rounded text-sm text-text-muted hover:border-status-trash hover:text-status-trash hover:bg-status-trash/5 transition-all"
                        title="Excluir tema"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
