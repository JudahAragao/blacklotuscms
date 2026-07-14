'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Settings, Layers, ChevronLeft, GripVertical, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createFieldGroupAction, deleteFieldGroupAction, searchPostsAction } from './actions';

interface FieldGroupsListProps {
  initialFieldGroups: any[];
  postTypes: { id: string; slug: string; label: string }[];
  taxonomies: { id: string; slug: string; label: string }[];
}

export default function FieldGroupsList({ initialFieldGroups, postTypes, taxonomies }: FieldGroupsListProps) {
  const router = useRouter();
  const [fieldGroups, setFieldGroups] = useState(initialFieldGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocations, setNewLocations] = useState<{ type: string; value: string; param?: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postSearchResults, setPostSearchResults] = useState<any[]>([]);
  const [postSearchLoading, setPostSearchLoading] = useState(false);
  const [activePostSearchIdx, setActivePostSearchIdx] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    searchPostsAction('').then(result => {
      if ('success' in result && result.success) {
        setPosts(result.data);
      }
    });
  }, []);

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

  const addLocation = () => {
    setNewLocations([...newLocations, { type: 'post_type', value: '' }]);
  };

  const updateLocation = (index: number, key: string, value: string) => {
    const updated = [...newLocations];
    updated[index] = { ...updated[index], [key]: value };
    setNewLocations(updated);
  };

  const removeLocation = (index: number) => {
    setNewLocations(newLocations.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (newLocations.length === 0 || newLocations.some(l => !l.value)) {
      toast.error('Pelo menos uma localização válida é obrigatória');
      return;
    }

    setIsCreating(true);
    const result = await createFieldGroupAction({
      title: newTitle,
      locations: newLocations,
      fields: [],
    });
    setIsCreating(false);

    if ('success' in result && result.success) {
      toast.success('Grupo de campos criado!');
      setFieldGroups([...fieldGroups, result.data]);
      setShowCreate(false);
      setNewTitle('');
      setNewLocations([]);
    } else {
      toast.error('Erro ao criar: ' + ('error' in result ? result.error : 'Desconhecido'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo de campos?')) return;

    const result = await deleteFieldGroupAction(id);
    if ('success' in result && result.success) {
      toast.success('Grupo excluído!');
      setFieldGroups(fieldGroups.filter(g => g.id !== id));
    } else {
      toast.error('Erro ao excluir: ' + ('error' in result ? result.error : 'Desconhecido'));
    }
  };

  const getLocationLabel = (loc: any) => {
    switch (loc.locationType) {
      case 'post_type':
        const pt = postTypes.find(p => p.id === loc.locationValue || p.slug === loc.locationValue);
        return `Tipo: ${pt?.label || loc.locationValue}`;
      case 'taxonomy':
        const tax = taxonomies.find(t => t.id === loc.locationValue || t.slug === loc.locationValue);
        return `Taxonomia: ${tax?.label || loc.locationValue}${loc.locationParam ? ` (${loc.locationParam})` : ''}`;
      case 'post':
        const post = posts.find(p => p.id === loc.locationValue);
        return `Post: ${post ? `${post.title} - ${post.slug}` : loc.locationValue}`;
      case 'template':
        return `Template: ${loc.locationValue}`;
      case 'post_status':
        return `Status: ${loc.locationValue}`;
      default:
        return loc.locationType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-text-heading">Campos Customizados</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar grupos de campos personalizados</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-action flex items-center gap-2">
          <Plus size={14} /> Novo Grupo
        </button>
      </div>

      {/* Formulário de criação */}
      {showCreate && (
        <div className="content-card p-6 space-y-4">
          <h3 className="font-semibold text-sm text-text-heading">Criar Novo Grupo</h3>
          
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Título do Grupo</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="field-input"
              placeholder="Ex: Dados do Produto"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label-field-muted">Localizações (onde aparece)</label>
              <button onClick={addLocation} className="text-xs text-action hover:text-action/80">+ Adicionar</button>
            </div>
            
            {newLocations.map((loc, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={loc.type}
                  onChange={(e) => updateLocation(idx, 'type', e.target.value)}
                  className="field-select text-xs w-40"
                >
                  <option value="post_type">Tipo de Post</option>
                  <option value="taxonomy">Taxonomia</option>
                  <option value="post">Post Específico</option>
                  <option value="template">Template</option>
                  <option value="post_status">Status</option>
                </select>

                {loc.type === 'post_type' && (
                  <select
                    value={loc.value}
                    onChange={(e) => updateLocation(idx, 'value', e.target.value)}
                    className="field-select text-xs flex-1"
                  >
                    <option value="">Selecione...</option>
                    {postTypes.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.label} ({pt.slug})</option>
                    ))}
                  </select>
                )}

                {loc.type === 'taxonomy' && (
                  <>
                    <select
                      value={loc.value}
                      onChange={(e) => updateLocation(idx, 'value', e.target.value)}
                      className="field-select text-xs flex-1"
                    >
                      <option value="">Selecione...</option>
                      {taxonomies.map(t => (
                        <option key={t.id} value={t.id}>{t.label} ({t.slug})</option>
                      ))}
                    </select>
                    <input
                      value={loc.param || ''}
                      onChange={(e) => updateLocation(idx, 'param', e.target.value)}
                      className="field-input text-xs flex-1"
                      placeholder="Term específico (opcional)"
                    />
                  </>
                )}

                {loc.type === 'post' && (
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          value={activePostSearchIdx === idx ? postSearchQuery : (loc.value ? posts.find((p: any) => p.id === loc.value)?.title || '' : '')}
                          onChange={(e) => {
                            setPostSearchQuery(e.target.value);
                            setActivePostSearchIdx(idx);
                          }}
                          onFocus={() => {
                            setActivePostSearchIdx(idx);
                            if (loc.value) {
                              const post = posts.find((p: any) => p.id === loc.value);
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
                        onClick={() => updateLocation(idx, 'value', '')}
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
                              updateLocation(idx, 'value', post.id);
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

                {loc.type === 'template' && (
                  <input
                    value={loc.value}
                    onChange={(e) => updateLocation(idx, 'value', e.target.value)}
                    className="field-input text-xs flex-1"
                    placeholder="Nome do template"
                  />
                )}

                {loc.type === 'post_status' && (
                  <select
                    value={loc.value}
                    onChange={(e) => updateLocation(idx, 'value', e.target.value)}
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

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-heading">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={isCreating} className="btn-action">
              {isCreating ? 'Criando...' : 'Criar Grupo'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de grupos */}
      <div className="space-y-3">
        {fieldGroups.length === 0 && (
          <div className="content-card p-6 text-center text-text-muted">
            Nenhum grupo de campos criado. Clique em "Novo Grupo" para começar.
          </div>
        )}

        {fieldGroups.map((group) => (
          <div key={group.id} className="content-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-surface-muted">
              <div className="cursor-grab text-text-muted hover:text-action">
                <GripVertical size={14} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-text-heading">{group.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {group.locations?.map((loc: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-action/10 text-action border border-action/20">
                      {getLocationLabel(loc)}
                    </span>
                  ))}
                  {group.fields?.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-muted text-text-muted border border-border-default">
                      {group.fields.length} campo(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/settings/field-groups/${group.id}`}
                  className="p-1.5 rounded text-text-muted hover:text-action hover:bg-action-light transition-colors"
                >
                  <Settings size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="p-1.5 text-text-muted hover:text-status-trash transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
