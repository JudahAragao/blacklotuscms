import React from 'react';
import { prisma } from '@/lib/prisma';
import { FieldService } from '@/core/services/FieldService';
import FieldGroupManager from './FieldGroupManager';
import { Trash2, Settings2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { deleteFieldGroupAction } from './actions';

import { PostTypeService } from '@/core/services/PostTypeService';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EditFieldsPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const postType = await prisma.postType.findUnique({
    where: { id },
  });

  if (!postType) return <div>Post Type não encontrado.</div>;

  const fieldGroups = await FieldService.listByLocation('post_type', id);

  async function updatePostTypeAction(formData: FormData) {
    'use server';
    const data = {
      label: formData.get('label') as string,
      hierarchical: formData.get('hierarchical') === 'true',
      supportsTitle: formData.get('supportsTitle') === 'on',
      supportsEditor: formData.get('supportsEditor') === 'on',
      supportsPermalink: formData.get('supportsPermalink') === 'on',
      supportsTaxonomies: formData.get('supportsTaxonomies') === 'on',
    };

    const session = await getServerSession(authOptions);
    await PostTypeService.update(postType!.slug, data, session?.user);
    revalidatePath(`/admin/settings/post-types/${id}/fields`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/post-types" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Tipo: {postType.label}</h1>
          <p className="text-sm text-text-muted mt-1">Configurar campos personalizados</p>
        </div>
      </div>

      <FieldGroupManager
        postTypeId={id}
        postType={postType as any}
        initialFieldGroups={fieldGroups as any}
      />
    </div>
  );
}
