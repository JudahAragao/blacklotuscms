'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import FieldTypeSelector from './FieldTypeSelector';

interface SubFieldEditorProps {
  fields: any[];
  onChange: (fields: any[]) => void;
  readOnly?: boolean;
  layout?: 'table' | 'block' | 'row';
  onLayoutChange?: (layout: 'table' | 'block' | 'row') => void;
}

export default function SubFieldEditor({ fields, onChange, readOnly, layout = 'block', onLayoutChange }: SubFieldEditorProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const generateName = (label: string, idx: number): string => {
    const baseName = label
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
    while (fields.some((f, i) => i !== idx && f.name === candidate)) {
      candidate = `${baseName}_${counter}`;
      counter++;
    }
    return candidate;
  };

  const addField = () => {
    const newIdx = fields.length;
    const newField = {
      name: '',
      label: '',
      type: 'text',
      config: { width: 100, required: false }
    };
    onChange([...fields, newField]);
    setExpandedIdx(newIdx);
  };

  const removeField = (idx: number) => {
    onChange(fields.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateField = (idx: number, key: string, value: any) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], [key]: value };

    if (key === 'label') {
      updated[idx].name = generateName(value, idx);
    }
    onChange(updated);
  };

  const updateConfig = (idx: number, key: string, value: any) => {
    const updated = [...fields];
    if (!updated[idx].config) updated[idx].config = {};
    updated[idx].config[key] = value;
    onChange(updated);
  };

  const onDragStart = (idx: number) => setDraggedItem(idx);
  const onDragEnd = () => { setDraggedItem(null); setDragOverIdx(null); };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== idx) setDragOverIdx(idx);
  };
  const onDrop = (idx: number) => {
    if (draggedItem === null || draggedItem === idx) {
      setDraggedItem(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...fields];
    const item = updated.splice(draggedItem, 1)[0];
    updated.splice(idx, 0, item);
    onChange(updated);
    setDraggedItem(null);
    setDragOverIdx(null);
  };

  const isOrganizer = (type: string) => type === 'tab' || type === 'section';

  if (readOnly) return null;

  const renderFieldConfig = (field: any, idx: number) => (
    <div className="p-3 bg-surface-muted/50 border-t border-border-default space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="label-field-muted text-[10px]">Rótulo do Campo</label>
          <input
            value={field.label}
            onChange={(e) => updateField(idx, 'label', e.target.value)}
            className="field-input text-xs"
            placeholder="Ex: Nome do Item"
          />
          <span className="text-[9px] text-text-muted">Aparece na página de edição</span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="label-field-muted text-[10px]">Nome (Âncora)</label>
          <input
            value={field.name}
            onChange={(e) => updateField(idx, 'name', e.target.value)}
            className="field-input text-xs font-mono"
            placeholder="nome_do_item"
          />
          <span className="text-[9px] text-text-muted">Usado no código: get_field('{field.name || '...'}')</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="label-field-muted text-[10px]">Tipo do Campo</label>
          <FieldTypeSelector
            value={field.type}
            onChange={(type) => updateField(idx, 'type', type)}
            compact
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="label-field-muted text-[10px]">Largura (%)</label>
          <input type="number" value={field.config?.width || 100} onChange={(e) => updateConfig(idx, 'width', Number(e.target.value))} className="field-input text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={field.config?.required || false} onChange={(e) => updateConfig(idx, 'required', e.target.checked)} className="check-field" />
          <span className="text-[10px] text-text-body">Obrigatório</span>
        </label>
        {field.config?.instructions !== undefined && (
          <div className="flex-1 flex flex-col gap-1">
            <input
              value={field.config?.instructions || ''}
              onChange={(e) => updateConfig(idx, 'instructions', e.target.value)}
              className="field-input text-[10px]"
              placeholder="Instruções (opcional)"
            />
          </div>
        )}
      </div>

      {field.type === 'select' && (
        <div className="space-y-2">
          <label className="label-field-muted text-[10px]">Opções</label>
          {field.config?.options?.map((opt: any, oIdx: number) => (
            <div key={oIdx} className="flex gap-2">
              <input placeholder="Label" value={opt.label} onChange={(e) => {
                const no = [...(field.config?.options || [])];
                no[oIdx] = { ...no[oIdx], label: e.target.value };
                updateConfig(idx, 'options', no);
              }} className="field-input text-xs flex-1" />
              <input placeholder="Valor" value={opt.value} onChange={(e) => {
                const no = [...(field.config?.options || [])];
                no[oIdx] = { ...no[oIdx], value: e.target.value };
                updateConfig(idx, 'options', no);
              }} className="field-input text-xs font-mono flex-1" />
            </div>
          ))}
          <button onClick={() => {
            const no = [...(field.config?.options || []), { label: '', value: '' }];
            updateConfig(idx, 'options', no);
          }} className="w-full py-1 border border-dashed border-border-default rounded text-[10px] text-text-muted hover:text-action">+ Opção</button>
        </div>
      )}
    </div>
  );

  // Table layout
  if (layout === 'table') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <label className="label-field-muted text-xs">Sub-campos</label>
          {onLayoutChange && (
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-text-muted">Layout:</span>
              <button onClick={() => onLayoutChange('table')} className={`px-1.5 py-0.5 rounded ${layout === 'table' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Tabela</button>
              <button onClick={() => onLayoutChange('block')} className={`px-1.5 py-0.5 rounded ${layout === 'block' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Bloco</button>
              <button onClick={() => onLayoutChange('row')} className={`px-1.5 py-0.5 rounded ${layout === 'row' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Linha</button>
            </div>
          )}
        </div>

        <div className="border border-border-default rounded overflow-hidden">
          <div className="grid grid-cols-[32px_1fr_1fr_100px_40px] gap-2 px-3 py-2 bg-surface-muted text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-default">
            <span>#</span>
            <span>Label</span>
            <span>Name</span>
            <span>Type</span>
            <span></span>
          </div>

          {fields.map((field, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={() => onDrop(idx)}
              className={`border-b border-border-default last:border-b-0 transition-all ${
                dragOverIdx === idx ? 'bg-action-light/20' : 'hover:bg-surface-muted/50'
              } ${draggedItem === idx ? 'opacity-50' : ''}`}
            >
              <div className="grid grid-cols-[32px_1fr_1fr_100px_40px] gap-2 items-center px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-text-muted">{idx + 1}</span>
                  <GripVertical size={12} className="cursor-grab text-text-muted hover:text-action" />
                </div>
                <button
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="text-left text-xs font-medium text-action hover:text-action/80"
                >
                  {field.label || 'Sem rótulo'}
                </button>
                <span className="text-[10px] font-mono text-text-muted truncate">{field.name || '...'}</span>
                <span className="text-[10px] text-text-muted">{field.type}</span>
                <button onClick={() => removeField(idx)} className="p-1 text-text-muted hover:text-status-trash">
                  <Trash2 size={12} />
                </button>
              </div>

              {expandedIdx === idx && renderFieldConfig(field, idx)}
            </div>
          ))}
        </div>

        <button onClick={addField} className="w-full py-2 border border-dashed border-border-default hover:border-action hover:bg-action-light transition-all rounded flex items-center justify-center gap-2 text-xs text-text-muted hover:text-action">
          <Plus size={12} /> Adicionar Sub-campo
        </button>
      </div>
    );
  }

  // Block/Row layout (default)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="label-field-muted text-xs">Sub-campos</label>
        {onLayoutChange && (
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-text-muted">Layout:</span>
            <button onClick={() => onLayoutChange('table')} className={`px-1.5 py-0.5 rounded ${layout === 'table' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Tabela</button>
            <button onClick={() => onLayoutChange('block')} className={`px-1.5 py-0.5 rounded ${layout === 'block' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Bloco</button>
            <button onClick={() => onLayoutChange('row')} className={`px-1.5 py-0.5 rounded ${layout === 'row' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}>Linha</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {fields.map((field, idx) => {
          const org = isOrganizer(field.type);
          return (
            <div
              key={idx}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={() => onDrop(idx)}
              className={`border rounded overflow-hidden transition-all ${
                org ? 'border-action/30 bg-action-light/50' :
                dragOverIdx === idx ? 'border-action border-dashed bg-action-light/20' : 'border-border-default'
              } ${draggedItem === idx ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
            >
              <div
                className={`flex items-center gap-2 p-2 cursor-pointer ${org ? 'bg-action-light/50' : 'bg-surface-muted'}`}
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              >
                <div className="cursor-grab text-text-muted hover:text-action" onClick={(e) => e.stopPropagation()}>
                  <GripVertical size={12} />
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-5">{idx + 1}.</span>
                  <input
                    value={field.label}
                    onChange={(e) => updateField(idx, 'label', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent border-none outline-none font-medium text-xs text-text-heading flex-1"
                    placeholder="Rótulo"
                  />
                  <span className="text-[9px] font-mono text-text-muted truncate max-w-[100px]">{field.name || '...'}</span>
                  <span className="text-[9px] font-mono text-action/60">{field.type}</span>
                </div>

                <button onClick={(e) => { e.stopPropagation(); removeField(idx); }} className="p-1 text-text-muted hover:text-status-trash">
                  <Trash2 size={12} />
                </button>

                {expandedIdx === idx ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
              </div>

              {expandedIdx === idx && renderFieldConfig(field, idx)}
            </div>
          );
        })}
      </div>

      <button onClick={addField} className="w-full py-2 border border-dashed border-border-default hover:border-action hover:bg-action-light transition-all rounded flex items-center justify-center gap-2 text-xs text-text-muted hover:text-action">
        <Plus size={12} /> Adicionar Sub-campo
      </button>
    </div>
  );
}
