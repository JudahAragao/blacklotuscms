'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';

export async function createTermAction(taxonomyId: string, data: { name: string; slug: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('Sessao expirada');

    const existingTerm = await prisma.term.findFirst({
      where: {
        taxonomyId,
        slug: data.slug,
      }
    });

    if (existingTerm) {
      return { error: 'Ja existe um termo com este slug nesta taxonomia' };
    }

    await prisma.term.create({
      data: {
        taxonomyId,
        name: data.name,
        slug: data.slug,
      }
    });

    revalidatePath('/admin/taxonomies');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function updateTermAction(termId: string, taxonomyId: string, data: { name: string; slug: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('Sessao expirada');

    const existingTerm = await prisma.term.findFirst({
      where: {
        taxonomyId,
        slug: data.slug,
        NOT: { id: termId }
      }
    });

    if (existingTerm) {
      return { error: 'Ja existe um termo com este slug nesta taxonomia' };
    }

    await prisma.term.update({
      where: { id: termId },
      data: {
        name: data.name,
        slug: data.slug,
      }
    });

    revalidatePath('/admin/taxonomies');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function deleteTermAction(termId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('Sessao expirada');

    await prisma.term.delete({
      where: { id: termId }
    });

    revalidatePath('/admin/taxonomies');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return handleApiError(error);
  }
}
