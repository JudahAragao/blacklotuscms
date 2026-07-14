import React from 'react';
import { prisma } from '@/lib/prisma';
import PostEditor from '@/components/admin/PostEditor';
import { notFound, redirect } from 'next/navigation';
import { PostService } from '@/core/services/PostService';
import { FieldService } from '@/core/services/FieldService';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canPerformAction, hasCapability } from '@/lib/auth-utils';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      metaValues: true,
      terms: true,
      postType: {
        include: {
          taxonomies: {
            include: {
              terms: true
            }
          }
        }
      }
    }
  });

  if (!post) notFound();

  const userRole = (session.user as any).role;
  const postTypeSlug = post.postType.slug;

  // Verify READ permission
  const canRead = hasCapability(userRole, `${postTypeSlug}.read`) || 
                  hasCapability(userRole, `${postTypeSlug}.manage`);

  if (!canRead) {
    return <div className="p-20 text-center label-caps text-error">Access Denied: No permission to view this content</div>;
  }

  // Verify EDIT permission
  const canEdit = canPerformAction(session.user, `${postTypeSlug}.update`, post.authorId) || 
                  hasCapability(userRole, `${postTypeSlug}.manage`);

  // Buscar fieldGroups via evaluateLocations
  const fieldGroups = await FieldService.evaluateLocations({
    postTypeId: post.postTypeId,
    postId: post.id,
    postSlug: post.slug,
    postStatus: post.status,
  });

  // Server Action to save the post
  async function savePostAction(data: any) {
    'use server';
    const actionSession = await getServerSession(authOptions);
    if (!actionSession) throw new Error('Session expired');

    // Backend Validation in Action
    const user = actionSession.user as any;
    if (!canPerformAction(user, `${postTypeSlug}.update`, post?.authorId) && 
        !hasCapability(user.role, `${postTypeSlug}.manage`)) {
      throw new Error('Unauthorized to save');
    }

    try {
      await PostService.update(id, data, actionSession.user);
      revalidatePath(`/admin/posts/${id}`);
      revalidatePath(`/${post?.slug}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  const userCapabilities = {
    canPublish: hasCapability(userRole, `${postTypeSlug}.publish`) || 
                hasCapability(userRole, `${postTypeSlug}.manage`)
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">
            {canEdit ? 'Editar' : 'Visualizar'} {post.postType.label}
          </h1>
          <p className="text-xs font-mono text-text-muted mt-1">ID: {post.id}</p>
        </div>
        <div className="text-sm text-text-muted">
          Ultima atualizacao: {post.updatedAt.toLocaleString('pt-BR')}
        </div>
      </div>

      <PostEditor
        post={JSON.parse(JSON.stringify(post))}
        fieldGroups={JSON.parse(JSON.stringify(fieldGroups))}
        onSave={savePostAction}
        readOnly={!canEdit}
        capabilities={userCapabilities}
      />
    </div>
  );
}
