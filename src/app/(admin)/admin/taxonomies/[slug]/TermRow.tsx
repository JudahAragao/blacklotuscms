'use client';

import React, { useState } from 'react';
import { Trash2, Tag, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateTermAction, deleteTermAction } from './actions';

interface TermRowProps {
  term: {
    id: string;
    name: string;
    slug: string;
    _count?: { posts: number };
  };
  taxonomyId: string;
}

export default function TermRow({ term, taxonomyId }: TermRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(term.name);
  const [editSlug, setEditSlug] = useState(term.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Nome e obrigatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateTermAction(term.id, taxonomyId, { 
        name: editName.trim(), 
        slug: editSlug.trim() || editName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      });
      if (result && 'error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Termo atualizado');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Erro ao atualizar termo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o termo "${term.name}"?`)) {
      return;
    }

    try {
      await deleteTermAction(term.id);
      toast.success('Termo excluido');
    } catch (error) {
      toast.error('Erro ao excluir termo');
    }
  };

  if (isEditing) {
    return (
      <tr>
        <td colSpan={2}>
          <div className="flex items-center gap-3 p-2">
            <input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="field-input flex-1 text-sm"
              placeholder="Nome"
              autoFocus
            />
            <input 
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="field-input flex-1 text-sm font-mono"
              placeholder="Slug"
            />
            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSubmitting}
                className="p-1.5 text-text-muted hover:text-action transition-colors"
                title="Salvar"
              >
                <Save size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setEditName(term.name);
                  setEditSlug(term.slug);
                }}
                className="p-1.5 text-text-muted hover:text-text-heading transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted">
            <Tag size={14} />
          </div>
          <div>
            <div className="font-medium text-text-heading text-sm">{term.name}</div>
            <div className="text-xs text-text-muted font-mono">/{term.slug}</div>
          </div>
        </div>
      </td>
      <td className="text-right">
        <div className="flex justify-end items-center gap-1.5">
          <span className="text-xs text-text-muted mr-2">{term._count?.posts ?? 0} posts</span>
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-text-muted hover:text-action transition-colors"
            title="Editar"
          >
            <Tag size={16} />
          </button>
          <button 
            type="button" 
            onClick={handleDelete}
            className="p-1.5 text-text-muted hover:text-status-trash transition-colors"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
