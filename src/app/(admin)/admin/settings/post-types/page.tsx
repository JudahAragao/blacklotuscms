import React from 'react';
import { PostTypeService } from '@/core/services/PostTypeService';
import { createPostTypeAction, deletePostTypeAction } from './actions';
import { Box, Plus, Trash2, Layers, Settings2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PostTypesPage() {
  const postTypes = await PostTypeService.listAll();

  async function handleCreate(formData: FormData) {
    'use server';
    const data = {
      label: formData.get('label') as string,
      slug: formData.get('slug') as string,
      hierarchical: formData.get('hierarchical'),
      supportsTitle: formData.get('supportsTitle') === 'on',
      supportsEditor: formData.get('supportsEditor') === 'on',
      supportsPermalink: formData.get('supportsPermalink') === 'on',
      supportsTaxonomies: formData.get('supportsTaxonomies') === 'on',
    };
    await createPostTypeAction(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="p-2 content-card text-text-muted hover:text-action transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Tipos de Conteudo</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar estruturas de dados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form action={handleCreate} className="content-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Plus size={16} className="text-action" />
              <h3 className="font-semibold text-sm text-text-heading">Novo Tipo</h3>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Nome Exibido</label>
                <input required name="label" placeholder="Ex: Produtos" className="field-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Slug</label>
                <input required name="slug" placeholder="ex: produtos" className="field-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Estrutura</label>
                <select name="hierarchical" className="field-select">
                  <option value="false">Linear (como Posts)</option>
                  <option value="true">Hierarquica (como Paginas)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <label className="label-field-muted block mb-1">Suporte</label>
                {[
                  { name: 'supportsTitle', label: 'Titulo' },
                  { name: 'supportsEditor', label: 'Editor de Conteudo' },
                  { name: 'supportsPermalink', label: 'Permalink' },
                  { name: 'supportsTaxonomies', label: 'Taxonomias' },
                ].map((item) => (
                  <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={item.name} defaultChecked className="check-field" />
                    <span className="text-sm text-text-body">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-action w-full mt-2">
              Criar Tipo
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="content-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Conteudos</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {postTypes.map((pt) => (
                  <tr key={pt.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted">
                          <Layers size={14} />
                        </div>
                        <div>
                          <div className="font-medium text-text-heading text-sm">{pt.label}</div>
                          <div className="text-xs text-text-muted font-mono">/{pt.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted text-sm">
                      {(pt as any)._count?.posts || 0}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Link
                          href={`/admin/settings/post-types/${pt.id}/fields`}
                          className="p-1.5 text-text-muted hover:text-action transition-colors"
                          title="Gerenciar"
                        >
                          <Settings2 size={16} />
                        </Link>

                        {pt.slug !== 'post' && pt.slug !== 'page' && (
                          <form action={async () => {
                            'use server';
                            await deletePostTypeAction(pt.slug);
                          }}>
                            <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
