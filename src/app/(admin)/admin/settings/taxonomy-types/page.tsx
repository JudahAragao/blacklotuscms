import React from 'react';
import { TaxonomyService } from '@/core/services/TaxonomyService';
import { PostTypeService } from '@/core/services/PostTypeService';
import { createTaxonomyAction, deleteTaxonomyAction } from './actions';
import { Plus, Trash2, Tags, Settings2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TaxonomyTypesPage() {
  const taxonomies = await TaxonomyService.listAll();
  const postTypes = await PostTypeService.listAll();

  async function handleCreate(formData: FormData) {
    'use server';
    const data = {
      label: formData.get('label') as string,
      slug: formData.get('slug') as string,
      postTypeId: formData.get('postTypeId') as string,
    };
    await createTaxonomyAction(data);
  }

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
          <form action={handleCreate} className="content-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Plus size={16} className="text-action" />
              <h3 className="font-semibold text-sm text-text-heading">Nova Taxonomia</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Nome Exibido</label>
                <input required name="label" placeholder="Ex: Categorias" className="field-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Slug</label>
                <input required name="slug" placeholder="ex: category" className="field-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Associar ao Tipo</label>
                <select name="postTypeId" className="field-select" required>
                  <option value="">Selecione...</option>
                  {postTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-action w-full mt-2">Criar Taxonomia</button>
          </form>
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
                        <Link href={`/admin/settings/taxonomy-types/${tx.id}/terms`} className="p-1.5 text-text-muted hover:text-action transition-colors" title="Gerenciar Termos">
                          <Settings2 size={16} />
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
