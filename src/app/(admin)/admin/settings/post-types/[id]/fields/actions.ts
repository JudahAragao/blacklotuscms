'use server';

import { fieldService } from '@/core/services/FieldService';
import { postTypeService } from '@/core/services/PostTypeService';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';

export async function saveFieldsAction(postTypeId: string, data: { systemFields: any, customFields: any[] }) {
  try {
    const session = await getServerSession(authOptions);
    const postType = await prisma.postType.findUnique({ where: { id: postTypeId } });
    if (!postType) throw new Error("Post Type not found");

    // 1. Atualizar Post Type (Configurações do Sistema)
    await postTypeService.update(postType.slug, {
      label: data.systemFields.label,
      hierarchical: data.systemFields.hierarchical,
      supportsTitle: data.systemFields.supportsTitle,
      supportsEditor: data.systemFields.supportsEditor,
      supportsPermalink: data.systemFields.supportsPermalink,
      supportsTaxonomies: data.systemFields.supportsTaxonomies,
      settings: data.systemFields.settings || {}
    }, session?.user);

    // 2. Sincronizar Campos Customizados
    await fieldService.syncFields(postTypeId, data.customFields, session?.user);

    revalidatePath(`/admin/settings/post-types/${postTypeId}/fields`);
    revalidatePath('/admin/settings/post-types');
    revalidatePath('/admin'); // Revalida sidebar
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function createFieldGroupAction(postTypeId: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    const fields = data.fields.map((f: any) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      config: f.config || {},
    }));

    await fieldService.createFieldGroup({
      title: data.title,
      postTypeId,
      locationRules: {},
      fields
    }, session?.user);

    revalidatePath(`/admin/settings/post-types/${postTypeId}/fields`);
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deleteFieldGroupAction(id: string, postTypeId: string) {
  try {
    const session = await getServerSession(authOptions);
    await fieldService.deleteFieldGroup(id, session?.user);
    revalidatePath(`/admin/settings/post-types/${postTypeId}/fields`);
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
