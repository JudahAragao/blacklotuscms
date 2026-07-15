'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { saveFieldsAction } from './actions';
import { toast } from 'sonner';

export default function FieldGroupManager({ postTypeId, postType, initialFieldGroups }: { postTypeId: string, postType: any, initialFieldGroups: any[] }) {
  const [fields, setFields] = useState<any[]>([]);
  const [postTypeLabel, setPostTypeLabel] = useState(postType.label);
  const [hierarchical, setHierarchical] = useState(postType.hierarchical);
  const [isSaving, setIsSaving] = useState(false);

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

  const updateFieldActive = (index: number, active: boolean) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], active };
    setFields(newFields);
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

      <div>
        <h4 className="font-semibold text-sm text-text-heading">Campos</h4>
        <p className="text-xs text-text-muted mt-0.5">Ative ou desative campos deste tipo de post</p>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const isOrganizer = field.type === 'tab' || field.type === 'section';
          return (
          <div
            key={field.id || index}
            className={`border rounded overflow-hidden transition-all ${
              field.isSystem ? 'border-action/20 bg-action-light/30' :
              isOrganizer ? 'border-action/30 bg-action-light/50' :
              'border-border-default'
            }`}
          >
            <div className={`flex items-center gap-3 p-3 ${
              field.isSystem ? 'bg-action-light/30' :
              isOrganizer ? 'bg-action-light/50' : 'bg-surface-muted'
            }`}>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex flex-col flex-1">
                  <input
                    value={field.label}
                    readOnly
                    className={`bg-transparent border-none outline-none font-medium text-sm ${field.active === false ? 'text-text-muted line-through' : 'text-text-heading'}`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono ${isOrganizer ? 'text-action' : 'text-action/60'}`}>{field.isSystem ? 'sistema' : field.type === 'tab' ? 'aba' : field.type === 'section' ? 'secao' : field.type}</span>
                    <span className="text-[10px] text-text-muted">|</span>
                    <span className="text-[10px] font-mono text-text-muted">{isOrganizer ? field.label : field.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFieldActive(index, field.active === false)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                    field.active !== false
                      ? 'bg-status-published/10 border-status-published/30 text-status-published'
                      : 'bg-surface-muted border-border-default text-text-muted'
                  }`}
                >
                  {field.active !== false ? 'Ativo' : 'Oculto'}
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-border-default">
        <button onClick={handleSave} disabled={isSaving} className="btn-action flex items-center gap-2">
          {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Configuracao</>}
        </button>
      </div>
    </div>
  );
}
