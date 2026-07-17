'use client';

import React, { useActionState } from 'react';
import { TaxonomyService } from '@/core/services/TaxonomyService';
import { createTermAction, deleteTermAction } from './actions';
import { Plus, Trash2, Tag, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';

function TermForm({ taxonomyId }: { taxonomyId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      const data = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        taxonomyId: taxonomyId,
      };
      const result = await createTermAction(data);
      if (result && 'error' in result) {
        toast.error(result.error);
        return result;
      }
      toast.success('Termo criado com sucesso');
      return null;
    },
    null
  );

  return (
    <form action={formAction} className="content-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Plus size={16} className="text-action" />
        <h3 className="font-semibold text-sm text-text-heading">Novo Termo</h3>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Nome</label>
          <input required name="name" placeholder="Ex: Tecnologia" className="field-input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Slug</label>
          <input required name="slug" placeholder="ex: tecnologia" className="field-input" />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-action w-full">
        {isPending ? 'Adicionando...' : 'Adicionar'}
      </button>
    </form>
  );
}

export default async function TermManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taxonomy = await TaxonomyService.getById(id);

  if (!taxonomy) {
    notFound();
  }
  const terms = taxonomy.terms ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/taxonomy-types" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">{taxonomy.label}</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar termos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TermForm taxonomyId={id} />
        </div>

        <div className="lg:col-span-2">
          <div className="content-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Termo</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted"><Tag size={14} /></div>
                        <div>
                          <div className="font-medium text-text-heading text-sm">{term.name}</div>
                          <div className="text-xs text-text-muted font-mono">/{term.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <form action={async () => { 'use server'; await deleteTermAction(term.id, id); }}>
                        <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors"><Trash2 size={16} /></button>
                      </form>
                    </td>
                  </tr>
                ))}
                {terms.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-10 text-center text-sm text-text-muted">Nenhum termo adicionado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
