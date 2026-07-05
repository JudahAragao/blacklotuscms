import React from 'react';
import { prisma } from '@/lib/prisma';
import { MediaService } from '@/core/services/MediaService';
import { revalidatePath } from 'next/cache';
import MediaUpload from '@/components/admin/MediaUpload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!hasCapability(userRole, 'media.read') && !hasCapability(userRole, 'media.manage')) {
    return <div className="p-10 text-center text-sm text-status-trash">Access denied</div>;
  }

  const canManage = hasCapability(userRole, 'media.manage');

  const mediaList = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  async function deleteMedia(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    const session = await getServerSession(authOptions);
    if (!hasCapability((session?.user as any)?.role, 'media.manage')) {
      throw new Error("Unauthorized");
    }

    try {
      await MediaService.delete(id);
      revalidatePath('/admin/media');
    } catch (error) {
      logger.error('Error deleting media:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Media Library</h1>
          <p className="text-sm text-text-muted mt-1">Manage files and images</p>
        </div>
      </div>

      {canManage ? (
        <MediaUpload />
      ) : (
        <div className="content-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">
            Modo visualizacao: voce nao tem permissao para gerenciar arquivos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mediaList.map((media) => (
          <div key={media.id} className="group relative content-card overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-square overflow-hidden bg-surface-muted">
              <img
                src={media.thumbnail || media.url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={media.name}
              />
            </div>
            <div className="p-2.5">
              <p className="text-xs text-text-muted truncate" title={media.name}>
                {media.name}
              </p>
            </div>

            {canManage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <form action={deleteMedia}>
                  <input type="hidden" name="id" value={media.id} />
                  <button className="bg-status-trash/90 text-white p-2 hover:bg-status-trash transition-colors rounded shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {mediaList.length === 0 && (
        <div className="text-center py-20 content-card border-dashed border-2 border-border-default">
          <p className="text-sm text-text-muted italic">Nenhum arquivo encontrado.</p>
        </div>
      )}
    </div>
  );
}
