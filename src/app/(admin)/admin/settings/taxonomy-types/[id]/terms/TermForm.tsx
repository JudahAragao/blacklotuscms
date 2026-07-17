'use client';

import React, { useActionState } from 'react';
import { createTermAction } from './actions';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TermForm({ taxonomyId }: { taxonomyId: string }) {
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
