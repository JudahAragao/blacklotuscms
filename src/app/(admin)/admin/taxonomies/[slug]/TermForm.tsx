'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createTermAction } from './actions';

interface TermFormProps {
  taxonomyId: string;
}

export default function TermForm({ taxonomyId }: TermFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nome e obrigatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTermAction(taxonomyId, { name: name.trim(), slug: slug.trim() || generateSlug(name) });
      if (result && 'error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Termo criado com sucesso');
        setName('');
        setSlug('');
      }
    } catch (error) {
      toast.error('Erro ao criar termo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Plus size={16} className="text-action" />
        <h3 className="font-semibold text-sm text-text-heading">Novo Termo</h3>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Nome</label>
          <input 
            required 
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Tecnologia" 
            className="field-input" 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Slug</label>
          <input 
            required 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex: tecnologia" 
            className="field-input font-mono text-sm" 
          />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-action w-full mt-2">
        {isSubmitting ? 'Criando...' : 'Adicionar Termo'}
      </button>
    </form>
  );
}
