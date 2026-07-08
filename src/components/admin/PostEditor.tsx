'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MediaPicker from './MediaPicker';
import RichTextEditor from './RichTextEditor';
import { Plus, Trash2, Save, Send, Eye, Calendar, User, Tag, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import { shouldShowField, validateField } from '@/lib/field-utils';
import { toast } from 'sonner';

interface PostEditorProps {
  post: any;
  onSave: (data: any) => Promise<any>;
  readOnly?: boolean;
  capabilities?: {
    canPublish: boolean;
  };
}

export default function PostEditor({ post, onSave, readOnly, capabilities }: PostEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    status: post?.status || 'draft',
    metaFields: post?.metaValues?.reduce((acc: any, m: any) => {
      acc[m.fieldId] = m.value;
      return acc;
    }, {}) || {},
    terms: post?.terms?.map((t: any) => t.termId) || [],
    publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
    expiresAt: post?.expiresAt ? new Date(post.expiresAt).toISOString().slice(0, 16) : '',
    seoTitle: post?.seoTitle || '',
    seoDescription: post?.seoDescription || '',
    ogImage: post?.ogImage || '',
    noIndex: post?.noIndex || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Mapeia IDs de campos para nomes para facilitar a lógica condicional
  const fieldIdToNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    post?.postType?.fieldGroups?.forEach((group: any) => {
      group.fields.forEach((field: any) => {
        map[field.id] = field.name;
      });
    });
    return map;
  }, [post?.postType?.fieldGroups]);

  // Dados formatados para avaliação de lógica condicional (usa nomes em vez de IDs)
  const evalData = useMemo(() => {
    const metaByNames: Record<string, any> = {};
    Object.entries(formData.metaFields).forEach(([id, val]) => {
      const name = fieldIdToNameMap[id];
      if (name) metaByNames[name] = val;
    });
    return { ...formData, metaFields: metaByNames };
  }, [formData, fieldIdToNameMap]);

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

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    post?.postType?.fieldGroups?.forEach((group: any) => {
      group.fields.forEach((field: any) => {
        if (shouldShowField(field.config, evalData)) {
          const error = validateField(field, formData.metaFields[field.id]);
          if (error) newErrors[field.id] = error;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Por favor, corrija os erros antes de salvar.');
      return;
    }

    setIsSaving(true);
    
    // Sanitiza as datas antes de enviar
    const submissionData = {
      ...formData,
      publishedAt: formData.publishedAt || null,
      expiresAt: formData.expiresAt || null,
    };

    const result: any = await onSave(submissionData);
    setIsSaving(false);

    if (result.success) {
      if (result.redirect) {
        router.push(result.redirect);
      } else {
        toast.success('Conteúdo atualizado com sucesso!');
      }
    } else {
      toast.error('Erro ao salvar: ' + result.error);
    }
  };

  const handleTitleBlur = () => {
    if (formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  };

  const updateMetaField = (fieldId: string, value: any, field: any) => {
    setFormData(prev => ({
      ...prev,
      metaFields: { ...prev.metaFields, [fieldId]: value }
    }));
    
    // Validação em tempo real
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrs = { ...prev };
      if (error) newErrs[fieldId] = error;
      else delete newErrs[fieldId];
      return newErrs;
    });
  };

  const toggleTerm = (termId: string) => {
    setFormData(prev => {
      const terms = prev.terms.includes(termId)
        ? prev.terms.filter((id: string) => id !== termId)
        : [...prev.terms, termId];
      return { ...prev, terms };
    });
  };

  const renderFieldInput = (field: any, value: any, onChange: (val: any) => void) => {
    const config = field.config || {};

    switch (field.type) {
      case 'select':
        return (
          <select
            disabled={readOnly}
            className="field-select w-full"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Selecione...</option>
            {config.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'image':
        return (
          <MediaPicker
            currentValue={value}
            onSelect={(media) => { if (!readOnly) onChange(media.url); }}
            disabled={readOnly}
          />
        );
      case 'gallery':
        const galleryImages = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryImages.map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  draggable={!readOnly}
                  onDragStart={(e) => {
                    if (readOnly) return;
                    e.dataTransfer.setData('text/plain', idx.toString());
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (readOnly) return;
                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                    const newImages = [...galleryImages];
                    const [movedItem] = newImages.splice(fromIdx, 1);
                    newImages.splice(idx, 0, movedItem);
                    onChange(newImages);
                  }}
                  className="group relative aspect-square bg-surface-muted border border-border-default rounded overflow-hidden hover:shadow-md transition-all cursor-move"
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = galleryImages.filter((_, i) => i !== idx);
                        onChange(newImages);
                      }}
                      className="absolute top-1 right-1 bg-status-trash text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:brightness-110"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}

              {!readOnly && (
                <MediaPicker
                  multiple={true}
                  onSelect={(mediaList: any[]) => {
                    const newUrls = mediaList.map(m => m.url);
                    onChange([...galleryImages, ...newUrls]);
                  }}
                >
                  <div className="aspect-square border-2 border-dashed border-border-default rounded flex flex-col items-center justify-center text-text-muted hover:border-action hover:text-action transition-all cursor-pointer bg-surface-card">
                    <Plus size={24} />
                    <span className="text-xs mt-2 font-medium">Adicionar</span>
                  </div>
                </MediaPicker>
              )}
            </div>
            {galleryImages.length === 0 && !readOnly && (
              <p className="text-xs text-text-muted italic">Nenhuma imagem na galeria. Clique em Adicionar para comecar.</p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            readOnly={readOnly}
            className="field-textarea w-full"
            rows={4}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'wysiwyg':
        return (
          <RichTextEditor
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="check-field"
            />
            <span className="text-sm text-text-body">{value ? 'Sim' : 'Nao'}</span>
          </div>
        );
      case 'repeater':
        const subFields = config.repeater?.fields || config.subFields || [];
        const rows = Array.isArray(value) ? value : [];
        const minItems = config.repeater?.minItems || 0;
        const maxItems = config.repeater?.maxItems || 999;

        const addRow = () => {
          if (rows.length >= maxItems) return;
          const newRow = subFields.reduce((acc: any, sub: any) => {
            acc[sub.name] = sub.type === 'boolean' ? false : '';
            return acc;
          }, {});
          onChange([...rows, newRow]);
        };

        const removeRow = (idx: number) => {
          if (rows.length <= minItems) return;
          onChange(rows.filter((_, i) => i !== idx));
        };

        const updateRowField = (idx: number, subName: string, subValue: any) => {
          const newRows = [...rows];
          newRows[idx] = { ...newRows[idx], [subName]: subValue };
          onChange(newRows);
        };

        return (
          <div className="space-y-4 w-full">
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div key={idx} className="content-card p-4 relative group">
                  {!readOnly && rows.length > minItems && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-status-trash text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subFields.map((sub: any) => (
                      <div key={sub.name} className="flex flex-col gap-1.5">
                        <label className="label-field-muted">{sub.label}</label>
                        {renderFieldInput(sub, row[sub.name], (val) => updateRowField(idx, sub.name, val))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!readOnly && rows.length < maxItems && (
              <button
                type="button"
                onClick={addRow}
                className="w-full py-3 border border-dashed border-border-default hover:border-action hover:bg-action-light transition-all rounded flex items-center justify-center gap-2 text-sm text-text-muted hover:text-action"
              >
                <Plus size={14} /> {config.repeater?.buttonLabel || `Adicionar item`}
              </button>
            )}
            {rows.length >= maxItems && (
              <p className="text-xs text-status-draft text-center italic">Limite maximo de {maxItems} itens atingido.</p>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            readOnly={readOnly}
            className={`field-input w-full ${errors[field.id] ? 'border-status-trash' : ''}`}
            placeholder={config.placeholder || `Digite ${field.label.toLowerCase()}...`}
            value={value || ''}
            min={config.validation?.min}
            max={config.validation?.max}
            onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* COLUNA PRINCIPAL */}
      <div className="lg:col-span-9 space-y-6">
        <div className="content-card p-6 space-y-6">
          {post?.postType?.supportsTitle !== false && (
            <label className="flex flex-col gap-1.5">
              <span className="label-field-muted">
                {post?.postType?.settings?.titleLabel || 'Titulo'}
              </span>
              <input
                type="text"
                required
                readOnly={readOnly}
                className="w-full border-0 border-b border-border-default p-3 text-2xl font-semibold text-text-heading placeholder:text-text-muted focus:border-action focus:border-b-2 outline-none transition-all bg-transparent"
                placeholder="Digite o titulo..."
                value={formData.title}
                onBlur={handleTitleBlur}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </label>
          )}

          {post?.postType?.supportsEditor !== false && (
            <label className="flex flex-col gap-3">
              <span className="label-field-muted">
                {post?.postType?.settings?.editorLabel || 'Conteudo'}
              </span>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                readOnly={readOnly}
              />
            </label>
          )}
        </div>

        {/* GRUPOS DE CAMPOS */}
        {post?.postType?.fieldGroups?.map((group: any) => (
          <div key={group.id} className="content-card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border-default">
              <h3 className="font-semibold text-sm text-text-heading">{group.title}</h3>
            </div>
            <div className="flex flex-wrap -mx-2">
              {group.fields.map((field: any) => {
                const isVisible = shouldShowField(field.config, evalData);
                if (!isVisible) return null;

                const width = field.config?.width || 100;

                return (
                  <div
                    key={field.id}
                    className="px-2 mb-6 transition-all duration-300"
                    style={{ width: `${width}%`, minWidth: width < 100 ? '300px' : '100%' }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="label-field">
                          {field.label} {field.config?.required && <span className="text-status-trash">*</span>}
                        </label>
                        {errors[field.id] && (
                          <span className="text-status-trash text-xs flex items-center gap-1">
                            <AlertCircle size={12} /> {errors[field.id]}
                          </span>
                        )}
                      </div>
                      {field.config?.instructions && (
                        <p className="text-xs text-text-muted italic">{field.config.instructions}</p>
                      )}
                      {renderFieldInput(field, formData.metaFields[field.id], (val) => updateMetaField(field.id, val, field))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="content-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-border-default pb-3">
            <Eye size={16} className="text-action" />
            <h3 className="font-semibold text-sm text-text-heading">Otimizacao para Mecanismos de Busca</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="label-field-muted">Titulo SEO (Meta Title)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="field-input w-full"
                  placeholder={formData.title}
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                />
                <div className="flex justify-between text-xs">
                  <span className={formData.seoTitle.length > 60 ? 'text-status-trash' : 'text-text-muted'}>
                    {formData.seoTitle.length} / 60 caracteres
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-field-muted">Descricao SEO (Meta Description)</label>
                <textarea
                  readOnly={readOnly}
                  rows={3}
                  className="field-textarea w-full"
                  placeholder="Resumo atraente para os resultados de busca..."
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
                <div className="flex justify-between text-xs">
                  <span className={formData.seoDescription.length > 160 ? 'text-status-trash' : 'text-text-muted'}>
                    {formData.seoDescription.length} / 160 caracteres
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label-field-muted">Imagem de Compartilhamento (OG:Image)</label>
                <MediaPicker
                  currentValue={formData.ogImage}
                  onSelect={(media) => setFormData({ ...formData, ogImage: media.url })}
                  disabled={readOnly}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="check-field"
                  checked={formData.noIndex}
                  onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                />
                <span className="text-sm text-text-body group-hover:text-status-trash transition-colors">Esconder dos buscadores (Noindex)</span>
              </label>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-text-muted block mb-3 italic">Pre-visualizacao no Google</span>
              <div className="bg-surface-muted p-5 rounded border border-border-default">
                <div className="space-y-2">
                  {formData.ogImage && (
                    <div className="w-full h-40 overflow-hidden rounded border border-border-default mb-3">
                      <img src={formData.ogImage} className="w-full h-full object-cover" alt="SEO Preview" />
                    </div>
                  )}
                  <div className="text-xs text-text-muted truncate">
                    https://seusite.com.br <span className="text-text-muted">/ {formData.slug || 'slug-do-post'}</span>
                  </div>
                  <div className="text-lg text-action font-medium hover:underline cursor-pointer leading-tight line-clamp-1">
                    {formData.seoTitle || formData.title || 'Titulo do Post'}
                  </div>
                  <div className="text-sm text-text-body line-clamp-2 leading-relaxed">
                    {formData.seoDescription || 'Escreva uma descricao SEO para ver como este post aparecera nos resultados de busca...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA LATERAL (SIDEBAR) */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="meta-box overflow-hidden sticky top-6 z-20">
          <div className="meta-box-header flex items-center justify-between">
            <h3 className="font-semibold text-sm">Publicacao</h3>
            <div className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-status-published' : 'bg-status-draft'}`}></div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="label-field-muted">Status</label>
              <select
                className="field-select w-full text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Rascunho</option>
                {(capabilities?.canPublish || post?.status === 'published') && (
                  <option value="published">Publicado</option>
                )}
                <option value="private">Privado</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="label-field-muted">Agendamento</label>
              <input
                type="datetime-local"
                readOnly={readOnly}
                className="field-input w-full text-sm"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              />
              <p className="text-xs text-text-muted italic">Deixe vazio para publicar imediatamente.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="label-field-muted">Expira em</label>
              <input
                type="datetime-local"
                readOnly={readOnly}
                className="field-input w-full text-sm"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <p className="text-xs text-text-muted italic">Deixe vazio para validade indeterminada.</p>
            </div>

            <div className="flex items-center gap-2 py-2 border-t border-border-default">
              <span className="text-xs text-text-muted">Autor:</span>
              <span className="text-sm font-medium text-text-heading">
                {post?.author?.email?.split('@')[0] || 'Voce'}
              </span>
            </div>

            <div className="pt-3 border-t border-border-default">
              {!readOnly ? (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-action w-full flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Salvando...' : (post?.id === 'new' ? 'Publicar Agora' : 'Atualizar Conteudo')}
                </button>
              ) : (
                <div className="w-full py-2.5 text-center text-xs text-text-muted border border-border-default rounded bg-surface-muted">
                  Modo de Visualizacao
                </div>
              )}
            </div>
          </div>
        </div>

        {post?.postType?.supportsPermalink !== false && (
          <div className="meta-box overflow-hidden">
            <div className="meta-box-header">
              <h3 className="font-semibold text-sm">Link Permanente</h3>
            </div>
            <div className="p-4">
              <label className="flex flex-col gap-1.5">
                <span className="label-field-muted">Slug da URL</span>
                <input
                  type="text"
                  required
                  readOnly={readOnly}
                  className="field-input w-full font-mono text-sm"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                />
                <p className="text-xs text-text-muted mt-1">
                  URL final: <span className="text-action font-mono">/{formData.slug || 'seu-post'}</span>
                </p>
              </label>
            </div>
          </div>
        )}

        {post?.postType?.supportsTaxonomies !== false && post?.postType?.taxonomies?.map((taxonomy: any) => (
          <div key={taxonomy.id} className="meta-box overflow-hidden">
            <div className="meta-box-header flex items-center gap-2">
              <Tag size={14} className="text-text-muted" /> {taxonomy.label}
            </div>
            <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar space-y-2">
              {taxonomy.terms?.map((term: any) => (
                <label key={term.id} className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    className="check-field"
                    disabled={readOnly}
                    checked={formData.terms.includes(term.id)}
                    onChange={() => toggleTerm(term.id)}
                  />
                  <span className={`text-sm transition-colors ${
                    formData.terms.includes(term.id) ? 'text-text-heading font-medium' : 'text-text-body'
                  }`}>
                    {term.name}
                  </span>
                </label>
              ))}
              {(!taxonomy.terms || taxonomy.terms.length === 0) && (
                <p className="text-sm text-text-muted italic py-3 text-center">Nenhum termo disponivel.</p>
              )}
            </div>
          </div>
        ))}
      </aside>
    </form>
  );
}
