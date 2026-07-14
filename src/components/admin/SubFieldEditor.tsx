'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import FieldTypeSelector from './FieldTypeSelector';

interface SubFieldEditorProps {
  fields: any[];
  onChange: (fields: any[]) => void;
  readOnly?: boolean;
}

export default function SubFieldEditor({ fields, onChange, readOnly }: SubFieldEditorProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addField = () => {
    onChange([...fields, {
      name: '',
      label: '',
      type: 'text',
      config: { width: 100, required: false }
    }]);
    setExpandedIdx(fields.length);
  };

  const removeField = (idx: number) => {
    onChange(fields.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateField = (idx: number, key: string, value: any) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], [key]: value };

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
      while (fields.some((f, i) => i !== idx && f.name === candidate)) {
        candidate = `${baseName}_${counter}`;
        counter++;
      }
      updated[idx].name = candidate;
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label-field-muted text-xs">Sub-campos</label>
        <button onClick={addField} className="text-xs text-action hover:text-action/80">+ Adicionar</button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-text-muted italic">Nenhum sub-campo definido. Clique em "+ Adicionar" para começar.</p>
      )}

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
                  <input
                    value={field.label}
                    onChange={(e) => updateField(idx, 'label', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent border-none outline-none font-medium text-xs text-text-heading flex-1"
                    placeholder="Rótulo"
                  />
                  <span className="text-[9px] font-mono text-action/60">{field.type}</span>
                </div>

                <button onClick={(e) => { e.stopPropagation(); removeField(idx); }} className="p-1 text-text-muted hover:text-status-trash">
                  <Trash2 size={12} />
                </button>

                {expandedIdx === idx ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
              </div>

              {expandedIdx === idx && (
                <div className="p-3 bg-surface-muted/50 border-t border-border-default space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted text-[10px]">Tipo</label>
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={field.config?.required || false} onChange={(e) => updateConfig(idx, 'required', e.target.checked)} className="check-field" />
                    <span className="text-[10px] text-text-body">Obrigatório</span>
                  </label>

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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
