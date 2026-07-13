import React from 'react';
import { fieldService } from '@/core/services/FieldService';
import { prisma } from '@/lib/prisma';
import FieldGroupsList from './FieldGroupsList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function FieldGroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const [fieldGroups, postTypes, taxonomies] = await Promise.all([
    fieldService.listAll(),
    prisma.postType.findMany({ select: { id: true, slug: true, label: true } }),
    prisma.taxonomy.findMany({ select: { id: true, slug: true, label: true } }),
  ]);

  return (
    <FieldGroupsList
      initialFieldGroups={fieldGroups as any}
      postTypes={postTypes}
      taxonomies={taxonomies}
    />
  );
}
