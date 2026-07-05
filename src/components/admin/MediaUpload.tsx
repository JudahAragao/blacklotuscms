'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const totalFiles = files.length;
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await fetch('/api/v1/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Falha no upload');
        
        completed++;
        setProgress(Math.round((completed / totalFiles) * 100));
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setProgress(0);
      router.refresh();
    }, 1000);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`relative content-card border-2 border-dashed transition-all duration-300 p-10 text-center
          ${dragActive ? 'border-action bg-action-light scale-[1.01]' : 'border-border-default'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-action hover:bg-action-light/50'}
        `}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          accept="image/*"
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <div className="relative w-14 h-14">
                <Loader2 className="w-14 h-14 text-action animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-text-heading">
                  {progress}%
                </div>
              </div>
              <p className="text-sm text-action font-medium animate-pulse">Processando...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center border border-border-default text-text-muted">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-heading">Enviar novos arquivos</p>
                <p className="text-xs text-text-muted mt-0.5">Arraste e solte ou clique para selecionar</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
