'use client';

import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { importPluginAction } from '@/app/(admin)/admin/plugins/actions';

export default function PluginImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('pluginZip', file);

    try {
      const result = await importPluginAction(formData);
      if (result.success) {
        toast.success('Plugin importado com sucesso!');
      }
    } catch (err: any) {
      toast.error(`Erro ao importar plugin: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".zip"
        className="hidden"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="btn-ghost label-caps text-[10px] flex items-center gap-2 hover:bg-primary/10 transition-all disabled:opacity-50"
      >
        {isImporting ? (
          <>
            <Loader2 size={14} className="animate-spin text-primary" />
            IMPORTING...
          </>
        ) : (
          <>
            <Download size={14} /> 
            IMPORT EXTENSION
          </>
        )}
      </button>
    </div>
  );
}
button>
    </div>
  );
}
