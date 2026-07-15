'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Upload, Loader2, X, Check, FileText } from 'lucide-react';

interface MediaPickerProps {
  onSelect: (media: any | any[]) => void;
  currentValue?: string | string[];
  disabled?: boolean;
  children?: React.ReactNode;
  multiple?: boolean;
  accept?: string;
}

export default function MediaPicker({ onSelect, currentValue, disabled, children, multiple = false, accept }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/media', { credentials: 'include' });
      const data = await res.json();
      setMediaList(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !disabled && activeTab === 'library') {
      fetchMedia();
    }
  }, [isOpen, disabled, activeTab]);

  const handleSelect = (media: any) => {
    if (multiple) {
      const isSelected = selectedItems.find(item => item.id === media.id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter(item => item.id !== media.id));
      } else {
        setSelectedItems([...selectedItems, media]);
      }
    } else {
      onSelect(media);
      setIsOpen(false);
    }
  };

  const confirmSelection = () => {
    onSelect(selectedItems);
    setIsOpen(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let completed = 0;
    const uploadedMedia = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const response = await fetch('/api/v1/media', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          uploadedMedia.push(data);
        }
        
        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
      }
    }

    // Após o upload, selecionar automaticamente e fechar ou ir para biblioteca
    if (uploadedMedia.length > 0) {
      if (multiple) {
        setSelectedItems([...selectedItems, ...uploadedMedia]);
        setActiveTab('library');
      } else {
        onSelect(uploadedMedia[0]);
        setIsOpen(false);
      }
    }
    
    setIsUploading(false);
  };

  return (
    <div className={children ? "" : "mt-1"}>
      {children ? (
        <div onClick={() => !disabled && setIsOpen(true)}>
          {children}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {!multiple && currentValue && typeof currentValue === 'string' && (
            /\.(jpe?g|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(currentValue) ? (
              <img src={currentValue} className="w-16 h-16 object-cover rounded border border-outline-variant/20" alt="Preview" />
            ) : (
              <div className="w-16 h-16 rounded border border-outline-variant/20 bg-surface-muted flex flex-col items-center justify-center text-text-muted">
                <FileText size={18} />
                <span className="text-[8px] mt-0.5 font-mono max-w-[60px] truncate">{currentValue.split('/').pop()}</span>
              </div>
            )
          )}
          <button 
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(true)}
            className={`px-3 py-1.5 label-caps text-[10px] border transition-all rounded-sm ${
              disabled 
              ? 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10 cursor-not-allowed' 
              : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary hover:text-primary text-on-surface-variant'
            }`}
          >
            {currentValue ? 'ALTERAR' : 'SELECIONAR'}
          </button>
        </div>
      )}

      {isOpen && !disabled && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border-default w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl rounded">
            <div className="flex flex-col border-b border-border-default">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-text-heading">Gerenciar Midia</h3>
                <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-heading p-1">✕</button>
              </div>
              <div className="flex px-4 gap-4">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`pb-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'library' ? 'border-action text-action' : 'border-transparent text-text-muted hover:text-text-heading'}`}
                >
                  Biblioteca
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'upload' ? 'border-action text-action' : 'border-transparent text-text-muted hover:text-text-heading'}`}
                >
                  Upload
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[400px]">
              {activeTab === 'library' ? (
                loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-action animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {mediaList.map((media: any) => {
                      const isSelected = selectedItems.find(item => item.id === media.id);
                      return (
                        <div
                          key={media.id}
                          onClick={() => handleSelect(media)}
                          className={`group relative aspect-square cursor-pointer border rounded overflow-hidden transition-all ${
                            isSelected ? 'ring-2 ring-action border-action' : 'border-border-default hover:border-action/50'
                          }`}
                        >
                          {media.mimeType?.startsWith('image/') ? (
                            <img src={media.thumbnail || media.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={media.name} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-muted text-text-muted">
                              <FileText size={24} />
                              <span className="text-[9px] mt-1 font-mono max-w-full truncate px-1">{media.name}</span>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-action text-white rounded-full p-0.5 shadow">
                              <Check size={12} strokeWidth={4} />
                            </div>
                          )}
                          <div className={`absolute inset-0 bg-action/10 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="bg-action text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                              {isSelected ? 'Selecionado' : 'Selecionar'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div
                  className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded transition-all p-10 text-center
                    ${isUploading ? 'pointer-events-none opacity-50 border-border-default' : 'cursor-pointer border-border-default hover:border-action hover:bg-action-light/30'}
                  `}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
                  }}
                >
                  <input ref={fileInputRef} type="file" multiple={multiple} className="hidden" onChange={(e) => handleUpload(e.target.files)} accept={accept || '*'} />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-14 h-14">
                        <Loader2 className="w-14 h-14 text-action animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-text-heading">{uploadProgress}%</div>
                      </div>
                      <p className="text-sm text-action font-medium animate-pulse">Enviando...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center border border-border-default text-text-muted">
                        <Upload size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-heading">Arraste arquivos aqui</p>
                        <p className="text-xs text-text-muted mt-0.5">Ou clique para selecionar</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {multiple && (
              <div className="p-3 border-t border-border-default bg-surface-muted flex justify-between items-center">
                <span className="text-xs text-text-muted">{selectedItems.length} selecionados</span>
                <div className="flex gap-3">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-1.5 text-sm text-text-muted hover:text-text-heading">Cancelar</button>
                  <button onClick={confirmSelection} className="btn-action text-sm">Confirmar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
