import React from 'react';
import { prisma } from '@/lib/prisma';
import { PluginDataService } from '@/core/services/PluginDataService';
import { approvePermissionAction, denyPermissionAction, activatePluginAction, deactivatePluginAction, activateCompiledPluginAction, deactivateCompiledPluginAction } from './actions';
import { Shield, Database, Check, X, Package, Plug } from 'lucide-react';
import PluginImportButton from '@/components/admin/PluginImportButton';

async function getCompiledPlugins(): Promise<{ name: string; manifest: any; isActive: boolean; hasDbRecord: boolean }[]> {
  try {
    const { pluginRegistry, compiledPluginNames } = await import('@/generated/plugin-registry');
    const dbPlugins = await prisma.plugin.findMany();
    const dbMap = new Map(dbPlugins.map(p => [p.name, p]));

    return compiledPluginNames.map(name => {
      const entry = pluginRegistry[name];
      const dbPlugin = dbMap.get(name);
      return {
        name,
        manifest: entry.manifest,
        isActive: dbPlugin?.isActive || false,
        hasDbRecord: !!dbPlugin,
      };
    });
  } catch {
    return [];
  }
}

export default async function PluginsPage() {
  const plugins = await prisma.plugin.findMany({
    orderBy: { name: 'asc' }
  }).catch(() => []);
  const pendingPermissions = await PluginDataService.getPendingPermissions().catch(() => []);
  const compiledPlugins = await getCompiledPlugins();

  // Separate imported plugins (not in compiled registry)
  const compiledNames = new Set(compiledPlugins.map(p => p.name));
  const importedPlugins = plugins.filter(p => !compiledNames.has(p.name));

  async function approvePermissionForm(permissionId: string) {
    'use server';
    await approvePermissionAction(permissionId);
  }

  async function denyPermissionForm(permissionId: string) {
    'use server';
    await denyPermissionAction(permissionId);
  }

  async function activatePluginForm(pluginId: string) {
    'use server';
    await activatePluginAction(pluginId);
  }

  async function deactivatePluginForm(pluginId: string) {
    'use server';
    await deactivatePluginAction(pluginId);
  }

  async function activateCompiledForm(pluginName: string) {
    'use server';
    await activateCompiledPluginAction(pluginName);
  }

  async function deactivateCompiledForm(pluginName: string) {
    'use server';
    await deactivateCompiledPluginAction(pluginName);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Plugins</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar extensoes do sistema</p>
        </div>
        <PluginImportButton />
      </div>

      {pendingPermissions.length > 0 && (
        <div className="content-card border-l-4 border-status-draft overflow-hidden">
          <div className="p-4 flex items-center gap-3 bg-status-draft/5 border-b border-border-default">
            <Shield size={18} className="text-status-draft" />
            <h3 className="font-semibold text-sm text-text-heading">Solicitacoes de Acesso</h3>
          </div>
          <div className="divide-y divide-border-default">
            {pendingPermissions.map((perm) => (
              <div key={perm.id} className="px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-text-body">
                  Plugin <span className="font-semibold text-text-heading">"{perm.requesterPlugin}"</span> solicita <span className="italic">"{perm.capability}"</span> em <span className="font-semibold">"{perm.providerPlugin}"</span>
                </p>
                <div className="flex gap-2">
                  <form action={approvePermissionForm.bind(null, perm.id)}>
                    <button className="text-status-published hover:text-status-published/80 transition-colors p-1" title="Aprovar"><Check size={18} /></button>
                  </form>
                  <form action={denyPermissionForm.bind(null, perm.id)}>
                    <button className="text-status-trash hover:text-status-trash/80 transition-colors p-1" title="Negar"><X size={18} /></button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compiled Plugins Section */}
      {compiledPlugins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plug size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">Compiled Plugins</h2>
            <span className="text-[10px] text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">built-in</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compiledPlugins.map((plugin) => (
              <div key={plugin.name} className="content-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-text-heading">{plugin.manifest.name || plugin.name}</h3>
                    <span className="text-[10px] border border-border-default text-text-muted px-1.5 py-0.5 rounded font-mono">
                      v{plugin.manifest.version}
                    </span>
                  </div>
                  <p className="text-xs text-text-body leading-relaxed line-clamp-2">
                    {plugin.manifest.description || "Plugin compilado junto com o CMS."}
                  </p>
                  {plugin.manifest.permissions && plugin.manifest.permissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {plugin.manifest.permissions.slice(0, 3).map((perm: string) => (
                        <span key={perm} className="text-[9px] bg-surface-secondary text-text-muted px-1.5 py-0.5 rounded font-mono">
                          {perm}
                        </span>
                      ))}
                      {plugin.manifest.permissions.length > 3 && (
                        <span className="text-[9px] text-text-muted">+{plugin.manifest.permissions.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between">
                  <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                    plugin.isActive ? 'text-status-published' : 'text-text-muted'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${plugin.isActive ? 'bg-status-published' : 'bg-text-muted'}`} />
                    {plugin.isActive ? 'Ativo' : 'Inativo'}
                  </span>

                  {plugin.isActive ? (
                    <form action={deactivateCompiledForm.bind(null, plugin.name)}>
                      <button className="text-xs text-status-trash font-medium hover:underline transition-all">Desativar</button>
                    </form>
                  ) : (
                    <form action={activateCompiledForm.bind(null, plugin.name)}>
                      <button className="text-xs text-action font-medium hover:underline transition-all">Ativar</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imported Plugins Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package size={16} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-heading uppercase tracking-wider">Imported Plugins</h2>
          <span className="text-[10px] text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">ZIP upload</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importedPlugins.length === 0 ? (
            <div className="col-span-full py-12 content-card text-center">
              <Database className="mx-auto text-text-muted mb-3" size={36} />
              <p className="text-sm text-text-muted">Nenhum plugin importado.</p>
              <p className="text-xs text-text-muted mt-1">Use "IMPORT EXTENSION" para adicionar plugins via ZIP.</p>
            </div>
          ) : (
            importedPlugins.map((plugin) => (
              <div key={plugin.id} className="content-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-text-heading">{plugin.name}</h3>
                    <span className="text-[10px] border border-border-default text-text-muted px-1.5 py-0.5 rounded font-mono">
                      v{plugin.version}
                    </span>
                  </div>
                  <p className="text-xs text-text-body leading-relaxed line-clamp-2">
                    {(plugin.manifest as any).description || "Sem descricao."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between">
                  <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                    plugin.isActive ? 'text-status-published' : 'text-text-muted'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${plugin.isActive ? 'bg-status-published' : 'bg-text-muted'}`} />
                    {plugin.isActive ? 'Ativo' : 'Inativo'}
                  </span>

                  {plugin.isActive ? (
                    <form action={deactivatePluginForm.bind(null, plugin.id)}>
                      <button className="text-xs text-status-trash font-medium hover:underline transition-all">Desativar</button>
                    </form>
                  ) : (
                    <form action={activatePluginForm.bind(null, plugin.id)}>
                      <button className="text-xs text-action font-medium hover:underline transition-all">Ativar</button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
