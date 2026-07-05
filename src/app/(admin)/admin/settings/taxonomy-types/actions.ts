'use server';

import { taxonomyService } from '@/core/services/TaxonomyService';
import { CreateTaxonomyInput } from '@/schemas/taxonomy.schema';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';

export async function createTaxonomyAction(data: CreateTaxonomyInput) {
  try {
    const session = await getServerSession(authOptions);
    await taxonomyService.create(data, session?.user);
    revalidatePath('/admin/settings/taxonomy-types');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deleteTaxonomyAction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    await taxonomyService.delete(id, session?.user);
    revalidatePath('/admin/settings/taxonomy-types');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
