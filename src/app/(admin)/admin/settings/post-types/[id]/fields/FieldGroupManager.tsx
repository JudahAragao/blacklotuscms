'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Settings, Layout, ShieldCheck, List, Code, GripVertical, Eye, Layers } from 'lucide-react';
import { saveFieldsAction } from './actions';
import { toast } from 'sonner';

export default function FieldGroupManager({ postTypeId, postType, initialFieldGroups }: { postTypeId: string, postType: any, initialFieldGroups: any[] }) {
  const [fields, setFields] = useState<any[]>([]);
  const [postTypeLabel, setPostTypeLabel] = useState(postType.label);
  const [hierarchical, setHierarchical] = useState(postType.hierarchical);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    // 1. Inicializar Campos do Sistema
    const systemFields = [
      { 
        id: 'sys_title', 
        isSystem: true, 
        label: postType.settings?.titleLabel || 'Título', 
        name: 'title', 
        type: 'system', 
        active: postType.supportsTitle,
        systemKey: 'supportsTitle',
        settingsKey: 'titleLabel'
      },
      { 
        id: 'sys_editor', 
        isSystem: true, 
        label: postType.settings?.editorLabel || 'Conteúdo / Editor', 
        name: 'content', 
        type: 'system', 
        active: postType.supportsEditor,
        systemKey: 'supportsEditor',
        settingsKey: 'editorLabel'
      },
      { 
        id: 'sys_slug', 
        isSystem: true, 
        label: 'Slug / Permalink', 
        name: 'slug', 
        type: 'system', 
        active: postType.supportsPermalink,
        systemKey: 'supportsPermalink'
      },
      { 
        id: 'sys_tax', 
        isSystem: true, 
        label: 'Categorias / Taxonomias', 
        name: 'taxonomies', 
        type: 'system', 
        active: postType.supportsTaxonomies,
        systemKey: 'supportsTaxonomies'
      }
    ];

    // 2. Inicializar Campos Customizados
    const customFields = initialFieldGroups.flatMap(g => g.fields).map(f => ({
      ...f,
      isSystem: false,
      config: f.config || {}
    }));

    setFields([...systemFields, ...customFields]);
  }, [postType, initialFieldGroups]);

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
    if (fields[index].isSystem) return;
    setFields(fields.filter((_, i) => i !== index));
    if (expandedField === index) setExpandedField(null);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    const updatedField = { ...newFields[index], [key]: value };

    if (key === 'label' && !updatedField.isSystem) {
      updatedField.name = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[.,]+/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
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

  const addOption = (fieldIndex: number) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].config.options) newFields[fieldIndex].config.options = [];
    newFields[fieldIndex].config.options.push({ label: '', value: '' });
    setFields(newFields);
  };

  const addCondition = (fieldIndex: number) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].config.conditionalLogic) {
      newFields[fieldIndex].config.conditionalLogic = { status: true, rules: [], relation: 'and' };
    }
    newFields[fieldIndex].config.conditionalLogic.rules.push({ field: '', operator: 'equals', value: '' });
    setFields(newFields);
  };

  const onDragStart = (index: number) => {
    if (fields[index].isSystem) return;
    setDraggedItem(index);
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (draggedItem === null || draggedItem === index || fields[index].isSystem) return;
    
    const newFields = [...fields];
    const item = newFields.splice(draggedItem, 1)[0];
    newFields.splice(index, 0, item);
    
    setFields(newFields);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const systemFieldsData = {
      supportsTitle: fields.find(f => f.id === 'sys_title')?.active,
      supportsEditor: fields.find(f => f.id === 'sys_editor')?.active,
      supportsPermalink: fields.find(f => f.id === 'sys_slug')?.active,
      supportsTaxonomies: fields.find(f => f.id === 'sys_tax')?.active,
      settings: {
        titleLabel: fields.find(f => f.id === 'sys_title')?.label,
        editorLabel: fields.find(f => f.id === 'sys_editor')?.label,
      },
      label: postTypeLabel,
      hierarchical: hierarchical
    };

    const customFieldsData = fields.filter(f => !f.isSystem).map(f => ({
      id: f.id,
      name: f.name,
      label: f.label,
      type: f.type,
      config: f.config
    }));

    const result = await saveFieldsAction(postTypeId, {
      systemFields: systemFieldsData,
      customFields: customFieldsData
    });

    setIsSaving(false);
    if ('success' in result && result.success) {
      toast.success('Configuração salva com sucesso!');
      window.location.reload();
    } else {
      toast.error('Erro ao salvar: ' + ('error' in result ? result.error : 'Desconhecido'));
    }
  };

  return (
    <div className="content-card p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-border-default">
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Nome do Tipo</label>
          <input
            value={postTypeLabel}
            onChange={(e) => setPostTypeLabel(e.target.value)}
            className="field-input text-lg font-bold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="label-field-muted">Estrutura</label>
          <select
            value={hierarchical ? 'true' : 'false'}
            onChange={(e) => setHierarchical(e.target.value === 'true')}
            className="field-select"
          >
            <option value="false">Linear (como Posts)</option>
            <option value="true">Hierarquica (como Paginas)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-text-heading">Campos</h4>
          <p className="text-xs text-text-muted mt-0.5">Defina a estrutura de dados</p>
        </div>
        <button onClick={addField} className="btn-action flex items-center gap-2">
          <Plus size={14} /> Novo Campo
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id || index}
            draggable={!field.isSystem}
            onDragStart={() => onDragStart(index)}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            className={`border rounded overflow-hidden transition-all ${
              field.isSystem ? 'border-action/20 bg-action-light/30' : 'border-border-default'
            } ${draggedItem === index ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
          >
            <div className={`flex items-center gap-3 p-3 ${field.isSystem ? 'bg-action-light/30' : 'bg-surface-muted'}`}>
              <div className={`flex-none ${field.isSystem ? 'opacity-20' : 'cursor-grab text-text-muted hover:text-action'}`}>
                <GripVertical size={14} />
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div className="flex flex-col flex-1">
                  <input
                    value={field.label}
                    onChange={(e) => updateField(index, 'label', e.target.value)}
                    className={`bg-transparent border-none outline-none font-medium text-sm ${field.active === false ? 'text-text-muted line-through' : 'text-text-heading'}`}
                    placeholder="Rotulo do Campo"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-action/60">{field.isSystem ? 'sistema' : field.type}</span>
                    <span className="text-[10px] text-text-muted">|</span>
                    <span className="text-[10px] font-mono text-text-muted">{field.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateField(index, 'active', !field.active)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                    field.active !== false
                      ? 'bg-status-published/10 border-status-published/30 text-status-published'
                      : 'bg-surface-muted border-border-default text-text-muted'
                  }`}
                >
                  {field.active !== false ? 'Ativo' : 'Oculto'}
                </button>

                {!field.isSystem && (
                  <button onClick={() => setExpandedField(expandedField === index ? null : index)} className={`p-1.5 rounded transition-colors ${expandedField === index ? 'bg-action-light text-action' : 'text-text-muted hover:text-text-heading'}`}>
                    <Settings size={14} />
                  </button>
                )}
                {!field.isSystem && (
                  <button onClick={() => removeField(index)} className="p-1.5 text-text-muted hover:text-status-trash transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {expandedField === index && !field.isSystem && (
              <div className="p-4 bg-surface-muted/50 border-t border-border-default grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Layout size={12} /> Geral</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted">Tipo</label>
                      <select value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)} className="field-select text-xs">
                        <option value="text">Texto</option>
                        <option value="textarea">Area de Texto</option>
                        <option value="number">Numero</option>
                        <option value="email">Email</option>
                        <option value="select">Selecao</option>
                        <option value="image">Imagem</option>
                        <option value="gallery">Galeria</option>
                        <option value="file">Arquivo</option>
                        <option value="boolean">Booleano</option>
                        <option value="wysiwyg">Editor Rico</option>
                        <option value="json">JSON</option>
                        <option value="repeater">Repetidor</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted">Largura (%)</label>
                      <input type="number" value={field.config.width} onChange={(e) => updateConfig(index, 'width', Number(e.target.value))} className="field-input text-xs" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="label-field-muted">Instrucoes</label>
                    <input value={field.config.instructions || ''} onChange={(e) => updateConfig(index, 'instructions', e.target.value)} className="field-input text-xs" placeholder="Aparece abaixo do campo" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={field.config.required} onChange={(e) => updateConfig(index, 'required', e.target.checked)} className="check-field" />
                    <span className="text-xs text-text-body">Obrigatorio</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><ShieldCheck size={12} /> Validacao</h5>
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

                  <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Eye size={12} /> Logica Condicional</h5>
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
                      <button onClick={() => addCondition(index)} className="w-full py-1.5 border border-dashed border-border-default rounded text-xs text-text-muted hover:text-action">+ Regra</button>
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><List size={12} /> Opcoes</h5>
                      {field.config.options?.map((opt: any, oIdx: number) => (
                        <div key={oIdx} className="flex gap-2">
                          <input placeholder="Label" value={opt.label} onChange={(e) => { const no = [...field.config.options]; no[oIdx].label = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs flex-1" />
                          <input placeholder="Valor" value={opt.value} onChange={(e) => { const no = [...field.config.options]; no[oIdx].value = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs font-mono flex-1" />
                        </div>
                      ))}
                      <button onClick={() => addOption(index)} className="w-full py-1.5 border border-dashed border-border-default rounded text-xs text-text-muted hover:text-action">+ Opcao</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border-default">
        <button onClick={handleSave} disabled={isSaving} className="btn-action flex items-center gap-2">
          {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Configuracao</>}
        </button>
      </div>
    </div>
  );
}
