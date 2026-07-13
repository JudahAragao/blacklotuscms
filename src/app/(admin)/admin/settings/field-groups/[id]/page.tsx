import React from 'react';
import { fieldService } from '@/core/services/FieldService';
import { prisma } from '@/lib/prisma';
import FieldGroupEditor from './FieldGroupEditor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

export default async function EditFieldGroupPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const [fieldGroup, postTypes, taxonomies] = await Promise.all([
    fieldService.findById(id),
    prisma.postType.findMany({ select: { id: true, slug: true, label: true } }),
    prisma.taxonomy.findMany({ select: { id: true, slug: true, label: true } }),
  ]);

  if (!fieldGroup) notFound();

  return (
    <FieldGroupEditor
      fieldGroup={fieldGroup as any}
      postTypes={postTypes}
      taxonomies={taxonomies}
    />
  );
}
