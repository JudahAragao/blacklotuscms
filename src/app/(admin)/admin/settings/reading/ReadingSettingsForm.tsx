'use client';

import React, { useState } from 'react';
import { Save, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ReadingSettingsFormProps {
  initialSettings: any;
  posts: any[];
  updateReadingAction: (formData: FormData) => Promise<void>;
}

export default function ReadingSettingsForm({ initialSettings, posts, updateReadingAction }: ReadingSettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await updateReadingAction(formData);
      setSuccess(true);
      toast.success('Configurações salvas com sucesso!');
      router.refresh(); // Força a atualização dos dados do servidor na página
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-card p-6 space-y-6">
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Layout size={16} className="text-action" />
          <h3 className="font-semibold text-sm text-text-heading">Exibicao da Pagina Inicial</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="radio" id="show_posts" name="show_on_front" value="posts" defaultChecked={initialSettings.show_on_front === 'posts'} className="accent-action" />
            <label htmlFor="show_posts" className="text-sm text-text-heading cursor-pointer">Seus posts recentes</label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="radio" id="show_page" name="show_on_front" value="page" defaultChecked={initialSettings.show_on_front === 'page'} className="accent-action" />
              <label htmlFor="show_page" className="text-sm text-text-heading cursor-pointer">Uma pagina estatica</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Pagina Inicial</label>
                <select name="page_on_front" defaultValue={initialSettings.page_on_front} className="field-select">
                  <option value="">-- Selecione --</option>
                  {posts.map(post => (
                    <option key={post.id} value={post.id}>{post.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Pagina de Posts</label>
                <select name="page_for_posts" defaultValue={initialSettings.page_for_posts} className="field-select">
                  <option value="">-- Selecione --</option>
                  {posts.map(post => (
                    <option key={post.id} value={post.id}>{post.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-border-default">
        <div>
          {success && (
            <span className="text-status-published text-sm font-medium">Configuracoes salvas!</span>
          )}
        </div>
        <button type="submit" disabled={isSaving} className="btn-action flex items-center gap-2 disabled:opacity-50">
          {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
        </button>
      </div>
    </form>
  );
}
