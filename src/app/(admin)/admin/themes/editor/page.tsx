'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from 'react-simple-code-editor';
import { Save, ChevronLeft, FileCode, Settings, Eye, Plus, Trash2 } from 'lucide-react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';
import Link from 'next/link';
import { toast } from 'sonner';
import { saveThemeSettingAction, getThemeSettingsAction } from './actions';

function EditorContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') || 'default';
  
  const [view, setView] = useState<'code' | 'settings'>('code');
  const [file, setFile] = useState('layouts/post.tsx');
  const [code, setCode] = useState('// Carregando seu código mestre...');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const loadFile = async (fileName: string) => {
    try {
      const res = await fetch(`/api/admin/themes/editor?theme=${theme}&file=${fileName}`);
      const data = await res.json();
      if (res.ok && data.content !== undefined) {
        setCode(data.content);
        setFile(fileName);
      } else {
        setCode(`// Erro ao carregar arquivo:\n// ${data.error || 'Desconhecido'}`);
        setFile(fileName);
      }
    } catch (e: any) {
      setCode(`// Exceção ao carregar arquivo:\n// ${e.message}`);
      setFile(fileName);
    }
  };

  const loadSettings = async () => {
    const data = await getThemeSettingsAction(theme);
    if (Array.isArray(data)) {
      setSettings(data);
    }
  };

  const saveFile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/themes/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, file, content: code }),
      });
      if (res.ok) {
        setLastSaved(new Date());
        toast.success('Arquivo salvo com sucesso!');
      } else {
        const data = await res.json();
        toast.error(`Erro ao salvar: ${data.error || 'Desconhecido'}`);
      }
    } catch (e: any) {
      toast.error(`Exceção ao salvar: ${e.message}`);
    } finally { 
      setSaving(false); 
    }
  };

  const addSetting = async () => {
    if (!newKey) return;
    setSaving(true);
    await saveThemeSettingAction(theme, newKey, newValue);
    await loadSettings();
    setNewKey('');
    setNewValue('');
    setSaving(false);
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    await saveThemeSettingAction(theme, key, value);
    await loadSettings();
    setSaving(false);
  };

  useEffect(() => { 
    if (view === 'code') loadFile(file);
    else loadSettings();
  }, [theme, view]);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/themes" className="w-9 h-9 rounded border border-border-default flex items-center justify-center text-text-muted hover:text-action hover:border-action transition-all">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-text-heading flex items-center gap-2">
              {theme.toUpperCase()}
              <span className="text-text-muted font-light">|</span>
              <span className="text-sm font-mono text-text-muted">{view === 'code' ? file : 'Settings'}</span>
            </h2>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {lastSaved && (
            <span className="text-xs text-text-muted italic">Salvo: {lastSaved.toLocaleTimeString('pt-BR')}</span>
          )}

          {view === 'code' && (
            <>
              <select
                value={file}
                onChange={(e) => loadFile(e.target.value)}
                className="field-select min-w-[200px] text-xs"
              >
                <optgroup label="Layouts">
                  <option value="layouts/post.tsx">Post</option>
                  <option value="layouts/page.tsx">Pagina</option>
                  <option value="layouts/archive.tsx">Arquivo</option>
                  <option value="layouts/search.tsx">Busca</option>
                </optgroup>
                <optgroup label="Config">
                  <option value="theme.json">theme.json</option>
                </optgroup>
              </select>

              <button onClick={saveFile} disabled={saving} className="btn-action flex items-center gap-2">
                {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        <div className="w-14 flex flex-col gap-3 h-full flex-shrink-0">
          <button
            onClick={() => setView('code')}
            className={`w-full aspect-square content-card flex items-center justify-center transition-all flex-shrink-0 ${view === 'code' ? 'text-action border-action/30 shadow-sm' : 'text-text-muted hover:text-action'}`}
          >
            <FileCode size={18} />
          </button>
          <button
            onClick={() => setView('settings')}
            className={`w-full aspect-square content-card flex items-center justify-center transition-all flex-shrink-0 ${view === 'settings' ? 'text-action border-action/30 shadow-sm' : 'text-text-muted hover:text-action'}`}
          >
            <Settings size={18} />
          </button>
          <div className="mt-auto pb-1">
            <button
              onClick={() => window.open(`/?preview_theme=${theme}`, '_blank')}
              className="w-full aspect-square content-card flex items-center justify-center text-text-muted hover:text-action transition-colors flex-shrink-0"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 content-card rounded overflow-hidden shadow relative flex flex-col h-full">
          {view === 'code' ? (
            <div className="flex-1 custom-scrollbar overflow-auto bg-[#0d0d0d]">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => highlight(code, languages.tsx, 'tsx')}
                padding={40}
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 13,
                  minHeight: '100%',
                  lineHeight: '1.6',
                }}
                className="outline-none text-slate-400"
              />
            </div>
          ) : (
            <div className="flex-1 p-8 custom-scrollbar overflow-auto space-y-8">
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-action mb-4">Variaveis do Tema</h3>
                  <div className="space-y-3">
                    {settings.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 bg-surface-muted p-3 border border-border-default rounded group">
                        <div className="flex-1">
                          <label className="label-field-muted block mb-1">{s.key}</label>
                          <input
                            type="text"
                            defaultValue={s.value}
                            onBlur={(e) => updateSetting(s.key, e.target.value)}
                            className="bg-transparent border-none outline-none text-text-heading font-mono text-sm w-full focus:text-action transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border-default">
                  <h4 className="text-xs text-text-muted mb-4 italic">Nova Variavel</h4>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="label-field-muted">Chave</label>
                      <input
                        type="text"
                        value={newKey}
                        onChange={(e) => { const s = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'); setNewKey(s); }}
                        placeholder="ex: primary-color"
                        className="field-input w-full"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="label-field-muted">Valor</label>
                      <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="#f2ca50" className="field-input w-full" />
                    </div>
                    <button onClick={addSetting} className="btn-action flex items-center gap-1.5">
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-7 bg-surface-muted border-t border-border-default px-4 flex items-center justify-between">
            <div className="flex gap-3">
              <span className="text-[10px] text-text-muted">UTF-8</span>
              <span className="text-[10px] text-text-muted">{view === 'code' ? 'TypeScript JSX' : 'Data Store'}</span>
            </div>
            <span className="text-[10px] text-action/50 font-mono">BLACKLOTUS v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeEditorPage() {
  return (
    <Suspense fallback={<div className="label-caps text-primary animate-pulse">Initializing Studio...</div>}>
      <EditorContent />
    </Suspense>
  );
}
