import React from 'react';
import { prisma } from '@/lib/prisma';
import { SettingService } from '@/core/services/SettingService';
import { revalidatePath } from 'next/cache';
import { ChevronLeft } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import Link from 'next/link';
import ReadingSettingsForm from './ReadingSettingsForm';

export default async function ReadingSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!hasCapability(userRole, 'setting.manage')) {
    return <div className="p-20 text-center label-caps text-error">Acesso Negado.</div>;
  }

  const settings = await SettingService.getAll();
  const readingSettings = settings.reading || {
    show_on_front: 'posts', // 'posts' or 'page'
    page_on_front: '',      // ID of the static page
    page_for_posts: '',     // ID of the posts page
  };

  // Fetch all published posts to populate the selects
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { id: true, title: true, slug: true },
    orderBy: { title: 'asc' }
  });

  async function updateReading(formData: FormData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!hasCapability((session?.user as any)?.role, 'setting.manage')) {
      throw new Error("Não autorizado");
    }

    const data = {
      show_on_front: formData.get('show_on_front'),
      page_on_front: formData.get('page_on_front'),
      page_for_posts: formData.get('page_for_posts'),
    };

    await SettingService.set('reading', data);
    revalidatePath('/admin/settings/reading');
    revalidatePath('/');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Configuracoes de Leitura</h1>
          <p className="text-sm text-text-muted mt-1">Configurar exibicao da pagina inicial</p>
        </div>
      </div>

      <ReadingSettingsForm
        initialSettings={readingSettings}
        posts={posts}
        updateReadingAction={updateReading}
      />
    </div>
  );
}
