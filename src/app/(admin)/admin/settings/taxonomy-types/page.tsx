import React from 'react';
import { TaxonomyService } from '@/core/services/TaxonomyService';
import { PostTypeService } from '@/core/services/PostTypeService';
import { deleteTaxonomyAction } from './actions';
import TaxonomyForm from './TaxonomyForm';
import { Trash2, Tags, Settings2, ChevronLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function TaxonomyTypesPage() {
  const taxonomies = await TaxonomyService.listAll();
  const postTypes = await PostTypeService.listAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Taxonomias</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar categorias e tags</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TaxonomyForm postTypes={postTypes} />
        </div>

        <div className="lg:col-span-2">
          <div className="content-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Taxonomia</th>
                  <th>Associacao</th>
                  <th>Termos</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {taxonomies.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted"><Tags size={14} /></div>
                        <div>
                          <div className="font-medium text-text-heading text-sm">{tx.label}</div>
                          <div className="text-xs text-text-muted font-mono">/{tx.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-action font-medium">{tx.postType?.label ?? '-'}</td>
                    <td className="text-sm text-text-muted">{tx._count?.terms ?? 0}</td>
                    <td className="text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Link 
                          href={`/admin/taxonomies/${tx.slug}`} 
                          className="p-1.5 text-text-muted hover:text-action transition-colors" 
                          title="Gerenciar Termos"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <form action={async () => { 'use server'; await deleteTaxonomyAction(tx.id); }}>
                          <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors"><Trash2 size={16} /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {taxonomies.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-text-muted">Nenhuma taxonomia registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
