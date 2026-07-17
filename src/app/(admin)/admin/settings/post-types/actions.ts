'use server';

import { postTypeService } from '@/core/services/PostTypeService';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';

export async function createPostTypeAction(data: any) {
  try {
    const session = await getServerSession(authOptions);
    await postTypeService.create({
      slug: data.slug,
      label: data.label,
      hierarchical: data.hierarchical === 'true',
      showInRest: true,
      showInGraphql: true,
      supportsTitle: data.supportsTitle,
      supportsEditor: data.supportsEditor,
      supportsPermalink: data.supportsPermalink,
      supportsTaxonomies: data.supportsTaxonomies,
    }, session?.user);
    revalidatePath('/admin/settings/post-types');
    revalidatePath('/admin'); // Revalida sidebar
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function updatePostTypeAction(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    
    const existingPostType = await prisma.postType.findUnique({
      where: { id }
    });

    if (!existingPostType) {
      return { success: false, error: 'Post type nao encontrado' };
    }

    const currentSettings = (existingPostType.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      icon: data.icon || currentSettings.icon,
    };

    await prisma.postType.update({
      where: { id },
      data: {
        label: data.label || existingPostType.label,
        settings: updatedSettings,
      }
    });

    revalidatePath('/admin/settings/post-types');
    revalidatePath('/admin/settings/post-types/[id]');
    revalidatePath('/admin'); // Revalida sidebar
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deletePostTypeAction(slug: string) {
  try {
    const session = await getServerSession(authOptions);
    await postTypeService.delete(slug, session?.user);
    revalidatePath('/admin/settings/post-types');
    revalidatePath('/admin'); // Revalida sidebar
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
