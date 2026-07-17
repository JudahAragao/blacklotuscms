import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PostTypeIconEditor from './PostTypeIconEditor';
import { updatePostTypeAction } from '../actions';

export default async function EditPostTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const postType = await prisma.postType.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } }
  });

  if (!postType) notFound();

  const settings = (postType.settings as any) || {};

  async function handleUpdate(formData: FormData) {
    'use server';
    const iconData = JSON.parse(formData.get('icon') as string || '{}');
    await updatePostTypeAction(id, {
      label: formData.get('label') as string,
      icon: iconData,
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings/post-types"
          className="p-2 content-card text-text-muted hover:text-action transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Editar {postType.label}</h1>
          <p className="text-sm text-text-muted mt-1">Configurar tipo de conteudo</p>
        </div>
      </div>

      <form action={handleUpdate} className="content-card p-6 space-y-6">
        <section className="space-y-4">
          <h3 className="font-semibold text-sm text-text-heading">Configuracoes Gerais</h3>
          
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Nome Exibido</label>
            <input 
              name="label" 
              defaultValue={postType.label} 
              className="field-input" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="label-field-muted">Slug</span>
            <div className="field-input bg-surface-muted opacity-60 cursor-not-allowed">
              /{postType.slug}
            </div>
            <p className="text-xs text-text-muted">O slug nao pode ser alterado apos a criacao.</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>{postType._count.posts} conteudos</span>
            <span className="text-border-default">|</span>
            <span>{postType.hierarchical ? 'Hierarquica' : 'Linear'}</span>
          </div>
        </section>

        <section className="pt-5 border-t border-border-default space-y-4">
          <h3 className="font-semibold text-sm text-text-heading">Icone do Sidebar</h3>
          <p className="text-xs text-text-muted">Selecione um icone para representar este tipo de conteudo na barra lateral do admin.</p>
          
          <PostTypeIconEditor 
            name="icon"
            defaultValue={settings.icon || null}
          />
        </section>

        <div className="pt-4 border-t border-border-default">
          <button type="submit" className="btn-action">
            Salvar Alteracoes
          </button>
        </div>
      </form>
    </div>
  );
}
