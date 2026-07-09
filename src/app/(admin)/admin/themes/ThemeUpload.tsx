'use client';

import React, { useRef, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { installThemeAction } from './actions';
import { toast } from 'sonner';

export default function ThemeUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Por favor, selecione um arquivo .zip');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await installThemeAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Tema instalado com sucesso!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao instalar tema');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".zip" 
        className="hidden" 
      />
      
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`content-card border-dashed border-2 flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${isUploading ? 'border-action opacity-100 cursor-wait' : 'border-border-default opacity-60 hover:opacity-100 hover:border-action'}`}
      >
        <div className={`w-14 h-14 rounded-full border border-dashed flex items-center justify-center mb-3 transition-all ${isUploading ? 'border-action text-action animate-pulse' : 'border-border-default text-text-muted group-hover:border-action group-hover:text-action'}`}>
          {isUploading ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <Plus size={28} strokeWidth={1} />
          )}
        </div>
        <span className="text-sm font-medium text-text-heading">
          {isUploading ? 'Instalando...' : 'Adicionar Tema'}
        </span>
        {!isUploading && (
          <span className="text-xs text-text-muted mt-1">Selecione um arquivo .zip</span>
        )}
      </div>
    </>
  );
}
