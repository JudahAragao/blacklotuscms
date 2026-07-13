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

    // 2. Encontrar ou criar FieldGroup para este PostType
    const existingGroups = await fieldService.listByLocation('post_type', postTypeId);
    let groupId: string;

    if (existingGroups.length > 0) {
      groupId = existingGroups[0].id;
    } else {
      // Criar novo grupo para este post type
      const group = await fieldService.createFieldGroup({
        title: `Campos: ${postType.label}`,
        locations: [{ type: 'post_type', value: postTypeId }],
        fields: []
      }, session?.user);
      groupId = group.id;
    }

    // 3. Sincronizar campos
    await fieldService.syncFields(groupId, data.customFields, session?.user);

    revalidatePath(`/admin/settings/post-types/${postTypeId}/fields`);
    revalidatePath('/admin/settings/post-types');
    revalidatePath('/admin/settings/field-groups');
    revalidatePath('/admin');
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
      locations: [{ type: 'post_type', value: postTypeId }],
      fields
    }, session?.user);

    revalidatePath(`/admin/settings/post-types/${postTypeId}/fields`);
    revalidatePath('/admin/settings/field-groups');
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
    revalidatePath('/admin/settings/field-groups');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
