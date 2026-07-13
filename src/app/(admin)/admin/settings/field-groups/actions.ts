'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fieldService } from '@/core/services/FieldService';
import { revalidatePath } from 'next/cache';

export async function listFieldGroupsAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const groups = await fieldService.listAll();
    return { success: true, data: groups };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getFieldGroupAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const group = await fieldService.findById(id);
    if (!group) return { error: 'Field group not found' };
    return { success: true, data: group };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createFieldGroupAction(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const group = await fieldService.createFieldGroup(data, session.user);
    revalidatePath('/admin/settings/field-groups');
    return { success: true, data: group };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateFieldGroupAction(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const group = await fieldService.updateFieldGroup(id, data, session.user);
    revalidatePath('/admin/settings/field-groups');
    revalidatePath(`/admin/settings/field-groups/${id}`);
    return { success: true, data: group };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function syncFieldsAction(fieldGroupId: string, fieldData: any[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    const group = await fieldService.syncFields(fieldGroupId, fieldData, session.user);
    revalidatePath('/admin/settings/field-groups');
    revalidatePath(`/admin/settings/field-groups/${fieldGroupId}`);
    return { success: true, data: group };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteFieldGroupAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Unauthorized' };

  try {
    await fieldService.deleteFieldGroup(id, session.user);
    revalidatePath('/admin/settings/field-groups');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
