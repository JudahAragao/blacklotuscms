import React from 'react';
import { prisma } from '@/lib/prisma';
import PostEditor from '@/components/admin/PostEditor';
import { redirect } from 'next/navigation';
import { PostService } from '@/core/services/PostService';
import { FieldService } from '@/core/services/FieldService';
import { SettingService } from '@/core/services/SettingService';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';

export default async function NewPostPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ type?: string }> 
}) {
  const { type } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const postTypeSlug = type || 'post';

  const postType = await prisma.postType.findUnique({
    where: { slug: postTypeSlug },
    include: {
      taxonomies: {
        include: {
          terms: true
        }
      }
    }
  });

  if (!postType) {
    redirect('/admin/posts');
  }

  // Verifica se o usuário pode criar posts
  if (!hasCapability((session.user as any).role, 'post.create')) {
    return <div className="p-20 text-center label-caps text-error">No permission to create content</div>;
  }

  // Buscar fieldGroups via evaluateLocations
  const fieldGroups = await FieldService.evaluateLocations({
    postTypeId: postType.id,
    postSlug: undefined,
    postStatus: 'draft',
  });

  // Objeto de post "vazio" para o editor
  const emptyPost = {
    id: 'new',
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    postTypeId: postType?.id || '',
    postType: postType!,
    authorId: (session.user as any).id,
    metaValues: [],
    terms: [],
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    noIndex: false
  };

  // Server Action para salvar o post
  async function savePostAction(data: any) {
    'use server';
    const actionSession = await getServerSession(authOptions);
    if (!actionSession) throw new Error('Sessão expirada');

    try {
      const newPost = await PostService.create({
        ...data,
        postTypeId: postType?.id || '',
        authorId: (actionSession.user as any).id
      }, actionSession.user);
      
      revalidatePath('/admin/posts');
      return { success: true, redirect: `/admin/posts/${newPost.id}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  const userCapabilities = {
    canPublish: hasCapability((session.user as any).role, 'post.publish')
  };

  const settings = await SettingService.getAll();
  const siteUrl = (settings.site_url as string) || 'https://seusite.com.br';

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-heading">Novo {postType?.label}</h1>
        <p className="text-sm text-text-muted mt-1">Criar um novo conteudo</p>
      </div>

      <PostEditor
        post={JSON.parse(JSON.stringify(emptyPost))}
        fieldGroups={JSON.parse(JSON.stringify(fieldGroups))}
        onSave={savePostAction}
        capabilities={userCapabilities}
        siteUrl={siteUrl}
      />
    </div>
  );
}
