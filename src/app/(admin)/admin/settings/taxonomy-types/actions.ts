'use server';

import { taxonomyService } from '@/core/services/TaxonomyService';
import { prisma } from '@/lib/prisma';
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
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function updateTaxonomyAction(id: string, data: { label: string; slug: string; postTypeId: string }) {
  try {
    const session = await getServerSession(authOptions);
    
    const existingTaxonomy = await prisma.taxonomy.findUnique({
      where: { id }
    });

    if (!existingTaxonomy) {
      return { error: 'Taxonomia nao encontrada' };
    }

    // Check for slug conflict
    const slugConflict = await prisma.taxonomy.findFirst({
      where: {
        slug: data.slug,
        NOT: { id }
      }
    });

    if (slugConflict) {
      return { error: 'Ja existe uma taxonomia com este slug' };
    }

    await prisma.taxonomy.update({
      where: { id },
      data: {
        label: data.label,
        slug: data.slug,
        postTypeId: data.postTypeId,
      }
    });

    revalidatePath('/admin/settings/taxonomy-types');
    revalidatePath('/admin/taxonomies');
    revalidatePath('/admin');
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
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
