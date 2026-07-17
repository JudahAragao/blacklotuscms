'use client';

import React, { useActionState } from 'react';
import { createTaxonomyAction } from './actions';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TaxonomyForm({ postTypes }: { postTypes: any[] }) {
  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      const data = {
        label: formData.get('label') as string,
        slug: formData.get('slug') as string,
        postTypeId: formData.get('postTypeId') as string,
      };
      const result = await createTaxonomyAction(data);
      if (result && 'error' in result) {
        toast.error(result.error);
        return result;
      }
      toast.success('Taxonomia criada com sucesso');
      return null;
    },
    null
  );

  return (
    <form action={formAction} className="content-card p-5 space-y-4">
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
            {postTypes.map((pt: any) => (
              <option key={pt.id} value={pt.id}>{pt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-action w-full mt-2">
        {isPending ? 'Criando...' : 'Criar Taxonomia'}
      </button>
    </form>
  );
}
