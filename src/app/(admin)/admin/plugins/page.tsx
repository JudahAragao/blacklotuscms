import React from 'react';
import { prisma } from '@/lib/prisma';
import { PluginDataService } from '@/core/services/PluginDataService';
import { approvePermissionAction, denyPermissionAction, activatePluginAction, deactivatePluginAction } from './actions';
import { Shield, Database, Check, X, Play, Square, Download } from 'lucide-react';
import PluginImportButton from '@/components/admin/PluginImportButton';

export default async function PluginsPage() {
  const plugins = await prisma.plugin.findMany({
    orderBy: { name: 'asc' }
  }).catch(() => []);
  const pendingPermissions = await PluginDataService.getPendingPermissions().catch(() => []);

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
                  <form action={approvePermissionAction.bind(null, perm.id)}>
                    <button className="text-status-published hover:text-status-published/80 transition-colors p-1" title="Aprovar"><Check size={18} /></button>
                  </form>
                  <form action={denyPermissionAction.bind(null, perm.id)}>
                    <button className="text-status-trash hover:text-status-trash/80 transition-colors p-1" title="Negar"><X size={18} /></button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.length === 0 ? (
          <div className="col-span-full py-16 content-card text-center">
            <Database className="mx-auto text-text-muted mb-3" size={36} />
            <p className="text-sm text-text-muted">Nenhum plugin encontrado.</p>
          </div>
        ) : (
          plugins.map((plugin) => (
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
                  <form action={deactivatePluginAction.bind(null, plugin.id)}>
                    <button className="text-xs text-status-trash font-medium hover:underline transition-all">Desativar</button>
                  </form>
                ) : (
                  <form action={activatePluginAction.bind(null, plugin.id)}>
                    <button className="text-xs text-action font-medium hover:underline transition-all">Ativar</button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
