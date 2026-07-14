'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Settings, Layout, ShieldCheck, List, GripVertical, Eye, ChevronLeft, Layers, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateFieldGroupAction, syncFieldsAction, searchPostsAction } from '../actions';
import FieldTypeSelector from '@/components/admin/FieldTypeSelector';

interface FieldGroupEditorProps {
  fieldGroup: any;
  postTypes: { id: string; slug: string; label: string }[];
  taxonomies: { id: string; slug: string; label: string }[];
}

type DragSource = {
  type: 'root' | 'repeater' | 'flexible_layout';
  fieldIndex: number;
  parentFieldIndex?: number;
  layoutIndex?: number;
} | null;

type DropTarget = {
  type: 'root' | 'repeater' | 'flexible_layout';
  fieldIndex?: number;
  parentFieldIndex?: number;
  layoutIndex?: number;
  position?: 'before' | 'after' | 'inside';
} | null;

export default function FieldGroupEditor({ fieldGroup, postTypes, taxonomies }: FieldGroupEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(fieldGroup.title);
  const [locations, setLocations] = useState(fieldGroup.locations || []);
  const [fields, setFields] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedField, setExpandedField] = useState<number | string | null>(null);
  const [activeFieldTab, setActiveFieldTab] = useState<{ [key: number]: string }>({});
  const [activeSubFieldTab, setActiveSubFieldTab] = useState<{ [key: string]: string }>({});
  const [dragSource, setDragSource] = useState<DragSource>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
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

  // ===== UNIFIED DRAG AND DROP =====

  const onDragStart = (source: DragSource) => {
    setDragSource(source);
  };

  const onDragEnd = () => {
    setDragSource(null);
    setDropTarget(null);
  };

  const onDragOverRoot = (e: React.DragEvent, index: number, position: 'before' | 'after') => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSource) {
      setDropTarget({ type: 'root', fieldIndex: index, position });
    }
  };

  const onDropRoot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSource || !dropTarget) {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    const newFields = [...fields];

    // Remove field from source
    let movedField: any = null;
    if (dragSource.type === 'root') {
      movedField = newFields.splice(dragSource.fieldIndex, 1)[0];
    } else if (dragSource.type === 'repeater' && dragSource.parentFieldIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const subFields = [...(parentField.config.repeater?.fields || [])];
      movedField = subFields.splice(dragSource.fieldIndex, 1)[0];
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
      };
    } else if (dragSource.type === 'flexible_layout' && dragSource.parentFieldIndex !== undefined && dragSource.layoutIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
      const layoutFields = [...(layouts[dragSource.layoutIndex].fields || [])];
      movedField = layoutFields.splice(dragSource.fieldIndex, 1)[0];
      layouts[dragSource.layoutIndex] = { ...layouts[dragSource.layoutIndex], fields: layoutFields };
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
      };
    }

    if (!movedField) {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    // Insert at target position
    const insertIndex = dropTarget.fieldIndex ?? newFields.length;
    if (dropTarget.position === 'after') {
      newFields.splice(insertIndex + 1, 0, movedField);
    } else {
      newFields.splice(insertIndex, 0, movedField);
    }

    setFields(newFields);
    setDragSource(null);
    setDropTarget(null);
  };

  const onDragOverRepeaterDropZone = (e: React.DragEvent, parentIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSource && dragSource.type !== 'repeater' && dragSource.fieldIndex !== parentIndex) {
      setDropTarget({ type: 'repeater', parentFieldIndex: parentIndex, position: 'inside' });
    }
  };

  const onDropInRepeater = (e: React.DragEvent, parentIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSource || !dropTarget || dropTarget.type !== 'repeater') {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    const newFields = [...fields];
    let movedField: any = null;

    // Remove from source
    if (dragSource.type === 'root') {
      movedField = newFields.splice(dragSource.fieldIndex, 1)[0];
      // Adjust parentIndex if needed after removal
      if (dragSource.fieldIndex < parentIndex) {
        parentIndex--;
      }
    } else if (dragSource.type === 'repeater' && dragSource.parentFieldIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const subFields = [...(parentField.config.repeater?.fields || [])];
      movedField = subFields.splice(dragSource.fieldIndex, 1)[0];
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
      };
      // Adjust parentIndex if needed
      if (dragSource.parentFieldIndex < parentIndex) {
        parentIndex--;
      }
    } else if (dragSource.type === 'flexible_layout' && dragSource.parentFieldIndex !== undefined && dragSource.layoutIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
      const layoutFields = [...(layouts[dragSource.layoutIndex].fields || [])];
      movedField = layoutFields.splice(dragSource.fieldIndex, 1)[0];
      layouts[dragSource.layoutIndex] = { ...layouts[dragSource.layoutIndex], fields: layoutFields };
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
      };
      if (dragSource.parentFieldIndex < parentIndex) {
        parentIndex--;
      }
    }

    if (!movedField) {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    // Insert into repeater
    const parentField = newFields[parentIndex];
    const subFields = [...(parentField.config.repeater?.fields || [])];
    subFields.push(movedField);
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
    };

    setFields(newFields);
    setDragSource(null);
    setDropTarget(null);
  };

  const onDragOverFlexibleLayoutDropZone = (e: React.DragEvent, parentIndex: number, layoutIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragSource && !(dragSource.type === 'flexible_layout' && dragSource.parentFieldIndex === parentIndex && dragSource.layoutIndex === layoutIndex)) {
      setDropTarget({ type: 'flexible_layout', parentFieldIndex: parentIndex, layoutIndex, position: 'inside' });
    }
  };

  const onDropInFlexibleLayout = (e: React.DragEvent, parentIndex: number, layoutIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragSource || !dropTarget || dropTarget.type !== 'flexible_layout') {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    const newFields = [...fields];
    let movedField: any = null;

    // Remove from source
    if (dragSource.type === 'root') {
      movedField = newFields.splice(dragSource.fieldIndex, 1)[0];
      if (dragSource.fieldIndex < parentIndex) {
        parentIndex--;
      }
    } else if (dragSource.type === 'repeater' && dragSource.parentFieldIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const subFields = [...(parentField.config.repeater?.fields || [])];
      movedField = subFields.splice(dragSource.fieldIndex, 1)[0];
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
      };
      if (dragSource.parentFieldIndex < parentIndex) {
        parentIndex--;
      }
    } else if (dragSource.type === 'flexible_layout' && dragSource.parentFieldIndex !== undefined && dragSource.layoutIndex !== undefined) {
      const parentField = newFields[dragSource.parentFieldIndex];
      const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
      const layoutFields = [...(layouts[dragSource.layoutIndex].fields || [])];
      movedField = layoutFields.splice(dragSource.fieldIndex, 1)[0];
      layouts[dragSource.layoutIndex] = { ...layouts[dragSource.layoutIndex], fields: layoutFields };
      newFields[dragSource.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
      };
      if (dragSource.parentFieldIndex < parentIndex) {
        parentIndex--;
      } else if (dragSource.parentFieldIndex === parentIndex && dragSource.layoutIndex < layoutIndex) {
        layoutIndex--;
      }
    }

    if (!movedField) {
      setDragSource(null);
      setDropTarget(null);
      return;
    }

    // Insert into flexible layout
    const parentField = newFields[parentIndex];
    const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
    const layoutFields = [...(layouts[layoutIndex].fields || [])];
    layoutFields.push(movedField);
    layouts[layoutIndex] = { ...layouts[layoutIndex], fields: layoutFields };
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
    };

    setFields(newFields);
    setDragSource(null);
    setDropTarget(null);
  };

  const isDragOverRepeater = (parentIndex: number) => {
    return dropTarget?.type === 'repeater' && dropTarget.parentFieldIndex === parentIndex;
  };

  const isDragOverFlexibleLayout = (parentIndex: number, layoutIndex: number) => {
    return dropTarget?.type === 'flexible_layout' && dropTarget.parentFieldIndex === parentIndex && dropTarget.layoutIndex === layoutIndex;
  };

  // ===== SUB-FIELD HANDLERS =====

  const onSubDragStart = (source: DragSource) => {
    setDragSource(source);
  };

  const updateSubFields = (parentIndex: number, subFields: any[]) => {
    updateConfig(parentIndex, 'repeater.fields', subFields);
  };

  const updateFlexLayoutSubFields = (parentIndex: number, layoutIndex: number, subFields: any[]) => {
    const newFields = [...fields];
    const parentField = newFields[parentIndex];
    const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
    layouts[layoutIndex] = { ...layouts[layoutIndex], fields: subFields };
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
    };
    setFields(newFields);
  };

  const removeSubField = (parentIndex: number, subIndex: number) => {
    const newFields = [...fields];
    const parentField = newFields[parentIndex];
    const subFields = [...(parentField.config.repeater?.fields || [])];
    subFields.splice(subIndex, 1);
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
    };
    setFields(newFields);
  };

  const removeFlexLayoutSubField = (parentIndex: number, layoutIndex: number, subIndex: number) => {
    const newFields = [...fields];
    const parentField = newFields[parentIndex];
    const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
    const layoutFields = [...(layouts[layoutIndex].fields || [])];
    layoutFields.splice(subIndex, 1);
    layouts[layoutIndex] = { ...layouts[layoutIndex], fields: layoutFields };
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
    };
    setFields(newFields);
  };

  // Helper to add a new sub-field to a repeater
  const addSubFieldToRepeater = (parentIndex: number) => {
    const newFields = [...fields];
    const parentField = newFields[parentIndex];
    const subFields = [...(parentField.config.repeater?.fields || [])];
    subFields.push({
      label: '',
      name: '',
      type: 'text',
      config: {
        width: 100,
        required: false,
        validation: {},
        conditionalLogic: { status: false, rules: [], relation: 'and' },
        options: []
      }
    });
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
    };
    setFields(newFields);
  };

  // Helper to add a new sub-field to a flexible content layout
  const addSubFieldToFlexLayout = (parentIndex: number, layoutIndex: number) => {
    const newFields = [...fields];
    const parentField = newFields[parentIndex];
    const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
    const layoutFields = [...(layouts[layoutIndex].fields || [])];
    layoutFields.push({
      label: '',
      name: '',
      type: 'text',
      config: {
        width: 100,
        required: false,
        validation: {},
        conditionalLogic: { status: false, rules: [], relation: 'and' },
        options: []
      }
    });
    layouts[layoutIndex] = { ...layouts[layoutIndex], fields: layoutFields };
    newFields[parentIndex] = {
      ...parentField,
      config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
    };
    setFields(newFields);
  };

  // Helper to update sub-field config
  const updateSubFieldConfig = (source: DragSource, subIdx: number, configKey: string, value: any) => {
    const newFieldsCopy = [...fields];
    const keys = configKey.split('.');

    if (source?.type === 'repeater' && source.parentFieldIndex !== undefined) {
      const parentField = newFieldsCopy[source.parentFieldIndex];
      const subFields = [...(parentField.config.repeater?.fields || [])];
      const subField = { ...subFields[subIdx] };
      const config = { ...subField.config };
      let current: any = config;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      subField.config = config;
      subFields[subIdx] = subField;
      newFieldsCopy[source.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
      };
    } else if (source?.type === 'flexible_layout' && source.parentFieldIndex !== undefined && source.layoutIndex !== undefined) {
      const parentField = newFieldsCopy[source.parentFieldIndex];
      const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
      const layoutFields = [...(layouts[source.layoutIndex].fields || [])];
      const subField = { ...layoutFields[subIdx] };
      const config = { ...subField.config };
      let current: any = config;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      subField.config = config;
      layoutFields[subIdx] = subField;
      layouts[source.layoutIndex] = { ...layouts[source.layoutIndex], fields: layoutFields };
      newFieldsCopy[source.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
      };
    }
    setFields(newFieldsCopy);
  };

  // Helper to update sub-field type
  const updateSubFieldType = (source: DragSource, subIdx: number, newType: string) => {
    const newFieldsCopy = [...fields];
    if (source?.type === 'repeater' && source.parentFieldIndex !== undefined) {
      const parentField = newFieldsCopy[source.parentFieldIndex];
      const subFields = [...(parentField.config.repeater?.fields || [])];
      subFields[subIdx] = { ...subFields[subIdx], type: newType };
      newFieldsCopy[source.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
      };
    } else if (source?.type === 'flexible_layout' && source.parentFieldIndex !== undefined && source.layoutIndex !== undefined) {
      const parentField = newFieldsCopy[source.parentFieldIndex];
      const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
      const layoutFields = [...(layouts[source.layoutIndex].fields || [])];
      layoutFields[subIdx] = { ...layoutFields[subIdx], type: newType };
      layouts[source.layoutIndex] = { ...layouts[source.layoutIndex], fields: layoutFields };
      newFieldsCopy[source.parentFieldIndex] = {
        ...parentField,
        config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
      };
    }
    setFields(newFieldsCopy);
  };

  // ===== RENDER SUB-FIELD =====

  const renderSubField = (sub: any, idx: number, source: DragSource, onDragStartFn: (s: DragSource) => void, onRemove: () => void, onUpdateLabel: (newLabel: string) => void, onUpdateName: (newName: string) => void) => {
    const org = isOrganizer(sub.type);
    const isDragging = dragSource?.type === source?.type && dragSource?.fieldIndex === idx && dragSource?.parentFieldIndex === source?.parentFieldIndex && dragSource?.layoutIndex === source?.layoutIndex;
    const subKey = `${source?.type}-${source?.parentFieldIndex}-${source?.layoutIndex ?? ''}-${idx}`;
    const isExpanded = expandedField === subKey;

    // Get the actual current value from state
    let currentSub = sub;
    if (source?.type === 'repeater' && source.parentFieldIndex !== undefined) {
      currentSub = fields[source.parentFieldIndex]?.config?.repeater?.fields?.[idx] || sub;
    } else if (source?.type === 'flexible_layout' && source.parentFieldIndex !== undefined && source.layoutIndex !== undefined) {
      currentSub = fields[source.parentFieldIndex]?.config?.flexibleContent?.layouts?.[source.layoutIndex]?.fields?.[idx] || sub;
    }

    return (
      <div
        key={currentSub.id || subKey}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStartFn(source);
        }}
        onDragEnd={onDragEnd}
        className={`border rounded overflow-hidden transition-all ${
          org ? 'border-action/30 bg-action-light/50' :
          isDragging ? 'opacity-50 scale-[0.98]' : 'border-border-default'
        }`}
      >
        <div className={`flex items-center gap-2 p-2 ${org ? 'bg-action-light/50' : 'bg-surface-muted'}`}>
          <div className="cursor-grab text-text-muted hover:text-action">
            <GripVertical size={12} />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-text-muted w-5">{idx + 1}.</span>
            <input
              value={currentSub.label}
              onChange={(e) => onUpdateLabel(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none outline-none font-medium text-xs text-text-heading flex-1"
              placeholder="Rótulo"
            />
            <input
              value={currentSub.name}
              onChange={(e) => onUpdateName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none outline-none font-mono text-[9px] text-text-muted min-w-[120px] max-w-[200px] truncate"
              placeholder="nome_ancora"
              title={currentSub.name}
            />
            <span className="text-[9px] font-mono text-action/60">{currentSub.type}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedField(isExpanded ? null : subKey);
            }}
            className={`p-1 rounded transition-colors ${isExpanded ? 'bg-action-light text-action' : 'text-text-muted hover:text-text-heading'}`}
          >
            <Settings size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-text-muted hover:text-status-trash">
            <Trash2 size={12} />
          </button>
        </div>

        {/* Sub-field config panel with tabs */}
        {isExpanded && (
          <div className="bg-surface-muted/50 border-t border-border-default">
            {/* Tabs */}
            <div className="flex border-b border-border-default">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveSubFieldTab({ ...activeSubFieldTab, [subKey]: 'general' }); }}
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${(activeSubFieldTab[subKey] || 'general') === 'general' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
              >
                <Layout size={10} className="inline mr-1" /> Geral
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveSubFieldTab({ ...activeSubFieldTab, [subKey]: 'validation' }); }}
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${activeSubFieldTab[subKey] === 'validation' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
              >
                <ShieldCheck size={10} className="inline mr-1" /> Validação
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveSubFieldTab({ ...activeSubFieldTab, [subKey]: 'conditional' }); }}
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${activeSubFieldTab[subKey] === 'conditional' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
              >
                <Eye size={10} className="inline mr-1" /> Lógica Condicional
              </button>
              {currentSub.type === 'select' && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveSubFieldTab({ ...activeSubFieldTab, [subKey]: 'options' }); }}
                  className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${activeSubFieldTab[subKey] === 'options' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
                >
                  <List size={10} className="inline mr-1" /> Opções
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-3" onClick={(e) => e.stopPropagation()}>
              {/* General Tab */}
              {(activeSubFieldTab[subKey] || 'general') === 'general' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted text-[10px]">Tipo do Campo</label>
                      <FieldTypeSelector
                        value={currentSub.type}
                        onChange={(type) => updateSubFieldType(source, idx, type)}
                        compact
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted text-[10px]">Largura (%)</label>
                      <input
                        type="number"
                        value={currentSub.config?.width || 100}
                        onChange={(e) => updateSubFieldConfig(source, idx, 'width', Number(e.target.value))}
                        className="field-input text-[10px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="label-field-muted text-[10px]">Instruções</label>
                    <input
                      value={currentSub.config?.instructions || ''}
                      onChange={(e) => updateSubFieldConfig(source, idx, 'instructions', e.target.value)}
                      className="field-input text-[10px]"
                      placeholder="Aparece abaixo do campo"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSub.config?.required || false}
                      onChange={(e) => updateSubFieldConfig(source, idx, 'required', e.target.checked)}
                      className="check-field"
                    />
                    <span className="text-[10px] text-text-body">Obrigatorio</span>
                  </label>
                </div>
              )}

              {/* Validation Tab */}
              {activeSubFieldTab[subKey] === 'validation' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted text-[10px]">Min</label>
                      <input
                        type="number"
                        value={currentSub.config?.validation?.min ?? ''}
                        onChange={(e) => updateSubFieldConfig(source, idx, 'validation.min', Number(e.target.value))}
                        className="field-input text-[10px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="label-field-muted text-[10px]">Max</label>
                      <input
                        type="number"
                        value={currentSub.config?.validation?.max ?? ''}
                        onChange={(e) => updateSubFieldConfig(source, idx, 'validation.max', Number(e.target.value))}
                        className="field-input text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Logic Tab */}
              {activeSubFieldTab[subKey] === 'conditional' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">Status:</span>
                    <button
                      onClick={() => updateSubFieldConfig(source, idx, 'conditionalLogic.status', !currentSub.config?.conditionalLogic?.status)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${currentSub.config?.conditionalLogic?.status ? 'bg-status-published/10 text-status-published' : 'bg-surface-muted text-text-muted'}`}
                    >
                      {currentSub.config?.conditionalLogic?.status ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                  {currentSub.config?.conditionalLogic?.status && (
                    <div className="space-y-2 p-2 bg-surface-card rounded border border-border-default">
                      {currentSub.config?.conditionalLogic?.rules?.map((rule: any, rIdx: number) => (
                        <div key={rIdx} className="flex gap-2 items-center">
                          <input
                            value={rule.field}
                            onChange={(e) => {
                              const newRules = [...(currentSub.config?.conditionalLogic?.rules || [])];
                              newRules[rIdx] = { ...newRules[rIdx], field: e.target.value };
                              updateSubFieldConfig(source, idx, 'conditionalLogic.rules', newRules);
                            }}
                            className="field-input text-[10px] flex-1"
                            placeholder="Campo"
                          />
                          <input
                            value={rule.value}
                            onChange={(e) => {
                              const newRules = [...(currentSub.config?.conditionalLogic?.rules || [])];
                              newRules[rIdx] = { ...newRules[rIdx], value: e.target.value };
                              updateSubFieldConfig(source, idx, 'conditionalLogic.rules', newRules);
                            }}
                            className="field-input text-[10px] flex-1"
                            placeholder="Valor"
                          />
                          <button
                            onClick={() => {
                              const newRules = (currentSub.config?.conditionalLogic?.rules || []).filter((_: any, i: number) => i !== rIdx);
                              updateSubFieldConfig(source, idx, 'conditionalLogic.rules', newRules);
                            }}
                            className="p-1 text-text-muted hover:text-status-trash"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newRules = [...(currentSub.config?.conditionalLogic?.rules || []), { field: '', value: '' }];
                          updateSubFieldConfig(source, idx, 'conditionalLogic.rules', newRules);
                        }}
                        className="w-full py-1 border border-dashed border-border-default rounded text-[10px] text-text-muted hover:text-action"
                      >
                        + Regra
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Options Tab */}
              {activeSubFieldTab[subKey] === 'options' && currentSub.type === 'select' && (
                <div className="space-y-2">
                  {currentSub.config?.options?.map((opt: any, oIdx: number) => (
                    <div key={oIdx} className="flex gap-2">
                      <input
                        placeholder="Label"
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(currentSub.config?.options || [])];
                          newOptions[oIdx] = { ...newOptions[oIdx], label: e.target.value };
                          updateSubFieldConfig(source, idx, 'options', newOptions);
                        }}
                        className="field-input text-[10px] flex-1"
                      />
                      <input
                        placeholder="Valor"
                        value={opt.value}
                        onChange={(e) => {
                          const newOptions = [...(currentSub.config?.options || [])];
                          newOptions[oIdx] = { ...newOptions[oIdx], value: e.target.value };
                          updateSubFieldConfig(source, idx, 'options', newOptions);
                        }}
                        className="field-input text-[10px] font-mono flex-1"
                      />
                      <button
                        onClick={() => {
                          const newOptions = (currentSub.config?.options || []).filter((_: any, i: number) => i !== oIdx);
                          updateSubFieldConfig(source, idx, 'options', newOptions);
                        }}
                        className="p-1 text-text-muted hover:text-status-trash"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(currentSub.config?.options || []), { label: '', value: '' }];
                      updateSubFieldConfig(source, idx, 'options', newOptions);
                    }}
                    className="w-full py-1 border border-dashed border-border-default rounded text-[10px] text-text-muted hover:text-action"
                  >
                    + Opção
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
        const post = posts.find(p => p.id === (loc.locationValue || loc.value));
        return `Post: ${post ? `${post.title} - ${post.slug}` : (loc.locationValue || loc.value)}`;
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
          <h1 className="text-2xl font-semibold text-text-heading">Editar: Campos Customizados</h1>
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
                  {(loc.locationValue || loc.value) && activePostSearchIdx !== idx ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-action-light/50 border border-action/20 rounded text-xs text-text-heading">
                        <span className="font-medium">{posts.find((p: any) => p.id === (loc.locationValue || loc.value))?.title || 'Post'}</span>
                      </div>
                      <button
                        onClick={() => updateLocation(idx, 'locationValue', '')}
                        className="p-1 text-text-muted hover:text-status-trash text-xs"
                        title="Limpar seleção"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
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
                  )}
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
        <h3 className="font-semibold text-sm text-text-heading">Campos</h3>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const org = isOrganizer(field.type);
            return (
              <div
                key={field.id || index}
                draggable
                onDragStart={() => onDragStart({ type: 'root', fieldIndex: index })}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onDragOverRoot(e, index, 'before')}
                onDrop={(e) => onDropRoot(e, index)}
                className={`border rounded overflow-hidden transition-all ${
                  org ? 'border-action/30 bg-action-light/50' :
                  dropTarget?.type === 'root' && dropTarget.fieldIndex === index ? 'border-action border-dashed bg-action-light/20' : 'border-border-default'
                } ${dragSource?.type === 'root' && dragSource.fieldIndex === index ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
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
                  <div className="bg-surface-muted/50 border-t border-border-default">
                    {/* Tabs */}
                    <div className="flex border-b border-border-default">
                      <button
                        onClick={() => setActiveFieldTab({ ...activeFieldTab, [index]: 'general' })}
                        className={`px-4 py-2 text-xs font-medium transition-colors ${(activeFieldTab[index] || 'general') === 'general' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
                      >
                        <Layout size={12} className="inline mr-1" /> Geral
                      </button>
                      <button
                        onClick={() => setActiveFieldTab({ ...activeFieldTab, [index]: 'validation' })}
                        className={`px-4 py-2 text-xs font-medium transition-colors ${activeFieldTab[index] === 'validation' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
                      >
                        <ShieldCheck size={12} className="inline mr-1" /> Validação
                      </button>
                      <button
                        onClick={() => setActiveFieldTab({ ...activeFieldTab, [index]: 'conditional' })}
                        className={`px-4 py-2 text-xs font-medium transition-colors ${activeFieldTab[index] === 'conditional' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
                      >
                        <Eye size={12} className="inline mr-1" /> Lógica Condicional
                      </button>
                      {field.type === 'select' && (
                        <button
                          onClick={() => setActiveFieldTab({ ...activeFieldTab, [index]: 'options' })}
                          className={`px-4 py-2 text-xs font-medium transition-colors ${activeFieldTab[index] === 'options' ? 'text-action border-b-2 border-action' : 'text-text-muted hover:text-text-heading'}`}
                        >
                          <List size={12} className="inline mr-1" /> Opções
                        </button>
                      )}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                      {/* General Tab */}
                      {(activeFieldTab[index] || 'general') === 'general' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="label-field-muted">Tipo</label>
                              <FieldTypeSelector
                                value={field.type}
                                onChange={(type) => updateField(index, 'type', type)}
                              />
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
                      )}

                      {/* Validation Tab */}
                      {activeFieldTab[index] === 'validation' && (
                        <div className="space-y-4">
                          {(field.type === 'repeater' || field.type === 'flexible_content') ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="label-field-muted">Mín. Itens</label>
                                <input type="number" value={field.config.repeater?.minItems ?? field.config.flexibleContent?.minItems ?? ''} onChange={(e) => updateConfig(index, field.type === 'repeater' ? 'repeater.minItems' : 'flexibleContent.minItems', Number(e.target.value) || undefined)} className="field-input text-xs" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="label-field-muted">Máx. Itens</label>
                                <input type="number" value={field.config.repeater?.maxItems ?? field.config.flexibleContent?.maxItems ?? ''} onChange={(e) => updateConfig(index, field.type === 'repeater' ? 'repeater.maxItems' : 'flexibleContent.maxItems', Number(e.target.value) || undefined)} className="field-input text-xs" />
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </div>
                      )}

                      {/* Conditional Logic Tab */}
                      {activeFieldTab[index] === 'conditional' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted">Status:</span>
                            <button onClick={() => updateConfig(index, 'conditionalLogic.status', !field.config.conditionalLogic?.status)} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${field.config.conditionalLogic?.status ? 'bg-status-published/10 text-status-published' : 'bg-surface-muted text-text-muted'}`}>
                              {field.config.conditionalLogic?.status ? 'Ativo' : 'Inativo'}
                            </button>
                          </div>
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
                              <button onClick={() => {
                                const nr = [...(field.config.conditionalLogic?.rules || []), { field: '', value: '' }];
                                updateConfig(index, 'conditionalLogic.rules', nr);
                              }} className="w-full py-1.5 border border-dashed border-border-default rounded text-xs text-text-muted hover:text-action">+ Regra</button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options Tab */}
                      {activeFieldTab[index] === 'options' && field.type === 'select' && (
                        <div className="space-y-2">
                          {field.config.options?.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex gap-2">
                              <input placeholder="Label" value={opt.label} onChange={(e) => { const no = [...field.config.options]; no[oIdx].label = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs flex-1" />
                              <input placeholder="Valor" value={opt.value} onChange={(e) => { const no = [...field.config.options]; no[oIdx].value = e.target.value; updateConfig(index, 'options', no); }} className="field-input text-xs font-mono flex-1" />
                              <button onClick={() => { const no = field.config.options.filter((_: any, i: number) => i !== oIdx); updateConfig(index, 'options', no); }} className="p-1 text-text-muted hover:text-status-trash">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => {
                            const no = [...(field.config.options || []), { label: '', value: '' }];
                            updateConfig(index, 'options', no);
                          }} className="w-full py-1.5 border border-dashed border-border-default rounded text-xs text-text-muted hover:text-action">+ Opção</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Repetidor */}
                {field.type === 'repeater' && (
                  <div className="space-y-3 p-4 border-t border-border-default">
                    <h5 className="text-xs font-semibold text-action flex items-center gap-1.5"><Layers size={12} /> Sub-campos do Repetidor</h5>

                    {/* Sub-fields list */}
                    <div className="space-y-2">
                      {(field.config.repeater?.fields || []).map((sub: any, subIdx: number) => {
                        const subSource: DragSource = { type: 'repeater', fieldIndex: subIdx, parentFieldIndex: index };
                        return renderSubField(
                          sub,
                          subIdx,
                          subSource,
                          onSubDragStart,
                          () => removeSubField(index, subIdx),
                          (newLabel) => {
                            const newFieldsCopy = [...fields];
                            const parentField = newFieldsCopy[index];
                            const subFields = [...(parentField.config.repeater?.fields || [])];
                            subFields[subIdx] = { ...subFields[subIdx], label: newLabel };
                            // Always generate name from label
                            subFields[subIdx].name = newLabel
                              .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                              .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '');
                            newFieldsCopy[index] = {
                              ...parentField,
                              config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
                            };
                            setFields(newFieldsCopy);
                          },
                          (newName) => {
                            const newFieldsCopy = [...fields];
                            const parentField = newFieldsCopy[index];
                            const subFields = [...(parentField.config.repeater?.fields || [])];
                            subFields[subIdx] = { ...subFields[subIdx], name: newName };
                            newFieldsCopy[index] = {
                              ...parentField,
                              config: { ...parentField.config, repeater: { ...parentField.config.repeater, fields: subFields } }
                            };
                            setFields(newFieldsCopy);
                          }
                        );
                      })}
                    </div>

                    {/* Drop zone for repeater */}
                    <div
                      onClick={() => {
                        if (!dragSource) {
                          addSubFieldToRepeater(index);
                        }
                      }}
                      onDragOver={(e) => onDragOverRepeaterDropZone(e, index)}
                      onDrop={(e) => onDropInRepeater(e, index)}
                      className={`w-full py-3 border-2 border-dashed rounded flex items-center justify-center gap-2 text-xs transition-all cursor-pointer ${
                        isDragOverRepeater(index)
                          ? 'border-action bg-action-light/30 text-action'
                          : 'border-border-default text-text-muted hover:border-action hover:text-action'
                      }`}
                    >
                      <Plus size={12} />
                      {isDragOverRepeater(index) ? 'Soltar aqui para adicionar como sub-campo' : 'Arraste ou clique para adicionar sub-campo'}
                    </div>

                    {/* Layout selector */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] text-text-muted">Layout:</span>
                      <button
                        onClick={() => updateConfig(index, 'repeater.layout', 'block')}
                        className={`px-2 py-0.5 rounded text-[10px] ${field.config.repeater?.layout === 'block' || !field.config.repeater?.layout ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                      >Bloco</button>
                      <button
                        onClick={() => updateConfig(index, 'repeater.layout', 'table')}
                        className={`px-2 py-0.5 rounded text-[10px] ${field.config.repeater?.layout === 'table' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                      >Tabela</button>
                      <button
                        onClick={() => updateConfig(index, 'repeater.layout', 'row')}
                        className={`px-2 py-0.5 rounded text-[10px] ${field.config.repeater?.layout === 'row' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                      >Linha</button>
                    </div>
                  </div>
                )}

                {/* Flexible Content */}
                {field.type === 'flexible_content' && (
                  <div className="space-y-4 p-4 border-t border-border-default">
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

                        {/* Layout sub-fields */}
                        <div className="space-y-2">
                          {(layout.fields || []).map((sub: any, subIdx: number) => {
                            const subSource: DragSource = { type: 'flexible_layout', fieldIndex: subIdx, parentFieldIndex: index, layoutIndex: lIdx };
                            return renderSubField(
                              sub,
                              subIdx,
                              subSource,
                              onSubDragStart,
                              () => removeFlexLayoutSubField(index, lIdx, subIdx),
                              (newLabel) => {
                                const newFieldsCopy = [...fields];
                                const parentField = newFieldsCopy[index];
                                const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
                                const layoutFields = [...(layouts[lIdx].fields || [])];
                                layoutFields[subIdx] = { ...layoutFields[subIdx], label: newLabel };
                                // Always generate name from label
                                layoutFields[subIdx].name = newLabel
                                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                                  .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '');
                                layouts[lIdx] = { ...layouts[lIdx], fields: layoutFields };
                                newFieldsCopy[index] = {
                                  ...parentField,
                                  config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
                                };
                                setFields(newFieldsCopy);
                              },
                              (newName) => {
                                const newFieldsCopy = [...fields];
                                const parentField = newFieldsCopy[index];
                                const layouts = [...(parentField.config.flexibleContent?.layouts || [])];
                                const layoutFields = [...(layouts[lIdx].fields || [])];
                                layoutFields[subIdx] = { ...layoutFields[subIdx], name: newName };
                                layouts[lIdx] = { ...layouts[lIdx], fields: layoutFields };
                                newFieldsCopy[index] = {
                                  ...parentField,
                                  config: { ...parentField.config, flexibleContent: { ...parentField.config.flexibleContent, layouts } }
                                };
                                setFields(newFieldsCopy);
                              }
                            );
                          })}
                        </div>

                        {/* Drop zone for flexible layout */}
                        <div
                          onClick={() => {
                            if (!dragSource) {
                              addSubFieldToFlexLayout(index, lIdx);
                            }
                          }}
                          onDragOver={(e) => onDragOverFlexibleLayoutDropZone(e, index, lIdx)}
                          onDrop={(e) => onDropInFlexibleLayout(e, index, lIdx)}
                          className={`w-full py-2 border-2 border-dashed rounded flex items-center justify-center gap-2 text-[10px] transition-all cursor-pointer ${
                            isDragOverFlexibleLayout(index, lIdx)
                              ? 'border-action bg-action-light/30 text-action'
                              : 'border-border-default text-text-muted hover:border-action hover:text-action'
                          }`}
                        >
                          <Plus size={10} />
                          {isDragOverFlexibleLayout(index, lIdx) ? 'Soltar aqui' : 'Arraste ou clique para adicionar sub-campo'}
                        </div>

                        {/* Layout selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted">Layout:</span>
                          <button
                            onClick={() => {
                              const layouts = [...(field.config.flexibleContent?.layouts || [])];
                              layouts[lIdx] = { ...layouts[lIdx], layout: 'block' };
                              updateConfig(index, 'flexibleContent.layouts', layouts);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] ${layout.layout === 'block' || !layout.layout ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                          >Bloco</button>
                          <button
                            onClick={() => {
                              const layouts = [...(field.config.flexibleContent?.layouts || [])];
                              layouts[lIdx] = { ...layouts[lIdx], layout: 'table' };
                              updateConfig(index, 'flexibleContent.layouts', layouts);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] ${layout.layout === 'table' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                          >Tabela</button>
                          <button
                            onClick={() => {
                              const layouts = [...(field.config.flexibleContent?.layouts || [])];
                              layouts[lIdx] = { ...layouts[lIdx], layout: 'row' };
                              updateConfig(index, 'flexibleContent.layouts', layouts);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] ${layout.layout === 'row' ? 'bg-action text-white' : 'text-text-muted hover:text-text-heading'}`}
                          >Linha</button>
                        </div>
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
            );
          })}
        </div>

        {/* Drop zone for sub-fields to become root fields + Add new field */}
        <div
          onClick={() => {
            if (!dragSource) {
              addField();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragSource && (dragSource.type === 'repeater' || dragSource.type === 'flexible_layout')) {
              setDropTarget({ type: 'root', fieldIndex: fields.length, position: 'after' });
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragSource && (dragSource.type === 'repeater' || dragSource.type === 'flexible_layout')) {
              onDropRoot(e, fields.length);
            }
          }}
          className={`w-full py-4 border-2 border-dashed rounded flex items-center justify-center gap-2 text-sm transition-all cursor-pointer ${
            dropTarget?.type === 'root' && dropTarget.fieldIndex === fields.length
              ? 'border-action bg-action-light/30 text-action'
              : dragSource && (dragSource.type === 'repeater' || dragSource.type === 'flexible_layout')
                ? 'border-action/50 text-action/70 hover:border-action hover:text-action'
                : 'border-border-default text-text-muted hover:border-action hover:text-action'
          }`}
        >
          <Plus size={14} />
          {dropTarget?.type === 'root' && dropTarget.fieldIndex === fields.length
            ? 'Soltar aqui para tornar campo-raiz'
            : dragSource && (dragSource.type === 'repeater' || dragSource.type === 'flexible_layout')
              ? 'Arraste aqui para tornar campo-raiz'
              : 'Novo Campo'}
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
