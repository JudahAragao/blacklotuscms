'use server';

import { postTypeService } from '@/core/services/PostTypeService';
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
