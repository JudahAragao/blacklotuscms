'use server';

import { taxonomyService } from '@/core/services/TaxonomyService';
import { CreateTermInput } from '@/schemas/taxonomy.schema';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';

export async function createTermAction(data: CreateTermInput) {
  try {
    const session = await getServerSession(authOptions);
    await taxonomyService.createTerm(data, session?.user);
    revalidatePath(`/admin/settings/taxonomy-types/${data.taxonomyId}/terms`);
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deleteTermAction(id: string, taxonomyId: string) {
  try {
    const session = await getServerSession(authOptions);
    await taxonomyService.deleteTerm(id, session?.user);
    revalidatePath(`/admin/settings/taxonomy-types/${taxonomyId}/terms`);
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
