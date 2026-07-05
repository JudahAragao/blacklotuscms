import React from 'react';
import { prisma } from '@/lib/prisma';
import { FileText, Image, Puzzle, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const [totalPosts, totalMedia, activePlugins] = await Promise.all([
    prisma.post.count(),
    prisma.media.count(),
    prisma.plugin.count({ where: { isActive: true } }),
  ]).catch(() => [0, 0, 0]);

  const stats = [
    { label: 'Conteudos', value: totalPosts, icon: FileText, color: 'text-action' },
    { label: 'Midias', value: totalMedia, icon: Image, color: 'text-status-published' },
    { label: 'Plugins Ativos', value: activePlugins, icon: Puzzle, color: 'text-status-draft' },
    { label: 'Sistema', value: 'OK', icon: Activity, color: 'text-status-published' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-heading">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Visao geral do seu site</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="content-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted">{stat.label}</span>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-3xl font-semibold text-text-heading">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="content-card p-5">
          <h3 className="meta-box-header -mx-5 -mt-5 mb-4 rounded-t">Atividade Recente</h3>
          <p className="text-sm text-text-muted italic">Aguardando novas interacoes...</p>
        </div>

        <div className="content-card p-5">
          <h3 className="meta-box-header -mx-5 -mt-5 mb-4 rounded-t">Arquitetura do Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border-default">
              <span className="text-sm text-text-body">Motor</span>
              <span className="text-xs font-mono text-text-heading bg-surface-muted px-2 py-0.5 rounded">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border-default">
              <span className="text-sm text-text-body">Armazenamento</span>
              <span className="text-xs font-semibold text-status-published">Local</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-body">Seguranca</span>
              <span className="text-xs font-semibold text-status-published">Ativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
