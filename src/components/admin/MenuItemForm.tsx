'use client';

import React, { useState } from 'react';

interface MenuItemFormProps {
  menuId: string;
  onAdd: (formData: FormData) => Promise<any>;
}

export default function MenuItemForm({ menuId, onAdd }: MenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await onAdd(formData);
    setIsPending(false);
    
    if (result?.success) {
      toast.success('Item adicionado ao menu!');
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error('Erro: ' + (result?.error || 'Falha ao adicionar item'));
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition text-sm font-bold"
      >
        Adicionar Item ao Menu
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="menuId" value={menuId} />
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Label</label>
          <input 
            type="text" 
            name="label" 
            required 
            className="w-full mt-1 rounded border-gray-300 text-sm px-2 py-1"
            placeholder="Ex: Home"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">URL</label>
          <input 
            type="text" 
            name="url" 
            required 
            className="w-full mt-1 rounded border-gray-300 text-sm px-2 py-1"
            placeholder="Ex: /home"
          />
        </div>
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isPending ? 'Salvando...' : 'Confirmar'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 border border-gray-300 rounded text-xs font-bold hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
