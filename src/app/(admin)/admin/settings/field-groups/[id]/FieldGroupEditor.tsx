'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Settings, Layout, ShieldCheck, List, GripVertical, Eye, ChevronLeft, Layers, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateFieldGroupAction, syncFieldsAction, searchPostsAction } from '../actions';
import SubFieldEditor from '@/components/admin/SubFieldEditor';

interface FieldGroupEditorProps {
  fieldGroup: any;
  postTypes: { id: string; slug: string; label: string }[];
  taxonomies: { id: string; slug: string; label: string }[];
}

export default function FieldGroupEditor({ fieldGroup, postTypes, taxonomies }: FieldGroupEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(fieldGroup.title);
  const [locations, setLocations] = useState(fieldGroup.locations || []);
  const [fields, setFields] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postSearchResults, setPostSearchResults] = useState<any[]>([]);
  const [postSearchLoading, setPostSearchLoading] = useState(false);
  const [activePostSearchIdx, setActivePostSearchIdx] = useState<number | null>(null);

  const searchPosts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPostSearchResults([]);
      return;
    }
    setPostSearchLoading(true);
    const result = await searchPostsAction(query);
    setPostSearchLoading(false);
    if ('success' in result && result.success) {
      setPostSearchResults(result.data);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(postSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [postSearchQuery, searchPosts]);

  useEffect(() => {
    setFields(fieldGroup.fields?.map((f: any) => ({
      ...f,
      isSystem: false,
      config: f.config || {}
    })) || []);
  }, [fieldGroup]);

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    searchPostsAction('').then(result => {
      if ('success' in result && result.success) {
        setPosts(result.data);
      }
    });
  }, []);

  const addField = () => {
    setFields([...fields, {
      label: '',
      name: '',
      type: 'text',
      isSystem: false,
      config: {
        width: 100,
        required: false,
        validation: {},
        conditionalLogic: { status: false, rules: [], relation: 'and' },
        repeater: { fields: [] },
        options: []
      }
    }]);
    setExpandedField(fields.length);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    if (expandedField === index) setExpandedField(null);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    const updatedField = { ...newFields[index], [key]: value };

    if (key === 'label') {
      const baseName = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[.,]+/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      let candidate = baseName;
      let counter = 2;
      while (fields.some((f, i) => i !== index && f.name === candidate)) {
        candidate = `${baseName}_${counter}`;
        counter++;
      }
      updatedField.name = candidate;
    }
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const updateConfig = (fieldIndex: number, key: string, value: any) => {
    const newFields = [...fields];
    const keys = key.split('.');
    let current = newFields[fieldIndex].config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setFields(newFields);
  };

  const addLocation = () => {
    setLocations([...locations, { locationType: 'post_type', locationValue: '' }]);
  };

  const updateLocation = (index: number, key: string, value: string) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [key]: value };
    setLocations(updated);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_: any, i: number) => i !== index));
  };

  const onDragStart = (index: number) => setDraggedItem(index);
  const onDragEnd = () => { setDraggedItem(null); setDragOverIndex(null); };
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) setDragOverIndex(index);
  };
  const onDrop = (index: number) => {
    if (draggedItem === null || draggedItem === index) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }
    const newFields = [...fields];
    const item = newFields.splice(draggedItem, 1)[0];
    newFields.splice(index, 0, item);
    setFields(newFields);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (locations.length === 0) {
      toast.error('Pelo menos uma localização é obrigatória');
      return;
    }

    setIsSaving(true);

    // 1. Atualizar título e locations
    const updateResult = await updateFieldGroupAction(fieldGroup.id, {
      title,
      locations: locations.map((l: any) => ({
        type: l.locationType,
        value: l.locationValue,
        param: l.locationParam,
      })),
      fields: [],
    });

    if (!('success' in updateResult) || !updateResult.success) {
      setIsSaving(false);
      toast.error('Erro ao salvar: ' + ('error' in updateResult ? updateResult.error : 'Desconhecido'));
      return;
    }

    // 2. Sincronizar fields
    const syncResult = await syncFieldsAction(fieldGroup.id, fields.map(f => ({
      id: f.id,
      name: f.name,
      label: f.label,
      type: f.type,
      config: f.config,
    })));

    setIsSaving(false);

    if ('success' in syncResult && syncResult.success) {
      toast.success('Grupo salvo com sucesso!');
      router.push('/admin/settings/field-groups');
    } else {
      toast.error('Erro ao salvar campos: ' + ('error' in syncResult ? syncResult.error : 'Desconhecido'));
    }
  };

  const getLocationLabel = (loc: any) => {
    switch (loc.locationType || loc.type) {
      case 'post_type':
        const pt = postTypes.find(p => p.id === (loc.locationValue || loc.value));
        return `Tipo: ${pt?.label || (loc.locationValue || loc.value)}`;
      case 'taxonomy':
        const tax = taxonomies.find(t => t.id === (loc.locationValue || loc.value));
        return `Taxonomia: ${tax?.label || (loc.locationValue || loc.value)}${loc.locationParam || loc.param ? ` (${loc.locationParam || loc.param})` : ''}`;
      case 'post':
        return `Post: ${loc.locationValue || loc.value}`;
      case 'template':
        return `Template: ${loc.locationValue || loc.value}`;
      case 'post_status':
        return `Status: ${loc.locationValue || loc.value}`;
      default:
        return loc.locationType || loc.type;
    }
  };

  const isOrganizer = (type: string) => type === 'tab' || type === 'section';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/field-groups" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text-heading">Editar: {fieldGroup.title}</h1>
          <p className="text-sm text-text-muted mt-1">Configurar campos e localizações</p>
        </div>
      </div>

      {/* Configurações do Grupo */}
      <div className="content-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-text-heading flex items-center gap-2">
          <Layers size={14} /> Configurações do Grupo
        </h3>

        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Título do Grupo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field-input text-lg font-bold"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label-field-muted">Localizações (onde aparece)</label>
            <button onClick={addLocation} className="text-xs text-action hover:text-action/80">+ Adicionar</button>
          </div>

          {locations.map((loc: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={loc.locationType || loc.type}
                onChange={(e) => updateLocation(idx, 'locationType', e.target.value)}
                className="field-select text-xs w-40"
              >
                <option value="post_type">Tipo de Post</option>
                <option value="taxonomy">Taxonomia</option>
                <option value="post">Post Específico</option>
                <option value="template">Template</option>
                <option value="post_status">Status</option>
              </select>

              {(loc.locationType || loc.type) === 'post_type' && (
                <select
                  value={loc.locationValue || loc.value}
                  onChange={(e) => updateLocation(idx, 'locationValue', e.target.value)}
                  className="field-select text-xs flex-1"
                >
                  <option value="">Selecione...</option>
                  {postTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.label} ({pt.slug})</option>
                  ))}
                </select>
              )}

              {(loc.locationType || loc.type) === 'taxonomy' && (
                <>
                  <select
                    value={loc.locationValue || loc.value}
                    onChange={(e) => updateLocation(idx, 'locationValue', e.target.value)}
                    className="field-select text-xs flex-1"
                  >
                    <option value="">Selecione...</option>
                    {taxonomies.map(t => (
                      <option key={t.id} value={t.id}>{t.label} ({t.slug})</option>
                    ))}
                  </select>
                  <input
                    value={loc.locationParam || loc.param || ''}
                    onChange={(e) => updateLocation(idx, 'locationParam', e.target.value)}
                    className="field-input text-xs flex-1"
                    placeholder="Term específico (opcional)"
                  />
                </>
              )}

              {(loc.locationType || loc.type) === 'post' && (
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        value={activePostSearchIdx === idx ? postSearchQuery : (loc.locationValue || loc.value ? posts.find((p: any) => p.id === (loc.locationValue || loc.value))?.title || '' : '')}
                        onChange={(e) => {
                          setPostSearchQuery(e.target.value);
                          setActivePostSearchIdx(idx);
                        }}
                        onFocus={() => {
                          setActivePostSearchIdx(idx);
                          if (loc.locationValue || loc.value) {
                            const post = posts.find((p: any) => p.id === (loc.locationValue || loc.value));
                            if (post) setPostSearchQuery(post.title);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setActivePostSearchIdx(null);
                            setPostSearchResults([]);
                          }, 200);
                        }}
                        className="field-input text-xs pl-7 w-full"
                        placeholder="Buscar post por título..."
                      />
                    </div>
                    <button
                      onClick={() => updateLocation(idx, 'locationValue', '')}
                      className="p-1 text-text-muted hover:text-status-trash text-xs"
                      title="Limpar seleção"
                    >
                      ×
                    </button>
                  </div>
                  {activePostSearchIdx === idx && postSearchResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-card border border-border-default rounded shadow-lg max-h-48 overflow-y-auto">
                      {postSearchResults.map((post: any) => (
                        <button
                          key={post.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            updateLocation(idx, 'locationValue', post.id);
                            setPostSearchResults([]);
                            setPostSearchQuery('');
                            setActivePostSearchIdx(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-action-light/30 flex flex-col gap-0.5"
                        >
                          <span className="font-medium text-text-heading">{post.title}</span>
                          <span className="text-text-muted">/{post.slug} — {post.postType?.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {activePostSearchIdx === idx && postSearchLoading && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-card border border-border-default rounded shadow-lg p-2 text-xs text-text-muted">
                      Buscando...
                    </div>
                  )}
                </div>
              )}

              {(loc.locationType || loc.type) === 'template' && (
                <input
                  value={loc.locationValue || loc.value}
                  onChange={(e) => updateLocation(idx, 'locationValue', e.target.value)}
                  className="field-input text-xs flex-1"
                  placeholder="Nome do template"
                />
              )}

              {(loc.locationType || loc.type) === 'post_status' && (
                <select
                  value={loc.locationValue || loc.value}
                  onChange={(e) => updateLocation(idx, 'locationValue', e.target.value)}
                  className="field-select text-xs flex-1"
                >
                  <option value="">Selecione...</option>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="private">Privado</option>
                </select>
              )}

              <button onClick={() => removeLocation(idx)} className="p-1 text-text-muted hover:text-status-trash">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campos */}
      <div className="content-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-text-heading">Campos</h3>
          <button onClick={addField} className="btn-action flex items-center gap-2">
            <Plus size={14} /> Novo Campo
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const org = isOrganizer(field.type);
            return (
              <div
                key={field.id || index}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={() => onDrop(index)}
                className={`border rounded overflow-hidden transition-all ${
                  org ? 'border-action/30 bg-action-light/50' :
                  dragOverIndex === index ? 'border-action border-dashed bg-action-light/20' : 'border-border-default'
                } ${draggedItem === index ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
              >
                <div className={`flex items-center gap-3 p-3 ${org ? 'bg-action-light/50' : 'bg-surface-muted'}`}>
                  <div className="cursor-grab text-text-muted hover:text-action">
                    <GripVertical size={14} />
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex flex-col flex-1">
                      <input
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        className="bg-transparent border-none outline-none font-medium text-sm text-text-heading"
                        placeholder="Rótulo do Campo"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono ${org ? 'text-action' : 'text-action/60'}`}>
                          {field.type === 'tab' ? 'aba' : field.type === 'section' ? 'secao' : field.type}
                        </span>
                        <span className="text-[10px] text-text-muted">|</span>
                        <span className="text-[10px] font-mono text-text-muted">{org ? field.label : field.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!org && (
                      <button onClick={() => setExpandedField(expandedField === index ? null : index)} className={`p-1.5 rounded transition-colors ${expandedField === index ? 'bg-action-light text-action' : 'text-text-muted hover:text-text-heading'}`}>
                        <Settings size={14} />
                      </button>
                    )}
                    <button onClick={() => removeField(index)} className="p-1.5 text-text-muted hover:text-status-trash transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {expandedField === index && !org && (
                  <div className="p-4 bg-surface-muted/50 border-t border-border-default grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Layout size={12} /> Geral</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="label-field-muted">Tipo</label>
                          <select value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)} className="field-select text-xs">
                            <option value="text">Texto</option>
                            <option value="textarea">Área de Texto</option>
                            <option value="number">Número</option>
                            <option value="email">Email</option>
                            <option value="select">Seleção</option>
                            <option value="image">Imagem</option>
                            <option value="gallery">Galeria</option>
                            <option value="file">Arquivo</option>
                            <option value="boolean">Booleano</option>
                            <option value="wysiwyg">Editor Rico</option>
                            <option value="json">JSON</option>
                            <option value="repeater">Repetidor</option>
                            <option value="flexible_content">Conteúdo Flexível</option>
                            <option value="tab">Aba</option>
                            <option value="section">Seção</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="label-field-muted">Largura (%)</label>
                          <input type="number" value={field.config.width} onChange={(e) => updateConfig(index, 'width', Number(e.target.value))} className="field-input text-xs" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="label-field-muted">Instruções</label>
                        <input value={field.config.instructions || ''} onChange={(e) => updateConfig(index, 'instructions', e.target.value)} className="field-input text-xs" placeholder="Aparece abaixo do campo" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.config.required} onChange={(e) => updateConfig(index, 'required', e.target.checked)} className="check-field" />
                        <span className="text-xs text-text-body">Obrigatório</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><ShieldCheck size={12} /> Validação</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="label-field-muted">Min</label>
                          <input type="number" value={field.config.validation?.min ?? ''} onChange={(e) => updateConfig(index, 'validation.min', Number(e.target.value))} className="field-input text-xs" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="label-field-muted">Max</label>
                          <input type="number" value={field.config.validation?.max ?? ''} onChange={(e) => updateConfig(index, 'validation.max', Number(e.target.value))} className="field-input text-xs" />
                        </div>
                      </div>

                      <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Eye size={12} /> Lógica Condicional</h5>
                      <button onClick={() => updateConfig(index, 'conditionalLogic.status', !field.config.conditionalLogic?.status)} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${field.config.conditionalLogic?.status ? 'bg-status-published/10 text-status-published' : 'bg-surface-muted text-text-muted'}`}>
                        {field.config.conditionalLogic?.status ? 'Ativo' : 'Inativo'}
                      </button>
                      {field.config.conditionalLogic?.status && (
                        <div className="space-y-2 p-2 bg-surface-card rounded border border-border-default">
                          {field.config.conditionalLogic.rules?.map((rule: any, rIdx: number) => (
                            <div key={rIdx} className="flex gap-2 items-center">
                              <select value={rule.field} onChange={(e) => { const nr = [...field.config.conditionalLogic.rules]; nr[rIdx].field = e.target.value; updateConfig(index, 'conditionalLogic.rules', nr); }} className="field-select text-xs flex-1">
                                <option value="">Campo...</option>
                                {fields.filter((_, i) => i !== index).map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                              </select>
                              <input value={rule.value} onChange={(e) => { const nr = [...field.config.conditionalLogic.rules]; nr[rIdx].value = e.target.value; updateConfig(index, 'conditionalLogic.rules', nr); }} className="field-input text-xs flex-1" placeholder="Valor" />
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === 'select' && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><List size={12} /> Opções</h5>
                          {field.config.options?.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex gap-2">
                              <input placeholder="Label" value={opt.label} onChange={(e) => { const no = [...field.config.options]; no[oIdx].label = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs flex-1" />
                              <input placeholder="Valor" value={opt.value} onChange={(e) => { const no = [...field.config.options]; no[oIdx].value = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs font-mono flex-1" />
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === 'repeater' && (
                        <div className="space-y-3">
                          <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Layers size={12} /> Sub-campos do Repetidor</h5>
                          <SubFieldEditor
                            fields={field.config.repeater?.fields || []}
                            onChange={(subFields) => updateConfig(index, 'repeater.fields', subFields)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="label-field-muted text-[10px]">Mín. Itens</label>
                              <input type="number" value={field.config.repeater?.minItems ?? ''} onChange={(e) => updateConfig(index, 'repeater.minItems', Number(e.target.value) || undefined)} className="field-input text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="label-field-muted text-[10px]">Máx. Itens</label>
                              <input type="number" value={field.config.repeater?.maxItems ?? ''} onChange={(e) => updateConfig(index, 'repeater.maxItems', Number(e.target.value) || undefined)} className="field-input text-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === 'flexible_content' && (
                        <div className="space-y-4">
                          <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Layers size={12} /> Layouts</h5>
                          {(field.config.flexibleContent?.layouts || []).map((layout: any, lIdx: number) => (
                            <div key={lIdx} className="border border-border-default rounded p-3 space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  value={layout.label}
                                  onChange={(e) => {
                                    const layouts = [...(field.config.flexibleContent?.layouts || [])];
                                    layouts[lIdx] = { ...layouts[lIdx], label: e.target.value };
                                    if (!layout.name) {
                                      layouts[lIdx].name = e.target.value
                                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                                        .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '');
                                    }
                                    updateConfig(index, 'flexibleContent.layouts', layouts);
                                  }}
                                  className="field-input text-xs flex-1 font-medium"
                                  placeholder="Nome do Layout"
                                />
                                <button onClick={() => {
                                  const layouts = (field.config.flexibleContent?.layouts || []).filter((_: any, i: number) => i !== lIdx);
                                  updateConfig(index, 'flexibleContent.layouts', layouts);
                                }} className="p-1 text-text-muted hover:text-status-trash">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <SubFieldEditor
                                fields={layout.fields || []}
                                onChange={(subFields) => {
                                  const layouts = [...(field.config.flexibleContent?.layouts || [])];
                                  layouts[lIdx] = { ...layouts[lIdx], fields: subFields };
                                  updateConfig(index, 'flexibleContent.layouts', layouts);
                                }}
                              />
                            </div>
                          ))}
                          <button onClick={() => {
                            const layouts = [...(field.config.flexibleContent?.layouts || []), { name: '', label: '', fields: [] }];
                            updateConfig(index, 'flexibleContent.layouts', layouts);
                          }} className="w-full py-2 border border-dashed border-border-default rounded text-xs text-text-muted hover:text-action hover:border-action">
                            + Adicionar Layout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t border-border-default">
        <button onClick={handleSave} disabled={isSaving} className="btn-action flex items-center gap-2">
          {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Configuração</>}
        </button>
      </div>
    </div>
  );
}
